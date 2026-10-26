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

  const S = {
    slash: 'sounds/slash.ogg',
    chop: 'sounds/chop.ogg',
    clash: 'sounds/clash.ogg',
    thud: 'sounds/thud.ogg',
    crit: 'sounds/crit.ogg',
    bow: 'sounds/bow.wav',
    block: 'sounds/block.ogg',
    parry: 'sounds/parry.wav',
    smite: 'sounds/smite.ogg',
    thunder: 'sounds/thunder.ogg',
    fire: 'sounds/fire.ogg',
    ice: 'sounds/ice.ogg',
    whoosh: 'sounds/whoosh.wav',
    horn: 'sounds/horn.ogg',
    drums: 'sounds/drums.ogg',
    downed: 'sounds/downed.ogg',
    panther: 'sounds/panther.ogg',
    undead: 'sounds/undead.mp3',
  };
  const CRIES = ['sounds/fluch1.mp3', 'sounds/fluch2.mp3', 'sounds/fluch3.mp3', 'sounds/fluch4.mp3', 'sounds/fluch5.mp3', 'sounds/fluch6.mp3'];

  const KITS = {
    blingus: {
      title: 'Bardboard',
      hint: 'Blingus kit: flourishes, fanfare, and a little steel. Fanfare loops until you tap it again.',
      pads: [
        { id: 'flourish', group: 'Song', label: 'Flourish', icon: '🎵', src: S.whoosh },
        { id: 'sting', group: 'Song', label: 'Sting', icon: '✨', src: S.clash },
        { id: 'horn', group: 'Song', label: 'Horn', icon: '📯', src: S.horn },
        { id: 'drums', group: 'Song', label: 'Fanfare', icon: '🎺', src: S.drums, loop: true },
        { id: 'dagger', group: 'Steel', label: 'Dagger', icon: '🗡️', src: S.slash },
        { id: 'bow', group: 'Steel', label: 'Shortbow', icon: '🏹', src: S.bow },
        { id: 'crit', group: 'Table', label: 'Nat 20', icon: '⭐', src: S.crit },
        { id: 'panther', group: 'Table', label: 'Sex Panther', icon: '🐆', src: S.panther },
        { id: 'undead', group: 'Table', label: 'Undead ×2', icon: '🤓', src: S.undead },
        { id: 'downed', group: 'Table', label: 'Downed', icon: '💀', src: S.downed },
      ],
    },
    vadania: {
      title: 'Trail sounds',
      hint: 'Vadania kit: the bow first, then steel and the stolen horn.',
      pads: [
        { id: 'bow', group: 'Bow', label: 'Longbow', icon: '🏹', src: S.bow },
        { id: 'arrow', group: 'Bow', label: 'Arrow', icon: '➡️', src: S.whoosh },
        { id: 'crit', group: 'Bow', label: 'Redeemed shot', icon: '⭐', src: S.crit },
        { id: 'slash', group: 'Steel', label: 'Shortsword', icon: '⚔️', src: S.slash },
        { id: 'block', group: 'Steel', label: 'Block', icon: '🛡️', src: S.block },
        { id: 'thud', group: 'Steel', label: 'Thud', icon: '💥', src: S.thud },
        { id: 'horn', group: 'Trail', label: "Elidon's horn", icon: '📯', src: S.horn },
        { id: 'panther', group: 'Trail', label: 'Sex Panther', icon: '🐆', src: S.panther },
        { id: 'undead', group: 'Trail', label: 'Undead ×2', icon: '🤓', src: S.undead },
        { id: 'downed', group: 'Trail', label: 'Downed', icon: '💀', src: S.downed },
      ],
    },
    bruck: {
      title: 'Brawl sounds',
      hint: 'Brawn kit: fists, staff, and a ki step. No magic pads.',
      pads: [
        { id: 'punch', group: 'Fists', label: 'Punch', icon: '👊', src: S.thud },
        { id: 'staff', group: 'Fists', label: 'Staff', icon: '🪵', src: S.clash },
        { id: 'crit', group: 'Fists', label: 'Stunning hit', icon: '⭐', src: S.crit },
        { id: 'block', group: 'Guard', label: 'Patient', icon: '🛡️', src: S.block },
        { id: 'parry', group: 'Guard', label: 'Parry', icon: '🔔', src: S.parry },
        { id: 'whoosh', group: 'Guard', label: 'Step of the Wind', icon: '💨', src: S.whoosh },
        { id: 'panther', group: 'Table', label: 'Sex Panther', icon: '🐆', src: S.panther },
        { id: 'undead', group: 'Table', label: 'Undead ×2', icon: '🤓', src: S.undead },
        { id: 'downed', group: 'Table', label: 'Downed', icon: '💀', src: S.downed },
      ],
    },
    puck: {
      title: 'Surge sounds',
      hint: 'Puck kit: fire, thunder, ice, and a fly-by. No sword pads.',
      pads: [
        { id: 'fire', group: 'Chaos', label: 'Fireball', icon: '🔥', src: S.fire },
        { id: 'thunder', group: 'Chaos', label: 'Shatter', icon: '⚡', src: S.thunder },
        { id: 'ice', group: 'Chaos', label: 'Ice', icon: '❄️', src: S.ice },
        { id: 'whoosh', group: 'Chaos', label: 'Fly', icon: '🧚', src: S.whoosh },
        { id: 'sting', group: 'Spark', label: 'Spark', icon: '✨', src: S.clash },
        { id: 'block', group: 'Spark', label: 'Shield', icon: '🛡️', src: S.block },
        { id: 'crit', group: 'Table', label: 'Surge crit', icon: '⭐', src: S.crit },
        { id: 'panther', group: 'Table', label: 'Sex Panther', icon: '🐆', src: S.panther },
        { id: 'undead', group: 'Table', label: 'Undead ×2', icon: '🤓', src: S.undead },
        { id: 'downed', group: 'Table', label: 'Downed', icon: '💀', src: S.downed },
      ],
    },
    galen: {
      title: 'Halbmast sounds',
      hint: 'Battle clips, plus guttural German swears. Fanfare loops until you tap it again.',
      pads: [
        { id: 'slash', group: 'Blade', label: 'Slash', icon: '⚔️', src: S.slash },
        { id: 'crit', group: 'Blade', label: 'Crit', icon: '⭐', src: S.crit },
        { id: 'thud', group: 'Blade', label: 'Thud', icon: '💥', src: S.thud },
        { id: 'smite', group: 'Oath', label: 'Divine Smite', icon: '☀️', src: S.smite },
        { id: 'thunder', group: 'Oath', label: 'Thunder', icon: '⚡', src: S.thunder },
        { id: 'block', group: 'Oath', label: 'Block', icon: '🛡️', src: S.block },
        { id: 'parry', group: 'Oath', label: 'Parry', icon: '🔔', src: S.parry },
        { id: 'horn', group: 'Table', label: 'Horn', icon: '📯', src: S.horn },
        { id: 'drums', group: 'Table', label: 'Fanfare', icon: '🥁', src: S.drums, loop: true },
        { id: 'panther', group: 'Table', label: 'Sex Panther', icon: '🐆', src: S.panther },
        { id: 'undead', group: 'Table', label: 'Undead ×2', icon: '🤓', src: S.undead },
        { id: 'downed', group: 'Table', label: 'Downed', icon: '💀', src: S.downed },
        { id: 'cryWar', group: 'Flüche', label: 'Scheiße', icon: '🗣️', src: 'sounds/fluch1.mp3' },
        { id: 'cryCharge', group: 'Flüche', label: 'Verdammt', icon: '💢', src: 'sounds/fluch2.mp3' },
        { id: 'cryRage', group: 'Flüche', label: 'Fick dich', icon: '😤', src: 'sounds/fluch3.mp3' },
        { id: 'cryRoar', group: 'Flüche', label: 'Arschloch', icon: '🦁', src: 'sounds/fluch4.mp3' },
        { id: 'cryAny', group: 'Flüche', label: 'Any fluch', icon: '🎲', srcs: CRIES },
      ],
    },
  };

  function kitId() {
    if (CFG.kit && KITS[CFG.kit]) return CFG.kit;
    const who = window.BlingusSite?.themeCharacterId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || '';
    if (who === 'bruck') return 'bruck';
    if (KITS[who]) return who;
    return 'blingus';
  }

  function kit() {
    return KITS[kitId()] || KITS.blingus;
  }

  let customPads = [];
  let renderToken = 0;

  function pads() {
    return customPads.concat(kit().pads);
  }

  function clipsToPads(characterId, clips) {
    if (!window.SoundboardClips || !Array.isArray(clips)) return [];
    return clips.map((clip) => ({
      id: 'clip:' + clip.id,
      clipId: clip.id,
      characterId: characterId,
      group: 'Your clips',
      label: clip.label || 'Clip',
      icon: clip.icon || '🔊',
      src: window.SoundboardClips.fileUrl(characterId, clip.id),
      loop: !!clip.loop,
      custom: true,
      sourceTitle: clip.title || '',
    }));
  }

  function volKey() {
    if (CFG.kit === 'galen') return CFG.volKey || 'galenSoundboardVol';
    return kitId() + 'SoundboardVol';
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

  function playPad(id) {
    const pad = pads().find((p) => p.id === id);
    if (!pad) return;
    pruneLive();
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

  function paint(host) {
    if (!host) return;
    lastHost = host;
    host.innerHTML = '';
    host.classList.add('content--soundboard');

    const current = kit();
    const root = el('div', 'soundboard');
    const head = el('div', 'soundboard__toolbar');
    head.appendChild(el('h2', 'soundboard__heading', current.title));
    head.appendChild(el('p', 'soundboard__hint', current.hint));

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
        if (!pad.custom) {
          grid.appendChild(btn);
          return;
        }
        const wrap = el('div', 'soundboard__pad-wrap');
        const remove = el('button', 'soundboard__pad-remove', '×');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove ' + pad.label);
        remove.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (!window.confirm('Remove ' + pad.label + ' from this board?')) return;
          window.SoundboardClips.remove(pad.characterId, pad.clipId).then(() => {
            if (lastHost) render(lastHost);
          }).catch((err) => {
            if (window.UIUtils && window.UIUtils.showToast) {
              window.UIUtils.showToast(err.message || 'Could not remove clip');
            }
          });
        });
        wrap.appendChild(btn);
        wrap.appendChild(remove);
        grid.appendChild(wrap);
      });
      card.appendChild(grid);
      root.appendChild(card);
    });

    if (window.SoundboardClips) {
      const editor = el('section', 'sheet-card soundboard-clips');
      root.appendChild(editor);
      window.SoundboardClips.mount(editor, {
        characterId: kitId(),
        onSaved: () => { if (lastHost) render(lastHost); },
      });
    }

    root.appendChild(el('p', 'soundboard__hint', 'Built-in pads stay with the book. Clips you add are saved on this server for this character.'));
    host.appendChild(root);
    syncLoopButtons();
  }

  function render(host) {
    if (!host) return;
    const token = ++renderToken;
    lastHost = host;
    const id = kitId();
    host.innerHTML = '';
    host.classList.add('content--soundboard');
    host.appendChild(el('p', 'soundboard__hint', 'Loading sounds…'));
    const finish = (clips) => {
      if (token !== renderToken) return;
      customPads = clipsToPads(id, clips);
      paint(host);
    };
    if (!window.SoundboardClips) {
      finish([]);
      return;
    }
    window.SoundboardClips.list(id).then(finish).catch(() => finish([]));
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
