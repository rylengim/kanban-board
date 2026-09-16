# Homework 2 submission answers

Status: local implementation and verification complete. GitHub publication is
deferred at the user's request; the course form has not been submitted.

| Question | Answer |
| --- | --- |
| 1. Project | Mini Kanban board |
| 2. Application name | Boardlet |
| 3. Initial spec/setup commit SHA-1 | `8a73b51d9cbbcd670272067faec92cc9e4250486` |
| 4. Start frontend | From `frontend/`: `npm run dev` |
| 5. Start backend | From `backend/`: `uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` |
| 6. Backend URL | `http://localhost:8000` (tasks at `/api/tasks`) |
| 7. Run tests | From `backend/`: `uv run pytest ../tests`; from `frontend/`: `npm test` |

Question 3 asks for a commit **pushed to GitHub**. The SHA above identifies the
real local initial commit, containing `_docs/specs.md`, `.gitignore`,
`README.md`, and `AGENTS.md` before implementation. It still needs to be pushed
to the repository the user supplies. No remote has been invented or configured.

Verified: 173 backend tests, 17 frontend tests, Ruff, strict TypeScript, and the
production frontend build pass. The live browser checked CRUD, filtering,
failed-save recovery, a second tab, mobile layout, and SQLite process-restart
persistence. See [the verification record](browser-checks.md).

Submit the final answers using the
[course submission form](https://courses.datatalks.club/ai-dev-tools-2026/homework/hw2).
The form has not been submitted by the assistant.

See the [homework instructions](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/cohorts/2026/homework/02-development/homework.md)
for the seven questions. Public deployment, a demo video, and social posts are
not required to finish the local Module 2 app.
