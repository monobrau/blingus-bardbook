# Cross-App Clip Exchange - Implementation Summary

## Overview

Implemented sound clip copy/exchange functionality between Blingus and Galen apps, following the exact shared JSON contract specification.

## ✅ Features Implemented

### 1. Export/Import via Files
- **Export**: Select clips → download JSON bundle
- **Import**: Upload JSON bundle → imports with deduplication
- Works for ALL clip types: YouTube audio, spoken/TTS, sound effects, recorded audio
- Graceful handling of unknown types (maps to closest equivalent)

### 2. Direct Send (Exchange Directory)
- **Copy to Galen**: Writes bundle to shared inbox atomically (tmp + rename)
- **Incoming Clips**: Shows pending bundles from other apps
- **Import/Discard**: Process or remove incoming bundles
- Graceful degradation when exchange directory unavailable

### 3. Portable JSON Format

Follows the exact contract:

```json
{
  "format": "knospe-soundboard-clips",
  "version": 1,
  "sourceApp": "blingus"|"galen",
  "exportedAt": "2026-11-14T16:00:00Z",
  "clips": [
    {
      "type": "<app clip type>",
      "kind": "audio"|"speech",
      "name": "string",
      "displayName": "string|null",
      "text": "string|null",
      "voiceId": "string|null",
      "tags": {"icon": "🔊", "loop": false},
      "mime": "audio/mpeg",
      "audioBase64": "base64...",
      "sourceId": "clipId"
    }
  ]
}
```

### 4. Validation & Security
- 25 MB max bundle size (`SB_EXCHANGE_MAX_BUNDLE_BYTES`)
- Allowed MIME types: `audio/mpeg`, `audio/mp3`, `audio/mp4`, `audio/m4a`, `audio/ogg`, `audio/opus`, `audio/webm`, `audio/wav`
- Sanitizes all text inputs (labels, names, icons)
- Path traversal protection
- Deduplication by `sourceApp:sourceId`
- Atomic writes prevent partial bundles

## 📁 Files Changed

### Backend (PHP)
**api/soundboard.php** - Added 6 new actions:
- `export` - Export selected clips as JSON
- `import` - Import bundle with validation
- `sendTo` - Write to exchange directory inbox
- `incoming` - List pending bundles
- `importIncoming` - Import and delete bundle
- `discardIncoming` - Delete without importing
- Updated `ping` to include `exchangeEnabled`

### Frontend (JavaScript)
**js/soundboard-clip-manager.js** (NEW) - 590 lines
- Modal UI for clip management
- Checkbox selection with Select All/Clear
- Export/Import buttons
- Copy to Galen (when available)
- Incoming clips display with Import/Discard

**js/soundboard.js** - Modified
- Added "Manage clips" button to toolbar
- Wired to clip manager modal

**js/whats-new.js** - Modified
- Added entry `2026-11-14-b-clip-exchange`

### Styling
**styles.css** - Added ~180 lines
- `.clip-manager-modal` - Modal container
- `.clip-manager__*` - UI components
- `.clip-manager__incoming-*` - Incoming clips section
- Responsive layout (mobile + desktop)

### Configuration
**index.php** - Modified
- Added `soundboard-clip-manager.js` to script load list

### Testing
**test/galen-clips-fixture.json** (NEW)
- 3 test clips: speech, favorite, audio with base64
- Valid bundle format for import testing

**test/test-clip-exchange.html** (NEW)
- Interactive test page
- Tests all 6 API actions
- Import Galen fixture button
- Real-time status display

### Documentation
**DEPLOY-CLIP-EXCHANGE.md** (NEW)
- Complete deployment guide
- Directory setup instructions
- Security notes
- Troubleshooting guide

## 🔧 API Endpoints Added

All added to `/api/soundboard.php`:

1. **POST /api/soundboard.php?action=export**
   - Body: `{character, clipIds: [...]}`
   - Returns: JSON bundle as download

2. **POST /api/soundboard.php?action=import**
   - Body: `{character, bundle: {...}}`
   - Returns: `{imported: N, skipped: M}`

3. **POST /api/soundboard.php?action=sendTo**
   - Body: `{character, clipIds: [...], targetApp: "galen"}`
   - Returns: `{sent: true, bundleId: "..."}`

4. **GET /api/soundboard.php?action=incoming&app=blingus**
   - Returns: `{exchangeEnabled: bool, bundles: [...]}`

5. **POST /api/soundboard.php?action=importIncoming**
   - Body: `{character, bundleId}`
   - Returns: `{imported: N, skipped: M}`

6. **POST /api/soundboard.php?action=discardIncoming**
   - Body: `{bundleId}`
   - Returns: `{discarded: true}`

## 🎯 Contract Compliance

### Required Fields ✅
- `format: "knospe-soundboard-clips"` - Exact match
- `version: 1` - Integer version
- `sourceApp: "blingus"` - App identifier
- `exportedAt` - ISO8601 timestamp
- `clips[]` array with all required fields

### Clip Format ✅
- `type` - Maps to source type (youtube/speech/elevenlabs)
- `kind` - "audio" or "speech"
- `name` - Clip label
- `displayName` - Null or display override
- `text` - Speech text (speech clips only)
- `voiceId` - Optional voice ID
- `tags` - Icon and loop settings
- `mime` - Audio MIME type
- `audioBase64` - Base64 encoded audio data
- `sourceId` - Original clip ID for deduplication

### Galen Format Support ✅
- `type: "favorite"` - Imported as speech clips
- Unknown types - Mapped to closest equivalent
- Unknown fields - Safely ignored
- Partial data - Handled gracefully

## 🧪 Testing Strategy

