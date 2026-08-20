#!/bin/bash
# Run on webhost as cknospe (passwordless sudo). Shares Blingus OIDC client.
# Does not change the live Blingus oauth2-proxy or nginx site.
set -euo pipefail

SITES=(
  "vadania|vadania.knospe.org|Vadania's Trailbook|8084|4184|_oauth2_proxy_vadania"
  "brawn|brawn.knospe.org|Brawn's Brawlbook|8085|4185|_oauth2_proxy_brawn"
  "puck|puck.knospe.org|Puck's Surgebook|8086|4186|_oauth2_proxy_puck"
)

BLINGUS_CFG=/etc/oauth2-proxy/oauth2-proxy.cfg
TPL=/tmp/party-book-site.conf.tpl
TUNNEL=2b306e1d-699d-41c5-8d08-4cd52c2f5960

if [[ ! -f "$BLINGUS_CFG" ]]; then
  echo "missing $BLINGUS_CFG" >&2
  exit 1
fi

CLIENT_ID=$(sudo python3 -c "import pathlib,re; t=pathlib.Path('$BLINGUS_CFG').read_text(); print(re.search(r'client_id\\s*=\\s*\"([^\"]+)\"', t).group(1))")
CLIENT_SECRET=$(sudo python3 -c "import pathlib,re; t=pathlib.Path('$BLINGUS_CFG').read_text(); print(re.search(r'client_secret\\s*=\\s*\"([^\"]+)\"', t).group(1))")

for row in "${SITES[@]}"; do
  IFS='|' read -r SLUG HOST TITLE BPORT PPORT COOKIE <<<"$row"
  COOKIE_SECRET=$(python3 -c "import secrets,base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())")
  CFG="/etc/oauth2-proxy/oauth2-proxy-${SLUG}.cfg"
  sudo tee "$CFG" >/dev/null <<EOF
provider = "oidc"
provider_display_name = "Authentik"
oidc_issuer_url = "https://auth.knospe.org/application/o/blingus/"
scope = "openid profile email"
oidc_email_claim = "email"
insecure_oidc_allow_unverified_email = true

client_id = "${CLIENT_ID}"
client_secret = "${CLIENT_SECRET}"

redirect_url = "https://${HOST}/oauth2/callback"

upstreams = [
    "http://127.0.0.1:${BPORT}"
]

http_address = "127.0.0.1:${PPORT}"

cookie_name = "${COOKIE}"
cookie_secret = "${COOKIE_SECRET}"
cookie_secure = true
cookie_samesite = "lax"

email_domains = ["*"]
skip_provider_button = true

request_logging = true
auth_logging = true
standard_logging = true
EOF
  sudo chown root:www-data "$CFG"
  sudo chmod 640 "$CFG"

  sudo python3 - <<PY
from pathlib import Path
tpl = Path("$TPL").read_text()
out = (tpl
  .replace("{{SERVER_NAME}}", "$HOST")
  .replace("{{APP_TITLE}}", "$TITLE")
  .replace("{{BACKEND_PORT}}", "$BPORT")
  .replace("{{PROXY_PORT}}", "$PPORT"))
Path("/tmp/${SLUG}.nginx").write_text(out)
PY
  sudo cp "/tmp/${SLUG}.nginx" "/etc/nginx/sites-available/${SLUG}"
  sudo ln -sfn "/etc/nginx/sites-available/${SLUG}" "/etc/nginx/sites-enabled/${SLUG}"

  sudo tee "/etc/systemd/system/oauth2-proxy-${SLUG}.service" >/dev/null <<EOF
[Unit]
Description=oauth2-proxy for ${HOST}
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
ExecStart=/usr/local/bin/oauth2-proxy --config=/etc/oauth2-proxy/oauth2-proxy-${SLUG}.cfg
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
done

# Cloudflare ingress: add hostnames before the catch-all
sudo python3 - <<'PY'
from pathlib import Path
p = Path("/etc/cloudflared/config.yml")
text = p.read_text()
needed = [
    "vadania.knospe.org",
    "brawn.knospe.org",
    "puck.knospe.org",
]
block = ""
for host in needed:
    if f"hostname: {host}" not in text:
        block += f"  - hostname: {host}\n    service: http://localhost:80\n"
if block:
    needle = "  - service: http_status:404"
    if needle not in text:
        raise SystemExit("cloudflared catch-all not found")
    p.write_text(text.replace(needle, block + needle))
    print("cloudflared: added hostnames")
else:
    print("cloudflared: hostnames already present")
PY

sudo nginx -t
sudo systemctl daemon-reload
for slug in vadania brawn puck; do
  sudo systemctl enable --now "oauth2-proxy-${slug}.service"
done
sudo systemctl reload nginx
sudo systemctl restart cloudflared

echo "route dns if missing:"
for host in vadania.knospe.org brawn.knospe.org puck.knospe.org; do
  sudo cloudflared tunnel route dns "$TUNNEL" "$host" || true
done

echo INSTALL_OK
systemctl is-active oauth2-proxy-vadania oauth2-proxy-brawn oauth2-proxy-puck nginx cloudflared
