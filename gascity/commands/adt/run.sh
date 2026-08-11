#!/bin/sh
# gc adt — pass-through to the adt CLI binary.
set -e

# Find the adt-cli rig path. ADT_RIG_ROOT overrides the auto-detection.
RIG_PATH="${ADT_RIG_ROOT:-}"
if [ -z "$RIG_PATH" ] && [ -n "${GC_CITY_PATH:-}" ]; then
  RIG_PATH="$(gc --city "$GC_CITY_PATH" rig list --json 2>/dev/null | jq -r '.rigs[] | select(.name == "adt-cli") | .path' 2>/dev/null || true)"
  if [ -n "$RIG_PATH" ] && [ ! -f "${RIG_PATH}/packages/adt-cli/dist/bin/adt.mjs" ]; then
    RIG_PATH=""
  fi
fi
if [ -z "$RIG_PATH" ]; then
  # Search upward from the city path (or the pack root) for the repo checkout.
  SEARCH_DIR="${GC_CITY_PATH:-$(CDPATH='' cd -- "$(dirname "$0")/../.." && pwd)}"
  while [ "$SEARCH_DIR" != "/" ]; do
    if [ -f "${SEARCH_DIR}/packages/adt-cli/dist/bin/adt.mjs" ]; then
      RIG_PATH="$SEARCH_DIR"
      break
    fi
    SEARCH_DIR="$(dirname "$SEARCH_DIR")"
  done
fi
if [ -z "$RIG_PATH" ]; then
  RIG_PATH="$(CDPATH='' cd -- "$(dirname "$0")/../.." && pwd)"
fi

ADT_CLI="${RIG_PATH}/packages/adt-cli/dist/bin/adt.mjs"
cd "$RIG_PATH"
exec bun "$ADT_CLI" "$@"
