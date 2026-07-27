// TabVault 2.0 — Popup Logic
import { Storage } from './storage.js';

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════
const state = {
  currentTab: null,
  existingBookmark: null,
  bookmarks: [],
  workspaces: [],
  folders: [],
  tags: [],
  pendingTags: []
};

// ═══════════════════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════════════════
const $ = id => document.getElementById(id);
const dom = {
  openDashboardBtn: $('openDashboardBtn'),
  statusSpinner: $('statusSpinner'),
  statusContent: $('statusContent'),
  statusFavicon: $('statusFavicon'),
  statusTitle: $('statusTitle'),
  statusUrl: $('statusUrl'),
  statusSavedBadge: $('statusSavedBadge'),
  popupForm: $('popupForm'),
  popupTitle: $('popupTitle'),
  popupFolder: $('popupFolder'),
  popupTags: $('popupTags'),
  popupTagsChips: $('popupTagsChips'),
  popupNotes: $('popupNotes'),
  popupPinned: $('popupPinned'),
  popupSaveBtn: $('popupSaveBtn'),
  savedState: $('savedState'),
  savedEditBtn: $('savedEditBtn'),
  savedDeleteBtn: $('savedDeleteBtn'),
  popupRecents: $('popupRecents'),
  recentsList: $('recentsList'),
  footerStat: $('footerStat'),
  popupToast: $('popupToast')
};

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  // Load data
  const data = await Storage.init();
  state.bookmarks  = data.bookmarks  || [];
  state.workspaces = data.workspaces || [];
  state.folders    = data.folders    || [];
  state.tags       = data.tags       || [];

  // Populate folder dropdown grouped by workspace
  const settings = { ...Storage.defaults.settings, ...data.settings };
  const activeWsId = settings.activeWorkspaceId;
  const activeFolders = state.folders.filter(f => f.workspaceId === activeWsId);
  const otherFolders  = state.folders.filter(f => f.workspaceId !== activeWsId);
  dom.popupFolder.innerHTML =
    '<option value="">No folder</option>' +
    activeFolders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('') +
    (otherFolders.length ? '<option disabled>─────────</option>' : '') +
    otherFolders.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');

  // Get current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    state.currentTab = tab;
    await loadTabInfo(tab);
  } catch (err) {
    showTabError();
  }

  // Render recent bookmarks
  renderRecents();

  // Footer stat
  dom.footerStat.textContent = `${state.bookmarks.length} bookmark${state.bookmarks.length !== 1 ? 's' : ''}`;

  // Setup events
  setupListeners();
}

