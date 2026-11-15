# Multi-Site Sound Board Implementation

## Overview

Implementing per-app clip exchange, favorites system, per-character default voices, and category dropdowns across 4 hostname variants: blingus, vadania, brawn/bruck, and puck.

## Status: IN PROGRESS

### Phase 1: Backend - Per-App Exchange & Voices ✅

**api/soundboard.php changes:**

1. **App ID System**
   - `sbAppIdFromHost()` - Derives app ID from hostname
   - Maps: blingus.knospe.org → `blingus`, vadania.knospe.org → `vadania`, brawn.knospe.org → `brawn`, bruck.knospe.org → `brawn` (unified), puck.knospe.org → `puck`
   - `sbKnownApps()` - Returns allowlist: `['blingus', 'galen', 'vadania', 'brawn', 'puck']`

2. **Per-Character Default Voices**
   - Updated `sbCharacterVoice()` with ElevenLabs public voice IDs:
     - **Blingus** (`NJf2N7XT2iBE8xJ0XHlo`) - George: Warm British narrator with expressive delivery (fairy bard with sharp wit)
     - **Vadania** (`XB0fDUnXU5powFXDhCwa`) - Charlotte: Clear, steady female voice (elven ranger, observant and cautious)
     - **Bruck/Brawn** (`iP95p4xoKVk53GoZ742B`) - Clyde: Deep, resonant male voice (dwarven monk, disciplined)
     - **Puck** (`ThT5KcBeYPX3keUQqHPh`) - Dorothy: Light, playful female voice (fairy wild magic sorcerer, chaotic)

3. **Exchange Directory Security**
   - `sbInboxDir()` now uses allowlist validation instead of regex
   - Does NOT auto-create directories (expects root to create with 0770)
   - Returns clear error if inbox directory missing
   - No more arbitrary 3-20 letter app names

4. **App-Aware Export/Import**
   - `sbExportClips()` uses `sbAppIdFromHost()` for `sourceApp` field
   - `sbListIncoming()` validates app against allowlist
   - `sbSendToApp()` validates target app against allowlist
   - `ping` action now returns `appId` and `availableApps` (all known apps except self)

