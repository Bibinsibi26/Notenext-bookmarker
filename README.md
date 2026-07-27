# 🔖 TabVault — Smart Bookmark Manager

> A privacy-focused, 100% free Chrome extension that transforms your new tab into a beautiful bookmark dashboard. No login, no cloud, no subscriptions — just your bookmarks, your way.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Custom New Tab** | Replaces Chrome's default new tab with a full bookmark dashboard |
| **Quick Save** | Save any tab instantly via popup, context menu, or `Alt+S` |
| **Folders** | Visual collections with custom icons and color coding |
| **Tags** | Multi-tag system with color-coded labels |
| **Instant Search** | Real-time filtering by title, URL, tags, and notes |
| **Grid & List Views** | Toggle between card and compact list layouts |
| **Notes** | Add personal reminders to any bookmark |
| **Pin Bookmarks** | Pin important links to the top |
| **Export / Import** | Full JSON backup and restore at any time |
| **Context Menu** | Right-click any page → "Save to TabVault" |
| **Privacy First** | 100% client-side, `chrome.storage.local` only |

---

## 🚀 Installation (Developer Mode)

### Step 1 — Generate Icons

**Option A**: Open `generate-icons.html` in your browser → click the button → save the 4 downloaded PNG files into the `icons/` folder.

**Option B**: The SVG icons are already created in `icons/` and Chrome will use them automatically.

### Step 2 — Load the Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `tabvault-extension/` folder
5. Done! Open a new tab to see your dashboard.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+S` | Quick save current tab |
| `Alt+B` | Open TabVault popup |
| `Alt+F` | Focus search bar (when on new tab) |
| `Esc` | Close modal / clear search |

> You can customize shortcuts at `chrome://extensions/shortcuts`

---

## 📁 Project Structure

```
tabvault-extension/
├── manifest.json          ← MV3 manifest
├── background.js          ← Service worker (context menus, shortcuts)
├── storage.js             ← Shared storage utilities
├── newtab.html            ← New Tab dashboard
├── newtab.css             ← Dashboard styles
├── newtab.js              ← Dashboard logic
├── popup.html             ← Toolbar popup
├── popup.css              ← Popup styles
├── popup.js               ← Popup logic
├── icons/
│   ├── icon16.svg         ← Toolbar icon (16px)
│   ├── icon32.svg         ← Toolbar icon (32px)
│   ├── icon48.svg         ← Extension page icon (48px)
│   └── icon128.svg        ← Chrome Web Store icon (128px)
├── generate-icons.html    ← Open in browser to generate PNGs
└── generate-icons.js      ← Node.js icon helper
```

---

## 💾 Data & Privacy

- All data is stored in `chrome.storage.local` — **never leaves your device**
- Use **Export** (Settings → Export JSON) to create a full backup
- Use **Import** to restore from any backup file
- Import supports both "replace all" and "merge" modes

### Backup Format
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "app": "TabVault",
  "data": {
    "bookmarks": [...],
    "folders": [...],
    "tags": [...],
    "settings": {...}
  }
}
```

---

## 🛠️ Customization

### Adding a Default Folder
Edit the `defaults.folders` array in `storage.js` to pre-populate folders for new users.

### Changing the Color Palette
The entire design system lives in the `:root {}` block at the top of `newtab.css`. Key variables:
- `--accent-teal: #00d9c8` — primary accent
- `--accent-indigo: #6366f1` — secondary accent
- `--bg-primary: #080d1a` — main background

---

## 🧩 Context Menu Options

Right-click any page or link:
- ⚡ **Save to TabVault** — saves the current page
- 🔗 **Save Link to TabVault** — saves a hovered link
- 📚 **Open TabVault Dashboard** — opens a new tab with the dashboard

---

*TabVault v1.0.0 — Built with ❤️ using pure vanilla HTML/CSS/JS + Manifest V3*
