# UI Lock — Approved Baseline 5002966

Approved WordPress-mirror homepage UI captured from release `5002966`.

Baseline screenshots are full-page captures at 390/1440/1920 widths. When Dimgrey staging is rate-limited, capture from the local production build at the same approved SHA:

```bash
npm run build && npm run start
UI_LOCK_BASELINE_URL=http://127.0.0.1:3000 npm run capture:ui-lock-baseline
```

## Files

- `home-390.png`, `home-1440.png`, `home-1920.png` — full-page screenshots
- `home-structure.json` — section order, bounds, page height
- `visual-source-manifest.json` — SHA-256 hashes of homepage mirror visual source files

## Commands

```bash
# Capture baseline from approved Dimgrey (one-time / refresh only with explicit approval)
npm run capture:ui-lock-baseline

# Validate current local preview against baseline (requires running server)
npm run build && npm run start
UI_LOCK_URL=http://127.0.0.1:3000 npm run validate:ui-lock
```

Architecture guard: `app/(site)/page.tsx` must render `HomeWpMirrorPage`.
