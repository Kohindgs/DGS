import { execSync } from "node:child_process";

const remoteJs = `
import fs from "node:fs/promises";
import { execSync } from "node:child_process";

const envText = await fs.readFile("/home/u188101251/production-app/current/.env.production", "utf8");
const env = {};
for (const line of envText.split("\\n")) {
  const p = line.indexOf("=");
  if (p > 0) {
    let v = line.slice(p + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[line.slice(0, p).trim()] = v;
  }
}

await fs.mkdir("/home/u188101251/production-app/backups", { recursive: true });
const filename = "/home/u188101251/production-app/backups/backup_offpage_pre_v8121_" + Date.now() + ".sql";
console.log("Backing up database to", filename);

const cmd = \`mysqldump --no-tablespaces -h \${env.DGS_MYSQL_HOST} -P \${env.DGS_MYSQL_PORT || 3306} -u \${env.DGS_MYSQL_USER} -p'\${env.DGS_MYSQL_PASSWORD}' \${env.DGS_MYSQL_DATABASE} > \${filename}\`;
execSync(cmd, { shell: "/bin/bash" });

console.log("✓ Backup created successfully!");
const files = await fs.readdir("/home/u188101251/production-app/backups");
console.log("Backups directory:", files);
`;

execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/do-backup.mjs"`, {
  input: remoteJs,
  encoding: "utf8"
});

const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/do-backup.mjs"`, {
  encoding: "utf8"
});
console.log(out);
