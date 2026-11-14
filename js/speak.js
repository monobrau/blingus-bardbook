/**
 * Play ElevenLabs speech for generated text. The API key stays on the server.
 */
(function () {
  'use strict';

  const ENDPOINT = (window.BlingusConstants?.API?.SPEAK_ENDPOINT) || '/api/speak.php';
  const VOICE_KEY = 'elevenLabsVoiceId';
  let current = null;

  function cleanVoiceId(raw) {
    let text = String(raw || '').trim();
    text = text.replace(/^["']|["']$/g, '');
    text = text.trim();
    const fromQueryParam = text.match(/[?&]voiceId=([A-Za-z0-9]{8,40})/);
    if (fromQueryParam) return fromQueryParam[1];
    const fromPath = text.match(/\/voice\/([A-Za-z0-9]{8,40})/);
    if (fromPath) return fromPath[1];
    return /^[A-Za-z0-9]{8,40}$/.test(text) ? text : '';
  }

  function voiceId() {
    try {
      return cleanVoiceId(localStorage.getItem(VOICE_KEY) || '');
    } catch (e) {
      return '';
    }
  }

  function bindVoiceSetting() {
    const input = document.getElementById('elevenVoiceId');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.value = voiceId();
    
    function save() {
      const cleaned = cleanVoiceId(input.value);
      if (input.value.trim() && !cleaned) {
        input.value = voiceId();
        if (typeof window.showToast === 'function') window.showToast('Paste an ElevenLabs voice ID or URL');
        return;
      }
      input.value = cleaned;
      try {
        if (cleaned) {
          localStorage.setItem(VOICE_KEY, cleaned);
          if (typeof window.showToast === 'function') window.showToast('Voice saved');
        } else {
          localStorage.removeItem(VOICE_KEY);
          if (typeof window.showToast === 'function') window.showToast('Voice cleared');
        }
      } catch (e) { /* ignore */ }
    }
    
    input.addEventListener('change', save);
    input.addEventListener('input', save);
    input.addEventListener('paste', save);
  }

  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  function resetButton(button) {
    if (!button) return;
    button.textContent = button.dataset.speakLabel || 'Speak';
    button.disabled = false;
    button.classList.remove('is-speaking');
  }

  function stop() {
    if (!current) return;
    const button = current.button;
    try {
      current.audio.pause();
    } catch (e) {
      /* already stopped */
    }
    if (current.url) URL.revokeObjectURL(current.url);
    current = null;
    resetButton(button);
  }

  function currentSpeaker() {
    return window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || '';
  }

  async function speak(text, button) {
    const line = String(text || '').trim();
    if (!line) {
      throw new Error('Nothing to speak');
    }
    if (button && current && current.button === button) {
      stop();
      return;
    }
    stop();
    if (button) {
      if (!button.dataset.speakLabel) button.dataset.speakLabel = button.textContent || 'Speak';
      button.disabled = true;
      button.textContent = '…';
    }

    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: line, speaker: currentSpeaker(), voiceId: voiceId() }),
      });
    } catch (e) {
      resetButton(button);
      throw new Error('Speech request failed');
    }
    const type = response.headers.get('Content-Type') || '';
    if (!response.ok || type.indexOf('audio') === -1) {
      let message = 'Speech failed';
      try {
        const data = await response.json();
        if (data && data.error) message = data.error;
      } catch (e) {
        message = 'Speech failed (HTTP ' + response.status + ')';
      }
      resetButton(button);
      throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    current = { audio: audio, url: url, button: button || null };
    audio.addEventListener('ended', stop);
    audio.addEventListener('error', stop);
    if (button) {
      button.disabled = false;
      button.textContent = 'Stop';
      button.classList.add('is-speaking');
    }
    try {
      await audio.play();
    } catch (e) {
      stop();
      throw new Error('Could not play speech');
    }
  }

  window.BlingusSpeak = { speak: speak, stop: stop, voiceId: voiceId };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindVoiceSetting);
  } else {
    bindVoiceSetting();
  }
})();
