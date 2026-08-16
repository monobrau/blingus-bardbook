/**
 * User-managed workflow lists: locations, focus (foes/party/groups), moods.
 * Config via window.WorkflowCatalogConfig before this script loads.
 */
(function () {
  'use strict';

  const cfg = window.WorkflowCatalogConfig || {};
  const APP = cfg.app || 'blingus';
  const STORAGE_KEY = cfg.storageKey || 'blingusWorkflowCatalogV1';
  const PARTY_KEY = cfg.partyKey || 'blingusPartyMembersV1';
  const DEFAULT_PARTY = Array.isArray(cfg.defaultParty) ? cfg.defaultParty.slice() : [];
  const HAS_ENEMIES = APP !== 'galen';

  function emptyBucket() {
    return { added: [], hidden: [], edited: {} };
  }

  function emptyCatalog() {
    return {
      places: emptyBucket(),
      placeGroups: emptyBucket(),
      enemies: emptyBucket(),
      enemyGroups: emptyBucket(),
      moods: emptyBucket(),
      lighting: emptyBucket(),
      environment: emptyBucket(),
      intent: {},
    };
  }

  function slug(text, fallback) {
    const s = String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return s || fallback || ('item-' + Date.now());
  }

  function cleanText(value, max) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 80);
  }

  function loadCatalog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyCatalog();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return emptyCatalog();
      const base = emptyCatalog();
      ['places', 'placeGroups', 'enemies', 'enemyGroups', 'moods', 'lighting', 'environment'].forEach((key) => {
        const src = parsed[key] || {};
        base[key] = {
          added: Array.isArray(src.added) ? src.added : [],
          hidden: Array.isArray(src.hidden) ? src.hidden : [],
          edited: src.edited && typeof src.edited === 'object' ? src.edited : {},
        };
      });
      if (parsed.intent && typeof parsed.intent === 'object') {
        Object.keys(parsed.intent).forEach((id) => {
          const src = parsed.intent[id] || {};
          base.intent[id] = {
            added: Array.isArray(src.added) ? src.added : [],
            hidden: Array.isArray(src.hidden) ? src.hidden : [],
            edited: src.edited && typeof src.edited === 'object' ? src.edited : {},
          };
        });
      }
      return base;
    } catch (e) {
      return emptyCatalog();
    }
  }

  function saveCatalog(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* ignore */
    }
    notify();
    return data;
  }

  function notify() {
    try {
      window.dispatchEvent(new CustomEvent('workflow-catalog-change'));
    } catch (e) {
      /* ignore */
    }
  }

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else if (window.UIUtils?.showToast) window.UIUtils.showToast(msg);
  }

  function defaults() {
    return window.ActionWorkflow?.getCatalogDefaults?.() || {};
  }

  function defaultMoods() {
    return (window.OutcomeGenerate?.MOODS || []).slice();
  }

  function intentBucket(cat, outcomeId) {
    if (!cat.intent[outcomeId]) cat.intent[outcomeId] = emptyBucket();
    return cat.intent[outcomeId];
  }

  function mergeNamed(defaultsList, bucket, getId) {
    const hidden = new Set(bucket.hidden || []);
    const edited = bucket.edited || {};
    const out = [];
    (defaultsList || []).forEach((item) => {
      const id = getId(item);
      if (hidden.has(id)) return;
      out.push(edited[id] ? Object.assign({}, item, edited[id], { id: id }) : item);
    });
    (bucket.added || []).forEach((item) => {
      const id = getId(item);
      if (!id || hidden.has(id)) return;
      if (out.some((x) => getId(x) === id)) return;
      out.push(item);
    });
    return out;
  }

  function getPlaceGroups(defaultGroups) {
    const groups = defaultGroups || defaults().placeGroups || [];
    const cat = loadCatalog();
    const hiddenGroups = new Set(cat.placeGroups.hidden);
    const editedGroups = cat.placeGroups.edited || {};
    const hiddenPlaces = new Set(cat.places.hidden);
    const editedPlaces = cat.places.edited || {};

    const defaultGroupIdForPlace = {};
    groups.forEach((g) => {
      (g.ids || []).forEach((id) => { defaultGroupIdForPlace[id] = g.id; });
    });

    const result = groups
      .filter((g) => g.id && !hiddenGroups.has(g.id))
      .map((g) => {
        const ids = (g.ids || []).filter((id) => {
          if (hiddenPlaces.has(id)) return false;
          const moved = editedPlaces[id]?.group;
          return !moved || moved === g.id;
        });
        Object.keys(editedPlaces).forEach((id) => {
          if (hiddenPlaces.has(id)) return;
          if (editedPlaces[id].group === g.id && defaultGroupIdForPlace[id] !== g.id && !ids.includes(id)) {
            ids.push(id);
          }
        });
        (cat.places.added || []).forEach((p) => {
          if (!p?.id || hiddenPlaces.has(p.id)) return;
          if ((p.group || 'other') === g.id && !ids.includes(p.id)) ids.push(p.id);
        });
        return {
          id: g.id,
          label: editedGroups[g.id]?.label || g.label,
          ids,
        };
      });

    (cat.placeGroups.added || []).forEach((g) => {
      if (!g?.id || hiddenGroups.has(g.id)) return;
      if (result.some((x) => x.id === g.id)) return;
      const ids = (cat.places.added || [])
        .filter((p) => p?.id && !hiddenPlaces.has(p.id) && p.group === g.id)
        .map((p) => p.id);
      Object.keys(editedPlaces).forEach((id) => {
        if (!hiddenPlaces.has(id) && editedPlaces[id].group === g.id && !ids.includes(id)) ids.push(id);
      });
      result.push({ id: g.id, label: g.label, ids });
    });
    return result;
  }

  function getPlaceMeta(id) {
    const cat = loadCatalog();
    const added = (cat.places.added || []).find((p) => p.id === id);
    const edited = cat.places.edited?.[id];
    const fromDefault = (defaults().places || []).find((p) => p.id === id);
    return Object.assign({}, fromDefault || {}, added || {}, edited || {}, { id });
  }

  function getPlaceLabel(id) {
    const meta = getPlaceMeta(id);
    return meta.label || id;
  }

  function getAddedPlaceIds() {
    const cat = loadCatalog();
    const hidden = new Set(cat.places.hidden);
    return (cat.places.added || []).map((p) => p.id).filter((id) => id && !hidden.has(id));
  }

  function getHiddenPlaceIds() {
    return loadCatalog().places.hidden.slice();
  }

  function getEnemyGroups(defaultGroups) {
    const groups = defaultGroups || defaults().enemyGroups || [];
    const cat = loadCatalog();
    const hiddenGroups = new Set(cat.enemyGroups.hidden);
    const editedGroups = cat.enemyGroups.edited || {};
    const result = groups
      .filter((g) => g.id && !hiddenGroups.has(g.id))
      .map((g) => ({
        id: g.id,
        label: editedGroups[g.id]?.label || g.label,
      }));
    (cat.enemyGroups.added || []).forEach((g) => {
      if (!g?.id || hiddenGroups.has(g.id)) return;
      if (!result.some((x) => x.id === g.id)) result.push({ id: g.id, label: g.label });
    });
    return result;
  }

  function getEnemies(defaultEnemies) {
    return mergeNamed(defaultEnemies || defaults().enemies || [], loadCatalog().enemies, (e) => e.id);
  }

  function getMoods(defaultList) {
    return mergeNamed(defaultList || defaultMoods(), loadCatalog().moods, (m) => m.id);
  }

  function defaultLighting() {
    return (defaults().lighting || []).slice();
  }

  function defaultEnvironment() {
    return (defaults().environment || []).slice();
  }

  function getLighting(defaultList) {
    return mergeNamed(defaultList || defaultLighting(), loadCatalog().lighting, (m) => m.id);
  }

  function getEnvironment(setting, defaultList) {
    const merged = mergeNamed(defaultList || defaultEnvironment(), loadCatalog().environment, (m) => m.id);
    if (!setting) return merged;
    return merged.filter((item) => !item.scope || item.scope === 'shared' || item.scope === setting);
  }

  function mergeIntentChips(outcomeId, defaultChips) {
    const cat = loadCatalog();
    const bucket = cat.intent[outcomeId] || emptyBucket();
    const hidden = new Set(bucket.hidden || []);
    const edited = bucket.edited || {};
    const out = [];
    (defaultChips || []).forEach((label) => {
      const id = String(label);
      if (hidden.has(id)) return;
      out.push(edited[id] || id);
    });
    (bucket.added || []).forEach((label) => {
      const id = String(label);
      if (!id || hidden.has(id) || out.some((x) => String(x).toLowerCase() === id.toLowerCase())) return;
      out.push(id);
    });
    return out;
  }

  function loadParty() {
    try {
      const raw = localStorage.getItem(PARTY_KEY);
      if (!raw) return DEFAULT_PARTY.slice();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_PARTY.slice();
      const cleaned = parsed.filter((n) => typeof n === 'string').map((n) => n.trim()).filter(Boolean);
      return cleaned.length ? cleaned : DEFAULT_PARTY.slice();
    } catch (e) {
      return DEFAULT_PARTY.slice();
    }
  }

  function saveParty(members) {
    const unique = [];
    const seen = new Set();
    (members || []).forEach((name) => {
      const trimmed = cleanText(name, 80);
      const key = trimmed.toLowerCase();
      if (!trimmed || seen.has(key)) return;
      seen.add(key);
      unique.push(trimmed);
    });
    const next = unique.length ? unique : DEFAULT_PARTY.slice();
    try {
      localStorage.setItem(PARTY_KEY, JSON.stringify(next));
    } catch (e) {
      /* ignore */
    }
    notify();
    return next;
  }

  function hideOrRemove(bucket, id, isDefault) {
    if (isDefault) {
      if (!bucket.hidden.includes(id)) bucket.hidden.push(id);
      delete bucket.edited[id];
    } else {
      bucket.added = bucket.added.filter((item) => {
        const itemId = typeof item === 'string' ? item : item.id;
        return itemId !== id;
      });
    }
  }

  function isDefaultPlace(id) {
    const groups = defaults().placeGroups || [];
    return groups.some((g) => (g.ids || []).includes(id)) || (defaults().places || []).some((p) => p.id === id);
  }

  function isDefaultEnemy(id) {
    return (defaults().enemies || []).some((e) => e.id === id);
  }

  function isDefaultMood(id) {
    return defaultMoods().some((m) => m.id === id);
  }

  function isDefaultGroup(kind, id) {
    const list = kind === 'placeGroups' ? (defaults().placeGroups || []) : (defaults().enemyGroups || []);
    return list.some((g) => g.id === id);
  }

  function isDefaultLighting(id) {
    return defaultLighting().some((m) => m.id === id);
  }

  function isDefaultEnvironment(id) {
    return defaultEnvironment().some((m) => m.id === id);
  }

  function isDefaultIntent(outcomeId, label) {
    const lists = defaults().intentLists || {};
    return (lists[outcomeId] || []).some((x) => String(x) === String(label));
  }

  let modal = null;
  let activeKind = 'places';
  let activeOutcome = '';
  let editingId = null;

  function kinds() {
    const list = [
      { id: 'places', label: 'Locations' },
      { id: 'placeGroups', label: 'Location groups' },
    ];
    if (HAS_ENEMIES) {
      list.push({ id: 'enemies', label: 'Foes' });
      list.push({ id: 'enemyGroups', label: 'Foe groups' });
    } else {
      list.push({ id: 'intent', label: 'Focus chips' });
    }
    list.push({ id: 'party', label: 'Party' });
    list.push({ id: 'moods', label: 'Moods' });
    list.push({ id: 'lighting', label: 'Lighting' });
    list.push({ id: 'environment', label: 'Environment' });
    return list;
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'catalogModal';
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'catalogTitle');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="modal__content catalog-modal">',
      '  <div class="modal__header">',
      '    <h2 id="catalogTitle">Manage lists</h2>',
      '    <button type="button" class="modal__close" id="catalogClose" aria-label="Close">&times;</button>',
      '  </div>',
      '  <div class="modal__body">',
      '    <div class="chips chips--pills catalog-tabs" id="catalogTabs"></div>',
      '    <div class="catalog-toolbar">',
      '      <label id="catalogOutcomeWrap" hidden>List',
      '        <select id="catalogOutcome"></select>',
      '      </label>',
      '      <button type="button" class="btn" id="catalogAddBtn">➕ Add</button>',
      '    </div>',
      '    <div id="catalogList" class="catalog-list"></div>',
      '    <form id="catalogForm" class="catalog-form" hidden>',
      '      <div id="catalogFields"></div>',
      '      <div class="catalog-form__actions">',
      '        <button type="submit" class="btn">Save</button>',
      '        <button type="button" class="btn btn--secondary" id="catalogFormCancel">Cancel</button>',
      '      </div>',
      '    </form>',
      '  </div>',
      '</div>',
    ].join('');
    document.body.appendChild(modal);
    modal.querySelector('#catalogClose').addEventListener('click', closeManage);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeManage();
    });
    modal.querySelector('#catalogAddBtn').addEventListener('click', () => showForm(null));
    modal.querySelector('#catalogFormCancel').addEventListener('click', () => hideForm());
    modal.querySelector('#catalogForm').addEventListener('submit', (e) => {
      e.preventDefault();
      saveForm();
    });
    modal.querySelector('#catalogOutcome').addEventListener('change', () => {
      activeOutcome = modal.querySelector('#catalogOutcome').value;
      hideForm();
      renderList();
    });
    return modal;
  }

  function closeManage() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    hideForm();
  }

  function fieldHtml(name, label, value, extra) {
    const extras = extra || {};
    if (extras.type === 'select') {
      const opts = (extras.options || []).map((o) => {
        const sel = String(o.id) === String(value) ? ' selected' : '';
        return '<option value="' + escapeAttr(o.id) + '"' + sel + '>' + escapeHtml(o.label) + '</option>';
      }).join('');
      return '<label>' + escapeHtml(label) + '<select name="' + name + '">' + opts + '</select></label>';
    }
    if (extras.type === 'textarea') {
      return '<label>' + escapeHtml(label) + '<textarea name="' + name + '" rows="3" maxlength="' + (extras.max || 400) + '">' + escapeHtml(value || '') + '</textarea></label>';
    }
    return '<label>' + escapeHtml(label) + '<input type="text" name="' + name + '" value="' + escapeAttr(value || '') + '" maxlength="' + (extras.max || 80) + '" /></label>';
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function outcomeOptions() {
    return defaults().intentOptions || [];
  }

  function showForm(id) {
    const form = modal.querySelector('#catalogForm');
    const fields = modal.querySelector('#catalogFields');
    editingId = id;
    let html = '';
    if (activeKind === 'places') {
      const meta = id ? getPlaceMeta(id) : {};
      const groups = getPlaceGroups().map((g) => ({ id: g.id, label: g.label }));
      html += fieldHtml('name', 'Place name', id || '', { max: 80 });
      html += fieldHtml('label', 'Chip label (optional)', meta.label && meta.label !== id ? meta.label : '', { max: 80 });
      html += fieldHtml('group', 'Group', meta.group || (groups[0] && groups[0].id) || '', { type: 'select', options: groups });
      html += fieldHtml('setting', 'Indoors / outdoors', meta.setting || 'both', {
        type: 'select',
        options: [
          { id: 'both', label: 'Both' },
          { id: 'indoors', label: 'Indoors' },
          { id: 'outdoors', label: 'Outdoors' },
        ],
      });
    } else if (activeKind === 'placeGroups' || activeKind === 'enemyGroups') {
      const groups = activeKind === 'placeGroups' ? getPlaceGroups() : getEnemyGroups();
      const current = groups.find((g) => g.id === id);
      html += fieldHtml('label', 'Group name', current?.label || '', { max: 80 });
    } else if (activeKind === 'enemies') {
      const foe = getEnemies().find((e) => e.id === id) || {};
      const groups = getEnemyGroups().map((g) => ({ id: g.id, label: g.label }));
      html += fieldHtml('name', 'Foe name', foe.name || '', { max: 80 });
      html += fieldHtml('label', 'Chip label (optional)', foe.label && foe.label !== foe.name ? foe.label : '', { max: 80 });
      html += fieldHtml('group', 'Group', foe.group || (groups[0] && groups[0].id) || '', { type: 'select', options: groups });
    } else if (activeKind === 'intent') {
      html += fieldHtml('label', 'Chip text', id || '', { max: 80 });
    } else if (activeKind === 'party') {
      html += fieldHtml('name', 'Name', id || '', { max: 80 });
    } else if (activeKind === 'moods') {
      const mood = getMoods().find((m) => m.id === id) || {};
      html += fieldHtml('label', 'Chip label', mood.label || '', { max: 80 });
      html += fieldHtml('prompt', 'How this colors Claude lines', mood.prompt || '', { type: 'textarea', max: 400 });
    } else if (activeKind === 'lighting') {
      const item = getLighting().find((m) => m.id === id) || {};
      html += fieldHtml('label', 'Chip label', item.label || '', { max: 80 });
    } else if (activeKind === 'environment') {
      const item = getEnvironment().find((m) => m.id === id) || {};
      html += fieldHtml('label', 'Chip label', item.label || '', { max: 80 });
      html += fieldHtml('scope', 'Where it shows', item.scope || 'shared', {
        type: 'select',
        options: [
          { id: 'shared', label: 'Indoors and outdoors' },
          { id: 'indoors', label: 'Indoors only' },
          { id: 'outdoors', label: 'Outdoors only' },
        ],
      });
    }
    fields.innerHTML = html;
    form.hidden = false;
    const first = fields.querySelector('input, textarea, select');
    if (first) first.focus();
  }

  function hideForm() {
    editingId = null;
    if (!modal) return;
    const form = modal.querySelector('#catalogForm');
    if (form) form.hidden = true;
  }

  function formValue(name) {
    const el = modal.querySelector('[name="' + name + '"]');
    return el ? el.value : '';
  }

  function saveForm() {
    const cat = loadCatalog();
    if (activeKind === 'places') {
      const name = cleanText(formValue('name'), 80);
      if (!name) return toast('Enter a place name');
      const item = {
        id: name,
        label: cleanText(formValue('label'), 80) || name,
        group: cleanText(formValue('group'), 40) || 'other',
        setting: cleanText(formValue('setting'), 20) || 'both',
      };
      if (editingId && editingId !== name && isDefaultPlace(editingId)) {
        hideOrRemove(cat.places, editingId, true);
        cat.places.added.push(item);
      } else if (editingId && isDefaultPlace(editingId)) {
        cat.places.edited[editingId] = item;
      } else {
        if (editingId) cat.places.added = cat.places.added.filter((p) => p.id !== editingId);
        const idx = cat.places.added.findIndex((p) => p.id === item.id);
        if (idx >= 0) cat.places.added[idx] = item;
        else cat.places.added.push(item);
      }
    } else if (activeKind === 'placeGroups' || activeKind === 'enemyGroups') {
      const label = cleanText(formValue('label'), 80);
      if (!label) return toast('Enter a group name');
      const bucket = cat[activeKind];
      const id = editingId || slug(label, 'group');
      if (editingId && isDefaultGroup(activeKind, editingId)) {
        bucket.edited[editingId] = { label };
      } else {
        const item = { id, label };
        bucket.added = bucket.added.filter((g) => g.id !== id);
        bucket.added.push(item);
      }
    } else if (activeKind === 'enemies') {
      const name = cleanText(formValue('name'), 80);
      if (!name) return toast('Enter a foe name');
      const id = editingId && isDefaultEnemy(editingId) ? editingId : slug(name, 'foe');
      const item = {
        id,
        name,
        label: cleanText(formValue('label'), 80) || name,
        group: cleanText(formValue('group'), 40) || 'other',
      };
      if (editingId && isDefaultEnemy(editingId)) {
        cat.enemies.edited[editingId] = item;
      } else {
        if (editingId) cat.enemies.added = cat.enemies.added.filter((e) => e.id !== editingId);
        const idx = cat.enemies.added.findIndex((e) => e.id === item.id);
        if (idx >= 0) cat.enemies.added[idx] = item;
        else cat.enemies.added.push(item);
      }
    } else if (activeKind === 'intent') {
      const label = cleanText(formValue('label'), 80);
      if (!label) return toast('Enter chip text');
      const outcomeId = activeOutcome || (outcomeOptions()[0] && outcomeOptions()[0].id);
      if (!outcomeId) return toast('Pick a focus list');
      const bucket = intentBucket(cat, outcomeId);
      if (editingId && isDefaultIntent(outcomeId, editingId)) {
        if (label !== editingId) bucket.edited[editingId] = label;
      } else {
        if (editingId) bucket.added = bucket.added.filter((x) => x !== editingId);
        if (!bucket.added.includes(label)) bucket.added.push(label);
      }
    } else if (activeKind === 'party') {
      const name = cleanText(formValue('name'), 80);
      if (!name) return toast('Enter a name');
      const members = loadParty();
      if (editingId) {
        const next = members.map((m) => (m === editingId ? name : m));
        saveParty(next);
      } else {
        saveParty(members.concat([name]));
      }
      hideForm();
      renderList();
      toast('Saved');
      return;
    } else if (activeKind === 'moods') {
      const label = cleanText(formValue('label'), 80);
      if (!label) return toast('Enter a mood label');
      const prompt = cleanText(formValue('prompt'), 400)
        || ('CUSTOM MOOD: "' + label + '". Color every line with this emotional register. Stay in character.');
      const id = editingId && isDefaultMood(editingId) ? editingId : slug(label.replace(/^[^\w]+/, ''), 'mood');
      const item = { id, label, prompt };
      if (editingId && isDefaultMood(editingId)) {
        cat.moods.edited[editingId] = item;
      } else {
        if (editingId) cat.moods.added = cat.moods.added.filter((m) => m.id !== editingId);
        const idx = cat.moods.added.findIndex((m) => m.id === item.id);
        if (idx >= 0) cat.moods.added[idx] = item;
        else cat.moods.added.push(item);
      }
    } else if (activeKind === 'lighting' || activeKind === 'environment') {
      const label = cleanText(formValue('label'), 80);
      if (!label) return toast('Enter a chip label');
      const isDefault = activeKind === 'lighting' ? isDefaultLighting(editingId) : isDefaultEnvironment(editingId);
      const id = editingId && isDefault ? editingId : slug(label.replace(/^[^\w]+/, ''), activeKind === 'lighting' ? 'light' : 'env');
      const item = { id, label };
      if (activeKind === 'environment') item.scope = cleanText(formValue('scope'), 20) || 'shared';
      const bucket = cat[activeKind];
      if (editingId && isDefault) {
        bucket.edited[editingId] = item;
      } else {
        if (editingId) bucket.added = bucket.added.filter((m) => m.id !== editingId);
        const idx = bucket.added.findIndex((m) => m.id === item.id);
        if (idx >= 0) bucket.added[idx] = item;
        else bucket.added.push(item);
      }
    }
    saveCatalog(cat);
    hideForm();
    renderList();
    toast('Saved');
  }

  function removeItem(id) {
    if (!id) return;
    if (activeKind === 'party') {
      saveParty(loadParty().filter((m) => m !== id));
      renderList();
      toast('Removed');
      return;
    }
    const cat = loadCatalog();
    if (activeKind === 'places') hideOrRemove(cat.places, id, isDefaultPlace(id));
    else if (activeKind === 'placeGroups') hideOrRemove(cat.placeGroups, id, isDefaultGroup('placeGroups', id));
    else if (activeKind === 'enemies') hideOrRemove(cat.enemies, id, isDefaultEnemy(id));
    else if (activeKind === 'enemyGroups') hideOrRemove(cat.enemyGroups, id, isDefaultGroup('enemyGroups', id));
    else if (activeKind === 'moods') hideOrRemove(cat.moods, id, isDefaultMood(id));
    else if (activeKind === 'lighting') hideOrRemove(cat.lighting, id, isDefaultLighting(id));
    else if (activeKind === 'environment') hideOrRemove(cat.environment, id, isDefaultEnvironment(id));
    else if (activeKind === 'intent') {
      const outcomeId = activeOutcome || (outcomeOptions()[0] && outcomeOptions()[0].id);
      hideOrRemove(intentBucket(cat, outcomeId), id, isDefaultIntent(outcomeId, id));
    }
    saveCatalog(cat);
    hideForm();
    renderList();
    toast('Removed');
  }

  function listRows() {
    if (activeKind === 'places') {
      return getPlaceGroups().flatMap((g) => (g.ids || []).map((id) => ({
        id,
        label: getPlaceLabel(id) + '  ·  ' + g.label,
      })));
    }
    if (activeKind === 'placeGroups') return getPlaceGroups().map((g) => ({ id: g.id, label: g.label }));
    if (activeKind === 'enemies') {
      const groups = getEnemyGroups();
      return getEnemies().map((e) => ({
        id: e.id,
        label: (e.label || e.name) + '  ·  ' + (groups.find((g) => g.id === e.group)?.label || e.group || ''),
      }));
    }
    if (activeKind === 'enemyGroups') return getEnemyGroups().map((g) => ({ id: g.id, label: g.label }));
    if (activeKind === 'party') return loadParty().map((name) => ({ id: name, label: name }));
    if (activeKind === 'moods') return getMoods().map((m) => ({ id: m.id, label: m.label }));
    if (activeKind === 'lighting') return getLighting().map((m) => ({ id: m.id, label: m.label }));
    if (activeKind === 'environment') {
      const scopeLabel = { shared: 'both', indoors: 'indoors', outdoors: 'outdoors' };
      return getEnvironment().map((m) => ({
        id: m.id,
        label: m.label + '  ·  ' + (scopeLabel[m.scope] || 'both'),
      }));
    }
    if (activeKind === 'intent') {
      const outcomeId = activeOutcome || (outcomeOptions()[0] && outcomeOptions()[0].id);
      const base = (defaults().intentLists || {})[outcomeId] || [];
      return mergeIntentChips(outcomeId, base).map((label) => ({ id: label, label }));
    }
    return [];
  }

  function renderTabs() {
    const tabs = modal.querySelector('#catalogTabs');
    tabs.innerHTML = '';
    kinds().forEach((kind) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip chip--pill' + (activeKind === kind.id ? ' chip--active' : '');
      btn.textContent = kind.label;
      btn.addEventListener('click', () => {
        activeKind = kind.id;
        hideForm();
        renderTabs();
        renderOutcomeFilter();
        renderList();
      });
      tabs.appendChild(btn);
    });
  }

  function renderOutcomeFilter() {
    const wrap = modal.querySelector('#catalogOutcomeWrap');
    const sel = modal.querySelector('#catalogOutcome');
    const show = activeKind === 'intent';
    wrap.hidden = !show;
    if (!show) return;
    const opts = outcomeOptions();
    if (!activeOutcome && opts[0]) activeOutcome = opts[0].id;
    sel.innerHTML = opts.map((o) => (
      '<option value="' + escapeAttr(o.id) + '"' + (o.id === activeOutcome ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>'
    )).join('');
  }

  function renderList() {
    const list = modal.querySelector('#catalogList');
    list.innerHTML = '';
    const rows = listRows();
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'catalog-empty';
      empty.textContent = 'Nothing here yet.';
      list.appendChild(empty);
      return;
    }
    rows.forEach((row) => {
      const el = document.createElement('div');
      el.className = 'catalog-row';
      const label = document.createElement('div');
      label.className = 'catalog-row__label';
      label.textContent = row.label;
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'btn btn--ghost btn--compact';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => showForm(row.id));
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn btn--ghost btn--compact';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        if (window.confirm('Remove "' + row.label + '"?')) removeItem(row.id);
      });
      el.appendChild(label);
      el.appendChild(edit);
      el.appendChild(del);
      list.appendChild(el);
    });
  }

  function openManage(kind, opts) {
    const options = opts || {};
    ensureModal();
    activeKind = kind && kinds().some((k) => k.id === kind) ? kind : 'places';
    if (options.outcomeId) activeOutcome = options.outcomeId;
    renderTabs();
    renderOutcomeFilter();
    renderList();
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    if (options.add) showForm(null);
    else if (options.editId) showForm(options.editId);
    else hideForm();
  }

  function decorateChip(chip, kind, id, extras) {
    if (!chip || !chip.parentNode) return;
    if (chip.parentNode.classList && chip.parentNode.classList.contains('chip-wrap')) return;
    const wrap = document.createElement('span');
    wrap.className = 'chip-wrap';
    chip.parentNode.insertBefore(wrap, chip);
    wrap.appendChild(chip);
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'chip__edit';
    edit.textContent = '✎';
    edit.title = 'Edit or delete';
    edit.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openManage(kind, Object.assign({ editId: String(id) }, extras || {}));
    });
    wrap.appendChild(edit);
  }

  function appendAddChip(container, kind, extras) {
    if (!container) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip chip--pill chip--add';
    btn.textContent = '➕';
    btn.title = 'Add';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openManage(kind, Object.assign({ add: true }, extras || {}));
    });
    container.appendChild(btn);
  }

  function exportState() {
    return {
      catalog: loadCatalog(),
      partyMembers: loadParty(),
    };
  }

  function importState(data) {
    if (!data) return;
    if (data.catalog && typeof data.catalog === 'object') saveCatalog(Object.assign(emptyCatalog(), data.catalog));
    else if (data.places || data.moods) saveCatalog(Object.assign(emptyCatalog(), data));
    if (Array.isArray(data.partyMembers)) saveParty(data.partyMembers);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.catalog-manage-btn, #manageListsBtn');
    if (!btn) return;
    e.preventDefault();
    openManage(btn.getAttribute('data-catalog') || 'places');
  });

  window.WorkflowCatalog = {
    openManage,
    decorateChip,
    appendAddChip,
    getPlaceGroups,
    getPlaceMeta,
    getPlaceLabel,
    getAddedPlaceIds,
    getHiddenPlaceIds,
    getEnemyGroups,
    getEnemies,
    getMoods,
    getLighting,
    getEnvironment,
    mergeIntentChips,
    loadParty,
    saveParty,
    exportState,
    importState,
    loadCatalog,
  };
})();
