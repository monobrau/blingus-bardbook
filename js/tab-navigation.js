/**
 * Tab and Chip Navigation for Blingus's Bardbook
 * Handles visual tab/chip navigation and syncs with hidden selects
 */

(function() {
  'use strict';

  let currentSection = 'spells';
  let currentCategory = null;
  const collapsedSpellGroups = new Set();

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

    // Workflow sections use the multi-step panel instead of category chips
    if (window.ActionWorkflow && window.ActionWorkflow.isWorkflowSection(section)) {
      window.ActionWorkflow.showPanel(true);
      window.ActionWorkflow.applyTabPreset(section);
    } else if (window.ActionWorkflow) {
      window.ActionWorkflow.showPanel(false);
      if (section === 'character') {
        const chipsRow = document.getElementById('categoryChipsRow');
        if (chipsRow) chipsRow.style.display = 'none';
      } else {
        updateCategoryChips(section);
      }
    } else if (section === 'character') {
      const chipsRow = document.getElementById('categoryChipsRow');
      if (chipsRow) chipsRow.style.display = 'none';
    } else {
      updateCategoryChips(section);
    }

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
      if (currentCategory && !options.some((o) => o.value === currentCategory)) {
        currentCategory = null;
      }

      // Hide chips row if no categories (for actions, criticalHits, etc.)
      if (options.length === 0) {
        categoryChipsRow.style.display = 'none';
        return;
      }

      categoryChipsRow.style.display = 'flex';
      categoryChipsRow.classList.toggle('toolbar__row--chips-tree', section === 'spells');

      // Clear existing chips
      categoryChipsContainer.innerHTML = '';
      categoryChipsContainer.className = section === 'spells' ? 'spell-tree' : 'chips';

      function addChip(parent, option, index) {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = option.text;
        chip.setAttribute('data-category', option.value);
        chip.setAttribute('role', 'button');
        chip.setAttribute('aria-pressed', 'false');

        if (index === 0 && !currentCategory) {
          chip.classList.add('chip--active');
          chip.setAttribute('aria-pressed', 'true');
          currentCategory = option.value;
        } else if (currentCategory === option.value) {
          chip.classList.add('chip--active');
          chip.setAttribute('aria-pressed', 'true');
        }

        chip.addEventListener('click', (e) => {
          e.preventDefault();
          switchToCategory(option.value);
        });

        chip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            switchToCategory(option.value);
          }
        });

        parent.appendChild(chip);
      }

      if (section === 'spells' && window.BlingusData?.getSpellTree) {
        const tree = window.BlingusData.getSpellTree();
        const optionByValue = new Map(options.map((o) => [o.value, o]));
        let chipIndex = 0;
        tree.forEach((group) => {
          const ids = (group.ids || []).filter((id) => optionByValue.has(id));
          if (!ids.length) return;
          const block = document.createElement('div');
          block.className = 'spell-tree__group';
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'spell-tree__toggle';
          const collapsed = collapsedSpellGroups.has(group.id || group.label);
          toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
          toggle.textContent = group.label;
          const chips = document.createElement('div');
          chips.className = 'chips spell-tree__chips';
          chips.setAttribute('role', 'group');
          chips.setAttribute('aria-label', group.label);
          if (collapsed) {
            block.classList.add('spell-tree__group--collapsed');
            chips.hidden = true;
          }
          toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            block.classList.toggle('spell-tree__group--collapsed', !open);
            chips.hidden = !open;
            const key = group.id || group.label;
            if (open) collapsedSpellGroups.delete(key);
            else collapsedSpellGroups.add(key);
          });
          ids.forEach((id) => {
            addChip(chips, optionByValue.get(id), chipIndex);
            chipIndex += 1;
          });
          block.appendChild(toggle);
          block.appendChild(chips);
          categoryChipsContainer.appendChild(block);
        });
        if (!currentCategory && options[0]) currentCategory = options[0].value;
      } else {
        options.forEach((option, index) => {
          addChip(categoryChipsContainer, option, index);
        });
      }

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

    // Update visual chip state (only category chips, not workflow pills)
    const categoryChipsContainer = document.getElementById('categoryChips');
    const chips = categoryChipsContainer
      ? categoryChipsContainer.querySelectorAll('[data-category]')
      : [];
    chips.forEach((chip) => {
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
    const activeChip = categoryChipsContainer
      ? categoryChipsContainer.querySelector('.chip--active')
      : null;
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
