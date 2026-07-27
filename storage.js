// TabVault — Storage Utilities (Updated with Workspaces)
// All data lives in chrome.storage.local

const NOW = Date.now();

export const Storage = {
  // ─── DEFAULTS ─────────────────────────────────────────────────────────────
  defaults: {
    workspaces: [
      { id: 'ws_home',          name: 'Home',             order: 0, createdAt: NOW },
      { id: 'ws_dev',           name: 'Dev & Code',       order: 1, createdAt: NOW },
      { id: 'ws_work',          name: 'Work',             order: 2, createdAt: NOW },
      { id: 'ws_daily',         name: 'Daily',            order: 3, createdAt: NOW },
      { id: 'ws_news',          name: 'News & Reading',   order: 4, createdAt: NOW },
      { id: 'ws_entertainment', name: 'Entertainment',    order: 5, createdAt: NOW },
      { id: 'ws_shopping',      name: 'Shopping',         order: 6, createdAt: NOW },
      { id: 'ws_learning',      name: 'Learning',         order: 7, createdAt: NOW }
    ],
    folders: [
      { id: 'fl_myws',    name: 'My Workspace',    workspaceId: 'ws_home', color: '#1d6a30', icon: '💼', createdAt: NOW },
      { id: 'fl_email',   name: 'Email & Calendar',workspaceId: 'ws_home', color: '#1d6a30', icon: '📧', createdAt: NOW },
      { id: 'fl_notes',   name: 'Notes & Docs',    workspaceId: 'ws_home', color: '#1d6a30', icon: '📝', createdAt: NOW },
      { id: 'fl_cloud',   name: 'Cloud Storage',   workspaceId: 'ws_home', color: '#1d6a30', icon: '☁️', createdAt: NOW },
      { id: 'fl_comm',    name: 'Communication',   workspaceId: 'ws_home', color: '#1d6a30', icon: '💬', createdAt: NOW },
      { id: 'fl_social',  name: 'Social Media',    workspaceId: 'ws_home', color: '#1d6a30', icon: '📱', createdAt: NOW },
      { id: 'fl_finance', name: 'Finance',          workspaceId: 'ws_home', color: '#1d6a30', icon: '💰', createdAt: NOW },
      { id: 'fl_tools',   name: 'Tools & Utils',   workspaceId: 'ws_home', color: '#1d6a30', icon: '🛠️', createdAt: NOW }
    ],
    bookmarks: [
      // My Workspace
      { id: 'bm_gmail',    url: 'https://mail.google.com',    title: 'Gmail',           folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=32',    tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_gdocs',    url: 'https://docs.google.com',    title: 'Google Docs',     folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=docs.google.com&sz=32',    tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_chatgpt',  url: 'https://chatgpt.com',        title: 'ChatGPT',         folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_gcal',     url: 'https://calendar.google.com',title: 'Google Calendar', folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=calendar.google.com&sz=32', tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_notion',   url: 'https://notion.so',          title: 'Notion',          folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=notion.so&sz=32',          tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_whatsapp', url: 'https://web.whatsapp.com',   title: 'WhatsApp Web',    folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=web.whatsapp.com&sz=32',   tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_google',   url: 'https://google.com',         title: 'Google',          folderId: 'fl_myws',   favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',         tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Email & Calendar
      { id: 'bm_outlook',  url: 'https://outlook.com',        title: 'Outlook',         folderId: 'fl_email',  favicon: 'https://www.google.com/s2/favicons?domain=outlook.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_calendly', url: 'https://calendly.com',       title: 'Calendly',        folderId: 'fl_email',  favicon: 'https://www.google.com/s2/favicons?domain=calendly.com&sz=32',       tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Notes & Docs
      { id: 'bm_evernote', url: 'https://evernote.com',       title: 'Evernote',        folderId: 'fl_notes',  favicon: 'https://www.google.com/s2/favicons?domain=evernote.com&sz=32',       tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_obsidian', url: 'https://obsidian.md',        title: 'Obsidian Web',    folderId: 'fl_notes',  favicon: 'https://www.google.com/s2/favicons?domain=obsidian.md&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_gkeep',    url: 'https://keep.google.com',    title: 'Google Keep',     folderId: 'fl_notes',  favicon: 'https://www.google.com/s2/favicons?domain=keep.google.com&sz=32',    tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Cloud Storage
      { id: 'bm_gdrive',   url: 'https://drive.google.com',   title: 'Google Drive',    folderId: 'fl_cloud',  favicon: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=32',   tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_dropbox',  url: 'https://dropbox.com',        title: 'Dropbox',         folderId: 'fl_cloud',  favicon: 'https://www.google.com/s2/favicons?domain=dropbox.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_onedrive', url: 'https://onedrive.live.com',  title: 'OneDrive',        folderId: 'fl_cloud',  favicon: 'https://www.google.com/s2/favicons?domain=onedrive.live.com&sz=32',  tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_icloud',   url: 'https://icloud.com',         title: 'iCloud',          folderId: 'fl_cloud',  favicon: 'https://www.google.com/s2/favicons?domain=icloud.com&sz=32',         tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Communication
      { id: 'bm_slack',    url: 'https://slack.com',          title: 'Slack',           folderId: 'fl_comm',   favicon: 'https://www.google.com/s2/favicons?domain=slack.com&sz=32',          tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_discord',  url: 'https://discord.com',        title: 'Discord',         folderId: 'fl_comm',   favicon: 'https://www.google.com/s2/favicons?domain=discord.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_zoom',     url: 'https://zoom.us',            title: 'Zoom',            folderId: 'fl_comm',   favicon: 'https://www.google.com/s2/favicons?domain=zoom.us&sz=32',            tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_teams',    url: 'https://teams.microsoft.com',title: 'Microsoft Teams', folderId: 'fl_comm',   favicon: 'https://www.google.com/s2/favicons?domain=teams.microsoft.com&sz=32', tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Social Media
      { id: 'bm_ig',       url: 'https://instagram.com',      title: 'Instagram',       folderId: 'fl_social', favicon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32',      tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_twitter',  url: 'https://twitter.com',        title: 'Twitter / X',     folderId: 'fl_social', favicon: 'https://www.google.com/s2/favicons?domain=twitter.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_linkedin', url: 'https://linkedin.com',       title: 'LinkedIn',        folderId: 'fl_social', favicon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32',       tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_reddit',   url: 'https://reddit.com',         title: 'Reddit',          folderId: 'fl_social', favicon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32',         tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Finance
      { id: 'bm_paypal',   url: 'https://paypal.com',         title: 'PayPal',          folderId: 'fl_finance',favicon: 'https://www.google.com/s2/favicons?domain=paypal.com&sz=32',         tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_coinbase', url: 'https://coinbase.com',       title: 'Coinbase',        folderId: 'fl_finance',favicon: 'https://www.google.com/s2/favicons?domain=coinbase.com&sz=32',       tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_wise',     url: 'https://wise.com',           title: 'Wise',            folderId: 'fl_finance',favicon: 'https://www.google.com/s2/favicons?domain=wise.com&sz=32',           tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      // Tools & Utils
      { id: 'bm_canva',    url: 'https://canva.com',          title: 'Canva',           folderId: 'fl_tools',  favicon: 'https://www.google.com/s2/favicons?domain=canva.com&sz=32',          tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_gtrans',   url: 'https://translate.google.com',title: 'Google Translate',folderId: 'fl_tools', favicon: 'https://www.google.com/s2/favicons?domain=translate.google.com&sz=32',tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_deepl',    url: 'https://deepl.com',          title: 'DeepL',           folderId: 'fl_tools',  favicon: 'https://www.google.com/s2/favicons?domain=deepl.com&sz=32',          tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW },
      { id: 'bm_tinypng',  url: 'https://tinypng.com',        title: 'TinyPNG',         folderId: 'fl_tools',  favicon: 'https://www.google.com/s2/favicons?domain=tinypng.com&sz=32',        tags: [], notes: '', pinned: false, createdAt: NOW, updatedAt: NOW }
    ],
    tags: [],
    settings: {
      theme: 'dark',
      activeWorkspaceId: 'ws_home',
      showFavicons: true,
      compactCards: false
    }
  },

  // ─── INITIALIZATION ───────────────────────────────────────────────────────
  async init() {
    const data = await chrome.storage.local.get(null);
    const updates = {};
    for (const [key, val] of Object.entries(this.defaults)) {
      if (data[key] === undefined) updates[key] = val;
    }
    if (Object.keys(updates).length) {
      await chrome.storage.local.set(updates);
    }
    return await chrome.storage.local.get(null);
  },

  // ─── WORKSPACES ───────────────────────────────────────────────────────────
  async getWorkspaces() {
    const { workspaces = [] } = await chrome.storage.local.get('workspaces');
    return workspaces.sort((a, b) => a.order - b.order);
  },

  async addWorkspace(workspace) {
    const workspaces = await this.getWorkspaces();
    const newWs = {
      id: this.generateId('ws'),
      name: workspace.name,
      order: workspaces.length,
      createdAt: Date.now()
    };
    workspaces.push(newWs);
    await chrome.storage.local.set({ workspaces });
    return newWs;
  },

  async updateWorkspace(id, updates) {
    const workspaces = await this.getWorkspaces();
    const idx = workspaces.findIndex(w => w.id === id);
    if (idx === -1) return null;
    workspaces[idx] = { ...workspaces[idx], ...updates };
    await chrome.storage.local.set({ workspaces });
    return workspaces[idx];
  },

  async deleteWorkspace(id) {
    const workspaces = await this.getWorkspaces();
    await chrome.storage.local.set({ workspaces: workspaces.filter(w => w.id !== id) });
    // Move folders out
    const folders = await this.getFolders();
    const updated = folders.map(f => f.workspaceId === id ? { ...f, workspaceId: null } : f);
    await chrome.storage.local.set({ folders: updated });
  },

  // ─── BOOKMARKS ────────────────────────────────────────────────────────────
  async getBookmarks() {
    const { bookmarks = [] } = await chrome.storage.local.get('bookmarks');
    return bookmarks;
  },

  async addBookmark(bookmark) {
    const bookmarks = await this.getBookmarks();
    const newBm = {
      id: this.generateId('bm'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      folderId: null,
      notes: '',
      description: '',
      favicon: '',
      pinned: false,
      ...bookmark
    };
    bookmarks.unshift(newBm);
    await chrome.storage.local.set({ bookmarks });
    return newBm;
  },

  async updateBookmark(id, updates) {
    const bookmarks = await this.getBookmarks();
    const idx = bookmarks.findIndex(b => b.id === id);
    if (idx === -1) return null;
    bookmarks[idx] = { ...bookmarks[idx], ...updates, updatedAt: Date.now() };
    await chrome.storage.local.set({ bookmarks });
    return bookmarks[idx];
  },

  async deleteBookmark(id) {
    const bookmarks = await this.getBookmarks();
    await chrome.storage.local.set({ bookmarks: bookmarks.filter(b => b.id !== id) });
  },

  async isDuplicate(url) {
    const bookmarks = await this.getBookmarks();
    return bookmarks.find(b => b.url === url) || null;
  },

  async searchBookmarks(query) {
    const bookmarks = await this.getBookmarks();
    if (!query) return bookmarks;
    const q = query.toLowerCase();
    return bookmarks.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.url?.toLowerCase().includes(q) ||
      b.notes?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q))
    );
  },

  // ─── FOLDERS ──────────────────────────────────────────────────────────────
  async getFolders() {
    const { folders = [] } = await chrome.storage.local.get('folders');
    return folders;
  },

  async addFolder(folder) {
    const folders = await this.getFolders();
    const newFolder = {
      id: this.generateId('fl'),
      color: '#1d6a30',
      icon: '📁',
      workspaceId: null,
      createdAt: Date.now(),
      ...folder
    };
    folders.push(newFolder);
    await chrome.storage.local.set({ folders });
    return newFolder;
  },

  async updateFolder(id, updates) {
    const folders = await this.getFolders();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) return null;
    folders[idx] = { ...folders[idx], ...updates };
    await chrome.storage.local.set({ folders });
    return folders[idx];
  },

  async deleteFolder(id) {
    const folders = await this.getFolders();
    await chrome.storage.local.set({ folders: folders.filter(f => f.id !== id) });
    const bookmarks = await this.getBookmarks();
    const updated = bookmarks.map(b => b.folderId === id ? { ...b, folderId: null } : b);
    await chrome.storage.local.set({ bookmarks: updated });
  },

  // ─── TAGS ─────────────────────────────────────────────────────────────────
  async getTags() {
    const { tags = [] } = await chrome.storage.local.get('tags');
    return tags;
  },

  async ensureTag(name) {
    const tags = await this.getTags();
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const newTag = { id: this.generateId('tg'), name: name.trim(), color: this.randomTagColor(), createdAt: Date.now() };
    tags.push(newTag);
    await chrome.storage.local.set({ tags });
    return newTag;
  },

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  async getSettings() {
    const { settings = {} } = await chrome.storage.local.get('settings');
    return { ...this.defaults.settings, ...settings };
  },

  async updateSettings(updates) {
    const settings = await this.getSettings();
    const merged = { ...settings, ...updates };
    await chrome.storage.local.set({ settings: merged });
    return merged;
  },

  // ─── EXPORT / IMPORT ──────────────────────────────────────────────────────
  async exportData() {
    const data = await chrome.storage.local.get(null);
    const exportObj = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      app: 'TabVault',
      data: {
        workspaces: data.workspaces || [],
        bookmarks: data.bookmarks || [],
        folders: data.folders || [],
        tags: data.tags || [],
        settings: data.settings || {}
      }
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabvault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importData(json) {
    let parsed;
    try { parsed = JSON.parse(json); } catch { throw new Error('Invalid JSON file'); }
    const data = parsed.data || parsed;
    const { workspaces = [], bookmarks = [], folders = [], tags = [], settings = {} } = data;
    if (!Array.isArray(bookmarks)) throw new Error('Invalid data format');
    await chrome.storage.local.set({ workspaces, bookmarks, folders, tags, settings });
    return { bookmarks: bookmarks.length, folders: folders.length, workspaces: workspaces.length };
  },

  async clearAll() {
    await chrome.storage.local.clear();
  },

  // ─── UTILITIES ────────────────────────────────────────────────────────────
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  extractDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  },

  getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch { return ''; }
  },

  randomTagColor() {
    const colors = ['#00d9c8', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};
