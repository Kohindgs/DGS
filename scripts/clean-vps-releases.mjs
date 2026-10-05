import { execSync } from "node:child_process";

const remoteScript = `
set -euo pipefail
echo "=== Step 1: Cleaning tmp archives ==="
rm -f /home/u188101251/production-app/tmp/*.tar.gz || true

echo "=== Step 2: Finding active release ==="
CURRENT=$(readlink -f /home/u188101251/production-app/current)
echo "Active release to preserve: $CURRENT"

if [ -z "$CURRENT" ] || [ ! -d "$CURRENT" ]; then
  echo "Error: active release not found or not a directory!"
  exit 1
fi

echo "=== Step 3: Removing stale releases ==="
COUNT=0
for d in /home/u188101251/production-app/releases/*; do
  if [ -d "$d" ] && [ "$d" != "$CURRENT" ]; then
    rm -rf "$d"
    COUNT=$((COUNT + 1))
  fi
done
echo "Removed $COUNT stale releases."

echo "=== Step 4: Verification ==="
echo "Active release intact:"
ls -la "$CURRENT/.release-sha"
echo "Remaining in releases dir:"
ls -d /home/u188101251/production-app/releases/*

echo "Disk space summary:"
df -h
`;

console.log("Executing remote VPS release cleanup...");
const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "bash -s"`, {
  input: remoteScript,
  encoding: "utf8"
});
console.log(out);
