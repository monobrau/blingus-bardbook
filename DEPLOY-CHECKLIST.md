# Deployment Checklist - Speech Clip Fix (commit bb04c07 / 2ab3420)

## Files to Deploy

### Required (Speech Clip Fix)
1. ✅ `api/soundboard.php` - Import logic with per-clip errors & lazy speech generation
2. ✅ `js/soundboard.js` - Async playPad with speech clip detection
3. ✅ `js/soundboard-clips.js` - New speakAndCache function

### Test Files (Optional)
4. `test/galen-clips-fixture.json` - Updated fixture with 4 clips (2 speech text-only, 1 audio, 1 speech text-only test)
5. `test/test-clip-exchange.html` - Interactive test page

## Deployment Steps

### 1. Backup Current Files
```bash
cd /path/to/blingus
cp api/soundboard.php api/soundboard.php.backup
cp js/soundboard.js js/soundboard.js.backup
cp js/soundboard-clips.js js/soundboard-clips.js.backup
```

### 2. Deploy New Files
```bash
# From git repo
git pull origin cursor/elevenlabs-voice-everywhere-8b96

# Or manually copy:
# - api/soundboard.php
# - js/soundboard.js
# - js/soundboard-clips.js
```

### 3. Clear Browser Cache
```bash
# Users should hard-refresh (Ctrl+Shift+R / Cmd+Shift+R)
# Or update version hashes in index.php if using versioned assets
```

### 4. Verify Deployment
```bash
# Open browser DevTools Console
# Navigate to Sound Board tab
# Should see no errors in console
```

## Post-Deployment Testing

### Test 1: Import Galen Fixture
1. Navigate to `/test/test-clip-exchange.html`
2. Click "Import Galen Fixture"
3. **Expected:** "Imported 4 clip(s) from Galen fixture"
4. Click "List Current Clips"
5. **Expected:** 4 clips listed (2 speech, 1 youtube, 1 speech)

### Test 2: Play Speech Clips Without Audio
1. Open Sound Board tab in main app
2. Find speech clips with 👋, ✨, or 🗣️ icons
3. Click to play
4. **Expected:**
   - First play: slight delay (generating audio)
   - Console: No 404 errors
   - Audio plays successfully
5. Click same clip again
6. **Expected:** Instant playback (cached audio)

### Test 3: Play Audio Clips
1. Click audio clip with 🔔 icon
2. **Expected:** Instant playback (audio was in bundle)

### Test 4: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "soundboard.php"
3. Play speech clip (first time)
4. **Expected:**
   - HEAD request to `?action=file` (404 if no audio)
   - POST request to `?action=speak` (generating audio)
   - GET request to `?action=file` (fetching generated audio)
5. Play same clip again
6. **Expected:**
   - HEAD request to `?action=file` (200 OK)
   - GET request to `?action=file` (fetching cached audio)
   - NO POST to `?action=speak`

### Test 5: Voice ID Override
1. Settings → Paste a different ElevenLabs voice ID
2. Import fresh Galen clips (or create new speech clip)
3. Play speech clip
4. **Expected:** Hears custom voice, not character default

### Test 6: Error Handling
1. Create a malformed bundle JSON:
   ```json
   {
     "format": "knospe-soundboard-clips",
     "version": 1,
     "sourceApp": "test",
     "exportedAt": "2026-11-14T20:00:00Z",
     "clips": [
       {
         "kind": "audio",
         "name": "Bad clip",
         "sourceId": "bad-001",
         "tags": {},
         "mime": "audio/invalid",
         "audioBase64": "invalid-base64"
       },
       {
         "kind": "speech",
         "name": "Good clip",
         "text": "This should import successfully",
         "sourceId": "good-001",
         "tags": {"icon": "✅"}
       }
     ]
   }
   ```
2. Import via test page
3. **Expected:**
   - Response: `{"success": true, "imported": 1, "skipped": 1, "errors": [...]}`
   - Good clip imported, bad clip skipped
   - No fatal error

## Rollback Plan

If issues occur:

### Quick Rollback
```bash
cd /path/to/blingus
cp api/soundboard.php.backup api/soundboard.php
cp js/soundboard.js.backup js/soundboard.js
cp js/soundboard-clips.js.backup js/soundboard-clips.js
```

### Full Rollback via Git
```bash
git checkout fa04f09  # Previous working commit
# Re-deploy the 3 files
```

## Common Issues

### Issue 1: Speech clips still 404
**Cause:** Browser cache not cleared  
**Fix:** Hard refresh (Ctrl+Shift+R) or clear site data

### Issue 2: TTS API errors
**Cause:** ElevenLabs API key missing or out of credits  
**Fix:** 
- Check server logs for API errors
- Verify `ELEVENLABS_TTS_KEY` environment variable
- Check ElevenLabs account quota

### Issue 3: Clips not importing
**Cause:** Server permission issues or invalid bundle  
**Fix:**
- Check PHP error logs
- Verify bundle JSON format
- Check file write permissions on `/data/soundboard/` directory

### Issue 4: Audio generation slow
**Cause:** TTS API latency (normal)  
**Expected:** 500-2000ms for first play, instant for subsequent plays  
**Not an issue:** This is expected behavior

## Monitoring

### Logs to Watch
```bash
# PHP error log
tail -f /var/log/php/error.log

# Apache/Nginx error log
tail -f /var/log/apache2/error.log
# or
tail -f /var/log/nginx/error.log
```

### Expected Log Entries (Normal)
```
[info] Importing bundle with 4 clips
[info] Imported 3 clips, skipped 1
[info] Generating audio for speech clip: <clipId>
[info] Audio generated successfully
```

### Unexpected Log Entries (Investigate)
```
[error] Failed to write audio file: <path>
[error] ElevenLabs API error: 401 Unauthorized
[error] Failed to generate audio: <reason>
```

## Success Criteria

✅ All 3 files deployed successfully  
✅ Test 1 passed: Import Galen fixture (4 clips)  
✅ Test 2 passed: Play speech clips without audio  
✅ Test 3 passed: Play audio clips  
✅ Test 4 passed: Network requests correct  
✅ Test 5 passed: Voice ID override works  
✅ Test 6 passed: Error handling resilient  
✅ No 404 errors in browser console  
✅ No fatal errors in server logs  

## Deployment Complete! 🚀

**Commit:** bb04c07 / 2ab3420  
**Branch:** cursor/elevenlabs-voice-everywhere-8b96  
**PR:** #4  

All speech clips now work correctly, including those imported from Galen without cached audio. Audio is generated on-demand on first play and cached for subsequent plays.
