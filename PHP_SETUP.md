# PHP-FPM Setup for Nginx

Your server doesn't have PHP-FPM installed. This is required for Nginx to execute PHP files.

## Step 1: Check PHP Installation

```bash
# Check if PHP is installed at all
php -v

# Check what PHP packages are installed
rpm -qa | grep php
# or for Debian/Ubuntu:
dpkg -l | grep php
```

## Step 2: Install PHP-FPM

### For Ubuntu Server 24.04:
```bash
# Update package list
sudo apt update

# Install PHP-FPM and required extensions
sudo apt install php-fpm php-cli php-json

# Check which PHP version was installed
php -v

# Enable and start PHP-FPM (service name depends on PHP version)
# For PHP 8.3 (default on Ubuntu 24.04):
sudo systemctl enable php8.3-fpm
sudo systemctl start php8.3-fpm

# Or check which version:
systemctl list-units | grep php-fpm
```

### For Fedora/RHEL/CentOS:
```bash
sudo dnf install php-fpm php-json
sudo systemctl enable php-fpm
sudo systemctl start php-fpm
```

## Step 3: Find PHP-FPM Socket

After installing, find the socket:
```bash
# Check service name
systemctl list-units | grep php

# Find socket location
ls -la /var/run/php/
# or
ls -la /run/php/

# Check config
sudo find /etc -name "*php*fpm*.conf" 2>/dev/null
```

Common socket paths (Ubuntu 24.04):
- `/run/php/php8.3-fpm.sock` (most common on Ubuntu 24.04)
- `/var/run/php/php8.3-fpm.sock`
- Or TCP: `127.0.0.1:9000`

To find your exact socket:
```bash
# Check PHP-FPM config
sudo grep "listen" /etc/php/8.3/fpm/pool.d/www.conf
# Should show: listen = /run/php/php8.3-fpm.sock
```

## Step 4: Configure Nginx

Edit your Nginx config:
```bash
sudo nano /etc/nginx/sites-available/blingus.knospe.org
# or wherever your site config is
```

Add this location block (Ubuntu 24.04 default socket):
```nginx
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;  # Ubuntu 24.04 default
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    # Allow POST requests
    fastcgi_read_timeout 300;
}
```

**Important:** Adjust `php8.3` to match your installed PHP version if different.

## Step 5: Test and Reload

```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify PHP-FPM is running
systemctl status php-fpm
```

## Step 6: Test PHP Execution

Browse to: `http://blingus.knospe.org/api/test.php`

Should show PHP info page, NOT download the file.

## Alternative: Check if PHP is Already Running Differently

If PHP is already installed but not as FPM:
```bash
# Check for other PHP services
systemctl list-units | grep php

# Check if mod_php is being used (unlikely with Nginx)
apache2 -M | grep php  # Won't work with Nginx
```

If you have PHP but not FPM, you'll need to install php-fpm specifically.

