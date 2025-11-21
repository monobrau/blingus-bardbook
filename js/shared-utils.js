/**
 * Shared utilities for Blingus' Bardbook
 * Common functions used across multiple modules
 */

window.SharedUtils = (function() {
  'use strict';

  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} - Safely escaped HTML text
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape special regex characters
   * @param {string} str - String to escape
   * @returns {string} - Escaped string safe for regex
   */
  function escapeRegex(str) {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Highlight search matches in text (XSS-safe)
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {string} - HTML with highlighted matches
   */
  function highlightMatches(text, query) {
    if (!query || !text) return escapeHtml(text);

    // First escape the text for safety
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeRegex(query);

    // Create regex to match query (case insensitive)
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    // Replace matches with highlighted version
    // This is safe because we've already escaped the text
    return escapedText.replace(regex,
      '<mark style="background: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$1</mark>'
    );
  }

  /**
   * Safely set element content (prevents XSS)
   * @param {HTMLElement} element - Element to update
   * @param {string} text - Text content
   * @param {boolean} allowHTML - Whether to allow HTML (use with caution)
   */
  function setElementContent(element, text, allowHTML = false) {
    if (!element) return;

    if (allowHTML) {
      // Only use when the content is already sanitized
      element.innerHTML = text;
    } else {
      // Safe default - use textContent
      element.textContent = text;
    }
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Throttled function
   */
  function throttle(func, wait = 150) {
    let timeout = null;
    let previous = 0;

    return function executedFunction(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} - Element or null
   */
  function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element not found: #${id}`);
    }
    return element;
  }

  /**
   * Query selector with error handling
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {HTMLElement|null} - Element or null
   */
  function querySelector(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (err) {
      console.error(`Invalid selector: ${selector}`, err);
      return null;
    }
  }

  /**
   * Query selector all with error handling
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {Array<HTMLElement>} - Array of elements
   */
  function querySelectorAll(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (err) {
      console.error(`Invalid selector: ${selector}`, err);
      return [];
    }
  }

  /**
   * Format error for display
   * @param {Error|string} error - Error object or message
   * @returns {string} - Formatted error message
   */
  function formatError(error) {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && error.message) return error.message;
    return 'An unknown error occurred';
  }

  /**
   * Check if element is visible in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} - Whether element is visible
   */
  function isInViewport(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Smooth scroll to element
   * @param {HTMLElement} element - Element to scroll to
   * @param {object} options - Scroll options
   */
  function smoothScrollTo(element, options = {}) {
    if (!element) return;

    const {
      behavior = 'smooth',
      block = 'center',
      inline = 'nearest'
    } = options;

    element.scrollIntoView({ behavior, block, inline });
  }

  /**
   * Parse time string to seconds
   * @param {string|number} time - Time as "mm:ss" or seconds
   * @returns {number} - Time in seconds
   */
  function parseTimeToSeconds(time) {
    if (typeof time === 'number') return time;
    if (!time) return 0;

    const str = String(time).trim();

    // Check if it's in mm:ss format
    if (str.includes(':')) {
      const parts = str.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      }
    }

    // Otherwise parse as seconds
    return parseInt(str, 10) || 0;
  }

  /**
   * Format seconds to mm:ss
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string
   */
  function formatSecondsToTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Export all utilities
  return {
    escapeHtml,
    escapeRegex,
    highlightMatches,
    setElementContent,
    throttle,
    debounce,
    getElementById,
    querySelector,
    querySelectorAll,
    formatError,
    isInViewport,
    smoothScrollTo,
    parseTimeToSeconds,
    formatSecondsToTime
  };
})();
