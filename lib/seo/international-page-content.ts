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
    out = replaceOnce(
      out,
      "D'Genius Solutions provides SEO services in Dubai for businesses improve Google rankings",
      "D'Genius Solutions provides SEO services in Dubai for businesses that want to improve Google rankings",
    );
    out = replaceOnce(
      out,
      "Business Bay, DIFC, Andheri, Sharjah, and Abu Dhabi discovery.",
      "Business Bay, DIFC, Downtown Dubai, Sharjah, and Abu Dhabi discovery.",
    );
    out = replaceOnce(
      out,
      "Dubai, Business Bay, DIFC, Andheri, Sharjah, and Abu Dhabi searches.",
      "Dubai, Business Bay, DIFC, Downtown Dubai, Sharjah, and Abu Dhabi searches.",
    );
    out = replaceOnce(
      out,
      "targeting Downtown Dubai and Worli searches.",
      "targeting Downtown Dubai and Business Bay searches.",
    );
    out = replaceOnce(
      out,
      "targeting Dubai Marina, Fort, Churchgate, and Colaba.",
      "targeting Dubai Marina, DIFC, JLT, and Business Bay.",
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
    out = out.replace(/href=["']\/services\/website-development\/["']/gi, 'href="/services/website-development-amc/"');
  }

  if (path === "/australia-page/") {
    out = replaceOnce(
      out,
      "We help Australian businesses grow with SEO, AEO, GEO, LLM SEO, voice search optimization, website development, social media, performance marketing and AI production. Our strategy is built for stronger search visibility, AI discovery and qualified lead generation across Australia’s major business cities.",
      "We help businesses targeting Australian customers grow with SEO, AEO, GEO, LLM SEO, website development, social media, performance marketing and AI production. Our strategy is built around genuine service coverage, stronger search visibility, AI discovery and qualified lead generation across Australia’s major business markets. The city references on this page describe markets we can target and do not represent separate DGS office locations.",
    );
    out = out
      .replace(/href=["']\/services\/aeo\/["']/gi, 'href="/services/aeo-services-in-mumbai/"')
      .replace(/href=["']\/services\/geo["']/gi, 'href="/services/geo/"')
      .replace(/href=["']\/services\/generative-ai\/["']/gi, 'href="/services/ai-video-production-agency/"');
  }

  if (path === "/us-landing-page/") {
    out = replaceOnce(
      out,
      '<h1>Digital Marketing Services Designed for the <span class="grad-text">US Market.</span></h1>',
      '<h1>Digital Marketing Agency &amp; Services for the <span class="grad-text">US Market.</span></h1>',
    );
    out = replaceOnce(
      out,
      "D’Genius Solutions supports US businesses with search-first and AI-ready digital marketing solutions, including SEO services, answer engine optimization, generative engine optimization, LLM SEO, website development, content creation, Google Ads, Meta Ads, branding, and social media marketing.",
      "D’Genius Solutions supports businesses targeting US customers with search-first and AI-ready digital marketing solutions, including SEO, AEO, GEO, LLM SEO, website development, content creation, Google Ads, Meta Ads, branding and social media marketing. US city targeting is based on genuine service coverage and does not imply DGS maintains offices in those cities.",
    );
    out = out
      .replace("<h3>SEO Services</h3>", '<h3><a href="/services/seo-services-in-mumbai/" style="color:inherit;text-decoration:none;">SEO Services</a></h3>')
      .replace("<h3>AEO Services</h3>", '<h3><a href="/services/aeo-services-in-mumbai/" style="color:inherit;text-decoration:none;">AEO Services</a></h3>')
      .replace("<h3>GEO Services</h3>", '<h3><a href="/services/geo/" style="color:inherit;text-decoration:none;">GEO Services</a></h3>')
      .replace("<h3>LLM SEO</h3>", '<h3><a href="/services/llm-seo-service/" style="color:inherit;text-decoration:none;">LLM SEO</a></h3>')
      .replace("<h3>Website Development</h3>", '<h3><a href="/services/website-development-amc/" style="color:inherit;text-decoration:none;">Website Development</a></h3>')
      .replace("<h3>AI Video Production</h3>", '<h3><a href="/services/ai-video-production-agency/" style="color:inherit;text-decoration:none;">AI Video Production</a></h3>')
      .replace("<h3>Content Creation</h3>", '<h3><a href="/services/content-creation/" style="color:inherit;text-decoration:none;">Content Creation</a></h3>')
      .replace("<h3>Google Ads</h3>", '<h3><a href="/services/performance-marketing/" style="color:inherit;text-decoration:none;">Google Ads</a></h3>');
  }

  return out;
}
