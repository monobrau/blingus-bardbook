/**
 * Claude-backed outcome generation + Blingus personality / mood settings.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusPersonalityV1';
  const MOOD_KEY = 'blingusMoodV1';
  const ENDPOINT = (window.BlingusConstants?.API?.GENERATE_ENDPOINT) || '/api/generate-outcome.php';
  const DEFAULT_MOOD = 'playful';

  const DEFAULT_PERSONALITY = [
    'You are Blingus the Wayfarer: a flamboyant fairy bard who treats every skill check like a verse and every fight like a show.',
    'Voice: theatrical, vain, nosy, warm to friends, cutting when mocking, darkly amused. You collect songs, gossip, and bad ideas.',
    'Party: Puck Pinewhistle (fellow fairy chaos), Brawn O\'Neil (monk; currently has the Crown of Remembrance),',
    'Vadania Amakiir (paranoid bow-watcher; the table calls them Vandan, Van Damme, or whatever feels right that day),',
    'and Bo (dwarf; briefly a toad, has dragon breath stories).',
    'Habits: chronic NPC name-amnesia (call people Sir Whats-his-face, including swapping Vadania nicknames freely);',
    'soft spot for fairy dragons;',
    'distrust chairs after the mimic incident; joke about mud muffins, the Stinky Court, and marching-band near-wipes;',
    'mention rust monsters with genuine paranoia; bring up the Tarrasque as a running rumor; fish for applause.',
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

  let lastResult = {
    key: null,
    lines: [],
  };
  let moodChipsEl = null;
  let moodBound = false;

  function getPersonality() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_PERSONALITY;
  }

  function setPersonality(text) {
    const value = (text || '').trim() || DEFAULT_PERSONALITY;
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

  function moodById(id) {
    return MOODS.find((m) => m.id === id) || MOODS.find((m) => m.id === DEFAULT_MOOD);
  }

  function getMood() {
    try {
      const stored = localStorage.getItem(MOOD_KEY);
      if (stored && moodById(stored)) return stored;
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_MOOD;
  }

  function getMoodMeta(id = getMood()) {
    return moodById(id);
  }

  function setMood(id) {
    const mood = moodById(id) || moodById(DEFAULT_MOOD);
    try {
      localStorage.setItem(MOOD_KEY, mood.id);
    } catch (e) {
      /* ignore */
    }
    clearLastResult();
    renderMoodChips();
    try {
      window.dispatchEvent(new CustomEvent('blingus-mood-change', { detail: { mood: mood.id } }));
    } catch (e) {
      /* ignore */
    }
    return mood.id;
  }

  function selectionKey(selection) {
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
    ].join('|');
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
    MOODS.forEach((mood) => {
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
    });
  }

  function initMoodUI() {
    moodChipsEl = document.getElementById('workflowMoodChips');
    if (!moodChipsEl || moodBound) {
      renderMoodChips();
      return;
    }
    moodBound = true;
    renderMoodChips();
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
      partyMember: Boolean(selection.partyMember),
      personality: getPersonality(),
      mood: mood.id,
      moodPrompt: mood.prompt,
      count: selection.count || 5,
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
      lines,
    };
    return lines;
  }

  function getLastResult(selection) {
    if (!selection) return lastResult.lines;
    return lastResult.key === selectionKey(selection) ? lastResult.lines : [];
  }

  function clearLastResult() {
    lastResult = { key: null, lines: [] };
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
    getPersonality,
    setPersonality,
    resetPersonality,
    getMood,
    getMoodMeta,
    setMood,
    initMoodUI,
    renderMoodChips,
    generate,
    getLastResult,
    clearLastResult,
    openPersonalityModal,
    selectionKey,
  };
})();
