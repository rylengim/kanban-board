# Agent team and delivery workflow

This records the actual parallel work assigned on 10 November 2026. It does not
claim that earlier homework used this team or that pending checks have passed.

## Responsibilities

| Role | Assigned agent | Work and handoff |
| --- | --- | --- |
| Coordinator | `/root` | F1: verify course rules and record scope; integrate F2–F4; own README, deployment/demo procedure, evidence, and F6 submission preparation. |
| Delivery engineer | `/root/boardlet_packaging` | F2: package frontend, API, and persistent SQLite; report startup commands, configuration, and actual packaging checks. |
| Verification engineer | `/root/boardlet_checks` | F3: unified checks, real-process HTTP/restart test, and CI; report exit status, failures, and test evidence. |
| Documentation engineer | `/root/local_course_status` | F4: contributor rules, scope cross-reference, this team record, and state-machine inventory; report inconsistencies without changing another owner's code. |
| QA and independent reviewer | `/root` for browser QA; `/root/boardlet_review` for independent review | Verify integrated user journeys and persistence; inspect the delivered diff independently of implementation ownership. A role assignment alone is not review evidence. |

The [task tracker](../tasks/todo.md#final-project-delivery--10-november-2026)
contains F1–F6, owners, dependencies, acceptance criteria, and verification.
The [plan](../tasks/plan.md#final-project-delivery-extension--10-november-2026)
defines the integration order. These repository records are now published with
the final-project branch. No separate GitHub Issues activity is claimed.

## Coordination rules

1. Read the [delivery scope](final-project-spec.md),
   [product contract](../_docs/specs.md), and [contributor guide](../AGENTS.md).
   Agree on shared commands and API assumptions before parallel edits.
2. F2, F3, and the descriptive part of F4 proceed in parallel with separate file
   ownership. Announce a needed shared-file change before editing it.
3. Each owner reports changed paths, commands actually run, results, and known
   limitations. The coordinator reconciles documentation with the final commands.
4. F5 follows the combined checks and packaged startup. Failed checks return the
   relevant task to implementation; retain failing evidence until the correction
   is verified. Reviewer findings are fixed and rechecked or recorded as limits.
5. F6 records the reviewed revision and distinguishes local readiness from
   publication, remote CI, course submission, and peer reviews.

Task states are **open → in progress → ready for verification → verified**;
failed verification returns to **in progress**. Checkboxes mean **verified**,
not merely assigned or implemented. A temporary blocker names the dependency;
it does not silently lower acceptance criteria.

## Evidence boundaries

- The completed homework entries in `tasks/todo.md` and
  [AI usage report](ai-usage-report.md) belong to their original work.
- Current F2–F6 evidence must name the actual command or browser journey and its
  observed result. A workflow file is not proof of a remote CI run.
- No historical conversation exports, private task data, fabricated progress
  links, or invented reviewer logs are needed for this record.
- Local preparation does not authorize publication. Preserve the feature branch
  and follow the device and branch-retention rules in `AGENTS.md`.