// ═══════════════════════════════════════════════════════════
//  TAB INFO
// ═══════════════════════════════════════════════════════════
async function loadTabInfo(tab) {
  if (!tab || !tab.url || isRestrictedUrl(tab.url)) {
    showTabError('Cannot save this page');
    return;
  }

  const domain = extractDomain(tab.url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  dom.statusFavicon.src = faviconUrl;
  dom.statusTitle.textContent = tab.title || domain;
  dom.statusUrl.textContent = tab.url;
  dom.statusSpinner.style.display = 'none';
  dom.statusContent.style.display = 'flex';

  // Check if already saved
  state.existingBookmark = state.bookmarks.find(b => b.url === tab.url) || null;

  if (state.existingBookmark) {
    // Already saved — show saved state
    dom.statusSavedBadge.style.display = 'flex';
    dom.popupForm.style.display = 'none';
    dom.savedState.style.display = 'flex';
  } else {
    // Pre-fill form
    dom.popupTitle.value = tab.title || domain;
    dom.statusSavedBadge.style.display = 'none';
    dom.popupForm.style.display = 'flex';
    dom.savedState.style.display = 'none';
    dom.popupTitle.focus();
    dom.popupTitle.select();
  }
}

function showTabError(msg = 'Cannot access this page') {
  dom.statusSpinner.style.display = 'none';
  dom.statusContent.style.display = 'flex';
  dom.statusTitle.textContent = msg;
  dom.statusUrl.textContent = '';
  dom.popupForm.style.display = 'none';
}

function isRestrictedUrl(url) {
  return url.startsWith('chrome://') ||
         url.startsWith('chrome-extension://') ||
         url.startsWith('about:') ||
         url.startsWith('edge://') ||
         url.startsWith('moz-extension://');
}

// ═══════════════════════════════════════════════════════════
//  TAGS
// ═══════════════════════════════════════════════════════════
function renderTagChips() {
  dom.popupTagsChips.innerHTML = state.pendingTags.map(tag => {
    const tagObj = state.tags.find(t => t.name === tag);
    const color = tagObj?.color || '#00d9c8';
    return `<span class="popup-tag-chip" style="background:${hexToRgba(color, 0.2)};color:${color}">
      ${escapeHtml(tag)}
      <span class="popup-tag-remove" data-remove="${escapeHtml(tag)}">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </span>
    </span>`;
  }).join('');

  dom.popupTagsChips.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.pendingTags = state.pendingTags.filter(t => t !== btn.dataset.remove);
      renderTagChips();
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  SAVE
// ═══════════════════════════════════════════════════════════
async function saveBookmark() {
  const tab = state.currentTab;
  if (!tab || isRestrictedUrl(tab.url)) return;

  dom.popupSaveBtn.classList.add('saving');
  dom.popupSaveBtn.textContent = 'Saving…';

  try {
    // Ensure tags
    for (const tag of state.pendingTags) {
      await Storage.ensureTag(tag);
    }

    const domain = extractDomain(tab.url);
    const bookmark = {
      url: tab.url,
      title: dom.popupTitle.value.trim() || tab.title || domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      description: '',
      notes: dom.popupNotes.value.trim(),
      folderId: dom.popupFolder.value || null,
      tags: [...state.pendingTags],
      pinned: dom.popupPinned.checked
    };

    const saved = await Storage.addBookmark(bookmark);
    state.existingBookmark = saved;

    // Update state
    state.bookmarks = await Storage.getBookmarks();
    state.tags = await Storage.getTags();

    // Show saved state
    dom.popupForm.style.display = 'none';
    dom.savedState.style.display = 'flex';
    dom.statusSavedBadge.style.display = 'flex';
    dom.footerStat.textContent = `${state.bookmarks.length} bookmarks`;

    showToast('✅ Saved to TabVault!');
    renderRecents();
  } catch (err) {
    showToast('❌ Error saving bookmark');
  } finally {
    dom.popupSaveBtn.classList.remove('saving');
    dom.popupSaveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save to TabVault`;
  }
}

// ═══════════════════════════════════════════════════════════
//  DELETE EXISTING
// ═══════════════════════════════════════════════════════════
async function deleteExisting() {
  if (!state.existingBookmark) return;
  await Storage.deleteBookmark(state.existingBookmark.id);
  state.existingBookmark = null;
  state.bookmarks = await Storage.getBookmarks();

  // Reset to save form
  dom.savedState.style.display = 'none';
  dom.statusSavedBadge.style.display = 'none';
  dom.popupForm.style.display = 'flex';
  const tab = state.currentTab;
  if (tab) {
    dom.popupTitle.value = tab.title || extractDomain(tab.url);
    state.pendingTags = [];
    renderTagChips();
    dom.popupNotes.value = '';
    dom.popupPinned.checked = false;
    dom.popupFolder.value = '';
  }
  dom.footerStat.textContent = `${state.bookmarks.length} bookmarks`;
  renderRecents();
  showToast('🗑️ Bookmark removed');
}

// ═══════════════════════════════════════════════════════════
//  EDIT EXISTING (jump to dashboard)
// ═══════════════════════════════════════════════════════════
function editExisting() {
  // Open dashboard in a new tab
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
  window.close();
}

// ═══════════════════════════════════════════════════════════
//  RECENT BOOKMARKS
// ═══════════════════════════════════════════════════════════
function renderRecents() {
  const recent = state.bookmarks.slice(0, 5);
  if (!recent.length) {
    dom.popupRecents.style.display = 'none';
    return;
  }

  dom.popupRecents.style.display = 'block';
  dom.recentsList.innerHTML = recent.map(bm => {
    const domain = extractDomain(bm.url);
    const favicon = bm.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=18`;
    return `<div class="recent-item" data-url="${escapeHtml(bm.url)}">
      <img class="recent-favicon" src="${escapeHtml(favicon)}" alt="" loading="lazy"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>'">
      <span class="recent-title">${escapeHtml(bm.title || domain)}</span>
    </div>`;
  }).join('');

  dom.recentsList.querySelectorAll('[data-url]').forEach(item => {
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: item.dataset.url });
      window.close();
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════════
function showToast(msg, duration = 2000) {
  dom.popupToast.textContent = msg;
  dom.popupToast.style.display = 'block';
  clearTimeout(dom.popupToast._timer);
  dom.popupToast._timer = setTimeout(() => {
    dom.popupToast.style.display = 'none';
  }, duration);
}

// ═══════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
function setupListeners() {
  // Open dashboard
  dom.openDashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
    window.close();
  });

  // Save button
  dom.popupSaveBtn.addEventListener('click', saveBookmark);

  // Keyboard: Enter to save
  dom.popupTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBookmark();
  });

  // Tags input
  dom.popupTags.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && dom.popupTags.value.trim()) {
      e.preventDefault();
      const tag = dom.popupTags.value.trim().replace(/,/g, '');
      if (tag && !state.pendingTags.includes(tag)) {
        state.pendingTags.push(tag);
        renderTagChips();
      }
      dom.popupTags.value = '';
    }
    if (e.key === 'Backspace' && !dom.popupTags.value && state.pendingTags.length) {
      state.pendingTags.pop();
      renderTagChips();
    }
  });

  // Saved state actions
  dom.savedEditBtn.addEventListener('click', editExisting);
  dom.savedDeleteBtn.addEventListener('click', deleteExisting);
}

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hexToRgba(hex, alpha) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch { return hex; }
}

// ═══════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════
init();
