// NoteNext — Options Page Logic
// Full bookmark & folder manager: list, search, filter, edit, delete

import { Storage } from './storage.js';

// ─── DOM ──────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// Nav
const navBookmarks = $('navBookmarks');
const navFolders   = $('navFolders');

// Sections
const sectionBookmarks = $('sectionBookmarks');
const sectionFolders   = $('sectionFolders');

// Bookmarks
const bmSearch      = $('bmSearch');
const bmFolderFilter= $('bmFolderFilter');
const bmLoading     = $('bmLoading');
const bmEmpty       = $('bmEmpty');
const bmEmptyTitle  = $('bmEmptyTitle');
const bmTable       = $('bmTable');
const bmTableBody   = $('bmTableBody');
const bmSubtitle    = $('bmSubtitle');

// Folders
const folderSearch   = $('folderSearch');
const folderLoading  = $('folderLoading');
const folderEmpty    = $('folderEmpty');
const folderTable    = $('folderTable');
const folderTableBody= $('folderTableBody');
const folderSubtitle = $('folderSubtitle');

// Edit bookmark modal
const editBmOverlay = $('editBmOverlay');
const editBmClose   = $('editBmClose');
const editBmCancel  = $('editBmCancel');
const editBmSave    = $('editBmSave');
const editBmTitle2  = $('editBmTitle2');
const editBmUrl     = $('editBmUrl');
const editBmFolder  = $('editBmFolder');
const editBmNotes   = $('editBmNotes');

// Edit folder modal
const editFolderOverlay   = $('editFolderOverlay');
const editFolderClose     = $('editFolderClose');
const editFolderCancel    = $('editFolderCancel');
const editFolderSave      = $('editFolderSave');
const editFolderName      = $('editFolderName');
const editFolderWorkspace = $('editFolderWorkspace');

// Confirm modal
const confirmOverlay = $('confirmOverlay');
const confirmMsg     = $('confirmMsg');
const confirmCancel  = $('confirmCancel');
const confirmOk      = $('confirmOk');

// Toast
const toastRegion = $('toastRegion');

// Back to home
const backToHome = $('backToHome');

// ─── STATE ────────────────────────────────────────────────────────────────────
let allBookmarks  = [];
let allFolders    = [];
let allWorkspaces = [];
let editingBmId   = null;
let editingFolderId = null;
let pendingDelete = null; // { type: 'bookmark'|'folder', id }

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  // Fix back-to-home link so it opens the new tab (no regular navigation)
  backToHome?.addEventListener('click', e => {
    e.preventDefault();
    chrome.tabs.create({ url: 'newtab.html' });
  });

  await loadAll();
  renderBookmarks();
  renderFolders();
  bindEvents();
}

async function loadAll() {
  [allBookmarks, allFolders, allWorkspaces] = await Promise.all([
    Storage.getBookmarks(),
    Storage.getFolders(),
    Storage.getWorkspaces()
  ]);

  // Populate folder filter dropdown
  if (bmFolderFilter) {
    const opts = allFolders.map(f =>
      `<option value="${esc(f.id)}">${esc(f.name)}</option>`
    ).join('');
    bmFolderFilter.innerHTML = '<option value="">All folders</option>' + opts;
  }
}

// ─── RENDER BOOKMARKS ─────────────────────────────────────────────────────────
function renderBookmarks() {
  if (!bmTableBody) return;

  const q        = bmSearch?.value.trim().toLowerCase() ?? '';
  const folderId = bmFolderFilter?.value ?? '';

  let list = allBookmarks.filter(bm => {
    const matchQ = !q ||
      bm.title?.toLowerCase().includes(q) ||
      bm.url?.toLowerCase().includes(q);
    const matchF = !folderId || bm.folderId === folderId;
    return matchQ && matchF;
  });

  bmLoading?.classList.add('hidden');

  if (bmSubtitle) bmSubtitle.textContent =
    `${list.length} of ${allBookmarks.length} bookmark${allBookmarks.length !== 1 ? 's' : ''}`;

  if (allBookmarks.length === 0) {
    bmTable?.classList.add('hidden');
    bmEmpty?.classList.remove('hidden');
    if (bmEmptyTitle) bmEmptyTitle.textContent = 'No bookmarks yet';
    return;
  }

  if (list.length === 0) {
    bmTable?.classList.add('hidden');
    bmEmpty?.classList.remove('hidden');
    if (bmEmptyTitle) bmEmptyTitle.textContent = 'No results';
    return;
  }

  bmEmpty?.classList.add('hidden');
  bmTable?.classList.remove('hidden');

  const frag = document.createDocumentFragment();
  for (const bm of list) frag.appendChild(buildBmRow(bm));
  bmTableBody.innerHTML = '';
  bmTableBody.appendChild(frag);
}

