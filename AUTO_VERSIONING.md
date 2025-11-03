# Auto-Versioning Cache-Busting System

## Overview

This system automatically generates cache-busting version numbers based on file modification times. When you update `script.js` or `styles.css`, the version numbers automatically change, forcing browsers to load fresh files.

## How It Works

1. **index.php** - Uses PHP to read file modification times (`filemtime()`) for `script.js` and `styles.css`
2. **version.php** - API endpoint that returns current version numbers as JSON (useful for debugging)
3. Every time a file is modified (e.g., after `git pull`), the modification time changes, generating a new version number

## Setup

### On Web Server (Nginx)

1. **Update Nginx config** to prefer `index.php` over `index.html`:
   ```nginx
   index index.php index.html;
   ```

2. **Ensure PHP is configured** (already done per NGINX_CONFIG.md)

3. **Test the setup**:
   ```bash
   curl http://your-domain/version.php
   # Should return JSON with script and styles version numbers
   ```

### Local Development

- `index.html` still works for local development (no PHP needed)
- On the server, `index.php` automatically takes precedence

## Benefits

- ✅ **Automatic**: No manual version bumping needed
- ✅ **Reliable**: File modification time is always accurate
- ✅ **Permanent**: Works every time you pull updates
- ✅ **Backward Compatible**: `index.html` still works locally

## Example

After pulling updates:
```bash
git pull
# script.js modified at timestamp 1735689600
# Browser requests: script.js?v=1735689600
# Next update: script.js modified at timestamp 1735689700
# Browser requests: script.js?v=1735689700 (new version!)
```

## Troubleshooting

- **Version not updating?** Check file permissions - PHP needs read access
- **404 on index.php?** Ensure Nginx `index` directive includes `index.php`
- **Check versions**: Visit `/version.php` to see current version numbers

