# Sound Board Revamp - Built-in Sounds Removed + Category Management

## Overview

Two major changes to the Sound Board:

1. **Removed all built-in sounds** - Only custom user clips now appear
2. **Added category management** - Create, rename, delete, reorder categories and assign clips

## 1. Built-in Sounds Removed

### What Was Removed

**All hardcoded preset sound kits** from `js/soundboard.js`:

#### Sound Files (S object) - 13 files
- `sounds/slash.ogg`
- `sounds/chop.ogg`
- `sounds/clash.ogg`
- `sounds/thud.ogg`
- `sounds/crit.ogg`
- `sounds/bow.wav`
- `sounds/block.ogg`
- `sounds/parry.wav`
- `sounds/smite.ogg`
- `sounds/thunder.ogg`
- `sounds/fire.ogg`
- `sounds/ice.ogg`
- `sounds/whoosh.wav`
- `sounds/horn.ogg`
- `sounds/drums.ogg`
- `sounds/downed.ogg`
- `sounds/panther.ogg`
- `sounds/undead.mp3`
- `sounds/fluch1.mp3` through `sounds/fluch6.mp3` (German swears)

#### Character Kits (KITS object) - 5 kits removed

**1. Blingus Kit ("Bardboard")** - 10 pads
- Song: Flourish, Sting, Horn, Fanfare (loop)
- Steel: Dagger, Shortbow
- Table: Nat 20, Sex Panther, Undead ×2, Downed

**2. Vadania Kit ("Trail sounds")** - 10 pads
- Bow: Longbow, Arrow, Redeemed shot
- Steel: Shortsword, Block, Thud
- Trail: Elidon's horn, Sex Panther, Undead ×2, Downed

**3. Bruck Kit ("Brawl sounds")** - 9 pads
- Fists: Punch, Staff, Stunning hit
- Guard: Patient, Parry, Step of the Wind
- Table: Sex Panther, Undead ×2, Downed

**4. Puck Kit ("Surge sounds")** - 10 pads
- Chaos: Fireball, Shatter, Ice, Fly
- Spark: Spark, Shield
- Table: Surge crit, Sex Panther, Undead ×2, Downed

**5. Galen Kit ("Halbmast sounds")** - 17 pads
- Blade: Slash, Crit, Thud
- Oath: Divine Smite, Thunder, Block, Parry
- Table: Horn, Fanfare (loop), Sex Panther, Undead ×2, Downed
- Flüche: Scheiße, Verdammt, Fick dich, Arschloch, Any fluch (random)

**Total Removed:** ~60+ hardcoded preset pads across all characters

### Code Removed

**From `js/soundboard.js`:**
- Lines 14-33: `S` object (sound file mappings)
- Lines 35: `CRIES` array (German swear sound files)
- Lines 37-122: `KITS` object (all 5 character kits with ~60 pads)
- Lines 124-138: `kitId()` function
- Lines 140-142: `kit()` function
- Line 147: Changed `pads()` from concatenating kit pads to returning only `customPads`

**Lines of code removed:** ~110 lines

### Server-Side Check

**✅ No server-side seeding found**

Verified with grep that `api/soundboard.php` contains NO:
- Default clip seeding
- Preset clip generation
- Initial clip creation

All clips are 100% user-created (uploaded, YouTube, TTS, sound effects, or imported).

### User Impact

**Before:**
- Each character had 9-17 built-in preset pads
- Mix of custom and built-in sounds
- Built-in sounds could not be removed
- UI showed "Built-in pads stay with the book" message

**After:**
- Sound Board shows ONLY custom clips
- Empty state: "No clips yet. Use the form above to add YouTube clips, sound effects, or spoken lines."
- All sounds are user-created
- Clean slate on every device/browser

### Migration Notes

**✅ No server-side migration needed**

Since built-in sounds were client-side only (JavaScript pads), removing them requires NO server-side data migration or cleanup.

**User data preserved:**
- All custom clips remain intact
- Export/import bundles unaffected
- Server-side clip storage unchanged

**For users with existing custom clips:**
- Their custom clips appear immediately
- No built-in sounds shown
- Categories start empty (can create via Categories button)

**For new users or empty boards:**
- Clean empty state
- No preset sounds
- Must add clips manually via form

## 2. Category Management Added

### Features

**Category CRUD:**
- ✅ Create categories (name + auto-generated ID)
- ✅ Rename categories
- ✅ Delete categories (with clip reassignment prompt)
- ✅ Reorder categories (move up/down)