function buildBmRow(bm) {
  const tr = document.createElement('tr');
  tr.dataset.id = bm.id;

  const folder  = allFolders.find(f => f.id === bm.folderId);
  const domain  = extractDomain(bm.url);
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  tr.innerHTML = `
    <td>
      <div class="bm-cell-main">
        <img class="bm-cell-favicon" src="${esc(favicon)}" alt="" loading="lazy"
             onerror="this.classList.add('bm-cell-favicon--hidden')">
        <span class="bm-cell-name" title="${esc(bm.title)}">${esc(bm.title || domain)}</span>
      </div>
    </td>
    <td class="bm-cell-url">
      <a href="${esc(bm.url)}" target="_blank" rel="noopener noreferrer"
         title="${esc(bm.url)}">${esc(bm.url)}</a>
    </td>
    <td>
      <span class="tag-pill ${folder ? '' : 'tag-pill--grey'}">
        ${esc(folder?.name ?? '—')}
      </span>
    </td>
    <td>
      <div class="td-actions">
        <button class="act-btn act-btn--edit"
                data-action="edit-bm" data-id="${esc(bm.id)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
          </svg>
          Edit
        </button>
        <button class="act-btn act-btn--delete"
                data-action="delete-bm" data-id="${esc(bm.id)}"
                aria-label="Delete ${esc(bm.title)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
          Delete
        </button>
      </div>
    </td>
  `;
  return tr;
}

// ─── RENDER FOLDERS ───────────────────────────────────────────────────────────
function renderFolders() {
  if (!folderTableBody) return;

  const q    = folderSearch?.value.trim().toLowerCase() ?? '';
  const list = q
    ? allFolders.filter(f => f.name?.toLowerCase().includes(q))
    : allFolders;

  folderLoading?.classList.add('hidden');

  if (folderSubtitle) folderSubtitle.textContent =
    `${list.length} folder${list.length !== 1 ? 's' : ''}`;

  if (allFolders.length === 0) {
    folderTable?.classList.add('hidden');
    folderEmpty?.classList.remove('hidden');
    return;
  }

  if (list.length === 0) {
    folderTable?.classList.add('hidden');
    folderEmpty?.classList.remove('hidden');
    return;
  }

  folderEmpty?.classList.add('hidden');
  folderTable?.classList.remove('hidden');

  const frag = document.createDocumentFragment();
  for (const folder of list) frag.appendChild(buildFolderRow(folder));
  folderTableBody.innerHTML = '';
  folderTableBody.appendChild(frag);
}

function buildFolderRow(folder) {
  const tr = document.createElement('tr');
  tr.dataset.id = folder.id;

  const ws    = allWorkspaces.find(w => w.id === folder.workspaceId);
  const count = allBookmarks.filter(b => b.folderId === folder.id).length;

  tr.innerHTML = `
    <td>
      <div class="bm-cell-main">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
             style="color: var(--text-3)">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
        </svg>
        <span class="bm-cell-name">${esc(folder.name)}</span>
      </div>
    </td>
    <td>
      <span class="tag-pill ${ws ? '' : 'tag-pill--grey'}">
        ${esc(ws?.name ?? 'No workspace')}
      </span>
    </td>
    <td style="color: var(--text-2); font-size: 0.82rem;">${count} bookmark${count !== 1 ? 's' : ''}</td>
    <td>
      <div class="td-actions">
        <button class="act-btn act-btn--edit"
                data-action="edit-folder" data-id="${esc(folder.id)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
          </svg>
          Edit
        </button>
        <button class="act-btn act-btn--delete"
                data-action="delete-folder" data-id="${esc(folder.id)}"
                aria-label="Delete folder ${esc(folder.name)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
          Delete
        </button>
      </div>
    </td>
  `;
  return tr;
}

