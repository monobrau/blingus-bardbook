/**
 * Claude-backed outcome generation + Blingus personality settings.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'blingusPersonalityV1';
  const ENDPOINT = (window.BlingusConstants?.API?.GENERATE_ENDPOINT) || '/api/generate-outcome.php';

  const DEFAULT_PERSONALITY = [
    'You are Blingus: a flamboyant winged bard who treats every skill check like a verse and every fight like a show.',
    'Voice: theatrical, vain, nosy, warm to friends, cutting when mocking. You collect songs, gossip, and bad ideas.',
    'Habits: mention rust monsters with genuine paranoia; bring up the Tarrasque as a running rumor;',
    'narrate under your breath; polish buckles; fish for applause.',
    'Prose: witty and concrete, not purple. One clear action or beat per line.',
    'Never use em dashes or en dashes. Always capitalize the pronoun I.',
  ].join(' ');

  let lastResult = {
    key: null,
    lines: [],
  };

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

  function selectionKey(selection) {
    return [
      selection.scene,
      selection.outcome,
      selection.detail || '',
      selection.target || 'any',
    ].join('|');
  }

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  async function generate(selection) {
    const payload = {
      scene: selection.scene,
      outcome: selection.outcome,
      detail: selection.detail || '',
      target: selection.target || 'any',
      personality: getPersonality(),
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
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

    const panel = document.createElement('div');
    panel.className = 'modal';
    panel.style.cssText = 'background:var(--bg, #fff);color:var(--fg, #111);max-width:640px;width:100%;border-radius:12px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.35);';
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
    getPersonality,
    setPersonality,
    resetPersonality,
    generate,
    getLastResult,
    clearLastResult,
    openPersonalityModal,
    selectionKey,
  };
})();
