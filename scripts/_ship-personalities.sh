#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
DEST=cknospe@192.168.30.100
ROOT=/var/www/html
STAGE=/tmp/blingus-voices
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "mkdir -p $STAGE"
for rel in outcome-generate.js generate-outcome.php; do
  src="$rel"
  if [ ! -f "$src" ] && [ -f "js/$rel" ]; then src="js/$rel"; fi
  if [ ! -f "$src" ] && [ -f "api/$rel" ]; then src="api/$rel"; fi
  gzip -c -- "$src" > "/tmp/${rel}.gz"
  scp -o BatchMode=yes -o ConnectTimeout=20 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "/tmp/${rel}.gz" "$DEST:$STAGE/${rel}.gz"
done
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "bash -s" << EOS
set -euo pipefail
gzip -dc $STAGE/outcome-generate.js.gz > $ROOT/js/outcome-generate.js
gzip -dc $STAGE/generate-outcome.php.gz > $ROOT/api/generate-outcome.php
php -l $ROOT/api/generate-outcome.php
grep -q DEFAULT_PERSONALITY_VADANIA $ROOT/js/outcome-generate.js
grep -q 'Fairy-twin insult bit with Puck' $ROOT/js/outcome-generate.js
grep -q 'Fairy-twin insult bit with Blingus' $ROOT/js/outcome-generate.js
grep -q 'Fairy-twin insult bit' $ROOT/api/generate-outcome.php
grep -q 'Oh well!' $ROOT/js/outcome-generate.js
grep -q 'Oh well!' $ROOT/api/generate-outcome.php
grep -q meanwhileHabits $ROOT/api/generate-outcome.php
echo shipped
EOS
