#!/usr/bin/env bash
# Atomic Dimgrey staging deployment from local workspace.
# Usage: ./tooling/dimgrey-clean-reset/deploy-atomic-release.sh [git-sha]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

SHA="${1:-$(git rev-parse HEAD)}"
SHORT_SHA="$(git rev-parse --short "$SHA")"
BRANCH="$(git branch --show-current)"
BUILD_ID="$(cat .next/BUILD_ID)"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

SSH_HOST="${DIMGREY_SSH_HOST:-147.93.100.126}"
SSH_PORT="${DIMGREY_SSH_PORT:-65002}"
SSH_USER="${DIMGREY_SSH_USER:-u188101251}"
SSH_PASS="${HOSTINGER_PASS:?HOSTINGER_PASS is required}"

REMOTE_APP="$HOME/dimgrey-app"
REMOTE_RELEASE="$REMOTE_APP/releases/$SHORT_SHA"
DOMAIN_ROOT="$HOME/domains/dimgrey-goat-473970.hostingersite.com"
PUBLIC_HTML="$DOMAIN_ROOT/public_html"

TARBALL="/tmp/dimgrey-release-${SHORT_SHA}.tar.gz"

echo "[deploy] Building release tarball for $SHORT_SHA ($BUILD_ID)..."
tar -czf "$TARBALL" \
  --exclude='.git' \
  --exclude='tooling/visual-parity/wp' \
  --exclude='tooling/visual-parity/next' \
  --exclude='tooling/visual-parity/diffs' \
  --exclude='node_modules/.cache' \
  --exclude='.cursor' \
  .next \
  app \
  components \
  data \
  lib \
  public \
  middleware.ts \
  next.config.ts \
  next-env.d.ts \
  package.json \
  package-lock.json \
  server.js \
  tsconfig.json

echo "[deploy] Uploading to Hostinger..."
sshpass -p "$SSH_PASS" scp -P "$SSH_PORT" -o StrictHostKeyChecking=no "$TARBALL" "$SSH_USER@$SSH_HOST:/tmp/dimgrey-release-${SHORT_SHA}.tar.gz"

echo "[deploy] Installing release on server..."
sshpass -p "$SSH_PASS" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "bash -s" <<REMOTE
set -euo pipefail
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:/opt/alt/alt-nodejs22/root/bin:\$PATH"

SHORT_SHA="$SHORT_SHA"
FULL_SHA="$SHA"
BRANCH="$BRANCH"
BUILD_ID="$BUILD_ID"
TIMESTAMP="$TIMESTAMP"
REMOTE_APP="\$HOME/dimgrey-app"
REMOTE_RELEASE="\$REMOTE_APP/releases/\$SHORT_SHA"
DOMAIN_ROOT="\$HOME/domains/dimgrey-goat-473970.hostingersite.com"
PUBLIC_HTML="\$DOMAIN_ROOT/public_html"

mkdir -p "\$REMOTE_RELEASE/tmp"
rm -rf "\$REMOTE_RELEASE"/*
tar -xzf "/tmp/dimgrey-release-\${SHORT_SHA}.tar.gz" -C "\$REMOTE_RELEASE"
rm -f "/tmp/dimgrey-release-\${SHORT_SHA}.tar.gz"

cd "\$REMOTE_RELEASE"
npm ci --omit=dev 2>&1 | tail -5
mkdir -p tmp

cat > deployment-info.json <<JSON
{
  "gitSha": "\$FULL_SHA",
  "gitShortSha": "\$SHORT_SHA",
  "branch": "\$BRANCH",
  "buildId": "\$BUILD_ID",
  "releaseDirectory": "\$REMOTE_RELEASE",
  "deployedAt": "\$TIMESTAMP",
  "checkpoint": "header-hero-rail-proof-sections",
  "stagingUrl": "https://dimgrey-goat-473970.hostingersite.com/"
}
JSON

ln -sfn "\$REMOTE_RELEASE" "\$REMOTE_APP/current"

cat > "\$PUBLIC_HTML/.htaccess" <<HT
PassengerEnabled on
PassengerAppRoot \$REMOTE_APP/current
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir \$REMOTE_APP/current/tmp
SetEnv NODE_OPTIONS "--require \$PUBLIC_HTML/.builds/config/preload-timestamp.js"
SetEnv LSNODE_CONSOLE_LOG console.log
SetEnv TOKIO_WORKER_THREADS 2
SetEnv DGS_PUBLIC_INDEXING false
RewriteRule ^.builds - [F,L]

<IfModule mod_headers.c>
Header always set Cache-Control "private, no-store, max-age=0, must-revalidate"
Header always set CDN-Cache-Control "no-store"
Header always set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
HT

touch "\$REMOTE_APP/current/tmp/restart.txt"
pkill -u "\$(whoami)" -f "lsnode:" 2>/dev/null || true
sleep 3

echo "DEPLOYED_SHA=\$FULL_SHA"
echo "DEPLOYED_BUILD_ID=\$BUILD_ID"
echo "RELEASE_DIR=\$REMOTE_RELEASE"
echo "CURRENT_LINK=\$(readlink -f \$REMOTE_APP/current)"
REMOTE

rm -f "$TARBALL"
echo "[deploy] Done."
