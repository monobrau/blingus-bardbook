#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
DEST=cknospe@192.168.30.100
ROOT=/var/www/html
STAGE=/tmp/blingus-karaoke
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "mkdir -p $STAGE $ROOT/api $ROOT/js"
copy() {
  local src="$1"
  local name
  name="$(basename "$src")"
  gzip -c -- "$src" > "/tmp/${name}.gz"
  scp -o BatchMode=yes -o ConnectTimeout=20 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "/tmp/${name}.gz" "$DEST:$STAGE/${name}.gz"
}
copy karaoke.php
copy karaoke-manager.js
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "bash -s" << EOS
set -euo pipefail
gzip -dc $STAGE/karaoke.php.gz > $ROOT/api/karaoke.php
gzip -dc $STAGE/karaoke-manager.js.gz > $ROOT/js/karaoke-manager.js
php -l $ROOT/api/karaoke.php
grep -q "ytdlpJsRuntimeArgs" $ROOT/api/karaoke.php
grep -q "Download failed: " $ROOT/js/karaoke-manager.js
echo shipped-karaoke
EOS
