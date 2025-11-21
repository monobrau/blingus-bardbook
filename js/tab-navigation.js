/**
 * Tab and Chip Navigation for Blingus' Bardbook
 * Handles visual tab/chip navigation and syncs with hidden selects
 */

(function() {
  'use strict';

  let currentSection = 'spells';
  let currentCategory = null;

  // Wait for DOM to be ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupNavigation);
    } else {
      setupNavigation();
    }
  }

  function setupNavigation() {
    setupTabs();
    setupChips();

    // Initialize with first section
    setTimeout(() => {
      switchToSection('spells', true);
    }, 100);
  }

  function setupTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const section = tab.getAttribute('data-section');
        switchToSection(section);
      });

      // Add keyboard support
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const section = tab.getAttribute('data-section');
          switchToSection(section);
        }
      });
    });
  }

  function switchToSection(section, isInitial = false) {
    currentSection = section;

    // Update visual tab state
    document.querySelectorAll('.tab').forEach(tab => {
      const isActive = tab.getAttribute('data-section') === section;
      tab.classList.toggle('tab--active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Sync with hidden select
    const sectionSelect = document.getElementById('sectionSelect');
    if (sectionSelect && sectionSelect.value !== section) {
      sectionSelect.value = section;

      // Trigger change event to update the main app
      const event = new Event('change', { bubbles: true });
      sectionSelect.dispatchEvent(event);
    }

    // Update category chips for this section
    updateCategoryChips(section);

    // Scroll active tab into view
    if (!isInitial) {
      const activeTab = document.querySelector('.tab--active');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  function updateCategoryChips(section) {
    const categorySelect = document.getElementById('categorySelect');
    const categoryChipsContainer = document.getElementById('categoryChips');
    const categoryChipsRow = document.getElementById('categoryChipsRow');

    if (!categorySelect || !categoryChipsContainer) return;

    // Wait a bit for the category select to be populated
    setTimeout(() => {
      const options = Array.from(categorySelect.options);

      // Hide chips row if no categories (for actions, criticalHits, etc.)
      if (options.length === 0) {
        categoryChipsRow.style.display = 'none';
        return;
      }

      categoryChipsRow.style.display = 'flex';

      // Clear existing chips
      categoryChipsContainer.innerHTML = '';

      // Create chips for each category
      options.forEach((option, index) => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = option.text;
        chip.setAttribute('data-category', option.value);
        chip.setAttribute('role', 'button');
        chip.setAttribute('aria-pressed', 'false');

        // Set first chip as active
        if (index === 0) {
          chip.classList.add('chip--active');
          chip.setAttribute('aria-pressed', 'true');
          currentCategory = option.value;
        }

        chip.addEventListener('click', (e) => {
          e.preventDefault();
          switchToCategory(option.value);
        });

        // Keyboard support
        chip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            switchToCategory(option.value);
          }
        });

        categoryChipsContainer.appendChild(chip);
      });

      // Sync initial category with select
      if (currentCategory && categorySelect.value !== currentCategory) {
        categorySelect.value = currentCategory;
        const event = new Event('change', { bubbles: true });
        categorySelect.dispatchEvent(event);
      }
    }, 50);
  }

  function switchToCategory(category) {
    currentCategory = category;

    // Update visual chip state
    document.querySelectorAll('.chip').forEach(chip => {
      const isActive = chip.getAttribute('data-category') === category;
      chip.classList.toggle('chip--active', isActive);
      chip.setAttribute('aria-pressed', isActive);
    });

    // Sync with hidden select
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect && categorySelect.value !== category) {
      categorySelect.value = category;

      // Trigger change event to update the main app
      const event = new Event('change', { bubbles: true });
      categorySelect.dispatchEvent(event);
    }

    // Scroll active chip into view
    const activeChip = document.querySelector('.chip--active');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function setupChips() {
    // Chips are dynamically created in updateCategoryChips
    // But we need to listen for category select changes from main app
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
      // Create a MutationObserver to watch for option changes
      const observer = new MutationObserver(() => {
        if (categorySelect.options.length > 0 && !document.querySelector('.chip')) {
          updateCategoryChips(currentSection);
        }
      });

      observer.observe(categorySelect, {
        childList: true,
        subtree: true
      });

      // Store observer for cleanup
      window.TabNavigation._chipObserver = observer;
    }
  }

  // Cleanup function to prevent memory leaks
  function cleanup() {
    if (window.TabNavigation._chipObserver) {
      window.TabNavigation._chipObserver.disconnect();
      window.TabNavigation._chipObserver = null;
    }
  }

  // Export for external use
  window.TabNavigation = {
    switchToSection,
    switchToCategory,
    getCurrentSection: () => currentSection,
    getCurrentCategory: () => currentCategory,
    cleanup
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Initialize
  init();
})();
