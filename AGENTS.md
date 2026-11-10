# Boardlet contributor guide

Read `_docs/specs.md` and `openapi.yaml` before changing behavior.

## Final-project delivery

The user selected Boardlet for the final project on 10 November 2026. Read
`docs/final-project-spec.md` for the current delivery scope; it adds containers
and CI to the completed homework without expanding the Kanban product behavior.

- Use `tasks/todo.md` IDs F1–F6 as the task tracker; keep acceptance criteria,
  owner, dependencies, and actual verification aligned with the implementation.
- `docs/agent-team.md` records responsibilities and handoffs.
  `docs/state-machines.md` describes transitions and failure invariants; update
  it when behavior changes, including loading, mutation, and process states.
- Keep shared data access and publication within the current device's explicit
  authorization. This increment is local only: no push, course submission,
  shared-account integration, or synced Obsidian write.
- Keep branches after completion or merge. Never delete a branch earlier than
  seven full days afterward; elapsed time alone is not permission to delete it.
- Verify the current revision. Historical homework test counts and publication
  records are evidence for their recorded revision, not new final-project runs.
- Coordinate edits by file ownership. Do not switch branches, overwrite another
  agent's work, or mark a task complete before its acceptance check succeeds.

## Product and homework conventions

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
