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
SSH_PASS="${HOSTINGER_PASS:-}"
HOSTINGER_API_TOKEN="${HOSTINGER_API_TOKEN:-}"
HOSTINGER_ACCOUNT_ID="${HOSTINGER_ACCOUNT_ID:-u188101251}"
HOSTINGER_DOMAIN="${HOSTINGER_DOMAIN:-dimgrey-goat-473970.hostingersite.com}"

if [ -z "$HOSTINGER_API_TOKEN" ]; then
  # Fallback to local user MCP config if available
  MCP_CFG="${HOME}/.gemini/config/mcp_config.json"
  if [ -f "$MCP_CFG" ]; then
    CFG_TOKEN="$(grep -o '"HOSTINGER_API_TOKEN": *"[^"]*"' "$MCP_CFG" 2>/dev/null | head -n 1 | sed 's/.*"HOSTINGER_API_TOKEN": *"\([^"]*\)".*/\1/' || true)"
    if [ -n "$CFG_TOKEN" ] && [ "$CFG_TOKEN" != "YOUR_NEW_TOKEN" ]; then
      HOSTINGER_API_TOKEN="$CFG_TOKEN"
    fi
  fi
fi

if [ -z "$HOSTINGER_API_TOKEN" ]; then
  echo "CRITICAL: HOSTINGER_API_TOKEN is required for Hostinger CDN cache purge." >&2
  exit 1
fi

RELEASE_NAME="${SHORT_SHA}-${BUILD_ID}-$(date -u +%Y%m%d%H%M%S)"
REMOTE_APP="$HOME/dimgrey-app"
REMOTE_RELEASE="$REMOTE_APP/releases/$RELEASE_NAME"
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
  --exclude='public/Porfolio' \
  --exclude='public/media/portfolio/videos' \
  --exclude='*.mp4' \
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
if [ -n "${SSH_PASS:-}" ] && command -v sshpass >/dev/null 2>&1; then
  sshpass -p "$SSH_PASS" scp -P "$SSH_PORT" -o StrictHostKeyChecking=no "$TARBALL" "$SSH_USER@$SSH_HOST:/tmp/dimgrey-release-${SHORT_SHA}.tar.gz"
  SSH_CMD="sshpass -p $SSH_PASS ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST"
else
  scp -P "$SSH_PORT" -o BatchMode=yes -o StrictHostKeyChecking=no "$TARBALL" "$SSH_USER@$SSH_HOST:/tmp/dimgrey-release-${SHORT_SHA}.tar.gz"
  SSH_CMD="ssh -p $SSH_PORT -o BatchMode=yes -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST"
fi

echo "[deploy] Installing release on server..."
$SSH_CMD "bash -s" <<REMOTE
set -euo pipefail
export PATH="/opt/alt/alt-nodejs22/root/usr/bin:/opt/alt/alt-nodejs22/root/bin:\$PATH"

SHORT_SHA="$SHORT_SHA"
FULL_SHA="$SHA"
BRANCH="$BRANCH"
BUILD_ID="$BUILD_ID"
TIMESTAMP="$TIMESTAMP"
RELEASE_NAME="$RELEASE_NAME"
HOSTINGER_API_TOKEN="$HOSTINGER_API_TOKEN"
HOSTINGER_ACCOUNT_ID="$HOSTINGER_ACCOUNT_ID"
HOSTINGER_DOMAIN="$HOSTINGER_DOMAIN"
REMOTE_APP="\$HOME/dimgrey-app"
REMOTE_RELEASE="\$REMOTE_APP/releases/\$RELEASE_NAME"
SHARED_MEDIA="\$REMOTE_APP/shared/wp-content/uploads"
SHARED_VIDEOS="\$REMOTE_APP/shared/media/portfolio/videos"
DOMAIN_ROOT="\$HOME/domains/\$HOSTINGER_DOMAIN"
PUBLIC_HTML="\$DOMAIN_ROOT/public_html"

# Track current active release for rollback
PREVIOUS_RELEASE=""
if [ -L "\$REMOTE_APP/current" ]; then
  PREVIOUS_RELEASE="\$(readlink -f "\$REMOTE_APP/current")"
  echo "[deploy] Current active release before deploy: \$PREVIOUS_RELEASE"
fi

# Create a clean unique release directory
rm -rf "\$REMOTE_RELEASE"
mkdir -p "\$REMOTE_RELEASE/tmp"

