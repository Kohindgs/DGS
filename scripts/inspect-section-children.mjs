import fs from "node:fs";

const sec = JSON.parse(fs.readFileSync("./scripts/webdev_sections_extracted.json", "utf8"));
sec.forEach(s => {
  const directChildren = [...s.html.matchAll(/<section[^>]*>\s*<([a-z0-9]+)[^>]*class="([^"]+)"/gi)].map(m => m[1] + "." + m[2]);
  console.log(`Section ${s.index} (${s.id}) child: ${directChildren[0] || "none"}`);
});
