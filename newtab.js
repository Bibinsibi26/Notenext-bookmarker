// TabVault 2.0 — New Tab Dashboard Logic
import { Storage } from './storage.js';

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════
const state = {
  workspaces: [],
  folders: [],
  bookmarks: [],
  tags: [],
  settings: {},
  activeWorkspaceId: null,
  // Context menus
  ctxFolderId: null,
  ctxBookmarkId: null,
  // Confirm
  confirmCb: null,
  // Editing
  editingBookmarkId: null,
  editingFolderId: null,
  editingWorkspaceId: null,
  // Add bookmark to specific folder (from card)
  targetFolderId: null
};

// ═══════════════════════════════════════════════════════════
//  DOM
// ═══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const dom = {
  // Workspace bar
  wsArrowLeft:  $('wsArrowLeft'),
  wsArrowRight: $('wsArrowRight'),
  wsTabsScroll: $('wsTabsScroll'),
  wsTabs:       $('wsTabs'),
  wsAddBtn:     $('wsAddBtn'),
  // Cards
  cardsGrid:    $('cardsGrid'),
  cardsArea:    $('cardsArea'),
  wsEmpty:      $('wsEmpty'),
  // FAB
  fabSearch:       $('fabSearch'),
  fabAddBookmark:  $('fabAddBookmark'),
  fabSettings:     $('fabSettings'),
  fabAddFolder:    $('fabAddFolder'),
  // Search
  searchOverlay:     $('searchOverlay'),
  searchBackdrop:    $('searchBackdrop'),
  searchPanelInput:  $('searchPanelInput'),
  searchPanelClose:  $('searchPanelClose'),
  searchResults:     $('searchResults'),
  searchPlaceholder: $('searchPlaceholder'),
  // Modal overlay
  modalOverlay: $('modalOverlay'),
  // Bookmark modal
  bookmarkModal:       $('bookmarkModal'),
  bookmarkModalTitle:  $('bookmarkModalTitle'),
  bookmarkModalClose:  $('bookmarkModalClose'),
  bookmarkModalCancel: $('bookmarkModalCancel'),
  bookmarkModalSave:   $('bookmarkModalSave'),
  bmUrl:        $('bmUrl'),
  bmTitle:      $('bmTitle'),
  bmWorkspace:  $('bmWorkspace'),
  bmFolder:     $('bmFolder'),
  bmNotes:      $('bmNotes'),
  // Folder modal
  folderModal:       $('folderModal'),
  folderModalTitle:  $('folderModalTitle'),
  folderModalClose:  $('folderModalClose'),
  folderModalCancel: $('folderModalCancel'),
  folderModalSave:   $('folderModalSave'),
  folderName:        $('folderName'),
  folderWorkspace:   $('folderWorkspace'),
  // Workspace modal
  workspaceModal:       $('workspaceModal'),
  workspaceModalTitle:  $('workspaceModalTitle'),
  workspaceModalClose:  $('workspaceModalClose'),
  workspaceModalCancel: $('workspaceModalCancel'),
  workspaceModalSave:   $('workspaceModalSave'),
  workspaceName:        $('workspaceName'),
  // Settings
  settingsModal:       $('settingsModal'),
  settingsModalClose:  $('settingsModalClose'),
  settingsExportBtn:   $('settingsExportBtn'),
  settingsImportBtn:   $('settingsImportBtn'),
  settingsClearBtn:    $('settingsClearBtn'),
  setFavicons:         $('setFavicons'),
  setCompact:          $('setCompact'),
  // Confirm
  confirmModal:    $('confirmModal'),
  confirmTitle:    $('confirmTitle'),
  confirmMessage:  $('confirmMessage'),
  confirmIcon:     $('confirmIcon'),
  confirmCancel:   $('confirmCancel'),
  confirmOk:       $('confirmOk'),
  // Context menus
  ctxMenu:         $('ctxMenu'),
  ctxAddBookmark:  $('ctxAddBookmark'),
  ctxEditFolder:   $('ctxEditFolder'),
  ctxDeleteFolder: $('ctxDeleteFolder'),
  bmCtxMenu:       $('bmCtxMenu'),
  bmCtxOpen:       $('bmCtxOpen'),
  bmCtxCopy:       $('bmCtxCopy'),
  bmCtxEdit:       $('bmCtxEdit'),
  bmCtxDelete:     $('bmCtxDelete'),
  // Toast
  toastWrap: $('toastWrap'),
  // File inputs (hidden)
  importFile:    $('importFile'),
  wallpaperFile: $('wallpaperFile'),
  // Appearance settings
  setAccentColor:             $('setAccentColor'),
  accentSwatch:               $('accentSwatch'),
  settingsWallpaperBtn:       $('settingsWallpaperBtn'),
  settingsRemoveWallpaperBtn: $('settingsRemoveWallpaperBtn')
};

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  const data = await Storage.init();
  state.workspaces = data.workspaces || [];
  state.folders    = data.folders    || [];
  state.bookmarks  = data.bookmarks  || [];
  state.tags       = data.tags       || [];
  state.settings   = { ...Storage.defaults.settings, ...data.settings };
  state.activeWorkspaceId = state.settings.activeWorkspaceId ||
    (state.workspaces[0]?.id ?? null);

  renderWorkspaceTabs();
  renderCards();
  setupListeners();
  setupMessageListener();
  initCustomSelects();
  // Apply persisted appearance settings
  applyAccentColor(state.settings.accentColor || '#2d8f46');
  if (state.settings.wallpaper) applyWallpaper(state.settings.wallpaper);
}

