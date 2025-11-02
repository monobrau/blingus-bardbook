# Nginx Configuration for Blingus Bardbook

Since you're using Nginx (not Apache), the `.htaccess` file won't work. You need to configure Nginx to execute PHP files.

## Required Nginx Configuration

Add this to your Nginx server block configuration file (usually in `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/`):

```nginx
server {
    listen 80;
    server_name blingus.knospe.org;
    root /var/www/html;
    index index.html;

    # PHP configuration - CRITICAL for API to work
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;  # or 127.0.0.1:9000
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Allow POST requests
        fastcgi_read_timeout 300;
    }

    # Allow all HTTP methods for API endpoints
    location /api/ {
        try_files $uri $uri/ =404;
        
        # Ensure PHP execution
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # Static files
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Steps to Fix

1. **Find your PHP-FPM socket:**
   ```bash
   # Check if PHP-FPM is running
   systemctl status php-fpm
   # or
   systemctl status php8.1-fpm  # adjust version
   
   # Find the socket path
   ls -la /var/run/php/
   # or check config
   grep "listen" /etc/php-fpm.d/www.conf
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

6. **Check PHP-FPM is running:**
   ```bash
   sudo systemctl status php-fpm
   # If not running:
   sudo systemctl start php-fpm
   ```

## Troubleshooting

- **405 Error**: Usually means Nginx isn't configured to execute PHP
- **File downloads**: PHP-FPM not configured or not running
- **Check PHP-FPM socket**: `ls -la /var/run/php/` to find correct path

## Quick Test

After configuring, test:
```bash
curl http://blingus.knospe.org/api/test.php
```

Should show PHP info, not download the file.

