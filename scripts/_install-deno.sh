#!/bin/bash
set -euo pipefail
export SSH_AUTH_SOCK=
ssh -o BatchMode=yes -o ConnectTimeout=15 -o IdentitiesOnly=yes -i ~/.ssh/id_rsa -o IPQoS=none cknospe@192.168.30.100 'bash -s' << 'EOS'
set -euo pipefail
if command -v deno >/dev/null 2>&1; then
  echo "deno already: $(deno --version | head -1)"
else
  cd /tmp
  rm -f deno.zip deno
  curl -fsSL -o deno.zip "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip"
  python3 -c "import zipfile; zipfile.ZipFile('/tmp/deno.zip').extractall('/tmp')"
  sudo -n install -m 0755 /tmp/deno /usr/local/bin/deno
  rm -f /tmp/deno.zip /tmp/deno
  echo "installed: $(deno --version | head -1)"
fi
echo ==== js runtimes as www-data ====
sudo -n -u www-data deno --version | head -1
sudo -n -u www-data yt-dlp --version
echo ==== retry tiny audio download ====
rm -f /tmp/k-test.*
timeout 45 sudo -n -u www-data yt-dlp -f 139 --no-playlist -o "/tmp/k-test.%(ext)s" "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
ls -l /tmp/k-test.*
rm -f /tmp/k-test.*
echo deno-download-ok
EOS
