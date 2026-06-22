#!/usr/bin/env bash
# Pre-deploy gate: regenerate outcomes (optional), audit workflow pools, smoke tests.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Blingus workflow verify ==="

if [[ "${SKIP_GENERATE:-}" != "1" ]]; then
  echo "Regenerating outcome data..."
  python3 scripts/generate-outcomes.py
else
  echo "Skipping generate-outcomes (SKIP_GENERATE=1)"
fi

echo "Checking pronoun capitalization..."
if rg -q ', i [a-z]' js/data/scene-outcomes.js 2>/dev/null; then
  echo "FAIL: lowercase pronoun 'i' found in scene-outcomes.js"
  exit 1
fi
if rg -q '"[^"]*\bi\b[^"]*"' js/data/scene-outcomes.js 2>/dev/null; then
  echo "FAIL: lowercase pronoun 'i' found in scene-outcomes.js"
  exit 1
fi
echo "OK: pronoun I capitalization"

echo "Running workflow audit..."
python3 scripts/audit-workflow.py

echo "Running revamp smoke tests..."
if command -v node >/dev/null 2>&1; then
  node scripts/verify-revamp.mjs
else
  echo "node not found; running Python data smoke checks"
  python3 scripts/verify-data-smoke.py
fi

echo "All workflow checks passed."
