<?php
/**
 * Auto-versioning index.php
 * Automatically generates cache-busting versions based on file modification times
 */

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

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
  'action-workflow.js',
  'outcome-generate.js',
  'character-sheet.js',
  'workflow-catalog.js',
  'karaoke-manager.js',
  'data/spells-data.js',
  'data/bardic-data.js',
  'data/mockery-data.js',
  'data/actions-data.js',
  'data/criticals-data.js',
  'data/skillchecks-data.js',
  'data/scene-outcomes.js',
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
  <title>Blingus's Bardbook</title>
  <link rel="stylesheet" href="styles.css?v=<?php echo $versions['styles.css']; ?>" />
</head>
<body>
  <header class="banner banner--compact">
    <div class="banner__wrap">
      <div class="crest" aria-hidden="true">⚔️</div>
      <h1>Blingus's Bardbook</h1>
      <div class="crest" aria-hidden="true">🛡️</div>
    </div>
    <p class="subtitle">Song parodies, bardic lines, and Claude-backed table lines</p>
  </header>

  <nav class="toolbar" aria-label="Controls">
    <div class="toolbar__container">
      <!-- Section Tabs + utilities -->
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
          <button class="tab" role="tab" data-section="outcomes" aria-selected="false" data-tooltip="Scene outcomes and Vicious Mockery (Press 3)">
            <span class="tab__icon">🎲</span>
            <span class="tab__label">Outcomes</span>
          </button>
          <button class="tab" role="tab" data-section="character" aria-selected="false" data-tooltip="Live character sheet for Claude">
            <span class="tab__icon">🧚</span>
            <span class="tab__label">Character</span>
          </button>
        </div>
        <div class="toolbar__utilities">
          <button type="button" id="historyBtn" class="btn btn--secondary btn--compact" data-tooltip="Recently used items (Press H)">History</button>
          <button type="button" id="settingsBtn" class="btn btn--secondary btn--compact" data-tooltip="Edit, data, dark mode, personality" aria-haspopup="dialog">Settings</button>
        </div>
      </div>

      <!-- Category Chips Row (spells, bardic) -->
      <div class="toolbar__row toolbar__row--chips" id="categoryChipsRow">
        <div class="chips" role="group" aria-label="Categories" id="categoryChips">
          <!-- Category chips will be dynamically populated -->
        </div>
      </div>

      <!-- Progressive Outcomes wizard (pill questions) -->
      <div id="workflowPanel" class="workflow workflow--wizard toolbar__row" style="display: none;" aria-label="Blingus outcome wizard">
        <div class="workflow__wizard">
          <div class="workflow__step workflow__step--mood" id="workflowMoodStep">
            <button type="button" class="workflow__step-summary" id="workflowMoodSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowMoodBody">
              <div class="workflow__mood-head">
                <div class="workflow__question">Blingus's mood <span class="workflow__hint">(colors every Claude line)</span> <button type="button" class="btn btn--ghost btn--compact catalog-manage-btn" data-catalog="moods">Manage</button></div>
                <button type="button" id="personalityBtn" class="btn btn--ghost btn--compact" data-tooltip="Edit standing personality for Claude">Personality</button>
              </div>
              <div class="chips chips--pills" id="workflowMoodChips" role="group" aria-label="Blingus mood"></div>
              <input type="text" id="workflowMoodInput" class="workflow__name-input" placeholder="Or type a mood…" maxlength="80" autocomplete="off" />
              <div class="workflow__question workflow__rating-label">How adult? <span class="workflow__hint">(optional — click again to clear)</span></div>
              <div class="chips chips--pills" id="workflowRatingChips" role="group" aria-label="Content rating"></div>
            </div>
          </div>
          <div class="workflow__step" id="workflowPaceStep">
            <button type="button" class="workflow__step-summary" id="workflowPaceSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowPaceBody">
              <div class="workflow__question" id="workflowPaceLabel">1. In battle or out?</div>
              <div class="workflow__hint">In battle: five one-breath options (~6 seconds each). Out of battle: longer roleplay beats (5 lines).</div>
              <div class="chips chips--pills" id="workflowPaceChips" role="group" aria-label="Battle or roleplay"></div>
            </div>
          </div>
          <div class="workflow__step" id="workflowOutcomeStep" hidden>
            <button type="button" class="workflow__step-summary" id="workflowOutcomeSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowOutcomeBody">
              <div class="workflow__question" id="workflowOutcomeLabel">2. What do you need?</div>
              <div id="workflowOutcomeChips" class="workflow__outcome-groups" role="group" aria-label="Outcome type"></div>
            </div>
          </div>
          <div class="workflow__step" id="workflowSceneStep" hidden>
            <button type="button" class="workflow__step-summary" id="workflowSceneSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowSceneBody">
              <div class="workflow__question" id="workflowSceneLabel">3. Where are you?</div>
              <div class="workflow__scene-group-label">Indoors or outdoors?</div>
              <div class="chips chips--pills" id="workflowSettingChips" role="group" aria-label="Indoors or outdoors"></div>
              <div id="workflowPlaceBlock" hidden>
                <div class="workflow__scene-group-label">Place <button type="button" class="btn btn--ghost btn--compact catalog-manage-btn" data-catalog="places">Manage</button></div>
                <div id="workflowSceneGroups" class="workflow__scene-groups"></div>
                <input type="text" id="workflowSceneInput" class="workflow__name-input" placeholder="Or type a place…" maxlength="80" autocomplete="off" />
              </div>
              <div id="workflowConditionBlock" hidden>
                <div id="workflowWeatherBlock" hidden>
                  <div class="workflow__scene-group-label">Weather <span class="workflow__hint">(optional)</span></div>
                  <div class="chips chips--pills" id="workflowWeatherChips" role="group" aria-label="Weather"></div>
                </div>
                <div id="workflowLightingBlock" hidden>
                  <div class="workflow__scene-group-label">Lighting <span class="workflow__hint">(optional)</span> <button type="button" class="btn btn--ghost btn--compact catalog-manage-btn" data-catalog="lighting">Manage</button></div>
                  <div class="chips chips--pills" id="workflowLightingChips" role="group" aria-label="Lighting"></div>
                </div>
                <div class="workflow__scene-group-label">Environment <span class="workflow__hint">(optional, multi)</span> <button type="button" class="btn btn--ghost btn--compact catalog-manage-btn" data-catalog="environment">Manage</button></div>
                <div class="chips chips--pills" id="workflowEnvironmentChips" role="group" aria-label="Environment"></div>
              </div>
            </div>
          </div>
          <div class="workflow__step" id="workflowAttackTypeStep" hidden>
            <button type="button" class="workflow__step-summary" id="workflowAttackTypeSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowAttackTypeBody">
              <div class="workflow__question" id="workflowAttackTypeLabel">3. Attack type?</div>
              <div class="chips chips--pills" id="workflowAttackTypeChips" role="group" aria-label="Attack type"></div>
            </div>
          </div>
          <div class="workflow__step" id="workflowDetailStep" hidden>
            <button type="button" class="workflow__step-summary" id="workflowDetailSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowDetailBody">
              <div class="workflow__question" id="workflowDetailLabel">3. Which skill or weapon?</div>
              <div class="chips chips--pills" id="workflowDetailChips" role="group" aria-label="Weapon, spell, or skill"></div>
              <div class="workflow__hint" id="workflowRoleplayHint" style="display: none;">Roleplay does not need a skill or weapon.</div>
            </div>
          </div>
          <div class="workflow__step" id="workflowTargetStep" hidden>
            <button type="button" class="workflow__step-summary" id="workflowTargetSummary" hidden aria-expanded="false"></button>
            <div class="workflow__step-body" id="workflowTargetBody">
              <div class="workflow__question" id="workflowTargetLabel">3. Who or what is the focus? <span class="workflow__hint">(optional)</span></div>
              <div class="chips chips--pills workflow__targets" id="workflowTargetChips" role="group" aria-label="Targets"></div>
              <div class="workflow__name-block" id="workflowNameBlock" hidden>
                <div class="workflow__scene-group-label" id="workflowSituationLabel" hidden>Situation <span class="workflow__hint">(optional)</span></div>
                <div class="chips chips--pills" id="workflowSituationChips" role="group" aria-label="Situation" hidden></div>
                <div class="workflow__scene-group-label">Party / name <button type="button" class="btn btn--ghost btn--compact catalog-manage-btn" data-catalog="party">Manage</button></div>
                <div class="chips chips--pills" id="workflowPartyChips" role="group" aria-label="Party members"></div>
                <div id="workflowEnemyGroups" class="workflow__scene-groups"></div>
                <input type="text" id="workflowNameInput" class="workflow__name-input" placeholder="Or type a name…" maxlength="80" autocomplete="off" />
              </div>
            </div>
          </div>
        </div>
        <!-- Hidden legacy selects kept for any residual sync code -->
        <select id="workflowSceneSelect" class="workflow__select" hidden aria-hidden="true"></select>
        <select id="workflowDetailSelect" class="workflow__select" hidden aria-hidden="true"></select>
        <div id="workflowSummary" class="workflow__summary" aria-live="polite"></div>
      </div>

      <!-- Hidden selects for backward compatibility -->
      <select id="sectionSelect" style="display: none;" aria-hidden="true">
        <option value="spells">Spell Parodies</option>
        <option value="bardic">Bardic Inspiration</option>
        <option value="mockery">Vicious Mockery</option>
        <option value="outcomes">Scene Outcomes</option>
        <option value="character">Character</option>
        <option value="actions">What's Your Character Doing?</option>
        <option value="criticalHits">Critical Hit Description</option>
        <option value="criticalFailures">Critical Failure Description</option>
        <option value="skillChecks">Skill Check Results</option>
      </select>
      <select id="categorySelect" style="display: none;" aria-hidden="true"></select>

      <!-- Search (parody tabs only; hidden on Outcomes) -->
      <div class="toolbar__row toolbar__row--search" id="searchToolbarRow">
        <label class="search" style="flex: 1; min-width: 200px;">
          <input id="searchInput" type="search" placeholder="Search lyrics, songs, artists…" />
        </label>
        <button id="clearBtn" class="btn btn--secondary" data-tooltip="Clear search (Esc)">Clear</button>
        <label class="toggle" data-tooltip="Show only starred items (Ctrl+F)">
          <input type="checkbox" id="favoritesOnly" />
          <span>Favorites</span>
        </label>
      </div>

      <!-- Fuzzy Search Toggle (hidden by default, dynamically added by search-enhancements.js) -->
      <div class="toolbar__row toolbar__row--filters" id="filtersToolbarRow" style="display: none;">
      </div>
    </div>
  </nav>

  <!-- Settings drawer (admin / rare controls) -->
  <div id="settingsModal" class="modal" role="dialog" aria-labelledby="settingsTitle" aria-hidden="true">
    <div class="modal__content settings-modal">
      <div class="modal__header">
        <h2 id="settingsTitle">Settings</h2>
        <button type="button" class="modal__close" id="settingsModalClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body settings-modal__body">
        <section class="settings-section">
          <h3 class="settings-section__label">Appearance</h3>
          <label class="toggle settings-toggle" data-tooltip="Toggle dark theme (Ctrl+D)">
            <input type="checkbox" id="darkModeToggle" />
            <span>Dark mode</span>
          </label>
        </section>
        <section class="settings-section">
          <h3 class="settings-section__label">Content</h3>
          <div class="settings-actions">
            <button type="button" id="addEditBtn" class="btn">Edit items</button>
            <button type="button" id="manageListsBtn" class="btn">Manage lists</button>
          </div>
        </section>
        <section class="settings-section">
          <h3 class="settings-section__label">Data</h3>
          <div class="settings-actions">
            <button type="button" id="exportBtn" class="btn">Export</button>
            <button type="button" id="importBtn" class="btn">Import</button>
            <button type="button" id="fileStorageBtn" class="btn" data-tooltip="File or server storage">Storage</button>
          </div>
        </section>
        <section class="settings-section">
          <h3 class="settings-section__label">Voice</h3>
          <p class="settings-section__hint">Standing Claude personality. Mood (on Outcomes) colors each batch.</p>
          <div class="settings-actions">
            <button type="button" id="settingsPersonalityBtn" class="btn">Edit personality</button>
          </div>
        </section>
      </div>
      <div class="modal__footer">
        <button type="button" id="settingsCloseBtn" class="btn">Done</button>
      </div>
    </div>
  </div>

  <main id="content" class="content" aria-live="polite"></main>

  <footer class="footer footer--compact">
    <div class="footer__tips">
      Click a line to copy · <kbd>?</kbd> shortcuts · <kbd>H</kbd> history · <kbd>1-4</kbd> sections
    </div>
  </footer>

  <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>

  <!-- Quick random line modal (legacy actions "Feeling Chaotic") -->
  <div id="generatorModal" class="modal" role="dialog" aria-labelledby="generatorTitle" aria-hidden="true">
    <div class="modal__content" style="max-width: 600px;">
      <div class="modal__header">
        <h2 id="generatorTitle">Random Line</h2>
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

  <!-- YouTube Player Modal -->
  <div id="youtubePlayerModal" class="modal" role="dialog" aria-labelledby="youtubePlayerTitle" aria-hidden="true">
    <div id="karaokePlayerContent" class="modal__content karaoke-player-modal">
      <div class="modal__header karaoke-player-modal__header">
        <h2 id="youtubePlayerTitle">🎵 Karaoke Track</h2>
        <button class="modal__close" id="youtubePlayerClose" aria-label="Close">&times;</button>
      </div>
      <div class="modal__body karaoke-player-modal__body">
        <div class="karaoke-player-split">
          <div class="karaoke-player-split__video">
            <div id="youtubePlayerContainer" class="karaoke-player-container">
              <video id="karaokeLocalVideo" controls playsinline class="karaoke-player-container__video"></video>
              <div id="youtubeFallback" class="karaoke-player-external" hidden>
                <p class="karaoke-player-external__title">Local playback unavailable</p>
                <p class="karaoke-player-external__text">YouTube blocks in-page playback for most karaoke videos. Download via <strong>Search &amp; Download Karaoke</strong> for video here, or open YouTube in a new tab and use the lyrics beside it.</p>
                <button id="youtubeOpenTabBtn" class="btn btn--youtube" type="button">Open on YouTube</button>
              </div>
              <div id="karaokePlayerLoading" class="karaoke-player-loading" hidden>
                <p id="karaokePlayerLoadingText">Downloading karaoke…</p>
              </div>
            </div>
          </div>
          <aside id="karaokeLyricsPanel" class="karaoke-lyrics-panel" aria-label="Parody lyrics">
            <div id="karaokeLyricsMeta" class="karaoke-lyrics-panel__meta"></div>
            <div id="karaokeLyricsText" class="karaoke-lyrics-panel__text"></div>
          </aside>
        </div>
      </div>
      <div class="modal__footer karaoke-player-modal__footer">
        <button id="karaokePlayerResetSizeBtn" class="btn btn--ghost" type="button" title="Reset player to default size">Reset size</button>
        <button id="youtubePlayerCloseBtn" class="btn">Close</button>
      </div>
      <div id="karaokePlayerResizeHandle" class="karaoke-player-resize-handle" title="Drag to resize (saved automatically)" aria-hidden="true"></div>
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
        <label id="songLabel" class="credit-field" style="display: none;">
          <button type="button" id="correctSongBtn" class="credit-correct" title="Click to correct the title">Song <span class="workflow__hint">click to correct</span></button>
          <input type="text" id="editSong" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
        </label>
        <label id="artistLabel" class="credit-field" style="display: none;">
          <button type="button" id="correctArtistBtn" class="credit-correct" title="Click to correct the artist">Artist <span class="workflow__hint">click to correct</span></button>
          <input type="text" id="editArtist" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;" />
        </label>
        <p id="creditCorrectStatus" class="credit-correct__status" hidden></p>
        <div id="parodyAiFields" class="parody-ai" hidden>
          <label>
            Guidance for AI <span class="workflow__hint">(optional)</span>
            <textarea id="editParodyGuidance" rows="2" maxlength="400" placeholder="e.g. make it about rust monsters, keep it shoutable, lean 90s rap…" style="width: 100%; padding: 8px; border: 1px solid var(--burnt); border-radius: 6px; font-family: inherit;"></textarea>
          </label>
          <div class="parody-ai__actions">
            <button type="button" id="generateParodyBtn" class="btn">✨ Generate lyrics</button>
            <button type="button" id="refreshParodyBtn" class="btn btn--secondary" hidden>🔄 Try again</button>
          </div>
          <p id="parodyAiStatus" class="parody-ai__status" hidden></p>
          <div id="parodyAiReview" class="parody-ai__review" hidden>
            <button type="button" id="keepParodyBtn" class="btn">✅ Keep</button>
            <button type="button" id="editParodyBtn" class="btn btn--secondary">✏️ Edit</button>
          </div>
        </div>
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
  <script src="js/data/spells-data.js?v=<?php echo $versions['data/spells-data.js']; ?>"></script>
  <script src="js/data/bardic-data.js?v=<?php echo $versions['data/bardic-data.js']; ?>"></script>
  <script src="js/data/mockery-data.js?v=<?php echo $versions['data/mockery-data.js']; ?>"></script>
  <script src="js/data/actions-data.js?v=<?php echo $versions['data/actions-data.js']; ?>"></script>
  <script src="js/data/criticals-data.js?v=<?php echo $versions['data/criticals-data.js']; ?>"></script>
  <script src="js/data/skillchecks-data.js?v=<?php echo $versions['data/skillchecks-data.js']; ?>"></script>
  <script src="js/data/scene-outcomes.js?v=<?php echo $versions['data/scene-outcomes.js']; ?>"></script>
  <script>window.BlingusSceneVersion = "<?php echo $versions['data/scene-outcomes.js']; ?>";</script>

  <!-- Action workflow + Claude outcome generation (after data modules) -->
  <script src="js/character-sheet.js?v=<?php echo $versions['character-sheet.js']; ?>"></script>
  <script>window.WorkflowCatalogConfig = { app: 'blingus', storageKey: 'blingusWorkflowCatalogV1', partyKey: 'blingusPartyMembersV1', defaultParty: ['Blingus', "Brawn O'Neil", 'Puck Pinewhistle', 'Vadania Amakiir', 'Bo'] };</script>
  <script src="js/workflow-catalog.js?v=<?php echo $versions['workflow-catalog.js']; ?>"></script>
  <script src="js/action-workflow.js?v=<?php echo $versions['action-workflow.js']; ?>"></script>
  <script src="js/outcome-generate.js?v=<?php echo $versions['outcome-generate.js']; ?>"></script>

  <!-- Main application script -->
  <script src="script.js?v=<?php echo $versions['script.js']; ?>"></script>
</body>
</html>