**Clip Assignment:**
- ✅ Assign clips to categories via dropdown
- ✅ "Uncategorized" for clips without a category
- ✅ Shows deleted category names (e.g. "Music (deleted)")

**Persistence:**
- ✅ Categories saved server-side per character (`categories.json`)
- ✅ Clips store category field in `clips.json`
- ✅ Export includes `tags.category` in bundles
- ✅ Import matches category if it exists, else Uncategorized

### Backend (api/soundboard.php)

**New Functions:**

1. `sbReadCategoriesFile($path)` - Read categories JSON
2. `sbWriteCategoriesFile($path, $categories)` - Write categories JSON
3. `sbListWithCategories($character)` - List clips + categories
4. `sbSaveCategories($request)` - Save categories array
5. `sbUpdateClipCategory($request)` - Update single clip's category

**New API Endpoints:**

1. **GET `?action=listWithCategories&character=blingus`**
   - Returns: `{success, character, clips: [], categories: []}`
   - Used by soundboard main render

2. **POST `action: saveCategories`**
   - Body: `{character, categories: [{id, name, order}]}`
   - Returns: `{success, categories: [...]}`
   - Validates, cleans names, sorts by order

3. **POST `action: updateClipCategory`**
   - Body: `{character, id, category}`
   - Returns: `{success, updated: true}`
   - Updates single clip's category field

**Data Format:**

**categories.json** (per character):
```json
[
  {
    "id": "a1b2c3d4",
    "name": "Music",
    "order": 0
  },
  {
    "id": "e5f6g7h8",
    "name": "Effects",
    "order": 1
  }
]
```

**clips.json** (category field added):
```json
{
  "id": "abc123",
  "label": "Epic Theme",
  "icon": "🎵",
  "category": "Music",
  ...
}
```

**Export bundle** (tags.category):
```json
{
  "format": "knospe-soundboard-clips",
  "clips": [
    {
      "name": "Epic Theme",
      "tags": {
        "icon": "🎵",
        "loop": false,
        "category": "Music"
      },
      ...
    }
  ]
}
```

### Frontend (js/soundboard-category-manager.js)

**New File:** 417 lines

**UI Components:**

1. **Category List**
   - Shows all categories with clip counts
   - Move up/down buttons (reorder)
   - Rename button (prompt)
   - Delete button (with clip reassignment prompt)

2. **Add Category**
   - Button at top
   - Prompt for name
   - Auto-assigns ID and order

3. **Clip Assignment List**
   - All clips with dropdowns
   - Options: Uncategorized + all categories
   - Shows deleted categories (e.g. "Music (deleted)")
   - Instant save on change

**Delete Category Flow:**

1. User clicks Delete on category with clips
2. Confirm prompt: "Delete category 'Music'? It contains 5 clip(s). What should happen to these clips?"
3. OK → Move all clips to Uncategorized
4. Cancel → Keep category

**No silent deletions** - Clips are NEVER deleted when deleting a category.

### Frontend Updates

**js/soundboard.js:**
- Removed kit references (title, hint)
- Changed title to "Sound Board"
- Changed hint to "Your custom clips and categories"
- Added "Categories" button next to "Manage clips"
- Updated `clipsToPads` to use `clip.category` for group
- Pass `clipsData` with categories to mount function
- Empty state shows if no clips

**js/soundboard-clips.js:**
- Added `listWithCategories(characterId)` function
- Returns `{clips: [], categories: []}`

**styles.css:**
- Added ~150 lines for category manager modal
- Responsive layout (desktop + mobile)
- Category list items with actions
- Clip dropdown selectors
- Mobile: stacked layout for actions and selects

**index.php:**
- Added `soundboard-category-manager.js` to scripts

### Category Export/Import

**Export:**
- Category included in `tags.category` field
- Example: `{..., "tags": {"icon": "🎵", "category": "Music"}}`

**Import:**
- Reads `tags.category` from bundle
- Matches against existing categories by name
- If match found: assigns clip to that category
- If no match: clip goes to Uncategorized
- Never creates categories on import (user must create first)

**Cross-App Compatibility:**
- Galen agent implements same contract
- Categories export/import between apps
- Clip keeps category if both apps have category with same name

### What's New Entry

Added entry `2026-11-14-c-soundboard-revamp`:

> - Sound Board now shows only your custom clips. Built-in preset sounds have been removed.
> - New Categories button: create, rename, delete, and reorder categories. Move clips between categories with a dropdown on each clip.
> - Categories are saved server-side and included in exported clip bundles. Imported clips keep their category if it exists.