// ═══════════════════════════════════════════════════════════
//  RENDER WORKSPACE TABS
// ═══════════════════════════════════════════════════════════
function renderWorkspaceTabs() {
  dom.wsTabs.innerHTML = state.workspaces.map(ws => `
    <button class="ws-tab ${ws.id === state.activeWorkspaceId ? 'active' : ''}"
            data-ws-id="${ws.id}"
            title="${esc(ws.name)}">
      ${esc(ws.name)}
    </button>
  `).join('');

  dom.wsTabs.querySelectorAll('[data-ws-id]').forEach(btn => {
    btn.addEventListener('click', () => switchWorkspace(btn.dataset.wsId));
  });

  // Scroll active tab into view
  const active = dom.wsTabs.querySelector('.ws-tab.active');
  if (active) active.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
}

function switchWorkspace(wsId) {
  state.activeWorkspaceId = wsId;
  Storage.updateSettings({ activeWorkspaceId: wsId });
  renderWorkspaceTabs();
  renderCards();
}

// ═══════════════════════════════════════════════════════════
//  RENDER FOLDER CARDS
// ═══════════════════════════════════════════════════════════
function renderCards() {
  // Home workspace (first workspace) shows ALL folders across every workspace
  const homeId = state.workspaces[0]?.id;
  const isHome = state.activeWorkspaceId === homeId;
  const activeFolders = isHome
    ? [...state.folders]
    : state.folders.filter(f => f.workspaceId === state.activeWorkspaceId);

  if (!activeFolders.length) {
    dom.cardsGrid.innerHTML = '';
    dom.wsEmpty.style.display = 'flex';
    return;
  }

  dom.wsEmpty.style.display = 'none';
  dom.cardsGrid.innerHTML = activeFolders.map(folder => renderCard(folder)).join('');

  // Attach card-level listeners
  dom.cardsGrid.querySelectorAll('[data-card-folder]').forEach(card => {
    const fid = card.dataset.cardFolder;

    // Card header context menu
    card.querySelector('[data-card-menu]')?.addEventListener('click', e => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      showFolderCtx(rect.left, rect.bottom + 4, fid);
    });

    // Card right-click context menu
    card.querySelector('.card-header')?.addEventListener('contextmenu', e => {
      e.preventDefault();
      showFolderCtx(e.clientX, e.clientY, fid);
    });

    // "Add bookmark" footer button
    card.querySelector('[data-card-add-bm]')?.addEventListener('click', () => {
      openBookmarkModal(null, fid);
    });
  });

  // Bookmark item listeners
  dom.cardsGrid.querySelectorAll('[data-bm-id]').forEach(item => {
    const bid = item.dataset.bmId;

    item.addEventListener('click', e => {
      if (e.target.closest('[data-bm-menu]')) return;
      const bm = state.bookmarks.find(b => b.id === bid);
      if (bm) window.open(bm.url, '_blank');
    });

    item.addEventListener('contextmenu', e => {
      e.preventDefault();
      showBmCtx(e.clientX, e.clientY, bid);
    });

    item.querySelector('[data-bm-menu]')?.addEventListener('click', e => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      showBmCtx(rect.left, rect.bottom + 4, bid);
    });
  });
}

