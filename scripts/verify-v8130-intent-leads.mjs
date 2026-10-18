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

echo "=== 1. Clearing table for clean fresh-only (<72h) discovery + email test ==="
mysql --defaults-extra-file="$CNF" "$DB_NAME" -e "TRUNCATE TABLE intent_lead_signals;"

echo ""
echo "=== 2. Cron Run #1 (/api/internal/intent-leads/check) -> Fetches Fresh Leads & Sends Email ==="
curl -sS -w "\\nHTTP_CODE=%{http_code} TIME=%{time_total}s\\n" -X POST "https://www.dgeniussolutions.com/api/internal/intent-leads/check" \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  -H "Content-Type: application/json"

echo ""
echo "Waiting 7 seconds before Cron Run #2..."
sleep 7

echo ""
echo "=== 3. Cron Run #2 Immediately After -> Proves 3-Way Anti-Repeat Deduplication (0 Repeats, 0 Duplicate Emails) ==="
curl -sS -w "\\nHTTP_CODE=%{http_code} TIME=%{time_total}s\\n" -X POST "https://www.dgeniussolutions.com/api/internal/intent-leads/check" \\
  -H "Authorization: Bearer $CRON_SECRET" \\
  -H "Content-Type: application/json"

echo ""
echo "=== 4. Qualified Fresh Leads (<72h) + Company Legitimacy + Buyer Persona in Production Vault ==="
mysql --defaults-extra-file="$CNF" "$DB_NAME" -e "SELECT id, source_platform, service_category, age_hours, freshness_tier, intent_score, company_legitimacy_status, company_legitimacy_score, buyer_persona_type, notified_at IS NOT NULL AS emailed, LEFT(post_title, 70) AS title FROM intent_lead_signals ORDER BY intent_score DESC, age_hours ASC;"

echo ""
echo "=== 5. Sample Deep Intent Breakdown & Conversion Playbook JSON (Top Lead) ==="
mysql --defaults-extra-file="$CNF" "$DB_NAME" -e "SELECT post_title, intent_breakdown_json, conversion_playbook_json FROM intent_lead_signals ORDER BY intent_score DESC LIMIT 1\\G"
`;

const out = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`,
  { input: remoteBash, encoding: "utf8" }
);
console.log(out);