### Unit Tests
- PHP functions: `sbExportClips`, `sbImportBundle`, `sbSendToApp`
- Validation: MIME types, size limits, sanitization
- Deduplication: sourceApp:sourceId matching

### Integration Tests
- Export → Download → Import cycle
- Galen fixture → Import → Verify clips
- Direct send → Check inbox → Import

### Manual Tests (test-clip-exchange.html)
1. Ping - Check API and exchange status
2. List - Show existing clips with checkboxes
3. Export - Download selected clips as JSON
4. Import - Upload and process bundle
5. Send to Galen - Write to exchange directory
6. Incoming - List and manage pending bundles
7. Galen Fixture - Quick import test

### Browser Compatibility
- Chrome/Edge - ✅ Primary target
- Firefox - ✅ Supported
- Safari - ✅ Supported
- Mobile browsers - ✅ Responsive design

## 🚀 Deployment Requirements

### Minimal (Export/Import only)
- Deploy modified files
- No server configuration needed
- Works immediately

### Full (with Direct Send)
- Deploy modified files
- Create exchange directory:
  ```bash
  sudo mkdir -p /var/lib/knospe-soundboard-exchange/inbox/{blingus,galen}
  sudo chown -R www-data:www-data /var/lib/knospe-soundboard-exchange
  sudo chmod 755 /var/lib/knospe-soundboard-exchange
  sudo chmod 775 /var/lib/knospe-soundboard-exchange/inbox/*
  ```
- Optional: Set `SOUNDBOARD_EXCHANGE_DIR` env var
- Verify write permissions

### Zero Configuration Fallback
- If exchange directory missing/unwritable:
  - "Copy to Galen" button hidden
  - Export/Import continue working
  - No errors shown to user

## 📊 Bundle Statistics

### Test Fixture
- **File**: test/galen-clips-fixture.json
- **Size**: ~1.2 KB (minimal audio)
- **Clips**: 3 (1 speech, 1 favorite, 1 audio)
- **Valid**: ✅ Passes all validation

### Typical Bundle
- **Average size**: 5-20 MB (depends on audio)
- **Max clips**: 40 (per character limit)
- **Max bundle**: 25 MB
- **Audio compression**: Base64 encoded

## 🔐 Security Measures

1. **Input Validation**
   - App names: `/^[a-z]{3,20}$/`
   - Bundle IDs: `/^[a-f0-9]{32}$/`
   - Clip IDs: `/^[a-f0-9]{12}$/`

2. **File Operations**
   - Atomic writes: `.tmp-*` → rename
   - Random UUIDs prevent collisions
   - Path traversal protection

3. **Content Validation**
   - MIME type whitelist
   - Size limits enforced
   - Text sanitization (sbCleanText, sbCleanLabel)

4. **Deduplication**
   - Key: `{sourceApp}:{sourceId}`
   - Prevents duplicate imports
   - Preserves original sourceId

## 📝 What's New Entry

Added to `js/whats-new.js`:

```javascript
{
  id: '2026-11-14-b-clip-exchange',
  date: '2026-11-14',
  who: null,
  lines: [
    'Sound Board has a Manage clips button: select any clips, Export to download a bundle file, or Import a bundle from another character or app.',
    'Copy to Galen sends clips directly to Galen\'s inbox when both apps share the same server. Incoming clips appear at the top for quick Import.',
    'Every clip type works: uploaded audio, YouTube clips, sound effects, and spoken lines. Export/Import work everywhere; direct copy needs server setup.',
  ],
}
```

## ✨ User Experience

### Discoverability
- "Manage clips" button in Sound Board toolbar
- Clear button labels (Export/Import/Copy to Galen)
- Toast confirmations for all actions

### Workflow - Export/Import
1. Open Sound Board
2. Click "Manage clips"
3. Select clips (checkboxes)
4. Click "Export selected"
5. Share/download JSON file
6. In target app: "Import from file"
7. Select bundle → clips added

### Workflow - Direct Send
1. Open Sound Board
2. Click "Manage clips"
3. Select clips
4. Click "Copy to Galen"
5. Toast: "Sent N clip(s)"
6. In Galen: "Manage clips"
7. See "Incoming clips from Blingus"
8. Click "Import" → clips added

### Error Handling
- Clear error messages in toasts
- Validation failures explained
- Graceful degradation (no exchange dir)
- Size limit warnings

## 🔍 Verification Checklist

- ✅ Export single clip
- ✅ Export multiple clips
- ✅ Export all clip types (audio, speech, effect)
- ✅ Import Blingus bundle
- ✅ Import Galen fixture
- ✅ Deduplication works (no duplicate imports)
- ✅ Direct send (with exchange dir)
- ✅ Incoming clips display
- ✅ Import incoming bundle
- ✅ Discard incoming bundle
- ✅ Graceful degradation (no exchange dir)
- ✅ Mobile responsive layout
- ✅ What's New entry appears
- ✅ Toast confirmations show

## 📦 Deliverables

1. ✅ Backend API (6 endpoints)
2. ✅ Frontend UI (clip manager modal)
3. ✅ Styles (responsive design)
4. ✅ Test fixture (Galen format)
5. ✅ Test page (interactive)
6. ✅ Deployment guide (detailed)
7. ✅ What's New entry
8. ✅ PR updated with full docs

## 🎉 Implementation Complete

All requirements met:
- ✅ Portable JSON contract (exact match)
- ✅ Export/Import via files (always works)
- ✅ Direct send via exchange directory (optional)
- ✅ Incoming clips UI (inbox management)
- ✅ Validation (size, MIME, sanitization)
- ✅ Security (atomic writes, deduplication)
- ✅ What's New entry
- ✅ Test fixtures and pages
- ✅ Deployment documentation

Ready for deployment and production use! 🚀
