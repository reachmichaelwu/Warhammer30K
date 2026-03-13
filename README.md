# Horus Heresy 3rd Edition — Combat Toolkit

Browser-based toolkit for **Warhammer: The Horus Heresy — Age of Darkness (3rd Edition)**.

## Features

- **Army Builder** — Crusade Force Organisation with detachment slots, legion factions, wargear, and points
- **Shooting Resolver** — Full dice resolution with BS tables, wound charts, saves, special rules
- **Return Fire** — Shooting phase reaction resolver
- **Assault Resolver** — Initiative-step based combat with per-weapon-group dice tracking
- **Charge Resolver** — Charge distance, overwatch, melee combat with WS comparison charts
- **Challenge Sub-Phase** — Character challenges with gambits
- **VP Tracking** — Primary and secondary objective scoring

## Deploy on GitHub Pages

1. Push all files to a GitHub repo (files must be in the repo root)
2. **Settings → Pages → Source: Deploy from branch** → `main`, root `/`
3. Site goes live at `https://<username>.github.io/<repo-name>/`

## Technical Details

- **No build step** — all JSX is pre-transpiled to `React.createElement` calls
- React 18 loaded from CDN (unpkg.com)
- 18 plain JS files, no bundler or transpiler needed at runtime
- Works on any static file server including GitHub Pages
