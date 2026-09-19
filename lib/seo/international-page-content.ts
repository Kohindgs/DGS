function replaceOnce(html: string, from: string, to: string): string {
  return html.includes(from) ? html.replace(from, to) : html;
}

export function applyInternationalPageContent(path: string, html: string): string {
  let out = html;

  if (path === "/services/dubai-seo/") {
    out = replaceOnce(
      out,
      "These authority signals support brand trust, SEO credibility, and wider organic discovery for businesses comparing the best SEO agency in Dubai.",
      "These authority signals support brand trust, SEO credibility, and wider organic discovery for businesses comparing SEO agencies and digital growth partners in Dubai.",
    );
    out = replaceOnce(
      out,
      "The goal is simple: position DGS as a best SEO agency in Dubai choice for your audience and turn search visibility into measurable leads.",
      "The goal is simple: position DGS as a credible SEO partner for Dubai-focused businesses and turn search visibility into measurable leads.",
    );
  }

  if (path === "/aeo-dubai/") {
    out = replaceOnce(
      out,
      "Important: Dubai service-area targeting should not use fake office addresses.",
      "Dubai service-area targeting should reflect genuine service coverage and must not imply office locations that do not exist.",
    );
    out = replaceOnce(
      out,
      "If DGS does not have a physical Dubai office, the page should clearly represent Dubai as a service-targeting market.",
      "DGS serves Dubai as a service-targeting market; this page does not represent a physical DGS office in Dubai.",
    );
  }

  if (path === "/australia-page/") {
    out = replaceOnce(
      out,
      "Full Service Digital Marketing Agency In Australia",
      "Digital Marketing Services for Businesses Targeting Australia",
    );
    out = replaceOnce(
      out,
      "We help Australian businesses grow with SEO, AEO, GEO, LLM SEO, voice search optimization, website development, social media, performance marketing and AI production. Our strategy is built for stronger search visibility, AI discovery and qualified lead generation across Australia’s major business cities.",
      "We help businesses targeting Australian customers grow with SEO, AEO, GEO, LLM SEO, website development, social media, performance marketing and AI production. Our strategy is built around genuine service coverage, stronger search visibility, AI discovery and qualified lead generation across Australia’s major business markets. The city references on this page describe markets we can target and do not represent separate DGS office locations.",
    );
  }

  if (path === "/us-landing-page/") {
    out = replaceOnce(
      out,
      "D’Genius Solutions supports US businesses with search-first and AI-ready digital marketing solutions, including SEO services, answer engine optimization, generative engine optimization, LLM SEO, website development, content creation, Google Ads, Meta Ads, branding, and social media marketing.",
      "D’Genius Solutions supports businesses targeting US customers with search-first and AI-ready digital marketing solutions, including SEO, AEO, GEO, LLM SEO, website development, content creation, Google Ads, Meta Ads, branding and social media marketing. US city targeting is based on genuine service coverage and does not imply DGS maintains offices in those cities.",
    );
  }

  return out;
}
