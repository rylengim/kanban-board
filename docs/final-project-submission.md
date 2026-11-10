# Final-project submission checklist

Prepared for the 2026 second attempt. The reviewed implementation and synthetic
demo are published on `feature/final-project-readiness`. This file is not
evidence that a course form has been submitted.

## Dates and attempt rules

The official brief defines one application with two submission attempts, using
the same criteria. The first submission deadline was 26 October 23:00 UTC
(27 October 02:00 Moscow); its peer-review deadline was 5 November 06:00 UTC.
The course overview's completed-at date must not be confused with submission.

- Second submission: **17 November 2026, 02:00 Europe/Moscow**
  (16 November, 23:00 UTC). Personal preparation target: 15 November.
- Three peer reviews: **24 November 2026, 02:00 Europe/Moscow**
  (23 November, 23:00 UTC).

Sources checked 10 November: [official brief](https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/blob/main/project/README.md),
[submission form](https://courses.datatalks.club/ai-dev-tools-2026/project/project2),
[calendar feed](https://courses.datatalks.club/ai-dev-tools-2026/calendar.ics).
No signed-in account or other-device data was read.

## Evidence map

The rubric has 24 available points and a 10-point pass threshold. Reviewers
determine the actual score; peer review is also mandatory. Evidence for this
increment is deliberately distinguished from work still pending.

| Criterion | Evidence / remaining work |
| --- | --- |
| Problem | README and `_docs/specs.md` |
| Specification and tracker | Published `docs/final-project-spec.md` and `tasks/todo.md` |
| Agent team | `docs/agent-team.md` |
| Context | `AGENTS.md` links modular docs |
| Connected application | Compose startup; browser and persistence evidence |
| Tests | `scripts/check.sh`, existing suites, real-process HTTP check |
| Containers | API/web Dockerfiles, Compose and persistent SQLite volume |
| Deployment | Verified local package and published synthetic demo recording |
| CI/CD | Remote checks passed on reviewed implementation; CD not implemented |
| Observability | Basic server logs only; correlated metrics/traces/UI absent |
| Alerting | Not implemented |
| On-call agent | Not implemented |

See [actual verification](final-project-verification.md). There are no claims
of a production deployment, observability stack, automatic remediation, or
maximum marks. Optional rubric work must not put the submission window at risk.

## Before submitting

- [x] Review the local branch and current evidence; resolve blocking issues.
- [x] Obtain explicit authorization to publish the reviewed branch and demo
  using this device’s existing repository access (10 November 2026).
- [x] Publish the reviewed branch to the existing project repository. No
  databases, secrets, personal tasks, or chat histories are included.
- [x] Confirm remote CI passes at reviewed commit
  `ee9c2a477c7a1803f18d90f99076e3c0a8c98e76`; see the verification report.
- [ ] Before course submission, choose the exact final commit and confirm its CI
  run, including any later documentation updates.
- [x] Confirm the specification, tracker and agent-process evidence are publicly
  readable. If using a separate public issue tracker, link it from the README.
- [x] Record a synthetic demo of the packaged application; see
  [final-project-demo.webm](final-project-demo.webm) and the verification report.
- [x] Publish the authorized synthetic demo and verify public access.
  Public hosting is another option if separately authorized with access controls.
- [ ] Record the final full commit SHA. Do not submit a moving branch name.
- [ ] In the course form, enter the public repository URL, exact commit, actual
  time spent, and the user's chosen certificate name. Optional links must exist.
- [ ] Verify the platform reports the submission as saved before the deadline.
- [ ] Complete the three assigned reviews before their separate deadline.

Existing repository recorded in Homework 2:
[`rylengim/kanban-board`](https://github.com/rylengim/kanban-board/tree/feature/final-project-readiness).
Use this branch or the exact submitted commit; `main` retains the original
homework. Homework 2 answers and Homework 3's saved submission are separate
from this final-project submission.
