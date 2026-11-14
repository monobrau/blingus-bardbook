# Manual E2E Verification Results

Date: 2026-11-09  
Agent: Cloud Agent cursor/elevenlabs-voice-everywhere-8b96

## Test Plan

This document outlines the manual end-to-end verification steps required to confirm that all TTS paths in the Blingus app correctly use the pasted ElevenLabs voice ID.

## Prerequisites

- Browser with localStorage support
- Access to the Blingus app deployed environment
- ElevenLabs account (may have 0 credits for quota error testing)
- Browser DevTools (Network tab for request inspection)

## Test Cases

### 1. Voice ID Paste Formats

**Objective:** Verify that various paste formats are correctly cleaned and saved.

**Steps:**
1. Open Settings modal
2. Clear localStorage: `localStorage.clear()` in DevTools console
3. Paste each format below into the Voice ID input:
   - Plain ID: `NJf2N7XT2iBE8xJ0XHlo`
   - URL with query: `https://elevenlabs.io/app/voices?voiceId=NJf2N7XT2iBE8xJ0XHlo`
   - URL with path: `https://elevenlabs.io/app/voice/NJf2N7XT2iBE8xJ0XHlo`
   - Quoted ID: `"NJf2N7XT2iBE8xJ0XHlo"`
   - ID with whitespace: `  NJf2N7XT2iBE8xJ0XHlo  `

**Expected Results:**
- [ ] Toast shows "Voice saved" for each paste
- [ ] Input field displays cleaned ID (no quotes, no URL parts, no whitespace)
- [ ] localStorage contains `elevenLabsVoiceId` with cleaned ID
- [ ] Verify: `localStorage.getItem('elevenLabsVoiceId')` returns `NJf2N7XT2iBE8xJ0XHlo`

### 2. Speak Button

**Objective:** Verify that the Speak button uses the pasted voice ID.

**Steps:**
1. Set voice ID in Settings (use any valid format from Test 1)
2. Navigate to a section with a Speak button
3. Enter text to speak
4. Open Browser DevTools → Network tab
5. Click Speak button
6. Inspect the request to `/api/speak.php`

**Expected Results:**
- [ ] Request method is POST
- [ ] Request body includes `voiceId` field
- [ ] `voiceId` value matches the cleaned ID from localStorage
- [ ] Example request body: `{"text":"Test","speaker":"blingus","voiceId":"NJf2N7XT2iBE8xJ0XHlo"}`

### 3. Character Sheet Clips

**Objective:** Verify that character sheet clips use the pasted voice ID.

**Steps:**
1. Ensure voice ID is set in Settings
2. Navigate to Character tab
3. Open "Sound clips" (available for Blingus)
4. Locate a skill or ability
5. Type a custom line to speak
6. Open DevTools → Network tab
7. Click "Save" or "Update"
8. Inspect the request to `/api/speak.php`

**Expected Results:**
- [ ] Request method is POST
- [ ] Request body includes `voiceId` field
- [ ] `voiceId` value matches the cleaned ID from localStorage
- [ ] Example request body: `{"text":"Custom line","speaker":"blingus","voiceId":"NJf2N7XT2iBE8xJ0XHlo"}`

### 4. Sound Board Spoken Clips

**Objective:** Verify that Sound Board spoken clips use the pasted voice ID.

**Steps:**
1. Ensure voice ID is set in Settings
2. Navigate to Sound Board tab
3. Locate the "Speak a line" section
4. Type a line to speak
5. Open DevTools → Network tab
6. Click "Speak and save"
7. Inspect the request to `/api/soundboard.php`

**Expected Results:**
- [ ] Request method is POST
- [ ] Request body includes `action: "speak"`
- [ ] Request body includes `voiceId` field
- [ ] `voiceId` value matches the cleaned ID from localStorage
- [ ] Example request body: `{"action":"speak","character":"blingus","text":"Line","label":"Pad name","icon":"🗣️","loop":false,"voiceId":"NJf2N7XT2iBE8xJ0XHlo"}`

### 5. Error Handling (ElevenLabs API)

**Objective:** Verify that ElevenLabs API errors are displayed clearly to the user.

**Note:** Since the ElevenLabs account has 0 credits, quota errors are expected.

**Steps:**
1. Set a valid voice ID in Settings
2. Attempt to use each TTS path (Speak, Sheet Clips, Sound Board)
3. Observe error messages

**Expected Results:**
- [ ] Errors are shown via toast notification (not silent failures)
- [ ] Error messages are clear and user-friendly
- [ ] Examples of expected errors:
  - "Quota exceeded. Please check your plan."
  - "Voice not found. Please check the voice ID."
  - "Speech failed (HTTP 402)" (quota error)
  - Other ElevenLabs API error messages

### 6. Fallback Behavior (No Voice ID Set)

**Objective:** Verify that the system falls back to default voices when no custom voice ID is set.

**Steps:**
1. Clear voice ID from Settings (leave input empty and save)
2. Verify localStorage: `localStorage.getItem('elevenLabsVoiceId')` returns `null`
3. Attempt to use each TTS path (Speak, Sheet Clips, Sound Board)

**Expected Results:**
- [ ] No errors occur
- [ ] Default character voices are used
- [ ] For Blingus: default voice is `NJf2N7XT2iBE8xJ0XHlo` (hardcoded in server)
- [ ] Requests have empty or missing `voiceId` field
- [ ] Server uses character-specific or global default voice

### 7. Settings UI Updates

**Objective:** Verify that Settings UI changes are visible and correct.

**Steps:**
1. Open Settings modal
2. Locate the ElevenLabs section

**Expected Results:**
- [ ] Hint text reads: "Voice ID for all spoken text (saved in this browser only). Leave blank for default."
- [ ] Link text is "Find voices" (not "ElevenLabs voices")
- [ ] Placeholder text is "Paste a voice ID or URL"

## Verification Summary

**Date of Verification:** [To be filled by tester]  
**Tester:** [To be filled by tester]  
**Environment:** [Deployment URL]

### Results

- [ ] All paste formats work correctly
- [ ] Voice saved confirmation shows on save
- [ ] Speak button uses pasted voice ID
- [ ] Character sheet clips use pasted voice ID
- [ ] Sound Board spoken clips use pasted voice ID
- [ ] ElevenLabs errors shown clearly to user
- [ ] Fallback to default voice works when no ID set
- [ ] Settings UI updates are correct

### Notes

[Additional observations, issues found, or comments]

---

## Automated Test

For quick verification of voice ID format parsing, open `test/test-voice-id-integration.html` in a browser. This test verifies:

- Voice ID format parsing (URLs, quotes, whitespace)
- localStorage integration
- Expected API request structures

## Deployment Files

The following files contain changes and must be deployed:

1. `js/speak.js` - Enhanced voice ID handling
2. `js/soundboard-clips.js` - Send voiceId to API
3. `api/speak.php` - Accept voice ID URLs
4. `api/soundboard.php` - Use voiceId in speak action
5. `index.php` - Update Settings hint

---

**Status:** ⏳ Awaiting manual verification by tester
