import { execSync } from "node:child_process";

const REMOTE_SCRIPT = `
async function testEndpoint(name, url, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    }
  };
  if (body) {
    opts.body = body;
    opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  console.log(name, "status:", res.status, "len:", text.length, "has results:", text.includes("result") || text.includes("result-link") || text.includes("web-result"));
}

await testEndpoint("DDG HTML GET", "https://html.duckduckgo.com/html/?q=digital+marketing+write+for+us+India");
await testEndpoint("DDG HTML POST", "https://html.duckduckgo.com/html/", "POST", "q=digital+marketing+write+for+us+India");
await testEndpoint("DDG LITE POST", "https://lite.duckduckgo.com/lite/", "POST", "q=digital+marketing+write+for+us+India");
await testEndpoint("DDG LITE GET", "https://lite.duckduckgo.com/lite/?q=digital+marketing+write+for+us+India");
`;

const raw = execSync(
  `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/tmp/tendpoints.mjs && node /home/u188101251/production-app/tmp/tendpoints.mjs; rm -f /home/u188101251/production-app/tmp/tendpoints.mjs"`,
  { input: REMOTE_SCRIPT, encoding: "utf8" }
);
console.log(raw);
