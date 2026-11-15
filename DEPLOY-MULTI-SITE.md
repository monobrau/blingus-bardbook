# Multi-Site Sound Board Deployment Guide

## Overview

This deployment adds per-app clip exchange, per-character default voices, and favorites infrastructure to support 4 hostname variants: blingus, vadania, brawn/bruck, and puck.

## Pre-Deployment Checklist

- [ ] Review all changed files
- [ ] Test on staging if available
- [ ] Backup `/data/soundboard/` directory
- [ ] Verify `/var/lib/knospe-soundboard-exchange` permissions

## Server Setup Steps

### 1. Create Inbox Directories

**CRITICAL: Must be done BEFORE deployment**

```bash
# Create inbox directories for all apps
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/blingus
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/vadania
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/brawn
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/puck
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/galen

# Set ownership to web server user (web-php on this server)
sudo chown -R web-php:web-php /var/lib/knospe-soundboard-exchange

# Set permissions (0770 for web-php access)
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/blingus
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/vadania
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/brawn
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/puck
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/galen

# Verify
ls -la /var/lib/knospe-soundboard-exchange/inbox/
```

**Expected output:**
```
drwxrwx--- 2 web-php web-php 4096 Nov 15 18:00 blingus
drwxrwx--- 2 web-php web-php 4096 Nov 15 18:00 vadania
drwxrwx--- 2 web-php web-php 4096 Nov 15 18:00 brawn
drwxrwx--- 2 web-php web-php 4096 Nov 15 18:00 puck
drwxrwx--- 2 web-php web-php 4096 Nov 15 18:00 galen
```

### 2. Existing Bundles (Backward Compatibility)

Existing bundles in `/var/lib/knospe-soundboard-exchange/inbox/blingus/` will continue to work when accessed from blingus.knospe.org.

No migration needed.

### 3. Favorites Storage

Favorites directories will be auto-created by PHP on first save:
- `/data/soundboard/blingus/favorites/blingus/`
- `/data/soundboard/vadania/favorites/vadania/`
- `/data/soundboard/bruck/favorites/brawn/`
- `/data/soundboard/puck/favorites/puck/`

**Note:** Character `bruck` stores favorites under app ID `brawn`.

Ensure `/data/soundboard/` is writable:
```bash
sudo chown -R web-php:web-php /data/soundboard
sudo chmod 755 /data/soundboard
```

## Files to Deploy

### Backend
- `api/soundboard.php` - All changes (app ID, voices, favorites, exchange)

### Frontend
- `js/soundboard-clip-manager.js` - App picker, dynamic app ID
- `js/whats-new.js` - Multi-site entry
- `styles.css` - App picker dropdown styles

### Config
- `index.php` - Version bumps

### Documentation
- `MULTI-SITE-IMPLEMENTATION.md`
- `PROGRESS-REPORT.md`
- `DEPLOY-MULTI-SITE.md` (this file)

## Deployment Steps

### 1. Deploy Files

```bash
# SSH to server
ssh user@server

# Navigate to web root
cd /var/www/html

# Backup current files
sudo cp api/soundboard.php api/soundboard.php.backup-$(date +%Y%m%d-%H%M%S)
sudo cp js/soundboard-clip-manager.js js/soundboard-clip-manager.js.backup-$(date +%Y%m%d-%H%M%S)
sudo cp js/whats-new.js js/whats-new.js.backup-$(date +%Y%m%d-%H%M%S)
sudo cp styles.css styles.css.backup-$(date +%Y%m%d-%H%M%S)
sudo cp index.php index.php.backup-$(date +%Y%m%d-%H%M%S)

# Deploy new files (method depends on your deployment process)
# Option A: Git pull
sudo git pull origin cursor/elevenlabs-voice-everywhere-8b96

# Option B: scp/rsync
# (run from local machine)
scp api/soundboard.php user@server:/var/www/html/api/
scp js/soundboard-clip-manager.js user@server:/var/www/html/js/
scp js/whats-new.js user@server:/var/www/html/js/
scp styles.css user@server:/var/www/html/
scp index.php user@server:/var/www/html/

# Set permissions
sudo chown -R web-php:web-php /var/www/html
sudo chmod 644 /var/www/html/api/soundboard.php
sudo chmod 644 /var/www/html/js/*.js
sudo chmod 644 /var/www/html/styles.css
sudo chmod 644 /var/www/html/index.php
```

### 2. Verify Permissions

```bash
# Check soundboard data directory
ls -la /data/soundboard/
sudo chown -R web-php:web-php /data/soundboard

# Check exchange directory
ls -la /var/lib/knospe-soundboard-exchange/inbox/
```

### 3. Clear PHP OpCache (if enabled)

```bash
# If using PHP-FPM
sudo systemctl reload php8.2-fpm

# Or manually clear
php -r "opcache_reset();"
```

## Post-Deployment Testing

### Test 1: App ID Detection

Visit each hostname and check the console or network tab:

**blingus.knospe.org:**
```bash
curl -s "https://blingus.knospe.org/api/soundboard.php?action=ping&character=blingus" | jq '.appId, .availableApps'
```
Expected:
```json
"blingus"
["galen", "vadania", "brawn", "puck"]
```