echo "[deploy] Extracting tarball into \$REMOTE_RELEASE..."
tar -xzf "/tmp/dimgrey-release-\${SHORT_SHA}.tar.gz" -C "\$REMOTE_RELEASE"
rm -f "/tmp/dimgrey-release-\${SHORT_SHA}.tar.gz"

# Link shared persistent MP4 video assets into release public tree
if [ -d "\$SHARED_MEDIA" ]; then
  find "\$SHARED_MEDIA" -type f -name "*.mp4" | while read -r video; do
    rel="\${video#\$SHARED_MEDIA/}"
    target="\$REMOTE_RELEASE/public/wp-content/uploads/\$rel"
    mkdir -p "\$(dirname "\$target")"
    ln -sf "\$video" "\$target"
  done
fi

if [ -d "\$SHARED_VIDEOS" ]; then
  mkdir -p "\$REMOTE_RELEASE/public/media/portfolio/videos"
  find "\$SHARED_VIDEOS" -type f | while read -r vid; do
    vname="\$(basename "\$vid")"
    ln -sf "\$vid" "\$REMOTE_RELEASE/public/media/portfolio/videos/\$vname"
  done
fi

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
  "checkpoint": "hardened-atomic-deploy",
  "stagingUrl": "https://dimgrey-goat-473970.hostingersite.com/"
}
JSON

# =====================================================================
# PRE-ACTIVATION INTEGRITY CHECKS (Must pass before switching symlink)
# =====================================================================
echo "[deploy] Running Pre-Activation Integrity Checks..."

# Check 1: Build ID must match
RELEASE_BUILD_ID="\$(cat .next/BUILD_ID 2>/dev/null || echo '')"
if [ "\$RELEASE_BUILD_ID" != "\$BUILD_ID" ]; then
  echo "ERROR: BUILD_ID mismatch! Expected: \$BUILD_ID, Found: \$RELEASE_BUILD_ID"
  exit 1
fi

# Check 2: .next/server/app/ must NOT contain malformed paths
MALFORMED_COUNT=\$(find .next/server/app/ -name "*http:*" -o -name "*https:*" -o -name "*.hostingersite.com*" 2>/dev/null | wc -l)
if [ "\$MALFORMED_COUNT" -gt 0 ]; then
  echo "ERROR: Malformed shadowed path detected inside .next/server/app/ before activation!"
  find .next/server/app/ -name "*http:*" -o -name "*https:*" -o -name "*.hostingersite.com*"
  exit 1
fi
echo "[deploy] Check 2 Passed: Zero malformed paths in release tree."

# Check 3: Approved Portfolio route artifact must exist
if [ ! -f ".next/server/app/portfolio.html" ]; then
  echo "ERROR: Missing .next/server/app/portfolio.html in release!"
  exit 1
fi
if [ -d ".next/server/app/portfolio" ]; then
  echo "ERROR: Unexpected directory .next/server/app/portfolio exists and may shadow portfolio.html!"
  exit 1
fi
echo "[deploy] Check 3 Passed: Approved Portfolio route artifact verified."

# Check 4: Retired Portfolio demo must not be present in the build
if [ -f ".next/server/app/design-preview/portfolio/a.html" ] || [ -d ".next/server/app/design-preview/portfolio/a" ]; then
  echo "ERROR: Retired Portfolio demo route is still present in the release!"
  exit 1
fi
echo "[deploy] Check 4 Passed: Portfolio demo route absent from release."

# Check 5: Pre-activation route verification on currently active staging endpoints
# This is reachability only because the new release is not active yet.
for route in "/" "/portfolio/"; do
  code=\$(curl -sI -o /dev/null -w "%{http_code}" "https://dimgrey-goat-473970.hostingersite.com\$route" || echo "000")
  echo "[deploy] Pre-activation probe: \$route => \$code"
done

# =====================================================================
# ATOMIC ACTIVATION & PASSENGER RELOAD
# =====================================================================
echo "[deploy] Activating new release symlink..."
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
Header always set X-Robots-Tag "noindex, nofollow, noarchive"

# Static Next.js immutable content-hashed assets
<If "%{REQUEST_URI} =~ m#^/_next/static/#">
  Header set Cache-Control "public, max-age=31536000, immutable"
  Header set CDN-Cache-Control "public, max-age=31536000"
