import { execSync } from "node:child_process";
import fs from "node:fs";

const guardCode = fs.readFileSync("scripts/verify-media-availability.mjs", "utf8");

const runner = `
cat > /home/u188101251/production-app/tmp/verify-media-availability.mjs <<'EOF'
${guardCode}
EOF

node /home/u188101251/production-app/tmp/verify-media-availability.mjs /home/u188101251/production-app/current
rm -f /home/u188101251/production-app/tmp/verify-media-availability.mjs
`;

try {
  const out = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o StrictHostKeyChecking=no -p 65002 u188101251@147.93.100.126 "bash -s"`,
    {
      input: runner,
      encoding: "utf8",
    }
  );
  console.log(out);
} catch (e) {
  console.error("Error running guard test on VPS:");
  if (e.stdout) console.log("STDOUT:", e.stdout);
  if (e.stderr) console.error("STDERR:", e.stderr);
  process.exit(1);
}
