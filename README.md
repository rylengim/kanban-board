# Boardlet

A Mini Kanban board for AI Dev Tools Zoomcamp Homework 2.

Track tasks through **To do → In progress → Done** with a React frontend,
FastAPI backend, and SQLite persistence through SQLAlchemy.

The canonical product specification is in [_docs/specs.md](_docs/specs.md).
The app is developed with AI assistance; it has no runtime AI dependency and
requires no API key.

## Run locally

Prerequisites: Python 3.12+, [uv](https://docs.astral.sh/uv/getting-started/installation/),
Node.js 22.12+, and npm. Open two terminals from this project directory.

Backend:

```bash
cd backend
uv sync --locked
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend, in the other terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open [Boardlet](http://localhost:5173). The frontend calls
`http://localhost:8000/api/tasks` directly. Interactive backend documentation is
available at [Swagger UI](http://localhost:8000/docs), with a health check at
[/api/health](http://localhost:8000/api/health).

Add a task, choose its priority, and use its status control to move it across
the board. Edit opens the task form; deletion requires confirmation. Search
matches titles and descriptions, and the priority selector narrows the board.
Use Refresh to load changes made in another tab. The app starts with an empty
persistent board.

## Homework stages

The standalone frontend prototype remains available without a backend:

```bash
cd frontend
npm run dev:mock
```

Mock data is temporary and resets on reload. The default development command
uses the real backend. The memory-backed server checkpoint and final SQLite
version are preserved in Git history; see the
[AI usage report](docs/ai-usage-report.md) for the actual progression.

You can also run the final backend with its original memory store:

```bash
cd backend
BOARDLET_STORE=memory uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

This server mode loses data on restart. Stop the other backend before starting
it on the same port.

## Database and configuration

By default, SQLite data lives in `backend/boardlet.db`, resolved relative to the
backend code so changing the working directory does not create a different
board. The table is created on startup; records are never automatically seeded.
Keep that file to preserve your board. Local database files are Git-ignored.

To choose a different SQLite file, set an absolute SQLAlchemy URL:

```bash
cd backend
DATABASE_URL=sqlite:////absolute/path/to/boardlet.db uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The parent directory must exist. The backend uses portable SQLAlchemy queries
and a repository interface. Switching to PostgreSQL would also require its
driver and a reachable database; PostgreSQL has not been tested in this homework.
See [`backend/.env.example`](backend/.env.example) for reference. The backend
does **not** automatically read a `.env` file; export variables or set them on
the command as shown.

The frontend defaults to `http://localhost:8000`. To change that address, copy
[`frontend/.env.example`](frontend/.env.example) to `frontend/.env`, edit
`VITE_API_BASE_URL`, and restart Vite. These frontend variables are public;
never put credentials in them. Vite uses port 5173 strictly so a busy port
produces an error instead of silently changing the origin expected by CORS.

## Tests and build

Backend behavior, contract, and SQLite persistence checks:

```bash
cd backend
uv run pytest ../tests
uv run ruff check . ../tests
```

Frontend behavior and API adapter tests, followed by strict TypeScript checking
and a production build:

```bash
cd frontend
npm test
npm run build
```

Tests use isolated repositories/databases and do not erase local board data.
See [browser verification](docs/browser-checks.md) for the live app checks.

## Structure and design

- [`_docs/specs.md`](_docs/specs.md): user stories, constraints, and non-goals.
- [`openapi.yaml`](openapi.yaml): contract shared by frontend and backend.
- [`frontend/`](frontend/): React/TypeScript UI and central API adapters.
- [`backend/`](backend/): FastAPI with an injectable repository boundary.
- [`tests/`](tests/): API behavior, contract, and persistence checks.
- [`AGENTS.md`](AGENTS.md): contributor rules and verification commands.
- [`tasks/`](tasks/): implementation plan and checkpoints.
- [`docs/ai-usage-report.md`](docs/ai-usage-report.md): assistance and evidence.
- [`docs/homework-answers.md`](docs/homework-answers.md): seven submission answers.

The board uses three fixed statuses (`todo`, `in_progress`, `done`) and three
priorities (`low`, `medium`, `high`). Input titles are limited to 120 characters
before trimming; descriptions are limited to 2,000. The API lists at most 100
tasks per page and the frontend loads every page before filtering.

This is a trusted local demo with one shared board. Authentication, private
boards, real-time synchronization, and public deployment are outside its scope.
Concurrent edits to the same field use the last saved value. Do not deploy it
publicly with sensitive tasks without adding access controls.

## Submission

The initial specification commit for Question 3 is
`8a73b51d9cbbcd670272067faec92cc9e4250486`.
The user requested local preparation and will supply a GitHub repository later;
the push and course form submission are pending. See
[the prepared answers](docs/homework-answers.md) before submitting.
