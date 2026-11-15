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

  async function createCategory(character, label, icon) {
    const categories = await loadCategories(character);
    const existing = categories.find(c => c.label === label);
    if (existing) {
      return existing;
    }

    const newCategory = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      label: label,
      icon: icon || '📁',
      position: categories.length,
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
        option.value = cat.label;
        option.textContent = (cat.icon || '') + ' ' + cat.label;
        if (selectedCategory === cat.label) {
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

          const icon = prompt('Enter category icon (optional):') || '📁';
          
          try {
            const newCat = await createCategory(character, name.trim(), icon.trim());
            
            // Add new option before "New category..."
            const newCatOption = document.createElement('option');
            newCatOption.value = newCat.label;
            newCatOption.textContent = (newCat.icon || '') + ' ' + newCat.label;
            newCatOption.selected = true;
            select.insertBefore(newCatOption, newOption);
            
            if (onChange) {
              onChange(newCat.label);
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
