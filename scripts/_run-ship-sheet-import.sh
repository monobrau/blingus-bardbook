#!/bin/bash
set -euo pipefail
export DISPLAY=:0
if [ -z "${BLINGUS_PW:-}" ]; then
  echo "BLINGUS_PW is not set" >&2
  exit 1
fi
ROOT=/mnt/c/Git/blingus-bardbook
for f in scripts/_ship-sheet-import.sh js/character-sheet.js js/ddb-sheet-import.js; do
  sed -i 's/\r$//' "$ROOT/$f" || true
done
rsync -av -e /tmp/ssh-fedora-pw \
  "$ROOT/scripts/_ship-sheet-import.sh" \
  "$ROOT/js/character-sheet.js" \
  "$ROOT/js/ddb-sheet-import.js" \
  cknospe@192.168.54.208:/tmp/blingus-sheet-import-src/
/tmp/ssh-fedora-pw cknospe@192.168.54.208 'bash -lc "sed -i \"s/\\r$//\" /tmp/blingus-sheet-import-src/_ship-sheet-import.sh; cd /tmp/blingus-sheet-import-src && bash _ship-sheet-import.sh"'
