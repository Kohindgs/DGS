async function check() {
  const r1 = await fetch('https://www.dgeniussolutions.com/services/aeo/', { redirect: 'manual' });
  console.log('/services/aeo/ status:', r1.status);
  console.log('/services/aeo/ location:', r1.headers.get('location'));
  
  const target = r1.headers.get('location') || 'https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/';
  const r2 = await fetch(target);
  console.log('Target status:', r2.status);
  const html = await r2.text();
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  console.log('Target canonical:', canonMatch ? canonMatch[1] : 'NONE');
}
check().catch(console.error);
