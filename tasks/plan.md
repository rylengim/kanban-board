# Implementation plan

1. Record the product spec and initial repository commit (Homework Q1–Q3).
2. Write `openapi.yaml` with shared card, pagination, and error schemas.
3. Build the interactive frontend against a central memory adapter; verify
   frontend tests and production build (Q4).
4. Write failing endpoint tests, then implement FastAPI with a memory repository;
   run all endpoint tests (Q5). This can run alongside the frontend after step 2.
5. Connect the HTTP adapter and verify the browser sends real API requests (Q6).
6. Add SQLAlchemy/SQLite behind the repository boundary; run the same tests plus
   file-backed restart persistence tests (Q7).
7. Review the implementation, test browser workflows at desktop/mobile sizes,
   and record exact setup commands, test evidence, and submission answers.

Use separate commits for the specification, contract, mocked frontend, memory
backend, connection, and persistence. Push once the user supplies a repository.
No container or hosting work is required for Module 2.

## Final-project delivery extension — 10 November 2026

The user selected Boardlet for the second final-project attempt. Follow
`docs/final-project-spec.md` and the final-project section of `tasks/todo.md`.
The completed homework sequence above remains the historical record.

1. Specify the delivery increment before code; preserve the original product
   workflow and use a local feature branch.
2. In parallel, package the existing app, add a unified verification command
   with a real-process HTTP check and CI, and document agent/state workflows.
3. Checkpoint: run the combined checks and build/start the containers. Resolve
   integration failures before proceeding.
4. Verify production browser behavior and persistence using synthetic data;
   perform independent review and record exact evidence.
5. Prepare the submission checklist and demo procedure. Publication, an exact
   published commit, form submission and peer reviews remain explicit later
   steps under the user's device rules.

Dependencies: packaging and verification can proceed independently; container
and browser checks require packaging; evidence requires completed checks.
Risks: historical checks are not current evidence; SQLite data must survive
restarts; packaged API routing must preserve source-development behavior.
The existing parent household-chores plan is a separate, unfinished project.

Risks: contract drift is checked against OpenAPI; hidden page truncation is
prevented by loading every page; unsuccessful mutations keep the last saved
board and form contents; persistence is verified using a fresh application.
