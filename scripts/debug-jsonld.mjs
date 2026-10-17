async function debug() {
  const r = await fetch("http://localhost:3005/services/website-development-amc/");
  const html = await r.text();
  const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(regex)];
  console.log("Found JSON-LD scripts:", matches.length);
  matches.forEach((m, i) => {
    console.log(`\n=== SCRIPT ${i} ===`);
    console.log(m[1].slice(0, 1500));
  });
}
debug();