function renderCard(folder) {
  const bms = state.bookmarks.filter(b => b.folderId === folder.id);
  const showFavicons = state.settings.showFavicons !== false;

  const bmRows = bms.map(bm => {
    const domain = extractDomain(bm.url);
    const fav = bm.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    return `
      <div class="bm-item" data-bm-id="${bm.id}" tabindex="0" role="button">
        ${showFavicons
          ? `<img class="bm-favicon" src="${esc(fav)}" alt="" loading="lazy"
                  onerror="this.classList.add('bm-favicon--hidden')">`
          : `<svg class="bm-favicon-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
               <circle cx="12" cy="12" r="10"/>
               <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
             </svg>`}
        <span class="bm-title">${esc(bm.title || domain)}</span>
        <button class="bm-item-menu" data-bm-menu="${bm.id}" aria-label="Options" title="Options">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="5" r="1" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="19" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>`;

  }).join('');

  return `
    <div class="folder-card" data-card-folder="${folder.id}">
      <div class="card-header">
        <span class="card-title">${esc(folder.name)}</span>
        <div class="card-actions">
          <button class="card-action-btn" data-card-menu="${folder.id}" title="More options"
                  aria-label="Folder options">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="card-separator"></div>
      <div class="card-bookmarks">
        ${bmRows || '<p class="card-empty-msg">No bookmarks yet</p>'}
      </div>
      <button class="card-add-bm" data-card-add-bm="${folder.id}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add bookmark
      </button>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  WORKSPACE MODAL
// ═══════════════════════════════════════════════════════════
function openWorkspaceModal(ws = null) {
  state.editingWorkspaceId = ws?.id || null;
  dom.workspaceModalTitle.textContent = ws ? 'Rename Workspace' : 'New Workspace';
  dom.workspaceName.value = ws?.name || '';
  showModal(dom.workspaceModal);
  dom.workspaceName.focus();
}

async function saveWorkspace() {
  const name = dom.workspaceName.value.trim();
  if (!name) { shake(dom.workspaceName); return; }

  if (state.editingWorkspaceId) {
    await Storage.updateWorkspace(state.editingWorkspaceId, { name });
    state.workspaces = await Storage.getWorkspaces();
    showToast('Workspace renamed', 'success');
  } else {
    const newWs = await Storage.addWorkspace({ name });
    state.workspaces = await Storage.getWorkspaces();
    state.activeWorkspaceId = newWs.id;
    await Storage.updateSettings({ activeWorkspaceId: newWs.id });
    showToast('Workspace created!', 'success');
  }

  closeModal(dom.workspaceModal);
  renderWorkspaceTabs();
  renderCards();
}

// ═══════════════════════════════════════════════════════════
//  FOLDER MODAL
// ═══════════════════════════════════════════════════════════
function openFolderModal(folder = null, presetWsId = null) {
  state.editingFolderId = folder?.id || null;
  dom.folderModalTitle.textContent = folder ? 'Rename Folder' : 'New Folder';
  dom.folderName.value = folder?.name || '';

  // Populate workspace dropdown
  dom.folderWorkspace.innerHTML =
    '<option value="">No workspace</option>' +
    state.workspaces.map(ws => `<option value="${ws.id}"
      ${(folder?.workspaceId === ws.id || (!folder && (presetWsId || state.activeWorkspaceId) === ws.id)) ? 'selected' : ''}>
      ${esc(ws.name)}</option>`).join('');

  showModal(dom.folderModal);
  dom.folderName.focus();
}

async function saveFolder() {
  const name = dom.folderName.value.trim();
  if (!name) { shake(dom.folderName); return; }
  const workspaceId = dom.folderWorkspace.value || null;

  if (state.editingFolderId) {
    await Storage.updateFolder(state.editingFolderId, { name, workspaceId });
    showToast('Folder renamed', 'success');
  } else {
    await Storage.addFolder({ name, workspaceId });
    showToast('Folder created!', 'success');
  }

  state.folders = await Storage.getFolders();
  closeModal(dom.folderModal);
  renderCards();
}

// ═══════════════════════════════════════════════════════════
//  BOOKMARK MODAL
// ═══════════════════════════════════════════════════════════
function openBookmarkModal(bm = null, presetFolderId = null) {
  state.editingBookmarkId = bm?.id || null;
  state.targetFolderId = presetFolderId || bm?.folderId || null;
  dom.bookmarkModalTitle.textContent = bm ? 'Edit Bookmark' : 'Add Bookmark';
  dom.bookmarkModalSave.textContent  = bm ? 'Update' : 'Save Bookmark';

  dom.bmUrl.value   = bm?.url   || '';
  dom.bmTitle.value = bm?.title || '';
  dom.bmNotes.value = bm?.notes || '';

  // Show / clear favicon preview
  const preview = document.getElementById('bmFaviconPreview');
  if (preview) {
    if (bm?.url) {
      const domain = extractDomain(bm.url);
      preview.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      preview.style.display = 'inline-block';
    } else {
      preview.src = '';
      preview.style.display = 'none';
    }
  }

  // Workspace dropdown
  dom.bmWorkspace.innerHTML =
    '<option value="">No workspace</option>' +
    state.workspaces.map(ws => `<option value="${ws.id}"
      ${ws.id === state.activeWorkspaceId ? 'selected' : ''}>
      ${esc(ws.name)}</option>`).join('');

  updateFolderDropdown(dom.bmWorkspace.value, bm?.folderId || presetFolderId);

  showModal(dom.bookmarkModal);
  dom.bmUrl.focus();
}

function updateFolderDropdown(workspaceId, selectedFolderId) {
  const filtered = workspaceId
    ? state.folders.filter(f => f.workspaceId === workspaceId)
    : state.folders;
  dom.bmFolder.innerHTML =
    '<option value="">No folder</option>' +
    filtered.map(f => `<option value="${f.id}"
      ${f.id === selectedFolderId ? 'selected' : ''}>
      ${esc(f.name)}</option>`).join('');
}

async function saveBookmark() {
  const url   = dom.bmUrl.value.trim();
  const title = dom.bmTitle.value.trim();
  if (!url)   { shake(dom.bmUrl);   return; }
  if (!title) { shake(dom.bmTitle); return; }

  const payload = {
    url,
    title,
    notes:    dom.bmNotes.value.trim(),
    folderId: dom.bmFolder.value || null,
    favicon:  Storage.getFaviconUrl(url),
    tags:     []
  };

  if (state.editingBookmarkId) {
    await Storage.updateBookmark(state.editingBookmarkId, payload);
    showToast('Bookmark updated', 'success');
  } else {
    const dup = await Storage.isDuplicate(url);
    if (dup) { showToast(`Already saved: "${dup.title}"`, 'info'); closeModal(dom.bookmarkModal); return; }
    await Storage.addBookmark(payload);
    showToast('Bookmark saved! 🎉', 'success');
  }

  state.bookmarks = await Storage.getBookmarks();
  closeModal(dom.bookmarkModal);
  renderCards();
}

// ═══════════════════════════════════════════════════════════
//  CONTEXT MENUS
// ═══════════════════════════════════════════════════════════
function showFolderCtx(x, y, folderId) {
  state.ctxFolderId = folderId;
  positionMenu(dom.ctxMenu, x, y);
}
function showBmCtx(x, y, bmId) {
  state.ctxBookmarkId = bmId;
  positionMenu(dom.bmCtxMenu, x, y);
}
function positionMenu(menu, x, y) {
  hideBothCtx();
  menu.style.display = 'block';
  menu.style.left = `${x}px`;
  menu.style.top  = `${y}px`;
  // Keep in viewport
  requestAnimationFrame(() => {
    const r = menu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  menu.style.left = `${x - r.width}px`;
    if (r.bottom > window.innerHeight) menu.style.top  = `${y - r.height}px`;
  });
}
function hideBothCtx() {
  dom.ctxMenu.style.display   = 'none';
  dom.bmCtxMenu.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════
function openSearch() {
  dom.searchOverlay.style.display = 'flex';
  dom.searchPanelInput.value = '';
  dom.searchResults.innerHTML = '';
  dom.searchPlaceholder.style.display = 'flex';
  setTimeout(() => dom.searchPanelInput.focus(), 50);
}
function closeSearch() {
  dom.searchOverlay.style.display = 'none';
}
async function runSearch(q) {
  if (!q.trim()) {
    dom.searchResults.innerHTML = '';
    dom.searchPlaceholder.style.display = 'flex';
    return;
  }
  dom.searchPlaceholder.style.display = 'none';
  const results = await Storage.searchBookmarks(q);

  if (!results.length) {
    dom.searchResults.innerHTML = `<div class="search-no-results">No results for "${esc(q)}"</div>`;
    return;
  }

  dom.searchResults.innerHTML = results.slice(0, 40).map(bm => {
    const domain = extractDomain(bm.url);
    const fav = bm.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    const folder = state.folders.find(f => f.id === bm.folderId);
    return `
      <div class="search-result-item" data-sr-url="${esc(bm.url)}">
        <img class="sr-favicon" src="${esc(fav)}" alt="" loading="lazy"
             onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'">
        <div class="sr-info">
          <div class="sr-title">${esc(bm.title || domain)}</div>
          <div class="sr-url">${esc(bm.url)}</div>
        </div>
        ${folder ? `<span class="sr-folder">${esc(folder.name)}</span>` : ''}
      </div>`;
  }).join('');

  dom.searchResults.querySelectorAll('[data-sr-url]').forEach(el => {
    el.addEventListener('click', () => { window.open(el.dataset.srUrl, '_blank'); closeSearch(); });
  });
}

// ═══════════════════════════════════════════════════════════
//  MODALS HELPERS
// ═══════════════════════════════════════════════════════════
function showModal(modal) {
  dom.modalOverlay.classList.add('active');
  modal.classList.add('active');
}
function closeModal(modal) {
  modal.classList.remove('active');
  if (!document.querySelector('.modal.active')) dom.modalOverlay.classList.remove('active');
}
function closeAllModals() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  dom.modalOverlay.classList.remove('active');
}
function showConfirm(title, msg, icon = '🗑️', cb) {
  dom.confirmTitle.textContent = title;
  dom.confirmMessage.textContent = msg;
  dom.confirmIcon.textContent = icon;
  state.confirmCb = cb;
  showModal(dom.confirmModal);
}

// ═══════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════
function showToast(msg, type = 'info', dur = 2800) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-dot"></span>${esc(msg)}`;
  dom.toastWrap.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, dur);
}

