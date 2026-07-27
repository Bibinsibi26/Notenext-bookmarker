🔖 NoteNext — Smart Bookmark ManagerA privacy-focused, 100% free Chrome extension that transforms your new tab into a powerful, beautifully designed bookmark dashboard. Completely local, zero configuration, and zero cloud tracking — your bookmarks remain strictly yours.✨ Core FeaturesFeatureDescriptionCustom New Tab DashboardReplaces the default Chrome new tab with a modern, high-performance bookmark command center.Instant CaptureSave any web page instantly via toolbar popup, right-click context menu, or the Alt+S shortcut.Visual FoldersOrganize bookmarks into customized collections with tailored icons and color coding.Advanced TaggingCategorize links using a multi-tag system with color-coded labels for rapid filtering.Real-Time SearchInstantly filter items by title, destination URL, associated tags, or personal notes.Flexible LayoutsSeamlessly toggle between visual card grids and compact list views.Personal NotesAttach context, reminders, or annotations directly to any saved bookmark.Pinning SystemPin high-priority or frequently accessed links to the top of your dashboard.Robust Backup & RestoreExport and import full configurations securely via standard JSON files.Context Menu IntegrationQuickly right-click any page or link to save it directly to NoteNext.Privacy by DesignOperates 100% client-side using isolated chrome.storage.local storage.🚀 Installation Guide (Developer Mode)Step 1 — Asset PreparationEnsure all required icon files (icon16.svg, icon32.svg, icon48.svg, icon128.svg) are present within the icons/ directory. Alternatively, open generate-icons.html locally in your browser to generate and export the corresponding PNG assets.Step 2 — Loading the ExtensionOpen Google Chrome and navigate to chrome://extensions/.Enable Developer Mode using the toggle switch in the top-right corner.Click the "Load unpacked" button in the upper-left.Select the root notenext-extension/ directory.Open a new browser tab to launch your dashboard.⌨️ Keyboard ShortcutsShortcutActionAlt+SQuickly save the active tabAlt+BOpen the NoteNext extension popupAlt+FFocus the global search bar (while on the dashboard tab)EscDismiss modals or clear active search filtersNote: You can reconfigure these shortcuts anytime by visiting chrome://extensions/shortcuts.📁 Project Architecturenotenext-extension/
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
🔒 Data Security & PrivacyNoteNext is engineered with privacy as a foundational standard:All data resides locally inside chrome.storage.local and never transmits across external servers.Export Functionality: Navigate to Settings → Export JSON to generate a complete backup of your data structure at any time.Import Functionality: Easily restore or migrate your setup with support for both "merge" and "replace all" modes.Backup Schema SpecJSON{
  "version": "1.0.0",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "app": "NoteNext",
  "data": {
    "bookmarks": [...],
    "folders": [...],
    "tags": [...],
    "settings": {...}
  }
}
🛠️ Customization & ThemingDefault ConfigurationTo pre-populate folders or tags for new installations, modify the defaults.folders array inside storage.js.Visual ThemingThe entire design language is structured using CSS variables inside the :root {} block of newtab.css. Key customization properties include:--accent-teal: #00d9c8 — Primary brand accent--accent-indigo: #6366f1 — Secondary highlight element--bg-primary: #080d1a — Core layout background🧩 Context Menu ActionsRight-clicking anywhere on a webpage or hyperlink exposes the following commands:⚡ Save to NoteNext — Instantly captures the active document🔗 Save Link to NoteNext — Captures the targeted hyperlink destination📚 Open NoteNext Dashboard — Opens a clean dashboard instance in a new tabNoteNext v1.0.0 — Engineered with precision using vanilla HTML5, CSS3, and JavaScript under Manifest V3.
