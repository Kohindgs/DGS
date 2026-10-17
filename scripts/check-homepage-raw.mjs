async function checkHome() {
  const res = await fetch("https://www.dgeniussolutions.com/");
  const html = await res.text();
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi)];
  console.log("Homepage LD+JSON in raw HTML:", matches.length);
}
checkHome();
