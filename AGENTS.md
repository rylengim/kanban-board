# Boardlet contributor guide

Read `_docs/specs.md` and `openapi.yaml` before changing behavior.

- Keep this homework self-contained; do not modify the parent chores project.
- Keep all frontend backend calls in `frontend/src/api/`.
- Build the frontend prototype with mocked API calls before connecting it.
- Write endpoint tests before implementation. Run the same behavior tests
  against memory and SQLAlchemy repositories.
- Use SQLAlchemy expressions rather than SQLite-specific SQL.
- Never hide failed requests, discard failed form input, or silently seed the
  persistent database.
- Keep the contract, specification, README, and submission answers consistent.
- Use small checkpoints in Git; retain the initial spec commit for Question 3.
- Do not commit secrets, databases, caches, or generated frontend output.
- Backend checks from `backend/`: `uv run pytest ../tests` and
  `uv run ruff check . ../tests`.
- Frontend checks from `frontend/`: `npm test` and `npm run build`.
- Verify the actual browser UI after connecting both servers.
- Record actual AI assistance and test evidence in `docs/ai-usage-report.md`.
- Local development is in scope. Remote publication requires a known user
  repository; do not invent one or submit the course form for the user.
