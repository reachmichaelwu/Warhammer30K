# Horus Heresy 30K — Combat Resolver
### GitHub Pages Deployment Guide

## File Structure
```
/
├── index.html          ← Main entry point
└── js/
    ├── constants.js    ← BS tables, dice, wound chart, unit presets
    ├── unitData.js     ← Wargear, equipment, points data
    ├── weaponData.js   ← Detachments, weapon profiles, army structure
    ├── resolvers.js    ← Shooting / Assault / Charge / Challenge logic
    └── app.jsx         ← UI components + main app (Babel transpiles in browser)
```

## Deploy to GitHub Pages

### Option A — Deploy from repository root
1. Create a new GitHub repository (e.g. `horus-resolver`)
2. Upload all files keeping the folder structure intact
3. Go to **Settings → Pages**
4. Set Source to **Deploy from a branch**, branch = `main`, folder = `/ (root)`
5. Click **Save** — your site will be live at:
   `https://YOUR-USERNAME.github.io/horus-resolver/`

### Option B — Drag & drop via GitHub web UI
1. Go to your repo on GitHub
2. Click **Add file → Upload files**
3. Drag the entire `js/` folder and `index.html`
4. Commit, then enable Pages as above

## Run Locally (no install needed)
Open a terminal in this folder and run:
```bash
# Python 3
python3 -m http.server 8080
```
Then open **http://localhost:8080** in your browser.

> ⚠️ Do NOT open `index.html` directly by double-clicking — browsers block
> loading local `.jsx` files via Babel. Use the local server above instead.

## Notes
- Requires an internet connection on first load (CDN: React, Babel, Google Fonts)
- All CDN assets are cached after first visit
- Babel transpiles the JSX once on page load (~1–2 sec delay on first visit)
