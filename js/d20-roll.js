/**
 * Shared d20 pad for Outcomes and the character sheet.
 * Nat 20/1 auto-resolve attacks; 2–19 ask Hit/Miss; skills always ask Success/Failure.
 */
(function () {
  'use strict';

  function d20() {
    return 1 + Math.floor(Math.random() * 20);
  }

  function roll(opts) {
    const mode = opts && opts.advantage ? opts.advantage : 'normal';
    if (mode === 'adv' || mode === 'dis') {
      const a = d20();
      const b = d20();
      const kept = mode === 'adv' ? Math.max(a, b) : Math.min(a, b);
      return { dice: [a, b], kept, mode };
    }
    const n = d20();
    return { dice: [n], kept: n, mode: 'normal' };
  }

  function verdictLabel(kind, verdict) {
    if (verdict === 'crit') return 'Crit Hit';
    if (verdict === 'fumble') return 'Crit Fail';
    if (verdict === 'hit') return 'Hit';
    if (verdict === 'miss') return 'Miss';
    if (verdict === 'success') return 'Success';
    if (verdict === 'failure') return 'Failure';
    return '';
  }

  function formatMod(n) {
    const v = Number(n) || 0;
    return (v >= 0 ? '+' : '') + v;
  }

  function bannerText(kind, kept, verdict, bonus) {
    const label = verdictLabel(kind, verdict);
    const mod = Number(bonus) || 0;
    const math = mod
      ? ('d20 ' + kept + ' ' + formatMod(mod) + ' = ' + (kept + mod))
      : ('d20 ' + kept);
    if (kind === 'weapon' && verdict === 'hit') return math + ' — Hit (not a crit)';
    if (label) return math + ' — ' + label;
    return math;
  }

  function weaponResolve(kept, tap) {
    if (kept === 20) return { outcomeMod: 'hit', pace: 'battle', verdict: 'crit' };
    if (kept === 1) return { outcomeMod: 'fail', pace: 'battle', verdict: 'fumble' };
    if (tap === 'hit') return { outcomeMod: 'hit', pace: 'battle', verdict: 'hit' };
    if (tap === 'miss') return { outcomeMod: null, pace: null, verdict: 'miss' };
    return null;
  }

  function skillResolve(tap) {
    if (tap === 'success') return { outcomeMod: 'success', pace: null, verdict: 'success' };
    if (tap === 'failure') return { outcomeMod: 'failure', pace: null, verdict: 'failure' };
    return null;
  }

  const SOUND_KEY = 'd20Sound';
  let audioCtx = null;

  function soundEnabled() {
    if (window.StorageUtils?.loadLocal) {
      return window.StorageUtils.loadLocal(SOUND_KEY, false) === true;
    }
    try {
      return localStorage.getItem(SOUND_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setSoundEnabled(on, opts) {
    if (window.StorageUtils?.saveLocal) {
      window.StorageUtils.saveLocal(SOUND_KEY, Boolean(on));
    } else {
      try {
        localStorage.setItem(SOUND_KEY, on ? '1' : '0');
      } catch (e) { /* ignore */ }
    }
    document.querySelectorAll('[data-d20-sound]').forEach(syncSoundButton);
    if (on && opts && opts.preview) playPreviewSound();
  }

  function syncSoundButton(btn) {
    if (!btn) return;
    const on = soundEnabled();
    btn.classList.toggle('is-active', on);
    btn.textContent = on ? 'Sound on' : 'Sound off';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function bindSoundToggle(btn) {
    if (!btn || btn.dataset.d20SoundBound === '1') return;
    btn.dataset.d20SoundBound = '1';
    btn.setAttribute('data-d20-sound', '1');
    btn.title = 'Play a cue on crit or fumble from the sheet or Outcomes';
    syncSoundButton(btn);
    btn.addEventListener('click', () => {
      setSoundEnabled(!soundEnabled(), { preview: true });
    });
  }

  function getAudioCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(ctx, freq, start, dur, type, gain) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function playCritSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      playTone(ctx, freq, t + i * 0.09, 0.22, 'triangle', 0.12);
    });
  }

  function playFumbleSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [196, 164.81, 130.81].forEach((freq, i) => {
      const start = t + i * 0.16;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.84, start + 0.2);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.07, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }

  function playPreviewSound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    playTone(ctx, 660, ctx.currentTime, 0.12, 'triangle', 0.08);
  }

  function playVerdictSound(verdict) {
    if (!soundEnabled()) return;
    if (verdict === 'crit') playCritSound();
    else if (verdict === 'fumble') playFumbleSound();
  }

  function flashVerdict(kind, kept, verdict) {
    const label = verdictLabel(kind, verdict);
    if (!label || !document.body) return;
    document.querySelectorAll('.d20-flash').forEach((el) => el.remove());
    const el = document.createElement('div');
    el.className = 'd20-flash d20-flash--' + verdict;
    el.setAttribute('role', 'status');
    el.innerHTML = '<div class="d20-flash__number">' + kept + '</div>'
      + '<div class="d20-flash__label">' + label + '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-on'));
    setTimeout(() => {
      el.classList.remove('is-on');
      setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
    }, 1600);
  }

  function emit(options, rollResult, resolved) {
    const payload = {
      kind: options.kind,
      label: options.label || '',
      attackType: options.attackType || '',
      natural: rollResult.kept,
      dice: rollResult.dice,
      mode: rollResult.mode,
      verdict: resolved.verdict,
      outcomeMod: resolved.outcomeMod,
      pace: resolved.pace,
      bonus: Number(options.bonus) || 0,
      total: rollResult.kept + (Number(options.bonus) || 0),
      banner: bannerText(options.kind, rollResult.kept, resolved.verdict, options.bonus),
    };
    if (typeof options.onResolved === 'function') {
      options.onResolved(payload);
    }
  }

  function renderPad(host, options) {
    if (!host) return;
    options = options || {};
    const kind = options.kind === 'skill' ? 'skill' : 'weapon';
    host.innerHTML = '';
    host.classList.add('d20-pad');

    const state = {
      mode: 'normal',
      last: null,
      lastVerdict: null,
      bonus: Number(options.bonus) || 0,
    };

    const modes = document.createElement('div');
    modes.className = 'd20-pad__modes';
    [
      { id: 'normal', label: 'Normal' },
      { id: 'adv', label: 'Adv' },
      { id: 'dis', label: 'Dis' },
    ].forEach((m) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'd20-pad__mode' + (state.mode === m.id ? ' is-active' : '');
      btn.textContent = m.label;
      btn.addEventListener('click', () => {
        state.mode = m.id;
        modes.querySelectorAll('.d20-pad__mode').forEach((el) => {
          el.classList.toggle('is-active', el === btn);
        });
      });
      modes.appendChild(btn);
    });
    host.appendChild(modes);

    const rollBtn = document.createElement('button');
    rollBtn.type = 'button';
    rollBtn.className = 'btn btn-generate d20-pad__roll';
    rollBtn.textContent = options.label ? 'Roll d20 — ' + options.label : 'Roll d20';
    host.appendChild(rollBtn);

    const bonusRow = document.createElement('div');
    bonusRow.className = 'd20-pad__bonus';
    const bonusLabel = document.createElement('label');
    bonusLabel.className = 'd20-pad__bonus-label';
    bonusLabel.textContent = 'Mod';
    const bonusInput = document.createElement('input');
    bonusInput.type = 'number';
    bonusInput.className = 'sheet-input d20-pad__bonus-input';
    bonusInput.title = 'Added to the natural d20. Crit and fumble still use the natural die.';
    bonusInput.value = String(state.bonus);
    bonusInput.addEventListener('input', () => {
      state.bonus = Number(bonusInput.value) || 0;
      options.bonus = state.bonus;
      if (state.last) showResult(state.last, state.lastVerdict);
    });
    bonusRow.appendChild(bonusLabel);
    bonusRow.appendChild(bonusInput);
    host.appendChild(bonusRow);

    const result = document.createElement('div');
    result.className = 'd20-pad__result';
    host.appendChild(result);

    const choices = document.createElement('div');
    choices.className = 'd20-pad__choices';
    host.appendChild(choices);

    function showResult(rollResult, verdict) {
      state.lastVerdict = verdict || null;
      const extra = rollResult.dice.length > 1
        ? ' (' + rollResult.dice.join(', ') + ', kept ' + rollResult.kept + ')'
        : '';
      const label = verdictLabel(kind, verdict);
      const mod = Number(state.bonus) || 0;
      const math = mod
        ? '<span class="d20-pad__math">' + formatMod(mod) + ' = <strong>' + (rollResult.kept + mod) + '</strong></span>'
        : '';
      result.className = 'd20-pad__result';
      if (verdict) result.classList.add('d20-pad__result--' + verdict);
      else if (rollResult.kept === 20) result.classList.add('d20-pad__result--nat20');
      else if (rollResult.kept === 1) result.classList.add('d20-pad__result--nat1');
      result.innerHTML = '<span class="d20-pad__number">' + rollResult.kept + '</span>'
        + math
        + (extra ? '<span class="d20-pad__meta">' + extra + '</span>' : '')
        + (label ? '<span class="d20-pad__verdict">' + label + '</span>' : '');
    }

    function markPicked(pickedId) {
      choices.querySelectorAll('[data-verdict]').forEach((el) => {
        el.classList.toggle('is-picked', el.getAttribute('data-verdict') === pickedId);
      });
    }

    function addChoice(id, label, tone, onPick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--ghost btn--compact d20-pad__choice d20-pad__choice--' + tone;
      btn.setAttribute('data-verdict', id);
      btn.textContent = label;
      btn.addEventListener('click', onPick);
      choices.appendChild(btn);
    }

    function showChoices(rollResult) {
      choices.innerHTML = '';
      if (kind === 'weapon') {
        if (rollResult.kept === 20 || rollResult.kept === 1) return;
        addChoice('hit', 'Hit', 'good', () => {
          const resolved = weaponResolve(rollResult.kept, 'hit');
          if (!resolved) return;
          showResult(rollResult, resolved.verdict);
          markPicked('hit');
          emit(options, rollResult, resolved);
        });
        addChoice('miss', 'Miss', 'bad', () => {
          const resolved = weaponResolve(rollResult.kept, 'miss');
          if (!resolved) return;
          showResult(rollResult, resolved.verdict);
          markPicked('miss');
          emit(options, rollResult, resolved);
        });
        return;
      }
      addChoice('success', 'Success', 'good', () => {
        const resolved = skillResolve('success');
        if (!resolved) return;
        showResult(rollResult, resolved.verdict);
        markPicked('success');
        emit(options, rollResult, resolved);
      });
      addChoice('failure', 'Failure', 'bad', () => {
        const resolved = skillResolve('failure');
        if (!resolved) return;
        showResult(rollResult, resolved.verdict);
        markPicked('failure');
        emit(options, rollResult, resolved);
      });
    }

    rollBtn.addEventListener('click', () => {
      const rollResult = roll({ advantage: state.mode });
      state.last = rollResult;
      if (kind === 'weapon' && (rollResult.kept === 20 || rollResult.kept === 1)) {
        const resolved = weaponResolve(rollResult.kept);
        showResult(rollResult, resolved.verdict);
        flashVerdict(kind, rollResult.kept, resolved.verdict);
        playVerdictSound(resolved.verdict);
        choices.innerHTML = '';
        addChoice(
          resolved.verdict,
          resolved.verdict === 'crit' ? 'Continue — Crit Hit' : 'Continue — Crit Fail',
          resolved.verdict === 'crit' ? 'good' : 'bad',
          () => {
            markPicked(resolved.verdict);
            emit(options, rollResult, resolved);
          }
        );
        return;
      }
      showResult(rollResult);
      showChoices(rollResult);
    });
  }

  window.D20Roll = {
    roll,
    renderPad,
    bannerText,
    verdictLabel,
    flashVerdict,
    soundEnabled,
    setSoundEnabled,
    bindSoundToggle,
  };

  bindSoundToggle(document.getElementById('d20SoundBtn'));
})();
