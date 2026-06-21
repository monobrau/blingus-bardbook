/**
 * Search utilities for Blingus's Bardbook
 * Provides fuzzy matching and text highlighting
 */

/**
 * Calculate Levenshtein distance for fuzzy matching
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy match two strings
 * @param {string} needle - Search term
 * @param {string} haystack - Text to search in
 * @param {number} threshold - Max distance (default: 2)
 * @returns {boolean} - Whether strings match within threshold
 */
function fuzzyMatch(needle, haystack, threshold = 2) {
  if (!needle || !haystack) return false;

  needle = needle.toLowerCase();
  haystack = haystack.toLowerCase();

  // Exact substring match
  if (haystack.includes(needle)) return true;

  // Split haystack into words and check each
  const words = haystack.split(/\s+/);
  for (const word of words) {
    // Check if word starts with needle (partial match)
    if (word.startsWith(needle)) return true;

    // Fuzzy match for words of similar length
    if (Math.abs(word.length - needle.length) <= threshold) {
      const distance = levenshteinDistance(needle, word);
      if (distance <= threshold) return true;
    }
  }

  return false;
}

/**
 * Highlight matching text in a string
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} - HTML with highlighted matches
 */
function highlightMatches(text, query) {
  if (!query || !text) return escapeHtml(text);

  const escapedText = escapeHtml(text);
  const escapedQuery = escapeRegex(query);

  // Case-insensitive highlighting
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escapedText.replace(regex, '<mark style="background: #ffeb3b; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: bold;">$1</mark>');
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape regex special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Enhanced search with fuzzy matching
 * @param {string} query - Search query
 * @param {object} item - Item to search in
 * @param {boolean} useFuzzy - Whether to use fuzzy matching
 * @returns {boolean} - Whether item matches query
 */
function enhancedSearch(query, item, useFuzzy = true) {
  if (!query) return true;

  const q = query.toLowerCase();

  // For spell/bardic/mockery items
  if (item.t) {
    // Exact match first
    if (item.t.toLowerCase().includes(q)) return true;
    if (item.s && item.s.toLowerCase().includes(q)) return true;
    if (item.a && item.a.toLowerCase().includes(q)) return true;

    // Fuzzy match if enabled
    if (useFuzzy) {
      if (fuzzyMatch(q, item.t)) return true;
      if (item.s && fuzzyMatch(q, item.s)) return true;
      if (item.a && fuzzyMatch(q, item.a)) return true;
    }

    return false;
  }

  // For string items (actions, critical hits, etc.)
  if (typeof item === 'string') {
    if (item.toLowerCase().includes(q)) return true;
    if (useFuzzy && fuzzyMatch(q, item)) return true;
    return false;
  }

  return false;
}

// Export functions for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    levenshteinDistance,
    fuzzyMatch,
    highlightMatches,
    enhancedSearch,
    escapeHtml,
    escapeRegex
  };
}
