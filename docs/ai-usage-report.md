# AI usage report

## Human decisions

The user supplied the Module 2 lesson and 2026 Homework 2 links, selected
**Mini Kanban board** from the four homework choices, and initially requested
local preparation. The user later supplied
[rylengim/kanban-board](https://github.com/rylengim/kanban-board) for publication.

## Assistance actually used

Codex read the current assignment, inspected the workspace, proposed the name
Boardlet and a small single-board scope, and wrote the canonical product spec
before application code. It initialized a separate local `homework-02` Git
repository because the parent workspace had no valid Git metadata. The earlier
household-chores planning files were preserved.

Work was divided between a contract author, frontend implementer, and backend
implementer. The main agent coordinates checkpoints, integration, browser
verification, documentation, and review. Frontend and backend share the
committed OpenAPI contract rather than inventing independent response formats.

## Workflow and verification log

- Initial specification checkpoint:
  `8a73b51d9cbbcd670272067faec92cc9e4250486`.
- The contract uses a bounded, paginated list and strict input fields. During
  design, raw title length was clarified: at most 120 input characters, then
  leading/trailing whitespace is removed. Whitespace-only titles are rejected.
- The OpenAPI document was validated as YAML; its nine JSON Schemas, references,
  fifteen examples, and strict invalid-input cases passed checks.
- Frontend red stage: `npm test` failed because `./api/memory` and the App
  implementation did not yet exist. Behavior tests were written before them.
- The initial backend TestClient harness hung during lifespan startup inside
  the sandbox, including for an empty FastAPI app. The same minimal application
  ran in 0.04 seconds with approved execution outside the sandbox. That run
  captured the intended red assertion: the health route returned 404 before
  endpoints were implemented. The application/test design was not weakened.
- Mock frontend checkpoint `54f0646`: seven behavior tests pass, and strict
  TypeScript checking plus the Vite production build pass. The browser showed
  the three-column desktop board and a stacked layout at 390×844 with no
  horizontal overflow. The prototype console had no errors or warnings.
- Visual review darkened low-contrast secondary text and removed the external
  font request. Browser testing found opening focus landed on Close instead of
  Title. Explicit initial focus fixed that; focus now follows a moved card and
  falls back to New task when an edited or deleted card removes its opener.
  The final behaviors were checked in the actual browser.
- Independent backend review found a mismatch between regex whitespace and
  Python trimming for control characters. The failure was reproduced, then a
  post-trim nonempty check and regression coverage fixed it before checkpoint.
- Memory backend checkpoint `5f3b23e`: 86 tests pass, including comparisons
  between FastAPI's genuine generated OpenAPI and the written contract,
  response validation, and examples. Ruff passes.
- Live frontend checkpoint `22fe20e`: 17 tests, strict TypeScript, and production
  build pass. Tests first reproduced lost keyboard focus, malformed enum arrays,
  and Unicode length disagreement. Fixes preserve focus, validate actual string
  enums, and count Unicode code points consistently with Python. Uncertain-save
  errors explain how to check another tab without discarding the current draft.
- Browser integration passed create/edit/move/delete, combined search/priority
  filters, page reload, and a second tab. Stopping the backend retained an
  unsaved draft; restarting and deliberately retrying saved it successfully.
- SQLite checkpoint `f644124`: a persistence test first reproduced a 404 after
  application recreation with the old memory store. SQLAlchemy then replaced
  that default behind the same repository interface. The final 173 tests pass
  in 4.03 seconds, running the same endpoint/contract tests against memory and
  file-backed SQLite plus create/edit/delete across four application lifespans.
  Ruff passes. Two upstream Starlette TestClient deprecation warnings remain;
  no warnings or failed tests were suppressed.
- A separate live browser check saved a card into `backend/boardlet.db`, verified
  the record directly in SQLite, stopped and restarted the backend process, and
  read the same card from the browser. Disposable test cards were removed.
- Independent reviews covered the memory backend, frontend, and SQLAlchemy
  slice. All actionable findings were fixed; no remaining blockers were found.
  The final fresh-tab browser console is clean during healthy operation.
- On 2026-09-16 the user supplied the GitHub repository. It was empty, so the
  existing main branch was pushed using the user's configured SSH access.
  The complete development history and original Question 3 commit were
  preserved. Submission documentation was updated with the published links.

## Reproducibility and limits

Lockfiles capture React 19.3.0, Vite 8.3.0, TypeScript 7.0.2, Vitest 5.0.1,
FastAPI 0.141.1, Pydantic 2.13.5, Uvicorn 0.53.0, and SQLAlchemy 2.0.54.
This session used Node 22.22.3, Python 3.12.12, and uv 0.11.24. Dependency
downloads and local servers required approved execution outside the sandbox;
this is specific to the agent environment. The frontend npm audit reported
zero known vulnerabilities when the dependencies were installed.

The complete app runs locally, with no accounts or private boards. Its source
and history are published on GitHub. PostgreSQL, app deployment, CI/CD, and
submission-form completion are not claimed.

## Source references

- [Module 2](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/02-development/01-build-and-ship-an-ai-assisted-full-stack-app.md)
- [Homework 2](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/cohorts/2026/homework/02-development/homework.md)
- [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html)
- [Vite getting started](https://vite.dev/guide/)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
- [React effects](https://react.dev/reference/react/useEffect)
- [Native dialog behavior](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)
- [FastAPI testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [FastAPI lifespan](https://fastapi.tiangolo.com/advanced/events/)
- [uv projects and locks](https://docs.astral.sh/uv/guides/projects/)
- [Pydantic validators](https://docs.pydantic.dev/latest/concepts/validators/)
- [SQLAlchemy sessions](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- [SQLite threading and pooling](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#threading-pooling-behavior)

This app was developed **with** AI assistance. It does not call an AI API at
runtime, require an API key, or include a generated claim about the user's
personal learning experience.
