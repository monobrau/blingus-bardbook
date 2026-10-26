/**
 * Cumulative what's-new banner.
 *
 * STANDING RULE: when you add a feature to the app, push a new entry here.
 * Never reuse or edit an old id. Same-day updates stack: users who have not
 * dismissed yet see every unseen entry in one banner. Users who already
 * tapped Got it only see newer ids.
 *
 * Id format: YYYY-MM-DD-letter-slug  (letter keeps same-day order stable).
 * who: null = every book. Or ['blingus'], ['puck'], ['bruck'], ['vadania'].
 * Do not mark an id seen until the user taps Got it.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusWhatsNewSeenV2';

  const UPDATES = [
    {
      id: '2026-08-20-a-session3-notes',
      date: '2026-08-20',
      who: null,
      lines: [
        'Session 3 notes are live: Lamorna, Elidon\'s horn, Amadore, the shore attacker. Unsolved Loomlurch leftovers stay unsolved.',
      ],
    },
    {
      id: '2026-08-20-b-lane-chips',
      date: '2026-08-20',
      who: null,
      linesByWho: {
        blingus: 'Your Roleplay chips: Forgot their names, Bathe the curse, Supervise the oven, Costume neck.',
        puck: 'Your Roleplay chips: Granny\'s head, Stay at 30 feet, Careful Fireball, Costume head.',
        bruck: 'Your Roleplay chips: Costume rear, Tanked it, Can\'t breathe, Oh well.',
        vadania: 'Your Roleplay chips: Took the rear, Redeem the shot, Write it down, Watch the mist.',
      },
      lines: [
        'On Outcomes, tap Roleplay or Meanwhile. Shared chips: Unconscious attacker, The token, Find Amadore, Symbolic eclipse.',
      ],
    },
    {
      id: '2026-08-20-c-changelog',
      date: '2026-08-20',
      who: null,
      lines: [
        'News in the toolbar (and Settings > Changelog) keeps every past update toast. Same-day ships stack. Got it only hides the new ones.',
      ],
    },
    {
      id: '2026-08-20-d-humor-slider',
      date: '2026-08-20',
      who: null,
      lines: [
        'Humor slider is back under Mood (1 Straight through 5 Full bit). Dragging it no longer slams the Mood step shut. How adult? chips stay put too.',
      ],
    },
    {
      id: '2026-08-20-e-outcome-hints',
      date: '2026-08-20',
      who: null,
      lines: [
        'Hover Roleplay, Meanwhile, or any Spoken chip for when to use it. Roleplay is a do-this beat. Spoken is a say-this bit.',
      ],
    },
    {
      id: '2026-08-20-f-yelp-stars',
      date: '2026-08-20',
      who: null,
      lines: [
        'Yelp Review has the 1 to 5 star picker again. Every generated review uses the stars you picked.',
      ],
    },
    {
      id: '2026-08-20-g-bardic-hooks',
      date: '2026-08-20',
      who: ['blingus'],
      lines: [
        'Bardic lines were rewritten so they actually sing to the real hooks, not generic dice captions. New Generate drafts have to match the song\'s rhythm too.',
      ],
    },
    {
      id: '2026-08-22-a-carnival-names',
      date: '2026-08-22',
      who: null,
      lines: [
        'Chapter 1 recap is named now: Ellywick bought the tickets, Dirlagraun kept the watch, Burly tipped the heist, Puck was Witchlight Monarch. Hall of Illusions rhyme is live.',
      ],
    },
    {
      id: '2026-08-22-b-storytime',
      date: '2026-08-22',
      who: ['blingus'],
      lines: [
        'Storytime is a Spoken chip: invent a tale and tell it. Campfire, tavern yarn, tall tale, bedtime, excuse, the moral. Not Previously On.',
      ],
    },
    {
      id: '2026-08-22-c-story-knot',
      date: '2026-08-22',
      who: ['blingus'],
      lines: [
        'Story-Knot is on the sheet: one-use common wondrous. Untie it before Performance or Persuasion for Advantage, then it unravels.',
      ],
    },
    {
      id: '2026-08-22-d-endelyn-theater',
      date: '2026-08-22',
      who: null,
      lines: [
        'Prismeer now has Endelyn\'s theater: mountain-top stage in Yon, puppets, the hag herself as a foe chip. Generate writes to that house. No unpublished rooms.',
      ],
    },
    {
      id: '2026-10-25-a-soundboard',
      date: '2026-10-25',
      who: null,
      lines: [
        'Sounds tab: recorded battle clips (slash, smite, thunder, horn). Fanfare loops until you tap it again.',
      ],
    },
    {
      id: '2026-10-25-b-soundboard-kits',
      date: '2026-10-25',
      who: null,
      linesByWho: {
        blingus: 'Sounds tab is your bard kit now: flourish, sting, horn, fanfare, dagger, shortbow.',
        vadania: 'Sounds tab is your trail kit now: longbow, arrow, shortsword, Elidon\'s horn.',
        bruck: 'Sounds tab is your brawl kit now: punch, staff, patient guard, Step of the Wind.',
        puck: 'Sounds tab is your surge kit now: fireball, shatter, ice, fly. No sword pads.',
      },
      lines: [
        'Each book has its own Sounds kit. Same recorded clips, different pads per character.',
      ],
    },
    {
      id: '2026-10-25-c-sex-panther',
      date: '2026-10-25',
      who: null,
      lines: [
        'Sounds tab: Sex Panther. 60% of the time, it works every time.',
      ],
    },
    {
      id: '2026-10-25-d-undead-times-two',
      date: '2026-10-25',
      who: null,
      lines: [
        'Sounds tab: Undead ×2. "And as always, undead take times two damage to fire!"',
      ],
    },
    {
      id: '2026-10-25-e-youtube-clips',
      date: '2026-10-25',
      who: null,
      lines: [
        'Sounds tab: search YouTube, trim a clip, and add it to this character\'s board. Clips are saved on the server.',
      ],
    },
  ];

  function currentWho() {
    return window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || '';
  }

  function readSeen() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function writeSeen(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      /* ignore */
    }
  }

  function appliesTo(entry, who) {
    if (!entry.who || !entry.who.length) return true;
    if (!who) return true;
    return entry.who.indexOf(who) !== -1;
  }

  function linesFor(entry, who) {
    const extra = entry.linesByWho && who && entry.linesByWho[who];
    const base = Array.isArray(entry.lines) ? entry.lines.slice() : [];
    if (extra) base.push(extra);
    return base;
  }

  function pending(who) {
    const seen = new Set(readSeen());
    return UPDATES.filter((entry) => !seen.has(entry.id) && appliesTo(entry, who));
  }

  function markSeen(entries) {
    const seen = new Set(readSeen());
    entries.forEach((entry) => seen.add(entry.id));
    writeSeen(Array.from(seen));
  }

  function ensureBanner() {
    let root = document.getElementById('whatsNewBanner');
    if (root) return root;
    root = document.createElement('aside');
    root.id = 'whatsNewBanner';
    root.className = 'whats-new';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', "What's new");
    root.setAttribute('aria-live', 'polite');
    document.body.appendChild(root);
    return root;
  }

  function hideBanner() {
    const root = document.getElementById('whatsNewBanner');
    if (root) root.classList.remove('is-open');
  }

  function showBanner(entries, who) {
    const root = ensureBanner();
    root.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'whats-new__title';
    title.textContent = "What's new";
    root.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'whats-new__list';
    entries.forEach((entry) => {
      linesFor(entry, who).forEach((line) => {
        const item = document.createElement('li');
        item.textContent = line;
        list.appendChild(item);
      });
    });
    root.appendChild(list);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'whats-new__got-it';
    btn.textContent = 'Got it';
    btn.addEventListener('click', () => {
      markSeen(entries);
      hideBanner();
      syncNewsButton();
    });
    root.appendChild(btn);
    root.classList.add('is-open');
  }

  function show() {
    const who = currentWho();
    const unseen = pending(who);
    syncNewsButton(who);
    if (!unseen.length) return;
    showBanner(unseen, who);
  }

  function historyFor(who) {
    return UPDATES.filter((entry) => appliesTo(entry, who)).slice().reverse();
  }

  function formatDate(iso) {
    const parts = String(iso || '').split('-');
    if (parts.length !== 3) return iso;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[Number(parts[1]) - 1] || parts[1];
    return month + ' ' + Number(parts[2]) + ', ' + parts[0];
  }

  function syncNewsButton(who) {
    const btn = document.getElementById('whatsNewBtn');
    if (!btn) return;
    const unread = pending(who || currentWho()).length;
    btn.classList.toggle('is-unread', unread > 0);
    btn.setAttribute('aria-label', unread ? 'News, ' + unread + ' unread' : 'News');
  }

  function openModal(node) {
    if (!node) return;
    node.classList.add('show');
    node.setAttribute('aria-hidden', 'false');
  }

  function closeModal(node) {
    if (!node) return;
    node.classList.remove('show');
    node.setAttribute('aria-hidden', 'true');
  }

  function renderChangelog() {
    const body = document.getElementById('changelogBody');
    if (!body) return;
    const who = currentWho();
    const seen = new Set(readSeen());
    const entries = historyFor(who);
    body.innerHTML = '';
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'changelog__empty';
      empty.textContent = 'No updates yet.';
      body.appendChild(empty);
      return;
    }

    let lastDate = '';
    entries.forEach((entry) => {
      if (entry.date !== lastDate) {
        lastDate = entry.date;
        const heading = document.createElement('h3');
        heading.className = 'changelog__date';
        heading.textContent = formatDate(entry.date);
        body.appendChild(heading);
      }
      const block = document.createElement('article');
      block.className = 'changelog__entry';
      if (!seen.has(entry.id)) block.classList.add('is-new');
      const lines = document.createElement('ul');
      lines.className = 'whats-new__list';
      linesFor(entry, who).forEach((line) => {
        const item = document.createElement('li');
        item.textContent = line;
        lines.appendChild(item);
      });
      block.appendChild(lines);
      body.appendChild(block);
    });
    syncNewsButton(who);
  }

  function showLog() {
    hideBanner();
    closeModal(document.getElementById('settingsModal'));
    renderChangelog();
    openModal(document.getElementById('changelogModal'));
  }

  function hideLog() {
    closeModal(document.getElementById('changelogModal'));
  }

  function markAllRead() {
    markSeen(historyFor(currentWho()));
    hideBanner();
    renderChangelog();
    syncNewsButton();
  }

  function bind() {
    const newsBtn = document.getElementById('whatsNewBtn');
    const settingsBtn = document.getElementById('settingsChangelogBtn');
    const closeBtn = document.getElementById('changelogCloseBtn');
    const xBtn = document.getElementById('changelogModalClose');
    const markBtn = document.getElementById('changelogMarkReadBtn');
    const modal = document.getElementById('changelogModal');
    if (newsBtn) newsBtn.addEventListener('click', showLog);
    if (settingsBtn) settingsBtn.addEventListener('click', showLog);
    if (closeBtn) closeBtn.addEventListener('click', hideLog);
    if (xBtn) xBtn.addEventListener('click', hideLog);
    if (markBtn) markBtn.addEventListener('click', markAllRead);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) hideLog();
      });
    }
    syncNewsButton();
  }

  window.BlingusWhatsNew = {
    UPDATES: UPDATES,
    pending: pending,
    show: show,
    showLog: showLog,
  };

  function boot() {
    bind();
    window.setTimeout(show, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
