/**
 * Manage soundboard categories: create, rename, delete, reorder, and assign clips to categories.
 */
window.SoundboardCategoryManager = (function () {
  'use strict';

  const ENDPOINT = '/api/soundboard.php';
  let characterId = null;
  let categories = [];
  let clips = [];

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

  async function apiPost(body) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
    if (!res.ok || !data || data.success === false) {
      throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  function toast(msg) {
    if (window.UIUtils && window.UIUtils.showToast) {
      window.UIUtils.showToast(msg);
    } else if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  async function saveCategories() {
    try {
      const data = await apiPost({
        action: 'saveCategories',
        character: characterId,
        categories: categories,
      });
      categories = data.categories || [];
      toast('Categories saved');
      render();
    } catch (e) {
      toast(e.message || 'Failed to save categories');
    }
  }

  function addCategory() {
    const name = prompt('Category name:');
    if (!name || name.trim() === '') return;
    
    categories.push({
      id: Math.random().toString(36).substring(2, 10),
      name: name.trim(),
      order: categories.length,
    });
    
    saveCategories();
  }

  function renameCategory(categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    
    const name = prompt('Rename category:', cat.name);
    if (!name || name.trim() === '') return;
    
    cat.name = name.trim();
    saveCategories();
  }

  function deleteCategory(categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    
    const clipsInCategory = clips.filter(c => c.category === cat.name);
    
    if (clipsInCategory.length > 0) {
      const otherCategories = categories.filter(c => c.id !== categoryId);
      let message = `Delete category "${cat.name}"?\n\nIt contains ${clipsInCategory.length} clip(s).\n\nWhat should happen to these clips?`;
      
      const choice = confirm(message + '\n\nClick OK to move clips to "Uncategorized".\nClick Cancel to keep the category.');
      
      if (!choice) return;
      
      clipsInCategory.forEach(clip => {
        updateClipCategory(clip.id, null);
      });
    }
    
    categories = categories.filter(c => c.id !== categoryId);
    saveCategories();
  }

  function moveUp(categoryId) {
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx <= 0) return;
    
    [categories[idx - 1], categories[idx]] = [categories[idx], categories[idx - 1]];
    categories.forEach((c, i) => { c.order = i; });
    saveCategories();
  }

  function moveDown(categoryId) {
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx < 0 || idx >= categories.length - 1) return;
    
    [categories[idx], categories[idx + 1]] = [categories[idx + 1], categories[idx]];
    categories.forEach((c, i) => { c.order = i; });
    saveCategories();
  }

  async function updateClipCategory(clipId, category) {
    try {
      await apiPost({
        action: 'updateClipCategory',
        character: characterId,
        id: clipId,
        category: category,
      });
    } catch (e) {
      toast(e.message || 'Failed to update clip');
    }
  }

  function render() {
    const modal = document.getElementById('categoryManagerModal');
    if (!modal) return;

    const body = modal.querySelector('.modal__body');
    if (!body) return;

    body.innerHTML = '';

    const section = el('section', 'category-manager__section');
    const header = el('div', 'category-manager__header');
    header.appendChild(el('h3', 'category-manager__title', 'Categories'));
    
    const addBtn = el('button', 'btn btn--compact', '+ Add Category');
    addBtn.type = 'button';
    addBtn.addEventListener('click', addCategory);
    header.appendChild(addBtn);
    
    section.appendChild(header);

    if (categories.length === 0) {
      section.appendChild(el('p', 'category-manager__empty', 'No categories yet. Click "Add Category" to create one.'));
    } else {
      const list = el('div', 'category-manager__list');
      
      categories.forEach((cat, idx) => {
        const item = el('div', 'category-manager__item');
        
        const info = el('div', 'category-manager__info');
        info.appendChild(el('div', 'category-manager__name', cat.name));
        const clipsInCat = clips.filter(c => c.category === cat.name).length;
        info.appendChild(el('div', 'category-manager__meta', clipsInCat + ' clip(s)'));
        item.appendChild(info);
        
        const actions = el('div', 'category-manager__actions');
        
        if (idx > 0) {
          const upBtn = el('button', 'btn btn--ghost btn--compact', '↑');
          upBtn.type = 'button';
          upBtn.title = 'Move up';
          upBtn.addEventListener('click', () => moveUp(cat.id));
          actions.appendChild(upBtn);
        }
        
        if (idx < categories.length - 1) {
          const downBtn = el('button', 'btn btn--ghost btn--compact', '↓');
          downBtn.type = 'button';
          downBtn.title = 'Move down';
          downBtn.addEventListener('click', () => moveDown(cat.id));
          actions.appendChild(downBtn);
        }
        
        const renameBtn = el('button', 'btn btn--compact', 'Rename');
        renameBtn.type = 'button';
        renameBtn.addEventListener('click', () => renameCategory(cat.id));
        actions.appendChild(renameBtn);
        
        const deleteBtn = el('button', 'btn btn--secondary btn--compact', 'Delete');
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', () => deleteCategory(cat.id));
        actions.appendChild(deleteBtn);
        
        item.appendChild(actions);
        list.appendChild(item);
      });
      
      section.appendChild(list);
    }

    body.appendChild(section);
    
    const clipSection = el('section', 'category-manager__section');
    clipSection.appendChild(el('h3', 'category-manager__title', 'Clip Categories'));
    clipSection.appendChild(el('p', 'category-manager__hint', 'Assign clips to categories. Clips without a category appear in "Uncategorized".'));
    
    const clipList = el('div', 'category-manager__clip-list');
    
    if (clips.length === 0) {
      clipList.appendChild(el('p', 'category-manager__empty', 'No clips yet.'));
    } else {
      clips.forEach(clip => {
        const item = el('div', 'category-manager__clip-item');
        
        const icon = el('span', 'category-manager__clip-icon', clip.icon || '🔊');
        item.appendChild(icon);
        
        const info = el('div', 'category-manager__clip-info');
        info.appendChild(el('div', 'category-manager__clip-name', clip.label || 'Untitled'));
        item.appendChild(info);
        
        const select = document.createElement('select');
        select.className = 'category-manager__clip-select';
        
        const noneOption = document.createElement('option');
        noneOption.value = '';
        noneOption.textContent = 'Uncategorized';
        select.appendChild(noneOption);
        
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.name;
          option.textContent = cat.name;
          if (clip.category === cat.name) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        
        if (clip.category && !categories.find(c => c.name === clip.category)) {
          const missingOption = document.createElement('option');
          missingOption.value = clip.category;
          missingOption.textContent = clip.category + ' (deleted)';
          missingOption.selected = true;
          select.appendChild(missingOption);
        }
        
        select.addEventListener('change', async () => {
          const newCategory = select.value || null;
          await updateClipCategory(clip.id, newCategory);
          clip.category = newCategory;
          toast('Clip updated');
        });
        
        item.appendChild(select);
        clipList.appendChild(item);
      });
    }
    
    clipSection.appendChild(clipList);
    body.appendChild(clipSection);
  }

  function close() {
    const modal = document.getElementById('categoryManagerModal');
    if (modal) modal.remove();
    
    if (window.Soundboard && window.Soundboard.reload) {
      window.Soundboard.reload();
    }
  }

  async function open(charId, clipsData) {
    characterId = charId;
    categories = clipsData.categories || [];
    clips = clipsData.clips || [];

    let modal = document.getElementById('categoryManagerModal');
    if (modal) {
      modal.remove();
    }

    modal = el('div', 'modal category-manager-modal show');
    modal.id = 'categoryManagerModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'categoryManagerTitle');
    modal.setAttribute('aria-hidden', 'false');

    const content = el('div', 'modal__content');

    const header = el('div', 'modal__header');
    header.appendChild(el('h2', null, 'Manage Categories'));
    header.id = 'categoryManagerTitle';
    const closeBtn = el('button', 'modal__close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', close);
    header.appendChild(closeBtn);
    content.appendChild(header);

    const body = el('div', 'modal__body');
    content.appendChild(body);

    const footer = el('div', 'modal__footer');
    
    const doneBtn = el('button', 'btn', 'Done');
    doneBtn.type = 'button';
    doneBtn.addEventListener('click', close);
    footer.appendChild(doneBtn);

    content.appendChild(footer);
    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.body.appendChild(modal);
    
    render();
  }

  return {
    open: open,
  };
})();
