(function(){
  // Debug mode: enable via URL parameter ?debug=true or hostname is localhost
  const DEBUG = new URLSearchParams(window.location.search).has('debug') || 
                window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';
  
  // Debug logging helper
  const debugLog = (...args) => {
    if (DEBUG) console.log(...args);
  };
  
  // Data loaded from js/data/*.js files into window.BlingusData
  const {
    spells, adultSpells, bardic, mockery, characterActions,
    criticalHits, criticalFailures, skillChecks,
    battleCries, insults, compliments, introductions
  } = window.BlingusData;

  const $ = (sel, root = document) => root.querySelector(sel);
  const content = $('#content');
  
  // Safe DOM manipulation helpers to prevent XSS
  /**
   * Safely clears an element's content
   * @param {HTMLElement} element - Element to clear
   */
  function clearElement(element) {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }
  
  /**
   * Safely sets text content on an element
   * @param {HTMLElement} element - Element to set text on
   * @param {string} text - Text content (will be escaped)
   */
  function setTextContent(element, text) {
    if (element) {
      element.textContent = text;
    }
  }
  
  /**
   * Creates a safe text node
   * @param {string} text - Text content
   * @returns {Text} Text node
   */
  function createTextNode(text) {
    return document.createTextNode(text);
  }
  
  // Debug helper function - can be called from console (only in debug mode)
  if (DEBUG) {
    window.debugGenerators = function() {
      debugLog('=== Generator Debug Info ===');
      const userGens = loadUserGenerators();
      const deleted = loadDeletedGeneratorDefaults();
      const edited = loadEditedDefaults();
      debugLog('User generators:', userGens);
      debugLog('Deleted defaults:', deleted);
      debugLog('Edited defaults:', edited);
      debugLog('Merged battle cries:', getMergedGenerators('battleCries'));
      debugLog('Merged insults:', getMergedGenerators('insults'));
      debugLog('Merged compliments:', getMergedGenerators('compliments'));
      debugLog('Merged introductions:', getMergedGenerators('introductions'));
      debugLog('Raw localStorage:', {
        generators: localStorage.getItem(generatorsKey),
        deletedDefaults: localStorage.getItem(deletedGeneratorDefaultsKey),
        editedDefaults: localStorage.getItem(editedDefaultsKey)
      });
      return { userGens, deleted, edited };
    };
  }
  
  // Clear all Blingus data - can be called from console
  window.clearBlingusData = function() {
    if (confirm('Clear ALL Blingus data? This will delete favorites, custom items, history, generators, and all customizations. This cannot be undone!')) {
      const keys = [
        favoritesKey,
        userItemsKey,
        deletedDefaultsKey,
        historyKey,
        generatorsKey,
        editedDefaultsKey,
        deletedGeneratorDefaultsKey,
        darkModeKey
      ];
      keys.forEach(key => localStorage.removeItem(key));
      debugLog('✓ Cleared all Blingus data');
      showToast('All data cleared. Reloading...');
      setTimeout(() => location.reload(), RELOAD_DELAY_MS);
    }
  };
  
  const sectionSelect = $('#sectionSelect');
  const categorySelect = $('#categorySelect');
  const favoritesOnly = $('#favoritesOnly');
  const searchInput = $('#searchInput');
  const clearBtn = $('#clearBtn');
  const toast = $('#toast');
  const addEditBtn = $('#addEditBtn');
  const editModal = $('#editModal');
  const editText = $('#editText');
  const editSong = $('#editSong');
  const editArtist = $('#editArtist');
  // const editAdult = $('#editAdult'); // Removed: adult content UI removed
  const editYoutube = $('#editYoutube');
  const editStartTime = $('#editStartTime');
  const youtubeFields = $('#youtubeFields');
  const testYoutubeBtn = $('#testYoutubeBtn');
  const saveEditBtn = $('#saveEditBtn');
  const cancelEditBtn = $('#cancelEditBtn');
  const deleteEditBtn = $('#deleteEditBtn');
  const modalTitle = $('#modalTitle');
  const songLabel = $('#songLabel');
  const artistLabel = $('#artistLabel');
  // const adultLabel = $('#adultLabel'); // Removed: adult content UI removed
  const modalClose = $('.modal__close', editModal);
  const youtubePlayerModal = $('#youtubePlayerModal');
  const youtubePlayerFrame = $('#youtubePlayerFrame');
  const youtubePlayerTitle = $('#youtubePlayerTitle');
  const youtubePlayerClose = $('#youtubePlayerClose');
  const youtubePlayerCloseBtn = $('#youtubePlayerCloseBtn');
  const youtubeFallback = $('#youtubeFallback');
  const youtubeOpenTabBtn = $('#youtubeOpenTabBtn');
  const youtubeSuggestion = $('#youtubeSuggestion');
  const youtubeSuggestionText = $('#youtubeSuggestionText');
  const youtubeSearchBtn = $('#youtubeSearchBtn');
  const localKaraokeStatus = $('#localKaraokeStatus');
  const generatorModal = $('#generatorModal');
  const generatorTitle = $('#generatorTitle');
  const generatorText = $('#generatorText');
  const generatorCopyBtn = $('#generatorCopyBtn');
  const generatorCloseBtn = $('#generatorCloseBtn');
  const generatorModalClose = $('#generatorModalClose');
  const historyModal = $('#historyModal');
  const historyList = $('#historyList');
  const historyModalClose = $('#historyModalClose');
  const historyCloseBtn = $('#historyCloseBtn');
  const manageGeneratorsBtn = $('#manageGeneratorsBtn');
  const generatorManageModal = $('#generatorManageModal');
  const generatorManageTitle = $('#generatorManageTitle');
  const generatorManageClose = $('#generatorManageClose');
  const generatorManageCloseBtn = $('#generatorManageCloseBtn');
  const generatorTypeSelect = $('#generatorTypeSelect');
  const generatorsList = $('#generatorsList');
  const addGeneratorBtn = $('#addGeneratorBtn');
  const generatorEditModal = $('#generatorEditModal');
  const generatorEditTitle = $('#generatorEditTitle');
  const generatorEditClose = $('#generatorEditClose');
  const generatorEditText = $('#generatorEditText');
  const saveGeneratorBtn = $('#saveGeneratorBtn');
  const cancelGeneratorBtn = $('#cancelGeneratorBtn');
  const deleteGeneratorBtn = $('#deleteGeneratorBtn');

  // ============================================================================
  // CONSTANTS CONFIGURATION
  // ============================================================================
  
  /**
   * Application constants - all magic numbers and strings centralized here
   */
  const CONFIG = {
    // Timing constants (in milliseconds)
    TIMING: {
      MAX_HISTORY_ITEMS: 10,
      AUTO_SAVE_DEBOUNCE_MS: 500,
      AUTO_SAVE_TOAST_INTERVAL_MS: 10000,
      AUTO_SAVE_TOAST_DURATION_MS: 1500,
      RELOAD_DELAY_MS: 1000,
      TOAST_DURATION_MS: 5000,
      ERROR_TOAST_DURATION_MS: 3000,
      TOAST_AUTO_HIDE_DURATION_MS: 1200,
      RENDER_DELAY_MS: 100
    },
    
    // Storage configuration
    STORAGE: {
      DATA_FILENAME: 'blingus-data.json',
      DATA_DIR_NAME: 'data',
      API_ENDPOINT: '/api/blingus-data.php',
      // API key for server authentication (set via localStorage or environment)
      // To use: localStorage.setItem('blingusApiKey', 'your-key-here')
      API_KEY: localStorage.getItem('blingusApiKey') || null
    },
    
    // Safety limits
    LIMITS: {
      MAX_DELETED_DEFAULTS: 1000, // Safety threshold for corruption detection
      MAX_DATA_SIZE_MB: 10 // Maximum data size for server uploads
    },
    
    // CSS class names (for consistency)
    CLASSES: {
      CARD: 'card',
      CARD_HIGHLIGHTED: 'highlighted',
      CARD_ACTION: 'action-card',
      CARD_FAV: 'card__fav',
      CARD_FAV_ON: 'on',
      CARD_COPY: 'card__copy',
      CARD_EDIT: 'card__edit',
      CARD_META: 'card__meta',
      CARD_CHIP: 'card__chip',
      MODAL: 'modal',
      MODAL_SHOW: 'show',
      DARK_MODE: 'dark-mode'
    }
  };
  
  // Extract timing constants for backward compatibility
  const MAX_HISTORY_ITEMS = CONFIG.TIMING.MAX_HISTORY_ITEMS;
  const AUTO_SAVE_DEBOUNCE_MS = CONFIG.TIMING.AUTO_SAVE_DEBOUNCE_MS;
  const AUTO_SAVE_TOAST_INTERVAL_MS = CONFIG.TIMING.AUTO_SAVE_TOAST_INTERVAL_MS;
  const AUTO_SAVE_TOAST_DURATION_MS = CONFIG.TIMING.AUTO_SAVE_TOAST_DURATION_MS;
  const RELOAD_DELAY_MS = CONFIG.TIMING.RELOAD_DELAY_MS;
  const TOAST_DURATION_MS = CONFIG.TIMING.TOAST_DURATION_MS;
  const MAX_DELETED_DEFAULTS = CONFIG.LIMITS.MAX_DELETED_DEFAULTS;
  const ERROR_TOAST_DURATION_MS = CONFIG.TIMING.ERROR_TOAST_DURATION_MS;
  const TOAST_AUTO_HIDE_DURATION_MS = CONFIG.TIMING.TOAST_AUTO_HIDE_DURATION_MS;
  const RENDER_DELAY_MS = CONFIG.TIMING.RENDER_DELAY_MS;
  
  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================
  
  /**
   * Validates text input (sanitizes and checks length)
   * @param {string} text - Text to validate
   * @param {number} maxLength - Maximum allowed length
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Object} {valid: boolean, value: string, error: string|null}
   */
  function validateTextInput(text, maxLength = 10000, fieldName = 'Text') {
    if (typeof text !== 'string') {
      return { valid: false, value: '', error: `${fieldName} must be a string` };
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, value: '', error: `${fieldName} cannot be empty` };
    }
    
    if (trimmed.length > maxLength) {
      return { 
        valid: false, 
        value: trimmed, 
        error: `${fieldName} is too long (max ${maxLength} characters)` 
      };
    }
    
    // Basic XSS prevention - remove script tags and dangerous attributes
    const sanitized = trimmed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    return { valid: true, value: sanitized, error: null };
  }
  
  /**
   * Validates YouTube URL or video ID
   * @param {string} url - YouTube URL or video ID
   * @returns {Object} {valid: boolean, videoId: string|null, error: string|null}
   */
  function validateYouTubeUrl(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, videoId: null, error: 'YouTube URL is required' };
    }
    
    const trimmed = url.trim();
    if (trimmed.length === 0) {
      return { valid: true, videoId: null, error: null }; // Optional field
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    
    if (!videoId) {
      return { valid: false, videoId: null, error: 'Invalid YouTube URL or video ID format' };
    }
    
    return { valid: true, videoId, error: null };
  }
  
  /**
   * Validates time format (seconds or mm:ss)
   * @param {string} time - Time string to validate
   * @returns {Object} {valid: boolean, seconds: number|null, error: string|null}
   */
  function validateTimeFormat(time) {
    if (!time || typeof time !== 'string') {
      return { valid: true, seconds: null, error: null }; // Optional field
    }
    
    const trimmed = time.trim();
    if (trimmed.length === 0) {
      return { valid: true, seconds: null, error: null };
    }
    
    // Try to parse as mm:ss format
    const mmssMatch = trimmed.match(/^(\d+):(\d{2})$/);
    if (mmssMatch) {
      const minutes = parseInt(mmssMatch[1], 10);
      const seconds = parseInt(mmssMatch[2], 10);
      if (seconds >= 60) {
        return { valid: false, seconds: null, error: 'Seconds must be less than 60' };
      }
      return { valid: true, seconds: minutes * 60 + seconds, error: null };
    }
    
    // Try to parse as plain seconds
    const seconds = parseInt(trimmed, 10);
    if (isNaN(seconds) || seconds < 0) {
      return { valid: false, seconds: null, error: 'Invalid time format. Use seconds (e.g., 30) or mm:ss (e.g., 1:30)' };
    }
    
    return { valid: true, seconds, error: null };
  }
  
  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  
  /**
   * Centralized error handler
   * @param {string} context - Context where error occurred
   * @param {Error|string} error - Error object or message
   * @param {string|null} userMessage - User-friendly error message
   */
  function handleError(context, error, userMessage = null) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${context}]`, error);
    
    if (userMessage) {
      showToast(userMessage, ERROR_TOAST_DURATION_MS);
    } else if (errorMessage) {
      showToast(`Error: ${errorMessage}`, ERROR_TOAST_DURATION_MS);
    }
  }
  
  // Common merge logic helper: merges defaults with user items, filtering deletions and applying edits
  function mergeItems(defaultItems, userItems, deletedIds, editedDefaults, getIdFn) {
    // Filter out deleted items and apply edits
    const filteredDefaults = defaultItems.map((item, index) => {
      const itemId = getIdFn(item, index);
      // Check if deleted
      if (deletedIds.includes(itemId)) {
        debugLog('Filtering out deleted item:', itemId, item);
        return null;
      }
      // Check if edited
      if (editedDefaults && editedDefaults[itemId]) {
        return editedDefaults[itemId];
      }
      return item;
    }).filter(item => item !== null);
    
    // Ensure userItems is an array
    const userArray = Array.isArray(userItems) ? userItems : [];
    
    return [...filteredDefaults, ...userArray];
  }
  
  // localStorage keys
  const favoritesKey = 'blingusFavoritesV1';
  const userItemsKey = 'blingusUserItemsV1';
  const deletedDefaultsKey = 'blingusDeletedDefaultsV1';
  const historyKey = 'blingusHistoryV1';
  const darkModeKey = 'blingusDarkModeV1';
  const generatorsKey = 'blingusGeneratorsV1';
  const editedDefaultsKey = 'blingusEditedDefaultsV1';
  const deletedGeneratorDefaultsKey = 'blingusDeletedGeneratorDefaultsV1';
  
  // File-based storage - auto-detect server vs local
  let dataDirectoryHandle = null;
  const DATA_FILENAME = CONFIG.STORAGE.DATA_FILENAME;
  const DATA_DIR_NAME = CONFIG.STORAGE.DATA_DIR_NAME;
  const API_ENDPOINT = CONFIG.STORAGE.API_ENDPOINT;
  
  // Debug: Log the endpoint being used
  debugLog('API Endpoint:', API_ENDPOINT);
  debugLog('Full API URL:', window.location.origin + API_ENDPOINT);
  
  // Detect if running on a web server (not localhost)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.protocol === 'file:';
  const isOnServer = !isLocalhost && (window.location.protocol === 'http:' || window.location.protocol === 'https:');
  
  // Check if File System Access API is supported (for local use)
  const fileSystemSupported = 'showDirectoryPicker' in window;
  
  // Check if PHP API is available (even on localhost)
  // This allows server storage to work even when accessing via localhost
  let phpApiAvailable = false;
  async function checkPhpApiAvailability() {
    if (window.location.protocol === 'file:') {
      return false; // Can't use PHP API with file:// protocol
    }
    try {
      const response = await fetch(API_ENDPOINT + '?action=load', createFetchOptions('GET'));
      // If we get a response (even 404/error), PHP is available
      // 404 means PHP is working but no data file exists yet
      // Network errors mean PHP is not available
      phpApiAvailable = response.status !== 0 && !response.type.includes('opaque');
      return phpApiAvailable;
    } catch (error) {
      // Network error or CORS issue - PHP API not available
      phpApiAvailable = false;
      return false;
    }
  }
  
  debugLog('Storage mode detection:', {
    isLocalhost,
    isOnServer,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    fileSystemSupported,
    phpApiAvailable: 'checking...'
  });
  
  // Initialize file storage - detect mode and load data
  async function initFileStorage() {
    // Check if PHP API is available (even on localhost)
    const phpAvailable = await checkPhpApiAvailability();
    
    debugLog('Storage mode detection (after PHP check):', {
      isLocalhost,
      isOnServer,
      phpApiAvailable: phpAvailable,
      willUseServerStorage: phpAvailable || isOnServer
    });
    
    // Update file storage button UI now that we know PHP availability
    setupFileStorageButton();
    
    // Use server storage if PHP API is available OR if we're on a remote server
    if (phpAvailable || isOnServer) {
      // On server: use server-side API
      return await loadDataFromServer();
    } else {
      // Local: try File System Access API
      if (!fileSystemSupported) {
        return false;
      }
      
      try {
        // Try to get saved directory handle from IndexedDB
        const savedHandle = await getSavedDirectoryHandle();
        if (savedHandle) {
          dataDirectoryHandle = savedHandle;
          return await loadDataFromFile();
        }
        
        return false;
      } catch (error) {
        return false;
      }
    }
  }
  
  /**
   * Creates fetch options with authentication if API key is configured
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {Object} body - Request body (will be JSON stringified)
   * @param {Object} additionalHeaders - Additional headers to include
   * @returns {Object} Fetch options object
   */
  function createFetchOptions(method, body = null, additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
    
    // Add API key if configured
    if (CONFIG.STORAGE.API_KEY) {
      headers['Authorization'] = `Bearer ${CONFIG.STORAGE.API_KEY}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (body !== null) {
      options.body = JSON.stringify(body);
    }
    
    return options;
  }
  
  // Server-side storage functions
  async function saveDataToServer() {
    // Use server storage if PHP API is available OR if we're on a remote server
    if (!phpApiAvailable && !isOnServer) return false;
    
    try {
      const data = getAllUserData();
      
      // Validate data can be serialized
      try {
        JSON.stringify(data);
      } catch (e) {
        console.error('Error serializing data:', e);
        throw new Error('Data contains invalid values that cannot be serialized: ' + e.message);
      }
      
      const requestBody = {
        action: 'save',
        data: data
      };
      
      debugLog('Attempting to save to server:', {
        endpoint: API_ENDPOINT,
        fullUrl: window.location.origin + API_ENDPOINT,
        method: 'POST',
        bodySize: JSON.stringify(requestBody).length
      });
      
      const response = await fetch(API_ENDPOINT, createFetchOptions('POST', requestBody));
      
      debugLog('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return true;
        } else {
          console.error('Server returned error:', result.error || result.message);
          throw new Error(result.error || result.message || 'Unknown server error');
        }
      } else {
        let errorText = '';
        let errorMessage = '';
        try {
          errorText = await response.text();
          console.error('Server error response:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage = errorJson.error;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (e) {
            // Not JSON, use raw text
            errorMessage = errorText || response.statusText;
          }
        } catch (e) {
          errorMessage = response.statusText;
        }
        
        console.error('HTTP error:', response.status, response.statusText);
        console.error('Error message:', errorMessage);
        console.error('Full error text:', errorText);
        
        if (response.status === 400) {
          console.error('400 Bad Request Details:', {
            url: window.location.origin + API_ENDPOINT,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            bodySize: JSON.stringify(requestBody).length,
            errorMessage: errorMessage
          });
          throw new Error(`400 Bad Request: ${errorMessage || 'Invalid request format. Check server logs for details.'}`);
        }
        if (response.status === 405) {
          console.error('405 Error Details:', {
            url: window.location.origin + API_ENDPOINT,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            bodySize: JSON.stringify(requestBody).length
          });
          throw new Error('405 Method Not Allowed - Server/web server is blocking POST requests. Check nginx/apache configuration or PHP setup.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorMessage ? ' - ' + errorMessage : ''}`);
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      console.error('API endpoint:', API_ENDPOINT);
      console.error('Full URL:', window.location.origin + API_ENDPOINT);
      throw error; // Re-throw to show actual error message
    }
  }
  
  async function loadDataFromServer() {
    // Use server storage if PHP API is available OR if we're on a remote server
    if (!phpApiAvailable && !isOnServer) return false;
    
    try {
      const response = await fetch(API_ENDPOINT + '?action=load', createFetchOptions('GET'));
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Apply loaded data to localStorage
          const data = result.data;
          if (data.favorites !== undefined) localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
          if (data.userItems !== undefined) localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
          if (data.deletedDefaults !== undefined) localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
          if (data.history !== undefined) localStorage.setItem(historyKey, JSON.stringify(data.history));
          if (data.generators !== undefined) {
            // Normalize generators structure
            let generators = data.generators;
            if (typeof generators === 'object' && generators !== null) {
              generators = {
                battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
                insults: Array.isArray(generators.insults) ? generators.insults : [],
                compliments: Array.isArray(generators.compliments) ? generators.compliments : [],
                introductions: Array.isArray(generators.introductions) ? generators.introductions : []
              };
            } else {
              generators = { battleCries: [], insults: [], compliments: [], introductions: [] };
            }
            localStorage.setItem(generatorsKey, JSON.stringify(generators));
          }
          if (data.editedGeneratorDefaults !== undefined) localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
          if (data.deletedGeneratorDefaults !== undefined) localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
          if (data.darkMode !== undefined) localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading from server:', error);
      return false;
    }
  }
  
  // Prompt user to select data directory
  async function promptForDataDirectory() {
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      // Check if 'data' subdirectory exists, create if not
      try {
        dataDirectoryHandle = await handle.getDirectoryHandle(DATA_DIR_NAME, { create: true });
      } catch (e) {
        // If we can't create subdirectory, use the selected directory directly
        dataDirectoryHandle = handle;
      }
      
      // Save handle for future use
      await saveDirectoryHandle(dataDirectoryHandle);
      showToast('✓ Data directory selected');
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting directory:', error);
      }
      return false;
    }
  }
  
  // Save directory handle to IndexedDB
  async function saveDirectoryHandle(handle) {
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');
      await store.put({ id: 'dataDir', handle: handle });
    } catch (error) {
      console.error('Error saving directory handle:', error);
    }
  }
  
  // Get saved directory handle from IndexedDB
  async function getSavedDirectoryHandle() {
    try {
      const db = await openDB();
      const transaction = db.transaction(['handles'], 'readonly');
      const store = transaction.objectStore('handles');
      const result = await store.get('dataDir');
      return result ? result.handle : null;
    } catch (error) {
      console.error('Error getting directory handle:', error);
      return null;
    }
  }
  
  // Open IndexedDB for storing file handles
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('blingusFileStorage', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles', { keyPath: 'id' });
        }
      };
    });
  }
  
  // Get all user data
  function getAllUserData() {
    return {
      // Default content (complete datasets)
      defaultSpells: spells,
      defaultAdultSpells: adultSpells,
      defaultBardic: bardic,
      defaultMockery: mockery,
      defaultActions: characterActions,
      defaultCriticalHits: criticalHits,
      defaultCriticalFailures: criticalFailures,
      defaultSkillChecks: skillChecks,
      defaultGenerators: {
        battleCries: battleCries,
        insults: insults,
        compliments: compliments,
        introductions: introductions
      },
      
      // User preferences
      favorites: JSON.parse(localStorage.getItem(favoritesKey) || '[]'),
      darkMode: localStorage.getItem(darkModeKey) === 'true',
      
      // User-added content
      userItems: JSON.parse(localStorage.getItem(userItemsKey) || '{}'),
      generators: JSON.parse(localStorage.getItem(generatorsKey) || '{"battleCries":[],"insults":[],"compliments":[],"introductions":[]}'),
      
      // Default item modifications (edits and deletions)
      deletedDefaults: JSON.parse(localStorage.getItem(deletedDefaultsKey) || '{}'),
      editedGeneratorDefaults: JSON.parse(localStorage.getItem(editedDefaultsKey) || '{"battleCries":{},"insults":{},"compliments":{},"introductions":{}}'),
      deletedGeneratorDefaults: JSON.parse(localStorage.getItem(deletedGeneratorDefaultsKey) || '{"battleCries":[],"insults":[],"compliments":[],"introductions":[]}'),
      
      // Usage history
      history: JSON.parse(localStorage.getItem(historyKey) || '[]'),
      
      // Metadata
      version: '1.4',
      timestamp: new Date().toISOString(),
      exportNote: 'Complete export including all default items (spells, bardic, mockery, actions, criticalHits, criticalFailures, skillChecks, generators) plus all user customizations (favorites, custom items, edits, deletions, history, YouTube and local karaoke settings).'
    };
  }
  
  // Save data to file
  async function saveDataToFile() {
    if (!dataDirectoryHandle) {
      // Fallback to localStorage (already happens automatically)
      return false;
    }
    
    try {
      const data = getAllUserData();
      const json = JSON.stringify(data, null, 2);
      
      // Get or create the data file
      const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      
      return true;
    } catch (error) {
      // If permission lost, clear handle
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        dataDirectoryHandle = null;
      }
      return false;
    }
  }
  
  // Load data from file
  async function loadDataFromFile() {
    if (!dataDirectoryHandle) {
      return false;
    }
    
    try {
      const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Apply loaded data to localStorage
      if (data.favorites !== undefined) localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
      if (data.userItems !== undefined) localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
      if (data.deletedDefaults !== undefined) localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
      if (data.history !== undefined) localStorage.setItem(historyKey, JSON.stringify(data.history));
      if (data.voicePresets !== undefined) localStorage.setItem(voicePresetsKey, JSON.stringify(data.voicePresets));
      if (data.generators !== undefined) {
        // Normalize generators structure
        let generators = data.generators;
        if (typeof generators === 'object' && generators !== null) {
          generators = {
            battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
            insults: Array.isArray(generators.insults) ? generators.insults : [],
            compliments: Array.isArray(generators.compliments) ? generators.compliments : [],
            introductions: Array.isArray(generators.introductions) ? generators.introductions : []
          };
        } else {
          generators = { battleCries: [], insults: [], compliments: [], introductions: [] };
        }
        localStorage.setItem(generatorsKey, JSON.stringify(generators));
      }
      if (data.editedGeneratorDefaults !== undefined) localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
      if (data.deletedGeneratorDefaults !== undefined) localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
      if (data.darkMode !== undefined) localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Debounced auto-save (works for both file and server)
  let fileSaveTimeout = null;
  let isSavingToServer = false;
  let lastAutoSaveToast = 0;
  function scheduleFileSave() {
    if (fileSaveTimeout) clearTimeout(fileSaveTimeout);
    fileSaveTimeout = setTimeout(async () => {
      if (phpApiAvailable || isOnServer) {
        if (!isSavingToServer) {
          isSavingToServer = true;
          try {
            const success = await saveDataToServer();
            if (success) {
              // Only show toast occasionally (every 10 seconds max) to avoid spam
              const now = Date.now();
              if (now - lastAutoSaveToast > AUTO_SAVE_TOAST_INTERVAL_MS) {
                showToast('💾 Auto-saved', AUTO_SAVE_TOAST_DURATION_MS);
                lastAutoSaveToast = now;
              }
            }
          } catch (error) {
            console.error('Auto-save failed:', error);
            showToast('⚠️ Auto-save failed', ERROR_TOAST_DURATION_MS);
          } finally {
            isSavingToServer = false;
          }
        }
      } else if (dataDirectoryHandle) {
        saveDataToFile();
      }
    }, AUTO_SAVE_DEBOUNCE_MS); // Wait after last change for faster feedback
  }
  
  // Load user items from localStorage
  function loadUserItems() {
    try {
      const raw = localStorage.getItem(userItemsKey);
      const defaultStructure = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
      if (!raw) {
        return defaultStructure;
      }
      const parsed = JSON.parse(raw);
      // Ensure all sections exist (in case data is incomplete)
      return {
        spells: parsed.spells || {},
        adultSpells: parsed.adultSpells || {},
        bardic: parsed.bardic || {},
        mockery: parsed.mockery || {},
        actions: parsed.actions || {},
        criticalHits: parsed.criticalHits || {},
        criticalFailures: parsed.criticalFailures || {},
        skillChecks: parsed.skillChecks || {}
      };
    } catch(e) {
      console.error('Error loading user items:', e);
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
    }
  }
  
  // Load deleted defaults from localStorage
  function loadDeletedDefaults() {
    try {
      const raw = localStorage.getItem(deletedDefaultsKey);
      if (!raw) {
        return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {}, skillChecks: {} };
      }
      const parsed = JSON.parse(raw);
      // Ensure structure is correct
      return {
        spells: parsed.spells || {},
        adultSpells: parsed.adultSpells || {},
        bardic: parsed.bardic || {},
        mockery: parsed.mockery || {},
        actions: parsed.actions || {},
        criticalHits: parsed.criticalHits || {},
        criticalFailures: parsed.criticalFailures || {}
      };
    } catch(e) {
      console.error('Error loading deleted defaults:', e);
      return { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    }
  }
  
  // Save user items to localStorage
  function saveUserItems(userItems) {
    try {
      localStorage.setItem(userItemsKey, JSON.stringify(userItems));
      scheduleFileSave();
    } catch(e) {
      handleError('saveUserItems', e, 'Failed to save user items');
    }
  }
  
  // Save deleted defaults to localStorage
  function saveDeletedDefaults(deletedDefaults) {
    try {
      localStorage.setItem(deletedDefaultsKey, JSON.stringify(deletedDefaults));
      scheduleFileSave();
    } catch(e) {
      handleError('saveDeletedDefaults', e, 'Failed to save deleted defaults');
    }
  }

  // Load user generators from localStorage
  function loadUserGenerators() {
    try {
      const raw = localStorage.getItem(generatorsKey);
      let parsed = raw ? JSON.parse(raw) : { battleCries: [], insults: [], compliments: [], introductions: [] };
      
      // Ensure structure is correct - each type should be an array
      if (!parsed.battleCries || !Array.isArray(parsed.battleCries)) {
        parsed.battleCries = [];
      }
      if (!parsed.insults || !Array.isArray(parsed.insults)) {
        parsed.insults = [];
      }
      if (!parsed.compliments || !Array.isArray(parsed.compliments)) {
        parsed.compliments = [];
      }
      if (!parsed.introductions || !Array.isArray(parsed.introductions)) {
        parsed.introductions = [];
      }
      
      // Filter out any non-string values (cleanup)
      parsed.battleCries = parsed.battleCries.filter(item => typeof item === 'string');
      parsed.insults = parsed.insults.filter(item => typeof item === 'string');
      parsed.compliments = parsed.compliments.filter(item => typeof item === 'string');
      parsed.introductions = parsed.introductions.filter(item => typeof item === 'string');
      
      return parsed;
    } catch(e) {
      console.error('Error loading generators:', e);
      return { battleCries: [], insults: [], compliments: [], introductions: [] };
    }
  }

  // Save user generators to localStorage
  function saveUserGenerators(userGenerators) {
    try {
      localStorage.setItem(generatorsKey, JSON.stringify(userGenerators));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save generators:', e);
    }
  }

  // Load edited defaults
  function loadEditedDefaults() {
    try {
      const raw = localStorage.getItem(editedDefaultsKey);
      return raw ? JSON.parse(raw) : { battleCries: {}, insults: {}, compliments: {} };
    } catch(e) {
      return { battleCries: {}, insults: {}, compliments: {} };
    }
  }

  // Save edited defaults
  function saveEditedDefaults(editedDefaults) {
    try {
      localStorage.setItem(editedDefaultsKey, JSON.stringify(editedDefaults));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save edited defaults:', e);
    }
  }

  // Load deleted defaults
  function loadDeletedGeneratorDefaults() {
    try {
      const raw = localStorage.getItem(deletedGeneratorDefaultsKey);
      const result = raw ? JSON.parse(raw) : { battleCries: [], insults: [], compliments: [] };
      // Ensure all types exist
      if (!result.battleCries) result.battleCries = [];
      if (!result.insults) result.insults = [];
      if (!result.compliments) result.compliments = [];
      debugLog('loadDeletedGeneratorDefaults:', result);
      return result;
    } catch(e) {
      console.error('Error loading deleted generator defaults:', e);
      return { battleCries: [], insults: [], compliments: [] };
    }
  }

  // Save deleted defaults
  function saveDeletedGeneratorDefaults(deletedDefaults) {
    try {
      localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(deletedDefaults));
      scheduleFileSave();
    } catch(e) {
      console.error('Failed to save deleted generator defaults:', e);
    }
  }

  // Get merged generators (defaults + user-added, respecting edits and deletions)
  function getMergedGenerators(type) {
    const defaults = {
      battleCries: battleCries,
      insults: insults,
      compliments: compliments,
      introductions: introductions
    };
    const userAdded = loadUserGenerators();
    const editedDefaults = loadEditedDefaults();
    const deletedDefaults = loadDeletedGeneratorDefaults();
    
    debugLog('getMergedGenerators for', type);
    debugLog('Deleted defaults:', deletedDefaults[type]);
    debugLog('User added:', userAdded[type]);
    
    // Use common merge logic
    const getIdFn = (item, index) => `${type}_${index}`;
    const merged = mergeItems(
      defaults[type] || [],
      userAdded[type] || [],
      deletedDefaults[type] || [],
      editedDefaults[type],
      getIdFn
    );
    
    debugLog('Merged list length:', merged.length);
    debugLog('User added items:', userAdded[type]);
    return merged;
  }
  
  // Generate unique ID for an item
  function getItemId(section, item) {
    if (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') {
      return typeof item === 'string' ? item : '';
    }
    return `${item.t}|${item.s}|${item.a}|${item.adult ? '1' : '0'}`;
  }
  
  let userItems = loadUserItems();
  let deletedDefaults = loadDeletedDefaults();
  
  // Debug: Log user items on load
  debugLog('Loaded user items:', userItems);
  debugLog('Loaded deleted defaults:', deletedDefaults);
  
  // Safety check: Clear deletedDefaults if it seems corrupted (has non-array values)
  let needsReset = false;
  for (const section in deletedDefaults) {
    if (deletedDefaults[section] && typeof deletedDefaults[section] === 'object') {
      for (const category in deletedDefaults[section]) {
        if (!Array.isArray(deletedDefaults[section][category])) {
          console.warn(`Found corrupted deletedDefaults entry: ${section}/${category}`);
          needsReset = true;
        }
      }
    } else if (deletedDefaults[section] && typeof deletedDefaults[section] !== 'object') {
      console.warn(`Found non-object deletedDefaults section: ${section}`);
      needsReset = true;
    }
  }
  
  // Also check if deletedDefaults has excessive entries (likely corrupted)
  const totalDeleted = Object.values(deletedDefaults).reduce((sum, section) => {
    if (typeof section === 'object') {
      return sum + Object.values(section).reduce((s, cat) => s + (Array.isArray(cat) ? cat.length : 0), 0);
    }
    return sum;
  }, 0);
  
  if (totalDeleted > MAX_DELETED_DEFAULTS) {
    console.warn(`Found excessive deleted defaults (${totalDeleted} entries). Resetting.`);
    needsReset = true;
  }
  
  if (needsReset) {
    console.warn('Resetting corrupted deletedDefaults');
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    saveDeletedDefaults(deletedDefaults);
  }
  
  // Expose reset function to console for manual fixes
  window.resetDeletedDefaults = function() {
    deletedDefaults = { spells: {}, adultSpells: {}, bardic: {}, mockery: {}, actions: {}, criticalHits: {}, criticalFailures: {} };
    saveDeletedDefaults(deletedDefaults);
    debugLog('Deleted defaults reset. Reloading page...');
    location.reload();
  };
  
      debugLog('To reset deleted defaults manually, run: resetDeletedDefaults()');
  
  // Merge user items with default items, filtering out deleted defaults
  function getMergedData(section, category) {
    const defaults = section === 'spells' ? spells
      : section === 'bardic' ? bardic
      : section === 'actions' ? characterActions
      : section === 'criticalHits' ? criticalHits
      : section === 'criticalFailures' ? criticalFailures
      : section === 'skillChecks' ? skillChecks
      : mockery;
    
    const defaultList = (defaults[category] || []);
    const deletedIds = deletedDefaults[section]?.[category] || [];
    
    // Debug logging
    if (defaultList.length > 0) {
      debugLog(`getMergedData: ${section}/${category} - Defaults: ${defaultList.length}, Deleted IDs: ${deletedIds.length}`);
      if (deletedIds.length > 0) {
        debugLog(`Deleted IDs for ${section}/${category}:`, deletedIds);
      }
    }
    
    // Safety check: if all items would be filtered out but we have defaults, something is wrong
    if (deletedIds.length > 0 && defaultList.length > 0) {
      const tempFiltered = defaultList.filter(item => {
        const itemId = getItemId(section, item);
        return !deletedIds.includes(itemId);
      });
      
      if (tempFiltered.length === 0) {
        console.warn(`Warning: All ${defaultList.length} items filtered out for ${section}/${category} with ${deletedIds.length} deleted IDs. Clearing deleted IDs for this category.`);
        // Clear the deleted IDs for this category to prevent data corruption
        if (deletedDefaults[section] && deletedDefaults[section][category]) {
          delete deletedDefaults[section][category];
          saveDeletedDefaults(deletedDefaults);
        }
        // Return full list after clearing deletions
        const userList = userItems[section]?.[category] || [];
        debugLog(`Returning full list after clearing deletions: ${defaultList.length} defaults + ${userList.length} user items`);
        return [...defaultList, ...userList];
      }
    }
    
    // Use common merge logic (no edited defaults for regular sections)
    const getIdFn = (item, index) => getItemId(section, item);
    const merged = mergeItems(
      defaultList,
      userItems[section]?.[category] || [],
      deletedIds,
      null, // Edited defaults not used for regular sections (only generators)
      getIdFn
    );
    
    debugLog(`getMergedData result: ${section}/${category} - Returning ${merged.length} items`);
    return merged;
  }
  
  // Get adult spells merged, filtering out deleted defaults
  function getMergedAdultSpells(category) {
    const deletedIds = deletedDefaults.adultSpells?.[category] || [];
    const getIdFn = (item, index) => getItemId('spells', item);
    return mergeItems(
      adultSpells[category] || [],
      userItems.adultSpells?.[category] || [],
      deletedIds,
      null, // Edited defaults not used for adult spells
      getIdFn
    );
  }
  
  // Check if item is user-added
  function isUserItem(section, category, item, index) {
    const defaults = section === 'spells' ? spells
      : section === 'bardic' ? bardic
      : section === 'actions' ? characterActions
      : mockery;
    
    const defaultList = defaults[category] || [];
    const defaultCount = defaultList.length;
    
    if (section === 'actions') {
      return typeof item === 'string' && index >= defaultCount;
    }
    
    return index >= defaultCount;
  }
  
  let currentEditingItem = null;
  let currentEditingIndex = null;
  let currentEditingSection = null;
  let currentEditingCategory = null;
  function makeId(item){ return `${item.s} — ${item.a} — ${item.t}`; }
  function loadFavorites(){
    try { const raw = localStorage.getItem(favoritesKey); return new Set(raw ? JSON.parse(raw) : []); }
    catch(e){ return new Set(); }
  }
  function saveFavorites(){
    try { 
      localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
      scheduleFileSave();
    } catch(e){}
  }
  let favorites = loadFavorites();
  function isFav(item){ return favorites.has(makeId(item)); }
  function toggleFav(item, btn){
    const id = makeId(item);
    if (favorites.has(id)) {
      favorites.delete(id);
      btn.classList.remove('on');
      btn.textContent = '☆';
      showToast('Removed from favorites');
    } else {
      favorites.add(id);
      btn.classList.add('on');
      btn.textContent = '★';
      showToast('Added to favorites');
    }
    saveFavorites();
  }

  function buildCategories() {
    clearElement(categorySelect);
    const section = sectionSelect.value;
    
    // Safety check - ensure section is valid
    if (!section) {
      console.warn('buildCategories: No section selected');
      return;
    }
    
    let cats = [];
    try {
      debugLog('buildCategories: section =', section);
      debugLog('buildCategories: spells defined?', typeof spells !== 'undefined');
      debugLog('buildCategories: bardic defined?', typeof bardic !== 'undefined');
      debugLog('buildCategories: mockery defined?', typeof mockery !== 'undefined');
      debugLog('buildCategories: characterActions defined?', typeof characterActions !== 'undefined');
      debugLog('buildCategories: criticalHits defined?', typeof criticalHits !== 'undefined');
      debugLog('buildCategories: criticalFailures defined?', typeof criticalFailures !== 'undefined');
      debugLog('buildCategories: skillChecks defined?', typeof skillChecks !== 'undefined');
      
      if (section === 'spells') {
        cats = typeof spells !== 'undefined' && spells ? Object.keys(spells) : [];
        debugLog('buildCategories: spells keys =', cats);
      } else if (section === 'bardic') {
        cats = typeof bardic !== 'undefined' && bardic ? Object.keys(bardic) : [];
        debugLog('buildCategories: bardic keys =', cats);
      } else if (section === 'actions') {
        cats = typeof characterActions !== 'undefined' && characterActions ? Object.keys(characterActions) : [];
        debugLog('buildCategories: characterActions keys =', cats);
      } else if (section === 'criticalHits') {
        cats = typeof criticalHits !== 'undefined' && criticalHits ? Object.keys(criticalHits) : [];
        debugLog('buildCategories: criticalHits keys =', cats);
      } else if (section === 'criticalFailures') {
        cats = typeof criticalFailures !== 'undefined' && criticalFailures ? Object.keys(criticalFailures) : [];
        debugLog('buildCategories: criticalFailures keys =', cats);
      } else if (section === 'skillChecks') {
        cats = typeof skillChecks !== 'undefined' && skillChecks ? Object.keys(skillChecks) : [];
        debugLog('buildCategories: skillChecks keys =', cats);
      } else {
        cats = typeof mockery !== 'undefined' && mockery ? Object.keys(mockery) : [];
        debugLog('buildCategories: mockery keys =', cats);
      }
    } catch (error) {
      console.error('Error building categories:', error);
      console.error('Error stack:', error.stack);
      cats = [];
    }
    
    for (const c of cats) {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c; categorySelect.appendChild(opt);
    }
    
    // If no categories found, add a message
    if (cats.length === 0) {
      console.warn(`buildCategories: No categories found for section: ${section}`);
    }
  }

  function getActiveList() {
    const section = sectionSelect.value;
    const cat = categorySelect.value;
    
    debugLog(`getActiveList: section=${section}, category=${cat}`);
    
    if (!cat) {
      console.warn('getActiveList: No category selected!');
      return [];
    }
    
    if (section === 'spells') {
      const base = getMergedData('spells', cat);
      const add = getMergedAdultSpells(cat);
      const result = [...base, ...add];
      debugLog(`getActiveList spells: base=${base.length}, add=${add.length}, result=${result.length}`);
      return result;
    } else if (section === 'bardic') {
      const result = getMergedData('bardic', cat);
      debugLog(`getActiveList bardic: result=${result.length}`);
      return result;
    } else if (section === 'actions') {
      const result = getMergedData('actions', cat);
      debugLog(`getActiveList actions: result=${result.length}`);
      return result;
    } else if (section === 'criticalHits') {
      const result = getMergedData('criticalHits', cat);
      debugLog(`getActiveList criticalHits: result=${result.length}`);
      return result;
    } else if (section === 'criticalFailures') {
      const result = getMergedData('criticalFailures', cat);
      debugLog(`getActiveList criticalFailures: result=${result.length}`);
      return result;
    } else if (section === 'skillChecks') {
      const result = getMergedData('skillChecks', cat);
      debugLog(`getActiveList skillChecks: result=${result.length}`);
      return result;
    } else {
      const result = getMergedData('mockery', cat);
      debugLog(`getActiveList mockery: result=${result.length}`);
      return result;
    }
  }

  // Global search across all sections and categories
  function renderGlobalSearch(q) {
    debugLog(`renderGlobalSearch: searching for "${q}"`);
    
    const allResults = [];
    
    // Search spells (all categories)
    const spellCategories = Object.keys(spells || {});
    for (const cat of spellCategories) {
      const spellList = getMergedData('spells', cat);
      const filtered = spellList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'spells', category: cat, item, isAdult: false });
      }
    }
    
    // Search adult spells (always included)
    const adultCategories = Object.keys(adultSpells || {});
    for (const cat of adultCategories) {
      const adultList = getMergedAdultSpells(cat);
      const filtered = adultList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'spells', category: cat, item, isAdult: true });
      }
    }
    
    // Search bardic (all categories)
    const bardicCategories = Object.keys(bardic || {});
    for (const cat of bardicCategories) {
      const bardicList = getMergedData('bardic', cat);
      const filtered = bardicList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'bardic', category: cat, item, isAdult: false });
      }
    }
    
    // Search mockery (all categories)
    const mockeryCategories = Object.keys(mockery || {});
    for (const cat of mockeryCategories) {
      const mockeryList = getMergedData('mockery', cat);
      const filtered = mockeryList.filter(item => {
        return item.t.toLowerCase().includes(q) || 
               (item.s && item.s.toLowerCase().includes(q)) || 
               (item.a && item.a.toLowerCase().includes(q));
      });
      for (const item of filtered) {
        allResults.push({ section: 'mockery', category: cat, item, isAdult: false });
      }
    }
    
    // Search actions (all categories)
    const actionCategories = Object.keys(characterActions || {});
    for (const cat of actionCategories) {
      const actionList = getMergedData('actions', cat);
      const filtered = actionList.filter(item => {
        const actionText = typeof item === 'string' ? item : item;
        return actionText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'actions', category: cat, item, isAdult: false });
      }
    }
    
    // Search critical hits (all categories)
    const criticalHitCategories = Object.keys(criticalHits || {});
    for (const cat of criticalHitCategories) {
      const criticalHitList = getMergedData('criticalHits', cat);
      const filtered = criticalHitList.filter(item => {
        const hitText = typeof item === 'string' ? item : item;
        return hitText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'criticalHits', category: cat, item, isAdult: false });
      }
    }
    
    // Search critical failures (all categories)
    const criticalFailureCategories = Object.keys(criticalFailures || {});
    for (const cat of criticalFailureCategories) {
      const criticalFailureList = getMergedData('criticalFailures', cat);
      const filtered = criticalFailureList.filter(item => {
        const failureText = typeof item === 'string' ? item : item;
        return failureText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'criticalFailures', category: cat, item, isAdult: false });
      }
    }
    
    // Search skill checks (all categories)
    const skillCheckCategories = Object.keys(skillChecks || {});
    for (const cat of skillCheckCategories) {
      const skillCheckList = getMergedData('skillChecks', cat);
      const filtered = skillCheckList.filter(item => {
        const skillText = typeof item === 'string' ? item : item;
        return skillText.toLowerCase().includes(q);
      });
      for (const item of filtered) {
        allResults.push({ section: 'skillChecks', category: cat, item, isAdult: false });
      }
    }
    
    // Apply favorites filter if enabled
    let filteredResults = allResults;
    if (favoritesOnly && favoritesOnly.checked) {
      filteredResults = allResults.filter(result => {
        if (result.section === 'actions' || result.section === 'criticalHits' || result.section === 'criticalFailures' || result.section === 'skillChecks') {
          const itemId = getItemId(result.section, result.item);
          return favorites.has(itemId);
        }
        return isFav(result.item);
      });
    }
    
    debugLog(`renderGlobalSearch: found ${filteredResults.length} results across all sections`);
    
    // Clear content
    clearElement(content);
    
    // Group results by section/category for better organization
    const grouped = {};
    for (const result of filteredResults) {
      const key = `${result.section}/${result.category}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(result);
    }
    
    // Render grouped results
    const sectionOrder = ['spells', 'bardic', 'mockery', 'actions', 'criticalHits', 'criticalFailures', 'skillChecks'];
    const sectionLabels = {
      spells: '🔮 Spell Parodies',
      bardic: '✨ Bardic Inspiration',
      mockery: '🗡️ Vicious Mockery',
      actions: '🎭 Character Actions',
      criticalHits: '⚔️ Critical Hit Descriptions',
      criticalFailures: '💥 Critical Failure Descriptions',
      skillChecks: '🎯 Skill Check Results'
    };
    
    for (const section of sectionOrder) {
      const sectionKeys = Object.keys(grouped).filter(k => k.startsWith(section + '/'));
      if (sectionKeys.length === 0) continue;
      
      // Section header
      const sectionHeader = document.createElement('div');
      sectionHeader.style.gridColumn = '1 / -1';
      sectionHeader.style.fontSize = '20px';
      sectionHeader.style.fontWeight = 'bold';
      sectionHeader.style.marginTop = '16px';
      sectionHeader.style.marginBottom = '8px';
      sectionHeader.style.color = 'var(--accent)';
      sectionHeader.textContent = sectionLabels[section];
      content.appendChild(sectionHeader);
      
      // Render results for each category in this section
      for (const key of sectionKeys.sort()) {
        const [sec, cat] = key.split('/');
        const categoryResults = grouped[key];
        
        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.style.gridColumn = '1 / -1';
        categoryHeader.style.fontSize = '16px';
        categoryHeader.style.fontWeight = '600';
        categoryHeader.style.marginTop = '12px';
        categoryHeader.style.marginBottom = '4px';
        categoryHeader.style.color = 'var(--burnt)';
        categoryHeader.textContent = `→ ${cat}`;
        content.appendChild(categoryHeader);
        
        // Render cards for this category
        for (const result of categoryResults) {
          if (result.section === 'actions') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'criticalHits') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'criticalFailures') {
            renderActionCard(result.item, result.category);
          } else if (result.section === 'skillChecks') {
            renderActionCard(result.item, result.category);
          } else {
            renderSpellCard(result.item, result.section, result.category, result.isAdult);
          }
        }
      }
    }
    
    // Show empty message if no results
    if (filteredResults.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = `No results found for "${q}". Try a different search term.`;
      content.appendChild(empty);
    }
  }
  
  // Helper function to render a spell/bardic/mockery card in global search
  function renderSpellCard(item, section, category, isAdult) {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    
    const favBtn = document.createElement('button');
    favBtn.className = 'card__fav';
    const favOn = isFav(item);
    favBtn.textContent = favOn ? '★' : '☆';
    if (favOn) favBtn.classList.add('on');
    favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(item, favBtn); });
    
    const chip = document.createElement('span');
    chip.className = 'card__chip';
    chip.textContent = section === 'spells' ? 'Spell' : (section === 'bardic' ? 'Bardic' : 'Mockery');
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card__copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyLine(item); });
    
    // Determine if item is user-added or default
    const defaults = section === 'spells' ? spells : (section === 'bardic' ? bardic : mockery);
    const defaultList = defaults[category] || [];
    const itemId = getItemId(section, item);
    const isDefaultItem = defaultList.some(x => {
      return x.t === item.t && x.s === item.s && x.a === item.a;
    });
    
    // Check if it's user-added
    const fullList = getMergedData(section, category);
    const fullIndex = fullList.findIndex(x => {
      return x.t === item.t && x.s === item.s && x.a === item.a && (x.adult === item.adult || (!x.adult && !item.adult));
    });
    const defaultCount = defaultList.filter(item => {
      const itemId = getItemId(section, item);
      return !(deletedDefaults[section]?.[category] || []).includes(itemId);
    }).length;
    const isUserAdded = fullIndex >= defaultCount;
    let userIndex = isUserAdded ? fullIndex - defaultCount : null;
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'card__edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit or delete this item';
    
    const isDark = document.body.classList.contains('dark-mode');
    if (isUserAdded) {
      card.style.borderLeft = '4px solid #2b6f3a';
      card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
    } else if (isDefaultItem) {
      card.style.borderLeft = '4px solid #4a90e2';
      card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
    }
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemWithMeta = { ...item, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
      if (isAdult) itemWithMeta.adult = true;
      const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
      openEditModal(section, category, itemWithMeta, editIndex);
    });
    
    card.appendChild(editBtn);
    card.addEventListener('click', () => copyLine(item));
    
    const p = document.createElement('div');
    p.textContent = item.t;
    const meta = document.createElement('div');
    meta.className = 'card__meta';
    if (section === 'mockery') {
      meta.textContent = `Mockery — ${category}`;
    } else {
      meta.textContent = `Song: ${item.s} — ${item.a}${item.adult || isAdult ? '  •  Adult' : ''}`;
    }
    
    card.appendChild(favBtn);
    card.appendChild(copyBtn);
    card.appendChild(chip);
    card.appendChild(p);
    card.appendChild(meta);
    content.appendChild(card);
  }
  
  // Helper function to render an action card in global search
  function renderActionCard(action, category) {
    const card = document.createElement('article');
    card.className = 'card action-card';
    card.style.cursor = 'pointer';
    card.tabIndex = 0;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'card__copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', (e) => { 
      e.stopPropagation(); 
      copyToClipboard(action, 'actions', category);
    });
    
    // Determine if action is user-added or default
    const defaults = characterActions[category] || [];
    const itemId = getItemId('actions', action);
    const deletedIds = deletedDefaults.actions?.[category] || [];
    const isDeletedDefault = deletedIds.includes(itemId);
    const isDefaultItem = defaults.includes(action);
    
    const fullActions = getMergedData('actions', category);
    const fullIndex = fullActions.indexOf(action);
    const filteredDefaultCount = fullActions.length - ((userItems.actions && userItems.actions[category]) ? userItems.actions[category].length : 0);
    const isUserAdded = fullIndex >= filteredDefaultCount;
    const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'card__edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit or delete this item';
    
    const isDark = document.body.classList.contains('dark-mode');
    if (isUserAdded) {
      card.style.borderLeft = '4px solid #2b6f3a';
      card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
    } else if (isDefaultItem && !isDeletedDefault) {
      card.style.borderLeft = '4px solid #4a90e2';
      card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
    }
    
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemWithMeta = { ...action, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
      const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
      openEditModal('actions', category, itemWithMeta, editIndex);
    });
    
    card.appendChild(editBtn);
    card.addEventListener('click', () => copyToClipboard(action, 'actions', category));
    
    const p = document.createElement('div');
    p.textContent = action;
    const meta = document.createElement('div');
    meta.className = 'card__meta';
    meta.textContent = `Action — ${category}`;
    
    card.appendChild(copyBtn);
    card.appendChild(p);
    card.appendChild(meta);
    content.appendChild(card);
  }

  function render() {
    const section = sectionSelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    debugLog(`render() called for section: ${section}, search query: "${q}"`);
    
    // If there's a search query, use global search across all sections
    if (q) {
      renderGlobalSearch(q);
      return;
    }
    
    // Special rendering for workflow sections (actions, crits, skills)
    if (window.ActionWorkflow?.isWorkflowSection(section)) {
      renderWorkflowOutcomes();
      return;
    }
    
    const cat = categorySelect.value;
    
    if (!cat) {
      console.warn('No category selected');
      clearElement(content);
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'Please select a category';
      content.appendChild(emptyCard);
      // Try to build categories if they're missing
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          // Re-render with the first category
          setTimeout(() => render(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get base data directly (like renderActions does)
    let baseList;
    if (section === 'spells') {
      const spellList = (spells[cat] || []).filter(item => {
        const itemId = getItemId('spells', item);
        const deletedIds = deletedDefaults.spells?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      const adultList = (adultSpells[cat] || []).filter(item => {
        const itemId = getItemId('spells', item);
        const deletedIds = deletedDefaults.adultSpells?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = [...spellList, ...adultList];
    } else if (section === 'bardic') {
      const bardicList = (bardic[cat] || []).filter(item => {
        const itemId = getItemId('bardic', item);
        const deletedIds = deletedDefaults.bardic?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = bardicList;
    } else {
      const mockeryList = (mockery[cat] || []).filter(item => {
        const itemId = getItemId('mockery', item);
        const deletedIds = deletedDefaults.mockery?.[cat] || [];
        return !deletedIds.includes(itemId);
      });
      baseList = mockeryList;
    }
    
    // Ensure baseList is always an array
    if (!Array.isArray(baseList)) {
      baseList = [];
    }
    
    // Add user items
    const userList = userItems[section]?.[cat] || [];
    if (section === 'spells') {
      const userAdultList = userItems.adultSpells?.[cat] || [];
      baseList = [...baseList, ...userList, ...userAdultList];
    } else {
      baseList = [...baseList, ...userList];
    }
    
    debugLog(`render: baseList length=${baseList.length} for ${section}/${cat}`);
    
    // Apply filters
    let list = baseList;
    
    if (q) {
      list = list.filter(x => {
        if (typeof x === 'string') {
          return x.toLowerCase().includes(q);
        }
      return x.t.toLowerCase().includes(q) || (x.s && x.s.toLowerCase().includes(q)) || (x.a && x.a.toLowerCase().includes(q));
    });
    }
    
    debugLog(`render: after search filter, list length=${list.length}`);
    
    if (favoritesOnly && favoritesOnly.checked) {
      list = list.filter(isFav);
      debugLog(`render: after favorites filter, list length=${list.length}`);
    }
    
    debugLog(`render: final list length=${list.length} for ${section}`);
    
    clearElement(content);
    
    // Add random button at the top (uses full baseList, not filtered)
    if (baseList.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      const isDark = document.body.classList.contains('dark-mode');
      randomCard.style.background = isDark ? 'linear-gradient(135deg, #3d3d5e 0%, #2d2d44 100%)' : 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomItem = baseList[Math.floor(Math.random() * baseList.length)];
        
        // Check if the selected item is in the filtered results
        const isInFiltered = list.some(x => {
          if (typeof x === 'string') return x === randomItem;
          if (typeof randomItem === 'string') return false;
          return x.t === randomItem.t && x.s === randomItem.s && x.a === randomItem.a;
        });
        
        // Find and highlight the selected item card if it's visible
        const allCards = content.querySelectorAll('.card:not(.random-card)');
        let selectedCard = null;
        for (const card of allCards) {
          const textDiv = card.querySelector('div:not(.card__meta)');
          if (textDiv) {
            const cardText = typeof randomItem === 'string' ? randomItem : randomItem.t;
            if (textDiv.textContent.includes(cardText)) {
              selectedCard = card;
              break;
            }
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}...`);
        } else if (!isInFiltered) {
          // Selected item is filtered out - show a longer toast message
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}... (not in current filter)`);
        } else {
          const displayText = typeof randomItem === 'string' ? randomItem : randomItem.t;
          showToast(`Random: ${displayText.substring(0, 50)}...`);
        }
        
        // Copy to clipboard
        if (typeof randomItem === 'string') {
          copyToClipboard(randomItem, section, cat);
        } else {
          copyLine(randomItem);
        }
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random line and copy it!';
      
      randomCard.classList.add('random-card');
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    
    for (const item of list) {
      const card = document.createElement('article');
      card.className = 'card';
      card.tabIndex = 0; // Make focusable for keyboard navigation
      const favBtn = document.createElement('button');
      favBtn.className = 'card__fav';
      const favOn = isFav(item);
      favBtn.textContent = favOn ? '★' : '☆';
      if (favOn) favBtn.classList.add('on');
      favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(item, favBtn); });
      const chip = document.createElement('span');
      chip.className = 'card__chip';
      chip.textContent = section === 'spells' ? 'Spell' : (section === 'bardic' ? 'Bardic' : 'Mockery');
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyLine(item); });
      
      // Add karaoke play button if YouTube or local karaoke exists
      let youtubeBtn = null;
      if (item.youtube || item.localKaraoke) {
        const startTime = item.startTime || 0;
        const videoId = item.localKaraoke || item.youtube;
        const hasLocal = !!item.localKaraoke;
        
        youtubeBtn = document.createElement('button');
        youtubeBtn.type = 'button';
        youtubeBtn.className = 'card__youtube';
        youtubeBtn.textContent = hasLocal ? '🎤' : '▶️';
        youtubeBtn.title = hasLocal ? 'Play local karaoke' : 'Play karaoke track';
        youtubeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.BlingusKaraoke) {
            window.BlingusKaraoke.playItem(item, item.s || 'Karaoke Track');
          } else {
            const startSeconds = Math.floor(startTime || 0);
            const watchParams = new URLSearchParams();
            watchParams.set('v', videoId);
            if (startSeconds > 0) watchParams.set('t', startSeconds.toString());
            watchParams.set('autoplay', '1');
            window.open(`https://www.youtube.com/watch?${watchParams.toString()}`, '_blank');
          }
        });
      }
      
      // Add start time badge if startTime exists
      let startTimeBadge = null;
      let startTimeInput = null;
      let isEditingStartTime = false;
      if (item.startTime !== undefined && item.startTime !== null) {
        startTimeBadge = document.createElement('span');
        startTimeBadge.className = 'card__start-time';
        startTimeBadge.textContent = `Start: ${formatTime(item.startTime)}`;
        startTimeBadge.title = 'Click to edit start time';
        startTimeBadge.style.cursor = 'pointer';
        startTimeBadge.style.marginLeft = '8px';
        startTimeBadge.style.padding = '2px 6px';
        startTimeBadge.style.borderRadius = '4px';
        startTimeBadge.style.background = 'var(--accent)';
        startTimeBadge.style.color = 'white';
        startTimeBadge.style.fontSize = '12px';
        
        startTimeBadge.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isEditingStartTime) return;
          
          isEditingStartTime = true;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = formatTime(item.startTime);
          input.style.width = '60px';
          input.style.padding = '2px 4px';
          input.style.border = '1px solid var(--burnt)';
          input.style.borderRadius = '4px';
          input.style.fontSize = '12px';
          
          const saveTime = () => {
            const newTime = parseTime(input.value);
            if (newTime !== null && newTime >= 0) {
              // Update the item
              if (isUserAdded) {
                if (section === 'spells' && isAdultSpell) {
                  if (userItems.adultSpells[cat]) {
                    userItems.adultSpells[cat][userIndex].startTime = newTime;
                  }
                } else {
                  if (userItems[section] && userItems[section][cat]) {
                    userItems[section][cat][userIndex].startTime = newTime;
                  }
                }
                saveUserItems(userItems);
                scheduleFileSave();
                render(); // Re-render to show updated time
              } else {
                // For default items, we need to edit them (which creates a user copy)
                openEditModal(section, cat, item, -1);
                setTimeout(() => {
                  editStartTime.value = formatTime(newTime);
                }, 100);
              }
            } else {
              showToast('Invalid time format');
            }
            isEditingStartTime = false;
          };
          
          input.addEventListener('blur', saveTime);
          input.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') {
              evt.preventDefault();
              saveTime();
            } else if (evt.key === 'Escape') {
              isEditingStartTime = false;
              startTimeBadge.style.display = '';
              input.remove();
            }
          });
          
          startTimeBadge.style.display = 'none';
          startTimeBadge.parentNode.insertBefore(input, startTimeBadge);
          input.focus();
          input.select();
        });
      }
      
      // Add edit button for ALL items (both default and user-added)
      // Use baseList we already have to determine if item is user-added
      const fullIndex = baseList.findIndex(x => {
        return x.t === item.t && x.s === item.s && x.a === item.a && (x.adult === item.adult || (!x.adult && !item.adult));
      });
      
      // Determine default count (after filtering deleted)
      let defaultCount;
      if (section === 'spells') {
        const spellCount = (spells[cat] || []).filter(item => {
          const itemId = getItemId('spells', item);
          return !(deletedDefaults.spells?.[cat] || []).includes(itemId);
        }).length;
        const adultCount = (adultSpells[cat] || []).filter(item => {
          const itemId = getItemId('spells', item);
          return !(deletedDefaults.adultSpells?.[cat] || []).includes(itemId);
        }).length;
        defaultCount = spellCount + adultCount;
      } else {
        const defaults = section === 'bardic' ? bardic : mockery;
        defaultCount = (defaults[cat] || []).filter(item => {
          const itemId = getItemId(section, item);
          return !(deletedDefaults[section]?.[cat] || []).includes(itemId);
        }).length;
      }
      
      // Check if this is a default item (before filtering deleted ones)
      const defaults = section === 'spells' ? spells
        : section === 'bardic' ? bardic
        : mockery;
      const defaultList = defaults[cat] || [];
      const itemId = getItemId(section, item);
      let isDefaultItem = defaultList.some(x => {
        return x.t === item.t && x.s === item.s && x.a === item.a;
      });
      // Also check adult spells for spells section
      if (section === 'spells' && !isDefaultItem) {
        isDefaultItem = (adultSpells[cat] || []).some(x => {
          return x.t === item.t && x.s === item.s && x.a === item.a;
        });
      }
      
      // Check if it's user-added
      const isUserAdded = fullIndex >= defaultCount;
      let userIndex = null;
      let isAdultSpell = false;
      
      if (isUserAdded) {
        if (section === 'spells' && item.adult) {
          const userSpells = userItems.spells[cat] || [];
          const spellDefaultCount = (spells[cat] || []).filter(item => {
            const itemId = getItemId('spells', item);
            return !(deletedDefaults.spells?.[cat] || []).includes(itemId);
          }).length;
          const adultDefaultCount = (adultSpells[cat] || []).filter(item => {
            const itemId = getItemId('spells', item);
            return !(deletedDefaults.adultSpells?.[cat] || []).includes(itemId);
          }).length;
          const userAdultStartIndex = spellDefaultCount + adultDefaultCount + userSpells.length;
          if (fullIndex >= userAdultStartIndex) {
            userIndex = fullIndex - userAdultStartIndex;
            isAdultSpell = true;
          } else {
            userIndex = fullIndex - spellDefaultCount;
          }
        } else {
          userIndex = fullIndex - defaultCount;
        }
      }
      
      const isDeletedDefault = (deletedDefaults[section]?.[cat] || []).includes(itemId) || 
                                (section === 'spells' && item.adult && (deletedDefaults.adultSpells?.[cat] || []).includes(itemId));
      
      // Show edit button on ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      editBtn.style.cssText = '';
      
      // Visual indicator for user-added items
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        // Default items get a blue border
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Store metadata about whether this is a default item
        const itemWithMeta = { ...item, _isDefaultItem: isDefaultItem, _isUserAdded: isUserAdded };
        if (section === 'spells' && isAdultSpell) {
          itemWithMeta.adult = true;
        }
        // Pass -1 for default items to indicate they need special handling
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal(section, cat, itemWithMeta, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => copyLine(item));

      const p = document.createElement('div');
      p.textContent = item.t;
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      if (section === 'mockery') {
        meta.textContent = `Mockery — ${categorySelect.value}`;
      } else {
        meta.textContent = `Song: ${item.s} — ${item.a}${item.adult ? '  •  Adult' : ''}`;
      }

      card.appendChild(favBtn);
      card.appendChild(copyBtn);
      if (youtubeBtn) {
        card.appendChild(youtubeBtn);
      }
      if (startTimeBadge) {
        card.appendChild(startTimeBadge);
      }
      card.appendChild(chip);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }

    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderWorkflowOutcomes() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const wfState = window.ActionWorkflow?.getState?.() || { targets: ['any'], outcomeMod: 'roleplay' };
    const context = window.ActionWorkflow?.resolveOutcomeContext?.() || { ready: false, reason: 'Use the steps above to narrow down outcomes.' };

    clearElement(content);

    if (!context.ready) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = context.reason;
      content.appendChild(emptyCard);
      return;
    }

    const { section, category, metaLabel, modalPrefix, location } = context;
    const sceneLabel = window.ActionWorkflow.getSceneLabel(location);
    const basePool = getMergedData(section, category);
    const mergedPool = window.ActionWorkflow.buildWorkflowOutcomePool(basePool, wfState, context);

    if (!mergedPool.length) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'No outcomes yet for this combination. Try Edit Items to add some.';
      content.appendChild(emptyCard);
      return;
    }

    let validTexts = window.ActionWorkflow.filterValidOutcomes(mergedPool, wfState, context);
    if (q) {
      validTexts = validTexts.filter((text) => text.toLowerCase().includes(q));
    }
    if (favoritesOnly && favoritesOnly.checked) {
      validTexts = validTexts.filter((text) => favorites.has(getItemId(section, text)));
    }

    const defaultsMap = section === 'actions' ? characterActions
      : section === 'criticalHits' ? criticalHits
      : section === 'criticalFailures' ? criticalFailures
      : skillChecks;
    const defaults = defaultsMap[category] || [];

    const cardClass = section === 'actions' ? 'action-card'
      : section === 'criticalHits' ? 'critical-hit-card'
      : section === 'criticalFailures' ? 'critical-failure-card'
      : 'skill-check-card';

    const dataAttr = section === 'actions' ? 'actionText'
      : section === 'criticalHits' ? 'hitText'
      : section === 'criticalFailures' ? 'failureText'
      : 'checkText';

    const isDark = document.body.classList.contains('dark-mode');
    const userAddedCount = (userItems[section] && userItems[section][category]) ? userItems[section][category].length : 0;
    const filteredDefaultCount = mergedPool.length - userAddedCount;

    const intro = document.createElement('div');
    intro.className = 'card workflow-outcomes-intro';
    intro.style.fontSize = '14px';
    intro.style.opacity = '0.85';
    intro.style.padding = '12px 16px';
    if (validTexts.length) {
      const filteredNote = validTexts.length < mergedPool.length
        ? ` (${mergedPool.length - validTexts.length} hidden — don't fit this selection)`
        : '';
      intro.textContent = `${validTexts.length} valid outcome${validTexts.length === 1 ? '' : 's'} for this scene and choices${filteredNote}`;
    } else {
      intro.textContent = window.ActionWorkflow.getEmptyOutcomeHint(wfState, context, mergedPool.length, 0)
        || 'No valid outcomes for this selection.';
    }
    content.appendChild(intro);

    if (validTexts.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card random-card';
      randomCard.style.background = isDark ? 'linear-gradient(135deg, #3d3d5e 0%, #2d2d44 100%)' : 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';

      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn btn-random';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const pick = validTexts[Math.floor(Math.random() * validTexts.length)];
        const titleParts = [modalPrefix, sceneLabel];
        if (section !== 'actions') titleParts.push(category);
        showGeneratorModal(titleParts.join(' · '), pick, section);
      });

      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = `Random pick from ${validTexts.length} valid outcome${validTexts.length === 1 ? '' : 's'}`;

      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }

    for (let i = 0; i < validTexts.length; i++) {
      const item = validTexts[i];
      const fullIndex = basePool.indexOf(item);
      const isDefaultItem = defaults.includes(item);
      const deletedIds = deletedDefaults[section]?.[category] || [];
      const isDeletedDefault = deletedIds.includes(getItemId(section, item));
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;

      const card = document.createElement('article');
      card.className = `card ${cardClass}`;
      card.style.cursor = 'pointer';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        content.querySelectorAll(`.${cardClass}`).forEach((c) => c.classList.remove('highlighted'));
        copyToClipboard(item, section, category);
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(section, category, item, isUserAdded ? userIndex : (isDefaultItem ? -1 : null));
      });
      card.appendChild(editBtn);

      card.addEventListener('click', () => {
        content.querySelectorAll(`.${cardClass}`).forEach((c) => c.classList.remove('highlighted'));
        copyToClipboard(item, section, category);
      });

      const p = document.createElement('div');
      p.textContent = item;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset[dataAttr] = item;

      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = section === 'actions'
        ? `${metaLabel} — ${sceneLabel}`
        : `${metaLabel} — ${sceneLabel} · ${category}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
  }

  function renderActions() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const cat = categorySelect.value;
    
    if (!cat) {
      console.warn('No category selected for actions');
      clearElement(content);
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'Please select a category from the dropdown above';
      content.appendChild(emptyCard);
      // Try to select first category if available
      if (categorySelect.options.length > 0) {
        categorySelect.selectedIndex = 0;
        setTimeout(() => renderActions(), RENDER_DELAY_MS);
      }
      return;
    }
    
    // Get merged actions (defaults + user items, excluding deleted)
    const fullActions = getMergedData('actions', cat);
    const defaults = characterActions[cat] || [];
    let filteredActions = fullActions;
    
    debugLog(`renderActions: category=${cat}, fullActions=${fullActions.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredActions = fullActions.filter(a => a.toLowerCase().includes(q));
      debugLog(`renderActions: after search filter, filteredActions=${filteredActions.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredActions = filteredActions.filter(action => {
        const itemId = getItemId('actions', action);
        return favorites.has(itemId);
      });
      debugLog(`renderActions: after favorites filter, filteredActions=${filteredActions.length}`);
    }
    
    debugLog(`renderActions: final filteredActions=${filteredActions.length}, will render ${filteredActions.length} cards`);
    debugLog(`renderActions: content element exists:`, !!content);
    debugLog(`renderActions: Sample filteredActions (first 3):`, filteredActions.slice(0, 3));
    
    clearElement(content);
    
    debugLog(`renderActions: content cleared`);
    
    // Add random button at the top (uses full list, not filtered)
    if (fullActions.length > 0) {
      debugLog(`renderActions: Adding random button, fullActions.length=${fullActions.length}`);
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomAction = fullActions[Math.floor(Math.random() * fullActions.length)];
        showGeneratorModal(`🎭 ${cat}`, randomAction, 'actions');
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click for a random thing Blingus says or does!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered actions
    const filteredDefaultCount = fullActions.length - ((userItems.actions && userItems.actions[cat]) ? userItems.actions[cat].length : 0);
    
    debugLog(`renderActions: Starting loop, filteredActions.length=${filteredActions.length}`);
    debugLog(`renderActions: userItems.actions exists:`, !!userItems.actions);
    debugLog(`renderActions: userItems.actions[cat] exists:`, !!(userItems.actions && userItems.actions[cat]));
    debugLog(`renderActions: filteredDefaultCount=${filteredDefaultCount}`);
    
    for (let i = 0; i < filteredActions.length; i++) {
      const action = filteredActions[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullActions.indexOf(action);
      
      // Check if this is a default item
      const itemId = getItemId('actions', action);
      const isDefaultItem = defaults.includes(action);
      const deletedIds = deletedDefaults.actions?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card action-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        // Remove highlights when clicking manually
        content.querySelectorAll('.action-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(action, 'actions', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      editBtn.style.cssText = '';
      
      // Visual indicator
      const isDarkActions = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDarkActions ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDarkActions ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Create an object wrapper for actions since strings can't have properties
        const actionObj = typeof action === 'string' ? action : action;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('actions', cat, actionObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        // Remove highlights when clicking manually
        content.querySelectorAll('.action-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(action, 'actions', cat);
      });

      const p = document.createElement('div');
      p.textContent = action;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.actionText = action; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Action — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
      debugLog(`renderActions: Appended card ${i + 1}/${filteredActions.length} for action: ${action.substring(0, 50)}...`);
    }
    
    debugLog(`renderActions: Loop complete, appended ${filteredActions.length} cards to content`);
    
    if (!filteredActions.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderCriticalHits() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderCriticalHits: No category selected');
      clearElement(content);
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'Please select a category';
      content.appendChild(emptyCard);
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderCriticalHits(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged critical hits (defaults + user items, excluding deleted)
    const fullHits = getMergedData('criticalHits', cat);
    const defaults = criticalHits[cat] || [];
    let filteredHits = fullHits;
    
    debugLog(`renderCriticalHits: category=${cat}, fullHits=${fullHits.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredHits = fullHits.filter(h => h.toLowerCase().includes(q));
      debugLog(`renderCriticalHits: after search filter, filteredHits=${filteredHits.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredHits = filteredHits.filter(hit => {
        const itemId = getItemId('criticalHits', hit);
        return favorites.has(itemId);
      });
      debugLog(`renderCriticalHits: after favorites filter, filteredHits=${filteredHits.length}`);
    }
    
    debugLog(`renderCriticalHits: final filteredHits=${filteredHits.length}, will render ${filteredHits.length} cards`);
    
    clearElement(content);
    
    // Add random button at the top (uses full list, not filtered)
    if (fullHits.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomHit = fullHits[Math.floor(Math.random() * fullHits.length)];
        
        // Check if the selected hit is in the filtered results
        const isInFiltered = filteredHits.includes(randomHit);
        
        // Find and highlight the selected hit card if it's visible
        const allCards = content.querySelectorAll('.critical-hit-card');
        let selectedCard = null;
        for (const card of allCards) {
          const hitDiv = card.querySelector('[data-hit-text]');
          if (hitDiv && hitDiv.dataset.hitText === randomHit) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomHit}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomHit} (not in current filter)`);
        } else {
          showToast(`Random: ${randomHit}`);
        }
        copyToClipboard(randomHit, 'criticalHits', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random critical hit description and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered critical hits
    const filteredDefaultCount = fullHits.length - ((userItems.criticalHits && userItems.criticalHits[cat]) ? userItems.criticalHits[cat].length : 0);
    
    debugLog(`renderCriticalHits: Starting loop, filteredHits.length=${filteredHits.length}`);
    
    for (let i = 0; i < filteredHits.length; i++) {
      const hit = filteredHits[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullHits.indexOf(hit);
      
      // Check if this is a default item
      const itemId = getItemId('criticalHits', hit);
      const isDefaultItem = defaults.includes(hit);
      const deletedIds = deletedDefaults.criticalHits?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card critical-hit-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.critical-hit-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(hit, 'criticalHits', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hitObj = typeof hit === 'string' ? hit : hit;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('criticalHits', cat, hitObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.critical-hit-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(hit, 'criticalHits', cat);
      });

      const p = document.createElement('div');
      p.textContent = hit;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.hitText = hit; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Critical Hit — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredHits.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderCriticalFailures() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderCriticalFailures: No category selected');
      clearElement(content);
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'Please select a category';
      content.appendChild(emptyCard);
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderCriticalFailures(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged critical failures (defaults + user items, excluding deleted)
    const fullFailures = getMergedData('criticalFailures', cat);
    const defaults = criticalFailures[cat] || [];
    let filteredFailures = fullFailures;
    
    debugLog(`renderCriticalFailures: category=${cat}, fullFailures=${fullFailures.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredFailures = fullFailures.filter(f => f.toLowerCase().includes(q));
      debugLog(`renderCriticalFailures: after search filter, filteredFailures=${filteredFailures.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredFailures = filteredFailures.filter(failure => {
        const itemId = getItemId('criticalFailures', failure);
        return favorites.has(itemId);
      });
      debugLog(`renderCriticalFailures: after favorites filter, filteredFailures=${filteredFailures.length}`);
    }
    
    debugLog(`renderCriticalFailures: final filteredFailures=${filteredFailures.length}, will render ${filteredFailures.length} cards`);
    
    clearElement(content);
    
    // Add random button at the top (uses full list, not filtered)
    if (fullFailures.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Feeling Chaotic? 🎲';
      randomBtn.addEventListener('click', () => {
        const randomFailure = fullFailures[Math.floor(Math.random() * fullFailures.length)];
        
        // Check if the selected failure is in the filtered results
        const isInFiltered = filteredFailures.includes(randomFailure);
        
        // Find and highlight the selected failure card if it's visible
        const allCards = content.querySelectorAll('.critical-failure-card');
        let selectedCard = null;
        for (const card of allCards) {
          const failureDiv = card.querySelector('[data-failure-text]');
          if (failureDiv && failureDiv.dataset.failureText === randomFailure) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomFailure}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomFailure} (not in current filter)`);
        } else {
          showToast(`Random: ${randomFailure}`);
        }
        copyToClipboard(randomFailure, 'criticalFailures', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random critical failure description and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered critical failures
    const filteredDefaultCount = fullFailures.length - ((userItems.criticalFailures && userItems.criticalFailures[cat]) ? userItems.criticalFailures[cat].length : 0);
    
    debugLog(`renderCriticalFailures: Starting loop, filteredFailures.length=${filteredFailures.length}`);
    
    for (let i = 0; i < filteredFailures.length; i++) {
      const failure = filteredFailures[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullFailures.indexOf(failure);
      
      // Check if this is a default item
      const itemId = getItemId('criticalFailures', failure);
      const isDefaultItem = defaults.includes(failure);
      const deletedIds = deletedDefaults.criticalFailures?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card critical-failure-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.critical-failure-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(failure, 'criticalFailures', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const failureObj = typeof failure === 'string' ? failure : failure;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('criticalFailures', cat, failureObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.critical-failure-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(failure, 'criticalFailures', cat);
      });

      const p = document.createElement('div');
      p.textContent = failure;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.failureText = failure; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Critical Failure — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredFailures.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  function renderSkillChecks() {
    const cat = categorySelect.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    
    if (!cat) {
      console.warn('renderSkillChecks: No category selected');
      clearElement(content);
      const emptyCard = document.createElement('div');
      emptyCard.className = 'card';
      emptyCard.textContent = 'Please select a category';
      content.appendChild(emptyCard);
      if (categorySelect.options.length === 0) {
        buildCategories();
        if (categorySelect.options.length > 0) {
          categorySelect.selectedIndex = 0;
          setTimeout(() => renderSkillChecks(), RENDER_DELAY_MS);
        }
      }
      return;
    }
    
    // Get merged skill checks (defaults + user items, excluding deleted)
    const fullChecks = getMergedData('skillChecks', cat);
    const defaults = skillChecks[cat] || [];
    let filteredChecks = fullChecks;
    
    debugLog(`renderSkillChecks: category=${cat}, fullChecks=${fullChecks.length}, defaults=${defaults.length}`);
    
    if (q) {
      filteredChecks = fullChecks.filter(c => c.toLowerCase().includes(q));
      debugLog(`renderSkillChecks: after search filter, filteredChecks=${filteredChecks.length}`);
    }
    
    // Apply favorites filter if enabled
    if (favoritesOnly && favoritesOnly.checked) {
      filteredChecks = filteredChecks.filter(check => {
        const itemId = getItemId('skillChecks', check);
        return favorites.has(itemId);
      });
      debugLog(`renderSkillChecks: after favorites filter, filteredChecks=${filteredChecks.length}`);
    }
    
    debugLog(`renderSkillChecks: final filteredChecks=${filteredChecks.length}, will render ${filteredChecks.length} cards`);
    
    clearElement(content);
    
    // Add random button at the top (uses full list, not filtered)
    if (fullChecks.length > 0) {
      const randomCard = document.createElement('article');
      randomCard.className = 'card';
      randomCard.style.background = 'linear-gradient(135deg, #f7e7c4 0%, #fff9eb 100%)';
      randomCard.style.border = '2px solid var(--accent)';
      
      const randomBtn = document.createElement('button');
      randomBtn.className = 'btn';
      randomBtn.style.width = '100%';
      randomBtn.style.padding = '16px';
      randomBtn.style.fontSize = '18px';
      randomBtn.style.fontWeight = 'bold';
      randomBtn.textContent = '🎲 Random Skill Check 🎲';
      randomBtn.addEventListener('click', () => {
        const randomCheck = fullChecks[Math.floor(Math.random() * fullChecks.length)];
        
        // Check if the selected check is in the filtered results
        const isInFiltered = filteredChecks.includes(randomCheck);
        
        // Find and highlight the selected check card if it's visible
        const allCards = content.querySelectorAll('.skill-check-card');
        let selectedCard = null;
        for (const card of allCards) {
          const checkDiv = card.querySelector('[data-check-text]');
          if (checkDiv && checkDiv.dataset.checkText === randomCheck) {
            selectedCard = card;
            break;
          }
        }
        
        if (selectedCard) {
          // Remove previous highlights
          allCards.forEach(c => c.classList.remove('highlighted'));
          
          // Highlight the selected card
          selectedCard.classList.add('highlighted');
          
          // Scroll to the card
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            selectedCard.classList.remove('highlighted');
          }, TOAST_DURATION_MS);
          
          showToast(`Random: ${randomCheck}`);
        } else if (!isInFiltered) {
          showToast(`Random: ${randomCheck} (not in current filter)`);
        } else {
          showToast(`Random: ${randomCheck}`);
        }
        copyToClipboard(randomCheck, 'skillChecks', cat);
      });
      
      const randomHint = document.createElement('div');
      randomHint.style.marginTop = '8px';
      randomHint.style.fontSize = '14px';
      randomHint.style.opacity = '0.7';
      randomHint.style.textAlign = 'center';
      randomHint.textContent = 'Click to get a random skill check result and copy it!';
      
      randomCard.appendChild(randomBtn);
      randomCard.appendChild(randomHint);
      content.appendChild(randomCard);
    }
    
    // Render filtered skill checks
    const filteredDefaultCount = fullChecks.length - ((userItems.skillChecks && userItems.skillChecks[cat]) ? userItems.skillChecks[cat].length : 0);
    
    debugLog(`renderSkillChecks: Starting loop, filteredChecks.length=${filteredChecks.length}`);
    
    for (let i = 0; i < filteredChecks.length; i++) {
      const check = filteredChecks[i];
      // Find the index in the full list (not filtered)
      const fullIndex = fullChecks.indexOf(check);
      
      // Check if this is a default item
      const itemId = getItemId('skillChecks', check);
      const isDefaultItem = defaults.includes(check);
      const deletedIds = deletedDefaults.skillChecks?.[cat] || [];
      const isDeletedDefault = deletedIds.includes(itemId);
      
      const isUserAdded = fullIndex >= filteredDefaultCount;
      const userIndex = isUserAdded ? fullIndex - filteredDefaultCount : null;
      
      const card = document.createElement('article');
      card.className = 'card skill-check-card';
      card.style.cursor = 'pointer';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'card__copy';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        content.querySelectorAll('.skill-check-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(check, 'skillChecks', cat);
      });
      
      // Add edit button for ALL items
      const editBtn = document.createElement('button');
      editBtn.className = 'card__edit';
      editBtn.textContent = '✎';
      editBtn.title = 'Edit or delete this item';
      
      // Visual indicator
      const isDark = document.body.classList.contains('dark-mode');
      if (isUserAdded) {
        card.style.borderLeft = '4px solid #2b6f3a';
        card.style.background = isDark ? '#2d3d2d' : '#f0f8f0';
      } else if (isDefaultItem && !isDeletedDefault) {
        card.style.borderLeft = '4px solid #4a90e2';
        card.style.background = isDark ? '#2d3d4d' : '#f0f4f8';
      }
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const checkObj = typeof check === 'string' ? check : check;
        const editIndex = isUserAdded ? userIndex : (isDefaultItem ? -1 : null);
        openEditModal('skillChecks', cat, checkObj, editIndex);
      });
      card.appendChild(editBtn);
      
      card.addEventListener('click', () => {
        content.querySelectorAll('.skill-check-card').forEach(c => c.classList.remove('highlighted'));
        copyToClipboard(check, 'skillChecks', cat);
      });

      const p = document.createElement('div');
      p.textContent = check;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.6';
      p.dataset.checkText = check; // Add data attribute for easier lookup
      
      const meta = document.createElement('div');
      meta.className = 'card__meta';
      meta.textContent = `Skill Check — ${cat}`;

      card.appendChild(copyBtn);
      card.appendChild(p);
      card.appendChild(meta);
      content.appendChild(card);
    }
    
    if (!filteredChecks.length) {
      const empty = document.createElement('div');
      empty.className = 'card';
      empty.textContent = 'No results. Try another category or search term.';
      content.appendChild(empty);
    }
  }

  // History tracking functions
  function loadHistory() {
    try {
      const raw = localStorage.getItem(historyKey);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(historyKey, JSON.stringify(trimmed));
      scheduleFileSave();
    } catch(e) {
      handleError('saveHistory', e, 'Failed to save history');
    }
  }

  function addToHistory(text, section, category) {
    const history = loadHistory();
    const entry = { text, section, category, timestamp: Date.now() };
    // Remove duplicates (same text)
    const filtered = history.filter(h => h.text !== text);
    // Add to front
    filtered.unshift(entry);
    saveHistory(filtered);
  }

  // Generator Management functions
  let currentGeneratorType = 'battleCries';
  let currentEditingGeneratorIndex = null;
  let currentEditingGeneratorIsDefault = false;
  let currentEditingGeneratorItemId = null;

  function refreshGeneratorsList() {
    if (!generatorTypeSelect) {
      console.error('generatorTypeSelect not found!');
      return;
    }
    if (!generatorsList) {
      console.error('generatorsList not found!');
      return;
    }
    const type = generatorTypeSelect.value;
    currentGeneratorType = type;
    const defaults = {
      battleCries: battleCries,
      insults: insults,
      compliments: compliments,
      introductions: introductions
    };
    const userAdded = loadUserGenerators();
    const editedDefaults = loadEditedDefaults();
    const deletedDefaults = loadDeletedGeneratorDefaults();
    
    // Build list of all items with metadata
    const itemsWithMeta = [];
    
    // Add default items (with edits and deletions applied)
    (defaults[type] || []).forEach((item, index) => {
      const itemId = `${type}_${index}`;
      // Skip if deleted
      if ((deletedDefaults[type] || []).includes(itemId)) {
        return;
      }
      // Use edited version if exists, otherwise original
      const displayText = (editedDefaults[type] && editedDefaults[type][itemId]) 
        ? editedDefaults[type][itemId] 
        : item;
      itemsWithMeta.push({
        text: displayText,
        isDefault: true,
        index: index,
        itemId: itemId,
        originalText: item
      });
    });
    
    // Add user-added items
    (userAdded[type] || []).forEach((item, index) => {
      itemsWithMeta.push({
        text: item,
        isDefault: false,
        index: index
      });
    });

    clearElement(generatorsList);

    if (itemsWithMeta.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'text-align: center; padding: 20px; opacity: 0.7;';
      emptyMsg.textContent = 'No items yet. Add one to get started!';
      generatorsList.appendChild(emptyMsg);
      return;
    }

    const isDark = document.body.classList.contains('dark-mode');
    const typeNames = {
      battleCries: '⚔️ Battle Cries',
      insults: '🗡️ Insults',
      compliments: '💬 Compliments',
      introductions: '🎭 Chaucer Introductions'
    };

    itemsWithMeta.forEach((itemMeta) => {
      const generatorCard = document.createElement('div');
      generatorCard.style.display = 'flex';
      generatorCard.style.justifyContent = 'space-between';
      generatorCard.style.alignItems = 'center';
      generatorCard.style.padding = '12px';
      generatorCard.style.border = '1px solid var(--burnt)';
      generatorCard.style.borderRadius = '6px';
      generatorCard.style.background = isDark ? '#2d2d44' : 'white';
      generatorCard.style.gap = '8px';
      if (!itemMeta.isDefault) {
        generatorCard.style.borderLeft = '4px solid #2b6f3a';
      } else if (editedDefaults[type] && editedDefaults[type][itemMeta.itemId]) {
        generatorCard.style.borderLeft = '4px solid #4a90e2';
      }

      const generatorInfo = document.createElement('div');
      generatorInfo.style.flex = '1';
      generatorInfo.style.fontSize = '14px';
      generatorInfo.textContent = itemMeta.text;
      generatorInfo.title = itemMeta.text;
      if (itemMeta.isDefault && editedDefaults[type] && editedDefaults[type][itemMeta.itemId]) {
        generatorInfo.style.fontStyle = 'italic';
        generatorInfo.title = `Edited from: ${itemMeta.originalText}`;
      }

      const buttonsDiv = document.createElement('div');
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.gap = '4px';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.textContent = 'Edit';
      editBtn.style.fontSize = '12px';
      editBtn.addEventListener('click', () => {
        if (itemMeta.isDefault) {
          currentEditingGeneratorIndex = itemMeta.index;
          currentEditingGeneratorIsDefault = true;
          currentEditingGeneratorItemId = itemMeta.itemId;
        } else {
          currentEditingGeneratorIndex = itemMeta.index;
          currentEditingGeneratorIsDefault = false;
          currentEditingGeneratorItemId = null;
        }
        generatorEditText.value = itemMeta.text;
        generatorEditTitle.textContent = `Edit ${typeNames[type]} Item`;
        deleteGeneratorBtn.style.display = '';
        generatorEditModal.classList.add('show');
        generatorEditModal.setAttribute('aria-hidden', 'false');
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.fontSize = '12px';
      deleteBtn.style.background = '#c44';
      deleteBtn.style.color = 'white';
      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete this ${typeNames[type].toLowerCase()} item?`)) {
          if (itemMeta.isDefault) {
            // Delete default item
            const deleted = loadDeletedGeneratorDefaults();
            if (!deleted[type]) deleted[type] = [];
            if (!deleted[type].includes(itemMeta.itemId)) {
              deleted[type].push(itemMeta.itemId);
            }
            // Also remove any edits
            const edited = loadEditedDefaults();
            if (edited[type] && edited[type][itemMeta.itemId]) {
              delete edited[type][itemMeta.itemId];
              saveEditedDefaults(edited);
            }
            saveDeletedGeneratorDefaults(deleted);
            debugLog('Deleted default item (from manage modal):', itemMeta.itemId);
            debugLog('Deleted list for', type, ':', deleted[type]);
            showToast('Default item deleted');
          } else {
            // Delete user-added item
            const userGenerators = loadUserGenerators();
            userGenerators[type].splice(itemMeta.index, 1);
            saveUserGenerators(userGenerators);
            showToast('Item deleted');
          }
          refreshGeneratorsList();
        }
      });

      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(deleteBtn);
      generatorCard.appendChild(generatorInfo);
      generatorCard.appendChild(buttonsDiv);
      generatorsList.appendChild(generatorCard);
    });
  }

  function showGeneratorManageModal() {
    if (!generatorManageModal) {
      console.error('generatorManageModal not found!');
      showToast('Error: Generator management modal not found');
      return;
    }
    
    try {
      refreshGeneratorsList();
    } catch (error) {
      console.error('Error refreshing generators list:', error);
    }
    
    generatorManageModal.classList.add('show');
    generatorManageModal.setAttribute('aria-hidden', 'false');
  }

  function closeGeneratorManageModal() {
    if (!generatorManageModal) {
      console.error('generatorManageModal not found in closeGeneratorManageModal!');
      return;
    }
    generatorManageModal.classList.remove('show');
    generatorManageModal.setAttribute('aria-hidden', 'true');
  }

  function openGeneratorEditModal() {
    if (!generatorEditModal || !generatorEditText || !generatorEditTitle || !generatorTypeSelect || !deleteGeneratorBtn) {
      console.error('Missing required elements for openGeneratorEditModal:', {
        generatorEditModal: !!generatorEditModal,
        generatorEditText: !!generatorEditText,
        generatorEditTitle: !!generatorEditTitle,
        generatorTypeSelect: !!generatorTypeSelect,
        deleteGeneratorBtn: !!deleteGeneratorBtn
      });
      showToast('Error: Generator edit modal elements not found');
      return;
    }
    currentEditingGeneratorIndex = null;
    currentEditingGeneratorIsDefault = false;
    currentEditingGeneratorItemId = null;
    generatorEditText.value = '';
    const typeNames = {
      battleCries: '⚔️ Battle Cries',
      insults: '🗡️ Insults',
      compliments: '💬 Compliments',
      introductions: '🎭 Chaucer Introductions'
    };
    generatorEditTitle.textContent = `Add ${typeNames[generatorTypeSelect.value]} Item`;
    deleteGeneratorBtn.style.display = 'none';
    generatorEditModal.classList.add('show');
    generatorEditModal.setAttribute('aria-hidden', 'false');
  }

  function closeGeneratorEditModal() {
    if (!generatorEditModal) {
      console.error('generatorEditModal not found in closeGeneratorEditModal!');
      return;
    }
    generatorEditModal.classList.remove('show');
    generatorEditModal.setAttribute('aria-hidden', 'true');
    currentEditingGeneratorIndex = null;
    currentEditingGeneratorIsDefault = false;
    currentEditingGeneratorItemId = null;
  }

  function saveGeneratorItem() {
    const text = generatorEditText.value.trim();
    if (!text) {
      showToast('Please enter text');
      return;
    }

    const type = currentGeneratorType;

    if (currentEditingGeneratorIndex !== null) {
      if (currentEditingGeneratorIsDefault) {
        // Editing default item - save as edited default
        const editedDefaults = loadEditedDefaults();
        if (!editedDefaults[type]) editedDefaults[type] = {};
        editedDefaults[type][currentEditingGeneratorItemId] = text;
        saveEditedDefaults(editedDefaults);
        showToast('Default item updated');
      } else {
        // Editing user-added item
        const userGenerators = loadUserGenerators();
        userGenerators[type][currentEditingGeneratorIndex] = text;
        saveUserGenerators(userGenerators);
        showToast('Item updated');
      }
    } else {
      // Adding new item
      const userGenerators = loadUserGenerators();
      if (!userGenerators[type]) {
        userGenerators[type] = [];
      }
      userGenerators[type].push(text);
      saveUserGenerators(userGenerators);
      showToast('Item added');
    }

    refreshGeneratorsList();
    closeGeneratorEditModal();
  }

  function deleteGeneratorItem() {
    if (currentEditingGeneratorIndex === null) return;

    if (confirm('Are you sure you want to delete this item?')) {
      if (currentEditingGeneratorIsDefault) {
        // Delete default item
        const deleted = loadDeletedGeneratorDefaults();
        if (!deleted[currentGeneratorType]) deleted[currentGeneratorType] = [];
        if (!deleted[currentGeneratorType].includes(currentEditingGeneratorItemId)) {
          deleted[currentGeneratorType].push(currentEditingGeneratorItemId);
        }
        // Also remove any edits
        const edited = loadEditedDefaults();
        if (edited[currentGeneratorType] && edited[currentGeneratorType][currentEditingGeneratorItemId]) {
          delete edited[currentGeneratorType][currentEditingGeneratorItemId];
          saveEditedDefaults(edited);
        }
        saveDeletedGeneratorDefaults(deleted);
        debugLog('Deleted default item:', currentEditingGeneratorItemId);
        debugLog('Deleted list for', currentGeneratorType, ':', deleted[currentGeneratorType]);
        showToast('Default item deleted');
      } else {
        // Delete user-added item
        const userGenerators = loadUserGenerators();
        userGenerators[currentGeneratorType].splice(currentEditingGeneratorIndex, 1);
        saveUserGenerators(userGenerators);
        debugLog('Deleted user-added item at index:', currentEditingGeneratorIndex);
        showToast('Item deleted');
      }
      refreshGeneratorsList();
      closeGeneratorEditModal();
    }
  }

  // YouTube URL parsing function
  function parseYouTubeUrl(url) {
    if (!url) return null;
    
    // Trim whitespace
    url = url.trim();
    
    // Remove any URL fragments
    url = url.split('#')[0];
    
    // If it's already just a video ID (11 characters, alphanumeric + hyphen + underscore)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    // Try to extract video ID from various YouTube URL formats
    // Handle youtu.be URLs with query parameters (extract ID before ?)
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return youtuBeMatch[1];
    }
    
    // Handle youtube.com/watch URLs
    // Try to parse using URLSearchParams for reliable extraction
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return videoId;
        }
      }
    } catch (e) {
      // Fall back to regex if URL parsing fails
    }
    
    // Fallback: Use regex to match v=VIDEO_ID in the URL
    // This handles both ?v=VIDEO_ID and &v=VIDEO_ID cases
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // Handle youtube.com/embed URLs
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }
    
    // Generic pattern as fallback
    const genericMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (genericMatch && genericMatch[1]) {
      return genericMatch[1];
    }
    
    return null;
  }
  
  // Format time in seconds to mm:ss format
  function formatTime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Parse time input (accepts "30" or "0:30" format)
  function parseTime(input) {
    if (!input) return null;
    const trimmed = input.trim();
    
    // If it's just a number, treat as seconds
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    
    // Try to parse mm:ss format
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    
    return null;
  }
  
  // Auto-match songs to YouTube karaoke videos
  function generateKaraokeSearchUrl(song, artist) {
    // Clean song and artist names
    const cleanSong = song.replace(/[()'"]/g, '').trim();
    const cleanArtist = artist.replace(/[()'"]/g, '').trim();
    
    // Build search query: "Song Name Artist karaoke"
    const searchQuery = encodeURIComponent(`${cleanSong} ${cleanArtist} karaoke`);
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  }
  
  // Attempt to find likely karaoke video (heuristic-based)
  function findKaraokeVideo(song, artist) {
    // Skip "Forgotten Realms Lore" entries
    if (artist === 'Mockery' || song === 'Forgotten Realms Lore') {
      return null;
    }
    
    // Handle artist with "&" (e.g., "Queen & David Bowie")
    let searchArtist = artist;
    if (artist.includes('&')) {
      searchArtist = artist.split('&')[0].trim();
    }
    
    return generateKaraokeSearchUrl(song, searchArtist);
  }
  
  // Helper function to open YouTube video
  // RedirectTube extension will intercept YouTube links and redirect to FreeTube
  function openYouTubeVideo(watchUrl, title = 'Karaoke Track') {
    // Simply open the URL - RedirectTube should intercept window.open() calls
    window.open(watchUrl, '_blank');
    showToast(`Opening ${title}...`);
  }
  
  // Show YouTube player — prefers local karaoke via BlingusKaraoke
  function showYouTubePlayer(videoId, startTime = 0, title = 'Karaoke Track', localKaraoke = null) {
    if (!videoId) {
      showToast('Invalid YouTube video ID');
      return;
    }
    
    const cleanVideoId = videoId.split('?')[0].split('&')[0].trim();
    
    if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId)) {
      showToast('Invalid YouTube video ID format');
      return;
    }

    const item = {
      youtube: cleanVideoId,
      localKaraoke: localKaraoke || null,
      startTime: startTime || 0,
      s: title,
      a: editArtist?.value?.trim() || currentEditingItem?.a || '',
      t: editText?.value?.trim() || currentEditingItem?.t || '',
    };
    if (window.BlingusKaraoke) {
      window.BlingusKaraoke.playItem(item, title);
      return;
    }
    
    const startSeconds = Math.floor(startTime || 0);
    const watchParams = new URLSearchParams();
    watchParams.set('v', cleanVideoId);
    if (startSeconds > 0) {
      watchParams.set('t', startSeconds.toString());
    }
    watchParams.set('autoplay', '1');
    
    const watchUrl = `https://www.youtube.com/watch?${watchParams.toString()}`;
    openYouTubeVideo(watchUrl, title);
  }
  
  // Close YouTube/karaoke player modal
  function closeYouTubePlayer() {
    if (window.BlingusKaraoke) {
      window.BlingusKaraoke.closePlayer();
      return;
    }
    youtubePlayerModal.classList.remove('show');
    youtubePlayerModal.setAttribute('aria-hidden', 'true');
    // Stop video by clearing src
    if (youtubePlayerFrame) {
      youtubePlayerFrame.src = '';
    }
    // Hide fallback
    if (youtubeFallback) {
      youtubeFallback.style.display = 'none';
    }
  }

  function copyToClipboard(text, section = null, category = null) {
    navigator.clipboard.writeText(text).then(() => {
      if (section && category) {
        addToHistory(text, section, category);
      }
      showToast('Copied to clipboard');
    }).catch(() => {
      showToast('Copy failed');
    });
  }

  async function copyLine(item) {
    try {
      const section = sectionSelect.value;
      const category = categorySelect.value;
      const text = (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') ? item : `${item.t} (Song: ${item.s} — ${item.a})`;
      await navigator.clipboard.writeText(text);
      addToHistory(text, section, category);
      showToast('Copied to clipboard');
    } catch (e) {
      showToast('Copy failed');
    }
  }

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), TOAST_AUTO_HIDE_DURATION_MS);
  }

  // Modal functions
  function openEditModal(section, category, item, userIndex) {
    currentEditingSection = section;
    currentEditingCategory = category;
    currentEditingIndex = userIndex;
    
    // Store item metadata separately for actions/criticalHits/criticalFailures (since they're strings)
    if ((section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') && typeof item === 'string') {
      // Check if it's a default item
      const defaults = section === 'actions' ? (characterActions[category] || []) 
        : section === 'criticalHits' ? (criticalHits[category] || [])
        : section === 'criticalFailures' ? (criticalFailures[category] || [])
        : section === 'skillChecks' ? (skillChecks[category] || [])
        : [];
      const itemId = getItemId(section, item);
      const deletedIds = deletedDefaults[section]?.[category] || [];
      const isDefaultItem = defaults.includes(item);
      const isDeletedDefault = deletedIds.includes(itemId);
      const fullItems = getMergedData(section, category);
      const filteredDefaultCount = fullItems.length - ((userItems[section] && userItems[section][category]) ? userItems[section][category].length : 0);
      const fullIndex = fullItems.indexOf(item);
      const isUserAdded = fullIndex >= filteredDefaultCount;
      
      currentEditingItem = {
        _isDefaultItem: isDefaultItem && !isDeletedDefault,
        _isUserAdded: isUserAdded,
        _text: item
      };
    } else {
      currentEditingItem = item;
    }
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    const isEditing = (userIndex !== null && userIndex !== undefined && userIndex >= 0) || (userIndex === -1);
    
    modalTitle.textContent = isEditing ? 'Edit Item' : 'Add New Item';
    deleteEditBtn.style.display = isEditing ? 'block' : 'none';
    
    // Show/hide fields based on section type
    if (isActions) {
      const text = typeof item === 'string' ? item : (item?._text || item?._actionText || item?.t || '');
      editText.value = text;
      songLabel.style.display = 'none';
      artistLabel.style.display = 'none';
      // adultLabel.style.display = 'none'; // Removed: adult content UI removed
      youtubeFields.style.display = 'none';
    } else {
      // Song-based sections: spells, bardic, mockery
      editText.value = item?.t || '';
      editSong.value = item?.s || '';
      editArtist.value = item?.a || '';
      // editAdult.checked = item?.adult || false; // Removed: adult content UI removed
      
      // Show YouTube fields for song-based sections
      const youtubeUrl = item?.youtube || '';
      const startTime = item?.startTime;
      editYoutube.value = youtubeUrl;
      editStartTime.value = startTime ? (typeof startTime === 'number' ? formatTime(startTime) : startTime.toString()) : '';

      if (window.BlingusKaraoke) {
        window.BlingusKaraoke.setPendingFromItem(item);
      }

      if (localKaraokeStatus) {
        if (item?.localKaraoke) {
          localKaraokeStatus.style.display = 'block';
          localKaraokeStatus.textContent = '✅ Local karaoke saved on server (' + item.localKaraoke + ')';
        } else {
          localKaraokeStatus.style.display = 'none';
        }
      }
      
      // Karaoke search when song + artist are set
      if (youtubeSuggestion && youtubeSuggestionText) {
        const song = item?.s || item?.song || editSong.value.trim() || '';
        const artist = item?.a || item?.artist || editArtist.value.trim() || '';
        if (song && artist && artist !== 'Mockery' && song !== 'Forgotten Realms Lore') {
          youtubeSuggestionText.textContent = item?.localKaraoke
            ? `Re-download or change karaoke for "${song}" by ${artist}`
            : `Find and download karaoke for "${song}" by ${artist}`;
          youtubeSuggestion.style.display = 'block';
        } else {
          youtubeSuggestion.style.display = 'none';
        }
      }
      
      songLabel.style.display = 'block';
      artistLabel.style.display = 'block';
      // adultLabel.style.display = section === 'spells' ? 'block' : 'none'; // Removed: adult content UI removed
      youtubeFields.style.display = 'block';
    }
    
    editModal.classList.add('show');
    editModal.setAttribute('aria-hidden', 'false');
    editText.focus();
  }
  
  function closeEditModal() {
    editModal.classList.remove('show');
    editModal.setAttribute('aria-hidden', 'true');
    currentEditingItem = null;
    currentEditingIndex = null;
    currentEditingSection = null;
    currentEditingCategory = null;
    editText.value = '';
    editSong.value = '';
    editArtist.value = '';
    // editAdult.checked = false; // Removed: adult content UI removed
    editYoutube.value = '';
    editStartTime.value = '';
    
    if (window.BlingusKaraoke) {
      window.BlingusKaraoke.clearPending();
    }
    if (localKaraokeStatus) {
      localKaraokeStatus.style.display = 'none';
    }
    
    // Hide YouTube suggestion
    if (youtubeSuggestion) {
      youtubeSuggestion.style.display = 'none';
    }
  }
  
  function saveEditItem() {
    console.log('=== saveEditItem FUNCTION CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Section:', currentEditingSection, 'Category:', currentEditingCategory);
    console.log('Index:', currentEditingIndex, 'Item:', currentEditingItem);
    console.log('editText exists:', !!editText, 'value:', editText?.value);
    console.log('editSong exists:', !!editSong, 'value:', editSong?.value);
    console.log('editArtist exists:', !!editArtist, 'value:', editArtist?.value);
    
    // Show immediate feedback
    showToast('Saving...');
    
    const section = currentEditingSection;
    const category = currentEditingCategory;
    
    if (!section || !category) {
      console.error('✗ ERROR: Missing section or category', { section, category });
      showToast('Error: Missing section or category');
      return;
    }
    
    console.log('✓ Section and category validated:', section, category);
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    const isUserAdded = currentEditingItem?._isUserAdded;
    
    if (isActions) {
      const text = editText.value.trim();
      if (!text) {
        const sectionName = section === 'actions' ? 'action' : (section === 'criticalHits' ? 'critical hit' : (section === 'criticalFailures' ? 'critical failure' : 'skill check'));
        showToast(`Please enter ${sectionName} text`);
        return;
      }
      
      if (!userItems[section]) {
        userItems[section] = {};
      }
      if (!userItems[section][category]) {
        userItems[section][category] = [];
      }
      
      if (currentEditingIndex !== null && currentEditingIndex !== undefined && currentEditingIndex >= 0) {
        // Editing existing user item
        userItems[section][category][currentEditingIndex] = text;
        const sectionName = section === 'actions' ? 'Action' : (section === 'criticalHits' ? 'Critical hit' : (section === 'criticalFailures' ? 'Critical failure' : 'Skill check'));
        showToast(`${sectionName} updated`);
      } else if (currentEditingIndex === -1 && isDefaultItem) {
        // Editing a default item - hide original and add edited version
        const originalItem = (currentEditingItem._text || currentEditingItem._actionText || currentEditingItem);
        const originalId = getItemId(section, originalItem);
        if (!deletedDefaults[section]) {
          deletedDefaults[section] = {};
        }
        if (!deletedDefaults[section][category]) {
          deletedDefaults[section][category] = [];
        }
        if (!deletedDefaults[section][category].includes(originalId)) {
          deletedDefaults[section][category].push(originalId);
        }
        userItems[section][category].push(text);
        saveDeletedDefaults(deletedDefaults);
        const sectionName = section === 'actions' ? 'action' : (section === 'criticalHits' ? 'critical hit' : (section === 'criticalFailures' ? 'critical failure' : 'skill check'));
        showToast(`Default ${sectionName} edited (original hidden)`);
      } else {
        // Adding new
        userItems[section][category].push(text);
        const sectionName = section === 'actions' ? 'Action' : (section === 'criticalHits' ? 'Critical hit' : (section === 'criticalFailures' ? 'Critical failure' : 'Skill check'));
        showToast(`${sectionName} added`);
      }
    } else {
      const text = editText.value.trim();
      const song = editSong.value.trim();
      const artist = editArtist.value.trim();
      
      if (!text || !song || !artist) {
        showToast('Please fill in all fields');
        return;
      }
      
      // Parse YouTube URL and start time
      // Safely access YouTube input elements (they may be null if not found)
      // Don't block save if elements don't exist - just skip YouTube fields
      const youtubeInput = editYoutube ? (editYoutube.value || '').trim() : '';
      const startTimeInput = editStartTime ? (editStartTime.value || '').trim() : '';
      
      console.log('YouTube inputs:', { youtubeInput, startTimeInput, editYoutube: !!editYoutube, editStartTime: !!editStartTime });
      
      let youtube = null;
      let startTime = null;
      
      if (youtubeInput) {
        const videoId = parseYouTubeUrl(youtubeInput);
        console.log('Parsed YouTube URL:', youtubeInput, '-> Video ID:', videoId);
        if (videoId) {
          youtube = videoId;
        } else {
          // Only show error if it looks like a URL attempt (contains youtube.com or youtu.be)
          // Otherwise, just ignore invalid input (user might be typing)
          if (youtubeInput.includes('youtube.com') || youtubeInput.includes('youtu.be')) {
            console.warn('Invalid YouTube URL format:', youtubeInput);
            showToast('Invalid YouTube URL format. Leave blank or use a valid video URL.');
            return;
          }
          // If it's a partial video ID (like "g1lmQ&list=..."), try to extract just the ID part
          // Check if it looks like it might be part of a video ID (alphanumeric, 11 chars or less)
          const partialMatch = youtubeInput.match(/([a-zA-Z0-9_-]{11})/);
          if (partialMatch && partialMatch[1]) {
            console.log('Found potential video ID in partial input:', partialMatch[1]);
            youtube = partialMatch[1];
          } else {
            // If it doesn't look like a URL or partial ID, just ignore it (don't block save)
            console.log('Ignoring non-URL input in YouTube field:', youtubeInput);
          }
        }
      }
      
      if (startTimeInput) {
        const parsedTime = parseTime(startTimeInput);
        console.log('Parsed start time input:', startTimeInput, '-> Parsed:', parsedTime);
        if (parsedTime !== null) {
          startTime = parsedTime;
          console.log('Parsed start time:', startTime);
        } else {
          // Only block save if it clearly looks like a time format attempt (contains digits and colons)
          // Allow random text to be ignored
          if (/^\d+[:]\d+/.test(startTimeInput) || /^\d+$/.test(startTimeInput)) {
            console.warn('Invalid start time format:', startTimeInput);
            showToast('Invalid start time format (use seconds like "30" or time like "0:30")');
            return;
          }
          // If it doesn't look like a time format, just ignore it and continue
          console.log('Ignoring non-time input in startTime field:', startTimeInput);
        }
      }
      
      console.log('Creating newItem with:', { text, song, artist, youtube, startTime });
      
      const newItem = {
        t: text,
        s: song,
        a: artist
      };
      
      // Add YouTube properties if provided
      if (youtube) {
        newItem.youtube = youtube;
        console.log('Added youtube property:', youtube);
      }
      if (startTime !== null && startTime !== undefined) {
        newItem.startTime = startTime;
        console.log('Added startTime property:', startTime);
      }

      const pending = window.BlingusKaraoke?.getPending?.();
      if (pending?.localKaraoke) {
        newItem.localKaraoke = pending.localKaraoke;
        if (!newItem.youtube) newItem.youtube = pending.youtube || pending.localKaraoke;
      } else if (currentEditingItem?.localKaraoke) {
        newItem.localKaraoke = currentEditingItem.localKaraoke;
      }
      
      console.log('Final newItem:', newItem);
      console.log('About to process save logic for section:', section, 'category:', category);

      // Removed: adult spell branching logic - all user items saved to regular section
      // const wasAdultSpell = section === 'spells' && currentEditingItem?.adult;
      // const isAdultSpell = section === 'spells' && editAdult && editAdult.checked;
      
      if (currentEditingIndex !== null && currentEditingIndex !== undefined && currentEditingIndex >= 0) {
        // Editing existing user item - simplified without adult/regular branching
        if (!userItems[section]) {
          userItems[section] = {};
        }
        if (!userItems[section][category]) {
          userItems[section][category] = [];
        }
        userItems[section][category][currentEditingIndex] = newItem;
        showToast('Item updated');
      } else if (currentEditingIndex === -1 && isDefaultItem) {
        // Editing a default item - hide original and add edited version (simplified)
        const originalItem = currentEditingItem;
        const originalId = getItemId(section, originalItem);

        if (!deletedDefaults[section]) {
          deletedDefaults[section] = {};
        }
        if (!deletedDefaults[section][category]) {
          deletedDefaults[section][category] = [];
        }
        if (!deletedDefaults[section][category].includes(originalId)) {
          deletedDefaults[section][category].push(originalId);
        }

        // Add edited version to user items
        if (!userItems[section]) {
          userItems[section] = {};
        }
        if (!userItems[section][category]) {
          userItems[section][category] = [];
        }
        userItems[section][category].push(newItem);
        showToast('Default item edited (original hidden)');
        saveDeletedDefaults(deletedDefaults);
      } else {
        // Adding new item (simplified)
        if (!userItems[section]) {
          userItems[section] = {};
        }
        if (!userItems[section][category]) {
          userItems[section][category] = [];
        }
        userItems[section][category].push(newItem);
        showToast('Item added');
      }
    }
    
    console.log('=== SAVE COMPLETE - About to persist ===');
    console.log('About to save userItems:', userItems);
    console.log('UserItems keys:', Object.keys(userItems));
    
    try {
      saveUserItems(userItems);
      console.log('✓ Successfully saved user items to localStorage');
      debugLog('Saved user items:', userItems);
      
      // Small delay to ensure save completes before closing modal
      setTimeout(() => {
        console.log('Closing modal and rendering...');
        closeEditModal();
        render();
        console.log('✓ Modal closed and render completed');
      }, 100);
    } catch (error) {
      console.error('✗ ERROR in saveEditItem:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      showToast('Error saving item: ' + error.message);
    }
  }
  
  function deleteEditItem() {
    const section = currentEditingSection;
    const category = currentEditingCategory;
    const isDefaultItem = currentEditingItem?._isDefaultItem;
    
    if (currentEditingIndex === -1 && isDefaultItem) {
      // Deleting a default item - add to deletedDefaults
      const itemId = getItemId(section, currentEditingItem._text || currentEditingItem._actionText || currentEditingItem);
      const deleteSection = (section === 'spells' && currentEditingItem?.adult) ? 'adultSpells' : section;
      
      if (!deletedDefaults[deleteSection]) {
        deletedDefaults[deleteSection] = {};
      }
      if (!deletedDefaults[deleteSection][category]) {
        deletedDefaults[deleteSection][category] = [];
      }
      if (!deletedDefaults[deleteSection][category].includes(itemId)) {
        deletedDefaults[deleteSection][category].push(itemId);
      }
      saveDeletedDefaults(deletedDefaults);
      showToast('Default item deleted');
      render();
      return;
    }
    
    if (currentEditingIndex === null || currentEditingIndex === undefined || currentEditingIndex < 0) {
      showToast('Cannot delete: Invalid item');
      return;
    }
    
    const isActions = section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks';
    
    if (isActions) {
      if (userItems[section] && userItems[section][category]) {
        userItems[section][category].splice(currentEditingIndex, 1);
        if (userItems[section][category].length === 0) {
          delete userItems[section][category];
        }
      }
    } else {
      if (section === 'spells' && currentEditingItem?.adult) {
        if (userItems.adultSpells[category]) {
          userItems.adultSpells[category].splice(currentEditingIndex, 1);
          if (userItems.adultSpells[category].length === 0) {
            delete userItems.adultSpells[category];
          }
        }
      } else {
        if (userItems[section][category]) {
          userItems[section][category].splice(currentEditingIndex, 1);
          if (userItems[section][category].length === 0) {
            delete userItems[section][category];
          }
        }
      }
    }
    
    saveUserItems(userItems);
    debugLog('Saved user items after delete:', userItems);
    closeEditModal();
    showToast('Item deleted');
    render();
  }

  sectionSelect.addEventListener('change', () => { 
    buildCategories(); 
    const section = sectionSelect.value;
    // Hide favorites toggle on workflow sections (no star UI on string cards)
    if (window.ActionWorkflow?.isWorkflowSection(section)) {
      favoritesOnly.parentElement.style.display = 'none';
    } else {
      favoritesOnly.parentElement.style.display = '';
    }
    // Ensure a category is selected after building categories
    setTimeout(() => {
      if (window.ActionWorkflow?.isWorkflowSection(section)) {
        window.ActionWorkflow.applyTabPreset(section);
      } else if (categorySelect.options.length > 0 && !categorySelect.value) {
        categorySelect.selectedIndex = 0;
      }
      render();
    }, RENDER_DELAY_MS);
  });
  categorySelect.addEventListener('change', render);
  if (favoritesOnly) favoritesOnly.addEventListener('change', render);
  
  // Dark mode toggle
  const darkModeToggle = $('#darkModeToggle');
  function applyDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem(darkModeKey, enabled ? 'true' : 'false');
  }
  
  // Load dark mode preference
  const savedDarkMode = localStorage.getItem(darkModeKey) === 'true';
  if (savedDarkMode) {
    darkModeToggle.checked = true;
    applyDarkMode(true);
  }
  
  darkModeToggle.addEventListener('change', (e) => {
    applyDarkMode(e.target.checked);
    localStorage.setItem(darkModeKey, e.target.checked ? 'true' : 'false');
    scheduleFileSave();
    // Re-render to update card backgrounds that use inline styles
    render();
  });
  searchInput.addEventListener('input', render);
  clearBtn.addEventListener('click', () => { searchInput.value = ''; render(); });
  
  // Clear cache button - only show on web server
  const clearCacheBtn = $('#clearCacheBtn');
  if (clearCacheBtn && isOnServer) {
    clearCacheBtn.classList.remove('btn--cache');
    clearCacheBtn.addEventListener('click', () => {
      // Force a hard reload with cache-busting
      const url = new URL(window.location.href);
      url.searchParams.set('nocache', Date.now());
      // Also try to clear service worker cache if present
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        }).catch(() => {});
      }
      // Force reload
      window.location.href = url.toString();
    });
  }

  // Modal event listeners
  addEditBtn.addEventListener('click', () => {
    const section = sectionSelect.value;
    const category = categorySelect.value;
    if (section === 'actions' || section === 'criticalHits' || section === 'criticalFailures' || section === 'skillChecks') {
      openEditModal(section, category, null, null);
    } else {
      openEditModal(section, category, { t: '', s: '', a: '' }, null);
    }
  });
  
  // Multiple ways to attach save button listener to ensure it works
  const saveBtnElement = document.getElementById('saveEditBtn');
  
  if (saveBtnElement) {
    console.log('Save button found, attaching listener');
    saveBtnElement.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('=== SAVE BUTTON CLICKED ===');
      console.log('Event:', e);
      console.log('Calling saveEditItem...');
      try {
        saveEditItem();
      } catch (err) {
        console.error('ERROR calling saveEditItem:', err);
        showToast('Error: ' + err.message);
      }
      return false;
    });
  } else {
    console.error('✗ saveEditBtn not found by getElementById!');
  }
  
  // Also use the $ selector version
  if (saveEditBtn) {
    console.log('saveEditBtn also found via $ selector');
    // Don't attach twice if it's the same element
    if (saveEditBtn !== saveBtnElement) {
      saveEditBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save button clicked (via $ selector)');
        saveEditItem();
        return false;
      });
    }
  } else {
    console.error('✗ saveEditBtn not found via $ selector either!');
  }
  
  // Use event delegation as ultimate fallback
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'saveEditBtn' || e.target.closest('#saveEditBtn'))) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Save button clicked (via document delegation)');
      saveEditItem();
      return false;
    }
  });
  
  // YouTube player modal event listeners
  if (youtubePlayerClose) {
    youtubePlayerClose.addEventListener('click', closeYouTubePlayer);
  }
  if (youtubePlayerCloseBtn) {
    youtubePlayerCloseBtn.addEventListener('click', closeYouTubePlayer);
  }
  if (youtubePlayerModal) {
    youtubePlayerModal.addEventListener('click', (e) => {
      if (e.target === youtubePlayerModal) {
        closeYouTubePlayer();
      }
    });
  }
  
  // Test YouTube playback button
  if (testYoutubeBtn) {
    testYoutubeBtn.addEventListener('click', () => {
      const youtubeInput = editYoutube.value.trim();
      const startTimeInput = editStartTime.value.trim();
      
      if (!youtubeInput) {
        showToast('Please enter a YouTube URL or video ID, or search for karaoke');
        return;
      }
      
      const videoId = parseYouTubeUrl(youtubeInput);
      if (!videoId) {
        showToast('Invalid YouTube URL format');
        return;
      }
      
      const startTime = startTimeInput ? parseTime(startTimeInput) : 0;
      const title = editSong.value.trim() || 'Karaoke Track';
      const pending = window.BlingusKaraoke?.getPending?.();
      const localId = pending?.localKaraoke || currentEditingItem?.localKaraoke || null;
      showYouTubePlayer(videoId, startTime || 0, title, localId);
    });
  }
  
  // Karaoke search — in-app search and download
  if (youtubeSearchBtn) {
    youtubeSearchBtn.addEventListener('click', () => {
      const song = editSong.value.trim();
      const artist = editArtist.value.trim();
      if (!song || !artist) {
        showToast('Enter song and artist first');
        return;
      }
      if (!window.BlingusKaraoke) {
        const searchUrl = findKaraokeVideo(song, artist);
        if (searchUrl) window.open(searchUrl, '_blank');
        return;
      }
      window.BlingusKaraoke.openSearch(song, artist, (pending, row) => {
        editYoutube.value = pending.youtube || pending.localKaraoke;
        if (localKaraokeStatus) {
          localKaraokeStatus.style.display = 'block';
          localKaraokeStatus.textContent = '✅ Downloaded: ' + (row.title || pending.localKaraoke);
        }
        showToast('Karaoke ready — save item to keep link');
      });
    });
  }
  
  cancelEditBtn.addEventListener('click', closeEditModal);
  deleteEditBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteEditItem();
    }
  });
  modalClose.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    // Only close if clicking directly on the modal background (not on content or buttons)
    // Don't interfere with clicks on buttons or inputs inside the modal
    if (e.target === editModal && !e.target.closest('.modal__content')) {
      console.log('Clicked on modal background, closing modal');
      closeEditModal();
    }
  });
  
  // Generator modal functions
  function showGeneratorModal(title, text, generatorType = null) {
    generatorTitle.textContent = title;
    generatorText.textContent = text;
    generatorModal.classList.add('show');
    generatorModal.setAttribute('aria-hidden', 'false');

    // Store text and generator type for copy button
    generatorCopyBtn.dataset.textToCopy = text;
    generatorCopyBtn.dataset.generatorType = generatorType || '';
  }

  function closeGeneratorModal() {
    generatorModal.classList.remove('show');
    generatorModal.setAttribute('aria-hidden', 'true');
  }

  // Attach event listeners to existing generator buttons in HTML
  const battleCryBtn = document.getElementById('battleCryBtn');
  if (battleCryBtn) {
    battleCryBtn.addEventListener('click', () => {
      const mergedCries = getMergedGenerators('battleCries');
      if (mergedCries.length === 0) {
        showToast('No battle cries available');
        return;
      }
      const cry = mergedCries[Math.floor(Math.random() * mergedCries.length)];
      showGeneratorModal('⚔️ Battle Cry', cry, 'battleCries');
    });
  }

  const insultBtn = document.getElementById('insultBtn');
  if (insultBtn) {
    insultBtn.addEventListener('click', () => {
      const mergedInsults = getMergedGenerators('insults');
      if (mergedInsults.length === 0) {
        showToast('No insults available');
        return;
      }
      const insult = mergedInsults[Math.floor(Math.random() * mergedInsults.length)];
      showGeneratorModal('🗡️ Insult', insult, 'insults');
    });
  }

  const complimentBtn = document.getElementById('complimentBtn');
  if (complimentBtn) {
    complimentBtn.addEventListener('click', () => {
      const mergedCompliments = getMergedGenerators('compliments');
      if (mergedCompliments.length === 0) {
        showToast('No compliments available');
        return;
      }
      const compliment = mergedCompliments[Math.floor(Math.random() * mergedCompliments.length)];
      showGeneratorModal('💬 Compliment', compliment, 'compliments');
    });
  }

  const introductionBtn = document.getElementById('introductionBtn');
  if (introductionBtn) {
    introductionBtn.addEventListener('click', () => {
      const mergedIntroductions = getMergedGenerators('introductions');
      if (mergedIntroductions.length === 0) {
        showToast('No introductions available');
        return;
      }
      const introduction = mergedIntroductions[Math.floor(Math.random() * mergedIntroductions.length)];
      showGeneratorModal('🎭 Chaucer Introduction', introduction, 'introductions');
    });
  }

  // Generator modal event listeners
  generatorCopyBtn.addEventListener('click', () => {
    const text = generatorCopyBtn.dataset.textToCopy;
    const generatorType = generatorCopyBtn.dataset.generatorType;
    if (text) {
      // Track generators in history with section='generators' and category=generatorType
      if (generatorType) {
        copyToClipboard(text, 'generators', generatorType);
      } else {
        copyToClipboard(text);
      }
      showToast('Copied to clipboard!');
    }
  });

  generatorCloseBtn.addEventListener('click', closeGeneratorModal);
  generatorModalClose.addEventListener('click', closeGeneratorModal);
  generatorModal.addEventListener('click', (e) => {
    if (e.target === generatorModal) {
      closeGeneratorModal();
    }
  });

  // Export/Import functionality - attach to existing buttons in HTML
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      // Export COMPLETE dataset including all defaults and user customizations
      // Use getAllUserData() to ensure consistency and include all fields (including YouTube settings)
      const data = getAllUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blingus-bardbook-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported!');
    });
  }

  const importBtn = document.getElementById('importBtn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (confirm('This will overwrite your current data. Continue?')) {
            // Import all data types (backward compatible - only import if present)
            let importedCount = 0;
            const importedCategories = [];
            
            // Note: Default items (spells, bardic, etc.) are in the code and don't need importing
            // But we check for them in case someone wants to verify the export is complete
            
            if (data.favorites !== undefined) {
              localStorage.setItem(favoritesKey, JSON.stringify(data.favorites));
              importedCount++;
              importedCategories.push('favorites');
            }
            if (data.userItems !== undefined) {
              localStorage.setItem(userItemsKey, JSON.stringify(data.userItems));
              importedCount++;
              importedCategories.push('user items');
              debugLog('Imported userItems:', data.userItems);
              // Log YouTube settings specifically for debugging
              const youtubeItems = [];
              Object.keys(data.userItems).forEach(section => {
                if (data.userItems[section]) {
                  Object.keys(data.userItems[section]).forEach(category => {
                    if (Array.isArray(data.userItems[section][category])) {
                      data.userItems[section][category].forEach(item => {
                        if (item.youtube || item.localKaraoke || item.startTime !== undefined) {
                          youtubeItems.push({ section, category, item });
                        }
                      });
                    }
                  });
                }
              });
              if (youtubeItems.length > 0) {
                console.log('Found YouTube settings in import:', youtubeItems.length, 'items with YouTube data');
                debugLog('YouTube items:', youtubeItems);
                importedCategories.push(`${youtubeItems.length} items with karaoke settings (YouTube/local)`);
              } else {
                console.log('No YouTube settings found in imported userItems');
              }
            }
            if (data.deletedDefaults !== undefined) {
              localStorage.setItem(deletedDefaultsKey, JSON.stringify(data.deletedDefaults));
              importedCount++;
              importedCategories.push('deleted defaults');
            }
            if (data.history !== undefined) {
              localStorage.setItem(historyKey, JSON.stringify(data.history));
              importedCount++;
              importedCategories.push('history');
            }
            if (data.generators !== undefined) {
              // Ensure generators structure is correct - normalize the data
              let generators = data.generators;
              
              // Handle different possible structures
              if (typeof generators === 'object' && generators !== null) {
                // If it's already the correct structure
                generators = {
                  battleCries: Array.isArray(generators.battleCries) ? generators.battleCries : [],
                  insults: Array.isArray(generators.insults) ? generators.insults : [],
                  compliments: Array.isArray(generators.compliments) ? generators.compliments : []
                };
              } else {
                // Fallback to empty structure
                generators = { battleCries: [], insults: [], compliments: [] };
              }
              
              localStorage.setItem(generatorsKey, JSON.stringify(generators));
              importedCount++;
              importedCategories.push('generators');
              debugLog('Imported generators:', generators);
            }
            if (data.editedGeneratorDefaults !== undefined) {
              localStorage.setItem(editedDefaultsKey, JSON.stringify(data.editedGeneratorDefaults));
              importedCount++;
              importedCategories.push('edited generator defaults');
            }
            if (data.deletedGeneratorDefaults !== undefined) {
              localStorage.setItem(deletedGeneratorDefaultsKey, JSON.stringify(data.deletedGeneratorDefaults));
              importedCount++;
              importedCategories.push('deleted generator defaults');
            }
            if (data.darkMode !== undefined) {
              localStorage.setItem(darkModeKey, data.darkMode ? 'true' : 'false');
              importedCount++;
              importedCategories.push('dark mode');
            }
            
            const message = importedCount > 0 
              ? `Imported ${importedCount} categories: ${importedCategories.join(', ')}. Reloading...`
              : 'No data found to import.';
            showToast(message);
            if (importedCount > 0) {
              setTimeout(() => location.reload(), AUTO_SAVE_DEBOUNCE_MS);
            }
          }
        } catch (error) {
          showToast('Import failed: Invalid file');
        }
      };
      reader.readAsText(file);
    });
    input.click();
    });
  }

  // History modal functions
  function showHistoryModal() {
    const history = loadHistory();
    clearElement(historyList);
    
    if (history.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'text-align: center; padding: 20px; opacity: 0.7;';
      emptyMsg.textContent = 'No recently used items yet. Copy some items to see them here!';
      historyList.appendChild(emptyMsg);
    } else {
      const isDark = document.body.classList.contains('dark-mode');
      history.forEach(entry => {
        const historyItem = document.createElement('button');
        historyItem.style.textAlign = 'left';
        historyItem.style.padding = '12px';
        historyItem.style.border = '1px solid var(--burnt)';
        historyItem.style.borderRadius = '6px';
        historyItem.style.cursor = 'pointer';
        historyItem.style.background = isDark ? '#3d3d5e' : 'white';
        historyItem.style.color = 'var(--ink)';
        historyItem.style.fontSize = '14px';
        historyItem.style.width = '100%';
        historyItem.style.transition = 'background 0.2s ease';
        historyItem.textContent = entry.text;
        historyItem.title = `Section: ${entry.section || 'N/A'}, Category: ${entry.category || 'N/A'}`;
        historyItem.addEventListener('click', () => {
          copyToClipboard(entry.text, entry.section, entry.category);
          showToast('Copied to clipboard!');
        });
        historyItem.addEventListener('mouseenter', () => {
          historyItem.style.background = isDark ? '#4d4d6e' : '#f0f0f0';
        });
        historyItem.addEventListener('mouseleave', () => {
          historyItem.style.background = isDark ? '#3d3d5e' : 'white';
        });
        historyList.appendChild(historyItem);
      });
    }
    
    historyModal.classList.add('show');
    historyModal.setAttribute('aria-hidden', 'false');
  }

  function closeHistoryModal() {
    historyModal.classList.remove('show');
    historyModal.setAttribute('aria-hidden', 'true');
  }

  // Attach listener to existing history button in HTML
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) {
    historyBtn.addEventListener('click', showHistoryModal);
  }

  // File storage button - attach to existing button in HTML
  const fileStorageBtn = document.getElementById('fileStorageBtn');
  
  // Function to setup file storage button UI (called after PHP check)
  function setupFileStorageButton() {
    if (!fileStorageBtn) return; // Safety check
    
    if (phpApiAvailable || isOnServer) {
      // On server: show server storage status with PHP indicator
      fileStorageBtn.textContent = '💾 PHP Server Storage';
      fileStorageBtn.className = 'btn btn--server';
      fileStorageBtn.title = 'Data is automatically saved to server using PHP API';
      fileStorageBtn.disabled = false;
      fileStorageBtn.addEventListener('click', async () => {
        try {
          await saveDataToServer();
          showToast('✓ Data saved to server');
        } catch (error) {
          const errorMsg = error.message || 'Unknown error';
          console.error('Save failed:', errorMsg);
          showToast(`✗ Failed to save: ${errorMsg}`);
        }
      });
      
      // Add server storage status indicator to footer
      const footer = $('.footer');
      if (footer) {
        const storageStatus = document.createElement('div');
        storageStatus.id = 'storageStatus';
        storageStatus.style.cssText = 'margin-top: 8px; font-size: 12px; color: var(--burnt); opacity: 0.8; display: flex; align-items: center; justify-content: center; gap: 6px; text-align: center;';
        const icon = document.createElement('span');
        icon.style.color = '#667eea';
        icon.textContent = '🔷';
        const strong = document.createElement('strong');
        strong.textContent = 'Server Storage Active:';
        const text = createTextNode(' Data saved to server via PHP API');
        storageStatus.appendChild(icon);
        storageStatus.appendChild(document.createTextNode(' '));
        storageStatus.appendChild(strong);
        storageStatus.appendChild(text);
        footer.appendChild(storageStatus);
      }
    } else {
      // Local: use File System Access API
      fileStorageBtn.textContent = fileSystemSupported ? '📁 Select Data Folder' : '📁 File Storage (N/A)';
      fileStorageBtn.title = fileSystemSupported 
        ? 'Select a folder to store data files (will create a "data" subdirectory)' 
        : 'File System Access API not supported. Requires Chrome/Edge/Brave (Chromium) and HTTPS or localhost. Firefox/Safari not supported.';
      fileStorageBtn.disabled = !fileSystemSupported;
      if (!fileSystemSupported) {
        fileStorageBtn.addEventListener('click', () => {
          const browserInfo = navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                             navigator.userAgent.includes('Brave') ? 'Brave' :
                             navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Unknown';
          const protocol = window.location.protocol;
          
          let message = 'File System Access API not available. ';
          if (browserInfo === 'Firefox') {
            message += 'Firefox does not support this feature. Please use Chrome, Edge, or Brave.';
          } else if (protocol === 'http:' && !isLocalhost) {
            message += 'Requires HTTPS (or localhost). Your site is using HTTP.';
          } else {
            message += `Requires Chrome/Edge/Brave browser and HTTPS (or localhost). Detected: ${browserInfo}, Protocol: ${protocol}`;
          }
          showToast(message);
        });
      } else {
        fileStorageBtn.addEventListener('click', async () => {
          const success = await promptForDataDirectory();
          if (success) {
            // Save current data to file
            await saveDataToFile();
            showToast('✓ Data directory set and data saved');
          }
        });
      }
    }
  }

  // Set up button initially with default state (will be updated after PHP check)
  // Don't call setupFileStorageButton() here - wait for PHP check in initFileStorage()
  if (fileStorageBtn) {
    fileStorageBtn.textContent = fileSystemSupported ? '📁 Select Data Folder' : '📁 File Storage (N/A)';
    fileStorageBtn.disabled = !fileSystemSupported;
  }

  // Note: All buttons are now in HTML, no need to create or append them

  // History modal event listeners
  historyCloseBtn.addEventListener('click', closeHistoryModal);
  historyModalClose.addEventListener('click', closeHistoryModal);
  historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      closeHistoryModal();
    }
  });

  // Generator Management event listeners
  if (manageGeneratorsBtn) {
    manageGeneratorsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        showGeneratorManageModal();
      } catch (error) {
        console.error('Error in showGeneratorManageModal:', error);
      }
    });
  } else {
    const btn = document.getElementById('manageGeneratorsBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          showGeneratorManageModal();
        } catch (error) {
          console.error('Error in showGeneratorManageModal:', error);
        }
      });
    }
  }
  if (generatorManageCloseBtn) {
    generatorManageCloseBtn.addEventListener('click', closeGeneratorManageModal);
  }
  if (generatorManageClose) {
    generatorManageClose.addEventListener('click', closeGeneratorManageModal);
  }
  if (generatorManageModal) {
    generatorManageModal.addEventListener('click', (e) => {
      if (e.target === generatorManageModal) {
        closeGeneratorManageModal();
      }
    });
  }
  if (generatorTypeSelect) {
    generatorTypeSelect.addEventListener('change', refreshGeneratorsList);
  }
  if (addGeneratorBtn) {
    addGeneratorBtn.addEventListener('click', openGeneratorEditModal);
  }
  if (saveGeneratorBtn) {
    saveGeneratorBtn.addEventListener('click', saveGeneratorItem);
  }
  if (cancelGeneratorBtn) {
    cancelGeneratorBtn.addEventListener('click', closeGeneratorEditModal);
  }
  if (deleteGeneratorBtn) {
    deleteGeneratorBtn.addEventListener('click', deleteGeneratorItem);
  }
  if (generatorEditClose) {
    generatorEditClose.addEventListener('click', closeGeneratorEditModal);
  }
  if (generatorEditModal) {
    generatorEditModal.addEventListener('click', (e) => {
      if (e.target === generatorEditModal) {
        closeGeneratorEditModal();
      }
    });
  }

  // Keyboard navigation
  let selectedCardIndex = -1;
  document.addEventListener('keydown', (e) => {
    // Handle Escape key for modals
    if (e.key === 'Escape') {
      if (editModal.classList.contains('show')) {
        closeEditModal();
        return;
      }
      if (generatorModal.classList.contains('show')) {
        closeGeneratorModal();
        return;
      }
      if (historyModal.classList.contains('show')) {
        closeHistoryModal();
        return;
      }
      if (generatorManageModal && generatorManageModal.classList.contains('show')) {
        closeGeneratorManageModal();
        return;
      }
      if (generatorEditModal && generatorEditModal.classList.contains('show')) {
        closeGeneratorEditModal();
        return;
      }
    }
    
    // Don't interfere with modal or input fields
    if ((editModal && editModal.classList.contains('show')) || 
        (generatorManageModal && generatorManageModal.classList.contains('show')) ||
        (generatorEditModal && generatorEditModal.classList.contains('show')) ||
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'SELECT') {
      return;
    }

    const cards = Array.from(content.querySelectorAll('.card:not(.random-card):not(.history-card)'));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedCardIndex = Math.min(selectedCardIndex + 1, cards.length - 1);
      if (cards[selectedCardIndex]) {
        cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[selectedCardIndex].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedCardIndex = Math.max(selectedCardIndex - 1, 0);
      if (cards[selectedCardIndex]) {
        cards[selectedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        cards[selectedCardIndex].focus();
      }
    } else if (e.key === 'Enter' && selectedCardIndex >= 0 && cards[selectedCardIndex]) {
      e.preventDefault();
      cards[selectedCardIndex].click();
    }
  });

  // Initialize on page load
  debugLog('Initializing...');
  
  // Initialize file storage and load data
  (async function initializeFileStorage() {
    const initialized = await initFileStorage();
    if (initialized) {
      // Data was loaded from server into localStorage, now reload all JavaScript variables
      debugLog('Server data loaded, reloading JavaScript variables from localStorage...');
      userItems = loadUserItems();
      deletedDefaults = loadDeletedDefaults();
      favorites = loadFavorites();
      
      // Trigger a re-render to show loaded data
      setTimeout(() => {
        const section = sectionSelect.value;
        if (section === 'actions') {
          renderActions();
        } else if (section === 'criticalHits') {
          renderCriticalHits();
        } else if (section === 'criticalFailures') {
          renderCriticalFailures();
        } else {
          render();
        }
      }, 100);
    } else {
      // Not using server storage, try local file system
      try {
        const loaded = await loadDataFromFile();
        if (loaded) {
          // Reload favorites and other data from localStorage (which was updated by loadDataFromFile)
          userItems = loadUserItems();
          deletedDefaults = loadDeletedDefaults();
          favorites = loadFavorites();
          // Trigger a re-render to show loaded data
          setTimeout(() => {
            render();
          }, 100);
        }
      } catch (error) {
        debugLog('Local file system load failed:', error);
      }
    }
  })();
  
  // Ensure section select has a value
  if (!sectionSelect.value && sectionSelect.options.length > 0) {
    sectionSelect.selectedIndex = 0;
    debugLog(`Initial section selected: ${sectionSelect.value}`);
  }
  
  try {
    buildCategories();
  } catch (error) {
    console.error('Error in buildCategories during init:', error);
  }
  
  // Ensure a category is selected
  if (categorySelect.options.length > 0 && !categorySelect.value) {
    categorySelect.selectedIndex = 0;
    debugLog(`Initial category selected: ${categorySelect.value}`);
  }
  debugLog('Initial render...');
  if (window.ActionWorkflow) {
    window.ActionWorkflow.init({ onChange: () => render() });
    if (window.ActionWorkflow.isWorkflowSection(sectionSelect.value)) {
      window.ActionWorkflow.showPanel(true);
      window.ActionWorkflow.applyTabPreset(sectionSelect.value);
    }
  }
  try {
    render();
  } catch (error) {
    console.error('Error in render during init:', error);
    clearElement(content);
    const errorCard = document.createElement('div');
    errorCard.className = 'card';
    errorCard.textContent = 'Error loading content. Please refresh the page.';
    content.appendChild(errorCard);
  }
  
  debugLog('Initialization complete');
})();
