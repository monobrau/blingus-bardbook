#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
DEST=cknospe@192.168.30.100
ROOT=/var/www/html
STAGE=/tmp/blingus-sheet-import
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "mkdir -p $STAGE $ROOT/js"
copy() {
  local src="$1"
  local name
  name="$(basename "$src")"
  gzip -c -- "$src" > "/tmp/${name}.gz"
  scp -o BatchMode=yes -o ConnectTimeout=20 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "/tmp/${name}.gz" "$DEST:$STAGE/${name}.gz"
}
copy character-sheet.js
copy ddb-sheet-import.js
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "bash -s" << EOS
set -euo pipefail
gzip -dc $STAGE/character-sheet.js.gz > $ROOT/js/character-sheet.js
gzip -dc $STAGE/ddb-sheet-import.js.gz > $ROOT/js/ddb-sheet-import.js
grep -q "importedSheet" $ROOT/js/character-sheet.js
grep -q "sheetLooksPopulated" $ROOT/js/ddb-sheet-import.js
echo shipped-sheet-import
EOS
