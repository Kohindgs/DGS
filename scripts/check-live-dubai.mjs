async function checkLiveDubai() {
  const res = await fetch('https://www.dgeniussolutions.com/services/ai-production-dubai-page/');
  const html = await res.text();
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const twTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);

  console.log('HTTP:', res.status);
  console.log('Title:', titleMatch ? titleMatch[1].trim() : 'NONE');
  console.log('og:title:', ogTitleMatch ? ogTitleMatch[1] : 'NONE');
  console.log('twitter:title:', twTitleMatch ? twTitleMatch[1] : 'NONE');
  console.log('H1:', h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'NONE');
  console.log('Canonical:', canMatch ? canMatch[1] : 'NONE');
  console.log('Robots:', robotsMatch ? robotsMatch[1] : 'NONE');

  // Check for editorial labels
  const editorialLabels = [
    "Internal Link",
    "Target Keyword",
    "SEO Notes",
    "AI Overview Answer",
    "Case Signal",
    "Local SEO",
    "India SEO",
    "Proof Signal",
    "CMS Note"
  ];
  console.log('\nScanning for visible editorial labels:');
  // Strip tags and script/style
  const cleanBody = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  
  for (const label of editorialLabels) {
    const regex = new RegExp(`\\b${label}\\b`, 'gi');
    const matches = cleanBody.match(regex);
    if (matches) {
      console.log(`  Found "${label}": ${matches.length} occurrences`);
    }
  }
}
checkLiveDubai();