// ─── EVENT BINDING ────────────────────────────────────────────────────────────
function bindEvents() {
  // Sidebar nav
  navBookmarks?.addEventListener('click', () => switchSection('bookmarks'));
  navFolders?.addEventListener('click',   () => switchSection('folders'));

  // Search + filter
  bmSearch?.addEventListener('input', renderBookmarks);
  bmFolderFilter?.addEventListener('change', renderBookmarks);
  folderSearch?.addEventListener('input', renderFolders);

  // Table delegation — bookmark actions
  $('bmDataTable')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit-bm')   openEditBm(id);
    if (action === 'delete-bm') promptDeleteBm(id);
  });

  // Table delegation — folder actions
  $('folderDataTable')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit-folder')   openEditFolder(id);
    if (action === 'delete-folder') promptDeleteFolder(id);
  });

  // Edit bookmark modal
  editBmClose?.addEventListener('click',  closeEditBm);
  editBmCancel?.addEventListener('click', closeEditBm);
  editBmSave?.addEventListener('click',   saveEditBm);
  editBmOverlay?.addEventListener('click', e => { if (e.target === editBmOverlay) closeEditBm(); });

  // Edit folder modal
  editFolderClose?.addEventListener('click',  closeEditFolder);
  editFolderCancel?.addEventListener('click', closeEditFolder);
  editFolderSave?.addEventListener('click',   saveEditFolder);
  editFolderOverlay?.addEventListener('click', e => { if (e.target === editFolderOverlay) closeEditFolder(); });

  // Confirm modal
  confirmCancel?.addEventListener('click', closeConfirm);
  confirmOk?.addEventListener('click', async () => {
    closeConfirm();
    if (!pendingDelete) return;

    if (pendingDelete.type === 'bookmark') {
      await Storage.deleteBookmark(pendingDelete.id);
      allBookmarks = await Storage.getBookmarks();
      renderBookmarks();
      showToast('Bookmark deleted', 'success');
    } else {
      await Storage.deleteFolder(pendingDelete.id);
      allFolders    = await Storage.getFolders();
      allBookmarks  = await Storage.getBookmarks(); // some may be orphaned now
      renderFolders();
      renderBookmarks();
      showToast('Folder deleted', 'success');
    }
    pendingDelete = null;
  });

  // Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeEditBm();
      closeEditFolder();
      closeConfirm();
    }
  });
}

// ─── SECTION SWITCH ───────────────────────────────────────────────────────────
function switchSection(name) {
  navBookmarks?.classList.toggle('nav-item--active', name === 'bookmarks');
  navFolders?.classList.toggle('nav-item--active',   name === 'folders');
  sectionBookmarks?.classList.toggle('hidden', name !== 'bookmarks');
  sectionFolders?.classList.toggle('hidden',   name !== 'folders');
}

// ─── EDIT BOOKMARK ────────────────────────────────────────────────────────────
function openEditBm(id) {
  const bm = allBookmarks.find(b => b.id === id);
  if (!bm || !editBmOverlay) return;

  editingBmId = id;

  if (editBmTitle2) editBmTitle2.value = bm.title ?? '';
  if (editBmUrl)    editBmUrl.value    = bm.url   ?? '';
  if (editBmNotes)  editBmNotes.value  = bm.notes ?? '';

  // Populate folder dropdown
  if (editBmFolder) {
    editBmFolder.innerHTML =
      '<option value="">No folder</option>' +
      allFolders.map(f =>
        `<option value="${esc(f.id)}" ${bm.folderId === f.id ? 'selected' : ''}>
          ${esc(f.name)}
        </option>`
      ).join('');
  }

  editBmOverlay.classList.remove('hidden');
  editBmTitle2?.focus();
}