</If>
# Uploaded media, posters, mirror CSS
<ElseIf "%{REQUEST_URI} =~ m#^/(wp-content/uploads|media/portfolio|wp-mirror-css)/#">
  Header set Cache-Control "public, max-age=604800, stale-while-revalidate=86400"
  Header set CDN-Cache-Control "public, max-age=604800"
</ElseIf>
# Dynamic HTML documents and API routes remain un-cached for immediate release visibility
<Else>
  Header always set Cache-Control "private, no-store, max-age=0, must-revalidate"
  Header always set CDN-Cache-Control "no-store"
</Else>
</IfModule>
HT

touch "\$REMOTE_APP/current/tmp/restart.txt"
pkill -u "\$(whoami)" -f "lsnode:" 2>/dev/null || true
sleep 4

# =====================================================================
# HOSTINGER EDGE CDN CACHE PURGE (Mandatory Deployment Gate)
# =====================================================================
echo "[deploy] Executing authenticated Hostinger CDN cache purge for \$HOSTINGER_DOMAIN..."
PURGE_RESPONSE=\$(curl -s -w "\n%{http_code}" -X DELETE \
  -H "Authorization: Bearer \${HOSTINGER_API_TOKEN}" \
  -H "Accept: application/json" \
  -H "User-Agent: dgs-atomic-deploy" \
  "https://developers.hostinger.com/api/hosting/v1/accounts/\${HOSTINGER_ACCOUNT_ID}/websites/\${HOSTINGER_DOMAIN}/cache/clear" || echo -e "\n000")

PURGE_BODY=\$(echo "\$PURGE_RESPONSE" | sed '\$d')
PURGE_STATUS=\$(echo "\$PURGE_RESPONSE" | tail -n 1)

echo "[deploy] Hostinger CDN cache purge HTTP response code: \$PURGE_STATUS"
if [ "\$PURGE_STATUS" != "200" ] && [ "\$PURGE_STATUS" != "204" ]; then
  echo "CRITICAL: Hostinger CDN cache purge failed with HTTP status \$PURGE_STATUS (\$PURGE_BODY)!"
  FAIL_COUNT=\$((FAIL_COUNT + 1))
else
  echo "[deploy] Hostinger CDN cache purge accepted successfully."
fi

# Allow edge propagation before verification
sleep 4

# =====================================================================
# POST-ACTIVATION VERIFICATION & AUTOMATIC ROLLBACK
# =====================================================================
echo "[deploy] Running Post-Activation Route Verification..."
FAIL_COUNT=0

for route in "/" "/portfolio/"; do
  status=\$(curl -sI -o /dev/null -w "%{http_code}" "https://\${HOSTINGER_DOMAIN}\$route" || echo "000")
  echo "[deploy] Post-activation test: \$route => \$status"
  if [ "\$status" != "200" ] && [ "\$status" != "308" ]; then
    echo "ERROR: Route \$route returned unexpected status \$status"
    FAIL_COUNT=\$((FAIL_COUNT + 1))
  fi
done

# =====================================================================
# POST-PURGE COMPRESSED BUILD VERIFICATION (Brotli/Gzip Edge Probe)
# =====================================================================
echo "[deploy] Verifying compressed edge response for current BUILD_ID: \$BUILD_ID..."
COMPRESSED_CHECK_URL="https://\${HOSTINGER_DOMAIN}/"
COMPRESSED_RESPONSE=\$(curl --compressed -s -H "Accept-Encoding: gzip, deflate, br" "\$COMPRESSED_CHECK_URL" || echo "")

if [ -z "\$COMPRESSED_RESPONSE" ]; then
  echo "CRITICAL: Received empty compressed response from \$COMPRESSED_CHECK_URL!"
  FAIL_COUNT=\$((FAIL_COUNT + 1))
elif echo "\$COMPRESSED_RESPONSE" | grep -q "\$BUILD_ID"; then
  echo "[deploy] Post-Purge Verification Passed: Live compressed edge serves current BUILD_ID \$BUILD_ID."
else
  echo "CRITICAL: Stale CDN cache detected! Live compressed response does NOT contain BUILD_ID \$BUILD_ID."
  FAIL_COUNT=\$((FAIL_COUNT + 1))
fi

# Verify zero obsolete Next.js chunk references in compressed HTML
OBSOLETE_PATTERNS=("turbopack-1slbtoi3edc8b" "38-a7lbfk8yic" "0kf_op3zk8q-s" "1a-q64o1a-83s" "2u3x7xvs29kop" "2i51e627rllld")
for obs in "\${OBSOLETE_PATTERNS[@]}"; do
  if echo "\$COMPRESSED_RESPONSE" | grep -q "\$obs"; then
    echo "CRITICAL: Obsolete chunk hash \$obs detected in live compressed HTML!"
    FAIL_COUNT=\$((FAIL_COUNT + 1))
  fi
