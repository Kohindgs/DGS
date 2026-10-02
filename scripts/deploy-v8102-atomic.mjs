import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

async function main() {
  console.log("==================================================");
  console.log("DGS V8.10.2 ATOMIC PRODUCTION DEPLOYMENT");
  console.log("==================================================");

  // 1. Verify build artifacts exist
  const buildIdFile = path.join(ROOT, ".next", "BUILD_ID");
  if (!fs.existsSync(buildIdFile)) {
    throw new Error(".next/BUILD_ID not found! Run npm run build first.");
  }
  const buildId = fs.readFileSync(buildIdFile, "utf8").trim();
  console.log(`✓ Local BUILD_ID: ${buildId}`);

  // 2. Verify git status
  const repoSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  console.log(`✓ Git REPO_SHA: ${repoSha}`);

  const status = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }).trim();
  if (status.length > 0) {
    console.warn("WARNING: Working tree has unstaged or untracked changes:");
    console.log(status);
  }

  // 3. Create packaging directory
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
  // Copy essential files
  fs.copyFileSync(path.join(ROOT, "server.js"), path.join(pkgDir, "server.js"));
  fs.copyFileSync(path.join(ROOT, "package.json"), path.join(pkgDir, "package.json"));
  fs.copyFileSync(path.join(ROOT, "package-lock.json"), path.join(pkgDir, "package-lock.json"));
  fs.copyFileSync(path.join(ROOT, "next.config.ts"), path.join(pkgDir, "next.config.ts"));

  // Write SHA metadata
  fs.writeFileSync(path.join(pkgDir, ".release-sha"), repoSha, "utf8");
  fs.writeFileSync(path.join(pkgDir, ".build-id"), buildId, "utf8");

  // 4. Archive release
  const tarName = `release-${buildId}.tar.gz`;
  const tarPath = path.join(ROOT, tarName);
  if (fs.existsSync(tarPath) && fs.statSync(tarPath).size > 100 * 1024 * 1024) {
    console.log(`✓ Using existing valid archive: ${tarName} (${(fs.statSync(tarPath).size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    console.log(`Compressing ${tarName}...`);
    execSync(`tar -czf "${tarPath}" -C "${pkgDir}" .`);
    console.log(`✓ Created archive: ${tarName} (${(fs.statSync(tarPath).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  // 5. Transfer to Hostinger VPS
  console.log("Ensuring VPS tmp directory exists...");
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "mkdir -p /home/u188101251/production-app/tmp"`);
  console.log("Uploading release archive to VPS...");
  execSync(`scp -P 65002 "${tarPath}" u188101251@147.93.100.126:/home/u188101251/production-app/tmp/${tarName}`);
  console.log("✓ Uploaded archive to VPS tmp directory");

  // 6. Execute atomic release extraction, symlinking, and restart
  console.log("Executing atomic release activation on VPS...");
  const releaseId = `${repoSha.slice(0, 7)}-${buildId}`;
  const remoteScript = `
set -euo pipefail
NEW_REL="/home/u188101251/production-app/releases/${releaseId}"
mkdir -p "$NEW_REL"
echo "Extracting release package..."
tar -xzf "/home/u188101251/production-app/tmp/${tarName}" -C "$NEW_REL"

echo "Configuring persistent symlinks..."
ln -sfn /home/u188101251/production-app/shared/node_modules "$NEW_REL/node_modules"
ln -sfn /home/u188101251/production-app/shared/data "$NEW_REL/data"
cp /home/u188101251/production-app/shared/.env.production "$NEW_REL/.env.production"

mkdir -p "$NEW_REL/public"
ln -sfn /home/u188101251/production-app/shared/cms-media "$NEW_REL/public/cms-media"

echo "Switching current symlink atomically..."
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
`;

  const deployOutput = execSync(`ssh -p 65002 u188101251@147.93.100.126 "bash -s"`, {
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
