#!/bin/bash
set -euo pipefail
export DISPLAY=:0
if [ -z "${BLINGUS_PW:-}" ]; then
  echo "BLINGUS_PW is not set" >&2
  exit 1
fi
ROOT=/mnt/c/Git/blingus-bardbook
FILES=(
  scripts/_ship-party-kit.sh
  index.php
  script.js
  styles.css
  js/character-sheet.js
  js/action-workflow.js
  js/outcome-generate.js
  js/workflow-catalog.js
  js/tab-navigation.js
  js/keyboard-shortcuts.js
  js/constants.js
  js/site-identity.js
  js/puck-fx.js
  js/vadania-fx.js
  js/brawn-fx.js
  js/data/songs-data.js
  js/data/class-lines-data.js
  api/generate-outcome.php
  api/blingus-data.php
)
for f in "${FILES[@]}"; do
  sed -i 's/\r$//' "$ROOT/$f" || true
done
rsync -av -e /tmp/ssh-fedora-pw \
  "$ROOT/scripts/_ship-party-kit.sh" \
  "$ROOT/index.php" \
  "$ROOT/script.js" \
  "$ROOT/styles.css" \
  "$ROOT/js/character-sheet.js" \
  "$ROOT/js/action-workflow.js" \
  "$ROOT/js/outcome-generate.js" \
  "$ROOT/js/workflow-catalog.js" \
  "$ROOT/js/tab-navigation.js" \
  "$ROOT/js/keyboard-shortcuts.js" \
  "$ROOT/js/constants.js" \
  "$ROOT/js/site-identity.js" \
  "$ROOT/js/puck-fx.js" \
  "$ROOT/js/vadania-fx.js" \
  "$ROOT/js/brawn-fx.js" \
  "$ROOT/js/data/songs-data.js" \
  "$ROOT/js/data/class-lines-data.js" \
  "$ROOT/api/generate-outcome.php" \
  "$ROOT/api/blingus-data.php" \
  cknospe@192.168.54.208:/tmp/blingus-party-kit-src/
/tmp/ssh-fedora-pw cknospe@192.168.54.208 'bash -lc "sed -i \"s/\\r$//\" /tmp/blingus-party-kit-src/_ship-party-kit.sh; cd /tmp/blingus-party-kit-src && bash _ship-party-kit.sh"'
