import * as cheerio from "cheerio";

async function testDDG(query) {
  console.log("Testing search for query:", query);
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  console.log("HTTP status:", res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];
  $(".result").each((i, el) => {
    const title = $(el).find(".result__title").text().trim();
    const link = $(el).find(".result__url").text().trim();
    let href = $(el).find(".result__title a").attr("href");
    if (href && href.includes("uddg=")) {
      try {
        const u = new URL("https://duckduckgo.com" + href);
        href = decodeURIComponent(u.searchParams.get("uddg") || href);
      } catch {}
    }
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title && href && href.startsWith("http")) {
      results.push({ title, url: href, snippet });
    }
  });

  console.log(`Found ${results.length} results:`);
  results.slice(0, 5).forEach((r, idx) => console.log(`${idx + 1}. [${r.title}](${r.url})\n   ${r.snippet}\n`));
}

testDDG("SEO agency directory India").catch(console.error);
