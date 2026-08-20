#!/bin/bash
set -euo pipefail
export DISPLAY=:0
if [ -z "${BLINGUS_PW:-}" ]; then
  echo "BLINGUS_PW is not set" >&2
  exit 1
fi
for f in scripts/_ship-personalities.sh js/outcome-generate.js api/generate-outcome.php; do
  sed -i 's/\r$//' "/mnt/c/Git/blingus-bardbook/$f" || true
done
rsync -av -e /tmp/ssh-fedora-pw \
  /mnt/c/Git/blingus-bardbook/scripts/_ship-personalities.sh \
  /mnt/c/Git/blingus-bardbook/js/outcome-generate.js \
  /mnt/c/Git/blingus-bardbook/api/generate-outcome.php \
  cknospe@192.168.54.208:/tmp/blingus-voices-src/
/tmp/ssh-fedora-pw cknospe@192.168.54.208 'bash -lc "sed -i \"s/\\r$//\" /tmp/blingus-voices-src/_ship-personalities.sh; cd /tmp/blingus-voices-src && bash _ship-personalities.sh"'
