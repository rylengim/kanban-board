# Final-project verification — 10 November 2026

Local preparation on `feature/final-project-readiness`, based on Homework 2
commit `8355372767974dab39167445cf5b7fc66028649a`. Delivery implementation is
recorded in `d03af59`; the tooling audit fix is `8a86ca6`. No private databases, signed-in
accounts, or conversation histories were used during local preparation. The
user subsequently authorized publishing the reviewed branch and synthetic demo.

## Automated checks

`./scripts/check.sh` passed with the final dependency versions:

- 173 backend tests and Ruff.
- 1 real-HTTP CRUD/restart scenario.
- 17 frontend tests, TypeScript checking, and production build.
- npm audit: **0 vulnerabilities** (initially 3 high and 2 moderate).

The first run correctly stopped at the failing dependency-audit gate. Compatible
lockfile updates resolved it: Vite 8.3.0 → 8.3.7, Vitest/mocker 5.0.1 → 5.1.0,
source-map-js 1.2.1 → 1.2.2, and undici 8.10.2 → 8.12.4, with associated toolchain
transitives. The package manifest and all runtime dependency entries are unchanged.
The transitive obug/why-is-node-running major changes are Vitest development
dependencies. Existing Starlette httpx TestClient and AnyIO BlockingPortal
deprecation warnings remain visible; they do not fail the suite.

Upstream fixes reviewed: [Vite](https://github.com/vitejs/vite/releases/tag/v8.3.3),
[Vitest](https://github.com/vitest-dev/vitest/releases/tag/v5.0.3),
[source-map-js](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2),
[undici](https://github.com/nodejs/undici/releases/tag/v8.12.2).

The HTTP integration scenario uses a temporary database and subprocess, verifies
CRUD and invalid-state rejection, restarts the process to prove an update was
persisted, deletes the task, then restarts again to prove deletion persisted.
A negative control against a temporary memory-backed copy failed at the
post-restart read as expected. The actual application and databases were untouched.

## Packaged deployment

Verified using an isolated instance:

```bash
BOARDLET_PORT=18080 BOARDLET_SUBNET=10.254.242.0/24 docker compose -p boardlet-final-check up --build --wait
```

Both images built and both services became healthy. Through the web origin,
synthetic create → move → API restart → persisted read → edit → delete passed.
The API ran as UID 10001 and Nginx as UID 101. The API has no published host port;
the web service binds to loopback. Root filesystems are read-only and SQLite is
stored in the instance's separate named volume.

Docker's automatic address pool was exhausted on this device. A configurable
private bridge resolved startup without changing global Docker/VPN settings.
The final browser run used the rebuilt frontend image with audited packages.

## Browser verification and demo

Isolated Chromium 158.0.8127.18, with a fresh context and synthetic tasks only,
passed at **1440×1000** and **390×844**:

- Create, edit, status moves, search, delete cancellation and confirmed deletion.
- Page reload and API/container restart preserve saved status; deletion survives
  reload. The browser sends all API traffic to the web origin.
- A deliberately injected 503 leaves the draft and error visible; cancel closes
  the draft. This expected failure is separate from unexpected browser errors.
- Mobile create/move/delete, no horizontal page overflow, title focus on dialog
  open, Escape dismissal, and focus return to New task.
- No unexpected console warnings/errors, page errors, or failed requests.

Visual inspection confirmed readable desktop/mobile layouts. The automated
browser run is separate from `scripts/check.sh` and remote CI; no CI browser
coverage is claimed. A 21-second [synthetic demo](final-project-demo.webm) accompanies
the [desktop](final-project-desktop.png) and [mobile](final-project-mobile.png)
captures. Three clearly synthetic example cards remain in the isolated review
instance; original development data was never used.

## Independent review

`/root/boardlet_review` reviewed startup/shutdown, persistence, routing, nonroot
execution, test cleanup, failure propagation, CI, and the state-machine docs.
The reviewer identified conflicting subnets in the instructions for concurrent
instances; the runbook now assigns the synthetic instance its own subnet.
Final review found no blocking code issues. Bash syntax and whitespace checks
passed. The reviewer did not claim to have repeated the full test suite.

## Publication and remote CI

The reviewed implementation and demo were published on 10 November 2026 to
[`feature/final-project-readiness`](https://github.com/rylengim/kanban-board/tree/feature/final-project-readiness).
[GitHub Actions run 42790288850](https://github.com/rylengim/kanban-board/actions/runs/42790288850)
passed all checks at `ee9c2a477c7a1803f18d90f99076e3c0a8c98e76`. Publication
review found no databases, real environment files, credentials, or session
exports in the outgoing files; media contains synthetic cards and no audio.
The README clone command now selects this branch so reviewers receive the final
project instead of the original homework on `main`.

## Remaining evidence boundaries

The application has no public hosting deployment. No automatic CD, correlated
observability, alert, or on-call agent is claimed. Rollback is documented for
future retained image versions; a previous packaged release did not exist for this first installation.
Course submission and peer reviews remain unchecked in the tracker. The CI link
above identifies the tested implementation revision; any later documentation
commit has its own run in the repository Actions history.
