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

    # Static files
    location / {
        try_files $uri $uri/ =404;
    }
}
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

