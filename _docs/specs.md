# Boardlet — Mini Kanban board

## Objective

A small, local web app for a person or small team to track work through To do,
In progress, and Done. Success means a user can create, edit, move, and delete a
card in the browser and see persisted changes after refreshing or restarting
the backend. The user selected Mini Kanban board for Zoomcamp Homework 2.

## Scope and user stories

1. As a user, I see one shared board split into three fixed columns.
2. I can add a card with a required title, optional description, priority, and
   initial status. Titles are trimmed and contain 1–120 characters;
   descriptions contain at most 2,000 characters. Priority is low, medium, or
   high, defaulting to medium. Status defaults to todo.
3. I can edit a card and move it to any column through keyboard-accessible
   controls. Dragging is optional; status controls must work on touch devices.
4. I can delete a card after confirming. Canceling preserves the card.
5. I can search titles/descriptions and filter by priority. Visible counts and
   empty states reflect the filters; clearing filters restores all cards.
6. Loading, saving, empty, validation, and server-error states are visible.
   A failed request never pretends to have saved my work; form input is retained.
7. I can refresh the board to see changes from another browser. Data survives
   page refresh and backend restart in SQLite mode.

## Non-goals

Authentication, accounts, private boards, multiple boards, due dates, assignees,
comments, attachments, real-time synchronization, manual card ordering,
containers, CI/CD, and public deployment. This is a trusted local demo.

## Architecture

- Frontend: React, TypeScript, and Vite. All network calls live in one API
  module. A matching in-memory adapter keeps the frontend prototype runnable.
- Backend: FastAPI, Python 3.12+, and uv. Pydantic validates request boundaries.
- Contract: root `openapi.yaml`, written before either implementation.
- Store: an injected repository interface, first memory then SQLAlchemy 2 with
  SQLite. Database configuration uses `DATABASE_URL`; vendor-specific SQL is
  excluded so another SQLAlchemy dialect can be introduced later.
- API: `/api/health`, `/api/tasks`, and `/api/tasks/{task_id}`. JSON field names
  use snake_case and status values are `todo`, `in_progress`, and `done`.
- List responses are paginated, ordered by creation time then ID. The frontend
  loads all pages before displaying the board, avoiding silent truncation.
- POST is not automatically retried; retrying an uncertain create may duplicate
  a task. Updates apply absolute field values; deletes return 404 if missing.
- No sample records are silently inserted into persistent user storage.

## Acceptance criteria and tests

- Backend endpoint tests run first against memory, then unchanged against
  SQLite: CRUD, status moves, pagination, input limits, invalid enums, unknown
  fields, empty updates, null rejection, and missing IDs.
- A file-backed SQLite test recreates the application and reads a saved card.
- Contract checks compare implemented operations and request/response schemas
  with `openapi.yaml`; API examples are validated against that contract.
- Frontend tests verify a user journey (create/edit/move/delete), filtering,
  validation, failed saves, and the central HTTP adapter.
- Type checking, production build, backend lint, and all tests must pass.
- Browser verification exercises the real frontend/backend connection,
  persistence after refresh, error display, and a narrow mobile viewport.
- Forms have visible labels, dialogs manage focus and Escape, state changes
  are announced, controls work with a keyboard, and text has readable contrast.
- No skipped tests, disabled type checking, or suppression comments to hide
  failures. Fix the cause or record the remaining limitation honestly.

## Project structure

```
_docs/specs.md          canonical product specification
product-spec.md        link to the canonical spec (module deliverable)
AGENTS.md              contributor instructions
openapi.yaml           API contract
frontend/              app, centralized API adapters, component tests
backend/               FastAPI, repositories, uv project and lockfile
tests/                 backend behavior and contract tests
tasks/                 implementation sequence and verified checkpoints
docs/ai-usage-report.md actual assistance, verification, and corrections
docs/homework-answers.md seven submission answers and evidence
```

## Intended commands

From `homework-02/frontend`: `npm ci`, `npm run dev`, `npm test`,
`npm run build`. The frontend runs at `http://localhost:5173` and talks to
`http://localhost:8000` by default. Prototype: `npm run dev:mock`.

From `homework-02/backend`: `uv sync --locked`,
`uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`,
`uv run pytest ../tests`, and `uv run ruff check . ../tests`.

## Code style and boundaries

Use TypeScript strict mode, named types, small components, Python type hints,
and explicit dependencies. Prefer direct readable code to generic frameworks:

```python
def list_tasks(self, *, limit: int, offset: int) -> TaskPage:
    ...
```

Always validate at the API boundary, preserve failed form input, and run the
relevant checks before a checkpoint. Ask for missing remote repository details
before publishing. Never commit credentials, local databases, caches, generated
build output, or unrelated Homework 1 files.

## Sources

- [2026 Homework 2](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/cohorts/2026/homework/02-development/homework.md)
- [Module 2](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/02-development/01-build-and-ship-an-ai-assisted-full-stack-app.md)