function closeEditBm() {
  editBmOverlay?.classList.add('hidden');
  editingBmId = null;
}

async function saveEditBm() {
  if (!editingBmId) return;

  const title    = editBmTitle2?.value.trim();
  const url      = editBmUrl?.value.trim();
  const folderId = editBmFolder?.value || null;
  const notes    = editBmNotes?.value.trim();

  if (!title) { shake(editBmTitle2); return; }
  if (!url)   { shake(editBmUrl);    return; }

  try { new URL(url); }
  catch { showToast('Invalid URL', 'error'); return; }

  await Storage.updateBookmark(editingBmId, { title, url, folderId, notes });
  allBookmarks = await Storage.getBookmarks();
  renderBookmarks();
  closeEditBm();
  showToast('Bookmark updated ✓', 'success');
}

// ─── EDIT FOLDER ──────────────────────────────────────────────────────────────
function openEditFolder(id) {
  const folder = allFolders.find(f => f.id === id);
  if (!folder || !editFolderOverlay) return;

  editingFolderId = id;
  if (editFolderName) editFolderName.value = folder.name ?? '';

  // Populate workspace dropdown
  if (editFolderWorkspace) {
    editFolderWorkspace.innerHTML =
      '<option value="">No workspace</option>' +
      allWorkspaces.map(ws =>
        `<option value="${esc(ws.id)}" ${folder.workspaceId === ws.id ? 'selected' : ''}>
          ${esc(ws.name)}
        </option>`
      ).join('');
  }

  editFolderOverlay.classList.remove('hidden');
  editFolderName?.focus();
}

function closeEditFolder() {
  editFolderOverlay?.classList.add('hidden');
  editingFolderId = null;
}

async function saveEditFolder() {
  if (!editingFolderId) return;

  const name        = editFolderName?.value.trim();
  const workspaceId = editFolderWorkspace?.value || null;

  if (!name) { shake(editFolderName); return; }

  await Storage.updateFolder(editingFolderId, { name, workspaceId });
  allFolders = await Storage.getFolders();
  renderFolders();
  closeEditFolder();
  showToast('Folder updated ✓', 'success');
}

// ─── DELETE PROMPTS ───────────────────────────────────────────────────────────
function promptDeleteBm(id) {
  const bm = allBookmarks.find(b => b.id === id);
  if (!bm || !confirmOverlay) return;

  if (confirmMsg) confirmMsg.textContent =
    `"${bm.title || bm.url}" will be permanently deleted.`;

  pendingDelete = { type: 'bookmark', id };
  confirmOverlay.classList.remove('hidden');
}

function promptDeleteFolder(id) {
  const folder = allFolders.find(f => f.id === id);
  if (!folder || !confirmOverlay) return;

  const count = allBookmarks.filter(b => b.folderId === id).length;
  if (confirmMsg) confirmMsg.textContent =
    `"${folder.name}" will be deleted. It contains ${count} bookmark${count !== 1 ? 's' : ''} which will become unassigned.`;

  pendingDelete = { type: 'folder', id };
  confirmOverlay.classList.remove('hidden');
}

function closeConfirm() {
  confirmOverlay?.classList.add('hidden');
  pendingDelete = null;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  if (!toastRegion) return;
  const t = document.createElement('div');
  t.className = `toast${type ? ` toast--${type}` : ''}`;
  t.textContent = msg;
  toastRegion.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 250);
  }, 2400);
}

// ─── SHAKE ANIMATION (invalid input feedback) ─────────────────────────────────
function shake(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.getBoundingClientRect(); // reflow
  el.style.animation = 'shake 0.3s ease';
  el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractDomain(url = '') {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

// ─── SHAKE KEYFRAME ───────────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-6px); }
    40%,80%  { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

// ─── BOOT ─────────────────────────────────────────────────────────────────────
init();
