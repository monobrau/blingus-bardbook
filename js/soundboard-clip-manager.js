/**
 * Manage soundboard clips: export, import, and copy between apps (Blingus <-> Galen).
 * Follows the knospe-soundboard-clips contract for cross-app sharing.
 */
window.SoundboardClipManager = (function () {
  'use strict';

  const ENDPOINT = '/api/soundboard.php';
  let characterId = null;
  let selectedClips = new Set();
  let exchangeEnabled = false;
  let incomingBundles = [];

  function getApiKey() {
    try {
      return localStorage.getItem('blingusApiKey') || '';
    } catch (e) {
      return '';
    }
  }

  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const key = getApiKey();
    if (key) headers.Authorization = 'Bearer ' + key;
    return headers;
  }

  function withKey(params) {
    const qs = new URLSearchParams(params);
    const key = getApiKey();
    if (key) qs.set('key', key);
    return qs;
  }

  async function apiPost(body) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
    if (!res.ok || !data || data.success === false) {
      throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  async function apiGet(params) {
    const res = await fetch(ENDPOINT + '?' + withKey(params).toString(), {
      headers: authHeaders(),
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
    if (!res.ok || !data || data.success === false) {
      throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  function toast(msg) {
    if (window.UIUtils && window.UIUtils.showToast) {
      window.UIUtils.showToast(msg);
    } else if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  async function loadClips() {
    const data = await apiGet({ action: 'list', character: characterId });
    return data.clips || [];
  }

  async function checkIncoming() {
    try {
      const data = await apiGet({ action: 'incoming', app: 'blingus' });
      exchangeEnabled = data.exchangeEnabled || false;
      incomingBundles = data.bundles || [];
    } catch (e) {
      exchangeEnabled = false;
      incomingBundles = [];
    }
  }

  async function exportClips() {
    if (selectedClips.size === 0) {
      toast('Select clips to export');
      return;
    }

    const clipIds = Array.from(selectedClips);
    const url = ENDPOINT + '?' + withKey({ action: 'export' }).toString();
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ character: characterId, clipIds: clipIds }),
      });

      if (!res.ok) {
        throw new Error('Export failed');
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'blingus-clips-' + new Date().toISOString().split('T')[0] + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast('Exported ' + clipIds.length + ' clip(s)');
      selectedClips.clear();
    } catch (e) {
      toast(e.message || 'Export failed');
    }
  }

  function showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', async () => {
      if (!input.files || !input.files[0]) return;
      
      const file = input.files[0];
      if (file.size > 25 * 1024 * 1024) {
        toast('File too large (25 MB max)');
        return;
      }

      try {
        const text = await file.text();
        const bundle = JSON.parse(text);
        
        if (bundle.format !== 'knospe-soundboard-clips') {
          toast('Invalid bundle format');
          return;
        }

        const result = await apiPost({
          action: 'import',
          character: characterId,
          bundle: bundle,
        });

        toast('Imported ' + result.imported + ' clip(s)' + 
              (result.skipped > 0 ? ', skipped ' + result.skipped : ''));
        
        if (result.imported > 0) {
          selectedClips.clear();
          render();
        }
      } catch (e) {
        toast(e.message || 'Import failed');
      }
    });
    input.click();
  }

  async function copyToGalen() {
    if (selectedClips.size === 0) {
      toast('Select clips to copy');
      return;
    }

    if (!exchangeEnabled) {
      toast('Direct copy not available on this server');
      return;
    }

    const clipIds = Array.from(selectedClips);
    
    try {
      await apiPost({
        action: 'sendTo',
        character: characterId,
        clipIds: clipIds,
        targetApp: 'galen',
      });

      toast('Sent ' + clipIds.length + ' clip(s) to Galen');
      selectedClips.clear();
      render();
    } catch (e) {
      toast(e.message || 'Send failed');
    }
  }

  async function importIncoming(bundleId) {
    try {
      const result = await apiPost({
        action: 'importIncoming',
        character: characterId,
        bundleId: bundleId,
      });

      toast('Imported ' + result.imported + ' clip(s)' + 
            (result.skipped > 0 ? ', skipped ' + result.skipped : ''));
      
      await checkIncoming();
      if (result.imported > 0) {
        render();
      }
    } catch (e) {
      toast(e.message || 'Import failed');
    }
  }

  async function discardIncoming(bundleId) {
    try {
      await apiPost({
        action: 'discardIncoming',
        bundleId: bundleId,
      });

      toast('Discarded bundle');
      await checkIncoming();
      render();
    } catch (e) {
      toast(e.message || 'Discard failed');
    }
  }

  function toggleClip(clipId) {
    if (selectedClips.has(clipId)) {
      selectedClips.delete(clipId);
    } else {
      selectedClips.add(clipId);
    }
    updateSelectionUI();
  }

  function selectAll(clips) {
    selectedClips.clear();
    clips.forEach((clip) => selectedClips.add(clip.id));
    updateSelectionUI();
  }

  function selectNone() {
    selectedClips.clear();
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const modal = document.getElementById('clipManagerModal');
    if (!modal) return;

    modal.querySelectorAll('.clip-manager__clip').forEach((node) => {
      const clipId = node.getAttribute('data-clip-id');
      const checkbox = node.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = selectedClips.has(clipId);
      }
      node.classList.toggle('is-selected', selectedClips.has(clipId));
    });

    const count = modal.querySelector('.clip-manager__selection-count');
    if (count) {
      count.textContent = selectedClips.size + ' selected';
    }

    const actions = modal.querySelectorAll('.clip-manager__action');
    actions.forEach((btn) => {
      btn.disabled = selectedClips.size === 0;
    });
  }

  async function render() {
    let modal = document.getElementById('clipManagerModal');
    if (!modal) return;

    const body = modal.querySelector('.modal__body');
    if (!body) return;

    body.innerHTML = '';

    const status = el('p', 'clip-manager__status', 'Loading clips...');
    body.appendChild(status);

    try {
      const clips = await loadClips();
      body.innerHTML = '';

      if (incomingBundles.length > 0) {
        const incomingSection = el('section', 'clip-manager__incoming');
        incomingSection.appendChild(el('h3', 'clip-manager__title', '📥 Incoming clips from Galen'));
        
        incomingBundles.forEach((bundle) => {
          const item = el('div', 'clip-manager__incoming-item');
          const info = el('div', 'clip-manager__incoming-info');
          const preview = bundle.preview || {};
          info.appendChild(el('div', 'clip-manager__incoming-source', 
            'From ' + (preview.sourceApp || 'unknown') + ' - ' + 
            (preview.clipCount || 0) + ' clip(s)'));
          if (bundle.receivedAt) {
            const date = new Date(bundle.receivedAt);
            info.appendChild(el('div', 'clip-manager__incoming-date', 
              'Received ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString()));
          }
          item.appendChild(info);
          
          const actions = el('div', 'clip-manager__incoming-actions');
          const importBtn = el('button', 'btn btn--compact', 'Import');
          importBtn.type = 'button';
          importBtn.addEventListener('click', () => importIncoming(bundle.bundleId));
          actions.appendChild(importBtn);
          
          const discardBtn = el('button', 'btn btn--secondary btn--compact', 'Discard');
          discardBtn.type = 'button';
          discardBtn.addEventListener('click', () => discardIncoming(bundle.bundleId));
          actions.appendChild(discardBtn);
          
          item.appendChild(actions);
          incomingSection.appendChild(item);
        });
        
        body.appendChild(incomingSection);
      }

      const section = el('section', 'clip-manager__section');
      const header = el('div', 'clip-manager__header');
      header.appendChild(el('h3', 'clip-manager__title', 'Your clips'));
      
      const selectionBar = el('div', 'clip-manager__selection-bar');
      const count = el('span', 'clip-manager__selection-count', '0 selected');
      selectionBar.appendChild(count);
      
      const selectAllBtn = el('button', 'btn btn--ghost btn--compact', 'Select all');
      selectAllBtn.type = 'button';
      selectAllBtn.addEventListener('click', () => selectAll(clips));
      selectionBar.appendChild(selectAllBtn);
      
      const selectNoneBtn = el('button', 'btn btn--ghost btn--compact', 'Clear');
      selectNoneBtn.type = 'button';
      selectNoneBtn.addEventListener('click', selectNone);
      selectionBar.appendChild(selectNoneBtn);
      
      header.appendChild(selectionBar);
      section.appendChild(header);

      if (clips.length === 0) {
        section.appendChild(el('p', 'clip-manager__empty', 'No clips yet. Create clips above to get started.'));
      } else {
        const list = el('div', 'clip-manager__list');
        
        clips.forEach((clip) => {
          const item = el('div', 'clip-manager__clip');
          item.setAttribute('data-clip-id', clip.id);
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = selectedClips.has(clip.id);
          checkbox.addEventListener('change', () => toggleClip(clip.id));
          item.appendChild(checkbox);
          
          const icon = el('span', 'clip-manager__icon', clip.icon || '🔊');
          item.appendChild(icon);
          
          const info = el('div', 'clip-manager__info');
          info.appendChild(el('div', 'clip-manager__name', clip.label || 'Untitled'));
          const source = clip.source === 'speech' ? 'Spoken' : 
                       clip.source === 'elevenlabs' ? 'Sound effect' : 'Audio clip';
          info.appendChild(el('div', 'clip-manager__meta', source));
          item.appendChild(info);
          
          if (clip.loop) {
            item.appendChild(el('span', 'clip-manager__badge', '🔁'));
          }
          
          list.appendChild(item);
        });
        
        section.appendChild(list);
      }

      body.appendChild(section);
      updateSelectionUI();

    } catch (e) {
      body.innerHTML = '';
      body.appendChild(el('p', 'clip-manager__error', 'Failed to load clips: ' + e.message));
    }
  }

  function close() {
    const modal = document.getElementById('clipManagerModal');
    if (modal) modal.remove();
    selectedClips.clear();
  }

  async function open(charId) {
    characterId = charId;
    selectedClips.clear();
    
    await checkIncoming();

    let modal = document.getElementById('clipManagerModal');
    if (modal) {
      modal.remove();
    }

    modal = el('div', 'modal clip-manager-modal show');
    modal.id = 'clipManagerModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'clipManagerTitle');
    modal.setAttribute('aria-hidden', 'false');

    const content = el('div', 'modal__content');

    const header = el('div', 'modal__header');
    header.appendChild(el('h2', null, 'Manage clips'));
    header.id = 'clipManagerTitle';
    const closeBtn = el('button', 'modal__close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', close);
    header.appendChild(closeBtn);
    content.appendChild(header);

    const body = el('div', 'modal__body');
    content.appendChild(body);

    const footer = el('div', 'modal__footer');
    
    const exportBtn = el('button', 'btn clip-manager__action', 'Export selected');
    exportBtn.type = 'button';
    exportBtn.addEventListener('click', exportClips);
    footer.appendChild(exportBtn);

    const importBtn = el('button', 'btn btn--secondary', 'Import from file');
    importBtn.type = 'button';
    importBtn.addEventListener('click', showImportDialog);
    footer.appendChild(importBtn);

    if (exchangeEnabled) {
      const copyBtn = el('button', 'btn clip-manager__action', 'Copy to Galen');
      copyBtn.type = 'button';
      copyBtn.addEventListener('click', copyToGalen);
      footer.appendChild(copyBtn);
    }

    const doneBtn = el('button', 'btn btn--secondary', 'Done');
    doneBtn.type = 'button';
    doneBtn.addEventListener('click', close);
    footer.appendChild(doneBtn);

    content.appendChild(footer);
    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.body.appendChild(modal);
    
    render();
  }

  return {
    open: open,
  };
})();
