/**
 * Per-host branding and character lock.
 * blingus.knospe.org stays the bard book. The other party books are their own sites.
 * localhost / LAN keep the switcher for local work.
 */
window.BlingusSite = (function () {
  'use strict';

  const SITES = {
    'blingus.knospe.org': {
      id: 'blingus',
      lockCharacter: 'blingus',
      title: "Blingus's Bardbook",
      subtitle: 'Song parodies, bardic lines, and Claude-backed table lines',
      crests: ['⚔️', '🛡️'],
      tabIcon: '🧚',
      showSwitcher: false,
    },
    'vadania.knospe.org': {
      id: 'vadania',
      lockCharacter: 'vadania',
      title: "Vadania's Trailbook",
      subtitle: 'Ranger marks, trail beats, and Claude-backed table lines',
      crests: ['🏹', '🌲'],
      tabIcon: '🏹',
      showSwitcher: false,
    },
    'brawn.knospe.org': {
      id: 'brawn',
      lockCharacter: 'bruck',
      title: "Brawn's Brawlbook",
      subtitle: 'Monk strikes, ki beats, and Claude-backed table lines',
      crests: ['👊', '⛰️'],
      tabIcon: '👊',
      showSwitcher: false,
    },
    'bruck.knospe.org': {
      id: 'bruck',
      lockCharacter: 'bruck',
      title: "Brawn's Brawlbook",
      subtitle: 'Monk strikes, ki beats, and Claude-backed table lines',
      crests: ['👊', '⛰️'],
      tabIcon: '👊',
      showSwitcher: false,
    },
    'puck.knospe.org': {
      id: 'puck',
      lockCharacter: 'puck',
      title: "Puck's Surgebook",
      subtitle: 'Wild Magic surges, fairy mischief, and Claude-backed table lines',
      crests: ['✨', '🌀'],
      tabIcon: '✨',
      showSwitcher: false,
    },
  };

  const LOCAL = {
    id: 'local',
    lockCharacter: null,
    title: "Blingus's Bardbook",
    subtitle: 'Song parodies, bardic lines, and Claude-backed table lines',
    crests: ['⚔️', '🛡️'],
    tabIcon: '🧚',
    showSwitcher: true,
  };

  function hostName() {
    return String(window.location && window.location.hostname || '').toLowerCase();
  }

  function current() {
    return SITES[hostName()] || LOCAL;
  }

  function lockedCharacterId() {
    return window.__blingusLock || current().lockCharacter || null;
  }

  const THEME_CLASSES = [
    'book-blingus', 'book-vadania', 'book-bruck', 'book-puck',
    'blingus-book', 'vadania-book', 'brawn-book', 'puck-book',
  ];

  function themeCharacterId() {
    const locked = lockedCharacterId();
    if (locked) return locked;
    return window.CharacterSheet?.getActiveId?.() || 'blingus';
  }

  function applyTheme() {
    const id = themeCharacterId();
    const book = {
      blingus: 'book-blingus',
      vadania: 'book-vadania',
      bruck: 'book-bruck',
      puck: 'book-puck',
    }[id] || 'book-blingus';
    THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.add(book);
    if (id === 'blingus') document.body.classList.add('blingus-book');
    if (id === 'vadania') document.body.classList.add('vadania-book');
    if (id === 'bruck') document.body.classList.add('brawn-book');
    if (id === 'puck') document.body.classList.add('puck-book');
  }

  const FX_KEY = 'blingusPartyFxV1';

  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function fxEnabled() {
    if (reducedMotion()) return false;
    try {
      return localStorage.getItem(FX_KEY) !== 'off';
    } catch (e) {
      return true;
    }
  }

  function syncFxButton(btn) {
    const node = btn || document.getElementById('partyFxBtn');
    if (!node) return;
    const on = fxEnabled();
    const reduced = reducedMotion();
    node.classList.toggle('is-active', on);
    node.textContent = on ? 'FX on' : 'FX off';
    node.setAttribute('aria-pressed', on ? 'true' : 'false');
    node.disabled = reduced;
    node.title = reduced
      ? 'Visual effects stay off while reduced motion is enabled'
      : 'Critters, punches, runes, and wild-magic sparkles';
  }

  function setFxEnabled(on) {
    try {
      localStorage.setItem(FX_KEY, on ? 'on' : 'off');
    } catch (e) {
      /* ignore */
    }
    document.body.classList.toggle('party-fx-off', !on || reducedMotion());
    syncFxButton();
    applyTheme();
    try {
      window.dispatchEvent(new CustomEvent('blingus-fx-toggle', { detail: { enabled: fxEnabled() } }));
    } catch (e) {
      /* ignore */
    }
  }

  function bindFxToggle(btn) {
    const node = btn || document.getElementById('partyFxBtn');
    if (!node || node.dataset.partyFxBound === '1') return;
    node.dataset.partyFxBound = '1';
    syncFxButton(node);
    node.addEventListener('click', () => {
      if (reducedMotion()) return;
      setFxEnabled(!fxEnabled());
    });
  }

  function applyChrome() {
    const site = current();
    document.title = site.title;
    const h1 = document.querySelector('.banner h1');
    if (h1) h1.textContent = site.title;
    const crests = document.querySelectorAll('.banner .crest');
    if (crests[0]) crests[0].textContent = site.crests[0];
    if (crests[1]) crests[1].textContent = site.crests[1];
    const sub = document.getElementById('bannerSubtitle');
    if (sub && !site.showSwitcher) sub.textContent = site.subtitle;
    const switcher = document.getElementById('characterSwitcherRow');
    if (switcher) switcher.hidden = !site.showSwitcher;
    const tabIcon = document.querySelector('#characterTabLabel')
      && document.querySelector('[data-section="character"] .tab__icon');
    if (tabIcon) tabIcon.textContent = site.tabIcon;
    applyTheme();
    bindFxToggle();
    document.body.classList.toggle('party-fx-off', !fxEnabled());
  }

  document.addEventListener('blingus-character-change', applyTheme);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyChrome);
  } else {
    applyChrome();
  }

  return {
    SITES,
    current,
    lockedCharacterId,
    applyChrome,
    applyTheme,
    themeCharacterId,
    fxEnabled,
    setFxEnabled,
    bindFxToggle,
  };
})();