done

# The retired demo route must now be gone
DEMO_STATUS=\$(curl -sI -o /dev/null -w "%{http_code}" "https://\${HOSTINGER_DOMAIN}/design-preview/portfolio/a/" || echo "000")
echo "[deploy] Retired Portfolio demo route => \$DEMO_STATUS"
if [ "\$DEMO_STATUS" != "404" ]; then
  echo "ERROR: Retired Portfolio demo route is still reachable (expected 404)."
  FAIL_COUNT=\$((FAIL_COUNT + 1))
fi

# Check video streaming byte-range
VIDEO_STATUS=\$(curl -sI -o /dev/null -w "%{http_code}" -r 0-1024 "https://\${HOSTINGER_DOMAIN}/media/portfolio/videos/media1.mp4" || echo "000")
echo "[deploy] Video range test: /media/portfolio/videos/media1.mp4 => \$VIDEO_STATUS"
if [ "\$VIDEO_STATUS" != "206" ]; then
  echo "ERROR: Video byte-range returned unexpected status \$VIDEO_STATUS"
  FAIL_COUNT=\$((FAIL_COUNT + 1))
fi

# Confirm no malformed directory was created during boot/activation
POST_MALFORMED=\$(find "\$REMOTE_RELEASE/.next/server/app/" -name "*http:*" -o -name "*https:*" -o -name "*.hostingersite.com*" 2>/dev/null | wc -l)
if [ "\$POST_MALFORMED" -gt 0 ]; then
  echo "ERROR: Malformed path created post-activation!"
  find "\$REMOTE_RELEASE/.next/server/app/" -name "*http:*" -o -name "*https:*" -o -name "*.hostingersite.com*"
  FAIL_COUNT=\$((FAIL_COUNT + 1))
fi

if [ "\$FAIL_COUNT" -gt 0 ]; then
  echo "CRITICAL: Post-activation verification failed! Triggering automatic rollback..."
  if [ -n "\$PREVIOUS_RELEASE" ] && [ -d "\$PREVIOUS_RELEASE" ]; then
    echo "[rollback] Reverting current symlink to: \$PREVIOUS_RELEASE"
    ln -sfn "\$PREVIOUS_RELEASE" "\$REMOTE_APP/current"
    touch "\$REMOTE_APP/current/tmp/restart.txt"
    pkill -u "\$(whoami)" -f "lsnode:" 2>/dev/null || true
    # Invalidate CDN cache on rollback
    curl -s -X DELETE \
      -H "Authorization: Bearer \${HOSTINGER_API_TOKEN}" \
      -H "Accept: application/json" \
      "https://developers.hostinger.com/api/hosting/v1/accounts/\${HOSTINGER_ACCOUNT_ID}/websites/\${HOSTINGER_DOMAIN}/cache/clear" >/dev/null 2>&1 || true
    echo "[rollback] Rollback completed."
  else
    echo "[rollback] No previous release available to rollback."
  fi
  exit 1
fi

# Ensure runtime directories have appropriate permissions
chmod -R u+w "\$REMOTE_RELEASE/tmp"

echo "DEPLOY_SUCCESS=true"
echo "DEPLOYED_SHA=\$FULL_SHA"
echo "DEPLOYED_BUILD_ID=\$BUILD_ID"
echo "RELEASE_DIR=\$REMOTE_RELEASE"
echo "CURRENT_LINK=\$(readlink -f \$REMOTE_APP/current)"
REMOTE

rm -f "$TARBALL"

echo "[deploy] Running local edge CDN verification for $HOSTINGER_DOMAIN..."
LOCAL_EDGE_CHECK="$(curl --compressed -s -H "Accept-Encoding: gzip, deflate, br" "https://${HOSTINGER_DOMAIN}/" || echo "")"
if [ -n "$LOCAL_EDGE_CHECK" ] && echo "$LOCAL_EDGE_CHECK" | grep -q "$BUILD_ID"; then
  echo "[deploy] Local edge probe verified current BUILD_ID $BUILD_ID on staging."
else
  echo "WARNING: Local edge probe did not immediately observe $BUILD_ID (edge propagation in progress)."
fi

echo "[deploy] Done."
