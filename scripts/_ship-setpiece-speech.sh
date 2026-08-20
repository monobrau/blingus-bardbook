#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
DEST=cknospe@192.168.30.100
ROOT=/var/www/html
STAGE=/tmp/blingus-setpiece
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "mkdir -p $STAGE $ROOT/js $ROOT/api"
copy() {
  local src="$1"
  local name
  name="$(basename "$src")"
  gzip -c -- "$src" > "/tmp/${name}.gz"
  scp -o BatchMode=yes -o ConnectTimeout=20 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "/tmp/${name}.gz" "$DEST:$STAGE/${name}.gz"
}
copy action-workflow.js
copy character-sheet.js
copy generate-outcome.php
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "bash -s" << EOS
set -euo pipefail
gzip -dc $STAGE/action-workflow.js.gz > $ROOT/js/action-workflow.js
gzip -dc $STAGE/character-sheet.js.gz > $ROOT/js/character-sheet.js
gzip -dc $STAGE/generate-outcome.php.gz > $ROOT/api/generate-outcome.php
php -l $ROOT/api/generate-outcome.php
grep -q "id: 'paulHarvey'" $ROOT/js/action-workflow.js
grep -q "id: 'pharmaAd'" $ROOT/js/action-workflow.js
grep -q "id: 'cliffhanger'" $ROOT/js/action-workflow.js
grep -q "id: 'travelBanter'" $ROOT/js/action-workflow.js
grep -q "id: 'eulogy'" $ROOT/js/action-workflow.js
grep -q "paulHarvey" $ROOT/api/generate-outcome.php
grep -q "pharmaAd" $ROOT/api/generate-outcome.php
echo shipped-setpiece-speech
EOS