## Files Changed

### Modified (8 files)
1. `api/soundboard.php` - Category API endpoints
2. `js/soundboard.js` - Removed kits, added category support
3. `js/soundboard-clips.js` - Added listWithCategories
4. `js/soundboard-clip-manager.js` - (no changes needed)
5. `styles.css` - Category manager styles
6. `index.php` - Added category manager script
7. `js/whats-new.js` - Added What's New entry
8. `test/galen-clips-fixture.json` - (no changes needed, already has category in tags)

### Created (1 file)
9. `js/soundboard-category-manager.js` - NEW: Category management UI

## Deployment Files

**Required files to deploy:**

1. `api/soundboard.php`
2. `js/soundboard.js`
3. `js/soundboard-clips.js`
4. `js/soundboard-category-manager.js`
5. `styles.css`
6. `index.php`
7. `js/whats-new.js`

**No server-side migration needed** - categories are created on-demand.

## Data Migration

### Server-Side

**✅ NO MIGRATION REQUIRED**

- Built-in sounds were client-side only
- Categories start empty (users create via UI)
- Existing custom clips remain intact
- No seeded data to remove

**New files created (per character):**
- `/data/soundboard/<character>/categories.json` - Created when user saves categories

**Existing files unchanged:**
- `/data/soundboard/<character>/clips.json` - Existing structure preserved
- `/data/soundboard/<character>/<clipId>.mp3` - Audio files unchanged

### Client-Side

**No localStorage migration needed**

Users will see:
- Custom clips immediately (pulled from server)
- No built-in sounds
- Empty categories (can create via Categories button)
- What's New banner explaining changes

## Testing Checklist

### Built-in Sounds Removal

- ✅ Open Sound Board
- ✅ Verify NO built-in pads appear
- ✅ Only custom clips shown (if any)
- ✅ Empty state shows correct message
- ✅ No kit title/hint shown
- ✅ Title is "Sound Board"
- ✅ Hint is "Your custom clips and categories"

### Category Management

- ✅ Click "Categories" button
- ✅ Modal opens with "Manage Categories"
- ✅ Click "+ Add Category"
- ✅ Enter name, saves successfully
- ✅ Category appears in list
- ✅ Move up/down works
- ✅ Rename works (prompt)
- ✅ Delete empty category works
- ✅ Delete category with clips prompts for action
- ✅ Clips moved to Uncategorized on confirm

### Clip Assignment

- ✅ Categories modal shows all clips
- ✅ Each clip has dropdown
- ✅ Dropdown shows "Uncategorized" + categories
- ✅ Change category saves immediately
- ✅ Toast shows "Clip updated"
- ✅ Close modal, reopen, category persists
- ✅ Clips grouped by category on main board

### Export/Import

- ✅ Export clips with categories
- ✅ Verify `tags.category` in JSON
- ✅ Import bundle with categories
- ✅ Clips assigned to matching categories
- ✅ Clips without matching category → Uncategorized
- ✅ Import Galen fixture with categories

## Mobile Responsiveness

**Desktop (1200px):**
- Category list: 2-column actions
- Clip list: icon + name + dropdown inline

**Mobile (390px):**
- Category list: stacked actions
- Clip list: icon + name + dropdown (dropdown full-width)
- All buttons readable and tappable

## Removed Sound Files

**Optional Cleanup:**

The following sound files in `/sounds/` are no longer referenced and can be optionally removed:

- `slash.ogg`, `chop.ogg`, `clash.ogg`, `thud.ogg`
- `crit.ogg`, `bow.wav`, `block.ogg`, `parry.wav`
- `smite.ogg`, `thunder.ogg`, `fire.ogg`, `ice.ogg`
- `whoosh.wav`, `horn.ogg`, `drums.ogg`, `downed.ogg`
- `panther.ogg`, `undead.mp3`
- `fluch1.mp3`, `fluch2.mp3`, `fluch3.mp3`, `fluch4.mp3`, `fluch5.mp3`, `fluch6.mp3`

**Total:** ~22 audio files (~2-5 MB estimated)

**Note:** These files are NOT removed by this PR to avoid breaking old browser caches or bookmarked direct links. They can be removed in a future cleanup if desired.

## Summary

✅ **Removed:** 60+ built-in preset sound pads (all kits)  
✅ **Added:** Category management (CRUD + assignment)  
✅ **Added:** Category export/import in bundles  
✅ **Added:** What's New entry  
✅ **No migration required:** Clean deployment, user data preserved  

**Ready for deployment!** 🚀
