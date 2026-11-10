#!/usr/bin/env bash
# The same entry point is used locally and in CI. Stop on the first failed gate.
set -euo pipefail

project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$project_root/backend"
uv sync --locked
uv run --locked ruff check . ../tests ../scripts/test-http.py
uv run --locked pytest ../tests
uv run --locked python ../scripts/test-http.py

cd "$project_root/frontend"
npm ci --no-fund
npm test
npm run build
npm audit --audit-level=high

printf '\nAll Boardlet checks passed.\n'
