/**
 * UI utilities for Blingus' Bardbook
 * Common DOM manipulation and UI helper functions
 */

window.UIUtils = (function() {
  'use strict';

  // Get shared utilities and constants
  const getUtils = () => window.SharedUtils || {};
  const getConstants = () => window.BlingusConstants || {};

  // Track currently open modals for focus trap
  let currentModal = null;
  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms
   */
  function showToast(message, duration = null) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const constants = getConstants();
    const toastDuration = duration || constants.TIMINGS?.TOAST_DURATION || 3000;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, toastDuration);
  }

  /**
   * Show a modal with focus trap
   * @param {HTMLElement|string} modal - Modal element or ID
   */
  function showModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    if (!modal) return;

    const constants = getConstants();
    const showClass = constants.CSS_CLASSES?.MODAL_SHOW || 'show';

    modal.classList.add(showClass);
    modal.setAttribute('aria-hidden', 'false');

    // Set current modal for focus trap
    currentModal = modal;

    // Set up focus trap
    setupFocusTrap(modal);

    // Focus first input if available
    const constants2 = getConstants();
    const focusDelay = constants2.TIMINGS?.FOCUS_DELAY || 100;

    const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), focusDelay);
    }
  }

  /**
   * Hide a modal and remove focus trap
   * @param {HTMLElement|string} modal - Modal element or ID
   */
  function hideModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    if (!modal) return;

    const constants = getConstants();
    const showClass = constants.CSS_CLASSES?.MODAL_SHOW || 'show';

    modal.classList.remove(showClass);
    modal.setAttribute('aria-hidden', 'true');

    // Remove focus trap
    if (currentModal === modal) {
      removeFocusTrap(modal);
      currentModal = null;
    }
  }

  /**
   * Set up focus trap for modal
   * @param {HTMLElement} modal - Modal element
   */
  function setupFocusTrap(modal) {
    if (!modal) return;

    // Get all focusable elements
    focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];

    // Add event listener for Tab key
    modal.addEventListener('keydown', handleFocusTrap);
  }

  /**
   * Remove focus trap from modal
   * @param {HTMLElement} modal - Modal element
   */
  function removeFocusTrap(modal) {
    if (!modal) return;
    modal.removeEventListener('keydown', handleFocusTrap);
    focusableElements = [];
    firstFocusable = null;
    lastFocusable = null;
  }

  /**
   * Handle focus trap keyboard events
   * @param {KeyboardEvent} e - Keyboard event
   */
  function handleFocusTrap(e) {
    if (e.key !== 'Tab' || focusableElements.length === 0) return;

    if (e.shiftKey) {
      // Shift + Tab: Move backwards
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: Move forwards
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Clear all children from an element
   * @param {HTMLElement} element - Element to clear
   */
  function clearElement(element) {
    if (!element) return;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * Create a card element
   * @param {object} options - Card options
   * @returns {HTMLElement} - Card element
   */
  function createCard(options = {}) {
    const {
      content = '',
      className = 'card',
      onClick = null,
      meta = null,
      buttons = []
    } = options;

    const card = document.createElement('article');
    card.className = className;
    card.tabIndex = 0;

    // Add content
    if (typeof content === 'string') {
      const p = document.createElement('p');
      p.textContent = content; // Use textContent for safety
      card.appendChild(p);
    } else if (content instanceof HTMLElement) {
      card.appendChild(content);
    }

    // Add metadata
    if (meta) {
      const metaDiv = document.createElement('div');
      metaDiv.className = 'card__meta';
      metaDiv.textContent = meta; // Use textContent for safety
      card.appendChild(metaDiv);
    }

    // Add buttons
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = btn.className || 'card__button';
      button.textContent = btn.label || '';
      if (btn.tooltip) {
        button.setAttribute('data-tooltip', btn.tooltip);
      }
      if (btn.onClick) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          btn.onClick(e);
        });
      }
      card.appendChild(button);
    });

    // Add click handler
    if (onClick) {
      card.addEventListener('click', onClick);
      card.style.cursor = 'pointer';
    }

    return card;
  }

  /**
   * Copy text to clipboard (uses SharedUtils if available)
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  }

  /**
   * Animate element (simple CSS animation)
   * @param {HTMLElement} element - Element to animate
   * @param {string} animation - Animation class name
   * @param {number} duration - Duration in ms
   */
  function animate(element, animation, duration = null) {
    if (!element) return;

    const constants = getConstants();
    const animDuration = duration || constants.TIMINGS?.ANIMATION_DURATION || 300;

    element.classList.add(animation);

    setTimeout(() => {
      element.classList.remove(animation);
    }, animDuration);
  }

  /**
   * Create a loading spinner element
   * @param {string} size - Size (small, medium, large)
   * @returns {HTMLElement} - Spinner element
   */
  function createSpinner(size = 'medium') {
    const spinner = document.createElement('div');
    spinner.className = `spinner spinner--${size}`;
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Loading...');
    spinner.setAttribute('aria-live', 'polite');

    const constants = getConstants();
    const sizes = constants.UI?.SPINNER_SIZES || {
      small: '20px',
      medium: '40px',
      large: '60px'
    };

    const spinnerSize = sizes[size] || sizes.medium;

    spinner.style.cssText = `
      width: ${spinnerSize};
      height: ${spinnerSize};
      border: 3px solid var(--accent-2);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 20px auto;
    `;

    // Add keyframes if not already present
    if (!document.getElementById('spinner-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spinner-keyframes';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return spinner;
  }

  /**
   * Show loading state in element
   * @param {HTMLElement} element - Element to show loading in
   * @param {string} size - Spinner size
   */
  function showLoading(element, size = 'medium') {
    if (!element) return;

    const constants = getConstants();
    const loadingClass = constants.CSS_CLASSES?.LOADING || 'loading';

    element.classList.add(loadingClass);
    clearElement(element);
    const spinner = createSpinner(size);
    element.appendChild(spinner);
  }

  /**
   * Hide loading state from element
   * @param {HTMLElement} element - Element to hide loading from
   */
  function hideLoading(element) {
    if (!element) return;

    const constants = getConstants();
    const loadingClass = constants.CSS_CLASSES?.LOADING || 'loading';

    element.classList.remove(loadingClass);
    const spinner = element.querySelector('.spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  // Use shared utilities where available
  const utils = getUtils();

  // Export all utilities
  return {
    showToast,
    showModal,
    hideModal,
    clearElement,
    createCard,
    copyToClipboard,
    animate,
    createSpinner,
    showLoading,
    hideLoading,
    // Expose shared utils for convenience
    debounce: utils.debounce,
    throttle: utils.throttle,
    smoothScrollTo: utils.smoothScrollTo || function(el, opts) {
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', ...opts });
    },
    isInViewport: utils.isInViewport,
    escapeHtml: utils.escapeHtml
  };
})();
