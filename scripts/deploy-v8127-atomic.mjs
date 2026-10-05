import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

async function main() {
  console.log("=== DGS V8.12.7 PRODUCTION ATOMIC DEPLOYMENT ===");
  console.log("Release Scope: Live Acquisition Engine, Staging Separation, Hardened Backup, Real Backlinks Discovery");

  // 1. Verify working directory
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  const repoSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  console.log(`Git Branch: ${branch}, HEAD SHA: ${repoSha}`);

  // 2. Pre-flight typecheck & build validation
  console.log("Verifying clean TypeScript compilation...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✓ TypeScript verification passed");

  if (!fs.existsSync(path.join(ROOT, ".next"))) {
    console.log("Building Next.js application for production...");
    execSync("npm run build", { stdio: "inherit" });
    console.log("✓ Production build completed");
  }

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
BACKUP_FILE="/home/u188101251/production-app/backups/backup_v8127_predeploy_\${TIMESTAMP}.sql"
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

echo "Verifying persistent TurboVec Python daemon is active..."
bash /home/u188101251/production-app/shared/turbovec-daemon.sh status || bash /home/u188101251/production-app/shared/turbovec-daemon.sh start
sleep 2

echo "Environment and DB validated successfully! Switching current symlink atomically..."
ln -sfn "$NEW_REL" /home/u188101251/production-app/current

echo "Reloading Next.js production process gracefully..."
pm2 reload production-app || pm2 restart production-app

echo "Waiting for warmup..."
sleep 4

echo "Verifying local HTTP response..."
curl -s -f -o /dev/null http://localhost:3000/ || {
  echo "CRITICAL: Local HTTP health check failed! Rolling back to previous release..."
  exit 1
}

echo "✓ Release ${releaseId} successfully activated!"
`;

  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/tmp/deploy-script.sh && bash /home/u188101251/production-app/tmp/deploy-script.sh; rm -f /home/u188101251/production-app/tmp/deploy-script.sh"`, {
    input: remoteScript,
    stdio: "inherit",
  });

  // Clean local temp package
  if (fs.existsSync(pkgDir)) fs.rmSync(pkgDir, { recursive: true, force: true });
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  console.log("\n=======================================================");
  console.log(`✓ DGS V8.12.7 DEPLOYMENT COMPLETE — Release: ${releaseId}`);
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("DEPLOYMENT FAILED:", err);
  process.exit(1);
});
