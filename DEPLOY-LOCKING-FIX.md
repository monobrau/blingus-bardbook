# Deployment Checklist - Concurrent Speech Locking Fix

**Branch:** `cursor/elevenlabs-voice-everywhere-8b96`  
**PR:** [#4](https://github.com/monobrau/blingus-bardbook/pull/4)  
**Commits:** `ba46d6c`, `39bd0a3`, `0307fea`, `18e4056`

---

## Files to Deploy

### Required (Production)

1. **`api/soundboard.php`** - Refactored `sbSaveSpeech()` with fixed locking

**That's it!** Only one file needs deployment for the fix to work.

---

### Optional (Testing)

2. **`test/test-concurrent-speech.php`** - PHP test with mocked TTS
3. **`LOCKING-FIX.md`** - Technical documentation
4. **`CONCURRENT-LOCKING-SUMMARY.md`** - Executive summary
5. **`TEST-STATUS.md`** - Test status and verification guide
6. **`DEPLOY-LOCKING-FIX.md`** - This file

---

## Pre-Deployment Checklist

- [x] Code refactored (`sbSaveSpeech` uses `sbWithLock`)
- [x] Post-lock re-check implemented (uses `sbClipFile`)
- [x] Persistent lock files (never deleted)
- [x] Consistent extension matching (mp3/m4a only)
- [x] PHP test written with mocked TTS
- [x] Documentation complete
- [x] PR updated
- [x] All changes pushed to branch

---

## Deployment Steps

### Step 1: Backup Current File

```bash
sudo cp /var/www/blingus/api/soundboard.php /var/www/blingus/api/soundboard.php.backup-$(date +%Y%m%d-%H%M%S)
```

### Step 2: Deploy New File

```bash
cd /path/to/blingus-bardbook
git checkout cursor/elevenlabs-voice-everywhere-8b96
git pull
sudo cp api/soundboard.php /var/www/blingus/api/soundboard.php
sudo chown www-data:www-data /var/www/blingus/api/soundboard.php
sudo chmod 644 /var/www/blingus/api/soundboard.php
```

**Or via rsync/scp:**
```bash
scp api/soundboard.php user@server:/var/www/blingus/api/soundboard.php
```

### Step 3: Verify Permissions

```bash
ls -la /var/www/blingus/api/soundboard.php
# Should show: -rw-r--r-- www-data www-data
```

### Step 4: (Optional) Deploy Test File

```bash
sudo cp test/test-concurrent-speech.php /var/www/blingus/test/test-concurrent-speech.php
sudo chown www-data:www-data /var/www/blingus/test/test-concurrent-speech.php
sudo chmod 644 /var/www/blingus/test/test-concurrent-speech.php
```

---

## Post-Deployment Verification

### Test 1: Run PHP Test (Recommended)

```bash
cd /var/www/blingus
php test/test-concurrent-speech.php
```

**Expected Output:**
```
========================================
All Tests Passed! ✅
========================================
Summary:
- Sequential requests: 1 TTS call ✅
- Lock mechanism: blocks concurrent access ✅
- Extension matching: mp3/m4a only ✅
- Post-lock re-check: skips duplicate generation ✅
- Voice ID: persists correctly ✅
- No duplicate clips created ✅
```

**If any test fails:** Restore backup immediately.

---

### Test 2: Manual Verification (Production)

#### A. New Speech Clip

1. Open Blingus in browser
2. Open Sound Board
3. Add new spoken clip (text only)
4. Click play → generates audio (TTS call #1)
5. Click play again → uses cached audio (no TTS call)

**Check server logs:**
```bash
tail -f /var/log/php/error.log
```

**Should see:** 1 TTS API call only (no duplicate)

#### B. Lock Directory Created

```bash
ls -la /data/soundboard/blingus/locks/
```

**Should see:**
- Directory exists
- `.lock` files for each generated clip
- Files are small (0 bytes - empty lock files)
- Owned by `www-data:www-data`

#### C. No PHP Errors

```bash
grep -i "error\|warning\|flock\|fclose" /var/log/php/error.log | tail -20
```

**Should NOT see:**
- TypeError about closed resources
- flock/fclose errors
- Any errors related to soundboard

#### D. Concurrent Request Test

1. Open browser DevTools → Network tab
2. Click speech clip play button
3. **Immediately** click play again (spam clicks)
4. Check Network tab → multiple requests sent
5. Check server logs → **only 1 TTS API call**

---

### Test 3: Lock File Persistence

```bash
# Generate a speech clip
# Check lock file exists
ls -la /data/soundboard/blingus/locks/abc123def456.lock

# Wait 5 minutes
# Check lock file still exists (not deleted)
ls -la /data/soundboard/blingus/locks/abc123def456.lock
```

**Lock file should persist** (not deleted after request completes)

---

## What Changed

### Old Behavior (Before Fix) ❌

**Scenario:** Two users click play on same text-only speech clip simultaneously

1. Request A: Check for audio → none found
2. Request B: Check for audio → none found (A hasn't created it yet)
3. Request A: Acquire lock
4. Request A: Generate audio (TTS call #1) - takes 2 seconds
5. Request A: Save audio file
6. Request A: Release lock, **delete lock file**
7. Request B: Acquire lock (new lock file, different inode)
8. Request B: **Check OLD variable** (still null, never re-scanned filesystem)
9. Request B: Generate audio (TTS call #2) ❌ WASTE
10. Request B: Save audio file (overwrites A's file)
11. Request B: Release lock, delete lock file

**Problems:**
- 2 TTS API calls (wasted credits)
- Race condition with lock file deletion
- Post-lock re-check never ran

---

### New Behavior (After Fix) ✅

**Scenario:** Two users click play on same text-only speech clip simultaneously

1. Request A: Check for audio → none found
2. Request B: Check for audio → none found (A hasn't created it yet)
3. Request A: Acquire lock on `locks/abc123.lock`
4. Request B: Try to acquire lock → **BLOCKED** (A holds it)
5. Request A: **Re-check filesystem** for audio → still none
6. Request A: Generate audio (TTS call #1) - takes 2 seconds
7. Request A: Save audio file
8. Request A: Release lock (**lock file persists**)
9. Request B: Acquire lock (same file as A)
10. Request B: **Re-check filesystem** for audio → **FOUND!** ✅
11. Request B: Return cached audio immediately
12. Request B: Release lock

**Result:**
- 1 TTS API call only
- No wasted credits
- Proper serialization via persistent lock file
- Post-lock re-check works correctly

---

## Server Directory Structure

### Before First Request
```
/data/soundboard/blingus/
├── clips.json
└── abc123def456.mp3  (existing clips)
```

### After First Speech Generation
```
/data/soundboard/blingus/
├── clips.json
├── abc123def456.mp3
└── locks/              (NEW - auto-created)
    └── abc123def456.lock  (NEW - persistent)
```

### After Multiple Speech Clips
```
/data/soundboard/blingus/
├── clips.json
├── abc123def456.mp3
├── 789abc012345.mp3
├── fedcba987654.mp3
└── locks/
    ├── abc123def456.lock
    ├── 789abc012345.lock
    └── fedcba987654.lock
```

**Lock files:**
- One per speech clip ID
- Empty (0 bytes)
- Persist forever (never deleted)
- Used only for synchronization
- Safe to delete when no requests active

---

## Rollback Plan

If issues occur after deployment:

### Step 1: Restore Backup

```bash
# Find backup file
ls -lt /var/www/blingus/api/soundboard.php.backup-*

# Restore most recent backup
sudo cp /var/www/blingus/api/soundboard.php.backup-YYYYMMDD-HHMMSS /var/www/blingus/api/soundboard.php
sudo chown www-data:www-data /var/www/blingus/api/soundboard.php
```

### Step 2: Clear Lock Files (Optional)

```bash
# If lock files cause issues (unlikely)
sudo rm -rf /data/soundboard/*/locks/
```

### Step 3: Verify Rollback

```bash
# Test speech generation works
# Check logs for errors
tail -f /var/log/php/error.log
```

---

## Monitoring

### Metrics to Watch

**TTS API Usage:**
- Monitor ElevenLabs API usage
- Should see **reduction** in duplicate TTS calls
- Cost savings on concurrent requests

**PHP Error Log:**
```bash
tail -f /var/log/php/error.log | grep -i "soundboard\|flock\|TypeError"
```

**Disk Usage (lock files):**
```bash
du -sh /data/soundboard/*/locks/
```

Lock files are tiny (0 bytes each), but count can grow over time:
- 1000 speech clips = 1000 lock files = ~128 KB total
- Not a concern unless millions of clips

---

## Cleanup (Optional)

Lock files accumulate over time (one per speech clip ever generated). To clean up old locks:

### Option 1: Remove Locks for Deleted Clips

```bash
cd /data/soundboard/blingus

# For each lock file
for lock in locks/*.lock; do
  clipId=$(basename "$lock" .lock)
  
  # Check if audio file exists
  if [ ! -f "${clipId}.mp3" ] && [ ! -f "${clipId}.m4a" ]; then
    # Audio deleted, remove lock
    rm "$lock"
  fi
done
```

### Option 2: Remove All Locks (Nuclear)

**⚠️ Only when no requests are active!**

```bash
sudo rm -rf /data/soundboard/*/locks/
```

Lock directory will be recreated on next speech generation.

---

## Troubleshooting

### Issue: Lock Directory Not Created

**Symptom:** Error: "Could not lock soundboard data."

**Fix:**
```bash
# Create locks directory manually
sudo mkdir -p /data/soundboard/blingus/locks
sudo chown www-data:www-data /data/soundboard/blingus/locks
sudo chmod 755 /data/soundboard/blingus/locks
```

### Issue: Permission Denied on Lock Files

**Symptom:** Error: "Could not acquire lock."

**Fix:**
```bash
# Fix permissions
sudo chown -R www-data:www-data /data/soundboard/*/locks/
sudo chmod 755 /data/soundboard/*/locks/
sudo chmod 644 /data/soundboard/*/locks/*.lock
```

### Issue: Stale Lock Prevents Speech Generation

**Symptom:** Request hangs waiting for lock that never releases.

**Diagnosis:**
```bash
# Check for processes holding locks
lsof /data/soundboard/blingus/locks/*.lock
```

**Fix:**
```bash
# Kill stale PHP processes (if any)
sudo pkill -9 php

# Or restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### Issue: Still Seeing Duplicate TTS Calls

**Symptom:** Server logs show 2+ TTS API calls for same clip.

**Diagnosis:**
1. Check `api/soundboard.php` deployed correctly
2. Check PHP version (8.x recommended)
3. Check if flock supported on filesystem

**Verify Deployment:**
```bash
grep -n "sbWithLock" /var/www/blingus/api/soundboard.php
# Should show the refactored function
```

**Test Lock Behavior:**
```bash
php test/test-concurrent-speech.php
# Should show all tests pass
```

---

## Success Criteria

✅ PHP test passes (all 5 tests)  
✅ Manual speech generation works  
✅ Lock directory auto-created  
✅ Lock files persist  
✅ No PHP errors in log  
✅ Only 1 TTS call per unique clip  
✅ Concurrent requests properly serialized  

---

## Questions?

See documentation:
- **LOCKING-FIX.md** - Detailed technical explanation
- **CONCURRENT-LOCKING-SUMMARY.md** - Executive summary
- **TEST-STATUS.md** - Test coverage and verification

---

**Status:** Ready for deployment ✅  
**Risk:** Low (only refactored existing function)  
**Impact:** Reduced TTS API costs, no PHP errors  
**Rollback:** Simple (restore backup file)
