 NoteNext — Smart Bookmark Manager

> A privacy-focused, 100% free Chrome extension that transforms your new tab into a powerful, beautifully designed bookmark dashboard. Completely local, zero configuration, and zero cloud tracking — your bookmarks remain strictly yours.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| **Custom New Tab Dashboard** | Replaces the default Chrome new tab with a modern, high-performance bookmark command center. |
| **Instant Capture** | Save any web page instantly via toolbar popup, right-click context menu, or the `Alt+S` shortcut. |
| **Visual Folders** | Organize bookmarks into customized collections with tailored icons and color coding. |
| **Advanced Tagging** | Categorize links using a multi-tag system with color-coded labels for rapid filtering. |
| **Real-Time Search** | Instantly filter items by title, destination URL, associated tags, or personal notes. |
| **Flexible Layouts** | Seamlessly toggle between visual card grids and compact list views. |
| **Personal Notes** | Attach context, reminders, or annotations directly to any saved bookmark. |
| **Pinning System** | Pin high-priority or frequently accessed links to the top of your dashboard. |
| **Robust Backup & Restore** | Export and import full configurations securely via standard JSON files. |
| **Context Menu Integration** | Quickly right-click any page or link to save it directly to NoteNext. |
| **Privacy by Design** | Operates 100% client-side using isolated `chrome.storage.local` storage. |

---

## 🚀 Installation Guide (Developer Mode)

### Step 1 — Asset Preparation
Ensure all required icon files (`icon16.svg`, `icon32.svg`, `icon48.svg`, `icon128.svg`) are present within the `icons/` directory. Alternatively, open `generate-icons.html` locally in your browser to generate and export the corresponding PNG assets.

### Step 2 — Loading the Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** using the toggle switch in the top-right corner.
3. Click the **"Load unpacked"** button in the upper-left.
4. Select the root `notenext-extension/` directory.
5. Open a new browser tab to launch your dashboard.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+S` | Quickly save the active tab |
| `Alt+B` | Open the NoteNext extension popup |
| `Alt+F` | Focus the global search bar (while on the dashboard tab) |
| `Esc` | Dismiss modals or clear active search filters |

> *Note: You can reconfigure these shortcuts anytime by visiting `chrome://extensions/shortcuts`.*

---

## 📁 Project Architecture

```text
notenext-extension/
├── manifest.json          ← Manifest V3 configuration
├── background.js          ← Service worker (context menus, keyboard hooks)
├── storage.js             ← Shared storage abstraction utilities
├── newtab.html            ← Main dashboard interface
├── newtab.css             ← Dashboard stylesheet & design system
├── newtab.js              ← Dashboard interaction logic
├── popup.html             ← Toolbar action popup
├── popup.css              ← Popup stylesheet
├── popup.js               ← Popup interaction logic
├── icons/
│   ├── icon16.svg         ← Toolbar icon (16px)
│   ├── icon32.svg         ← Toolbar icon (32px)
│   ├── icon48.svg         ← Extension management icon (48px)
│   └── icon128.svg        ← Chrome Web Store asset (128px)
├── generate-icons.html    ← Browser-based PNG icon compiler
└── generate-icons.js      ← Node.js build script helper
