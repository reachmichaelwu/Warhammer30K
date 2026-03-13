# Horus Heresy 30K — Combat Resolver
## Multi-file Vite + React Project

### Project Structure
```
horus-resolver/
├── index.html              ← Entry point HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx            ← React root mount
    ├── App.jsx             ← Main ShootingResolver component (~8300 lines)
    ├── constants.js        ← BS tables, dice, wound chart, unit presets
    ├── unitData.js         ← Wargear, equipment, points data
    ├── weaponData.js       ← Detachments, weapon profiles, army structure
    ├── resolvers.js        ← All phase resolution logic (shooting/assault/charge/challenge)
    ├── components.jsx      ← Reusable UI components (DieIcon, NumberInput, etc.)
    └── helpers.js          ← StatBox, MiniStat, shared style objects
```

### Quick Start

**Prerequisites:** Node.js 18+ installed ([nodejs.org](https://nodejs.org))

```bash
# 1. Install dependencies (one time only)
npm install

# 2. Start dev server (hot-reload, instant updates)
npm run dev
```
Then open **http://localhost:5173** in your browser.

### Build for Production (offline use)
```bash
npm run build
```
This outputs a `dist/` folder. Open `dist/index.html` directly in any browser — no server needed.

### Preview Production Build
```bash
npm run preview
```
Opens the built version at **http://localhost:4173**.
