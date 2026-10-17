import { execSync } from "node:child_process";

const remoteBash = `
set -e
ENV_FILE="/home/u188101251/production-app/shared/.env.production"
CRON_SECRET=$(grep -E '^DGS_CRON_SECRET=' "$ENV_FILE" | cut -d= -f2- | tr -d "'\\"\\r")

echo "1. Testing unauthenticated /api/internal/intent-leads/check (expect 401):"
curl -sS -w "\\nHTTP_CODE=%{http_code}\\n" -X POST "https://www.dgeniussolutions.com/api/internal/intent-leads/check"

echo ""
echo "2. Testing authenticated /api/internal/intent-leads/check (expect 200):"
curl -sS -w "\\nHTTP_CODE=%{http_code} TIME=%{time_total}s\\n" -X POST "https://www.dgeniussolutions.com/api/internal/intent-leads/check" -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json"

echo ""
echo "3. Testing Personal LinkedIn Feed Bookmarklet Ingest endpoint (/api/admin/intent-leads/ingest):"
INGEST_TOKEN=$(echo -n "dgs-linkedin-companion:$CRON_SECRET" | sha256sum | cut -c1-28)
FULL_TOKEN="dgs_li_$INGEST_TOKEN"
curl -sS -w "\\nHTTP_CODE=%{http_code}\\n" -X POST "https://www.dgeniussolutions.com/api/admin/intent-leads/ingest" \\
  -H "Content-Type: application/json" \\
  -H "X-DGS-Ingest-Token: $FULL_TOKEN" \\
  -d '{
    "posts": [
      {
        "postUrl": "https://www.linkedin.com/feed/update/urn:li:activity:73189401294810291",
        "authorName": "Aarav Mehta",
        "authorRole": "Co-Founder & CEO at FinScale Dubai & Mumbai",
        "postText": "Looking for recommendations for a strong SEO, AEO (Answer Engine Optimization), and Next.js Website Redesign agency in Mumbai or Dubai. We are scaling our B2B acquisition this quarter—please drop your portfolio or DM me!"
      },
      {
        "postUrl": "https://www.linkedin.com/feed/update/urn:li:activity:73189401294899999",
        "authorName": "Spam Job Seeker",
        "authorRole": "Student",
        "postText": "I am #opentowork and looking for a full-time internship or job role in SEO. Please review my resume and hire me."
      }
    ]
  }'
`;

const out = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`,
  { input: remoteBash, encoding: "utf8" }
);
console.log(out);
