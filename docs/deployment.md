# Local deployment, demo, and rollback

This deployment runs on the current device. It uses no external hosting account
and does not publish source, tasks, or telemetry. It is a shared board without
authentication. Keep its loopback binding and use synthetic demonstration data.

## Start and inspect

Prerequisite: Docker with the Compose plugin. From the repository root:

```bash
docker compose up --build --wait
docker compose ps
```

Open http://localhost:8080. Set `BOARDLET_PORT=18080` on Compose commands if the
default port is busy. Nginx serves the built frontend and forwards `/api/` to
the API over the internal network. The API itself has no published host port.
Its health check queries the task repository, so successful startup includes a
working database. The web health check also checks the proxied API.

The private bridge defaults to `10.254.241.0/24`. This avoids the automatic
address-pool exhaustion encountered on this device. If that range overlaps a
local/VPN route or another Docker network, set `BOARDLET_SUBNET` to a free private
subnet. Do not change global Docker or VPN configuration for this app.

```bash
docker compose logs --tail=50 api web
docker compose restart api
docker compose down
```

`down` stops/removes the containers and network while retaining the named
`boardlet-data` volume. Do not add `--volumes` or `-v` when retaining tasks.
Source development still uses `backend/boardlet.db`; the container database is
`/data/boardlet.db` in its separate volume. Neither is silently seeded.

For a separate synthetic review instance, consistently use:

```bash
BOARDLET_PORT=18080 BOARDLET_SUBNET=10.254.242.0/24 docker compose -p boardlet-final-check up --build --wait
```

Use the same project name, port, and subnet for its subsequent `ps`, `restart`,
and `down` commands. Concurrent instances need distinct subnets. Never point
automated tests at an existing personal board.

## Reviewer demo

The local [recorded demo](final-project-demo.webm) shows a synthetic task moving
through the packaged app. The [verification report](final-project-verification.md)
records container startup and restart persistence, with desktop/mobile captures.
Neither the recording nor the application has been published.

1. Start the packaged app and show both services healthy.
2. Open the board; create “Synthetic review task” with a description and high
   priority. Move it from To do to In progress to Done.
3. Reload the page. Restart the API, wait for its health check, then reload and
   show that the task remains in Done.
4. Search for the title, change the priority filter, and clear the filters.
5. Edit the title; show the deletion confirmation, cancel it, then delete the
   synthetic task and reload to verify removal.
6. Run `./scripts/check.sh`. Show the task tracker, agent roles and recorded
   verification. For a published demo, record only this synthetic review instance.

Repeat the core flow at a 390-pixel viewport and using keyboard focus. An API
error should remain visible, and a failed save should preserve the draft.
The source mock mode deliberately resets after reload; do not use it as proof
of persistent deployment.

## Retain versions and roll back

For each subsequent packaged release, use a unique version tag, for example the
commit SHA obtained from `git rev-parse --short HEAD`. Set `BOARDLET_VERSION` to
that value when running `docker compose up --build --wait`. Retain both API and
web images from the preceding verified release. Do not reuse its version tag.

To roll back, set `BOARDLET_VERSION` to the retained preceding version and run
`docker compose up --no-build --wait`, using the same Compose project name and
port. Verify the app and persistent task before resuming use. This changes the
images while reusing the volume; it does not undo task edits or restore deleted
data. This increment changes no database schema. A future schema change needs
a tested backup/restore and compatibility plan before deployment.

There is no earlier packaged release for the first installation; the first
verified pair becomes the baseline for subsequent rollback. Never delete Git
branches as part of release cleanup; retain them for at least seven full days.

## Remaining delivery work

CI runs the local checks but has no deployment credentials or automatic CD.
Public hosting, access controls, HTTPS, backup scheduling, telemetry storage,
alerts, and incident-response automation have not been configured. Review the
[submission checklist](final-project-submission.md) before claiming any of them.
