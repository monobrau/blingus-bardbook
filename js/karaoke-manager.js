/**
 * Karaoke Manager — search YouTube, download locally, play in modal
 */
window.BlingusKaraoke = (function () {
  'use strict';

  const ENDPOINT = '/api/karaoke.php';
  let apiAvailable = null;
  let pendingLocal = null;

  function getApiKey() {
    try {
      return localStorage.getItem('blingusApiKey') || '';
    } catch (e) {
      return '';
    }
  }

  function authHeaders() {
    const key = getApiKey();
    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = 'Bearer ' + key;
    return headers;
  }

  function authQuery() {
    const key = getApiKey();
    return key ? '&key=' + encodeURIComponent(key) : '';
  }

  async function apiGet(params) {
    const qs = new URLSearchParams(params);
    const key = getApiKey();
    if (key) qs.set('key', key);
    const res = await fetch(ENDPOINT + '?' + qs.toString(), { headers: authHeaders() });
    return res.json();
  }

  async function apiPost(body) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function ping() {
    try {
      const data = await apiGet({ action: 'ping' });
      apiAvailable = !!(data.success && data.ytdlp);
      return apiAvailable;
    } catch (e) {
      apiAvailable = false;
      return false;
    }
  }

  async function isAvailable() {
    if (apiAvailable === null) await ping();
    return apiAvailable;
  }

  function getStreamUrl(videoId) {
    if (!videoId) return '';
    return ENDPOINT + '?action=stream&id=' + encodeURIComponent(videoId) + authQuery();
  }

  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function toast(msg) {
    if (window.UIUtils && window.UIUtils.showToast) {
      window.UIUtils.showToast(msg);
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  // --- Player modal elements (initialized on DOM ready) ---
  let playerModal, playerTitle, playerVideo, playerIframe, playerContainer, playerClose, playerCloseBtn;

  function initPlayerElements() {
    playerModal = document.getElementById('youtubePlayerModal');
    playerTitle = document.getElementById('youtubePlayerTitle');
    playerVideo = document.getElementById('karaokeLocalVideo');
    playerIframe = document.getElementById('youtubePlayerFrame');
    playerContainer = document.getElementById('youtubePlayerContainer');
    playerClose = document.getElementById('youtubePlayerClose');
    playerCloseBtn = document.getElementById('youtubePlayerCloseBtn');

    if (playerClose) playerClose.addEventListener('click', closePlayer);
    if (playerCloseBtn) playerCloseBtn.addEventListener('click', closePlayer);
    if (playerModal) {
      playerModal.addEventListener('click', (e) => {
        if (e.target === playerModal) closePlayer();
      });
    }
  }

  function closePlayer() {
    if (playerModal) {
      playerModal.classList.remove('show');
      playerModal.setAttribute('aria-hidden', 'true');
    }
    if (playerVideo) {
      playerVideo.pause();
      playerVideo.removeAttribute('src');
      playerVideo.load();
      playerVideo.style.display = 'none';
    }
    if (playerIframe) {
      playerIframe.src = '';
      playerIframe.style.display = 'none';
    }
  }

  function playLocal(videoId, startTime, title) {
    if (!playerVideo || !playerModal) {
      toast('Player not ready');
      return;
    }
    if (playerIframe) playerIframe.style.display = 'none';
    playerVideo.style.display = 'block';
    if (playerTitle) playerTitle.textContent = '🎵 ' + (title || 'Karaoke Track');
    playerModal.classList.add('show');
    playerModal.setAttribute('aria-hidden', 'false');

    const url = getStreamUrl(videoId);
    const start = Math.floor(startTime || 0);

    const onReady = () => {
      if (start > 0) playerVideo.currentTime = start;
      playerVideo.play().catch(() => toast('Tap play to start video'));
    };

    playerVideo.onloadedmetadata = onReady;
    playerVideo.src = url;
    playerVideo.load();
  }

  function playYouTubeTab(videoId, startTime, title) {
    const startSeconds = Math.floor(startTime || 0);
    const params = new URLSearchParams();
    params.set('v', videoId);
    if (startSeconds > 0) params.set('t', String(startSeconds));
    params.set('autoplay', '1');
    window.open('https://www.youtube.com/watch?' + params.toString(), '_blank');
    toast('Opening ' + (title || 'Karaoke') + ' on YouTube...');
  }

  async function playItem(item, titleOverride) {
    const videoId = item.localKaraoke || item.youtube;
    const startTime = item.startTime || 0;
    const title = titleOverride || item.s || 'Karaoke Track';

    if (item.localKaraoke) {
      playLocal(item.localKaraoke, startTime, title);
      return;
    }
    if (item.localKaraoke === undefined && item.youtube && await isAvailable()) {
      const exists = await apiGet({ action: 'exists', id: item.youtube });
      if (exists.success && exists.exists) {
        playLocal(item.youtube, startTime, title);
        return;
      }
    }
    if (item.youtube) {
      playYouTubeTab(item.youtube, startTime, title);
      return;
    }
    toast('No karaoke track linked');
  }

  // --- Search modal ---
  let searchModal, searchResults, searchStatus, searchQueryLabel;

  function initSearchElements() {
    searchModal = document.getElementById('karaokeSearchModal');
    searchResults = document.getElementById('karaokeSearchResults');
    searchStatus = document.getElementById('karaokeSearchStatus');
    searchQueryLabel = document.getElementById('karaokeSearchQuery');
    const closeBtn = document.getElementById('karaokeSearchClose');
    const closeBtn2 = document.getElementById('karaokeSearchCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (closeBtn2) closeBtn2.addEventListener('click', closeSearch);
    if (searchModal) {
      searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearch();
      });
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('show');
      searchModal.setAttribute('aria-hidden', 'true');
    }
  }

  let searchCallback = null;

  async function openSearch(song, artist, onSelect) {
    if (!(await isAvailable())) {
      toast('Karaoke download unavailable — install yt-dlp on server (see KARAOKE_SETUP.md)');
      const fallback = 'https://www.youtube.com/results?search_query=' +
        encodeURIComponent(song + ' ' + artist + ' karaoke');
      window.open(fallback, '_blank');
      return;
    }

    searchCallback = onSelect;
    if (searchQueryLabel) searchQueryLabel.textContent = song + ' — ' + artist;
    if (searchStatus) searchStatus.textContent = 'Searching YouTube...';
    if (searchResults) searchResults.innerHTML = '';
    if (searchModal) {
      searchModal.classList.add('show');
      searchModal.setAttribute('aria-hidden', 'false');
    }

    try {
      const data = await apiGet({ action: 'search', song, artist });
      if (!data.success || !data.results || data.results.length === 0) {
        if (searchStatus) searchStatus.textContent = 'No results found. Try different spelling.';
        return;
      }
      if (searchStatus) searchStatus.textContent = data.results.length + ' results — select one to download';
      renderSearchResults(data.results);
    } catch (e) {
      if (searchStatus) searchStatus.textContent = 'Search failed: ' + e.message;
    }
  }

  function renderSearchResults(results) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    results.forEach((row) => {
      const el = document.createElement('div');
      el.className = 'karaoke-result';
      el.innerHTML =
        '<img class="karaoke-result__thumb" src="' + escapeAttr(row.thumbnail) + '" alt="" loading="lazy" />' +
        '<div class="karaoke-result__info">' +
        '<div class="karaoke-result__title">' + escapeHtml(row.title) + '</div>' +
        '<div class="karaoke-result__meta">' + escapeHtml(row.channel) +
        (row.duration ? ' · ' + formatDuration(row.duration) : '') + '</div>' +
        '</div>' +
        '<button type="button" class="btn karaoke-result__select">Select</button>';

      el.querySelector('.karaoke-result__select').addEventListener('click', () => selectResult(row));
      searchResults.appendChild(el);
    });
  }

  function escapeHtml(s) {
    if (window.SharedUtils && window.SharedUtils.escapeHtml) {
      return window.SharedUtils.escapeHtml(s);
    }
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  async function selectResult(row) {
    if (searchStatus) searchStatus.textContent = 'Downloading… this may take a minute';
    if (searchResults) searchResults.style.opacity = '0.5';

    try {
      const data = await apiPost({ action: 'download', videoId: row.id });
      if (!data.success) throw new Error(data.error || 'Download failed');

      pendingLocal = {
        localKaraoke: row.id,
        youtube: row.id,
        title: row.title,
      };

      if (typeof searchCallback === 'function') {
        searchCallback(pendingLocal, row);
      }

      toast(data.cached ? 'Karaoke already on server' : 'Karaoke downloaded!');
      closeSearch();
    } catch (e) {
      toast('Download failed: ' + e.message);
      if (searchStatus) searchStatus.textContent = 'Download failed — try another video';
    } finally {
      if (searchResults) searchResults.style.opacity = '1';
    }
  }

  function getPending() {
    return pendingLocal;
  }

  function clearPending() {
    pendingLocal = null;
  }

  function setPendingFromItem(item) {
    if (item && item.localKaraoke) {
      pendingLocal = { localKaraoke: item.localKaraoke, youtube: item.youtube || item.localKaraoke };
    } else {
      pendingLocal = null;
    }
  }

  function init() {
    initPlayerElements();
    initSearchElements();
    ping();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    ping,
    isAvailable,
    openSearch,
    playItem,
    playLocal,
    playYouTubeTab,
    getStreamUrl,
    getPending,
    clearPending,
    setPendingFromItem,
    closePlayer,
    closeSearch,
  };
})();
