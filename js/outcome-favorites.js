/**
 * Favorites for generated outcomes (same record shape as Galen).
 * Saving never generates speech; audio is attached only when the caller already has it.
 */
(function () {
  'use strict';

  const ENDPOINT = 'api/soundboard.php';

  function getCharacter() {
    return window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || 'blingus';
  }

  function apiKey() {
    try {
      return window.API_KEY || localStorage.getItem('blingusApiKey') || '';
    } catch (e) {
      return '';
    }
  }

  function headers() {
    const h = { 'Content-Type': 'application/json' };
    const key = apiKey();
    if (key) h.Authorization = 'Bearer ' + key;
    return h;
  }

  async function post(body) {
    const response = await fetch(ENDPOINT, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    let data = null;
    try { data = await response.json(); } catch (e) { /* not json */ }
    if (!response.ok || !data || !data.success) {
      throw new Error((data && data.error) || 'Favorites request failed');
    }
    return data;
  }

  async function save(text, opts) {
    const o = opts || {};
    const data = await post({
      action: 'saveFavorite',
      character: getCharacter(),
      text: String(text || ''),
      displayName: o.displayName || null,
      audioBase64: o.audioBase64 || null,
      mime: o.mime || null,
      voiceId: window.BlingusSpeak?.voiceId?.() || null,
    });
    return { favorite: data.favorite, created: data.created };
  }

  async function remove(favoriteId) {
    await post({ action: 'deleteFavorite', character: getCharacter(), id: favoriteId });
    return true;
  }

  async function list() {
    const qs = new URLSearchParams({ action: 'listFavorites', character: getCharacter() });
    const response = await fetch(ENDPOINT + '?' + qs.toString(), { headers: headers() });
    const data = await response.json();
    if (!data || !data.success) {
      throw new Error((data && data.error) || 'Could not list favorites');
    }
    return data.favorites || [];
  }

  async function updateDisplayName(favoriteId, displayName) {
    await post({
      action: 'updateFavoriteDisplayName',
      character: getCharacter(),
      id: favoriteId,
      displayName: displayName || '',
    });
    return true;
  }

  function downloadUrl(favorite) {
    if (!favorite || !favorite.audioFile) return null;
    const qs = new URLSearchParams({
      action: 'favorite-file',
      character: getCharacter(),
      file: favorite.audioFile,
      download: '1',
    });
    const key = apiKey();
    if (key) qs.set('key', key);
    return ENDPOINT + '?' + qs.toString();
  }

  window.OutcomeFavorites = {
    save: save,
    remove: remove,
    list: list,
    updateDisplayName: updateDisplayName,
    downloadUrl: downloadUrl,
  };
})();
