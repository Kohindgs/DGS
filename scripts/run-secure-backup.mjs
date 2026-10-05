import fs from "node:fs";
import { execSync } from "node:child_process";

const script = fs.readFileSync("scripts/remote-backup.sh", "utf8");
console.log("Initiating secure database backup on production VPS...");
const out = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/tmp/do_backup.sh && bash /home/u188101251/production-app/tmp/do_backup.sh; rm -f /home/u188101251/production-app/tmp/do_backup.sh"`,
  { input: script, encoding: "utf8" }
);
console.log(out);
