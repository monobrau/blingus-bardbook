# Bug Fixes - November 14, 2026

## Summary

Fixed three critical bugs found in review after deploying commit 838c5e3:

1. **Text-only speech TTS playback broken** - Wasted credits and created duplicates
2. **Volume persistence broken** - Called removed `kitId()` function
3. **Character resolution order changed** - Themed pages showed wrong character's clips

## Bug 1: Text-only Speech TTS Playback Broken

### Problem

**Impact:** HIGH - Wasted ElevenLabs credits, created duplicate clips, audio never played

**Symptoms:**
- Every tap on imported speech clip (text-only, no audioBase64) made a new ElevenLabs API call
- New duplicate clip created with different ID (counted toward 40-clip limit)
- Original clip still had no audio file (404 error)
- Audio never played
- Credits wasted on every tap

**Root Cause:**

1. Client (`js/soundboard-clips.js`) called `apiPost({action: 'speak', id: clipId, ...})`
2. Server (`api/soundboard.php`) `sbSaveSpeech()` **ignored the `id` parameter**
3. Server always generated a new random ID: `$id = bin2hex(random_bytes(6));`
4. Server created a NEW clip with new ID
5. Client tried to play original ID, which still had no file (404)

**Example:**
- Import speech clip: ID = `abc123`, no audio file
- Tap to play → Client sends `{action: 'speak', id: 'abc123', text: '...'}`
- Server generates audio, saves as NEW clip with ID = `def456`
- Client tries to play `abc123.mp3` → 404 (still doesn't exist)
- Tap again → Another new clip `ghi789` created
- Result: 3 clips total, audio never plays, 2 API calls wasted

### Fix

**Server-side (api/soundboard.php):**

Added logic to detect and update existing speech clips without audio:

```php
$providedId = isset($input['id']) && is_string($input['id']) ? trim($input['id']) : '';
$existingClip = null;
$updateExisting = false;

if ($providedId !== '' && preg_match('/^[a-f0-9]{12}$/', $providedId)) {
    foreach ($existing as $clip) {
        if (($clip['id'] ?? '') === $providedId && ($clip['source'] ?? '') === 'speech') {
            $audioPath = $dir . $providedId . '.mp3';
            if (!is_file($audioPath)) {
                $existingClip = $clip;
                $updateExisting = true;
                break;
            }
        }
    }
}
```

**Behavior:**
- If `id` provided AND matches existing speech clip AND no audio file exists
- Use that ID, generate audio, write to `<providedId>.mp3`
- Update voiceId on existing clip if provided
- Return existing clip (no new clip created)
- Don't count against 40-clip limit

**Client-side (js/soundboard-clips.js):**

Added concurrency guard to prevent double-taps:

```javascript
const generatingClips = new Set();

async function speakAndCache(characterId, clipId, text, clipVoiceId) {
    const lockKey = characterId + ':' + clipId;
    
    if (generatingClips.has(lockKey)) {
        throw new Error('Audio generation already in progress');
    }
    
    generatingClips.add(lockKey);
    try {
        // ... generate audio ...
    } finally {
        generatingClips.delete(lockKey);
    }
}
```

**Behavior:**
- Tracks in-flight generation requests
- Rejects concurrent calls for same clip
- Prevents double-tap credit waste
- Lock released after success or error

**Result:**
- First tap: generates audio, writes to correct ID, plays successfully
- Subsequent taps: HEAD request succeeds (200 OK), plays cached audio immediately
- No duplicate clips created
- No wasted API calls
- Audio actually plays

### Verification

**Test Case 1: Import text-only speech clip**
1. Import Galen fixture with text-only speech clip
2. Tap clip to play
3. ✅ Audio generates once
4. ✅ Audio file created at original ID
5. ✅ Audio plays successfully
6. Tap again
7. ✅ Plays immediately (cached)
8. ✅ No new clip created
9. ✅ Clip count unchanged

**Test Case 2: Rapid double-tap**
1. Import text-only speech clip
2. Double-tap quickly
3. ✅ Only one generation request
4. ✅ Second tap throws "already in progress"
5. ✅ No duplicate clips
6. ✅ One API call only

**Test Case 3: Speech clip with audio**
1. Import clip with audioBase64 (cached audio)
2. Tap to play
3. ✅ HEAD request succeeds
4. ✅ Plays immediately
5. ✅ No API call made
6. ✅ No generation triggered

## Bug 2: Volume Persistence Broken

### Problem

**Impact:** MEDIUM - Volume slider doesn't save, resets to default (0.72) on reload

**Symptoms:**
- User adjusts volume slider
- Refreshes page or switches tabs
- Volume resets to default (0.72)
- No error in console (error silently caught)

**Root Cause:**

```javascript
function volKey() {
    if (CFG.kit === 'galen') return CFG.volKey || 'galenSoundboardVol';
    return kitId() + 'SoundboardVol';  // ❌ kitId() was removed!
}
```

The `kitId()` function was removed when we removed built-in kits, but `volKey()` still called it.

**Error path:**
1. `volKey()` called `kitId()`
2. `kitId()` is undefined → `TypeError`
3. Error caught in try/catch: `catch (e) { /* ignore */ }`
4. Volume never saved to localStorage
5. Next load: defaults to 0.72

### Fix

**Before:**
```javascript
return kitId() + 'SoundboardVol';  // ❌ Calls removed function
```

**After:**
```javascript
const characterId = window.BlingusSite?.themeCharacterId?.()
    || window.BlingusSite?.lockedCharacterId?.()
    || window.CharacterSheet?.getActiveId?.()
    || 'blingus';
return characterId + 'SoundboardVol';
```

**Result:**
- Volume keyed by character ID (e.g. `blingusSoundboardVol`)
- Saves correctly to localStorage
- Persists across page reloads
- Independent per character

### Verification

**Test Case:**
1. Open Sound Board
2. Adjust volume slider to 0.5
3. Refresh page
4. ✅ Volume still at 0.5
5. Switch to different character
6. ✅ Volume independent (different localStorage key)
7. Switch back
8. ✅ Volume restored to 0.5

**localStorage keys:**
- Blingus: `blingusSoundboardVol`
- Vadania: `vadaniaSoundboardVol`
- Puck: `puckSoundboardVol`
- Bruck: `bruckSoundboardVol`
- Galen: `galenSoundboardVol` (or CFG.volKey override)

## Bug 3: Character Resolution Order Changed

### Problem

**Impact:** MEDIUM - Themed pages show wrong character's clips

**Symptoms:**
- Visit themed page (e.g. `/puck` with Puck theme)
- Sound Board shows Blingus clips instead of Puck clips
- Character sheet shows Puck correctly
- Only Sound Board affected

**Root Cause:**

**Old resolution order (before revamp):**
```javascript
const who = window.BlingusSite?.themeCharacterId?.()      // 1st: Theme (e.g. /puck)
    || window.BlingusSite?.lockedCharacterId?.()           // 2nd: Locked
    || window.CharacterSheet?.getActiveId?.()              // 3rd: Sheet
    || '';
if (who === 'bruck') return 'bruck';
if (KITS[who]) return who;
return 'blingus';
```

**New resolution order (broken):**
```javascript
const characterId = window.BlingusSite?.lockedCharacterId?.()  // ❌ Missing themeCharacterId!
    || window.CharacterSheet?.getActiveId?.()
    || 'blingus';
```

**Impact:**
- Themed pages (e.g. `/puck`) set `themeCharacterId`
- But Sound Board skipped `themeCharacterId` check
- Fell back to `lockedCharacterId` (user's locked character, e.g. Blingus)
- Loaded wrong character's clips

### Fix

Restored original precedence in 3 places:

**1. paint() function:**
```javascript
const characterId = window.BlingusSite?.themeCharacterId?.()
    || window.BlingusSite?.lockedCharacterId?.()
    || window.CharacterSheet?.getActiveId?.()
    || 'blingus';
```

**2. render() function:**
```javascript
const characterId = window.BlingusSite?.themeCharacterId?.()
    || window.BlingusSite?.lockedCharacterId?.()
    || window.CharacterSheet?.getActiveId?.()
    || 'blingus';
```

**3. volKey() function:**
```javascript
const characterId = window.BlingusSite?.themeCharacterId?.()
    || window.BlingusSite?.lockedCharacterId?.()
    || window.CharacterSheet?.getActiveId?.()
    || 'blingus';
```

**Resolution order restored:**
1. **Theme** (`themeCharacterId`) - Themed pages like `/puck`
2. **Locked** (`lockedCharacterId`) - User's selected character
3. **Sheet** (`getActiveId`) - Character sheet active tab
4. **Default** (`'blingus'`) - Fallback

### Verification

**Test Case 1: Themed page**
1. Visit `/puck` (Puck-themed page)
2. Open Sound Board
3. ✅ Shows Puck's clips (not Blingus clips)
4. ✅ Volume saves to `puckSoundboardVol`

**Test Case 2: Locked character**
1. Lock Vadania (no theme)
2. Visit generic page
3. Open Sound Board
4. ✅ Shows Vadania's clips
5. ✅ Volume saves to `vadaniaSoundboardVol`

**Test Case 3: Character sheet**
1. Open character sheet
2. Switch to Bruck tab
3. ✅ Shows Bruck's clips
4. ✅ Volume saves to `bruckSoundboardVol`

**Test Case 4: Precedence**
1. Lock Blingus globally
2. Visit `/puck` themed page
3. ✅ Theme wins: shows Puck clips (not Blingus)
4. ✅ Volume keyed by Puck

## Files Changed

### Modified (3 files)
1. `api/soundboard.php` - Fixed `sbSaveSpeech()` to honor `id` parameter
2. `js/soundboard-clips.js` - Added concurrency guard for `speakAndCache()`
3. `js/soundboard.js` - Fixed `volKey()` and character resolution order
4. `js/whats-new.js` - Added What's New entry for fixes

## Deployment

**Files to deploy:**
1. `api/soundboard.php`
2. `js/soundboard-clips.js`
3. `js/soundboard.js`
4. `js/whats-new.js`

**No migration needed** - All fixes are code-only, no data changes.

## What's New Entry

Added entry `2026-11-14-d-soundboard-fixes`:

> - Fixed: Imported speech clips now generate audio on first play without wasting credits or creating duplicates.
> - Fixed: Volume slider now saves correctly per character.

(Character resolution fix not mentioned - internal behavior, not user-facing)

## Testing Checklist

### Speech TTS Playback
- ✅ Import text-only speech clip
- ✅ Tap to play → generates audio once
- ✅ Audio plays successfully
- ✅ Tap again → plays cached audio
- ✅ No duplicate clips created
- ✅ Double-tap → only one generation
- ✅ Clip with audio → plays immediately (no generation)

### Volume Persistence
- ✅ Adjust volume → save works
- ✅ Refresh page → volume restored
- ✅ Switch character → independent volume
- ✅ localStorage keys correct per character

### Character Resolution
- ✅ Themed page → correct clips
- ✅ Locked character → correct clips
- ✅ Character sheet → correct clips
- ✅ Theme precedence over locked

## Git Status

**Commits:**
- `29d72ff` - Bug fixes (TTS, volume, character resolution)
- `3f0ebdd` - What's New entry

**Branch:** `cursor/elevenlabs-voice-everywhere-8b96`  
**PR:** #4

---

## Summary

✅ **Fixed:** Speech TTS playback (no duplicate clips, no wasted credits)  
✅ **Fixed:** Volume persistence (saves correctly per character)  
✅ **Fixed:** Character resolution (themed pages show correct clips)  
✅ **Added:** Concurrency guard (prevents double-tap waste)  
✅ **Added:** What's New entry  

**Ready for deployment!** 🚀
