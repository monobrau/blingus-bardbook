<?php
/**
 * Auto-versioning index.php
 * Automatically generates cache-busting versions based on file modification times
 */

// Get version numbers based on file modification times
$moduleFiles = [
  'constants.js',
  'shared-utils.js',
  'storage-utils.js',
  'ui-utils.js',
  'tab-navigation.js',
  'search-utils.js',
  'search-enhancements.js',
  'keyboard-shortcuts.js',
  'karaoke-manager.js',
  'data/generators-data.js',
  'data/spells-data.js',
  'data/bardic-data.js',
  'data/mockery-data.js',
  'data/actions-data.js',
  'data/criticals-data.js',
  'data/skillchecks-data.js',
  'script.js',
  'styles.css'
];

$versions = [];
foreach ($moduleFiles as $file) {
  // script.js and styles.css are at root level, others are in js/ folder
  if ($file === 'styles.css' || $file === 'script.js') {
    $filePath = __DIR__ . '/' . $file;
  } else {
    $filePath = __DIR__ . '/js/' . $file;
  }
  $versions[$file] = file_exists($filePath) ? filemtime($filePath) : time();
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>Blingus' Bardbook</title>
  <link rel="stylesheet" href="styles.css?v=<?php echo $versions['styles.css']; ?>" />
</head>
<body>
  <header class="banner">
    <div class="banner__wrap">
      <div class="crest" aria-hidden="true">⚔️</div>
      <h1>Blingus' Bardbook</h1>
      <div class="crest" aria-hidden="true">🛡️</div>
    </div>
    <p class="subtitle">Iconic, humorous song‑parody lines for spells, Bardic Inspiration, Vicious Mockery, and character action ideas</p>
  </header>

  <nav class="toolbar" aria-label="Controls">
    <div class="toolbar__container">
      <!-- Section Tabs Row -->
      <div class="toolbar__row toolbar__row--tabs">
        <div class="tabs" role="tablist" aria-label="Content sections">
          <button class="tab tab--active" role="tab" data-section="spells" aria-selected="true" data-tooltip="Spell song parodies (Press 1)">
            <span class="tab__icon">🔮</span>
            <span class="tab__label">Spells</span>
          </button>
          <button class="tab" role="tab" data-section="bardic" aria-selected="false" data-tooltip="Bardic inspiration lines (Press 2)">
            <span class="tab__icon">✨</span>
            <span class="tab__label">Bardic</span>
          </button>
          <button class="tab" role="tab" data-section="mockery" aria-selected="false" data-tooltip="Vicious mockery insults (Press 3)">
            <span class="tab__icon">🗡️</span>
            <span class="tab__label">Mockery</span>
          </button>
          <button class="tab" role="tab" data-section="actions" aria-selected="false" data-tooltip="Character action ideas (Press 4)">
            <span class="tab__icon">🎭</span>
            <span class="tab__label">Actions</span>
          </button>
          <button class="tab" role="tab" data-section="criticalHits" aria-selected="false" data-tooltip="Critical hit descriptions (Press 5)">
            <span class="tab__icon">⚔️</span>
            <span class="tab__label">Crit Hits</span>
          </button>
          <button class="tab" role="tab" data-section="criticalFailures" aria-selected="false" data-tooltip="Critical failure descriptions (Press 6)">
            <span class="tab__icon">💥</span>
            <span class="tab__label">Crit Fails</span>
          </button>
          <button class="tab" role="tab" data-section="skillChecks" aria-selected="false" data-tooltip="Skill check results (Press 7)">
            <span class="tab__icon">🎲</span>
            <span class="tab__label">Skills</span>
          </button>
        </div>
      </div>

      <!-- Category Chips Row -->
      <div class="toolbar__row toolbar__row--chips" id="categoryChipsRow">
        <div class="chips" role="group" aria-label="Categories" id="categoryChips">
          <!-- Category chips will be dynamically populated -->
        </div>
      </div>

      <!-- Hidden selects for backward compatibility -->
      <select id="sectionSelect" style="display: none;" aria-hidden="true">
        <option value="spells">Spell Parodies</option>
        <option value="bardic">Bardic Inspiration</option>
        <option value="mockery">Vicious Mockery</option>
        <option value="actions">What's Your Character Doing?</option>
        <option value="criticalHits">Critical Hit Description</option>
        <option value="criticalFailures">Critical Failure Description</option>
        <option value="skillChecks">Skill Check Results</option>
      </select>
      <select id="categorySelect" style="display: none;" aria-hidden="true"></select>

      <!-- Search & Quick Filters Row -->
      <div class="toolbar__row toolbar__row--search">
        <label class="search" style="flex: 1; min-width: 200px;">
          <input id="searchInput" type="search" placeholder="Search all lyrics, songs, artists, or actions..." />
        </label>
        <button id="clearBtn" class="btn btn--secondary" data-tooltip="Clear search (Esc)">Clear</button>
        <label class="toggle" data-tooltip="Show only starred items (Ctrl+F)">
          <input type="checkbox" id="favoritesOnly" />
          <span>⭐ Favorites</span>
        </label>
        <label class="toggle" data-tooltip="Toggle dark theme (Ctrl+D)">
          <input type="checkbox" id="darkModeToggle" />
          <span>🌙 Dark</span>
        </label>
      </div>

      <!-- Button Groups Row -->
      <div class="toolbar__row toolbar__row--button-groups">
        <!-- Content Actions Group -->
        <div class="button-group">
          <span class="button-group__label">Content</span>
          <div>
            <button id="addEditBtn" class="btn btn--group" data-tooltip="Add or edit items">✏️ Edit Items</button>
            <button id="historyBtn" class="btn btn--group" data-tooltip="View recently used items (Press H)">📜 History</button>
          </div>
        </div>

        <!-- Generators Group -->
        <div class="button-group">
          <span class="button-group__label">Generators</span>
          <div>
            <button id="battleCryBtn" class="btn btn--group" data-tooltip="Random battle cry">⚔️</button>
            <button id="insultBtn" class="btn btn--group" data-tooltip="Random insult">🗡️</button>
            <button id="complimentBtn" class="btn btn--group" data-tooltip="Random compliment">💬</button>
            <button id="introductionBtn" class="btn btn--group" data-tooltip="Chaucer introduction">🎭</button>
            <button id="manageGeneratorsBtn" class="btn btn--group" data-tooltip="Manage generator content">⚙️</button>
          </div>
        </div>

        <!-- Data Management Group -->
        <div class="button-group">
          <span class="button-group__label">Data</span>
          <div>
            <button id="exportBtn" class="btn btn--group" data-tooltip="Export all data">📥 Export</button>
            <button id="importBtn" class="btn btn--group" data-tooltip="Import data">📤 Import</button>
            <button id="fileStorageBtn" class="btn btn--group" data-tooltip="File or server storage">💾</button>
          </div>
        </div>
      </div>

      <!-- Fuzzy Search Toggle (hidden by default, dynamically added by search-enhancements.js) -->
      <div class="toolbar__row toolbar__row--filters" style="display: none;">
      </div>
    </div>
  </nav>

  <main id="content" class="content" aria-live="polite"></main>

  <footer class="footer">
    <div style="font-size: 15px; margin-bottom: 10px;">
      💡 <strong>Quick Tips:</strong> Click any line to copy • Star your favorites • Use keyboard shortcuts for power users
    </div>
    <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; font-size: 13px; opacity: 0.9;">
      <span>⌨️ <kbd>?</kbd> Help</span>
      <span>⌨️ <kbd>Ctrl+K</kbd> Search</span>
      <span>⌨️ <kbd>1-7</kbd> Sections</span>
      <span>⌨️ <kbd>H</kbd> History</span>
      <span>⌨️ <kbd>↑↓</kbd> Navigate</span>
      <span>⌨️ <kbd>Enter</kbd> Copy</span>
    </div>
  </footer>

  <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>

  <!-- Generator Display Modal -->
  <div id="generatorModal" class="modal" role="dialog" aria-labelledby="generatorTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 600px;">
      <div class="modal__header">
        <h2 id="generatorTitle">Generated Text</h2>
        <button class="modal__close" id="generatorModalClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div id="generatorText" style="padding: 16px; font-size: 18px; line-height: 1.6; min-height: 60px; border: 2px solid var(--accent); border-radius: 6px; margin-bottom: 12px;"></div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="generatorCopyBtn" class="btn">Copy</button>
          <button id="generatorCloseBtn" class="btn">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- History Modal -->
  <div id="historyModal" class="modal" role="dialog" aria-labelledby="historyTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 700px;">
      <div class="modal__header">
        <h2 id="historyTitle">📜 Recently Used</h2>
        <button class="modal__close" id="historyModalClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div id="historyList" style="display: flex; flex-direction: column; gap: 8px; max-height: 60vh; overflow-y: auto;"></div>
      </div>
      <div class="modal__footer">
        <button id="historyCloseBtn" class="btn">Close</button>
      </div>
    </div>
  </div>

  <!-- Generator Management Modal -->
  <div id="generatorManageModal" class="modal" role="dialog" aria-labelledby="generatorManageTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 700px;">
      <div class="modal__header">
        <h2 id="generatorManageTitle">Manage Generators</h2>
        <button class="modal__close" id="generatorManageClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <div style="margin-bottom: 16px;">
          <label>Generator Type
            <select id="generatorTypeSelect" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px;">
              <option value="battleCries">⚔️ Battle Cries</option>
              <option value="insults">🗡️ Insults</option>
              <option value="compliments">💬 Compliments</option>
              <option value="introductions">🎭 Chaucer Introductions</option>
            </select>
          </label>
        </div>
        <div style="margin-bottom: 16px;">
          <button id="addGeneratorBtn" class="btn" style="width: 100%;">➕ Add New</button>
        </div>
        <div id="generatorsList" style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;"></div>
      </div>
      <div class="modal__footer">
        <button id="generatorManageCloseBtn" class="btn">Close</button>
      </div>
    </div>
  </div>

  <!-- YouTube Player Modal -->
  <div id="youtubePlayerModal" class="modal" role="dialog" aria-labelledby="youtubePlayerTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 900px;">
      <div class="modal__header">
        <h2 id="youtubePlayerTitle">🎵 Karaoke Track</h2>
        <button class="modal__close" id="youtubePlayerClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body" style="padding: 20px;">
        <div id="youtubePlayerContainer" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000;">
          <video id="karaokeLocalVideo" controls playsinline style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000;"></video>
          <iframe id="youtubePlayerFrame" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>
        <div id="youtubeFallback" style="display: none; margin-top: 16px; text-align: center;">
          <p style="color: var(--ink); margin-bottom: 12px;">Video embedding is restricted. Open on YouTube instead?</p>
          <button id="youtubeOpenTabBtn" class="btn" style="background: #ff0000; color: white;">Open on YouTube</button>
        </div>
      </div>
      <div class="modal__footer">
        <button id="youtubePlayerCloseBtn" class="btn">Close</button>
      </div>
    </div>
  </div>

  <!-- Generator Edit Modal -->
  <div id="generatorEditModal" class="modal" role="dialog" aria-labelledby="generatorEditTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 600px;">
      <div class="modal__header">
        <h2 id="generatorEditTitle">Add Generator Item</h2>
        <button class="modal__close" id="generatorEditClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <label>
          Text
          <textarea id="generatorEditText" rows="3" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;"></textarea>
        </label>
      </div>
      <div class="modal__footer">
        <button id="saveGeneratorBtn" class="btn">Save</button>
        <button id="cancelGeneratorBtn" class="btn">Cancel</button>
        <button id="deleteGeneratorBtn" class="btn" style="background: #c44; color: white; display: none;">Delete</button>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div id="editModal" class="modal" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
    <div class="modal__content">
      <div class="modal__header">
        <h2 id="modalTitle">Add New Item</h2>
        <button class="modal__close" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <label>
          Text
          <textarea id="editText" rows="3" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;"></textarea>
        </label>
        <label id="songLabel" style="display: none;">
          Song
          <input type="text" id="editSong" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
        </label>
        <label id="artistLabel" style="display: none;">
          Artist
          <input type="text" id="editArtist" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
        </label>
        <div id="youtubeFields" style="display: none;">
          <label>
            YouTube URL or Video ID
            <input type="text" id="editYoutube" placeholder="https://youtube.com/watch?v=..." style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
          </label>
          <label>
            Start Time (seconds or mm:ss)
            <input type="text" id="editStartTime" placeholder="30 or 0:30" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
          </label>
          <button id="testYoutubeBtn" class="btn" style="width: 100%; margin-top: 8px;">▶️ Test Playback</button>
          <div id="localKaraokeStatus" style="display: none; margin-top: 8px; padding: 8px 12px; background: #e8f5e9; border-radius: 6px; font-size: 13px; color: #2e7d32;">
            ✅ Local karaoke saved on server
          </div>
          <div id="youtubeSuggestion" style="display: none; margin-top: 12px; padding: 12px; background: #f0f4f8; border-radius: 6px; border: 1px solid var(--accent);">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: var(--accent);">💡 Karaoke Search</div>
            <div id="youtubeSuggestionText" style="font-size: 13px; color: var(--ink); margin-bottom: 8px;"></div>
            <button id="youtubeSearchBtn" class="btn" style="width: 100%; background: #ff0000; color: white; font-size: 14px;">🎤 Search &amp; Download Karaoke</button>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button id="saveEditBtn" class="btn">Save</button>
        <button id="cancelEditBtn" class="btn">Cancel</button>
        <button id="deleteEditBtn" class="btn" style="background: #c44; color: white; display: none;">Delete</button>
      </div>
    </div>
  </div>

  <!-- Karaoke Search Modal -->
  <div id="karaokeSearchModal" class="modal" role="dialog" aria-labelledby="karaokeSearchTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 700px;">
      <div class="modal__header">
        <h2 id="karaokeSearchTitle">🎤 Find Karaoke</h2>
        <button class="modal__close" id="karaokeSearchClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body">
        <p id="karaokeSearchQuery" style="font-weight: bold; margin-bottom: 8px;"></p>
        <p id="karaokeSearchStatus" style="color: var(--ink); opacity: 0.8; margin-bottom: 12px;">Searching...</p>
        <div id="karaokeSearchResults" class="karaoke-results"></div>
      </div>
      <div class="modal__footer">
        <button id="karaokeSearchCloseBtn" class="btn">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Core utilities (load first - other modules depend on these) -->
  <script src="js/constants.js?v=<?php echo $versions['constants.js']; ?>"></script>
  <script src="js/shared-utils.js?v=<?php echo $versions['shared-utils.js']; ?>"></script>

  <!-- Utility modules -->
  <script src="js/storage-utils.js?v=<?php echo $versions['storage-utils.js']; ?>"></script>
  <script src="js/ui-utils.js?v=<?php echo $versions['ui-utils.js']; ?>"></script>

  <!-- Tab navigation -->
  <script src="js/tab-navigation.js?v=<?php echo $versions['tab-navigation.js']; ?>"></script>

  <!-- Search enhancements -->
  <script src="js/search-utils.js?v=<?php echo $versions['search-utils.js']; ?>"></script>
  <script src="js/search-enhancements.js?v=<?php echo $versions['search-enhancements.js']; ?>"></script>

  <!-- Keyboard shortcuts -->
  <script src="js/keyboard-shortcuts.js?v=<?php echo $versions['keyboard-shortcuts.js']; ?>"></script>

  <!-- Karaoke (search, download, local playback) -->
  <script src="js/karaoke-manager.js?v=<?php echo $versions['karaoke-manager.js']; ?>"></script>

  <!-- Data modules (load before main script) -->
  <script src="js/data/generators-data.js?v=<?php echo $versions['data/generators-data.js']; ?>"></script>
  <script src="js/data/spells-data.js?v=<?php echo $versions['data/spells-data.js']; ?>"></script>
  <script src="js/data/bardic-data.js?v=<?php echo $versions['data/bardic-data.js']; ?>"></script>
  <script src="js/data/mockery-data.js?v=<?php echo $versions['data/mockery-data.js']; ?>"></script>
  <script src="js/data/actions-data.js?v=<?php echo $versions['data/actions-data.js']; ?>"></script>
  <script src="js/data/criticals-data.js?v=<?php echo $versions['data/criticals-data.js']; ?>"></script>
  <script src="js/data/skillchecks-data.js?v=<?php echo $versions['data/skillchecks-data.js']; ?>"></script>

  <!-- Main application script -->
  <script src="script.js?v=<?php echo $versions['script.js']; ?>"></script>
</body>
</html>
