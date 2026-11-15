/**
 * Category dropdown selector for clips.
 * Replaces free-text input with selection list to prevent typos.
 */
window.CategorySelector = (function () {
  'use strict';

  const ENDPOINT = '/api/soundboard.php';
  const UNCATEGORIZED = 'Uncategorized';
  const NEW_CATEGORY = '__new_category__';

  function getApiKey() {
    try {
      return localStorage.getItem('blingusApiKey') || '';
    } catch (e) {
      return '';
    }
  }

  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = getApiKey();
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  function withKey(params) {
    const qs = new URLSearchParams(params);
    const key = getApiKey();
    if (key) qs.set('key', key);
    return qs;
  }

  async function apiGet(params) {
    const res = await fetch(ENDPOINT + '?' + withKey(params).toString(), {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Request failed (' + res.status + ')');
    }
    const data = await res.json();
    if (!data || data.success === false) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  async function apiPost(body) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error('Request failed (' + res.status + ')');
    }
    const data = await res.json();
    if (!data || data.success === false) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  async function loadCategories(character) {
    const data = await apiGet({ action: 'listWithCategories', character: character });
    return data.categories || [];
  }

  // Server category records are { id: 8 hex chars, name, order } (see sbSaveCategories).
  function newCategoryId() {
    const bytes = new Uint8Array(4);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  async function createCategory(character, name) {
    const categories = await loadCategories(character);
    const clean = String(name || '').trim().slice(0, 50);
    if (!clean) throw new Error('Category name required');
    const existing = categories.find(c => (c.name || '').toLowerCase() === clean.toLowerCase());
    if (existing) {
      return existing;
    }

    const newCategory = {
      id: newCategoryId(),
      name: clean,
      order: categories.reduce((max, c) => Math.max(max, Number(c.order) || 0), 0) + 1,
    };

    const updated = [...categories, newCategory];
    await apiPost({
      action: 'saveCategories',
      character: character,
      categories: updated,
    });

    return newCategory;
  }

  /**
   * Create a category select element
   * @param {string} character - Character ID
   * @param {string|null} selectedCategory - Currently selected category
   * @param {Function} onChange - Callback when selection changes: (newCategory) => void
   * @returns {HTMLElement} select element
   */
  async function createSelector(character, selectedCategory, onChange) {
    const select = document.createElement('select');
    select.className = 'category-selector';

    try {
      const categories = await loadCategories(character);

      // Uncategorized option
      const uncatOption = document.createElement('option');
      uncatOption.value = '';
      uncatOption.textContent = UNCATEGORIZED;
      if (!selectedCategory || selectedCategory === '') {
        uncatOption.selected = true;
      }
      select.appendChild(uncatOption);

      // Existing categories
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        if (selectedCategory === cat.name) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      // New category option
      const newOption = document.createElement('option');
      newOption.value = NEW_CATEGORY;
      newOption.textContent = '+ New category...';
      select.appendChild(newOption);

      // Handle changes
      select.addEventListener('change', async (e) => {
        const value = e.target.value;
        
        if (value === NEW_CATEGORY) {
          // Prompt for new category
          const name = prompt('Enter category name:');
          if (!name || name.trim() === '') {
            // User cancelled, revert selection
            select.value = selectedCategory || '';
            return;
          }

          try {
            const newCat = await createCategory(character, name.trim());
            
            // Add new option before "New category..."
            const newCatOption = document.createElement('option');
            newCatOption.value = newCat.name;
            newCatOption.textContent = newCat.name;
            newCatOption.selected = true;
            select.insertBefore(newCatOption, newOption);
            
            if (onChange) {
              onChange(newCat.name);
            }
          } catch (err) {
            alert('Failed to create category: ' + err.message);
            select.value = selectedCategory || '';
          }
        } else {
          // Normal category selection
          if (onChange) {
            onChange(value);
          }
        }
      });

    } catch (err) {
      console.error('Failed to load categories:', err);
      // Fallback: just uncategorized
      const fallbackOption = document.createElement('option');
      fallbackOption.value = '';
      fallbackOption.textContent = UNCATEGORIZED;
      select.appendChild(fallbackOption);
    }

    return select;
  }

  /**
   * Create a bulk category selector for multiple clips
   * @param {string} character - Character ID
   * @param {Function} onAssign - Callback when category assigned: (category) => void
   * @returns {Promise<HTMLElement>} Container with selector and assign button
   */
  async function createBulkSelector(character, onAssign) {
    const container = document.createElement('div');
    container.className = 'bulk-category-selector';

    const label = document.createElement('label');
    label.textContent = 'Assign category: ';
    label.className = 'bulk-category-label';

    const select = await createSelector(character, null, null);
    select.className = 'bulk-category-select';

    const assignBtn = document.createElement('button');
    assignBtn.type = 'button';
    assignBtn.textContent = 'Assign';
    assignBtn.className = 'btn bulk-category-btn';
    assignBtn.addEventListener('click', () => {
      const value = select.value;
      if (value !== NEW_CATEGORY && onAssign) {
        onAssign(value);
      }
    });

    label.appendChild(select);
    container.appendChild(label);
    container.appendChild(assignBtn);

    return container;
  }

  return {
    createSelector,
    createBulkSelector,
    loadCategories,
    createCategory,
  };
})();
