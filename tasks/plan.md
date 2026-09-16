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

Risks: contract drift is checked against OpenAPI; hidden page truncation is
prevented by loading every page; unsuccessful mutations keep the last saved
board and form contents; persistence is verified using a fresh application.
