# Verified checkpoints

- [x] Choose Mini Kanban board and specify Boardlet.
- [x] Save initial spec/setup commit for Question 3.
- [x] Define and validate the OpenAPI contract.
- [x] Build and test the mocked frontend prototype (seven tests, build,
  desktop/mobile browser inspection; commit `54f0646`).
- [x] Write endpoint tests, observe failure, implement the memory backend
  (86 tests and Ruff pass; commit `5f3b23e`).
- [x] Connect and verify frontend/backend HTTP traffic, including failed-save
  recovery and shared state across two browser tabs.
- [x] Replace memory with SQLAlchemy/SQLite and verify restart persistence
  (173 backend tests and Ruff pass; commit `f644124`).
- [x] Finish browser checks, independent review, and submission documentation
  (17 frontend tests and build pass; live SQLite process restart verified).
- [x] Push the complete history to the user-supplied
  [rylengim/kanban-board](https://github.com/rylengim/kanban-board) repository.

## Final-project delivery — 10 November 2026

- [x] F1: Verify the official attempt/deadline rules, select Boardlet, and record
  `docs/final-project-spec.md` before implementation. Owner: coordinator.
- [x] F2: Package frontend/API/SQLite with one-command startup. Owner: delivery
  engineer. Acceptance: same-origin UI works; loopback by default; persistent
  volume survives restart. Verify: Compose build/start and restart smoke check.
  Depends on F1; files: Dockerfiles, Compose, proxy config, ignore rules.
- [x] F3: Provide one-command checks plus real-process CRUD/restart integration.
  Owner: verification engineer. Acceptance: all existing checks and isolated HTTP
  persistence pass; CI calls the same command. Verify: run command locally and
  inspect workflow failure propagation. Depends on F1; files: scripts, HTTP test,
  CI workflow.
- [x] F4: Document the agent team, state machines, deployment/demo and rollback.
  Owner: documentation engineer. Acceptance: responsibilities and failure states
  are explicit; runbooks match delivered commands. Verify links and commands.
  Depends on F1, completed commands from F2/F3; files: AGENTS, modular docs, spec.
- [x] Checkpoint: F2/F3 checks pass together and packaged app is reachable locally.
- [x] F5: Verify browser journeys and conduct independent review. Owner: QA and
  coordinator. Acceptance: synthetic card CRUD and restart persistence verified,
  desktop/mobile usable, actionable review findings fixed. Verify browser,
  container checks and focused regressions. Depends on F2/F3; evidence in docs.
- [x] F6: Assemble honest rubric/submission evidence. Owner: coordinator.
  Acceptance: README and checklist match actual results and identify unpublished
  work. Verify documentation references and clean diff. Depends on F4/F5.
- [x] Publication: user authorization obtained; reviewed code and synthetic demo
  published on `feature/final-project-readiness` on 10 November 2026.
- [x] Remote CI: [run 42790288850](https://github.com/rylengim/kanban-board/actions/runs/42790288850)
  passed for reviewed implementation `ee9c2a477c7a1803f18d90f99076e3c0a8c98e76`.
- [ ] Course submission: enter the published repository URL and exact chosen
  full commit SHA, then verify the form is saved by 17 November 2026 02:00 Moscow.
- [ ] Peer review: complete three assigned reviews by 24 November 2026 02:00 Moscow.

Final local evidence: [verification report](../docs/final-project-verification.md).
F2–F6 were verified locally, followed by publication and remote CI. Course
submission and peer review remain open.
