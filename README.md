# 🎭 Blingus's Bardbook

A D&D bard's best friend! Generate hilarious song-parody lines for spells, Bardic Inspiration, Vicious Mockery, and tons of character action ideas—all tailored for Blingus, the Wayfarer Fairy Bard.

## 🎵 Features

### Spell Parodies
Turn famous songs into spell-casting one-liners! Includes parodies from:
- **Classic Rock**: The Beatles, Queen, AC/DC, Guns N' Roses, Journey
- **80s & 90s Hits**: Beastie Boys, Nirvana, Smashing Pumpkins, Foo Fighters
- **Pop & R&B**: Michael Jackson, Prince, Mariah Carey, Sade
- **Rock Band Classics**: Soundgarden, Faith No More, Kiss, Joan Jett, Chicago
- And many more!

**Example:**
- Cast "Healing Word" with: *"Don't stop believin'—HP climb; hold on to that feelin', you'll be fine."* (Journey's "Don't Stop Believin'")
- Cast "Prestidigitation" with: *"Brass monkey—that funky monkey; chill the drink, clink the clink, get funky."* (Beastie Boys' "Brass Monkey")
- Cast "Bane" with: *"Behind blue eyes, the penalty lies—no one knows what it's like to roll with these dice."* (The Who's "Behind Blue Eyes")

### Bardic Inspiration
Motivational song lines organized by use case:
- Attack Rolls
- Saving Throws
- Skill Checks (Persuasion, Stealth, Investigation, Athletics)
- Initiative
- Combat Inspiration (Damage & AC/Defense)

**Example:**
- *"No sleep til Brooklyn—no rest til this hit; swing the blade, don't quit, make it fit."* (Beastie Boys' "No Sleep Til Brooklyn")

### Vicious Mockery
Savage roasts in song form, including character-specific burns for:
- Quick Hits
- Party Members (Brawn, Puck, Vadania, Blingus)
- Enemy Types (Dragons, Nobles, Liches, Undead, etc.)

**Example:**
- *"Behind blue eyes, your failure cries—no one knows what it's like to be the mocked guy."* (The Who's "Behind Blue Eyes")

### Character Action Ideas
Hundreds of roleplay prompts organized by:
- **Situations**: Tavern, Inn, Dungeon, Camp, Town Square, Shop, Temple, Market, Blacksmith
- **Environments**: Mountains, Jungle, Plains, Forest, Desert, Swamp, Bad Weather, Travelling

Each suggestion includes the appropriate D&D 5e skill or tool proficiency.

## 🎯 Key Features

### Core Functionality
- **🎲 Feeling Chaotic?** - Random selection button on all sections for quick inspiration
- **📜 Recently Used** - History tracker showing your last 10 copied items (accessible via modal popup)
- **⭐ Favorites** - Star items for quick access
- **🔍 Search** - Filter by lyrics, song name, or artist
- **🌙 Dark Mode** - Toggle between light and dark themes
- **⌨️ Keyboard Navigation** - Arrow keys to navigate cards, Enter to copy
- **🔞 Adult Content Toggle** - For those raunchier sessions

### Generators
- **⚔️ Battle Cry Generator** - 30+ Blingus-themed battle cries with Feywild references
- **🗡️ Insult Generator** - 37+ sharp-tongued insults referencing Forgotten Realms lore
- **💬 Compliment Generator** - 40+ backhanded compliments (reluctant approval style)
- **🎲 Manage Generators** - Add, edit, or delete generator items (including editing/deleting defaults)
- Generators display in a modal popup so you can see the text before copying

### Customization
- **✏️ Add/Edit/Delete Items** - Customize spells, bardic inspiration, mockery, and actions
- **✏️ Edit/Delete Defaults** - Modify or hide default items without deleting them permanently
- **🎵 YouTube Karaoke Links** - Add YouTube karaoke track links with start times to song-based items
  - YouTube button (▶️) on cards opens YouTube with start time in new tab
  - Start time badge with quick inline editing
  - Auto-match suggestions: Shows YouTube search link when editing items without YouTube URL
  - Perfect for singing along during gameplay!
- All customizations persist across sessions

### Data Management
- **📥 Export/Import** - Complete backup including ALL default content plus all customizations
  - Export includes: default spells, actions, bardic, mockery, generators PLUS favorites, custom items, edits, deletions, history
  - Import restores everything with confirmation prompt
- **💾 Server Storage** (Automatic Detection)
  - When running on a web server with PHP: automatically saves to server-side JSON file
  - When running locally: uses File System Access API (Chrome/Edge) or falls back to localStorage
  - **Auto-save**: Changes automatically saved to server ~500ms after you stop editing
  - Visual feedback: Shows "💾 Auto-saved" notification (limited to avoid spam)
  - Cross-device sync: Access your data from any device/browser

## 📖 Examples

### Spell Parodies
- **Healing Word**: *"If everything could ever feel this real forever—HP restored, never sever."* (Foo Fighters' "Everlong")
- **Faerie Fire**: *"Black hole sun—won't you come, darkness covers all; stealth undone, run."* (Soundgarden's "Black Hole Sun")
- **Vicious Mockery**: *"You're so vain, you probably think this spell's about you—and you're right; that ego's heavy, good night."* (Carly Simon's "You're So Vain")

### Bardic Inspiration
- **Attack Rolls**: *"I love rock and roll—put another coin in, baby; swing and strike, hit the groove, maybe."* (Joan Jett's "I Love Rock 'n' Roll")
- **Initiative**: *"25 or 6 to 4—waiting for the turn; clock strikes now, action's earned, here we go."* (Chicago's "25 or 6 to 4")
- **Combat Damage**: *"What is it? It's epic—damage drops, health bar flips it; big hit, can't miss it."* (Faith No More's "Epic")

## 🚀 Usage

### Local Usage
Simply open `index.html` in your web browser. All functionality is client-side using JavaScript and localStorage for persistence.

### Server Deployment
For server-side storage with automatic sync:
1. Deploy to a web server with PHP (PHP-FPM recommended)
2. Ensure the `/data/` directory exists and is writable
3. Configure Nginx/Apache to execute PHP files (see `NGINX_CONFIG.md` and `PHP_SETUP.md`)
4. Update Nginx config to prefer `index.php` over `index.html` for auto-versioning
5. The app automatically detects server environment and uses PHP storage
6. Changes auto-save ~500ms after you stop editing

### Managing Generators
1. Click "🎲 Manage Generators" button
2. Select generator type (Battle Cries, Insults, Compliments)
3. Click "➕ Add New" to add custom items
4. Click any item to edit it
5. Default items can be edited or deleted (editing hides original, adds edited version)

### Editing/Deleting Default Items
1. Click "Add/Edit Items" button
2. Click any item card to edit it
3. To delete: Edit and click "Delete" button
4. Edited defaults are hidden and replaced with your version
5. Changes persist across sessions

### Adding YouTube Karaoke Links
1. Edit any song-based item (spells, bardic inspiration, mockery)
2. Enter YouTube URL or video ID in the "YouTube URL" field
3. Optionally set a start time (e.g., "30" for 30 seconds or "1:30" for 1 minute 30 seconds)
4. If no YouTube URL exists, a karaoke suggestion will appear with a search button
5. Click the YouTube button (▶️) on cards to open the track with start time
6. Click the start time badge on cards to quickly edit the start time

### Export/Import
- **Export**: Saves complete dataset including ALL default content (spells, actions, bardic, mockery, generators) PLUS all customizations (favorites, custom items, edits, deletions, history)
- **Import**: Restores everything from a previous export (with confirmation prompt)
- **Auto-save**: On servers, changes are automatically saved (no manual save needed)

## 🛠️ Technical Details

### Storage Options
- **LocalStorage**: Default fallback for all browsers
- **File System Access API**: Used when available (Chrome/Edge on localhost/HTTPS)
- **Server-side JSON**: Automatic when running on web server with PHP
- **Automatic Detection**: App detects environment and uses appropriate storage method
- **Auto-Versioning**: On servers, `index.php` automatically generates cache-busting version numbers based on file modification times

### Server Setup
See `NGINX_CONFIG.md`, `PHP_SETUP.md`, and `AUTO_VERSIONING.md` for detailed server configuration instructions.

## 📝 Categories

### Situations:
Tavern, Inn, Dungeon, Camp, Town Square, Shop, Temple, Market, Blacksmith

### Environments:
Mountains, Jungle, Plains, Forest, Desert, Swamp, Bad Weather, Travelling/On the Trail

## 🎭 About Blingus

This bardbook is tailored for **Blingus, the Wayfarer Fairy Bard**—a wanderlust-driven character with:
- A complicated past (abandoned family, multiple marriages)
- A deep bond with his mentor Bo (seeking Zybilna, the Archfey of Prismeer)
- Connections to the Midnight Carnival and the Feywild
- A sharp, sarcastic wit with reluctant approval style

All generators and content reflect Blingus's personality, backstory, and the Forgotten Realms setting.

## 📋 Change Log

### Latest Features
- **🎵 YouTube Karaoke Links**: Add YouTube karaoke track links with start times to song-based items
  - YouTube button on cards opens tracks directly with start time
  - Start time badge with quick inline editing
  - Auto-match suggestions help find karaoke versions
- **Auto-Versioning Cache-Busting**: `index.php` automatically generates version numbers based on file modification times (no manual version bumping needed)
- **🔄 Clear Cache Button**: Force reload button for web server deployments (only visible on server)
- **Toolbar Reorganization**: Improved layout with Clear button next to search, separate checkbox row
- **Global Search**: Search now searches across ALL sections and categories, not just the active one
- **Automatic Server Saving**: Changes auto-save to server ~500ms after editing stops
- **Complete Export**: Export now includes all default content for full backup
- **Generator Management UI**: Add/edit/delete battle cries, insults, and compliments
- **Edit Default Items**: Modify or hide default items without losing them
- **Server Storage Detection**: Automatically uses PHP storage when on web server
- **Visual Feedback**: Toast notifications for auto-save status

### Previous Updates
- Recently Used history moved to modal popup
- Generator text displays in popup before copying
- Dark mode support with proper contrast
- Keyboard navigation (arrow keys, Enter to copy)
- Battle cry, insult, and compliment generators
- "Feeling Chaotic?" button on all sections

---

*Created for bringing chaos and comedy to your D&D sessions, one song parody at a time!* 🎸⚔️
