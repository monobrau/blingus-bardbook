# Deployment: Sound Clip Exchange Feature

## Overview

The sound clip exchange feature allows users to copy soundboard clips between Blingus and Galen apps. It supports:

- **Export/Import**: Download clips as JSON bundles and import them from files
- **Direct Send**: Copy clips directly to another app's inbox via shared directory
- **Incoming Clips**: View and import clips sent from other apps

## Files Changed

### Backend (PHP)
- `api/soundboard.php` - Added export/import endpoints and exchange directory logic

### Frontend (JavaScript)
- `js/soundboard-clip-manager.js` - New clip manager UI module
- `js/soundboard.js` - Added "Manage clips" button to soundboard toolbar
- `js/whats-new.js` - Added What's New entry for the feature

### Styling
- `styles.css` - Added styles for clip manager modal

### Assets
- `index.php` - Included new script in page load
- `test/galen-clips-fixture.json` - Test fixture for import validation

## Server Setup

### Required Environment Variable (Optional)

Set `SOUNDBOARD_EXCHANGE_DIR` to override the default shared directory path:

```bash
export SOUNDBOARD_EXCHANGE_DIR=/var/lib/knospe-soundboard-exchange
```

**Default**: `/var/lib/knospe-soundboard-exchange` (used if not set)

### Directory Structure

The exchange directory must exist and be writable by the web server:

```bash
# Create the exchange directory
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/blingus
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/galen

# Set ownership to web server user (adjust for your setup)
sudo chown -R www-data:www-data /var/lib/knospe-soundboard-exchange

# Set permissions
sudo chmod 755 /var/lib/knospe-soundboard-exchange
sudo chmod 755 /var/lib/knospe-soundboard-exchange/inbox
sudo chmod 775 /var/lib/knospe-soundboard-exchange/inbox/blingus
sudo chmod 775 /var/lib/knospe-soundboard-exchange/inbox/galen
```

### For Apache

If using Apache with a non-standard user:

```bash
# Find your Apache user
ps aux | grep apache2

# Then set ownership accordingly
sudo chown -R <apache-user>:<apache-group> /var/lib/knospe-soundboard-exchange
```

### For Nginx + PHP-FPM

```bash
# Check PHP-FPM user in /etc/php/8.x/fpm/pool.d/www.conf
# Usually www-data or nginx

sudo chown -R <php-fpm-user>:<php-fpm-group> /var/lib/knospe-soundboard-exchange
```

## Deployment Steps

1. **Deploy code files** to production server
2. **Set up exchange directory** (see above) if direct send feature is desired
3. **Test permissions**:
   ```bash
   # As web server user, test write access:
   sudo -u www-data touch /var/lib/knospe-soundboard-exchange/inbox/blingus/test.txt
   sudo -u www-data rm /var/lib/knospe-soundboard-exchange/inbox/blingus/test.txt
   ```

4. **Verify in browser**:
   - Open Sound Board tab
   - Click "Manage clips" button
   - Try Export/Import (works without exchange directory)
   - Check if "Copy to Galen" button appears (only if exchange directory is writable)

## Feature Behavior

### With Exchange Directory Available
- Users see "Copy to Galen" button in clip manager
- Sent clips appear in recipient's "Incoming clips" section
- Atomic write via temp file + rename ensures no partial bundles

### Without Exchange Directory
- Export/Import via file download/upload works normally
- "Copy to Galen" button is hidden
- No errors shown to user (graceful degradation)

## Security Notes

- Maximum bundle size: 25 MB (defined in `SB_EXCHANGE_MAX_BUNDLE_BYTES`)
- Allowed audio MIME types: `audio/mpeg`, `audio/mp3`, `audio/mp4`, `audio/m4a`, `audio/ogg`, `audio/opus`, `audio/webm`, `audio/wav`
- All clip labels and text are sanitized server-side
- Bundle filenames use random UUIDs to prevent collisions
- Path traversal protection via regex validation on app names and bundle IDs

## Testing

### Test Export/Import
1. Create some soundboard clips (YouTube, spoken, or sound effect)
2. Click "Manage clips"
3. Select clips and click "Export selected"
4. Download should start with filename like `blingus-clips-2026-11-14.json`
5. Click "Import from file" and select the downloaded file
6. Clips should be imported (duplicates skipped)

### Test with Galen Fixture
1. Click "Manage clips"
2. Click "Import from file"
3. Select `test/galen-clips-fixture.json`
4. Should import 3 clips: "Greetings from Galen", "Galen's wisdom", "Bell chime"

### Test Direct Send (requires exchange directory)
1. Ensure exchange directory is set up and writable
2. Create clips and click "Manage clips"
3. Select clips and click "Copy to Galen"
4. Toast should say "Sent X clip(s) to Galen"
5. In Galen app, click "Manage clips"
6. Should see "Incoming clips from Blingus" section at top
7. Click "Import" to add clips or "Discard" to remove bundle

## Troubleshooting

### "Copy to Galen" button doesn't appear
- Check exchange directory exists: `ls -la /var/lib/knospe-soundboard-exchange/`
- Check write permissions: `sudo -u www-data touch /var/lib/knospe-soundboard-exchange/test.txt`
- Check PHP error logs for permission denials

### Import fails
- Check bundle is valid JSON with correct format
- Verify bundle size is under 25 MB
- Check audio MIME types are in allowed list

### Direct send fails
- Verify both Blingus and Galen are configured with same exchange directory
- Check inbox subdirectories exist and are writable
- Look for `.tmp-*` files in inbox (indicates write succeeded but rename failed)

## Rollback

To disable the feature:

1. Remove "Manage clips" button by commenting out in `js/soundboard.js`
2. Or remove exchange directory to disable direct send only:
   ```bash
   sudo rm -rf /var/lib/knospe-soundboard-exchange
   ```

Export/Import functionality has no server-side dependencies and cannot be disabled without code changes.
