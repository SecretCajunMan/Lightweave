# Lightweave — offline build

One truth, many windows. This folder is the complete, self-contained Lightweave site:
the landing page, the field guide, and all 41 projection rooms. It has **no external
dependencies** — React, the fonts, and all logic are bundled locally, so it runs with
no internet connection.

## What's inside
- `index.html` — entry point (redirects to the landing page)
- `Home.dc.html` — the landing page ("start with five" + live prism demo)
- `start-here.dc.html` — the field guide
- 41 `*.dc.html` rooms — every projection lens
- `lw-site.js` — shared nav rail + the portable Ledger inspector (one manifest, all rooms)
- `support.js` — the rendering runtime (repointed at the local React below)
- `react.production.min.js`, `react-dom.production.min.js` — vendored React 18.3.1
- `fonts.css` — Space Grotesk / IBM Plex Sans / IBM Plex Mono, woff2 inlined
- `origin-ledger.json` — a clean sample ledger you can import via any room's "Open ledger" button

No personal data, source logs, or build files are included.

## How to run

**Recommended — any static server** (needed for the Ledger import, which uses localStorage):
```
cd lightweave
python3 -m http.server 8000      # then open http://localhost:8000
```
or `npx serve`, or drop the folder into Netlify / GitHub Pages / any static host.

**Quick look — just open it:** double-click `index.html`. Everything renders offline;
note that some browsers restrict `localStorage` on `file://`, so the "import your own
ledger" feature works best when served over http (above).

## Truth rules (unchanged)
Projection is downstream of truth. Rooms read the ledger; they never write to it.
Every insight opens a proof drawer. A theme changes palette only, never confidence,
lifecycle, provenance, or facts. Records edited: 0.
