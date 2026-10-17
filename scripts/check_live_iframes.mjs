import * as cheerio from "cheerio";

async function main() {
  const res = await fetch("https://www.dgeniussolutions.com/services/website-development-amc/?t=" + Date.now());
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("Total iframes on page:", $("iframe").length);
  $("iframe").each((i, el) => {
    console.log(`iframe ${i+1}:`);
    console.log("  src:", $(el).attr("src"));
    console.log("  data-src:", $(el).attr("data-src"));
    console.log("  title:", $(el).attr("title"));
    console.log("  parent class:", $(el).parent().attr("class"));
    console.log("  parent parent:", $(el).parent().parent().attr("class"));
  });

  console.log("\nCase study images:");
  $(".work-project-row").each((i, row) => {
    const name = $(row).find(".work-client-name").text().trim();
    const img = $(row).find("img");
    const iframe = $(row).find("iframe");
    console.log(`Row ${i+1}: ${name}`);
    console.log("  img:", img.attr("src"));
    console.log("  iframe count:", iframe.length);
  });
}

main().catch(console.error);
