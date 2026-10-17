async function check() {
  const res = await fetch("https://www.dgeniussolutions.com/blogs/");
  const html = await res.text();
  
  const m1 = html.match(/src="[^"]*google-september-2026-spam-update[^"]*"/g);
  const m2 = html.match(/src="[^"]*google-ads-for-b2b-lead-generation[^"]*"/g);

  console.log("Card 1 src:", m1);
  console.log("Card 2 src:", m2);

  // Check single post 1 HTML
  const resPost1 = await fetch("https://www.dgeniussolutions.com/blogs/google-september-2026-spam-update-what-website-owners-should-know/");
  const htmlPost1 = await resPost1.text();
  const mPost1 = htmlPost1.match(/src="[^"]*google-september-2026-spam-update[^"]*"/g);
  console.log("Single Post 1 src:", mPost1);
}

check().catch(console.error);
