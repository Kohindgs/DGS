import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

async function main() {
  console.log("=== DGS V8.12.8 WEBDEV REBUILD & BLOG IMAGE REPAIR ATOMIC DEPLOYMENT ===");

  // 1. Verify working directory
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  const repoSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  console.log(`Git Branch: ${branch}, HEAD SHA: ${repoSha}`);

  // 2. Pre-flight typecheck & build validation
  console.log("Cleaning any residual archive files from root...");
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith(".tar.gz")) {
      try { fs.unlinkSync(path.join(ROOT, f)); } catch {}
    }
  }

  console.log("Verifying clean TypeScript compilation...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✓ TypeScript verification passed");

  console.log("Building Next.js application for production...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✓ Production build completed");

  // 3. Create unique build ID
  const buildId = crypto.randomBytes(8).toString("hex");
  const pkgDir = path.join(ROOT, ".release-pkg");
  if (fs.existsSync(pkgDir)) {
    fs.rmSync(pkgDir, { recursive: true, force: true });
  }
  fs.mkdirSync(pkgDir, { recursive: true });

  console.log(`Staging release package in ${pkgDir}...`);

  // 4. Copy build artifacts and source assets
  execSync(`robocopy "${path.join(ROOT, ".next")}" "${path.join(pkgDir, ".next")}" /E /XD cache /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  execSync(`robocopy "${path.join(ROOT, "public")}" "${path.join(pkgDir, "public")}" /E /XF *.tar.gz /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  execSync(`robocopy "${path.join(ROOT, "lib")}" "${path.join(pkgDir, "lib")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  execSync(`robocopy "${path.join(ROOT, "db")}" "${path.join(pkgDir, "db")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });

  fs.copyFileSync(path.join(ROOT, "server.js"), path.join(pkgDir, "server.js"));
  fs.copyFileSync(path.join(ROOT, "package.json"), path.join(pkgDir, "package.json"));
  fs.copyFileSync(path.join(ROOT, "package-lock.json"), path.join(pkgDir, "package-lock.json"));
  fs.copyFileSync(path.join(ROOT, "next.config.ts"), path.join(pkgDir, "next.config.ts"));
  fs.copyFileSync(path.join(ROOT, "tsconfig.json"), path.join(pkgDir, "tsconfig.json"));

  // Copy validator and schema scripts into release
  const pkgScripts = path.join(pkgDir, "scripts");
  fs.mkdirSync(pkgScripts, { recursive: true });
  fs.copyFileSync(path.join(ROOT, "scripts", "validate-production-env.mjs"), path.join(pkgScripts, "validate-production-env.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "apply-cms-schema.mjs"), path.join(pkgScripts, "apply-cms-schema.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-turbovec-tables.mjs"), path.join(pkgScripts, "migrate-turbovec-tables.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8123-discovery-tables.mjs"), path.join(pkgScripts, "migrate-v8123-discovery-tables.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8124-assessment-tables.mjs"), path.join(pkgScripts, "migrate-v8124-assessment-tables.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8125-offpage-tables.mjs"), path.join(pkgScripts, "migrate-v8125-offpage-tables.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8126-offpage-lanes.mjs"), path.join(pkgScripts, "migrate-v8126-offpage-lanes.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8127-raw-candidates.mjs"), path.join(pkgScripts, "migrate-v8127-raw-candidates.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "migrate-v8127a-actionability-schema.mjs"), path.join(pkgScripts, "migrate-v8127a-actionability-schema.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "turbovec-service.py"), path.join(pkgScripts, "turbovec-service.py"));
  fs.copyFileSync(path.join(ROOT, "scripts", "turbovec-daemon.sh"), path.join(pkgScripts, "turbovec-daemon.sh"));
  fs.copyFileSync(path.join(ROOT, "scripts", "remote-sql-check.mjs"), path.join(pkgScripts, "remote-sql-check.mjs"));
  fs.copyFileSync(path.join(ROOT, "scripts", "remote-backup.sh"), path.join(pkgScripts, "remote-backup.sh"));

  // Write SHA metadata
  fs.writeFileSync(path.join(pkgDir, ".release-sha"), repoSha, "utf8");
  fs.writeFileSync(path.join(pkgDir, ".build-id"), buildId, "utf8");

  // 5. Archive release
  const tarName = `release-${buildId}.tar.gz`;
  const tarPath = path.join(ROOT, tarName);
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
  console.log(`Compressing ${tarName}...`);
  execSync(`tar -czf "${tarPath}" -C "${pkgDir}" .`);
  console.log(`✓ Created archive: ${tarName} (${(fs.statSync(tarPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 6. Transfer files to Hostinger VPS
  console.log("Ensuring VPS directories exist...");
  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "mkdir -p /home/u188101251/production-app/tmp /home/u188101251/production-app/shared/turbovec /home/u188101251/production-app/backups"`);

  console.log("Uploading release archive to VPS...");
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 "${tarPath}" u188101251@147.93.100.126:/home/u188101251/production-app/tmp/${tarName}`);
  console.log("✓ Uploaded archive to VPS tmp directory");

  console.log("Syncing updated page mirrors to shared/data on VPS...");
  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "mkdir -p /home/u188101251/production-app/shared/data/wordpress/mirrors/pages"`);
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 data/wordpress/mirrors/pages/services__website-development-amc.json u188101251@147.93.100.126:/home/u188101251/production-app/shared/data/wordpress/mirrors/pages/services__website-development-amc.json`);
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 data/wordpress/mirrors/pages/services__website-development-pune-page.json u188101251@147.93.100.126:/home/u188101251/production-app/shared/data/wordpress/mirrors/pages/services__website-development-pune-page.json`);
  console.log("✓ Synced page mirrors to shared storage");

  // 7. Execute atomic release activation on VPS
  console.log("Executing atomic release activation with guards on VPS...");
  const releaseId = `${repoSha.slice(0, 7)}-${buildId}`;

  const remoteScript = `
set -euo pipefail

echo "Executing pre-deployment database backup with secure defaults-extra-file..."
ENV_FILE="/home/u188101251/production-app/shared/.env.production"
DB_USER=$(grep -E '^DGS_MYSQL_USER=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"")
DB_PASS=$(grep -E '^DGS_MYSQL_PASSWORD=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"")
DB_NAME=$(grep -E '^DGS_MYSQL_DATABASE=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"")
DB_HOST=$(grep -E '^DGS_MYSQL_HOST=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"")
DB_PORT=$(grep -E '^DGS_MYSQL_PORT=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"")

mkdir -p /home/u188101251/production-app/backups
mkdir -p /home/u188101251/production-app/tmp

CNF="/home/u188101251/production-app/tmp/deploy_backup_$$.cnf"
trap 'rm -f "$CNF"' EXIT

cat > "$CNF" <<EOF
[client]
host=\${DB_HOST:-127.0.0.1}
port=\${DB_PORT:-3306}
user=$DB_USER
password="$DB_PASS"
EOF
chmod 600 "$CNF"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/home/u188101251/production-app/backups/backup_v8128_predeploy_\${TIMESTAMP}.sql"
mysqldump --defaults-extra-file="$CNF" --no-tablespaces "$DB_NAME" > "$BACKUP_FILE"
rm -f "$CNF"
echo "✓ Secure pre-deploy backup saved: $BACKUP_FILE"

NEW_REL="/home/u188101251/production-app/releases/${releaseId}"
mkdir -p "$NEW_REL"
echo "Extracting release package..."
tar -xzf "/home/u188101251/production-app/tmp/${tarName}" -C "$NEW_REL"
rm -f "/home/u188101251/production-app/tmp/${tarName}"

echo "Configuring persistent symlinks..."
ln -sfn /home/u188101251/production-app/shared/node_modules "$NEW_REL/node_modules"
ln -sfn /home/u188101251/production-app/shared/data "$NEW_REL/data"
cp /home/u188101251/production-app/shared/.env.production "$NEW_REL/.env.production"

mkdir -p "$NEW_REL/public"
ln -sfn /home/u188101251/production-app/shared/cms-media "$NEW_REL/public/cms-media"
mkdir -p "$NEW_REL/public/media/portfolio"
ln -sfn /home/u188101251/production-app/shared/media/portfolio/videos "$NEW_REL/public/media/portfolio/videos"

mkdir -p "$NEW_REL/data"
ln -sfn /home/u188101251/production-app/shared/turbovec "$NEW_REL/data/turbovec"

cd "$NEW_REL"

echo "Running fail-closed pre-activation environment validation on target release..."
node scripts/validate-production-env.mjs "$NEW_REL/.env.production"

echo "Applying CMS schema migrations..."
node scripts/apply-cms-schema.mjs
node scripts/migrate-turbovec-tables.mjs
node scripts/migrate-v8123-discovery-tables.mjs
node scripts/migrate-v8124-assessment-tables.mjs
node scripts/migrate-v8125-offpage-tables.mjs
node scripts/migrate-v8126-offpage-lanes.mjs
node scripts/migrate-v8127-raw-candidates.mjs
node scripts/migrate-v8127a-actionability-schema.mjs

echo "Verifying persistent TurboVec Python daemon is active..."
bash /home/u188101251/production-app/shared/turbovec-daemon.sh status || bash /home/u188101251/production-app/shared/turbovec-daemon.sh start
sleep 2

echo "Environment and DB validated successfully! Switching current symlink atomically..."
ln -sfn "$NEW_REL" /home/u188101251/production-app/current

echo "Restarting application service via PM2..."
pm2 reload dgs-production --update-env || pm2 restart dgs-production --update-env
sleep 3

echo "Purging LiteSpeed cache via WP-CLI if available..."
if [ -d "/home/u188101251/domains/dgeniussolutions.com/public_html" ]; then
  wp --path=/home/u188101251/domains/dgeniussolutions.com/public_html litespeed-purge all 2>/dev/null || true
fi

echo "Verifying HTTP service availability..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || true)
echo "Local Node.js response code: $HTTP_STATUS"
if [ "$HTTP_STATUS" != "200" ]; then
  echo "CRITICAL: Service returned HTTP $HTTP_STATUS on healthcheck! Aborting!"
  exit 1
fi

echo "Active Release: ${releaseId}"
echo "Deployment successful!"
`;

  // Write remote deployment script and execute
  const remoteDeployScriptPath = path.join(ROOT, "scripts", "_run_remote_deploy.sh");
  fs.writeFileSync(remoteDeployScriptPath, remoteScript.replace(/\r\n/g, "\n"), "utf8");
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 "${remoteDeployScriptPath}" u188101251@147.93.100.126:/home/u188101251/production-app/tmp/deploy.sh`);
  fs.unlinkSync(remoteDeployScriptPath);

  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash /home/u188101251/production-app/tmp/deploy.sh && rm -f /home/u188101251/production-app/tmp/deploy.sh"`, { stdio: "inherit" });

  // 8. Clean up local tar
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
  if (fs.existsSync(pkgDir)) fs.rmSync(pkgDir, { recursive: true, force: true });

  console.log(`\n=======================================================`);
  console.log(`✓ DEPLOYMENT COMPLETE FOR RELEASE: ${releaseId}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
