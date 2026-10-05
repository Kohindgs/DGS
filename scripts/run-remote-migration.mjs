import { execSync } from "node:child_process";
import fs from "node:fs";

const scriptContent = fs.readFileSync("scripts/migrate-v8127a-actionability-schema.mjs", "utf8");

const res = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/mig8127a.mjs && cd /home/u188101251/production-app/current && node tmp/mig8127a.mjs; rm -f tmp/mig8127a.mjs"`,
  { input: scriptContent, encoding: "utf8" }
);
console.log(res);
