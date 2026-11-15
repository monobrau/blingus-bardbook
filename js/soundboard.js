/**
 * Table soundboard: tap pads play recorded CC0 clips from sounds/.
 * Kit follows the locked character (or Galen config).
 */
(function () {
  'use strict';

  const CFG = window.SoundboardConfig || {};
  const DEFAULT_VOL = 0.72;
  const loops = Object.create(null);
  const live = [];
  let lastHost = null;

  let customPads = [];
  let favoritePads = [];
  let renderToken = 0;
  let categories = [];

  function pads() {
    return favoritePads.concat(customPads);
  }

  function clipsToPads(characterId, clips) {
    if (!window.SoundboardClips || !Array.isArray(clips)) return [];
    return clips.map((clip) => ({
      id: 'clip:' + clip.id,
      clipId: clip.id,
      characterId: characterId,
      group: clip.category || 'Uncategorized',
      label: clip.label || 'Clip',
      icon: clip.icon || '🔊',
      src: window.SoundboardClips.fileUrl(characterId, clip.id),
      loop: !!clip.loop,
      custom: true,
      sourceTitle: clip.title || '',
      clipSource: clip.source || '',
      clipText: clip.title || '',
      clipVoiceId: clip.voiceId || '',
    }));
  }

  function shortText(text) {
    const t = String(text || '').trim();
    return t.length > 40 ? t.slice(0, 39) + '…' : t;
  }

  // Download through the API (path-validated file / favorite-file actions with download=1).
  async function downloadPad(pad) {
    const url = pad.favorite ? pad.downloadUrl : (pad.src ? pad.src + '&download=1' : null);
    const toast = (msg) => window.UIUtils?.showToast?.(msg);
    if (!url) {
      toast('No audio saved for this one yet. Play it first.');
      return;
    }
    try {
      const response = await fetch(url);
      const type = response.headers.get('Content-Type') || '';
      if (!response.ok || type.indexOf('audio') === -1) {
        toast(response.status === 404 ? 'No audio saved for this one yet. Play it first.' : 'Download failed');
        return;
      }
      const disposition = response.headers.get('Content-Disposition') || '';
      const star = disposition.match(/filename\*=UTF-8''([^;]+)/i);
      const plain = disposition.match(/filename="([^"]+)"/);
      let filename = (pad.label || 'clip') + '.mp3';
      try {
        if (star) filename = decodeURIComponent(star[1]);
        else if (plain) filename = plain[1];
      } catch (e) { /* keep fallback */ }
      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) {
      toast('Download failed');
    }
  }

  function favoritesToPads(favorites) {
    if (!Array.isArray(favorites)) return [];
    return favorites.map((fav) => ({
      id: 'favorite:' + fav.id,
      favoriteId: fav.id,
      characterId: window.BlingusSite?.themeCharacterId?.()
        || window.BlingusSite?.lockedCharacterId?.()
        || window.CharacterSheet?.getActiveId?.()
        || 'blingus',
      group: 'Favorites',
      label: fav.displayName || shortText(fav.text) || 'Favorite',
      icon: fav.icon || '⭐',
      displayName: fav.displayName || null,
      text: fav.text || '',
      audioFile: fav.audioFile || null,
      audioUrl: fav.audioUrl || null,
      downloadUrl: window.OutcomeFavorites?.downloadUrl?.(fav) || null,
      sourceTitle: fav.text || '',
      favorite: true,
    }));
  }

  function volKey() {
    if (CFG.kit === 'galen') return CFG.volKey || 'galenSoundboardVol';
    const characterId = window.BlingusSite?.themeCharacterId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || 'blingus';
    return characterId + 'SoundboardVol';
  }

  function loadVol() {
    try {
      const n = Number(localStorage.getItem(volKey()));
      if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
    } catch (e) { /* ignore */ }
    return DEFAULT_VOL;
  }

  function saveVol(n) {
    try { localStorage.setItem(volKey(), String(n)); } catch (e) { /* ignore */ }
  }

  function pruneLive() {
    for (let i = live.length - 1; i >= 0; i--) {
      const a = live[i];
      if (a.ended || a.paused) live.splice(i, 1);
    }
  }

  function playSrc(src, opts) {
    opts = opts || {};
    const a = new Audio(src);
    a.volume = loadVol();
    a.preload = 'auto';
    if (opts.loop) a.loop = true;
    const play = a.play();
    if (play && play.catch) play.catch(() => {});
    if (!opts.loop) live.push(a);
    return a;
  }

  function stopAudio(a) {
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
    } catch (e) { /* ignore */ }
  }

  function stopAll() {
    Object.keys(loops).forEach((id) => {
      stopAudio(loops[id]);
      delete loops[id];
    });
    live.forEach(stopAudio);
    live.length = 0;
    syncLoopButtons();
  }

  async function playPad(id) {
    const pad = pads().find((p) => p.id === id);
    if (!pad) return;
    pruneLive();
    
    if (pad.favorite) {
      if (pad.audioUrl) {
        playSrc(pad.audioUrl);
      } else if (pad.text && window.BlingusSpeak) {
        // Text-only favorite: speak it on an explicit tap, like the outcome card's speak button.
        window.BlingusSpeak.speak(pad.text).catch((err) => {
          window.UIUtils?.showToast?.(err?.message || 'Speech failed');
        });
      }
      return;
    }
    
    if (pad.clipSource === 'speech' && pad.clipText && window.SoundboardClips) {
      try {
        const audioUrl = await window.SoundboardClips.speakAndCache(
          pad.characterId,
          pad.clipId,
          pad.clipText,
          pad.clipVoiceId
        );
        if (pad.loop) {
          if (loops[id]) {
            stopAudio(loops[id]);
            delete loops[id];
          } else {
            loops[id] = playSrc(audioUrl, { loop: true });
          }
          syncLoopButtons();
        } else {
          playSrc(audioUrl);
        }
        return;
      } catch (e) {
        console.error('Speech generation failed:', e);
      }
    }
    
    if (pad.loop) {
      if (loops[id]) {
        stopAudio(loops[id]);
        delete loops[id];
      } else {
        loops[id] = playSrc(pad.src, { loop: true });
      }
      syncLoopButtons();
      return;
    }
    const src = pad.srcs
      ? pad.srcs[Math.floor(Math.random() * pad.srcs.length)]
      : pad.src;
    playSrc(src);
  }

  function syncLoopButtons() {
    if (!lastHost) return;
    lastHost.querySelectorAll('[data-sound-id]').forEach((btn) => {
      const id = btn.getAttribute('data-sound-id');
      btn.classList.toggle('is-looping', Boolean(loops[id]));
    });
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function paint(host, clipsData) {
    if (!host) return;
    lastHost = host;
    host.innerHTML = '';
    host.classList.add('content--soundboard');

    const characterId = window.BlingusSite?.themeCharacterId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || 'blingus';

    const root = el('div', 'soundboard');
    const head = el('div', 'soundboard__toolbar');
    head.appendChild(el('h2', 'soundboard__heading', 'Sound Board'));
    head.appendChild(el('p', 'soundboard__hint', 'Your custom clips and categories'));

    const controls = el('div', 'soundboard__controls');
    const volWrap = el('label', 'soundboard__vol');
    volWrap.appendChild(document.createTextNode('Vol'));
    const vol = document.createElement('input');
    vol.type = 'range';
    vol.min = '0';
    vol.max = '1';
    vol.step = '0.01';
    vol.value = String(loadVol());
    vol.addEventListener('input', () => {
      const n = Number(vol.value);
      saveVol(n);
      Object.keys(loops).forEach((id) => { loops[id].volume = n; });
      live.forEach((a) => { a.volume = n; });
    });
    volWrap.appendChild(vol);
    controls.appendChild(volWrap);
    const stopBtn = el('button', 'btn btn--secondary btn--compact', 'Stop');
    stopBtn.type = 'button';
    stopBtn.addEventListener('click', stopAll);
    controls.appendChild(stopBtn);
    
    if (window.SoundboardClips) {
      const manageBtn = el('button', 'btn btn--secondary btn--compact', 'Manage clips');
      manageBtn.type = 'button';
      manageBtn.addEventListener('click', () => {
        if (window.SoundboardClipManager) window.SoundboardClipManager.open(characterId);
      });
      controls.appendChild(manageBtn);
      
      const catBtn = el('button', 'btn btn--secondary btn--compact', 'Categories');
      catBtn.type = 'button';
      catBtn.addEventListener('click', () => {
        if (window.SoundboardCategoryManager) {
          window.SoundboardCategoryManager.open(characterId, clipsData || {});
        }
      });
      controls.appendChild(catBtn);
    }
    
    head.appendChild(controls);
    root.appendChild(head);

    const all = pads();
    const groups = [];
    all.forEach((pad) => {
      if (groups.indexOf(pad.group) === -1) groups.push(pad.group);
    });
    groups.forEach((name) => {
      const card = el('section', 'sheet-card soundboard__group');
      card.appendChild(el('h3', 'sheet-card__title', name));
      const grid = el('div', 'soundboard__grid');
      all.filter((p) => p.group === name).forEach((pad) => {
        const btn = el('button', 'soundboard__pad', '');
        btn.type = 'button';
        btn.setAttribute('data-sound-id', pad.id);
        if (pad.sourceTitle) btn.title = pad.sourceTitle;
        if (pad.loop) btn.setAttribute('aria-pressed', 'false');
        btn.appendChild(el('span', 'soundboard__pad-icon', pad.icon));
        btn.appendChild(el('span', 'soundboard__pad-label', pad.label));
        if (pad.loop) btn.appendChild(el('span', 'soundboard__pad-loop', 'loop'));
        btn.addEventListener('click', () => {
          playPad(pad.id);
          btn.classList.add('is-on');
          setTimeout(() => btn.classList.remove('is-on'), 160);
          if (pad.loop) btn.setAttribute('aria-pressed', loops[pad.id] ? 'true' : 'false');
        });
        if (!pad.custom && !pad.favorite) {
          grid.appendChild(btn);
          return;
        }
        const wrap = el('div', 'soundboard__pad-wrap');
        
        if (pad.favorite && window.OutcomeFavorites) {
          const edit = el('button', 'soundboard__pad-edit', '✏️');
          edit.type = 'button';
          edit.setAttribute('aria-label', 'Edit ' + pad.label);
          edit.title = 'Edit display name';
          edit.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const currentName = pad.displayName || '';
            const newName = prompt('Display name for this favorite (leave blank to show the line):', currentName);
            if (newName === null) return;
            window.OutcomeFavorites.updateDisplayName(pad.favoriteId, newName.trim()).then(() => {
              if (lastHost) render(lastHost);
              if (window.UIUtils && window.UIUtils.showToast) {
                window.UIUtils.showToast(newName.trim() ? 'Display name updated' : 'Display name cleared');
              }
            }).catch((err) => {
              if (window.UIUtils && window.UIUtils.showToast) {
                window.UIUtils.showToast(err.message || 'Could not update favorite');
              }
            });
          });
          wrap.appendChild(edit);
        }
        
        const remove = el('button', 'soundboard__pad-remove', '×');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove ' + pad.label);
        remove.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (!window.confirm('Remove ' + pad.label + '?')) return;
          if (pad.favorite && window.OutcomeFavorites) {
            window.OutcomeFavorites.remove(pad.favoriteId).then(() => {
              if (lastHost) render(lastHost);
            }).catch((err) => {
              if (window.UIUtils && window.UIUtils.showToast) {
                window.UIUtils.showToast(err.message || 'Could not remove favorite');
              }
            });
          } else if (pad.custom && window.SoundboardClips) {
            window.SoundboardClips.remove(pad.characterId, pad.clipId).then(() => {
              if (lastHost) render(lastHost);
            }).catch((err) => {
              if (window.UIUtils && window.UIUtils.showToast) {
                window.UIUtils.showToast(err.message || 'Could not remove clip');
              }
            });
          }
        });
        const download = el('button', 'soundboard__pad-download', '⬇');
        download.type = 'button';
        download.title = 'Download';
        download.setAttribute('aria-label', 'Download ' + pad.label);
        download.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          downloadPad(pad);
        });
        wrap.appendChild(btn);
        wrap.appendChild(remove);
        wrap.appendChild(download);
        grid.appendChild(wrap);
      });
      card.appendChild(grid);
      root.appendChild(card);
    });

    if (window.SoundboardClips) {
      const editor = el('section', 'sheet-card soundboard-clips');
      root.appendChild(editor);
      window.SoundboardClips.mount(editor, {
        characterId: characterId,
        categories: clipsData.categories || [],
        onSaved: () => { if (lastHost) render(lastHost); },
      });
    }

    if (pads().length === 0) {
      root.appendChild(el('p', 'soundboard__hint', 'No clips yet. Use the form above to add YouTube clips, sound effects, or spoken lines.'));
    }
    
    host.appendChild(root);
    syncLoopButtons();
  }

  function render(host) {
    if (!host) return;
    const token = ++renderToken;
    lastHost = host;
    const characterId = window.BlingusSite?.themeCharacterId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || 'blingus';
    host.innerHTML = '';
    host.classList.add('content--soundboard');
    host.appendChild(el('p', 'soundboard__hint', 'Loading clips…'));
    
    const finish = (clips, favorites, clipsData) => {
      if (token !== renderToken) return;
      categories = clipsData.categories || [];
      customPads = clipsToPads(characterId, clips);
      favoritePads = favoritesToPads(favorites);
      paint(host, clipsData);
    };
    
    const loadClips = window.SoundboardClips
      ? window.SoundboardClips.listWithCategories(characterId).catch(() => ({ clips: [], categories: [] }))
      : Promise.resolve({ clips: [], categories: [] });
    
    const loadFavorites = window.OutcomeFavorites
      ? window.OutcomeFavorites.list().catch(() => [])
      : Promise.resolve([]);
    
    Promise.all([loadClips, loadFavorites]).then(([clipsData, favorites]) => {
      finish(clipsData.clips || [], favorites, clipsData);
    }).catch(() => {
      finish([], [], { clips: [], categories: [] });
    });
  }

  document.addEventListener('blingus-character-change', () => {
    if (lastHost) render(lastHost);
  });

  window.Soundboard = {
    render: render,
    play: playPad,
    stopAll: stopAll,
  };
})();
