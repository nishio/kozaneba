#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${CYPRESS_BASE_URL:-http://localhost:3000}"
STARTED_SERVER=0
SERVER_LOG="$(mktemp -t kozaneba-cypress-emulator-server.XXXXXX.log)"

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
npx firebase --version

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

section "Firebase emulator smoke"
env -u ELECTRON_RUN_AS_NODE npx firebase emulators:exec --only auth,firestore \
  "env -u ELECTRON_RUN_AS_NODE npx cypress run \
    --spec cypress/e2e/kozaneba/test_login.cy.ts,cypress/e2e/kozaneba/test_save.cy.ts,cypress/e2e/kozaneba/test_tutorial.cy.ts \
    --config baseUrl=$BASE_URL,video=false"

section "Done"
echo "Firebase emulator smoke passed."
