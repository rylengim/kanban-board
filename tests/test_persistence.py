from fastapi.testclient import TestClient

from app.main import create_app


def test_create_update_and_delete_survive_app_recreation(tmp_path, monkeypatch):
    database_file = tmp_path / "persistent.sqlite"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_file}")
    monkeypatch.setenv("BOARDLET_STORE", "sqlalchemy")
    first_app = create_app()
    assert not database_file.exists(), "Importing/configuring an app must not open the database"
    with TestClient(first_app) as client:
        assert client.get("/api/tasks").json() == {"items": [], "total": 0}
        response = client.post("/api/tasks", json={"title": "Save through restart"})
        assert response.status_code == 201
        created = response.json()

    with TestClient(create_app()) as client:
        assert client.get(f"/api/tasks/{created['id']}").json() == created
        response = client.patch(
            f"/api/tasks/{created['id']}",
            json={"title": "Saved edit", "status": "done", "description": "Kept on disk"},
        )
        assert response.status_code == 200
        updated = response.json()

    with TestClient(create_app()) as client:
        assert client.get("/api/tasks").json() == {"items": [updated], "total": 1}
        assert client.delete(f"/api/tasks/{created['id']}").status_code == 204

    with TestClient(create_app()) as client:
        assert client.get("/api/tasks").json() == {"items": [], "total": 0}
        assert client.get(f"/api/tasks/{created['id']}").status_code == 404
    assert database_file.exists()


def test_memory_mode_is_empty_after_app_recreation(tmp_path, monkeypatch):
    database_file = tmp_path / "unused.sqlite"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_file}")
    monkeypatch.setenv("BOARDLET_STORE", "memory")
    with TestClient(create_app()) as client:
        assert client.post("/api/tasks", json={"title": "Temporary card"}).status_code == 201
    with TestClient(create_app()) as client:
        assert client.get("/api/tasks").json() == {"items": [], "total": 0}
    assert not database_file.exists()
