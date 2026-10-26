/**
 * Pull a YouTube audio clip, trim it, and save it on this character's soundboard.
 */
window.SoundboardClips = (function () {
  'use strict';

  const ENDPOINT = '/api/soundboard.php';
  const MIN_CLIP = 0.3;
  const MAX_CLIP = 45;
  const ICONS = ['🔊', '🎵', '🗣️', '📯', '⚔️', '🏹', '🔥', '⚡', '💥', '💀', '✨', '🎲'];
  const NAMES = {
    blingus: 'Blingus',
    vadania: 'Vadania',
    bruck: 'Bruck',
    puck: 'Puck',
    galen: 'Galen',
  };

  let mountGen = 0;

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

  async function readJson(res) {
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('The server returned an unexpected response.');
    }
    if (!res.ok || !data || data.success === false) {
      throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  async function apiGet(params) {
    const res = await fetch(ENDPOINT + '?' + withKey(params).toString(), {
      headers: authHeaders(),
    });
    return readJson(res);
  }

  async function apiPost(body) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return readJson(res);
  }

  function fileUrl(characterId, clipId) {
    return ENDPOINT + '?' + withKey({
      action: 'file',
      character: characterId,
      id: clipId,
    }).toString();
  }

  function previewUrl(videoId) {
    return ENDPOINT + '?' + withKey({ action: 'preview', id: videoId }).toString();
  }

  async function list(characterId) {
    const data = await apiGet({ action: 'list', character: characterId });
    return Array.isArray(data.clips) ? data.clips : [];
  }

  function remove(characterId, clipId) {
    return apiPost({ action: 'delete', character: characterId, id: clipId });
  }

  function toast(msg) {
    if (window.UIUtils && window.UIUtils.showToast) {
      window.UIUtils.showToast(msg);
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function validVideoId(id) {
    return /^[a-zA-Z0-9_-]{11}$/.test(id || '');
  }

  function formatTime(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(s / 60);
    const rem = (s - m * 60).toFixed(1).padStart(4, '0');
    return m + ':' + rem;
  }

  function formatDuration(seconds) {
    if (seconds == null || !isFinite(seconds)) return '';
    const s = Math.max(0, Math.round(seconds));
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function clipLabel(title) {
    const clean = String(title || '').replace(/\s+/g, ' ').trim();
    if (!clean) return 'Clip';
    return clean.length > 40 ? clean.slice(0, 40).trim() : clean;
  }

  function mount(host, opts) {
    if (!host) return;
    const gen = ++mountGen;
    const characterId = (opts && opts.characterId) || 'blingus';
    const who = NAMES[characterId] || characterId;
    host.innerHTML = '';

    const title = el('h3', 'sheet-card__title', 'Pull a YouTube clip');
    const hint = el('p', 'soundboard__hint', 'Search, trim the part you want, then add it to ' + who + '\'s board. The clip is saved on this server. 45 seconds max.');
    const status = el('p', 'soundboard-clips__status', 'Checking the server…');
    status.setAttribute('aria-live', 'polite');
    host.appendChild(title);
    host.appendChild(hint);
    host.appendChild(status);

    const searchForm = el('form', 'soundboard-clips__search');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search YouTube';
    searchInput.setAttribute('aria-label', 'Search YouTube');
    searchInput.disabled = true;
    const searchBtn = el('button', 'btn btn--secondary', 'Search');
    searchBtn.type = 'submit';
    searchBtn.disabled = true;
    searchForm.appendChild(searchInput);
    searchForm.appendChild(searchBtn);
    host.appendChild(searchForm);

    const results = el('div', 'soundboard-clips__results');
    host.appendChild(results);
    const trimHost = el('div', 'soundboard-clips__trim');
    host.appendChild(trimHost);

    let ready = false;
    let lastResults = [];

    function setBusy(busy, message) {
      searchInput.disabled = busy || !ready;
      searchBtn.disabled = busy || !ready;
      if (message) status.textContent = message;
    }

    apiGet({ action: 'ping' }).then((data) => {
      if (gen !== mountGen) return;
      if (!data.ytdlp || !data.ffmpeg || !data.ffprobe) {
        status.textContent = 'This server needs yt-dlp, ffmpeg, and ffprobe before it can pull YouTube audio.';
        return;
      }
      ready = true;
      searchInput.disabled = false;
      searchBtn.disabled = false;
      status.textContent = 'Search for a video, then pull its audio so you can trim it.';
    }).catch((err) => {
      if (gen !== mountGen) return;
      status.textContent = err.message === 'Unauthorized'
        ? 'The server refused the soundboard request. Add the API key in this browser if the server requires one.'
        : 'Clip saving is not available on this server yet.';
    });

    searchForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const q = searchInput.value.trim();
      if (!q) {
        status.textContent = 'Type something to search for.';
        return;
      }
      trimHost.innerHTML = '';
      results.innerHTML = '';
      setBusy(true, 'Searching YouTube…');
      apiGet({ action: 'search', q: q }).then((data) => {
        if (gen !== mountGen) return;
        lastResults = (data.results || []).filter((row) => validVideoId(row.id));
        setBusy(false, lastResults.length ? 'Pick a video to pull its audio.' : 'No results. Try another search.');
        renderResults(lastResults);
      }).catch((err) => {
        if (gen !== mountGen) return;
        setBusy(false, err.message || 'YouTube search failed.');
      });
    });

    function renderResults(rows) {
      results.innerHTML = '';
      rows.forEach((row) => {
        const item = el('div', 'soundboard-clips__result');
        if (validVideoId(row.id)) {
          const thumb = document.createElement('img');
          thumb.className = 'soundboard-clips__thumb';
          thumb.alt = '';
          thumb.src = 'https://i.ytimg.com/vi/' + row.id + '/hqdefault.jpg';
          thumb.addEventListener('error', () => { thumb.remove(); });
          item.appendChild(thumb);
        }
        const info = el('div', 'soundboard-clips__info');
        info.appendChild(el('div', 'soundboard-clips__title', row.title || 'Untitled'));
        const meta = [row.channel, formatDuration(row.duration)].filter(Boolean).join(' · ');
        if (meta) info.appendChild(el('div', 'soundboard-clips__meta', meta));
        item.appendChild(info);
        const pull = el('button', 'btn btn--secondary soundboard-clips__pull', 'Pull audio');
        pull.type = 'button';
        pull.addEventListener('click', () => pullAudio(row));
        item.appendChild(pull);
        results.appendChild(item);
      });
    }

    function pullAudio(row) {
      results.querySelectorAll('button').forEach((btn) => { btn.disabled = true; });
      setBusy(true, 'Pulling audio. This can take a minute.');
      apiPost({ action: 'prepare', videoId: row.id }).then((data) => {
        if (gen !== mountGen) return;
        setBusy(false, 'Audio is on the server. Trim it, then add it to the board.');
        results.innerHTML = '';
        showTrimmer(row, data.duration);
      }).catch((err) => {
        if (gen !== mountGen) return;
        setBusy(false, err.message || 'Could not pull that audio.');
        renderResults(lastResults);
      });
    }

    function showTrimmer(row, duration) {
      trimHost.innerHTML = '';
      const dur = Number(duration);
      if (!isFinite(dur) || dur < MIN_CLIP) {
        status.textContent = 'That audio is too short to clip.';
        return;
      }

      let start = 0;
      let end = Math.min(dur, Math.min(8, MAX_CLIP));
      if (end - start < MIN_CLIP) end = Math.min(dur, start + MIN_CLIP);
      let previewing = false;
      let icon = ICONS[0];

      const picked = el('div', 'soundboard-clips__picked', row.title || 'Untitled');
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'auto';
      audio.src = previewUrl(row.id);
      audio.className = 'soundboard-clips__audio';

      const startLabel = el('label', 'soundboard-clips__slider');
      startLabel.appendChild(document.createTextNode('Start'));
      const startInput = document.createElement('input');
      startInput.type = 'range';
      startInput.min = '0';
      startInput.max = String(dur);
      startInput.step = '0.1';
      startInput.value = String(start);
      startInput.setAttribute('aria-label', 'Clip start');
      const startRead = el('span', 'soundboard-clips__time', formatTime(start));
      startLabel.appendChild(startInput);
      startLabel.appendChild(startRead);

      const endLabel = el('label', 'soundboard-clips__slider');
      endLabel.appendChild(document.createTextNode('End'));
      const endInput = document.createElement('input');
      endInput.type = 'range';
      endInput.min = '0';
      endInput.max = String(dur);
      endInput.step = '0.1';
      endInput.value = String(end);
      endInput.setAttribute('aria-label', 'Clip end');
      const endRead = el('span', 'soundboard-clips__time', formatTime(end));
      endLabel.appendChild(endInput);
      endLabel.appendChild(endRead);

      const selection = el('p', 'soundboard-clips__selection', '');

      function clamp(nextStart, nextEnd) {
        let s = Math.min(Math.max(0, nextStart), Math.max(0, dur - MIN_CLIP));
        let e = Math.min(Math.max(s + MIN_CLIP, nextEnd), Math.min(dur, s + MAX_CLIP));
        if (e - s < MIN_CLIP) {
          e = Math.min(dur, s + MIN_CLIP);
          s = Math.max(0, e - MIN_CLIP);
        }
        if (e - s > MAX_CLIP) e = s + MAX_CLIP;
        return [s, e];
      }

      function paintRange() {
        startInput.value = String(start);
        endInput.value = String(end);
        startRead.textContent = formatTime(start);
        endRead.textContent = formatTime(end);
        const length = Math.max(0, end - start);
        selection.textContent = 'Selection ' + length.toFixed(1) + 's';
      }

      function setRange(nextStart, nextEnd) {
        const pair = clamp(nextStart, nextEnd);
        start = pair[0];
        end = pair[1];
        paintRange();
      }

      startInput.addEventListener('input', () => setRange(Number(startInput.value), end));
      endInput.addEventListener('input', () => setRange(start, Number(endInput.value)));

      const markRow = el('div', 'soundboard-clips__marks');
      const setIn = el('button', 'btn btn--secondary btn--compact', 'Set in');
      const setOut = el('button', 'btn btn--secondary btn--compact', 'Set out');
      const playSel = el('button', 'btn btn--secondary btn--compact', 'Play selection');
      setIn.type = 'button';
      setOut.type = 'button';
      playSel.type = 'button';
      setIn.addEventListener('click', () => {
        const t = audio.currentTime || 0;
        if (t >= end - MIN_CLIP) setRange(t, Math.min(dur, t + Math.min(8, MAX_CLIP)));
        else setRange(t, end);
      });
      setOut.addEventListener('click', () => {
        const t = audio.currentTime || 0;
        if (t <= start + MIN_CLIP) setRange(Math.max(0, t - Math.min(8, MAX_CLIP)), Math.max(t, MIN_CLIP));
        else setRange(start, t);
      });
      playSel.addEventListener('click', () => {
        previewing = true;
        try {
          audio.currentTime = start;
        } catch (e) { /* ignore */ }
        audio.play().catch(() => { previewing = false; });
      });
      audio.addEventListener('timeupdate', () => {
        if (!previewing) return;
        if (audio.currentTime >= end - 0.03) {
          previewing = false;
          audio.pause();
        }
      });
      markRow.appendChild(setIn);
      markRow.appendChild(setOut);
      markRow.appendChild(playSel);

      const nameRow = el('label', 'soundboard-clips__name');
      nameRow.appendChild(document.createTextNode('Name'));
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.maxLength = 40;
      nameInput.value = clipLabel(row.title);
      nameInput.setAttribute('aria-label', 'Clip name');
      nameRow.appendChild(nameInput);

      const iconRow = el('div', 'soundboard-clips__icons');
      ICONS.forEach((glyph) => {
        const btn = el('button', 'soundboard-clips__icon' + (glyph === icon ? ' is-on' : ''), glyph);
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Icon ' + glyph);
        btn.setAttribute('aria-pressed', glyph === icon ? 'true' : 'false');
        btn.addEventListener('click', () => {
          icon = glyph;
          iconRow.querySelectorAll('button').forEach((other) => {
            const on = other === btn;
            other.classList.toggle('is-on', on);
            other.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
        });
        iconRow.appendChild(btn);
      });

      const loopLabel = el('label', 'soundboard-clips__loop');
      const loopInput = document.createElement('input');
      loopInput.type = 'checkbox';
      loopLabel.appendChild(loopInput);
      loopLabel.appendChild(document.createTextNode(' Loop until tapped again'));

      const saveRow = el('div', 'soundboard-clips__save');
      const saveBtn = el('button', 'btn', 'Add to board');
      saveBtn.type = 'button';
      const backBtn = el('button', 'btn btn--secondary', 'Back to results');
      backBtn.type = 'button';
      backBtn.addEventListener('click', () => {
        previewing = false;
        audio.pause();
        trimHost.innerHTML = '';
        renderResults(lastResults);
        status.textContent = 'Pick a video to pull its audio.';
      });
      saveBtn.addEventListener('click', () => {
        saveBtn.disabled = true;
        status.textContent = 'Saving clip…';
        previewing = false;
        audio.pause();
        apiPost({
          action: 'save',
          character: characterId,
          videoId: row.id,
          start: Math.round(start * 1000) / 1000,
          end: Math.round(end * 1000) / 1000,
          label: nameInput.value,
          icon: icon,
          loop: loopInput.checked,
          title: row.title || '',
        }).then(() => {
          if (gen !== mountGen) return;
          toast('Added to the board');
          if (opts && opts.onSaved) opts.onSaved();
        }).catch((err) => {
          if (gen !== mountGen) return;
          saveBtn.disabled = false;
          status.textContent = err.message || 'Could not save that clip.';
        });
      });
      saveRow.appendChild(saveBtn);
      saveRow.appendChild(backBtn);

      audio.addEventListener('error', () => {
        status.textContent = 'Could not play the pulled audio.';
      });

      trimHost.appendChild(picked);
      trimHost.appendChild(audio);
      trimHost.appendChild(startLabel);
      trimHost.appendChild(endLabel);
      trimHost.appendChild(selection);
      trimHost.appendChild(markRow);
      trimHost.appendChild(nameRow);
      trimHost.appendChild(iconRow);
      trimHost.appendChild(loopLabel);
      trimHost.appendChild(saveRow);
      paintRange();
    }
  }

  return {
    list: list,
    remove: remove,
    fileUrl: fileUrl,
    mount: mount,
  };
})();
