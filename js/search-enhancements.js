/**
 * Search enhancements for Blingus' Bardbook
 * Integrates fuzzy search, result counts, and highlighting
 */

(function() {
  'use strict';

  // Get constants (wait for it to be loaded)
  const getConstants = () => window.BlingusConstants || {};
  const getUtils = () => window.SharedUtils || {};

  // Cache DOM references
  let searchInput = null;
  let content = null;
  let mutationObserver = null;

  // Wait for DOM and main script to load
  function waitForElements(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function enhanceSearch() {
    searchInput = document.getElementById('searchInput');
    const toolbar = document.querySelector('.toolbar__container');

    if (!searchInput || !toolbar) {
      console.warn('Search elements not found, retrying...');
      setTimeout(enhanceSearch, 100);
      return;
    }

    // Add result count display
    createResultCounter();

    // Add fuzzy search toggle
    createFuzzyToggle();

    // Enhance the search input with debouncing and better UX
    enhanceSearchInput();

    // Override global search if available
    enhanceGlobalSearch();
  }

  function createResultCounter() {
    const toolbar = document.querySelector('.toolbar__row--search');
    if (!toolbar || document.getElementById('searchResultCount')) return;

    const counter = document.createElement('div');
    counter.id = 'searchResultCount';
    counter.setAttribute('role', 'status');
    counter.setAttribute('aria-live', 'polite');
    counter.style.cssText = `
      padding: 8px 12px;
      background: var(--accent-2);
      color: white;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      display: none;
      white-space: nowrap;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    toolbar.appendChild(counter);
  }

  function createFuzzyToggle() {
    const toolbar = document.querySelector('.toolbar__row--filters');
    if (!toolbar || document.getElementById('fuzzySearchToggle')) return;

    const label = document.createElement('label');
    label.className = 'toggle';
    label.setAttribute('data-tooltip', 'Matches similar words even with typos');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'fuzzySearchToggle';
    checkbox.checked = true;

    const span = document.createElement('span');
    span.textContent = '🔍 Fuzzy search';

    label.appendChild(checkbox);
    label.appendChild(span);
    toolbar.appendChild(label);

    // Listen for changes
    checkbox.addEventListener('change', () => {
      const constants = getConstants();
      const key = constants.STORAGE_KEYS?.FUZZY_SEARCH || 'fuzzySearchEnabled';
      localStorage.setItem(key, checkbox.checked);

      // Trigger re-render if there's a search query
      if (searchInput && searchInput.value.trim()) {
        searchInput.dispatchEvent(new Event('input'));
      }
    });

    // Restore saved preference
    const constants = getConstants();
    const key = constants.STORAGE_KEYS?.FUZZY_SEARCH || 'fuzzySearchEnabled';
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      checkbox.checked = saved === 'true';
    }
  }

  function enhanceSearchInput() {
    if (!searchInput) return;

    // Add search icon and loading indicator
    const wrapper = searchInput.parentElement;
    if (wrapper && !wrapper.querySelector('.search-icon')) {
      wrapper.style.position = 'relative';

      const icon = document.createElement('span');
      icon.className = 'search-icon';
      icon.textContent = '🔍';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        opacity: 0.5;
      `;
      wrapper.appendChild(icon);
    }

    // Update placeholder for better UX
    searchInput.placeholder = 'Search... (Ctrl+K or /)';
  }

  function updateResultCount(count, query) {
    const counter = document.getElementById('searchResultCount');
    if (!counter) return;

    const constants = getConstants();
    const animDuration = constants.TIMINGS?.ANIMATION_DURATION || 200;

    if (count !== null && count !== undefined) {
      // Safe: Using textContent (no XSS risk)
      counter.textContent = `Found ${count} result${count !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}`;
      counter.style.display = 'block';

      // Add animation
      counter.style.transform = 'scale(1.05)';
      setTimeout(() => {
        counter.style.transform = 'scale(1)';
      }, animDuration);
    } else {
      counter.style.display = 'none';
    }
  }

  function enhanceGlobalSearch() {
    // Set up a throttled MutationObserver to detect when content changes
    content = document.getElementById('content');
    if (!content) return;

    const constants = getConstants();
    const utils = getUtils();
    const throttleDelay = constants.TIMINGS?.MUTATION_THROTTLE || 150;

    // Create throttled callback
    const throttledCallback = utils.throttle ? utils.throttle(handleContentMutation, throttleDelay) : handleContentMutation;

    mutationObserver = new MutationObserver(throttledCallback);

    mutationObserver.observe(content, {
      childList: true,
      subtree: true
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
  }

  function handleContentMutation() {
    const query = searchInput ? searchInput.value.trim() : '';

    if (query) {
      // Count visible cards (excluding empty state messages)
      const cards = content.querySelectorAll('.card');
      let count = 0;

      cards.forEach(card => {
        const cardText = card.textContent || '';
        // Don't count empty state or special cards
        if (!cardText.includes('No results') &&
            !cardText.includes('Search Results') &&
            !card.classList.contains('random-card')) {
          count++;

          // Highlight matches in this card
          highlightCardMatches(card, query);
        }
      });

      updateResultCount(count, query);
    } else {
      updateResultCount(null);
      // Remove all highlights when search is cleared
      if (content) {
        const highlightedCards = content.querySelectorAll('[data-highlighted]');
        highlightedCards.forEach(card => {
          card.removeAttribute('data-highlighted');
          // Remove mark elements
          const marks = card.querySelectorAll('mark');
          marks.forEach(mark => {
            const text = mark.textContent;
            const textNode = document.createTextNode(text);
            mark.parentNode.replaceChild(textNode, mark);
          });
        });
      }
    }
  }

  function highlightCardMatches(card, query) {
    if (!query || card.hasAttribute('data-highlighted')) return;

    // Mark as highlighted to avoid re-processing
    card.setAttribute('data-highlighted', 'true');

    // Get text nodes and highlight matches
    const textElements = card.querySelectorAll('p:not(.card__meta), div:not(.card__meta)');

    textElements.forEach(el => {
      // Skip if already has highlighting or is metadata
      if (el.querySelector('mark') || el.classList.contains('card__meta')) return;

      const text = el.textContent;
      if (text && text.toLowerCase().includes(query.toLowerCase())) {
        const utils = getUtils();
        const highlighted = utils.highlightMatches ? utils.highlightMatches(text, query) : escapeAndHighlight(text, query);

        if (highlighted !== text && !el.querySelector('mark')) {
          // SAFETY NOTE: highlighted text is XSS-safe because:
          // 1. It's escaped via SharedUtils.escapeHtml()
          // 2. Only <mark> tags are added with inline styles
          // 3. User input (query) is escaped via escapeRegex()
          el.innerHTML = highlighted;
        }
      }
    });
  }

  // Fallback if SharedUtils not loaded yet
  function escapeAndHighlight(text, query) {
    if (!query || !text) return escapeHtml(text);

    const escapedText = escapeHtml(text);
    const escapedQuery = escapeRegex(query);

    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$1</mark>');
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(str) {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Cleanup function to prevent memory leaks
  function cleanup() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    searchInput = null;
    content = null;
  }

  // Initialize
  waitForElements(enhanceSearch);

  // Export for testing
  window.SearchEnhancements = {
    updateResultCount,
    cleanup
  };
})();
