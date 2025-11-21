/**
 * Constants for Blingus' Bardbook
 * Centralized configuration values
 */

window.BlingusConstants = (function() {
  'use strict';

  // Timing constants
  const TIMINGS = {
    TOAST_DURATION: 3000,
    TOAST_SHOW_DURATION: 5000, // For highlighted cards
    DEBOUNCE_DELAY: 300,
    SEARCH_DEBOUNCE: 400,
    ANIMATION_DURATION: 200,
    FOCUS_DELAY: 100,
    CATEGORY_UPDATE_DELAY: 50,
    SECTION_SWITCH_DELAY: 100,
    RENDER_DELAY: 10,
    AUTO_SAVE_DEBOUNCE: 1000,
    MUTATION_THROTTLE: 150
  };

  // Storage keys (without prefix - StorageUtils adds it)
  const STORAGE_KEYS = {
    FAVORITES: 'favorites',
    USER_ITEMS: 'userItems',
    DARK_MODE: 'darkMode',
    DELETED_DEFAULTS: 'deletedDefaults',
    HISTORY: 'history',
    GENERATORS: 'generators',
    EDITED_DEFAULTS: 'editedGeneratorDefaults',
    DELETED_GENERATOR_DEFAULTS: 'deletedGeneratorDefaults',
    FUZZY_SEARCH: 'fuzzySearchEnabled',
    DIRECTORY_HANDLE: 'dataDirectoryHandle'
  };

  // UI constants
  const UI = {
    MAX_HISTORY_ITEMS: 50,
    SPINNER_SIZES: {
      SMALL: '20px',
      MEDIUM: '40px',
      LARGE: '60px'
    },
    TOUCH_TARGET_MIN: '44px', // iOS recommended
    FOCUS_OUTLINE_WIDTH: '3px'
  };

  // API endpoints
  const API = {
    SAVE_ENDPOINT: '/api/save.php',
    LOAD_ENDPOINT: '/api/load.php',
    VERSION_ENDPOINT: '/api/version.php'
  };

  // Keyboard shortcuts
  const SHORTCUTS = {
    SEARCH: ['Ctrl+K', 'Meta+K', '/'],
    FAVORITES: ['Ctrl+F', 'Meta+F'],
    DARK_MODE: ['Ctrl+D', 'Meta+D'],
    HELP: ['?', 'Shift+/'],
    HISTORY: ['h'],
    RANDOM: ['r'],
    SECTIONS: ['1', '2', '3', '4', '5', '6', '7']
  };

  // Section configuration
  const SECTIONS = {
    SPELLS: { value: 'spells', label: 'Spell Parodies', icon: '🔮', key: '1' },
    BARDIC: { value: 'bardic', label: 'Bardic Inspiration', icon: '✨', key: '2' },
    MOCKERY: { value: 'mockery', label: 'Vicious Mockery', icon: '🗡️', key: '3' },
    ACTIONS: { value: 'actions', label: 'Character Actions', icon: '🎭', key: '4' },
    CRITICAL_HITS: { value: 'criticalHits', label: 'Critical Hits', icon: '⚔️', key: '5' },
    CRITICAL_FAILURES: { value: 'criticalFailures', label: 'Critical Failures', icon: '💥', key: '6' },
    SKILL_CHECKS: { value: 'skillChecks', label: 'Skill Checks', icon: '🎲', key: '7' }
  };

  // Generator types
  const GENERATORS = {
    BATTLE_CRIES: { value: 'battleCries', label: 'Battle Cries', icon: '⚔️' },
    INSULTS: { value: 'insults', label: 'Insults', icon: '🗡️' },
    COMPLIMENTS: { value: 'compliments', label: 'Compliments', icon: '💬' },
    INTRODUCTIONS: { value: 'introductions', label: 'Chaucer Introductions', icon: '🎭' }
  };

  // Validation rules
  const VALIDATION = {
    MIN_SEARCH_LENGTH: 1,
    MAX_ITEM_LENGTH: 5000,
    MAX_SONG_LENGTH: 200,
    MAX_ARTIST_LENGTH: 200
  };

  // CSS class names (for consistency)
  const CSS_CLASSES = {
    CARD: 'card',
    CARD_HIGHLIGHTED: 'highlighted',
    CARD_FAVORITE: 'on',
    TAB_ACTIVE: 'tab--active',
    CHIP_ACTIVE: 'chip--active',
    MODAL_SHOW: 'show',
    TOAST_SHOW: 'show',
    DARK_MODE: 'dark-mode',
    SPINNER: 'spinner',
    LOADING: 'loading'
  };

  // Error messages
  const ERRORS = {
    STORAGE_UNAVAILABLE: 'Local storage is not available. Some features may not work.',
    SAVE_FAILED: 'Failed to save data. Please try again.',
    LOAD_FAILED: 'Failed to load data. Using defaults.',
    IMPORT_FAILED: 'Import failed: Invalid file format.',
    EXPORT_FAILED: 'Export failed. Please try again.',
    CLIPBOARD_FAILED: 'Failed to copy to clipboard.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Invalid input. Please check your data.'
  };

  // Success messages
  const SUCCESS = {
    SAVED: 'Saved successfully!',
    COPIED: 'Copied to clipboard!',
    IMPORTED: 'Data imported successfully!',
    EXPORTED: 'Data exported successfully!',
    DELETED: 'Item deleted',
    ADDED: 'Item added',
    UPDATED: 'Item updated'
  };

  // Export all constants
  return {
    TIMINGS,
    STORAGE_KEYS,
    UI,
    API,
    SHORTCUTS,
    SECTIONS,
    GENERATORS,
    VALIDATION,
    CSS_CLASSES,
    ERRORS,
    SUCCESS
  };
})();
