async function checkSsr() {
  const resp = await fetch('https://www.dgeniussolutions.com/services/ai-production-dubai-page/');
  const html = await resp.text();
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi;
  const matches = [...html.matchAll(regex)];
  console.log('Matches in raw SSR HTML:', matches.length);
  for (let m of matches) {
    console.log(m[0]);
  }
}

checkSsr().catch(console.error);
