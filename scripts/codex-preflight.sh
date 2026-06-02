#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${CODEX_PREFLIGHT_BASE_URL:-http://localhost:3000}"
STARTED_SERVER=0
SERVER_LOG="$(mktemp -t kozaneba-codex-preflight-server.XXXXXX.log)"

cleanup() {
  if [[ "$STARTED_SERVER" == "1" && "${SERVER_PID:-}" != "" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "$ROOT"

section() {
  printf "\n== %s ==\n" "$1"
}

wait_for_server() {
  local i
  for i in {1..90}; do
    if curl -fsS "$BASE_URL/#blank" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Dev server did not become reachable at $BASE_URL" >&2
  echo "Server log: $SERVER_LOG" >&2
  return 1
}

section "Environment"
node --version
npm --version
if [[ "${ELECTRON_RUN_AS_NODE:-}" != "" ]]; then
  echo "ELECTRON_RUN_AS_NODE is set; Cypress will be run with it unset."
fi

section "Dev server"
if curl -fsS "$BASE_URL/#blank" >/dev/null 2>&1; then
  echo "Using existing dev server at $BASE_URL"
else
  echo "Starting dev server at $BASE_URL"
  env -u ELECTRON_RUN_AS_NODE BROWSER=none npm start >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
  STARTED_SERVER=1
  wait_for_server
fi

section "Boot contract"
INDEX_HTML="$(mktemp -t kozaneba-codex-preflight-index.XXXXXX.html)"
BUNDLE_JS="$(mktemp -t kozaneba-codex-preflight-bundle.XXXXXX.js)"
curl -fsS "$BASE_URL/#blank" >"$INDEX_HTML"
grep -q 'id="boot-fallback"' "$INDEX_HTML"
grep -q '/static/js/bundle.js' "$INDEX_HTML"
if grep -q 'gstatic.com/firebasejs/ui' "$INDEX_HTML"; then
  echo "Initial HTML must not depend on gstatic Firebase UI CSS." >&2
  exit 1
fi

curl -fsS "$BASE_URL/static/js/bundle.js" >"$BUNDLE_JS"
grep -q 'Failed to run user script from localStorage.onLoad' "$BUNDLE_JS"
grep -q 'line-label-hit-' "$BUNDLE_JS"
echo "#blank boot contract is served by the current implementation."

section "Cypress"
env -u ELECTRON_RUN_AS_NODE npx cypress run \
  --spec cypress/e2e/kozaneba/test_line_label.cy.ts \
  --config video=false

section "Unit tests"
npm test -- --watchAll=false

section "Production build"
npm run build

section "Done"
echo "Codex preflight passed."
