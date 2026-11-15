/**
 * Favorites for generated outcomes.
 * Save outcome text + audio, manage display names, replay from Sound Board.
 */
(function () {
  'use strict';

  const ENDPOINT = '/api/soundboard.php';

  function getCharacter() {
    return window.BlingusSite?.themeCharacterId?.()
      || window.BlingusSite?.lockedCharacterId?.()
      || window.CharacterSheet?.getActiveId?.()
      || 'blingus';
  }

  function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = window.API_KEY || localStorage.getItem('blingusApiKey');
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  async function save(outcomeId, audioBase64, displayName) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'saveFavorite',
        character: getCharacter(),
        outcomeId: outcomeId,
        audioBase64: audioBase64,
        displayName: displayName || null,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Could not save favorite');
    }

    return data.favorite;
  }

  async function remove(favoriteId) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'deleteFavorite',
        character: getCharacter(),
        id: favoriteId,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Could not delete favorite');
    }

    return true;
  }

  async function list() {
    const response = await fetch(ENDPOINT + '?action=listFavorites&character=' + encodeURIComponent(getCharacter()), {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Could not list favorites');
    }

    return data.favorites || [];
  }

  async function updateDisplayName(favoriteId, displayName) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'updateFavoriteDisplayName',
        character: getCharacter(),
        id: favoriteId,
        displayName: displayName || null,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Could not update display name');
    }

    return true;
  }

  function audioUrl(favoriteId) {
    return ENDPOINT + '?action=favorite-file&character=' + encodeURIComponent(getCharacter()) + '&id=' + encodeURIComponent(favoriteId);
  }

  window.OutcomeFavorites = {
    save: save,
    remove: remove,
    list: list,
    updateDisplayName: updateDisplayName,
    audioUrl: audioUrl,
  };
})();
