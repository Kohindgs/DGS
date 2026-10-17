async function test(path) {
  const url = `https://www.dgeniussolutions.com${path}`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(`=== ${path} ===`);
  console.log(`Status: ${res.status}`);
  console.log(`Has <form: ${text.includes("<form")}`);
  console.log(`Has fluentform: ${text.includes("fluentform")}`);
  const formMatches = [...text.matchAll(/<form[^>]*>/gi)];
  console.log(`Forms found: ${formMatches.length}`);
  for (const m of formMatches) {
    console.log(`  ${m[0]}`);
  }
  const idMatches = [...text.matchAll(/id=["']([^"']*form[^"']*)["']/gi)];
  console.log("Matching IDs:", idMatches.map(m => m[1]));
}

const target = process.argv[2] || "/australia-page/";
test(target).catch(console.error);
