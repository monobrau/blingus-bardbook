#!/bin/bash
set -e

CHROME="/usr/local/bin/google-chrome"
URL="http://localhost:8080/test/test-whats-new-banner.html"
ARTIFACTS="/opt/cursor/artifacts"

echo "Capturing screenshots with Chrome..."

# Desktop view
echo "1. Desktop view (1200x800)"
$CHROME --headless --disable-gpu --screenshot="$ARTIFACTS/whats-new-desktop-temp.png" \
  --window-size=1200,800 \
  --virtual-time-budget=3000 \
  "$URL" 2>/dev/null

# Mobile view
echo "2. Mobile view (390x844)"
$CHROME --headless --disable-gpu --screenshot="$ARTIFACTS/whats-new-mobile-temp.png" \
  --window-size=390,844 \
  --virtual-time-budget=3000 \
  "$URL" 2>/dev/null

echo "Screenshots captured to $ARTIFACTS/"
ls -lh "$ARTIFACTS/"whats-new-*.png