// ═══════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════
function openSettings() {
  dom.setFavicons.checked = state.settings.showFavicons !== false;
  dom.setCompact.checked  = !!state.settings.compactCards;
  // Sync accent color swatch
  const accent = state.settings.accentColor || '#2d8f46';
  if (dom.setAccentColor) dom.setAccentColor.value = accent;
  if (dom.accentSwatch)   dom.accentSwatch.style.background = accent;
  renderSettingsWorkspaces();
  showModal(dom.settingsModal);
}

// ═══════════════════════════════════════════════════════════
//  ACCENT COLOR & WALLPAPER
// ═══════════════════════════════════════════════════════════
function applyAccentColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const lighter = (v,d) => Math.min(255, v + d);
  const darker  = (v,d) => Math.max(0,   v - d);
  const root = document.documentElement;
  root.style.setProperty('--accent',      hex);
  root.style.setProperty('--accent-light',`rgb(${lighter(r,35)},${lighter(g,35)},${lighter(b,35)})`);
  root.style.setProperty('--ws-tab-active', hex);
  root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.32)`);
  root.style.setProperty('--input-focus',  `rgba(${r},${g},${b},0.4)`);
  if (dom.accentSwatch)   dom.accentSwatch.style.background   = hex;
  if (dom.setAccentColor) dom.setAccentColor.value             = hex;
}
function applyWallpaper(dataUrl) {
  document.body.style.backgroundImage    = `url("${dataUrl}")`;
  document.body.style.backgroundSize     = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.classList.add('has-wallpaper');
}
function removeWallpaper() {
  document.body.style.backgroundImage = '';
  document.body.classList.remove('has-wallpaper');
}

function renderSettingsWorkspaces() {
  const list = document.getElementById('settingsWsList');
  if (!list) return;
  const homeId = state.workspaces[0]?.id;
  list.innerHTML = state.workspaces.map(ws => `
    <div class="settings-ws-item" data-ws-item="${ws.id}">
      <span class="ws-item-name">${esc(ws.name)}</span>
      ${ws.id === homeId ? '<span class="ws-item-badge">Home</span>' : ''}
      ${ws.id !== homeId ? `<button class="settings-ws-delete" data-ws-del="${ws.id}" title="Delete workspace">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>` : '<span style="width:22px"></span>'}
    </div>`).join('');
}
async function applySettings() {
  state.settings = await Storage.updateSettings({
    showFavicons:  dom.setFavicons.checked,
    compactCards:  dom.setCompact.checked
  });
  renderCards();
}

// ═══════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
function setupListeners() {
  // Workspace bar
  dom.wsAddBtn.addEventListener('click', () => openWorkspaceModal());
  dom.wsArrowLeft.addEventListener('click',  () => dom.wsTabsScroll.scrollBy({ left: -160, behavior: 'smooth' }));
  dom.wsArrowRight.addEventListener('click', () => dom.wsTabsScroll.scrollBy({ left:  160, behavior: 'smooth' }));

  // FAB
  dom.fabSearch.addEventListener('click', openSearch);
  dom.fabAddBookmark.addEventListener('click', () => openBookmarkModal());
  dom.fabSettings.addEventListener('click', openSettings);
  dom.fabAddFolder.addEventListener('click', () => openFolderModal(null, state.activeWorkspaceId));

  // Search
  dom.searchBackdrop.addEventListener('click', closeSearch);
  dom.searchPanelClose.addEventListener('click', closeSearch);
  dom.searchPanelInput.addEventListener('input', e => runSearch(e.target.value));
  dom.searchPanelInput.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  // Bookmark Modal
  dom.bookmarkModalClose.addEventListener('click',  () => closeModal(dom.bookmarkModal));
  dom.bookmarkModalCancel.addEventListener('click', () => closeModal(dom.bookmarkModal));
  dom.bookmarkModalSave.addEventListener('click', saveBookmark);
  dom.bmWorkspace.addEventListener('change', () => updateFolderDropdown(dom.bmWorkspace.value, null));

  // Live favicon fetch as user types URL
  let _urlTimer;
  dom.bmUrl.addEventListener('input', () => {
    clearTimeout(_urlTimer);
    _urlTimer = setTimeout(() => refreshFaviconPreview(dom.bmUrl.value.trim()), 400);
  });
  dom.bmUrl.addEventListener('paste', () => {
    setTimeout(() => refreshFaviconPreview(dom.bmUrl.value.trim()), 0);
  });

  dom.bmUrl.addEventListener('keydown', e => { if (e.key === 'Enter') dom.bmTitle.focus(); });
  dom.bmTitle.addEventListener('keydown', e => { if (e.key === 'Enter') saveBookmark(); });

  // Folder Modal
  dom.folderModalClose.addEventListener('click',  () => closeModal(dom.folderModal));
  dom.folderModalCancel.addEventListener('click', () => closeModal(dom.folderModal));
  dom.folderModalSave.addEventListener('click', saveFolder);
  dom.folderName.addEventListener('keydown', e => { if (e.key === 'Enter') saveFolder(); });

  // Workspace Modal
  dom.workspaceModalClose.addEventListener('click',  () => closeModal(dom.workspaceModal));
  dom.workspaceModalCancel.addEventListener('click', () => closeModal(dom.workspaceModal));
  dom.workspaceModalSave.addEventListener('click', saveWorkspace);
  dom.workspaceName.addEventListener('keydown', e => { if (e.key === 'Enter') saveWorkspace(); });

  // Settings Modal
  dom.settingsModalClose.addEventListener('click', () => closeModal(dom.settingsModal));
  dom.setFavicons.addEventListener('change', applySettings);
  dom.setCompact.addEventListener('change', applySettings);
  dom.settingsExportBtn.addEventListener('click', () => Storage.exportData());
  dom.settingsImportBtn.addEventListener('click', () => { closeModal(dom.settingsModal); dom.importFile.click(); });
  dom.settingsClearBtn.addEventListener('click', () => {
    showConfirm('Clear ALL data?', 'Deletes all bookmarks, folders, and workspaces. Cannot be undone!', '⚠️', async () => {
      await Storage.clearAll();
      await init();
      showToast('All data cleared', 'info');
    });
  });

  // Settings — workspace add/delete
  document.getElementById('settingsWsAddBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('settingsWsInput');
    const name = input?.value.trim();
    if (!name) { if (input) shake(input); return; }
    await Storage.addWorkspace({ name });
    state.workspaces = await Storage.getWorkspaces();
    input.value = '';
    renderSettingsWorkspaces();
    renderWorkspaceTabs();
    showToast(`Workspace "${name}" added`, 'success');
  });
  document.getElementById('settingsWsInput')?.addEventListener('keydown', async e => {
    if (e.key === 'Enter') document.getElementById('settingsWsAddBtn')?.click();
  });
  document.getElementById('settingsWsList')?.addEventListener('click', async e => {
    const delBtn = e.target.closest('[data-ws-del]');
    if (!delBtn) return;
    const wsId = delBtn.dataset.wsDel;
    const ws = state.workspaces.find(w => w.id === wsId);
    showConfirm(`Delete "${ws?.name}"?`,
      'All folders in this workspace will be moved to no workspace. Bookmarks are kept.',
      '🗂️', async () => {
        // Move folders out of this workspace
        const affected = state.folders.filter(f => f.workspaceId === wsId);
        for (const f of affected) await Storage.updateFolder(f.id, { workspaceId: null });
        await Storage.deleteWorkspace(wsId);
        state.workspaces = await Storage.getWorkspaces();
        state.folders    = await Storage.getFolders();
        if (state.activeWorkspaceId === wsId)
          state.activeWorkspaceId = state.workspaces[0]?.id || null;
        renderSettingsWorkspaces();
        renderWorkspaceTabs();
        renderCards();
        showToast(`Workspace deleted`, 'info');
      });
  });

  // Confirm Modal
  dom.confirmCancel.addEventListener('click', () => closeModal(dom.confirmModal));
  dom.confirmOk.addEventListener('click', async () => {
    closeModal(dom.confirmModal);
    if (state.confirmCb) { await state.confirmCb(); state.confirmCb = null; }
  });

  // Modal overlay
  dom.modalOverlay.addEventListener('click', closeAllModals);

  // Folder context menu
  dom.ctxAddBookmark.addEventListener('click', () => {
    openBookmarkModal(null, state.ctxFolderId);
    hideBothCtx();
  });
  dom.ctxEditFolder.addEventListener('click', () => {
    const folder = state.folders.find(f => f.id === state.ctxFolderId);
    if (folder) openFolderModal(folder);
    hideBothCtx();
  });
  dom.ctxDeleteFolder.addEventListener('click', () => {
    const folder = state.folders.find(f => f.id === state.ctxFolderId);
    hideBothCtx();
    showConfirm(`Delete "${folder?.name}"?`, 'All bookmarks will be removed from this folder.', '🗂️', async () => {
      await Storage.deleteFolder(state.ctxFolderId);
      state.folders   = await Storage.getFolders();
      state.bookmarks = await Storage.getBookmarks();
      renderCards();
      showToast('Folder deleted', 'info');
    });
  });

  // Bookmark context menu
  dom.bmCtxOpen.addEventListener('click', () => {
    const bm = state.bookmarks.find(b => b.id === state.ctxBookmarkId);
    if (bm) window.open(bm.url, '_blank');
    hideBothCtx();
  });
  dom.bmCtxCopy.addEventListener('click', async () => {
    const bm = state.bookmarks.find(b => b.id === state.ctxBookmarkId);
    if (bm) { await navigator.clipboard.writeText(bm.url); showToast('URL copied', 'success'); }
    hideBothCtx();
  });
  dom.bmCtxEdit.addEventListener('click', () => {
    const bm = state.bookmarks.find(b => b.id === state.ctxBookmarkId);
    if (bm) openBookmarkModal(bm);
    hideBothCtx();
  });
  dom.bmCtxDelete.addEventListener('click', () => {
    const bid = state.ctxBookmarkId;
    const bm  = state.bookmarks.find(b => b.id === bid);
    hideBothCtx();
    showConfirm(`Delete "${bm?.title || 'bookmark'}"?`, 'This cannot be undone.', '🗑️', async () => {
      await Storage.deleteBookmark(bid);
      state.bookmarks = await Storage.getBookmarks();
      renderCards();
      showToast('Bookmark deleted', 'info');
    });
  });

  // Import file
  dom.importFile.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const r = await Storage.importData(ev.target.result);
        state.workspaces = await Storage.getWorkspaces();
        state.folders    = await Storage.getFolders();
        state.bookmarks  = await Storage.getBookmarks();
        state.tags       = await Storage.getTags();
        if (!state.activeWorkspaceId && state.workspaces[0])
          state.activeWorkspaceId = state.workspaces[0].id;
        renderWorkspaceTabs();
        renderCards();
        showToast(`Imported ${r.bookmarks} bookmarks`, 'success');
      } catch (err) {
        showToast('Import failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Settings — appearance: accent color
  dom.setAccentColor?.addEventListener('input', async e => {
    const hex = e.target.value;
    applyAccentColor(hex);
    await Storage.updateSettings({ accentColor: hex });
    state.settings.accentColor = hex;
  });
  dom.accentSwatch?.addEventListener('click', () => dom.setAccentColor?.click());

  // Settings — appearance: wallpaper
  dom.settingsWallpaperBtn?.addEventListener('click', () => dom.wallpaperFile?.click());
  dom.wallpaperFile?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { showToast('Image too large (max 100 MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = async ev => {
      const dataUrl = ev.target.result;
      applyWallpaper(dataUrl);
      await Storage.updateSettings({ wallpaper: dataUrl });
      state.settings.wallpaper = dataUrl;
      showToast('Wallpaper applied ✨', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  dom.settingsRemoveWallpaperBtn?.addEventListener('click', async () => {
    removeWallpaper();
    await Storage.updateSettings({ wallpaper: null });
    state.settings.wallpaper = null;
    showToast('Wallpaper removed', 'info');
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'f') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') {
      if (dom.searchOverlay.style.display !== 'none') { closeSearch(); return; }
      if (dom.ctxMenu.style.display !== 'none' || dom.bmCtxMenu.style.display !== 'none') { hideBothCtx(); return; }
      closeAllModals();
    }
  });

  // Close context menus on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.ctx-menu') && !e.target.closest('[data-card-menu]') && !e.target.closest('[data-bm-menu]')) {
      hideBothCtx();
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  MESSAGE LISTENER
// ═══════════════════════════════════════════════════════════
function setupMessageListener() {
  chrome.runtime.onMessage.addListener(async msg => {
    if (msg.event === 'BOOKMARK_ADDED') {
      state.bookmarks = await Storage.getBookmarks();
      renderCards();
      showToast('Bookmark saved! ⚡', 'success');
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  FAVICON PREVIEW HELPER
// ═══════════════════════════════════════════════════════════
function refreshFaviconPreview(url) {
  const preview = document.getElementById('bmFaviconPreview');
  if (!preview) return;
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) { preview.style.display = 'none'; return; }
    const domain = u.hostname.replace('www.', '');
    const favUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    preview.src = favUrl;
    preview.style.display = 'inline-block';
    preview.onerror = () => { preview.style.display = 'none'; };
    // Auto-suggest title from domain if empty
    if (!dom.bmTitle.value) dom.bmTitle.value = domain;
  } catch {
    preview.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function shake(el) {
  el.style.borderColor = '#ef4444';
  el.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.2)';
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1400);
  el.focus();
}

// ═══════════════════════════════════════════════════════════
//  CUSTOM SELECT COMPONENT
// ═══════════════════════════════════════════════════════════
// Replaces native <select> elements with themed custom dropdowns.
// The options list is appended to document.body with position:fixed so
// it is never clipped by modal overflow or stacking contexts.

const _customSelects = new Map(); // selectEl → { rebuild, close }

function createCustomSelect(selectEl) {
  if (_customSelects.has(selectEl)) return _customSelects.get(selectEl);

  // Hide original select but keep it in DOM for value reading
  selectEl.style.display = 'none';

  // Wrapper replaces the select visually
  const wrap = document.createElement('div');
  wrap.className = 'custom-select-wrap';
  selectEl.parentNode.insertBefore(wrap, selectEl);
  wrap.appendChild(selectEl);

  // Trigger button
  const trigger = document.createElement('div');
  trigger.className = 'custom-select-trigger';
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('role', 'combobox');
  trigger.innerHTML = `
    <span class="cs-label"></span>
    <svg class="cs-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M6 9l6 6 6-6"/>
    </svg>`;
  wrap.insertBefore(trigger, selectEl);

  // Dropdown list (lives on body)
  const dropdown = document.createElement('div');
  dropdown.className = 'cs-dropdown';
  dropdown.style.display = 'none';
  dropdown.style.maxHeight = '220px';
  dropdown.style.overflowY = 'auto';
  document.body.appendChild(dropdown);

  let isOpen = false;

  function updateTriggerLabel() {
    const sel = selectEl.options[selectEl.selectedIndex];
    const label = trigger.querySelector('.cs-label');
    if (sel) {
      label.textContent = sel.text;
      label.style.color = sel.value ? 'var(--text-primary)' : 'var(--text-muted)';
    } else {
      label.textContent = 'Select…';
      label.style.color = 'var(--text-muted)';
    }
  }

  function buildList() {
    dropdown.innerHTML = '';
    Array.from(selectEl.options).forEach(opt => {
      if (opt.disabled) {
        const div = document.createElement('div');
        div.className = 'cs-divider';
        dropdown.appendChild(div);
        return;
      }
      const item = document.createElement('div');
      const isEmpty = opt.value === '';
      item.className = 'cs-option' +
        (isEmpty ? ' cs-empty' : '') +
        (opt.value === selectEl.value ? ' cs-selected' : '');
      item.textContent = opt.text;
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        selectEl.value = opt.value;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateTriggerLabel();
        closeDropdown();
      });
      dropdown.appendChild(item);
    });
  }

  function openDropdown() {
    // Close any other open custom selects
    _customSelects.forEach((api, el) => { if (el !== selectEl) api.close(); });

    const rect = trigger.getBoundingClientRect();
    dropdown.style.left  = `${rect.left}px`;
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.display = 'block';
    buildList();

    // Position above or below depending on space
    const dr = dropdown.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    if (spaceBelow >= Math.min(dr.height, 220)) {
      dropdown.style.top    = `${rect.bottom + 4}px`;
      dropdown.style.bottom = 'auto';
    } else if (spaceAbove >= Math.min(dr.height, 220)) {
      dropdown.style.bottom = `${window.innerHeight - rect.top + 4}px`;
      dropdown.style.top    = 'auto';
    } else {
      dropdown.style.top    = `${rect.bottom + 4}px`;
      dropdown.style.bottom = 'auto';
    }

    isOpen = true;
    trigger.classList.add('open');
  }

  function closeDropdown() {
    if (!isOpen) return;
    isOpen = false;
    dropdown.style.display = 'none';
    trigger.classList.remove('open');
  }

  // Toggle on trigger click
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    isOpen ? closeDropdown() : openDropdown();
  });

  // Keyboard support
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isOpen ? closeDropdown() : openDropdown(); }
    if (e.key === 'Escape') closeDropdown();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = selectEl.selectedIndex;
      if (idx < selectEl.options.length - 1) {
        selectEl.selectedIndex = idx + 1;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateTriggerLabel();
        if (isOpen) buildList();
      }
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = selectEl.selectedIndex;
      if (idx > 0) {
        selectEl.selectedIndex = idx - 1;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        updateTriggerLabel();
        if (isOpen) buildList();
      }
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
  });

  // Watch for option changes (when JS updates innerHTML)
  const observer = new MutationObserver(() => {
    updateTriggerLabel();
    if (isOpen) buildList();
  });
  observer.observe(selectEl, { childList: true, subtree: false });

  updateTriggerLabel();

  const api = { rebuild: updateTriggerLabel, close: closeDropdown, open: openDropdown };
  _customSelects.set(selectEl, api);
  return api;
}

function initCustomSelects() {
  document.querySelectorAll('select.form-select').forEach(createCustomSelect);
}

// ═══════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════
init();
