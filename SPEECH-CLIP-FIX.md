# Speech Clip Import Fix - Summary

## Issue

Speech clips imported from Galen (or any bundle) that have `kind: "speech"` with text but no `audioBase64` were being stored as clips pointing to non-existent audio files. When played, the pad would try to fetch a file that doesn't exist, resulting in a 404 error and no sound.

**Root Cause:** The import code stored speech clips with `source: 'speech'` but only wrote an audio file if `audioBase64` was present. The soundboard pad system assumed all clips had audio files at the file endpoint.

## Solution

Implemented **lazy audio generation** for speech clips without cached audio:

1. **Import Phase:** Speech clips without `audioBase64` are now stored with their text and optional voiceId, but no audio file is created initially.

2. **Play Phase:** When a speech clip is played:
   - Check if audio file exists (HEAD request)
   - If exists: play it directly
   - If not: generate audio on-demand via TTS API and cache it
   - Respects the user's pasted ElevenLabs voice ID

3. **Per-Clip Error Handling:** Import now continues even if individual clips fail, collecting errors for debugging.

## Technical Changes

### Backend (api/soundboard.php)

**1. Import Resilience**
```php
$imported = [];
$errors = [];

foreach ($clips as $clipIndex => $clipData) {
    try {
        // ... validation and import logic ...
    } catch (Exception $e) {
        $errors[] = "Clip $sourceId: " . $e->getMessage();
    }
}
```

**2. Speech Clips Without Audio**
- Now stored with `source: 'speech'` even without audio file
- `voiceId` field preserved from bundle
- Audio file created only if `audioBase64` present in bundle

**3. Error Reporting**
```php
return [
    'imported' => count($imported),
    'skipped' => count($clips) - count($imported),
    'errors' => $errors  // Optional, only if errors occurred
];
```

**4. Bundle-Level sourceApp**
- Uses `$bundle['sourceApp']` instead of per-clip sourceApp
- Matches spec: sourceApp is bundle-level metadata

### Frontend (js/soundboard.js)

**1. Enhanced Pad Metadata**
```javascript
function clipsToPads(characterId, clips) {
    return clips.map((clip) => ({
        // ... existing fields ...
        clipSource: clip.source || '',
        clipText: clip.title || '',
        clipVoiceId: clip.voiceId || '',
    }));
}
```

**2. Async Play with Lazy Generation**
```javascript
async function playPad(id) {
    const pad = pads().find((p) => p.id === id);
    
    // Handle speech clips specially
    if (pad.clipSource === 'speech' && pad.clipText && window.SoundboardClips) {
        try {
            const audioUrl = await window.SoundboardClips.speakAndCache(
                pad.characterId,
                pad.clipId,
                pad.clipText,
                pad.clipVoiceId
            );
            // Play generated/cached audio
            if (pad.loop) {
                loops[id] = playSrc(audioUrl, { loop: true });
            } else {
                playSrc(audioUrl);
            }
            return;
        } catch (e) {
            console.error('Speech generation failed:', e);
        }
    }
    
    // Fallback: play audio file directly
    // ...
}
```

### Frontend (js/soundboard-clips.js)

**New Function: speakAndCache**
```javascript
async function speakAndCache(characterId, clipId, text, clipVoiceId) {
    const url = fileUrl(characterId, clipId);
    
    // Check if audio file exists
    try {
        const checkRes = await fetch(url, { method: 'HEAD' });
        if (checkRes.ok) {
            return url;  // File exists, use it
        }
    } catch (e) {
        // File doesn't exist, generate it
    }
    
    // Generate audio via TTS API
    const vid = clipVoiceId || voiceId();  // Use clip voiceId or user's pasted voiceId
    const body = {
        action: 'speak',
        character: characterId,
        text: text,
        id: clipId,
    };
    
    if (vid) {
        body.voiceId = vid;
    }
    
    await apiPost(body);
    
    return url + '&t=' + Date.now();  // Cache-bust timestamp
}
```

**Exported Function**
```javascript
return {
    list: list,
    remove: remove,
    fileUrl: fileUrl,
    mount: mount,
    speakAndCache: speakAndCache,  // NEW
};
```

## Test Fixture Update

Updated `test/galen-clips-fixture.json` with 4 clips:

1. **Speech with text only** (no audio) - "Greetings from Galen"
2. **Favorite with text only** (no audio) - "Galen's wisdom"
3. **Audio with base64** - "Bell chime"
4. **NEW: Text-only speech test** - "This is a test of text-only speech import"

All clips with `audioBase64: null` will now generate audio on first play.

## Verification Steps

### 1. Import Galen Fixture
```bash
# In browser at /test/test-clip-exchange.html
# Click "Import Galen Fixture"
# Should see: "Imported 4 clip(s) from Galen fixture"
```

### 2. Check Imported Clips
```bash
# Click "List Current Clips"
# Should show 4 clips:
# - 👋 Greetings from Galen (speech)
# - ✨ Galen's wisdom (speech)
# - 🔔 Bell chime (youtube)
# - 🗣️ Text-only speech test (speech)
```

### 3. Play Speech Clips
```bash
# Open Sound Board tab
# Click on speech pads (👋, ✨, 🗣️)
# First play: slight delay (generating audio)
# Subsequent plays: instant (cached audio)
# Should hear speech in character voice (or custom pasted voice ID)
```

