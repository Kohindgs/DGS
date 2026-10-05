import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

async function main() {
  console.log("==================================================");
  console.log("DGS V8.12.6 ATOMIC PRODUCTION DEPLOYMENT");
  console.log("LIVE OPPORTUNITY ACQUISITION & VERIFICATION ENGINE");
  console.log("LANES + QUALIFICATION GATE + LINK-TYPE HONESTY");
  console.log("==================================================");

  // 1. Verify build artifacts exist
  const buildIdFile = path.join(ROOT, ".next", "BUILD_ID");
  if (!fs.existsSync(buildIdFile)) {
    throw new Error(".next/BUILD_ID not found! Run npm run build first.");
  }
  const buildId = fs.readFileSync(buildIdFile, "utf8").trim();
  console.log(`✓ Local BUILD_ID: ${buildId}`);

  // 2. Verify static page indexing bake
  const indexHtmlPath = path.join(ROOT, ".next", "server", "app", "index.html");
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error("index.html not found in build output!");
  }
  const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
  if (!indexHtml.includes('<meta name="robots" content="index, follow"/>')) {
    throw new Error("FATAL: Built index.html does NOT contain 'index, follow' robots tag!");
  }
  console.log("✓ Build Indexing Verification: index.html correctly baked with 'index, follow'");

  // 3. Pre-deploy validation of local environment
  console.log("Running local environment pre-deploy validator...");
  execSync("node scripts/validate-production-env.mjs .env.production --skip-db", { cwd: ROOT, stdio: "inherit" });

  // 4. Verify git status and SHA
  const repoSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  console.log(`✓ Git REPO_SHA: ${repoSha}`);

  // 5. Create packaging directory
  const pkgDir = path.join(ROOT, "release-package");
  if (fs.existsSync(pkgDir)) {
    fs.rmSync(pkgDir, { recursive: true, force: true });
  }
  fs.mkdirSync(pkgDir, { recursive: true });

  console.log("Packaging release files...");
  // Copy .next
  execSync(`robocopy "${path.join(ROOT, ".next")}" "${path.join(pkgDir, ".next")}" /E /XD cache /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  // Copy public
  execSync(`robocopy "${path.join(ROOT, "public")}" "${path.join(pkgDir, "public")}" /E /XF *.tar.gz /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  // Copy lib
  execSync(`robocopy "${path.join(ROOT, "lib")}" "${path.join(pkgDir, "lib")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  // Copy db
  execSync(`robocopy "${path.join(ROOT, "db")}" "${path.join(pkgDir, "db")}" /E /NFL /NDL /NJH /NJS /nc /ns /np || exit 0`, { shell: "cmd.exe" });
  // Copy essential files
  fs.copyFileSync(path.join(ROOT, "server.js"), path.join(pkgDir, "server.js"));
  fs.copyFileSync(path.join(ROOT, "package.json"), path.join(pkgDir, "package.json"));
  fs.copyFileSync(path.join(ROOT, "package-lock.json"), path.join(pkgDir, "package-lock.json"));
  fs.copyFileSync(path.join(ROOT, "next.config.ts"), path.join(pkgDir, "next.config.ts"));

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
  fs.copyFileSync(path.join(ROOT, "scripts", "turbovec-service.py"), path.join(pkgScripts, "turbovec-service.py"));
  fs.copyFileSync(path.join(ROOT, "scripts", "turbovec-daemon.sh"), path.join(pkgScripts, "turbovec-daemon.sh"));
  fs.copyFileSync(path.join(ROOT, "scripts", "remote-sql-check.mjs"), path.join(pkgScripts, "remote-sql-check.mjs"));

  // Write SHA metadata
  fs.writeFileSync(path.join(pkgDir, ".release-sha"), repoSha, "utf8");
  fs.writeFileSync(path.join(pkgDir, ".build-id"), buildId, "utf8");

  // 6. Archive release
  const tarName = `release-${buildId}.tar.gz`;
  const tarPath = path.join(ROOT, tarName);
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
  console.log(`Compressing ${tarName}...`);
  execSync(`tar -czf "${tarPath}" -C "${pkgDir}" .`);
  console.log(`✓ Created archive: ${tarName} (${(fs.statSync(tarPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // 7. Transfer files to Hostinger VPS
  console.log("Ensuring VPS directories exist...");
  execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "mkdir -p /home/u188101251/production-app/tmp /home/u188101251/production-app/shared/turbovec"`);

  console.log("Uploading release archive to VPS...");
  execSync(`scp -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -P 65002 "${tarPath}" u188101251@147.93.100.126:/home/u188101251/production-app/tmp/${tarName}`);
  console.log("✓ Uploaded archive to VPS tmp directory");

  // 8. Execute atomic release extraction, fail-closed validation, schema migration, symlinking, daemon restart
  console.log("Executing atomic release activation with guards on VPS...");
  const releaseId = `${repoSha.slice(0, 7)}-${buildId}`;
  const remoteScript = `
set -euo pipefail
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

# Symlink persistent shared turbovec storage into release data dir
mkdir -p "$NEW_REL/data"
ln -sfn /home/u188101251/production-app/shared/turbovec "$NEW_REL/data/turbovec"

cd "$NEW_REL"

echo "Running fail-closed pre-activation environment validation on target release..."
node scripts/validate-production-env.mjs "$NEW_REL/.env.production"

echo "Applying CMS schema migrations..."
node scripts/apply-cms-schema.mjs

echo "Applying TurboVec vector documents table migration..."
node scripts/migrate-turbovec-tables.mjs

echo "Applying V8.12.3 discovery runs table and column migrations..."
node scripts/migrate-v8123-discovery-tables.mjs

echo "Applying V8.12.4 assessment assignments and attempts tables migration..."
node scripts/migrate-v8124-assessment-tables.mjs

echo "Applying V8.12.5 Action Center, Sheet Sync & Mismatch schema migrations..."
node scripts/migrate-v8125-offpage-tables.mjs

echo "Applying V8.12.6 discovery lanes schema migration..."
node scripts/migrate-v8126-offpage-lanes.mjs

echo "Verifying persistent TurboVec Python daemon is active..."
bash /home/u188101251/production-app/shared/turbovec-daemon.sh status || bash /home/u188101251/production-app/shared/turbovec-daemon.sh start
sleep 2

echo "Environment and DB validated successfully! Switching current symlink atomically..."
ln -sfn "$NEW_REL" /home/u188101251/production-app/current

echo "Restarting Passenger/Node app..."
mkdir -p /home/u188101251/production-app/current/tmp
touch /home/u188101251/production-app/current/tmp/restart.txt

echo "=========================================="
echo "PERSISTENT_DATA_SHARED = YES"
echo "DEPLOY_SHA = $(cat $NEW_REL/.release-sha)"
echo "PRODUCTION_SHA = $(cat /home/u188101251/production-app/current/.release-sha)"
echo "BUILD_ID = $(cat /home/u188101251/production-app/current/.build-id)"
echo "=========================================="

echo "TurboVec Daemon Status:"
bash /home/u188101251/production-app/shared/turbovec-daemon.sh status || true
`;

  const deployOutput = execSync(`ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`, {
    input: remoteScript,
    encoding: "utf8",
  });
  console.log("\n================ REMOTE DEPLOY RESULT ================");
  console.log(deployOutput);
  console.log("======================================================\n");

  // Cleanup local tar and package dir
  fs.rmSync(pkgDir, { recursive: true, force: true });
  fs.unlinkSync(tarPath);
}

main().catch((err) => {
  console.error("FATAL ERROR in atomic deployment:", err);
  process.exit(1);
});
