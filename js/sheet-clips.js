/**
 * Personal audio clips for ability scores and skills.
 * Files stay in this browser (IndexedDB). Nothing is uploaded.
 * Blingus first.
 */
(function () {
  'use strict';

  const DB_NAME = 'blingusSheetClipsV1';
  const STORE = 'clips';
  const MAX_BYTES = 12 * 1024 * 1024;
  const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const DEFAULT_LINES = {
    'ability|str': 'I am a fairy, not a mule. If it needs lifting, that is not my verse.',
    'ability|dex': 'Small, quick, and already not where you were looking.',
    'ability|con': 'I look easy to break. Try it and we will both be surprised.',
    'ability|int': 'I know enough to get into trouble, and just enough to stroll back out.',
    'ability|wis': 'I notice the wrong thing at the right time. It keeps me alive.',
    'ability|cha': 'Let me do the talking. That is the whole trick.',
    'skill|performance': 'Give me a tune and a room. I will make them listen.',
    'skill|investigation': 'Something here is not what it pretends to be. I intend to find it.',
    'skill|deception': 'The plain truth is dull. I brought a better version.',
    'skill|persuasion': 'Hear me out. You are going to like where this goes.',
    'skill|stealth': 'You did not see me. That was the idea.',
    'skill|acrobatics': 'Wings, balance, and no interest in meeting the floor.',
    'skill|intimidation': 'I am small. That has never made me harmless.',
    'skill|sleight of hand': 'Watch my hands. Or don\'t. That works too.',
    'skill|arcana': 'Magic leaves a scent. I know that scent.',
    'skill|insight': 'Your face already said it. Your mouth can catch up.',
    'skill|perception': 'I heard that. Don\'t bother pretending I didn\'t.',
    'skill|thieves\' tools': 'A lock is just a shy door. I can talk it open.',
  };
  let dbPromise = null;
  let current = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
    return dbPromise;
  }

  function clipKey(who, kind, id) {
    return who + '|' + kind + '|' + id;
  }

  function slug(name) {
    return String(name || '').trim().toLowerCase();
  }

  function defaultLine(kind, id, label) {
    const known = DEFAULT_LINES[kind + '|' + id];
    if (known) return known;
    const name = String(label || '').trim();
    if (!name) return '';
    return 'This is my ' + name.toLowerCase() + '. I have done it before, and I can do it again.';
  }

  function enabled(who) {
    return who === 'blingus';
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async function get(who, kind, id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(clipKey(who, kind, id));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  function voiceId() {
    if (window.BlingusSpeak && window.BlingusSpeak.voiceId) return window.BlingusSpeak.voiceId();
    try {
      const raw = String(localStorage.getItem('elevenLabsVoiceId') || '').trim();
      return /^[A-Za-z0-9]{8,40}$/.test(raw) ? raw : '';
    } catch (e) {
      return '';
    }
  }

  async function synthesize(who, text) {
    const endpoint = (window.BlingusConstants && window.BlingusConstants.API && window.BlingusConstants.API.SPEAK_ENDPOINT) || '/api/speak.php';
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ text: text, speaker: who, voiceId: voiceId() }),
    });
    const type = response.headers.get('Content-Type') || '';
    if (!response.ok || type.indexOf('audio') === -1) {
      let message = 'Speech failed';
      try {
        const data = await response.json();
        if (data && data.error) message = data.error;
      } catch (e) { /* keep the fallback */ }
      throw new Error(message);
    }
    const blob = await response.blob();
    if (!blob || blob.size > MAX_BYTES) {
      throw new Error('That line came back too large to save.');
    }
    return blob;
  }

  async function put(who, kind, id, text, blob) {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      name: text,
      text: text,
      type: blob.type || 'audio/mpeg',
      blob: blob,
    }, clipKey(who, kind, id));
    await txDone(tx);
  }

  async function remove(who, kind, id) {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(clipKey(who, kind, id));
    await txDone(tx);
  }

  function stop() {
    if (!current) return;
    try {
      current.audio.pause();
      URL.revokeObjectURL(current.url);
    } catch (e) { /* ignore */ }
    current = null;
  }

  async function play(who, kind, id) {
    const rec = await get(who, kind, id);
    if (!rec || !rec.blob) return;
    stop();
    const url = URL.createObjectURL(rec.blob);
    const audio = new Audio(url);
    current = { audio: audio, url: url };
    audio.addEventListener('ended', stop);
    const started = audio.play();
    if (started && started.catch) started.catch(() => {});
  }

  function playButton(who, kind, id, label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sheet-clip-play';
    btn.textContent = '♪';
    btn.title = 'Play ' + label;
    btn.setAttribute('aria-label', 'Play ' + label);
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      play(who, kind, id);
    });
    return btn;
  }

  async function decorate(root, who) {
    if (!root || !enabled(who)) return;
    const nodes = root.querySelectorAll('[data-clip-kind][data-clip-id]');
    await Promise.all(Array.from(nodes).map(async (node) => {
      const kind = node.getAttribute('data-clip-kind');
      const id = node.getAttribute('data-clip-id');
      const existing = node.querySelector(':scope > .sheet-clip-play');
      if (existing) existing.remove();
      node.classList.remove('has-clip');
      const rec = await get(who, kind, id);
      if (!rec) return;
      const label = node.getAttribute('data-clip-label') || id;
      node.classList.add('has-clip');
      node.appendChild(playButton(who, kind, id, label));
    }));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function closeDialog() {
    const modal = document.getElementById('sheetClipsModal');
    if (modal) modal.remove();
    stop();
  }

  function toast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
  }

  async function row(who, kind, id, label, onChange) {
    const line = el('div', 'sheet-clips__row');
    line.appendChild(el('span', 'sheet-clips__name', label));
    const rec = await get(who, kind, id);
    const status = el('span', 'sheet-clips__file', rec ? 'Saved' : 'None');
    line.appendChild(status);

    const text = document.createElement('textarea');
    text.className = 'sheet-clips__text';
    text.rows = 2;
    text.maxLength = 500;
    text.placeholder = 'Line to speak';
    text.value = rec && rec.text ? rec.text : defaultLine(kind, id, label);
    line.appendChild(text);

    const save = el('button', 'btn btn--ghost btn--compact', rec ? 'Update' : 'Save');
    save.type = 'button';
    save.addEventListener('click', async () => {
      const spoken = text.value.trim();
      if (!spoken) {
        toast('Type a line first.');
        return;
      }
      save.disabled = true;
      const previous = save.textContent;
      save.textContent = 'Speaking…';
      try {
        const blob = await synthesize(who, spoken);
        await put(who, kind, id, spoken, blob);
        if (onChange) await onChange();
      } catch (err) {
        toast(err && err.message ? err.message : 'Could not save that clip.');
        save.disabled = false;
        save.textContent = previous;
      }
    });
    line.appendChild(save);

    if (rec) {
      const playBtn = el('button', 'btn btn--ghost btn--compact', 'Play');
      playBtn.type = 'button';
      playBtn.addEventListener('click', () => play(who, kind, id));
      line.appendChild(playBtn);
      const clear = el('button', 'btn btn--ghost btn--compact', 'Remove');
      clear.type = 'button';
      clear.addEventListener('click', async () => {
        await remove(who, kind, id);
        if (onChange) await onChange();
      });
      line.appendChild(clear);
    }
    return line;
  }

  async function open(who, skills) {
    if (!enabled(who)) return;
    closeDialog();
    const modal = el('div', 'modal sheet-clips-modal show');
    modal.id = 'sheetClipsModal';
    const content = el('div', 'modal__content sheet-clips');
    const head = el('div', 'modal__header');
    head.appendChild(el('h2', null, 'Sound clips'));
    const close = el('button', 'modal__close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', closeDialog);
    head.appendChild(close);
    content.appendChild(head);
    const body = el('div', 'modal__body');
    body.appendChild(el('p', 'sheet-clips__hint', 'A starter line is filled in for each score and skill. Edit it if you want, then Save. It is spoken with the ElevenLabs voice from Settings and kept on that button in this browser.'));

    async function rebuild() {
      body.querySelectorAll('.sheet-clips__group').forEach((node) => node.remove());
      const abilities = el('section', 'sheet-clips__group');
      abilities.appendChild(el('h3', 'sheet-clips__title', 'Ability scores'));
      for (const key of ABILITIES) {
        abilities.appendChild(await row(who, 'ability', key, key.toUpperCase(), rebuild));
      }
      body.appendChild(abilities);
      const skillGroup = el('section', 'sheet-clips__group');
      skillGroup.appendChild(el('h3', 'sheet-clips__title', 'Skills'));
      const names = (skills || []).map((name) => String(name || '').trim()).filter(Boolean);
      if (!names.length) {
        skillGroup.appendChild(el('p', 'sheet-clips__hint', 'No skills on the sheet yet.'));
      }
      for (const name of names) {
        skillGroup.appendChild(await row(who, 'skill', slug(name), name, rebuild));
      }
      body.appendChild(skillGroup);
      const host = document.getElementById('content');
      if (host) await decorate(host, who);
    }

    content.appendChild(body);
    modal.appendChild(content);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeDialog();
    });
    document.body.appendChild(modal);
    await rebuild();
  }

  window.SheetClips = {
    enabled: enabled,
    slug: slug,
    decorate: decorate,
    open: open,
    stop: stop,
  };
})();