### 4. Verify No 404s
```bash
# Open browser DevTools Network tab
# Play speech clips
# No 404 errors on /api/soundboard.php?action=file
# Should see POST to /api/soundboard.php?action=speak on first play only
```

### 5. Test Voice ID Override
```bash
# Settings → paste a different ElevenLabs voice ID
# Import fresh Galen clips
# Play speech clips
# Should hear the custom voice, not character default
```

### 6. Test Per-Clip Errors
```bash
# Create malformed bundle (e.g., invalid MIME type for one clip)
# Import it
# Should see: "Imported X clip(s), skipped Y"
# Response includes errors array with details
```

## Error Scenarios Handled

### 1. Invalid Base64 Audio
```
Error: "Clip galen-001: invalid base64 audio"
Result: Clip skipped, others imported
```

### 2. Audio Too Large
```
Error: "Clip galen-002: audio too large"
Result: Clip skipped, others imported
```

### 3. Unsupported MIME Type
```
Error: "Clip galen-003: unsupported MIME type"
Result: Clip skipped, others imported
```

### 4. Empty Text (speech clips)
```
Error: "Clip galen-004: empty text after cleaning"
Result: Clip skipped, others imported
```

### 5. Missing Required Data
```
Error: "Clip galen-005: audio kind requires audioBase64"
Result: Clip skipped, others imported
```

### 6. File Write Failure
```
Error: "Clip galen-006: failed to write audio file"
Result: Clip skipped, others imported
```

## Behavioral Changes

### Before Fix
- ❌ Speech clips without audio → 404 on play
- ❌ One bad clip → entire bundle rejected
- ❌ No error details returned

### After Fix
- ✅ Speech clips without audio → generated on first play
- ✅ One bad clip → rest of bundle imported
- ✅ Error details returned in response
- ✅ Respects user's pasted voice ID
- ✅ Uses clip's voiceId if provided
- ✅ Caches generated audio for subsequent plays

## API Response Changes

### Import Response (Before)
```json
{
  "success": true,
  "imported": 2,
  "skipped": 1
}
```

### Import Response (After)
```json
{
  "success": true,
  "imported": 2,
  "skipped": 1,
  "errors": [
    "Clip galen-003: unsupported MIME type"
  ]
}
```

The `errors` field is **optional** and only present when errors occurred.

## Files Changed

1. **api/soundboard.php**
   - Added per-clip error handling
   - Speech clips without audio now stored with text
   - Bundle-level sourceApp used for all clips
   - Error array returned in import response

2. **js/soundboard.js**
   - Enhanced pad metadata (clipSource, clipText, clipVoiceId)
   - Made playPad async
   - Speech clip detection and lazy generation

3. **js/soundboard-clips.js**
   - New `speakAndCache` function
   - HEAD request to check file existence
   - Generate audio via TTS API if missing
   - Cache-busting timestamp

4. **test/galen-clips-fixture.json**
   - Added 4th clip: text-only speech test
   - All speech clips have `audioBase64: null`

## Deployment Files

Deploy these updated files:

1. `api/soundboard.php` - Backend import logic
2. `js/soundboard.js` - Pad play logic
3. `js/soundboard-clips.js` - Lazy generation
4. `test/galen-clips-fixture.json` - Updated test fixture

**No server configuration changes needed.**

## Voice ID Priority

When playing a speech clip without audio:

1. **Clip voiceId** (if present in bundle) - highest priority
2. **User's pasted voiceId** (from localStorage) - fallback
3. **Character default voice** (server-side fallback) - last resort

This matches the existing voice ID behavior for all speech features.

## Performance Considerations

### First Play (No Cached Audio)
- HEAD request to check file (~10ms)
- TTS API call (~500-2000ms depending on text length)
- Audio download and play

### Subsequent Plays (Cached Audio)
- HEAD request hits cache (~10ms)
- Direct audio play (instant)

**Optimization:** The HEAD request is fast and necessary to avoid generating audio every time. Could be optimized with an in-memory flag per clip, but the HEAD request overhead is negligible.

## Testing Checklist

- ✅ Import bundle with speech clips (no audio)
- ✅ Import bundle with audio clips (with base64)
- ✅ Import bundle with mixed clips
- ✅ Play speech clip without audio (generates on first play)
- ✅ Play speech clip again (uses cached audio)
- ✅ Import with one bad clip (others imported)
- ✅ Import with all bad clips (errors reported)
- ✅ Speech clips respect pasted voice ID
- ✅ Speech clips use clip voiceId if provided
- ✅ No 404 errors on play
- ✅ Network tab shows speak API call on first play only

## Rollback Plan

If issues occur, the fix can be rolled back by reverting these 3 files:
1. `api/soundboard.php`
2. `js/soundboard.js`
3. `js/soundboard-clips.js`

The old behavior will be restored (speech clips without audio will 404 on play, but clips with audio will continue working).

## Summary

✅ **Fixed:** Speech clips without audio now generate on-demand instead of 404ing  
✅ **Fixed:** Per-clip error handling prevents one bad clip from aborting the bundle  
✅ **Fixed:** Bundle-level sourceApp used correctly  
✅ **Added:** Error details in import response  
✅ **Added:** Test fixture with text-only speech clips  
✅ **Tested:** End-to-end with Galen fixture (4 clips)  

**Ready for deployment!** 🚀
