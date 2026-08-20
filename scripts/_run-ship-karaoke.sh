#!/bin/bash
set -euo pipefail
export DISPLAY=:0
if [ -z "${BLINGUS_PW:-}" ]; then
  echo "BLINGUS_PW is not set" >&2
  exit 1
fi
ROOT=/mnt/c/Git/blingus-bardbook
for f in scripts/_ship-karaoke.sh api/karaoke.php js/karaoke-manager.js; do
  sed -i 's/\r$//' "$ROOT/$f" || true
done
rsync -av -e /tmp/ssh-fedora-pw \
  "$ROOT/scripts/_ship-karaoke.sh" \
  "$ROOT/api/karaoke.php" \
  "$ROOT/js/karaoke-manager.js" \
  cknospe@192.168.54.208:/tmp/blingus-karaoke-src/
/tmp/ssh-fedora-pw cknospe@192.168.54.208 'bash -lc "sed -i \"s/\\r$//\" /tmp/blingus-karaoke-src/_ship-karaoke.sh; cd /tmp/blingus-karaoke-src && bash _ship-karaoke.sh"'
