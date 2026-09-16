# Browser verification checklist

Run against the live HTTP backend, using only disposable test cards created for
this verification. Backend automated tests use isolated databases.

- [x] Load the board with both servers running; inspect empty/loading states.
- [x] Add a card with a title, description, and high priority; see it in To do.
- [x] Edit title/description and move the card to In progress.
- [x] Refresh the page; the updated values and status remain.
- [x] Open a second browser tab; it sees the same saved card.
- [x] Filter/search; visible counts and empty states agree with visible cards.
- [x] Clear filters; the card returns.
- [x] Cancel deletion; the card remains. Confirm deletion of a disposable
  verification card; it disappears and remains absent after refresh.
- [x] Interrupt the backend; a request shows a useful error and retains input.
- [x] Restore the backend; retry succeeds without retyping.
- [x] Inspect desktop and narrow/mobile layout, labels, focus, and dialogs.
- [x] Confirm no application console errors and expected API response statuses.
- [x] Repeat save and reload with SQLite, then restart the backend and confirm
  that the browser still sees the saved card.
- [x] Confirm final focus fallback after edit-and-move or deleting a card.

## Results

The live HTTP workflow was exercised using the Codex in-app browser, React at
`http://127.0.0.1:5173`, and FastAPI at `http://localhost:8000`. The test card was
created, edited, moved, filtered, and deleted through the UI. A second tab saw
the same record and correctly became empty after deletion and Refresh.

Stopping the backend caused a readable save error without losing entered title,
description, or priority. Restarting it allowed the saved draft to be submitted.
The API access log showed successful GET, POST, PATCH, and DELETE requests.

At 390×844 the board stacks its columns and has no horizontal overflow. Native
dialog testing confirmed Title gets initial focus, Escape returns to New task,
the deletion dialog focuses Keep task, and moving a card retains focus on its
status control. A fresh second tab had zero console errors or warnings.

During development, hot replacement of a React effect briefly produced
dependency-array warnings in the old tab; these were absent after a fresh load.
The deliberate offline test produced the expected failed network request.
Direct top-level navigation to the JSON health route was blocked by the browser
tool, but the app's actual API requests worked and health returned 200 through
curl. These tooling observations were not treated as app failures or hidden.

Final SQLite check: created `SQLite restart verification` in In progress,
confirmed the row in the actual SQLite file, stopped the backend process, and
started it again. Reloading the browser showed the same card in In progress.
The disposable record was then deleted and the reloaded board was empty.
Final dialog checks confirmed both edit-and-move and confirmed deletion return
focus to New task when the original edit button no longer exists.
