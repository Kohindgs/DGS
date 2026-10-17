import { execSync } from "child_process";

const remoteCmd = `node -e '
const mysql = require("mysql2/promise");
(async () => {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "u188101251_dgscms",
    password: "KohinDGS2026!#",
    database: "u188101251_dgscms"
  });
  const [rows] = await conn.execute("SELECT id, form_id, service_label, route, email, full_name, created_at FROM leads ORDER BY id DESC LIMIT 1;");
  console.log(JSON.stringify(rows[0], null, 2));
  await conn.end();
})();
'`;

try {
  const res = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -p 65002 u188101251@147.93.100.126 ${JSON.stringify(remoteCmd)}`,
    { encoding: "utf8" }
  );
  console.log("Latest lead in DB:", res);
} catch (e) {
  console.error("Error:", e.message);
}
