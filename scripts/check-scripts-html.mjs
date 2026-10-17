async function checkScripts() {
  const res = await fetch("https://www.dgeniussolutions.com/services/ai-video-production-agency/");
  const html = await res.text();
  const matches = [...html.matchAll(/<script([^>]*)type=["']application\/ld\+json["']([^>]*)>/gi)];
  console.log("Matches in raw HTML:", matches.length);
  matches.forEach((m, i) => {
    console.log(i + 1, "attrs:", (m[1] + m[2]).trim());
    const idx = m.index;
    console.log("Context before:", html.substring(Math.max(0, idx - 150), idx).replace(/\s+/g, " "));
  });
}
checkScripts();
