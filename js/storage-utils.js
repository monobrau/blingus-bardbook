/**
 * Storage utilities for Blingus's Bardbook
 * Handles localStorage, sessionStorage, and data persistence
 */

window.StorageUtils = (function() {
  'use strict';

  const STORAGE_PREFIX = 'blingus_';

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {boolean} - Success status
   */
  function saveLocal(key, value) {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, jsonValue);
      return true;
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} - Stored value or default
   */
  function loadLocal(key, defaultValue = null) {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const jsonValue = localStorage.getItem(prefixedKey);
      return jsonValue ? JSON.parse(jsonValue) : defaultValue;
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  function removeLocal(key) {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (err) {
      console.error('Failed to remove from localStorage:', err);
      return false;
    }
  }

  /**
   * Clear all app data from localStorage
   * @returns {boolean} - Success status
   */
  function clearLocal() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
      return false;
    }
  }

  /**
   * Save to sessionStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} - Success status
   */
  function saveSession(key, value) {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const jsonValue = JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, jsonValue);
      return true;
    } catch (err) {
      console.error('Failed to save to sessionStorage:', err);
      return false;
    }
  }

  /**
   * Load from sessionStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value
   * @returns {*} - Stored value or default
   */
  function loadSession(key, defaultValue = null) {
    try {
      const prefixedKey = STORAGE_PREFIX + key;
      const jsonValue = sessionStorage.getItem(prefixedKey);
      return jsonValue ? JSON.parse(jsonValue) : defaultValue;
    } catch (err) {
      console.error('Failed to load from sessionStorage:', err);
      return defaultValue;
    }
  }

  /**
   * Get storage size usage
   * @returns {object} - Storage usage info
   */
  function getStorageUsage() {
    let localSize = 0;
    let sessionSize = 0;

    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
          localSize += localStorage[key].length + key.length;
        }
      }

      for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
          sessionSize += sessionStorage[key].length + key.length;
        }
      }
    } catch (err) {
      console.error('Failed to calculate storage usage:', err);
    }

    return {
      local: {
        bytes: localSize,
        kb: (localSize / 1024).toFixed(2),
        mb: (localSize / 1024 / 1024).toFixed(2)
      },
      session: {
        bytes: sessionSize,
        kb: (sessionSize / 1024).toFixed(2),
        mb: (sessionSize / 1024 / 1024).toFixed(2)
      }
    };
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} - Availability status
   */
  function isLocalStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Export all data
   * @returns {object} - All stored data
   */
  function exportData() {
    const data = {};
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          const cleanKey = key.replace(STORAGE_PREFIX, '');
          data[cleanKey] = loadLocal(cleanKey);
        }
      });
    } catch (err) {
      console.error('Failed to export data:', err);
    }
    return data;
  }

  /**
   * Import data
   * @param {object} data - Data to import
   * @returns {boolean} - Success status
   */
  function importData(data) {
    try {
      Object.keys(data).forEach(key => {
        saveLocal(key, data[key]);
      });
      return true;
    } catch (err) {
      console.error('Failed to import data:', err);
      return false;
    }
  }

  /**
   * Create a debounced save function
   * @param {string} key - Storage key
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} - Debounced save function
   */
  function createDebouncedSave(key, delay = 500) {
    let timeout;
    return function(value) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveLocal(key, value);
      }, delay);
    };
  }

  // Export all utilities
  return {
    saveLocal,
    loadLocal,
    removeLocal,
    clearLocal,
    saveSession,
    loadSession,
    getStorageUsage,
    isLocalStorageAvailable,
    exportData,
    importData,
    createDebouncedSave
  };
})();
