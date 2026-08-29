#!/usr/bin/env bash
# Dimgrey staging clean-slate reset (Hostinger only). Run via SSH on u188101251 account.
set -euo pipefail

TIMESTAMP="${1:-$(date -u +%Y%m%d-%H%M%S)}"
DOMAIN="$HOME/domains/dimgrey-goat-473970.hostingersite.com"
BACKUP="$HOME/dimgrey-backups/pre-clean-${TIMESTAMP}"

mkdir -p "$BACKUP/config-snapshot"

echo "[1/8] Snapshot host config..."
cp -a "$DOMAIN/public_html/.htaccess" "$BACKUP/config-snapshot/.htaccess"
[ -f "$DOMAIN/public_html/.htaccess.pre-repair-20260827" ] && cp -a "$DOMAIN/public_html/.htaccess.pre-repair-20260827" "$BACKUP/config-snapshot/"
cp -a "$DOMAIN/public_html/.builds/config" "$BACKUP/config-snapshot/builds-config"
[ -f "$DOMAIN/nodejs/.env.local" ] && cp -a "$DOMAIN/nodejs/.env.local" "$BACKUP/config-snapshot/.env.local"
[ -f "$DOMAIN/releases/9a4c49e/.deploy-sha" ] && cp -a "$DOMAIN/releases/9a4c49e/.deploy-sha" "$BACKUP/config-snapshot/"
[ -f "$DOMAIN/releases/9a4c49e/.last-deploy" ] && cp -a "$DOMAIN/releases/9a4c49e/.last-deploy" "$BACKUP/config-snapshot/"
[ -f "$DOMAIN/releases/9a4c49e/.next/BUILD_ID" ] && cp -a "$DOMAIN/releases/9a4c49e/.next/BUILD_ID" "$BACKUP/config-snapshot/BUILD_ID"
[ -f "$DOMAIN/releases/9a4c49e/server.js" ] && cp -a "$DOMAIN/releases/9a4c49e/server.js" "$BACKUP/config-snapshot/server.js"
[ -f "$DOMAIN/releases/9a4c49e/.env.example" ] && cp -a "$DOMAIN/releases/9a4c49e/.env.example" "$BACKUP/config-snapshot/.env.example"

echo "[2/8] Archive releases and legacy nodejs..."
[ -d "$DOMAIN/releases/9a4c49e" ] && mv "$DOMAIN/releases/9a4c49e" "$BACKUP/"
[ -d "$DOMAIN/releases/5c39c859" ] && mv "$DOMAIN/releases/5c39c859" "$BACKUP/"
[ -d "$DOMAIN/nodejs" ] && mv "$DOMAIN/nodejs" "$BACKUP/"

echo "[3/8] Remove Hostinger overlay artifacts..."
rm -rf "$DOMAIN/public_html/.builds/last-source"
rm -rf "$DOMAIN/public_html/.builds/logs"
rm -rf "$DOMAIN/public_html/.builds/source"

echo "[4/8] Install maintenance release..."
mkdir -p "$DOMAIN/releases/maintenance/tmp"
cp "$BACKUP/config-snapshot/server.js" "$DOMAIN/releases/maintenance/server.js" 2>/dev/null || true
if [ ! -f "$DOMAIN/releases/maintenance/server.js" ]; then
  cat > "$DOMAIN/releases/maintenance/server.js" <<'EOF'
const http = require("http");
const port = parseInt(process.env.PORT || "3000", 10);
const body = "<!DOCTYPE html><html><head><meta charset=utf-8><meta name=robots content=noindex><title>Maintenance</title></head><body style=font-family:sans-serif;background:#020202;color:#fff;display:grid;place-items:center;min-height:100vh><main><h1>Dimgrey staging reset in progress</h1><p>Fresh mirror deployment pending local QA.</p></main></body></html>";
http.createServer((req,res)=>{res.writeHead(503,{"Content-Type":"text/html","X-Robots-Tag":"noindex, nofollow"});res.end(body);}).listen(port,()=>console.log("maintenance",port));
EOF
fi

echo "[5/8] Update Passenger .htaccess..."
cat > "$DOMAIN/public_html/.htaccess" <<HT
PassengerEnabled on
PassengerAppRoot $DOMAIN/releases/maintenance
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir $DOMAIN/releases/maintenance/tmp
SetEnv NODE_OPTIONS "--require $DOMAIN/public_html/.builds/config/preload-timestamp.js"
SetEnv LSNODE_CONSOLE_LOG console.log
SetEnv TOKIO_WORKER_THREADS 2
RewriteRule ^.builds - [F,L]

<IfModule mod_headers.c>
Header always set Cache-Control "private, no-store, max-age=0, must-revalidate"
Header always set CDN-Cache-Control "no-store"
Header always set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
HT

ln -sfn "$DOMAIN/releases/maintenance" "$DOMAIN/current"

echo "[6/8] Restart Passenger..."
touch "$DOMAIN/releases/maintenance/tmp/restart.txt"
pkill -u "$(whoami)" -f "releases/9a4c49e" 2>/dev/null || true
pkill -u "$(whoami)" -f "releases/5c39c859" 2>/dev/null || true
sleep 2

echo "[7/8] Write manifest..."
cat > "$BACKUP/RESET-MANIFEST.txt" <<MAN
Dimgrey clean reset: ${TIMESTAMP} UTC
Backup: $BACKUP
Maintenance: $DOMAIN/releases/maintenance
Current symlink: $DOMAIN/current
MAN

echo "[8/8] Verify..."
ls -la "$DOMAIN/releases/"
ls -la "$DOMAIN/public_html/"
find "$DOMAIN/releases" "$DOMAIN/public_html" -maxdepth 4 \( -name .next -o -name node_modules -o -name _next \) 2>/dev/null || true
echo "BACKUP_PATH=$BACKUP"
