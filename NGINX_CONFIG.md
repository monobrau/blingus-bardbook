# Nginx Configuration for Blingus Bardbook

Since you're using Nginx (not Apache), the `.htaccess` file won't work. You need to configure Nginx to execute PHP files.

## Required Nginx Configuration

Add this to your Nginx server block configuration file (usually in `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/`):

```nginx
server {
    listen 80;
    server_name blingus.knospe.org;
    root /var/www/html;
    index index.php index.html;

    # PHP configuration - CRITICAL for API to work
    # Ubuntu 24.04 default: unix:/run/php/php8.3-fpm.sock
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;  # Ubuntu 24.04 default
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Allow POST requests and long karaoke downloads (yt-dlp)
        fastcgi_read_timeout 900;
        fastcgi_send_timeout 900;
    }

    # Karaoke API — extended timeouts for search/download
    location = /api/karaoke.php {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index karaoke.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 900;
        fastcgi_send_timeout 900;
    }

    # Allow all HTTP methods for API endpoints
    location /api/ {
        try_files $uri $uri/ =404;
        
        # Ensure PHP execution
        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.3-fpm.sock;  # Ubuntu 24.04 default
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
            fastcgi_read_timeout 900;
        }
    }

    # Local karaoke files (optional direct serve; streaming uses karaoke.php)
    location /data/karaoke/ {
        internal;
        alias /var/www/html/data/karaoke/;
    }

    # Static files - cache CSS/JS with version query params
    location ~ \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        # Version query params (?v=timestamp) will bust cache automatically
    }

    # Compression — the scene data files are large but highly repetitive text.
    # gzip takes the JS payload from ~7.6MB down to ~0.9MB over the wire.
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types
        text/plain text/css text/javascript
        application/javascript application/json application/xml
        image/svg+xml;

    # Optional: Brotli compresses even better (~0.6MB) if the module is built in.
    # Requires nginx built/loaded with ngx_brotli. Safe to omit if unavailable.
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

    # Static files
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Scene data lazy loading

`js/data/scene-outcomes.js` is now a small core file (scene metadata + a
scene→file manifest). The per-scene outcome lines live in
`js/data/scenes/<slug>.js` and are fetched on demand by `action-workflow.js`
the first time a player drills into that scene. No special Nginx config is
needed — they're served as normal static `.js` (and benefit from the gzip block
and the 1-year cache + `?v=` busting above).

## Apply compression

```bash
sudo nano /etc/nginx/sites-available/blingus.knospe.org   # add the gzip block
sudo nginx -t
sudo systemctl reload nginx

# Verify gzip is active on the data files:
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download} bytes\n' \
  -D - https://blingus.knospe.org/js/data/scenes/village.js | grep -i content-encoding
```

## Steps to Fix

1. **Find your PHP-FPM socket (Ubuntu 24.04):**
   ```bash
   # Check if PHP-FPM is running
   systemctl status php8.3-fpm  # Ubuntu 24.04 default
   
   # Find the socket path
   ls -la /run/php/
   # Should show: php8.3-fpm.sock
   
   # Or check config
   sudo grep "listen" /etc/php/8.3/fpm/pool.d/www.conf
   # Should show: listen = /run/php/php8.3-fpm.sock
   ```

2. **Edit your Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/blingus.knospe.org
   # or wherever your site config is
   ```

3. **Add the PHP location block** (see above)

4. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

5. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

6. **Check PHP-FPM is running (Ubuntu 24.04):**
   ```bash
   sudo systemctl status php8.3-fpm
   # If not running:
   sudo systemctl start php8.3-fpm
   sudo systemctl enable php8.3-fpm  # enable on boot
   ```

## Troubleshooting

- **405 Error**: Usually means Nginx isn't configured to execute PHP
- **File downloads**: PHP-FPM not configured or not running
- **Check PHP-FPM socket (Ubuntu 24.04)**: `ls -la /run/php/` to find correct path (usually `php8.3-fpm.sock`)
- **Socket mismatch**: Make sure the socket path in Nginx config matches what PHP-FPM is using

## Quick Test

After configuring, test:
```bash
curl http://blingus.knospe.org/api/test.php
```

Should show PHP info, not download the file.

## Karaoke (test/revamp branch)

Requires **yt-dlp** and **ffmpeg** on the host. See [KARAOKE_SETUP.md](KARAOKE_SETUP.md).

```bash
# Verify karaoke API
curl "https://blingus.knospe.org/api/karaoke.php?action=ping"

# Docker alternative (Portainer on blingus.dorks.lan)
docker compose up -d --build
```

Ensure `data/karaoke/` is writable by the web server user.

