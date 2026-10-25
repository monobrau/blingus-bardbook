# Quick Setup Steps for Ubuntu Server 24.04

## Step 1: Find Your Nginx Config File

Run these commands on your web server to find where your site config is:

```bash
# Option 1: Look in sites-available (most common)
ls -la /etc/nginx/sites-available/

# Option 2: Look in conf.d
ls -la /etc/nginx/conf.d/

# Option 3: Search for your domain name
sudo grep -r "blingus.knospe.org" /etc/nginx/

# Option 4: Check main config includes
cat /etc/nginx/nginx.conf | grep include
```

## Step 2: Edit the Config File

Once you find your config file (probably something like `/etc/nginx/sites-available/blingus.knospe.org` or `/etc/nginx/sites-available/default`):

```bash
sudo nano /etc/nginx/sites-available/blingus.knospe.org
# or whatever file you found above
```

## Step 3: Add PHP Support

Inside the `server { }` block, add this PHP location block (usually after the `root` directive):

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    fastcgi_read_timeout 300;
}
```

**Important:** Put this INSIDE your existing `server { }` block, NOT outside it!

## Step 4: Save and Test

After editing:
1. Press `Ctrl+X` to exit nano
2. Press `Y` to save
3. Press `Enter` to confirm

Then test:
```bash
sudo nginx -t
```

If it says "test is successful", reload:
```bash
sudo systemctl reload nginx
```

## Step 5: Verify PHP-FPM is Running

```bash
sudo systemctl status php8.3-fpm
```

If it's not running:
```bash
sudo systemctl start php8.3-fpm
sudo systemctl enable php8.3-fpm
```

## Example: What Your Config Might Look Like

```nginx
server {
    listen 80;
    server_name blingus.knospe.org;
    root /var/www/html;
    index index.html;

    # Add this block for PHP support:
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    # Your existing location blocks...
    location / {
        try_files $uri $uri/ =404;
    }
}
```

