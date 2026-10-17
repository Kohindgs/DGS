import { execSync } from "node:child_process";

const remoteBash = `
set -e
ENV_FILE="/home/u188101251/production-app/shared/.env.production"
DB_USER=$(grep -E '^DGS_MYSQL_USER=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"\\r")
DB_PASS=$(grep -E '^DGS_MYSQL_PASSWORD=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"\\r")
DB_NAME=$(grep -E '^DGS_MYSQL_DATABASE=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"\\r")
CRON_SECRET=$(grep -E '^DGS_CRON_SECRET=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"\\r")

CNF="/home/u188101251/production-app/tmp/verify_v8130_$$.cnf"
trap 'rm -f "$CNF"' EXIT
cat > "$CNF" <<EOF
[client]
host=127.0.0.1
port=3306
user=$DB_USER
password="$DB_PASS"
EOF
chmod 600 "$CNF"

echo "1. Clearing previous noisy rows before clean B2B discovery run..."
mysql --defaults-extra-file="$CNF" "$DB_NAME" -e "TRUNCATE TABLE intent_lead_signals;"

echo "2. Running authenticated B2B Buyer-Intent Discovery (/api/internal/intent-leads/check)..."
curl -sS -w "\\nHTTP_CODE=%{http_code} TIME=%{time_total}s\\n" -X POST "https://www.dgeniussolutions.com/api/internal/intent-leads/check" -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json"

echo ""
echo "3. Inspecting qualified B2B buyer-intent leads in production DB:"
mysql --defaults-extra-file="$CNF" "$DB_NAME" -e "SELECT id, source_platform, service_category, intent_score, urgency_level, LEFT(post_title, 90) AS title, LEFT(post_url, 80) AS url FROM intent_lead_signals ORDER BY intent_score DESC;"
`;

const out = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`,
  { input: remoteBash, encoding: "utf8" }
);
console.log(out);
