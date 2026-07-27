// TabVault — Background Service Worker
// Handles: Context menus, keyboard shortcuts, tab messaging

// ─── CONTEXT MENU SETUP ───────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tabvault-save-page',
    title: '⚡ Save to TabVault',
    contexts: ['page', 'link']
  });

  chrome.contextMenus.create({
    id: 'tabvault-save-link',
    title: '🔗 Save Link to TabVault',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'tabvault-separator',
    type: 'separator',
    contexts: ['page', 'link']
  });

  chrome.contextMenus.create({
    id: 'tabvault-open-dashboard',
    title: '📚 Open TabVault Dashboard',
    contexts: ['page', 'link']
  });
});

// ─── CONTEXT MENU CLICK HANDLER ───────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'tabvault-save-page') {
    await saveCurrentTab(tab);
  } else if (info.menuItemId === 'tabvault-save-link') {
    await saveLinkUrl(info.linkUrl, tab);
  } else if (info.menuItemId === 'tabvault-open-dashboard') {
    chrome.tabs.create({ url: 'newtab.html' });
  }
});

// ─── KEYBOARD SHORTCUT HANDLER ────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-save') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await saveCurrentTab(tab);
      // Notify any open newtab pages to refresh
      notifyDashboard('BOOKMARK_ADDED');
    }
  }
});

// ─── SAVE HELPERS ─────────────────────────────────────────────────────────────
async function saveCurrentTab(tab) {
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }

  const bookmark = {
    id: generateId(),
    url: tab.url,
    title: tab.title || extractDomain(tab.url),
    favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(tab.url)}&sz=32`,
    description: '',
    notes: '',
    tags: [],
    folderId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await addBookmark(bookmark);
  
  // Show badge briefly
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#00d9c8' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
}

async function saveLinkUrl(url, tab) {
  if (!url) return;

  const domain = extractDomain(url);
  const bookmark = {
    id: generateId(),
    url: url,
    title: domain,
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    description: '',
    notes: '',
    tags: [],
    folderId: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await addBookmark(bookmark);
  
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#00d9c8' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
async function addBookmark(bookmark) {
  const data = await chrome.storage.local.get(['bookmarks']);
  const bookmarks = data.bookmarks || [];
  
  // Check for duplicate URL
  const exists = bookmarks.find(b => b.url === bookmark.url);
  if (exists) {
    // Notify about duplicate — still save if explicitly wanted
    notifyDashboard('DUPLICATE_FOUND', { existing: exists });
    return;
  }
  
  bookmarks.unshift(bookmark); // Add to beginning
  await chrome.storage.local.set({ bookmarks });
  notifyDashboard('BOOKMARK_ADDED', { bookmark });
}

function notifyDashboard(event, data = {}) {
  // Notify any open TabVault tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes(chrome.runtime.id)) {
        chrome.tabs.sendMessage(tab.id, { event, ...data }).catch(() => {});
      }
    });
  });
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function generateId() {
  return `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
