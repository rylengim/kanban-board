# Boardlet final-project delivery scope

Selected by the user on 10 November 2026. This extends Homework 2's delivery
scope; the Kanban behavior in `_docs/specs.md` remains the product contract.

## Outcome

A reviewer can start Boardlet with one command, create and move a card in a
browser, restart the packaged application without losing it, and run all
automated checks with one command. The repository explains the problem,
acceptance criteria, agent responsibilities, actual verification, and remaining
submission steps. Use synthetic demonstration tasks only.

## Scope

- Package the production frontend and API, with SQLite on a persistent volume.
- Bind the demonstration to this device's loopback interface by default.
- Preserve source development and mock mode, API contracts, and existing data.
- Combine backend tests/lint, frontend tests/build, and real HTTP persistence
  verification under one entry point; use it in a pull-request CI workflow.
- Explain state transitions, contributor responsibilities, deployment and
  rollback, and provide a rubric/evidence checklist and demo procedure.
- Initial preparation was local. The user subsequently authorized publishing
  the reviewed branch and synthetic demo to `rylengim/kanban-board` on 10 November
  2026. Do not use shared-account integrations, submit course forms, delete
  branches, or write to the synced Obsidian vault as part of publication.

Containers and CI are now in scope. Multi-user authentication, new product
features, external hosting, automatic deployment, telemetry services, alerts,
and autonomous incident repair are follow-up work rather than claims about this
increment. A public deployment would require a separate access-control decision.

## Verification

1. Existing tests pass unchanged and the frontend production build succeeds.
2. A real HTTP process accepts CRUD requests and retains data after restart in
   an isolated temporary database; failures return a nonzero command exit code.
3. Compose starts the packaged app; same-origin browser traffic reaches the API;
   a synthetic card survives a container restart and can be deleted afterward.
4. A clean browser exercises create, status changes, reload, edit, and delete at
   desktop and narrow widths, with no unexpected console or request failures.
5. Documentation distinguishes local tests from recorded remote CI results,
   and publication from course submission and peer reviews still to be done.

## Course facts verified 10 November 2026

The two numbered projects are two attempts for one application. The second
submission closes 16 November 23:00 UTC / **17 November 02:00 Europe/Moscow**.
Three peer reviews are required; their deadline is 23 November 23:00 UTC /
**24 November 02:00 Europe/Moscow**. Aim to prepare submission by 15 November.
The form asks for a public repository URL and an exact commit, time spent and a
certificate name; optional progress and FAQ links must be real.

Sources: [brief](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/project/README.md),
[submission](https://courses.datatalks.club/ai-dev-tools-2026/project/project2),
[official calendar](https://courses.datatalks.club/ai-dev-tools-2026/calendar.ics).
