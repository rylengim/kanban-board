"""Exercise the real HTTP API across process restarts without touching user data.

Run with `uv run --locked python ../scripts/test-http.py` from backend/.
Requires POSIX socket inheritance (Linux/macOS), matching the Bash check runner.
"""

import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener

BACKEND = Path(__file__).resolve().parents[1] / "backend"


class HTTPPersistenceTest(unittest.TestCase):
    def request(self, method: str, path: str, expected: int, payload: dict | None = None):
        request = Request(
            self.base_url + path,
            data=json.dumps(payload).encode() if payload is not None else None,
            headers={"Content-Type": "application/json"},
            method=method,
        )
        try:
            response = self.opener.open(request, timeout=2)
        except HTTPError as error:
            response = error
        with response:
            body = response.read()
            self.assertEqual(response.status, expected, f"{method} {path}: {body!r}")
            return json.loads(body) if body else None

    @contextmanager
    def server(self, listener: socket.socket, database: Path) -> Iterator[None]:
        # Keep the socket bound in the parent between starts: no free-port race.
        environment = {**os.environ, "BOARDLET_STORE": "sqlalchemy"}
        environment["DATABASE_URL"] = f"sqlite:///{database}"
        with tempfile.TemporaryFile(mode="w+") as log:
            process = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "app.main:app",
                    "--fd",
                    str(listener.fileno()),
                    "--workers",
                    "1",
                    "--no-access-log",
                    "--log-level",
                    "warning",
                ],
                cwd=BACKEND,
                env=environment,
                pass_fds=(listener.fileno(),),
                stdout=log,
                stderr=subprocess.STDOUT,
            )
            try:
                deadline = time.monotonic() + 15
                while time.monotonic() < deadline:
                    if process.poll() is not None:
                        log.seek(0)
                        self.fail(f"HTTP server exited during startup:\n{log.read()}")
                    try:
                        self.assertEqual(self.request("GET", "/api/health", 200), {"status": "ok"})
                        break
                    except (URLError, TimeoutError, ConnectionError):
                        time.sleep(0.05)
                else:
                    log.seek(0)
                    self.fail(f"HTTP server was not ready within 15 seconds:\n{log.read()}")
                yield
            finally:
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)

    def test_crud_and_restart_persistence(self):
        # Bypass environment proxy settings: all requests stay on this device.
        self.opener = build_opener(ProxyHandler({}))
        with tempfile.TemporaryDirectory(prefix="boardlet-http-") as directory:
            database = Path(directory) / "test.sqlite"
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
                listener.bind(("127.0.0.1", 0))
                self.base_url = f"http://127.0.0.1:{listener.getsockname()[1]}"
                with self.server(listener, database):
                    self.assertEqual(
                        self.request("GET", "/api/tasks", 200), {"items": [], "total": 0}
                    )
                    task = self.request(
                        "POST",
                        "/api/tasks",
                        201,
                        {
                            "title": "Synthetic HTTP check",
                            "priority": "high",
                        },
                    )
                    self.assertEqual(task["status"], "todo")
                    path = f"/api/tasks/{task['id']}"
                    self.assertEqual(self.request("GET", path, 200), task)
                    for status in ("in_progress", "done"):
                        saved = self.request("PATCH", path, 200, {"status": status})
                        self.assertEqual(saved["status"], status)
                    self.request("PATCH", path, 422, {"status": "invalid"})

                with self.server(listener, database):
                    self.assertEqual(self.request("GET", path, 200), saved)
                    self.assertEqual(
                        self.request("GET", "/api/tasks", 200),
                        {
                            "items": [saved],
                            "total": 1,
                        },
                    )
                    self.request("DELETE", path, 204)
                    self.request("GET", path, 404)

                with self.server(listener, database):
                    self.assertEqual(
                        self.request("GET", "/api/tasks", 200), {"items": [], "total": 0}
                    )


if __name__ == "__main__":
    unittest.main(verbosity=2)
