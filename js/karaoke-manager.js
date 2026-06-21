/**
 * Karaoke Manager — search YouTube, download locally, play in modal
 */
window.BlingusKaraoke = (function () {
  'use strict';

  const ENDPOINT = '/api/karaoke.php';
  const LAYOUT_KEY = 'blingusKaraokePlayerLayout';
  const MIN_PLAYER_WIDTH = 520;
  const MIN_PLAYER_HEIGHT = 400;
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

  function getStreamUrl(videoId, startSeconds) {
    if (!videoId) return '';
    let url = ENDPOINT + '?action=stream&id=' + encodeURIComponent(videoId) + authQuery();
    const start = normalizeStartTime(startSeconds);
    if (start > 0) url += '#t=' + start;
    return url;
  }

  function normalizeStartTime(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.max(0, Math.floor(value));
    }
    if (window.SharedUtils && window.SharedUtils.parseTimeToSeconds) {
      return Math.max(0, Math.floor(window.SharedUtils.parseTimeToSeconds(value)));
    }
    const parsed = parseInt(String(value).trim(), 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
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
  let playerModal, playerContent, playerTitle, playerVideo, playerContainer, playerClose, playerCloseBtn;
  let lyricsPanel, lyricsMeta, lyricsText, playerLoading, playerLoadingText;
  let resizeHandle, resetSizeBtn, youtubeFallback, youtubeOpenTabBtn;
  let externalWatchUrl = '';

  function getDefaultLayout() {
    return clampLayout(
      Math.min(1400, Math.round(window.innerWidth * 0.96)),
      Math.min(860, Math.round(window.innerHeight * 0.88))
    );
  }

  function clampLayout(width, height) {
    const maxW = Math.round(window.innerWidth * 0.98);
    const maxH = Math.round(window.innerHeight * 0.98);
    return {
      width: Math.max(MIN_PLAYER_WIDTH, Math.min(Math.round(width), maxW)),
      height: Math.max(MIN_PLAYER_HEIGHT, Math.min(Math.round(height), maxH)),
    };
  }

  function loadLayout() {
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.width && parsed.height) {
          return clampLayout(parsed.width, parsed.height);
        }
      }
    } catch (e) {
      /* ignore invalid saved layout */
    }
    return getDefaultLayout();
  }

  function saveLayout(layout) {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    } catch (e) {
      /* ignore quota / private mode */
    }
  }

  function applyLayout(layout) {
    if (!playerContent || !layout) return;
    playerContent.style.width = layout.width + 'px';
    playerContent.style.height = layout.height + 'px';
  }

  function initPlayerResize() {
    if (!resizeHandle || !playerContent) return;

    function startResize(clientX, clientY) {
      const startX = clientX;
      const startY = clientY;
      const startW = playerContent.offsetWidth;
      const startH = playerContent.offsetHeight;
      let latestLayout = null;

      playerContent.classList.add('is-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';

      function onMove(ev) {
        const point = ev.touches ? ev.touches[0] : ev;
        latestLayout = clampLayout(
          startW + (point.clientX - startX),
          startH + (point.clientY - startY)
        );
        applyLayout(latestLayout);
      }

      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        playerContent.classList.remove('is-resizing');
        if (latestLayout) saveLayout(latestLayout);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startResize(e.clientX, e.clientY);
    });

    resizeHandle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      startResize(touch.clientX, touch.clientY);
    }, { passive: false });
  }

  function resetPlayerLayout() {
    const layout = getDefaultLayout();
    applyLayout(layout);
    saveLayout(layout);
    toast('Player size reset');
  }

  function initPlayerElements() {
    playerModal = document.getElementById('youtubePlayerModal');
    playerContent = document.getElementById('karaokePlayerContent');
    playerTitle = document.getElementById('youtubePlayerTitle');
    playerVideo = document.getElementById('karaokeLocalVideo');
    playerContainer = document.getElementById('youtubePlayerContainer');
    playerClose = document.getElementById('youtubePlayerClose');
    playerCloseBtn = document.getElementById('youtubePlayerCloseBtn');
    youtubeFallback = document.getElementById('youtubeFallback');
    youtubeOpenTabBtn = document.getElementById('youtubeOpenTabBtn');
    lyricsPanel = document.getElementById('karaokeLyricsPanel');
    lyricsMeta = document.getElementById('karaokeLyricsMeta');
    lyricsText = document.getElementById('karaokeLyricsText');
    playerLoading = document.getElementById('karaokePlayerLoading');
    playerLoadingText = document.getElementById('karaokePlayerLoadingText');
    resizeHandle = document.getElementById('karaokePlayerResizeHandle');
    resetSizeBtn = document.getElementById('karaokePlayerResetSizeBtn');

    applyLayout(loadLayout());
    initPlayerResize();

    if (playerClose) playerClose.addEventListener('click', closePlayer);
    if (playerCloseBtn) playerCloseBtn.addEventListener('click', closePlayer);
    if (resetSizeBtn) resetSizeBtn.addEventListener('click', resetPlayerLayout);
    if (youtubeOpenTabBtn) {
      youtubeOpenTabBtn.addEventListener('click', () => openExternalWatchUrl());
    }
    if (playerModal) {
      playerModal.addEventListener('click', (e) => {
        if (e.target === playerModal) closePlayer();
      });
    }

    window.addEventListener('resize', () => {
      if (!playerContent) return;
      applyLayout(clampLayout(playerContent.offsetWidth, playerContent.offsetHeight));
    });
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
    hideExternalFallback();
    hidePlayerLoading();
    clearLyricsPanel();
    externalWatchUrl = '';
  }

  function hideExternalFallback() {
    if (youtubeFallback) youtubeFallback.hidden = true;
  }

  function getYouTubeWatchUrl(videoId, startTime) {
    const start = normalizeStartTime(startTime);
    const params = new URLSearchParams();
    params.set('v', videoId);
    if (start > 0) params.set('t', String(start));
    params.set('autoplay', '1');
    return 'https://www.youtube.com/watch?' + params.toString();
  }

  function openExternalWatchUrl() {
    if (!externalWatchUrl) return;
    window.open(externalWatchUrl, '_blank', 'noopener,noreferrer');
    toast('Opened YouTube — lyrics stay here for sing-along');
  }

  function showYouTubeExternalFallback(videoId, startTime, title, item, options) {
    if (!playerModal) {
      toast('Player not ready');
      return;
    }
    const opts = options || {};
    hidePlayerLoading();
    if (playerVideo) {
      playerVideo.pause();
      playerVideo.removeAttribute('src');
      playerVideo.load();
      playerVideo.style.display = 'none';
    }
    externalWatchUrl = getYouTubeWatchUrl(videoId, startTime);
    openPlayerModal(title, item);
    if (youtubeFallback) youtubeFallback.hidden = false;
    if (opts.autoOpen) openExternalWatchUrl();
  }

  function hidePlayerLoading() {
    if (playerLoading) playerLoading.hidden = true;
  }

  function showPlayerLoading(message) {
    if (playerVideo) playerVideo.style.display = 'none';
    hideExternalFallback();
    if (playerLoadingText) playerLoadingText.textContent = message || 'Loading…';
    if (playerLoading) playerLoading.hidden = false;
  }

  function openPlayerModal(title, item) {
    if (playerTitle) playerTitle.textContent = '🎵 ' + (title || 'Karaoke Track');
    setLyricsPanel(item, title);
    if (playerModal) {
      playerModal.classList.add('show');
      playerModal.setAttribute('aria-hidden', 'false');
    }
  }

  function clearLyricsPanel() {
    if (lyricsMeta) lyricsMeta.textContent = '';
    if (lyricsText) lyricsText.textContent = '';
  }

  function setLyricsPanel(item, titleFallback) {
    if (!lyricsPanel || !lyricsMeta || !lyricsText) return;

    const parody = (item && item.t) ? String(item.t).trim() : '';
    const song = (item && item.s) ? String(item.s).trim() : '';
    const artist = (item && item.a) ? String(item.a).trim() : '';
    const title = titleFallback || song || 'Karaoke Track';
    const start = normalizeStartTime(item && item.startTime);

    let metaText = '';
    if (song || artist) {
      metaText = 'Song: ' + song + (artist ? ' — ' + artist : '');
    } else {
      metaText = title;
    }
    if (start > 0) {
      metaText += ' · Starts at ' + formatDuration(start);
    }
    lyricsMeta.textContent = metaText;

    if (parody) {
      lyricsText.textContent = parody;
    } else {
      lyricsText.textContent = 'No parody lyrics for this item.';
    }
  }

  function beginVideoPlayback(video, startSeconds) {
    const start = normalizeStartTime(startSeconds);
    let started = false;

    function playNow() {
      if (started) return;
      started = true;
      video.play().catch(function () {
        toast('Tap play to start video');
      });
    }

    if (start <= 0) {
      video.addEventListener('canplay', playNow, { once: true });
      return;
    }

    function seekToStart() {
      if (!video.duration || start <= video.duration) {
        try {
          video.currentTime = start;
          return;
        } catch (e) {
          playNow();
        }
      } else {
        playNow();
      }
    }

    video.addEventListener('loadedmetadata', seekToStart, { once: true });
    video.addEventListener('seeked', function () {
      if (Math.abs(video.currentTime - start) < 2) playNow();
    }, { once: true });
    video.addEventListener('canplay', function () {
      if (Math.abs(video.currentTime - start) >= 1) {
        seekToStart();
      }
      setTimeout(playNow, 150);
    }, { once: true });
  }

  function playLocal(videoId, startTime, title, item) {
    if (!playerVideo || !playerModal) {
      toast('Player not ready');
      return;
    }
    hidePlayerLoading();
    hideExternalFallback();
    playerVideo.style.display = 'block';
    openPlayerModal(title, item);

    const start = normalizeStartTime(startTime);
    playerVideo.onloadedmetadata = null;
    playerVideo.oncanplay = null;
    playerVideo.onseeked = null;
    playerVideo.src = getStreamUrl(videoId, start);
    playerVideo.load();
    beginVideoPlayback(playerVideo, start);
  }

  async function playWithDownload(videoId, startTime, title, item) {
    openPlayerModal(title, item);
    showPlayerLoading('Downloading karaoke to server… this may take a minute.');

    try {
      const data = await apiPost({ action: 'download', videoId: videoId });
      if (!data.success) throw new Error(data.error || 'Download failed');
      toast(data.cached ? 'Playing cached karaoke' : 'Karaoke downloaded!');
      playLocal(videoId, startTime, title, item);
    } catch (e) {
      toast('Download failed — open YouTube in a new tab instead');
      showYouTubeExternalFallback(videoId, startTime, title, item, { autoOpen: true });
    }
  }

  async function playItem(item, titleOverride) {
    const videoId = item.localKaraoke || item.youtube;
    const startTime = normalizeStartTime(item.startTime);
    const title = titleOverride || item.s || 'Karaoke Track';
    const playbackItem = Object.assign({}, item, { startTime: startTime });

    if (!videoId) {
      toast('No karaoke track linked');
      return;
    }

    if (item.localKaraoke) {
      playLocal(item.localKaraoke, startTime, title, playbackItem);
      return;
    }

    if (item.youtube && await isAvailable()) {
      const exists = await apiGet({ action: 'exists', id: item.youtube });
      if (exists.success && exists.exists) {
        playLocal(item.youtube, startTime, title, playbackItem);
        return;
      }
      await playWithDownload(item.youtube, startTime, title, playbackItem);
      return;
    }

    if (item.youtube) {
      showYouTubeExternalFallback(item.youtube, startTime, title, playbackItem, { autoOpen: true });
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
    openExternalWatchUrl,
    getYouTubeWatchUrl,
    getStreamUrl,
    getPending,
    clearPending,
    setPendingFromItem,
    resetPlayerLayout,
    closePlayer,
    closeSearch,
  };
})();
