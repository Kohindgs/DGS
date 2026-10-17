import { execSync } from "node:child_process";

const REMOTE_SCRIPT = `
async function testEngine(name, url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    console.log(name, "status:", res.status, "len:", text.length);
  } catch (e) {
    console.log(name, "error:", e.message);
  }
}

await testEngine("Yahoo", "https://search.yahoo.com/search?p=digital+marketing+write+for+us+India");
await testEngine("Bing", "https://www.bing.com/search?q=digital+marketing+write+for+us+India");
await testEngine("Mojeek", "https://www.mojeek.com/search?q=digital+marketing+write+for+us+India");
await testEngine("Qwant", "https://www.qwant.com/?q=digital+marketing+write+for+us+India&t=web");
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/tmp/tengines.mjs && node /home/u188101251/production-app/tmp/tengines.mjs; rm -f /home/u188101251/production-app/tmp/tengines.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
console.log(raw);
