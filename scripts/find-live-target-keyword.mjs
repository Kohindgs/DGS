async function test() {
  const url = "https://www.dgeniussolutions.com/services/ai-video-production-agency/";
  const res = await fetch(url);
  const html = await res.text();
  const matches = html.match(new RegExp("Target Keyword", "gi")) || [];
  console.log("Matches:", matches);
  let regex = new RegExp(".{0,60}Target Keyword.{0,60}", "gi");
  let m;
  while ((m = regex.exec(html)) !== null) {
    console.log("Found:", m[0]);
  }
}
test();
