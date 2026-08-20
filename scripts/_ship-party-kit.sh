#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
DEST=cknospe@192.168.30.100
ROOT=/var/www/html
STAGE=/tmp/blingus-party-kit
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "mkdir -p $STAGE $ROOT/js/data $ROOT/api"
copy() {
  local src="$1"
  local name
  name="$(basename "$src")"
  gzip -c -- "$src" > "/tmp/${name}.gz"
  scp -o BatchMode=yes -o ConnectTimeout=20 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "/tmp/${name}.gz" "$DEST:$STAGE/${name}.gz"
}
copy index.php
copy script.js
copy styles.css
copy character-sheet.js
copy action-workflow.js
copy outcome-generate.js
copy workflow-catalog.js
copy tab-navigation.js
copy keyboard-shortcuts.js
copy constants.js
copy site-identity.js
copy puck-fx.js
copy vadania-fx.js
copy brawn-fx.js
copy songs-data.js
copy class-lines-data.js
copy generate-outcome.php
copy blingus-data.php
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none "$DEST" "bash -s" << EOS
set -euo pipefail
gzip -dc $STAGE/index.php.gz > $ROOT/index.php
gzip -dc $STAGE/script.js.gz > $ROOT/script.js
gzip -dc $STAGE/styles.css.gz > $ROOT/styles.css
gzip -dc $STAGE/character-sheet.js.gz > $ROOT/js/character-sheet.js
gzip -dc $STAGE/action-workflow.js.gz > $ROOT/js/action-workflow.js
gzip -dc $STAGE/outcome-generate.js.gz > $ROOT/js/outcome-generate.js
gzip -dc $STAGE/workflow-catalog.js.gz > $ROOT/js/workflow-catalog.js
gzip -dc $STAGE/tab-navigation.js.gz > $ROOT/js/tab-navigation.js
gzip -dc $STAGE/keyboard-shortcuts.js.gz > $ROOT/js/keyboard-shortcuts.js
gzip -dc $STAGE/constants.js.gz > $ROOT/js/constants.js
gzip -dc $STAGE/site-identity.js.gz > $ROOT/js/site-identity.js
gzip -dc $STAGE/puck-fx.js.gz > $ROOT/js/puck-fx.js
gzip -dc $STAGE/vadania-fx.js.gz > $ROOT/js/vadania-fx.js
gzip -dc $STAGE/brawn-fx.js.gz > $ROOT/js/brawn-fx.js
gzip -dc $STAGE/songs-data.js.gz > $ROOT/js/data/songs-data.js
gzip -dc $STAGE/class-lines-data.js.gz > $ROOT/js/data/class-lines-data.js
gzip -dc $STAGE/generate-outcome.php.gz > $ROOT/api/generate-outcome.php
gzip -dc $STAGE/blingus-data.php.gz > $ROOT/api/blingus-data.php
php -l $ROOT/index.php
php -l $ROOT/api/generate-outcome.php
php -l $ROOT/api/blingus-data.php
grep -q personalityOwner $ROOT/js/outcome-generate.js
grep -q 'function moodsFor' $ROOT/js/outcome-generate.js
grep -q journal-steady $ROOT/js/outcome-generate.js
grep -q lineFitsSpeaker $ROOT/js/action-workflow.js
grep -q getClassCombatOptions $ROOT/js/character-sheet.js
grep -q "Hunter's Patience" $ROOT/js/data/class-lines-data.js
grep -q 'data.personalities' $ROOT/script.js
grep -q prevVoices $ROOT/api/blingus-data.php
grep -q bardSceneBan $ROOT/api/generate-outcome.php
test ! -e $ROOT/api/.anthropic_key || echo key-untouched
test -f $ROOT/data/blingus-data.json && echo data-untouched
echo shipped
EOS