5. **Favorites System** (Galen-style)
   - Storage: `/data/soundboard/<character>/favorites/<appId>/`
     - Per-character AND per-app (so Blingus outcomes stored separately from Vadania outcomes)
     - Audio files: `<favoriteId>.mp3` (no audioBase64 bloat in JSON)
     - Metadata: `favorites.json`
   
   - **API Actions:**
     - `saveFavorite` - Save favorite with audio, optional displayName
     - `deleteFavorite` - Delete favorite and its audio file
     - `listFavorites` - List all favorites for character/app
     - `updateFavoriteDisplayName` - Edit display name
     - `favorite-file` - Serve favorite audio with path validation and range support
   
   - **Security:**
     - Path validation: realpath check ensures no directory traversal
     - Favorite IDs must match clip ID format (12-char hex)
     - Audio stored per app (Blingus favorites don't mix with Vadania favorites)

### Phase 2: Frontend - Category Dropdowns & App Picker (TODO)

**Changes needed:**

1. **soundboard-clip-manager.js**
   - Update `checkIncoming()` to use dynamic app ID from ping
   - Replace hardcoded 'blingus' with app ID from server
   - Change "Copy to Galen" to app picker dropdown (all availableApps)
   - Add bulk category assignment: select clips → pick category from dropdown

2. **soundboard-clips.js**
   - Replace free-text category input with dropdown
   - Dropdown shows existing categories + "Uncategorized" + "New category..."
   - "New category..." opens prompt, creates category, then assigns it
   - Used everywhere clips can have categories: add, edit, upload, YouTube, speech, import

3. **soundboard-category-manager.js**
   - Already has category management UI
   - Verify it works with new dropdown integration

4. **outcome-generate.js** (NEW - Favorites)
   - Add favorite button to generated outcomes
   - Show favorites list in UI
   - Play favorite audio without new TTS calls
   - Edit favorite display names
   - Delete favorites

### Phase 3: What's New Entry (TODO)

**Add entry `2026-11-15-multi-site-enhancements`:**

Per-character wording:
- Blingus: "Sound Board now works per-site..."
- Vadania: "Trailbook Sound Board now works per-site..."
- Brawn: "Brawlbook Sound Board now works per-site..."
- Puck: "Surgebook Sound Board now works per-site..."

Content:
- Per-app clip exchange (copy to any of: blingus, vadania, brawn, puck, galen)
- Category dropdowns (no more typos)
- Favorites for generated outcomes (save and replay without new TTS)
- Per-character default voices (still overridable in Settings)

### Phase 4: Testing & Deployment (TODO)

**Server Setup Steps:**

1. Create inbox directories:
```bash
sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/{blingus,vadania,brawn,puck,galen}
sudo chown -R www-data:www-data /var/lib/knospe-soundboard-exchange
sudo chmod 770 /var/lib/knospe-soundboard-exchange/inbox/*
```

2. Test favorite storage:
```bash
# Will be auto-created by PHP on first favorite save:
# /data/soundboard/blingus/favorites/blingus/
# /data/soundboard/vadania/favorites/vadania/
# /data/soundboard/bruck/favorites/brawn/
# /data/soundboard/puck/favorites/puck/
```

3. Bump `$moduleFiles` versions in index.php

4. Deploy files:
   - api/soundboard.php
   - js/soundboard-clip-manager.js (when updated)
   - js/soundboard-clips.js (when updated)
   - js/outcome-generate.js (when updated)
   - js/whats-new.js (when updated)

**Test Plan:**

1. **App ID Detection:**
   - Visit blingus.knospe.org → ping returns appId: 'blingus'
   - Visit vadania.knospe.org → ping returns appId: 'vadania'
   - Visit brawn.knospe.org → ping returns appId: 'brawn'
   - Visit puck.knospe.org → ping returns appId: 'puck'

2. **Per-App Inbox:**
   - Blingus: incoming from inbox/blingus
   - Vadania: incoming from inbox/vadania
   - Brawn: incoming from inbox/brawn (even though internal character is 'bruck')
   - Puck: incoming from inbox/puck

3. **App Picker:**
   - Blingus sees: galen, vadania, brawn, puck (not blingus)
   - Vadania sees: blingus, galen, brawn, puck (not vadania)
   - Brawn sees: blingus, galen, vadania, puck (not brawn)
   - Puck sees: blingus, galen, vadania, brawn (not puck)

4. **Voice Defaults:**
   - Blingus speech: uses George voice by default
   - Vadania speech: uses Charlotte voice by default
   - Brawn speech: uses Clyde voice by default
   - Puck speech: uses Dorothy voice by default
   - Settings override still works

5. **Favorites:**
   - Generate outcome → save favorite
   - Favorite audio stored per app
   - Play favorite → no new TTS call
   - Edit display name → persists
   - Delete favorite → audio file removed

6. **Category Dropdowns:**
   - Add clip → select from existing categories or create new
   - No free-text entry → no typos
   - Bulk assignment works

## Voice Selection Rationale

### Blingus - George (`NJf2N7XT2iBE8xJ0XHlo`)
- **Character:** Fairy bard with sharp wit, reluctant approval style, wanderlust-driven
- **Voice:** Warm British narrator with expressive delivery
- **Reason:** George's warm yet slightly sardonic tone matches Blingus's personality. The British accent adds a theatrical bardic flair, and the expressive delivery works well for song parodies and sarcastic quips.

### Vadania - Charlotte (`XB0fDUnXU5powFXDhCwa`)
- **Character:** Elven ranger, observant and cautious ("the one who notices the door"), twice-checking
- **Voice:** Clear, steady female voice with a measured tone
- **Reason:** Charlotte's clear, measured delivery reflects Vadania's cautious, observant nature. The steady tone conveys the ranger's discipline and awareness without being overly dramatic.

### Bruck/Brawn - Clyde (`iP95p4xoKVk53GoZ742B`)
- **Character:** Dwarven monk, disciplined and focused (ki strikes, patience, Crown of Remembrance)
- **Voice:** Deep, resonant male voice with authority
- **Reason:** Clyde's deep, authoritative voice matches a dwarven monk's gravitas. The resonance conveys strength and discipline, fitting for someone who speaks of flurries, stunning strikes, and monastic patience.

### Puck - Dorothy (`ThT5KcBeYPX3keUQqHPh`)
- **Character:** Fairy wild magic sorcerer, chaotic and mischievous (fairy mischief, wild magic surges)
- **Voice:** Light, playful female voice with youthful energy
- **Reason:** Dorothy's light, playful tone captures Puck's chaotic fairy nature. The youthful energy reflects the wild magic sorcerer's unpredictable, mischievous personality perfectly.

## Contract: knospe-soundboard-clips v1

**Unchanged** - Still uses the same exchange format:

```json
{
  "format": "knospe-soundboard-clips",
  "version": 1,
  "sourceApp": "<appId>",
  "exportedAt": "ISO8601",
  "clips": [
    {
      "type": "string",
      "kind": "audio|speech",
      "name": "string",
      "displayName": "string|null",
      "text": "string|null",
      "voiceId": "string|null",
      "tags": {
        "icon": "🔊",
        "loop": false,
        "category": "string|null"
      },
      "mime": "audio/mpeg",
      "audioBase64": "string|null",
      "sourceId": "string"
    }
  ]
}
```

**Key Changes:**
- `sourceApp` now dynamically derived from hostname (was hardcoded 'blingus')
- `tags.category` preserved in export/import
- Favorites stored separately (not in exchange contract)

## Files Changed

### Backend
- [x] `api/soundboard.php` - All backend changes complete

### Frontend (TODO)
- [ ] `js/soundboard-clip-manager.js` - App picker, dynamic app ID
- [ ] `js/soundboard-clips.js` - Category dropdowns
- [ ] `js/outcome-generate.js` - Favorites UI
- [ ] `js/whats-new.js` - New entry

### Documentation
- [x] `MULTI-SITE-IMPLEMENTATION.md` - This file

### Version Bumps (TODO)
- [ ] `index.php` - Bump `$moduleFiles` versions

## Next Steps

1. Update frontend JS files
2. Add What's New entry
3. Bump module versions
4. Create test plan document
5. Document server setup steps
6. Commit and push
