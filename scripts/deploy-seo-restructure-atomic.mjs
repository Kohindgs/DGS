import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

async function main() {
  console.log("==================================================================");
  console.log("  DGS PRODUCTION DEPLOYMENT — SEO RESTRUCTURE & SCHEMA ACTIVATION");
  console.log("==================================================================");

  // 1. Verify working directory & commit
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  const repoSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  console.log(`Git Branch: ${branch}, HEAD SHA: ${repoSha}`);

  // 2. Pre-flight typecheck & production build
  console.log("Running TypeScript verification...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("✓ TypeScript check passed");

  console.log("Building production Next.js bundle...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✓ Production build completed");

  // 3. Staging release package
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
  execSync(`robocopy "${path.join(ROOT, "components")}" "${path.join(pkgDir, "components")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  execSync(`robocopy "${path.join(ROOT, "db")}" "${path.join(pkgDir, "db")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  execSync(`robocopy "${path.join(ROOT, "data")}" "${path.join(pkgDir, "data")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });

  fs.copyFileSync(path.join(ROOT, "server.js"), path.join(pkgDir, "server.js"));
  fs.copyFileSync(path.join(ROOT, "package.json"), path.join(pkgDir, "package.json"));
  fs.copyFileSync(path.join(ROOT, "package-lock.json"), path.join(pkgDir, "package-lock.json"));
  fs.copyFileSync(path.join(ROOT, "next.config.ts"), path.join(pkgDir, "next.config.ts"));
  fs.copyFileSync(path.join(ROOT, "tsconfig.json"), path.join(pkgDir, "tsconfig.json"));

  // Ensure public/.htaccess is explicitly copied
  if (fs.existsSync(path.join(ROOT, "public", ".htaccess"))) {
    fs.copyFileSync(path.join(ROOT, "public", ".htaccess"), path.join(pkgDir, "public", ".htaccess"));
  }

  // Copy helper scripts into release
  const pkgScripts = path.join(pkgDir, "scripts");
  fs.mkdirSync(pkgScripts, { recursive: true });
  const scriptsToCopy = [
    "validate-production-env.mjs",
    "verify-media-availability.mjs",
    "apply-cms-schema.mjs",
    "migrate-turbovec-tables.mjs",
    "migrate-v8123-discovery-tables.mjs",
    "migrate-v8124-assessment-tables.mjs",
    "migrate-v8125-offpage-tables.mjs",
    "migrate-v8126-offpage-lanes.mjs",
    "migrate-v8127-raw-candidates.mjs",
    "migrate-v8127a-actionability-schema.mjs",
    "migrate-v8127b-cron-health.mjs",
    "migrate-v8130-intent-leads.mjs",
    "turbovec-service.py",
    "turbovec-daemon.sh",
    "remote-sql-check.mjs",
    "remote-backup.sh",
  ];

  for (const s of scriptsToCopy) {
    const src = path.join(ROOT, "scripts", s);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(pkgScripts, s));
    }
  }

  // Write SHA metadata
  fs.writeFileSync(path.join(pkgDir, ".release-sha"), repoSha, "utf8");
  fs.writeFileSync(path.join(pkgDir, ".build-id"), buildId, "utf8");

  // 5. Compress release archive
  const tarName = `release-${buildId}.tar.gz`;
  const tarPath = path.join(ROOT, tarName);
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
  console.log(`Compressing ${tarName}...`);
  execSync(`tar -czf "${tarPath}" -C "${pkgDir}" .`);
  console.log(`✓ Created archive: ${tarName} (${(fs.statSync(tarPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 6. Transfer files to Hostinger VPS
  console.log("Uploading release archive to VPS...");
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 "${tarPath}" u188101251@147.93.100.126:/home/u188101251/production-app/tmp/${tarName}`);
  console.log("✓ Uploaded release archive to VPS");

  // 7. Execute atomic release activation on VPS
  const releaseId = `${repoSha.slice(0, 7)}-${buildId}`;
  console.log(`Activating release ${releaseId} on VPS...`);

  const remoteScript = `
set -euo pipefail

echo "Executing pre-deployment database backup..."
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
BACKUP_FILE="/home/u188101251/production-app/backups/backup_seo_restructure_\${TIMESTAMP}.sql"
mysqldump --defaults-extra-file="$CNF" --no-tablespaces "$DB_NAME" > "$BACKUP_FILE"
rm -f "$CNF"
echo "✓ Secure pre-deploy backup saved: $BACKUP_FILE"

NEW_REL="/home/u188101251/production-app/releases/${releaseId}"
rm -rf "$NEW_REL"
mkdir -p "$NEW_REL"
echo "Extracting release package..."
tar -xzf "/home/u188101251/production-app/tmp/${tarName}" -C "$NEW_REL"
rm -f "/home/u188101251/production-app/tmp/${tarName}"

echo "Syncing updated data directory to persistent shared storage..."
mkdir -p /home/u188101251/production-app/shared/data
rsync -a --exclude="turbovec" "$NEW_REL/data/" /home/u188101251/production-app/shared/data/
rm -rf "$NEW_REL/data"
ln -sfn /home/u188101251/production-app/shared/data "$NEW_REL/data"

echo "Configuring persistent symlinks..."
ln -sfn /home/u188101251/production-app/shared/node_modules "$NEW_REL/node_modules"
cp /home/u188101251/production-app/shared/.env.production "$NEW_REL/.env.production"

mkdir -p "$NEW_REL/public"
ln -sfn /home/u188101251/production-app/shared/cms-media "$NEW_REL/public/cms-media"

mkdir -p "$NEW_REL/public/media/portfolio"
ln -sfn /home/u188101251/production-app/shared/media/portfolio/videos "$NEW_REL/public/media/portfolio/videos"

mkdir -p /home/u188101251/production-app/shared/turbovec
ln -sfn /home/u188101251/production-app/shared/turbovec /home/u188101251/production-app/shared/data/turbovec

# Ensure public/.htaccess is deployed to public_html and release
if [ -f "$NEW_REL/public/.htaccess" ]; then
  cp "$NEW_REL/public/.htaccess" /home/u188101251/public_html/.htaccess 2>/dev/null || true
fi

cd "$NEW_REL"

echo "Validating environment..."
node scripts/validate-production-env.mjs "$NEW_REL/.env.production"

echo "Verifying media availability and persistent storage..."
node scripts/verify-media-availability.mjs "$NEW_REL"

echo "Applying migrations..."
node scripts/apply-cms-schema.mjs
node scripts/migrate-turbovec-tables.mjs
node scripts/migrate-v8123-discovery-tables.mjs
node scripts/migrate-v8124-assessment-tables.mjs
node scripts/migrate-v8125-offpage-tables.mjs
node scripts/migrate-v8126-offpage-lanes.mjs
node scripts/migrate-v8127-raw-candidates.mjs
node scripts/migrate-v8127a-actionability-schema.mjs
node scripts/migrate-v8127b-cron-health.mjs
node scripts/migrate-v8130-intent-leads.mjs

echo "Verifying TurboVec daemon..."
bash /home/u188101251/production-app/shared/turbovec-daemon.sh status || bash /home/u188101251/production-app/shared/turbovec-daemon.sh start
sleep 1

echo "Switching current symlink atomically..."
ln -sfn "$NEW_REL" /home/u188101251/production-app/current

echo "Restarting Passenger/Node app..."
mkdir -p /home/u188101251/production-app/current/tmp
touch /home/u188101251/production-app/current/tmp/restart.txt

echo "=========================================="
echo "DEPLOY_SHA = $(cat $NEW_REL/.release-sha)"
echo "PRODUCTION_SHA = $(cat /home/u188101251/production-app/current/.release-sha)"
echo "BUILD_ID = $(cat /home/u188101251/production-app/current/.build-id)"
echo "ACTIVE_RELEASE = ${releaseId}"
echo "=========================================="
echo "✓ Release ${releaseId} successfully activated!"
`;

  const deployOutput = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`,
    {
      input: remoteScript,
      encoding: "utf8",
    }
  );
  console.log("\n================ REMOTE DEPLOY RESULT ================");
  console.log(deployOutput);
  console.log("======================================================\n");

  // Clean local temp package
  if (fs.existsSync(pkgDir)) fs.rmSync(pkgDir, { recursive: true, force: true });
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  console.log(`\nDeployment of release ${releaseId} finished successfully!`);
}

main().catch((err) => {
  console.error("DEPLOYMENT FAILED:", err);
  process.exit(1);
});
