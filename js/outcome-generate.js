/**
 * Claude-backed outcome generation + Blingus personality / mood settings.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusPersonalityV2';
  const MOOD_KEY = 'blingusMoodV1';
  const CUSTOM_MOOD_KEY = 'blingusMoodCustomV1';
  const CUSTOM_MOOD_ID = 'custom';
  const CUSTOM_MOOD_MAX = 80;
  const RATING_KEY = 'blingusRatingV1';
  const ENDPOINT = (window.BlingusConstants?.API?.GENERATE_ENDPOINT) || '/api/generate-outcome.php';
  const DEFAULT_MOOD = 'playful';
  const DEFAULT_RATING = '';

  const DEFAULT_PERSONALITY = [
    'You are Blingus the Wayfarer: level 5 College of Lore fairy bard, Chaotic Good, Wayfarer background. Small fey. The world\'s a big place, and big problems don\'t solve themselves.',
    'Voice: theatrical, vain, nosy, self-aware, warm to friends, cutting when mocking, darkly amused. You collect songs, gossip, and bad ideas. Fish for applause. Karaoke-bard: a famous hook may sneak into a line; most lines stay spoken, not sung.',
    'Honor the live CHARACTER SHEET for stats, HP, spells, and gear. Combat style: Vicious Mockery first, then Cutting Words. Daggers and a shortbow, not a frontliner\'s blade. You hover, perch on shoulders, and get in people\'s business. You are not the tank. Instruments: clarinet, fiddle, pan flute.',
    'Never fit the High Forest fairies. Wanderlust louder than a maybe-family. Found purpose under Bo.',
    'Party: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" is fine), Brawn O\'Neil (dwarven monk; wears the Crown of Remembrance), Vadania Amakiir (elven ranger; the table says Vandan, Van Damme, or whatever fits that day), and Bo (toad-cauldron era, enlarge heroics, dragon breath at Granny; closest thing Blingus has to family and a mentor; Zybilna-silent warlock flavor when it fits).',
    'Habits: chronic name-amnesia (Sir Whats-his-face, including swapping Vadania nicknames); invent a nickname rather than freeze; soft spot for fairy dragons (Sir Talavar); chairs are suspects after the mimic; joke about mud muffins, the Stinky Court, and the marching-band near-wipe.',
    'Fey gambits: you bluff that fairy custom binds the mark (rule of three, reciprocity, true-name, octave / eight-day). You know you are selling mystique. Do not invent unpublished fey law.',
    'TABLE-KNOWN PRISMEER ONLY: do not invent unpublished Witchlight plot. Defer names, places, and who is alive to the live sheet notes.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  const LEGACY_DEFAULT_PERSONALITY = [
    'You are Blingus the Wayfarer: level 5 College of Lore fairy bard, Chaotic Good, Wayfarer background. Small fey. The world\'s a big place, and big problems don\'t solve themselves.',
    'Voice: theatrical, vain, nosy, warm to friends, cutting when mocking, darkly amused. You collect songs, gossip, and bad ideas. Fish for applause.',
    'Kit (honor the live CHARACTER SHEET over this): CHA 17, DEX 16, CON 14, INT 10, WIS 11, STR 8; AC 15 studded leather; HP 38; prof +3; spell DC 14, spell attack +6; fly 30 (not in medium/heavy); daggers and a shortbow, not a frontliner\'s blade.',
    'Tricks: Vicious Mockery first, Cutting Words, Bardic Inspiration 1d8 (3/short rest), Jack of All Trades, Expertise in Performance and Investigation, Fey Touched (Dissonant Whispers, Misty Step), Fairy Magic (Druidcraft, Faerie Fire, Enlarge/Reduce), Lucky (3/long rest). Instruments: clarinet, fiddle, pan flute.',
    'Party: Puck Pinewhistle (wild-magic fairy sorcerer; "Puke" ok), Brawn O\'Neil (dwarven monk; has the Crown of Remembrance),',
    'Vadania Amakiir (elven ranger; the table calls them Vandan, Van Damme, or whatever feels right that day),',
    'and Bo (toad-cauldron era, enlarge heroics, dragon breath at Granny; closest thing Blingus has to family / a mentor, Zybilna-silent warlock flavor when it fits).',
    'Habits: chronic NPC name-amnesia (Sir Whats-his-face, including swapping Vadania nicknames); soft spot for fairy dragons (Sir Talavar); distrust chairs after the mimic; joke about mud muffins, the Stinky Court, and the marching-band near-wipe.',
    'TABLE-KNOWN PRISMEER ONLY: Hither swamp and Bavlorna still alive (need her yarn); Skabatha/Granny Nightshade of Thither is dead (oven); Endelyn of Yon next; Zybilna frozen in the Palace of Heart\'s Desire; Elidon\'s stolen horn is the key; Lamorna the unicorn; do not invent unpublished Witchlight plot past these notes.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  /** Session mood — overrides emotional register for every Claude batch. */
  const MOODS = [
    {
      id: 'playful',
      label: '🎭 Playful',
      prompt: 'Playful showboat energy: winky, theatrical, fishing for laughs and applause without turning mean unless the outcome type asks for it.',
    },
    {
      id: 'flirty',
      label: '💋 Flirty',
      prompt: 'Flirty and teasing: charm, innuendo, lingering looks in the prose, seductive confidence. Keep it fun, not clinical.',
    },
    {
      id: 'petty',
      label: '😒 Petty',
      prompt: 'Petty and spiteful: score-settling, shade, grudges, delicious little humiliations. Still witty, not joyless rage.',
    },
    {
      id: 'melancholy',
      label: '🌧️ Melancholy',
      prompt: 'Melancholy road-weariness: wistful, bittersweet, soft morbidity, beauty in the ache. Humor can still peek through.',
    },
    {
      id: 'paranoid',
      label: '👁️ Paranoid',
      prompt: 'Paranoid and twitchy: chairs are suspects, rust monsters haunt every corner, trust is optional, vigilance is comedy.',
    },
    {
      id: 'hype',
      label: '🔥 Hype',
      prompt: 'Battle-hype and adrenalined: loud, kinetic, chant-ready, "we are so back" energy. Big gestures, bigger mouth.',
    },
    {
      id: 'soft',
      label: '🌸 Soft',
      prompt: 'Soft and tender: sincere warmth for friends, gentle teasing, protective fondness. Less vanity bite, more heart.',
    },
    {
      id: 'manic',
      label: '✨ Manic',
      prompt: 'Manic fey chaos: too many ideas at once, glitter-brained, gleefully unhinged, delightful bad decisions mid-sentence.',
    },
    {
      id: 'deadpan',
      label: '😐 Deadpan',
      prompt: 'Deadpan dry wit: underplayed, flat delivery, devastating calmly. The joke lands because he refuses to wink.',
    },
    {
      id: 'lewd',
      label: '🍒 Lewd',
      prompt: 'Lewd and shameless: filthy jokes welcome even outside party-raunch mode, still characterful and funny rather than porn-narration.',
    },
  ];

  /** Optional MPAA-style ceiling for how adult a batch may be. Empty = table default. */
  const RATINGS = [
    {
      id: 'g',
      label: 'G',
      title: 'All ages. No crude language or sexual content.',
    },
    {
      id: 'pg',
      label: 'PG',
      title: 'Mild innuendo at most. Light language. No explicit sex.',
    },
    {
      id: 'pg-13',
      label: 'PG-13',
      title: 'Suggestive jokes and strong language. No explicit sex acts.',
    },
    {
      id: 'r',
      label: 'R',
      title: 'Explicit jokes and crude body humor. Still a table line, not porn.',
    },
    {
      id: 'x',
      label: 'X',
      title: 'No ceiling. Graphic, filthy, NC-17. Still in Blingus\'s voice.',
    },
  ];

  let lastResult = {
    key: null,
    baseKey: null,
    forceParody: false,
    combatRound: false,
    lines: [],
  };
  let moodChipsEl = null;
  let moodInputEl = null;
  let ratingChipsEl = null;
  let moodBound = false;

  function normalizePersonalityWs(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function migratePersonality(text) {
    const value = String(text || '').trim();
    if (!value) return DEFAULT_PERSONALITY;
    if (normalizePersonalityWs(value) === normalizePersonalityWs(LEGACY_DEFAULT_PERSONALITY)) {
      return DEFAULT_PERSONALITY;
    }
    return value;
  }

  function getPersonality() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        const migrated = migratePersonality(stored);
        if (migrated !== stored.trim()) {
          try {
            localStorage.setItem(STORAGE_KEY, migrated);
          } catch (e) {
            /* ignore */
          }
        }
        return migrated;
      }
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_PERSONALITY;
  }

  function setPersonality(text) {
    const value = migratePersonality(text);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore */
    }
    return value;
  }

  function resetPersonality() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_PERSONALITY;
  }

  function getCustomMoodText() {
    try {
      return String(localStorage.getItem(CUSTOM_MOOD_KEY) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setCustomMoodText(text) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim().slice(0, CUSTOM_MOOD_MAX);
    try {
      if (cleaned) localStorage.setItem(CUSTOM_MOOD_KEY, cleaned);
      else localStorage.removeItem(CUSTOM_MOOD_KEY);
    } catch (e) {
      /* ignore */
    }
    return cleaned;
  }

  function customMoodMeta(text) {
    const cleaned = String(text || '').trim();
    return {
      id: CUSTOM_MOOD_ID,
      label: '✏️ ' + cleaned,
      prompt: 'CUSTOM MOOD (player write-in): "' + cleaned + '". Color every line with this emotional register. Stay in character. Do not ignore the standing personality; shift the attitude to match this mood.',
    };
  }

  function allMoods() {
    return window.WorkflowCatalog?.getMoods?.(MOODS) || MOODS;
  }

  function moodById(id) {
    if (id === CUSTOM_MOOD_ID) {
      const text = getCustomMoodText();
      if (text) return customMoodMeta(text);
    }
    const moods = allMoods();
    return moods.find((m) => m.id === id) || moods.find((m) => m.id === DEFAULT_MOOD) || MOODS[0];
  }

  function getMood() {
    try {
      const stored = localStorage.getItem(MOOD_KEY);
      if (stored === CUSTOM_MOOD_ID && getCustomMoodText()) return CUSTOM_MOOD_ID;
      if (stored && allMoods().some((m) => m.id === stored)) return stored;
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_MOOD;
  }

  function getMoodMeta(id = getMood()) {
    return moodById(id);
  }

  function syncMoodInput() {
    if (!moodInputEl) return;
    if (document.activeElement === moodInputEl) return;
    moodInputEl.value = getCustomMoodText();
    moodInputEl.classList.toggle('workflow__name-input--active', getMood() === CUSTOM_MOOD_ID);
  }

  function setMood(id, { fromInput = false } = {}) {
    let next = id;
    if (next === CUSTOM_MOOD_ID && !getCustomMoodText()) next = DEFAULT_MOOD;
    const mood = moodById(next) || moodById(DEFAULT_MOOD);
    try {
      localStorage.setItem(MOOD_KEY, mood.id);
    } catch (e) {
      /* ignore */
    }
    clearLastResult();
    renderMoodChips();
    if (!fromInput) syncMoodInput();
    else if (moodInputEl) {
      moodInputEl.classList.toggle('workflow__name-input--active', mood.id === CUSTOM_MOOD_ID);
    }
    try {
      window.dispatchEvent(new CustomEvent('blingus-mood-change', { detail: { mood: mood.id } }));
    } catch (e) {
      /* ignore */
    }
    return mood.id;
  }

  function setCustomMood(text) {
    const cleaned = setCustomMoodText(text);
    return setMood(cleaned ? CUSTOM_MOOD_ID : DEFAULT_MOOD, { fromInput: true });
  }

  function importMood(id, customText) {
    if (customText !== undefined && customText !== null) {
      setCustomMoodText(customText);
    }
    if (id) return setMood(id);
    if (getCustomMoodText()) return setMood(CUSTOM_MOOD_ID);
    return getMood();
  }

  function ratingById(id) {
    return RATINGS.find((r) => r.id === id) || null;
  }

  function getRating() {
    try {
      const stored = localStorage.getItem(RATING_KEY);
      if (stored && ratingById(stored)) return stored;
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_RATING;
  }

  function getRatingMeta(id = getRating()) {
    return ratingById(id);
  }

  function setRating(id) {
    const rating = ratingById(id);
    const next = rating ? rating.id : DEFAULT_RATING;
    try {
      if (next) localStorage.setItem(RATING_KEY, next);
      else localStorage.removeItem(RATING_KEY);
    } catch (e) {
      /* ignore */
    }
    clearLastResult();
    renderRatingChips();
    try {
      window.dispatchEvent(new CustomEvent('blingus-rating-change', { detail: { rating: next } }));
    } catch (e) {
      /* ignore */
    }
    return next;
  }

  function baseSelectionKey(selection) {
    const env = Array.isArray(selection.environment)
      ? selection.environment.join(',')
      : (selection.environment || '');
    return [
      selection.scene,
      selection.setting || '',
      selection.weather || '',
      selection.lighting || '',
      env,
      selection.outcome,
      selection.attackType || '',
      selection.detail || '',
      selection.target || 'any',
      selection.name || '',
      selection.mood || getMood(),
      selection.rating || getRating() || 'default',
      selection.combatRound ? '6s' : 'free',
      selection.pace || '',
    ].join('|');
  }

  function selectionKey(selection) {
    return baseSelectionKey(selection) + '|' + (selection.forceParody ? 'parody' : 'normal');
  }

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  function renderMoodChips() {
    if (!moodChipsEl) return;
    const current = getMood();
    moodChipsEl.innerHTML = '';
    allMoods().forEach((mood) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip--pill' + (current === mood.id ? ' chip--active' : '');
      chip.textContent = mood.label;
      chip.dataset.moodId = mood.id;
      chip.setAttribute('aria-pressed', current === mood.id ? 'true' : 'false');
      chip.title = mood.prompt;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        setMood(mood.id);
      });
      moodChipsEl.appendChild(chip);
      window.WorkflowCatalog?.decorateChip?.(chip, 'moods', mood.id);
    });
    window.WorkflowCatalog?.appendAddChip?.(moodChipsEl, 'moods');
  }

  function renderRatingChips() {
    if (!ratingChipsEl) return;
    const current = getRating();
    ratingChipsEl.innerHTML = '';
    RATINGS.forEach((rating) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip chip--pill' + (current === rating.id ? ' chip--active' : '');
      chip.textContent = rating.label;
      chip.dataset.ratingId = rating.id;
      chip.setAttribute('aria-pressed', current === rating.id ? 'true' : 'false');
      chip.title = rating.title;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        setRating(current === rating.id ? '' : rating.id);
      });
      ratingChipsEl.appendChild(chip);
    });
  }

  function initMoodUI() {
    moodChipsEl = document.getElementById('workflowMoodChips');
    moodInputEl = document.getElementById('workflowMoodInput');
    ratingChipsEl = document.getElementById('workflowRatingChips');
    if (moodBound) {
      renderMoodChips();
      renderRatingChips();
      syncMoodInput();
      return;
    }
    moodBound = true;
    if (moodInputEl) {
      moodInputEl.addEventListener('input', () => {
        setCustomMood(moodInputEl.value);
      });
      moodInputEl.addEventListener('focus', () => {
        if (moodInputEl.value.trim()) setCustomMood(moodInputEl.value);
      });
    }
    renderMoodChips();
    renderRatingChips();
    syncMoodInput();
  }

  function personalityForGenerate() {
    const voice = getPersonality();
    const sheetBlock = window.CharacterSheet?.toPersonalityBlock?.();
    if (!sheetBlock) return voice;
    return (
      voice
      + '\n\nCURRENT CHARACTER SHEET (authoritative mechanical state; prefer this over any older stats in the personality text):\n'
      + sheetBlock
    );
  }

  async function generate(selection) {
    const mood = getMoodMeta();
    const payload = {
      scene: selection.scene,
      setting: selection.setting || '',
      weather: selection.weather || '',
      lighting: selection.lighting || '',
      environment: Array.isArray(selection.environment) ? selection.environment : [],
      outcome: selection.outcome,
      attackType: selection.attackType || '',
      detail: selection.detail || '',
      target: selection.target || 'any',
      name: selection.name || '',
      intent: selection.intent || '',
      partyMember: Boolean(selection.partyMember),
      personality: personalityForGenerate(),
      characterBlock: window.CharacterSheet?.toPersonalityBlock?.() || '',
      kitMatch: window.CharacterSheet?.detailBrief?.(selection.detail, selection.attackType)
        || window.CharacterSheet?.matchDetail?.(selection.detail)
        || '',
      mood: mood.id === CUSTOM_MOOD_ID ? getCustomMoodText().slice(0, 40) : mood.id,
      moodPrompt: mood.prompt,
      rating: selection.rating || getRating(),
      count: selection.count || 5,
      pace: selection.pace || '',
      combatRound: Boolean(selection.combatRound),
      forceParody: Boolean(selection.forceParody),
      castResult: selection.castResult || '',
      spellKind: selection.spellKind || '',
      spellTargets: selection.spellTargets || '',
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Bad response from generate API');
    }

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || ('Generate failed (HTTP ' + response.status + ')'));
    }

    const lines = Array.isArray(data.lines) ? data.lines.filter((l) => typeof l === 'string' && l.trim()) : [];
    if (!lines.length) {
      throw new Error('No lines returned');
    }

    lastResult = {
      key: selectionKey(payload),
      baseKey: baseSelectionKey(payload),
      forceParody: Boolean(payload.forceParody),
      combatRound: Boolean(payload.combatRound),
      lines,
    };
    return lines;
  }

  function getLastResult(selection) {
    if (!selection) return lastResult.lines;
    // Same wizard selection shows the latest batch, whether or not it was a forced parody.
    return lastResult.baseKey === baseSelectionKey(selection) ? lastResult.lines : [];
  }

  function lastWasParodySmash(selection) {
    if (!lastResult.forceParody || !lastResult.lines.length) return false;
    if (!selection) return true;
    return lastResult.baseKey === baseSelectionKey(selection);
  }

  function lastWasCombatRound(selection) {
    if (!lastResult.combatRound || !lastResult.lines.length) return false;
    if (!selection) return true;
    return lastResult.baseKey === baseSelectionKey(selection);
  }

  function clearLastResult() {
    lastResult = { key: null, baseKey: null, forceParody: false, combatRound: false, lines: [] };
  }

  function openPersonalityModal() {
    const existing = document.getElementById('personalityModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'personalityModal';
    overlay.className = 'personality-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:10001;padding:16px;';

    // Do not use class "modal" here — that is the app's hidden full-screen overlay shell.
    const panel = document.createElement('div');
    panel.className = 'personality-modal-panel';
    panel.style.cssText = 'background:var(--paper, var(--bg, #fff));color:var(--ink, var(--fg, #111));max-width:640px;width:100%;border-radius:12px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.35);border:2px solid var(--burnt, var(--accent, #8b4a2b));max-height:90vh;overflow:auto;';
    panel.innerHTML = `
      <h2 style="margin:0 0 8px;font-size:1.25rem;">Blingus personality</h2>
      <p style="margin:0 0 12px;opacity:.8;font-size:14px;">This text is sent to Claude as the voice guide for every generated outcome. Edit freely.</p>
      <textarea id="personalityTextarea" rows="10" style="width:100%;box-sizing:border-box;font:inherit;padding:10px;border-radius:8px;border:1px solid var(--border,#ccc);"></textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap;">
        <button type="button" class="btn btn--secondary" id="personalityResetBtn">Reset default</button>
        <button type="button" class="btn btn--secondary" id="personalityCancelBtn">Cancel</button>
        <button type="button" class="btn" id="personalitySaveBtn">Save</button>
      </div>
    `;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const ta = panel.querySelector('#personalityTextarea');
    ta.value = getPersonality();

    function close() {
      overlay.remove();
    }

    panel.querySelector('#personalityCancelBtn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    panel.querySelector('#personalityResetBtn').addEventListener('click', () => {
      ta.value = resetPersonality();
    });
    panel.querySelector('#personalitySaveBtn').addEventListener('click', () => {
      setPersonality(ta.value);
      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Personality saved');
      } else if (window.UIUtils?.showToast) {
        window.UIUtils.showToast('Personality saved');
      }
    });
    ta.focus();
  }

  window.OutcomeGenerate = {
    DEFAULT_PERSONALITY,
    MOODS,
    DEFAULT_MOOD,
    RATINGS,
    DEFAULT_RATING,
    getPersonality,
    setPersonality,
    resetPersonality,
    getMood,
    getMoodMeta,
    setMood,
    getCustomMoodText,
    setCustomMood,
    importMood,
    getRating,
    getRatingMeta,
    setRating,
    initMoodUI,
    renderMoodChips,
    renderRatingChips,
    generate,
    getLastResult,
    lastWasParodySmash,
    lastWasCombatRound,
    clearLastResult,
    openPersonalityModal,
    selectionKey,
  };
})();
