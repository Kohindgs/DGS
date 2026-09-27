import mysql from "mysql2/promise";
import crypto from "node:crypto";

async function main() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  const pool = uri ? mysql.createPool(uri) : mysql.createPool({
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
    charset: "utf8mb4",
    dateStrings: true,
  });

  const id = crypto.randomUUID();
  const title = "AI Video Production Recovery Remediated";
  const message = "Technical & quality remediation deployed to /services/ai-video-production-agency/. All machine labels and keyword over-optimization eliminated (0 matches live). Search Console monitoring active for September 2026 Spam Update recovery.";
  const type = "system_notice";
  const severity = "info";
  const role = "all";
  const resource_type = "service_page";
  const resource_id = "/services/ai-video-production-agency/";
  const link = "/services/ai-video-production-agency/";

  await pool.execute(
    `INSERT INTO cms_notifications (
      id, recipient_id, recipient_role, title, message, type,
      severity, resource_type, resource_id, resource_url, link, is_read, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
    [
      id,
      null,
      role,
      title,
      message,
      type,
      severity,
      resource_type,
      resource_id,
      link,
      link,
    ]
  );

  console.log("Successfully published notification into cms_notifications with ID:", id);
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to publish notice:", err);
  process.exit(1);
});
