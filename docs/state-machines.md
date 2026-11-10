# Boardlet state machines

This inventory describes the implementation, including its implicit UI states.
State names below are explanatory; they do not introduce new API values or
promise verification beyond the recorded checks. Preserve these invariants when
changing behavior so users, developers, and agents share the same expectations.

## Cards and saved data

Source: [API types](../frontend/src/api/types.ts),
[models](../backend/app/models.py), and [repositories](../backend/app/repository.py).

- A new card can start in `todo`, `in_progress`, or `done`; `todo` is the default.
  Every existing status can change to either other status, including reopening
  `done`. There is no required one-way sequence or terminal `done` restriction.
- Create assigns an ID and timestamps. Update preserves omitted fields and
  advances `updated_at`; concurrent changes to the same field use the last save.
  Priority (`low`, `medium`, `high`) is independent of progress.
- Successful delete changes **present → absent**. There is no trash or undo.
  Reading, updating, or deleting an absent card returns `404`; invalid input
  returns `422` without saving a partial change.
- The interface accepts a mutation only after a successful API response; there
  is no optimistic move or removal to roll back. A lost response can still mean
  the server saved the change. Check the board before retrying an uncertain
  create; POST has no idempotency key and is never automatically retried.

## Loading, refresh, and filters

Source: [useBoard](../frontend/src/useBoard.ts),
[App](../frontend/src/App.tsx), and [HTTP adapter](../frontend/src/api/http.ts).

| Transition | Visible result and invariant |
| --- | --- |
| Initial → loading | Empty cache, skeletons, loading announcement; mutations and Refresh disabled. |
| Ready/error → refreshing | Clear the old error; retain cached cards internally while skeletons display. |
| Loading → ready | Replace the cache only after all validated pages load; announce refresh success. |
| Loading → error | Keep the last cache, show an alert, enable deliberate retry; an initial failure is not presented as an empty saved board. |
| Older request completes | Ignore it if a newer refresh or effect cleanup has invalidated its request number. |
| Search/priority changes | Derive visible cards from the cache; do not mutate data. Clear filters restores the complete cached board. |

Counts beside columns reflect filtered cards; completion progress reflects the
whole cached board. An empty board, an empty filtered result, and a failed first
load have different messages. Tabs synchronize through explicit Refresh.

Pagination checks reject malformed pages, changing totals, incomplete results,
and duplicate IDs. They are not a transactional snapshot across multiple HTTP
requests; concurrent edits can still change content while pages load.

## Editing, saving, and moving

Source: [TaskDialog](../frontend/src/components/TaskDialog.tsx) and `useBoard.ts`.

**Closed → editing → validating → saving → closed** is the successful path.
Validation failure returns to editing with an alert. Save failure returns to
editing with the same draft and an error; retry is a user decision. Cancel while
idle discards the draft. Title and description limits count Unicode code points.

While saving, form fields, cancel/close controls, card actions, and Refresh are
disabled. Escape cannot dismiss a pending mutation. Successful save updates the
cache, announces the result, and closes the dialog. An existing card's complete
form is submitted; editing is not conflict detection against another tab.

Moving a card follows **idle → pending → confirmed/error**. The card keeps its
saved position until confirmation; errors appear at board level. Focus returns
to its status control after the attempt. Form-save errors stay in the dialog.

## Delete confirmation and focus

Source: [DeleteDialog](../frontend/src/components/DeleteDialog.tsx),
[Modal](../frontend/src/components/Modal.tsx), and `App.tsx`.

**Editing → confirming delete → deleting → closed** removes the card only on
success. Keep task or Escape while idle closes confirmation without deleting.
Failure keeps the card and confirmation visible for a deliberate retry; pending
deletion disables dismissal. A `404` from another tab's deletion remains an
error until the user closes and refreshes.

Entering delete confirmation replaces the editor: unsaved edits are discarded,
and Keep task returns to the board rather than restoring that draft. Native
modal dialogs contain focus; creation/editing initially focuses the title,
deletion focuses Keep task. Closing restores the opener when it still exists,
otherwise New task. Moving a card may recreate its controls in another column.

## Modes, startup, and persistence

Source: [frontend entry](../frontend/src/main.tsx),
[configuration](../backend/app/config.py),
[application lifespan](../backend/app/main.py), and
[SQLAlchemy repository](../backend/app/sqlalchemy_repository.py).

| Mode | Lifetime and reset boundary |
| --- | --- |
| Frontend `mock` | Synthetic cards in browser memory; page reload recreates samples. No API or database is used; the badge says it resets on reload. |
| API `BOARDLET_STORE=memory` | Empty process-local repository at app creation; browser reload retains it, a fresh backend process loses it. |
| API `BOARDLET_STORE=sqlalchemy` (default) | Persisted SQLite database; browser/API/container restart retains cards only when the same database file or volume is retained. No implicit sample seeding. |

Configuration is selected at startup, not switched by the UI. Invalid store or
database settings fail startup rather than silently falling back to memory.
Repository lifecycle is **constructed → initializing → serving → closing**;
initialization failure prevents serving and still runs cleanup. SQLAlchemy
creates missing tables at initialization and disposes its engine at shutdown.
Schema creation is not a migration system; this delivery adds no schema changes.

`/api/health` reports a running API; it does not execute a database query. Verify
actual CRUD and persistence separately. Restarting with a different path or
removing the persistent volume changes data availability; a container image
alone does not preserve records.

## Known limits and verification map

HTTP requests currently have no client timeout or cancellation. A stalled
connection can leave loading or saving pending; reloading loses an unsaved draft.
This is a limitation, not a guaranteed recovery path. The app is a trusted local
shared board without authentication, conflict detection, or live synchronization.

| Invariant | Existing checks to run |
| --- | --- |
| CRUD, legal statuses, validation, missing IDs, pagination | [Backend API tests](../tests/test_api.py), against both repositories |
| Contract remains consistent | [OpenAPI tests](../tests/test_contract.py) |
| Durable versus temporary storage | [Persistence tests](../tests/test_persistence.py); F3 real-process restart and F5 packaged restart checks |
| Loading, forms, filters, failed mutations, pending controls, focus | [Frontend behavior tests](../frontend/src/App.test.tsx) and F5 browser journeys |
| Complete lists, readable errors, no automatic create retry | [HTTP adapter tests](../frontend/src/api/http.test.ts) |

The [task tracker](../tasks/todo.md) records current delivery verification;
historical test counts do not establish the current revision's result.
