import { execSync } from "node:child_process";

const buildId = "f900bad2ab33049d";
const tarName = `release-${buildId}.tar.gz`;
const repoSha = "aec0d8817f1cb32281a5064922b75cfc0e52d233";
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
echo "✓ Release ${releaseId} successfully activated!"
`;

console.log("Activating V8.12.7 release package on VPS...");
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
