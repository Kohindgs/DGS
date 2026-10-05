#!/bin/bash
set -euo pipefail

ENV_FILE="/home/u188101251/production-app/shared/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="/home/u188101251/production-app/current/.env.production"
fi

DB_USER=$(grep -E '^DGS_MYSQL_USER=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\"")
DB_PASS=$(grep -E '^DGS_MYSQL_PASSWORD=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\"")
DB_NAME=$(grep -E '^DGS_MYSQL_DATABASE=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\"")
DB_HOST=$(grep -E '^DGS_MYSQL_HOST=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\"")
DB_PORT=$(grep -E '^DGS_MYSQL_PORT=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\"")

mkdir -p /home/u188101251/production-app/backups
mkdir -p /home/u188101251/production-app/tmp

CNF="/home/u188101251/production-app/tmp/backup_opts_$$.cnf"
trap 'rm -f "$CNF"' EXIT

cat > "$CNF" <<EOF
[client]
host=${DB_HOST:-127.0.0.1}
port=${DB_PORT:-3306}
user=$DB_USER
password="$DB_PASS"
EOF

chmod 600 "$CNF"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/home/u188101251/production-app/backups/backup_v8127_${TIMESTAMP}.sql"

mysqldump --defaults-extra-file="$CNF" --no-tablespaces "$DB_NAME" > "$BACKUP_FILE"

echo "✓ Secure backup created: $BACKUP_FILE ($(ls -lh "$BACKUP_FILE" | awk '{print $5}'))"