**vadania.knospe.org:**
```bash
curl -s "https://vadania.knospe.org/api/soundboard.php?action=ping&character=vadania" | jq '.appId, .availableApps'
```
Expected:
```json
"vadania"
["blingus", "galen", "brawn", "puck"]
```

**brawn.knospe.org:**
```bash
curl -s "https://brawn.knospe.org/api/soundboard.php?action=ping&character=bruck" | jq '.appId, .availableApps'
```
Expected:
```json
"brawn"
["blingus", "galen", "vadania", "puck"]
```

**puck.knospe.org:**
```bash
curl -s "https://puck.knospe.org/api/soundboard.php?action=ping&character=puck" | jq '.appId, .availableApps'
```
Expected:
```json
"puck"
["blingus", "galen", "vadania", "brawn"]
```

### Test 2: Inbox Isolation

1. Visit blingus.knospe.org → Sound Board → Manage clips
2. Create a test clip
3. Select it → Copy to → Vadania → Send
4. Visit vadania.knospe.org → Sound Board → Manage clips
5. Should see "Incoming clips from Blingus"
6. Import clip
7. Verify clip appears in Vadania's board

### Test 3: Voice Defaults

**Blingus (George voice):**
```bash
curl -s "https://blingus.knospe.org/api/soundboard.php?action=ping&character=blingus" | jq '.speech'
```
Should return `true`

Create a speech clip from blingus.knospe.org and verify it uses the George voice.

**Repeat for:**
- Vadania → Charlotte
- Brawn → Clyde
- Puck → Dorothy

### Test 4: What's New Banner

1. Visit any of the 4 sites
2. Should see What's New banner with multi-site enhancements
3. Content should be per-character:
   - Blingus: "Your Bardbook Sound Board now works per-site."
   - Vadania: "Your Trailbook Sound Board now works per-site."
   - Brawn: "Your Brawlbook Sound Board now works per-site."
   - Puck: "Your Surgebook Sound Board now works per-site."

### Test 5: App Picker

1. Visit any site → Sound Board → Manage clips
2. Create test clips
3. Select clips
4. Should see "Copy to: [dropdown]" with all other apps
5. Blingus should NOT see blingus in dropdown
6. Vadania should NOT see vadania in dropdown
7. Etc.

### Test 6: Category Management (Existing Feature)

1. Visit Sound Board → Categories button
2. Should still work as before
3. Create/edit/delete categories
4. Assign clips to categories

### Test 7: Favorites API (Backend Only)

Favorites UI is not yet implemented, but the API should work:

```bash
# Save a favorite (replace with actual data)
curl -X POST "https://blingus.knospe.org/api/soundboard.php?action=saveFavorite&character=blingus" \
  -H "Content-Type: application/json" \
  -d '{"outcomeId": "test-outcome", "audioBase64": "<base64-mp3-data>"}'

# List favorites
curl -s "https://blingus.knospe.org/api/soundboard.php?action=listFavorites&character=blingus"

# Verify storage
ls -la /data/soundboard/blingus/favorites/blingus/
```

## Rollback Plan

If issues occur:

```bash
# Restore backups
sudo cp api/soundboard.php.backup-YYYYMMDD-HHMMSS api/soundboard.php
sudo cp js/soundboard-clip-manager.js.backup-YYYYMMDD-HHMMSS js/soundboard-clip-manager.js
sudo cp js/whats-new.js.backup-YYYYMMDD-HHMMSS js/whats-new.js
sudo cp styles.css.backup-YYYYMMDD-HHMMSS styles.css
sudo cp index.php.backup-YYYYMMDD-HHMMSS index.php

# Reload PHP-FPM
sudo systemctl reload php8.2-fpm

# Clear browser cache
# Tell users to hard refresh (Ctrl+Shift+R)
```

## Known Limitations

1. **Category Dropdowns** - Not yet implemented
   - Categories work but still use free-text input
   - Bulk category assignment works in Manage clips
   - Follow-up PR planned

2. **Favorites UI** - Not yet implemented
   - Backend API complete and tested
   - Frontend UI needed in outcome-generate.js
   - Follow-up PR planned

3. **Exchange Directory** - Must pre-exist
   - No auto-creation (security feature)
   - Clear error if inbox missing
   - Root must create directories with 0770

## Success Criteria

✅ App ID detected correctly on all 4 sites
✅ Inbox isolation works (each site has own inbox)
✅ App picker shows all other apps (not self)
✅ Voice defaults work per character
✅ What's New banner shows with per-character wording
✅ Existing clips and categories continue to work
✅ No PHP errors in logs
✅ Exchange between sites works

## Monitoring

Watch for:
- PHP error logs: `/var/log/php/error.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Exchange directory permission issues
- Missing inbox errors in UI

## Contact

If issues arise:
1. Check logs first
2. Verify inbox directory permissions
3. Test API endpoints with curl
4. Review this deployment guide
5. Rollback if necessary

## Summary

**What Changed:**
- Per-app clip exchange (each site has own inbox)
- Per-character default voices (Blingus, Vadania, Brawn, Puck)
- Favorites backend (API complete, UI TODO)
- App picker dropdown (replaces "Copy to Galen")

**What Didn't Change:**
- Existing category system still works
- All existing clips and data preserved
- Backward compatible with existing bundles

**What's Next:**
- Category dropdowns (follow-up PR)
- Favorites UI (follow-up PR)
