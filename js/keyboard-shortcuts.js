/**
 * Keyboard shortcuts for Blingus's Bardbook
 * Provides power user shortcuts and keyboard navigation
 */

(function() {
  'use strict';

  // Keyboard shortcut handlers
  const shortcuts = {
    // Search shortcuts
    'Ctrl+K': () => {
      document.getElementById('searchInput')?.focus();
      return true; // Prevent default
    },
    'Meta+K': () => { // Cmd+K for Mac
      document.getElementById('searchInput')?.focus();
      return true;
    },
    '/': () => {
      const searchInput = document.getElementById('searchInput');
      if (document.activeElement !== searchInput) {
        searchInput?.focus();
        return true;
      }
      return false; // Allow typing '/' in search
    },

    // Favorites shortcut
    'Ctrl+F': () => {
      const favCheckbox = document.getElementById('favoritesOnly');
      if (favCheckbox) {
        favCheckbox.checked = !favCheckbox.checked;
        favCheckbox.dispatchEvent(new Event('change'));
      }
      return true;
    },
    'Meta+F': () => { // Cmd+F for Mac - but browser will override
      const favCheckbox = document.getElementById('favoritesOnly');
      if (favCheckbox) {
        favCheckbox.checked = !favCheckbox.checked;
        favCheckbox.dispatchEvent(new Event('change'));
      }
      return false; // Let browser handle if needed
    },

    // Dark mode shortcut
    'Ctrl+D': () => {
      const darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle) {
        darkModeToggle.checked = !darkModeToggle.checked;
        darkModeToggle.dispatchEvent(new Event('change'));
      }
      return true;
    },
    'Meta+D': () => { // Cmd+D for Mac
      const darkModeToggle = document.getElementById('darkModeToggle');
      if (darkModeToggle) {
        darkModeToggle.checked = !darkModeToggle.checked;
        darkModeToggle.dispatchEvent(new Event('change'));
      }
      return true;
    },

    // Section shortcuts (1-7)
    '1': () => selectSection(0),
    '2': () => selectSection(1),
    '3': () => selectSection(2),
    '4': () => selectSection(3),
    '5': () => selectSection(4),
    '6': () => selectSection(5),
    '7': () => selectSection(6),

    // Help modal
    '?': () => {
      showKeyboardHelp();
      return true;
    },
    'Shift+/': () => { // Alternative for ?
      showKeyboardHelp();
      return true;
    },

    // History shortcut
    'h': () => {
      // Only trigger if not in input field
      if (!isInputFocused()) {
        document.getElementById('historyBtn')?.click();
        return true;
      }
      return false;
    },

    // Random/chaotic button
    'r': () => {
      if (!isInputFocused()) {
        document.querySelector('.btn-random')?.click();
        return true;
      }
      return false;
    }
  };

  function selectSection(index) {
    const sectionSelect = document.getElementById('sectionSelect');
    if (sectionSelect && sectionSelect.options[index] && !isInputFocused()) {
      sectionSelect.selectedIndex = index;
      sectionSelect.dispatchEvent(new Event('change'));
      return true;
    }
    return false;
  }

  function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    );
  }

  // Initialize keyboard shortcuts
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Build shortcut string
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.metaKey) parts.push('Meta');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      // Add the key
      const key = e.key;
      if (!['Control', 'Meta', 'Shift', 'Alt'].includes(key)) {
        parts.push(key);
      }

      const shortcut = parts.join('+');

      // Check if we have a handler
      const handler = shortcuts[shortcut];
      if (handler && handler()) {
        e.preventDefault();
      }
    });
  }

  // Create and show keyboard help modal
  function showKeyboardHelp() {
    // Check if modal already exists
    let modal = document.getElementById('keyboardHelpModal');

    if (!modal) {
      // Create modal
      modal = document.createElement('div');
      modal.id = 'keyboardHelpModal';
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'keyboardHelpTitle');
      modal.setAttribute('aria-hidden', 'true');

      modal.innerHTML = `
        <div class="modal__content" style="max-width: 600px;">
          <div class="modal__header">
            <h2 id="keyboardHelpTitle">⌨️ Keyboard Shortcuts</h2>
            <button class="modal__close" aria-label="Close">&times;</button>
          </div>
          <div class="modal__body">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px 20px; align-items: center;">
              <strong style="grid-column: 1 / -1; margin-top: 8px; color: var(--accent); border-bottom: 1px solid var(--burnt); padding-bottom: 4px;">Navigation</strong>
              <kbd style="background: var(--paper); border: 1px solid var(--burnt); padding: 4px 8px; border-radius: 4px; font-size: 12px; box-shadow: 0 2px 0 var(--burnt);">↑ / ↓</kbd>
              <span>Navigate cards</span>

              <kbd>Enter</kbd>
              <span>Copy selected card</span>

              <kbd>Esc</kbd>
              <span>Close modal / Clear selection</span>

              <strong style="grid-column: 1 / -1; margin-top: 8px; color: var(--accent); border-bottom: 1px solid var(--burnt); padding-bottom: 4px;">Search & Filter</strong>
              <kbd>Ctrl+K</kbd>
              <span>Focus search</span>

              <kbd>/</kbd>
              <span>Focus search (alternative)</span>

              <kbd>Ctrl+F</kbd>
              <span>Toggle favorites filter</span>

              <strong style="grid-column: 1 / -1; margin-top: 8px; color: var(--accent); border-bottom: 1px solid var(--burnt); padding-bottom: 4px;">Sections</strong>
              <kbd>1-7</kbd>
              <span>Jump to section</span>

              <strong style="grid-column: 1 / -1; margin-top: 8px; color: var(--accent); border-bottom: 1px solid var(--burnt); padding-bottom: 4px;">Other</strong>
              <kbd>Ctrl+D</kbd>
              <span>Toggle dark mode</span>

              <kbd>h</kbd>
              <span>Show history</span>

              <kbd>r</kbd>
              <span>Random selection</span>

              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
            <div style="margin-top: 20px; padding: 12px; background: rgba(139, 74, 43, 0.1); border-radius: 6px; border-left: 4px solid var(--accent);">
              <strong>💡 Pro Tip:</strong> Most shortcuts won't work when typing in input fields, to avoid conflicts.
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn modal__close-btn">Got it!</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Add event listeners
      const closeButtons = modal.querySelectorAll('.modal__close, .modal__close-btn');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
      });

      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
          closeModal(modal);
        }
      });
    }

    // Show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Add kbd element styling
  function addKbdStyles() {
    if (document.getElementById('kbd-styles')) return;

    const style = document.createElement('style');
    style.id = 'kbd-styles';
    style.textContent = `
      kbd {
        background: var(--paper);
        border: 1px solid var(--burnt);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Courier New', monospace;
        box-shadow: 0 2px 0 var(--burnt);
        display: inline-block;
        min-width: 24px;
        text-align: center;
      }

      body.dark-mode kbd {
        background: #2d2d44;
        border-color: var(--burnt);
        box-shadow: 0 2px 0 rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initKeyboardShortcuts();
      addKbdStyles();
    });
  } else {
    initKeyboardShortcuts();
    addKbdStyles();
  }

  // Export for testing
  window.KeyboardShortcuts = {
    showKeyboardHelp
  };
})();
