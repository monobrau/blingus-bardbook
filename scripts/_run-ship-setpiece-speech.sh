#!/bin/bash
set -euo pipefail
export DISPLAY=:0
if [ -z "${BLINGUS_PW:-}" ]; then
  echo "BLINGUS_PW is not set" >&2
  exit 1
fi
ROOT=/mnt/c/Git/blingus-bardbook
for f in scripts/_ship-setpiece-speech.sh js/action-workflow.js js/character-sheet.js api/generate-outcome.php; do
  sed -i 's/\r$//' "$ROOT/$f" || true
done
rsync -av -e /tmp/ssh-fedora-pw \
  "$ROOT/scripts/_ship-setpiece-speech.sh" \
  "$ROOT/js/action-workflow.js" \
  "$ROOT/js/character-sheet.js" \
  "$ROOT/api/generate-outcome.php" \
  cknospe@192.168.54.208:/tmp/blingus-setpiece-src/
/tmp/ssh-fedora-pw cknospe@192.168.54.208 'bash -lc "sed -i \"s/\\r$//\" /tmp/blingus-setpiece-src/_ship-setpiece-speech.sh; cd /tmp/blingus-setpiece-src && bash _ship-setpiece-speech.sh"'
