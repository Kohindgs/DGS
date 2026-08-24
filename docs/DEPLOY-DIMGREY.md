# Deploy the new DGS build to the dimgrey demo link

**What this is:** exact, copy-paste steps to put the new spatial-universe build (the one
running on the Arena preview) onto `dimgrey-goat-473970.hostingersite.com`, replacing the old
cinematic prototype.

**Why the Arena agent can't do it directly:** this sandbox has no Hostinger/SSH access and its
network cannot reach the dimgrey host (connection refused at egress). Deployment must run from
Hostinger's side. Everything below is prepared so the job is minimal.

---

## Step 0 — Confirm the build is ready

The new build is committed on branch `arena/01a034c2-dgs`. It already includes the Hostinger
Node config that the old site used:

- `.htaccess` → `PassengerAppType node`, `PassengerStartupFile server.js`
- `server.js` → Next.js production server
- `package.json` → `next`, `react`, `react-dom`, plus `three`, `@react-three/fiber`, `gsap`

It builds clean (`npm run build` passes, zero errors) and serves correctly with `next start`.

---

## Option A — Hostinger Git deploy (recommended, if the old site came from GitHub)

1. In Hostinger **hPanel → Websites → (dimgrey site) → Git**, confirm a repository is connected.
   The old prototype was almost certainly deployed from `github.com/Kohindgs/DGS`, so this repo
   should already be linked.
2. Set the **branch to deploy** to `arena/01a034c2-dgs` (or point it at whichever branch you
   want live — merge into `main` only when you're ready).
3. In Hostinger Git settings, make sure **Build command** is `npm install && npm run build`
   (Hostinger runs this before Passenger starts the app).
4. Trigger **Deploy**. Hostinger pulls the repo, installs, builds, and restarts `server.js`.
5. Hard-refresh `dimgrey-goat-473970.hostingersite.com` to clear cache.

---

## Option B — Manual upload

1. Build locally: `npm install && npm run build`.
2. Upload the **entire project folder** (including `.next`, `package.json`, `package-lock.json`,
   `server.js`, `.htaccess`, `public/`) to the dimgrey site's document root via Hostinger **File
   Manager / FTP**.
3. In hPanel, ensure the domain's **Node.js / Passenger** app points at `server.js`.
4. Restart the Node app in hPanel.

---

## After deploy — verify

- Load `dimgrey-goat-473970.hostingersite.com` → new dark spatial-universe hero with the exact
  WordPress H1 "Full Service Digital Marketing Agency In Mumbai".
- Scroll slowly → the camera travels through the universe (first-scroll transition).
- Check reduced-motion (OS setting) shows the static state, and the site works with WebGL off.

---

## What you (owner) must decide

- Which branch goes live: `arena/01a034c2-dgs` (current new build) vs merging to `main`.
- Whether Hostinger Git is already connected to this repo. If you're not sure, open the hPanel
  Git tab and tell me what it shows — I'll guide you exactly.
