async function searchInternalLink() {
  const res = await fetch('https://www.dgeniussolutions.com/services/ai-production-dubai-page/');
  const html = await res.text();
  const idx = html.indexOf("Internal Link");
  if (idx !== -1) {
    console.log("Found 'Internal Link' at index", idx);
    console.log("Context:", html.substring(Math.max(0, idx - 150), Math.min(html.length, idx + 250)));
  } else {
    console.log("'Internal Link' not found verbatim. Searching case-insensitively:");
    const match = html.match(/internal\s*link/i);
    console.log(match);
  }
}
searchInternalLink();
