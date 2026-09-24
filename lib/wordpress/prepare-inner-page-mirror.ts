import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";
import { applyLocationSeoContent } from "@/lib/seo/location-seo-content";
import { applyInternationalPageContent } from "@/lib/seo/international-page-content";
import { applyApprovedLinkCorrectionsToHtml } from "./apply-mirror-link-corrections";
import {
  markElementorBackgroundsReady,
  replaceEnviraWrapWithNativeMount,
  stripCapturedFooters,
  unwrapMirrorLazyMedia,
} from "./native-inner-fixes";
import type { InnerPageMirrorContent } from "./inner-mirror-types";

export type PreparedInnerPageMirror = InnerPageMirrorContent & {
  articleHtml: string;
  combinedStyles: string;
};

function stripLeadingCloseTags(html: string): string {
  return html.replace(/^(?:\s*<\/(?:div|header|section|main|span|nav|aside)>)+/i, "").trim();
}

function normalizeSemanticH1(path: string, html: string): string {
  let output = html;
  output = output.replace(
    /<h1\b([^>]*class=["'][^"']*\bdgs-hero-title\b[^"']*["'][^>]*)>\s*<span\b[^>]*class=["']dgs-sr["'][^>]*>([\s\S]*?)<\/span>([\s\S]*?)<\/h1>/gi,
    '<div$1><h1 class="dgs-sr">$2</h1>$3</div>',
  );
  if (path === "/career/") {
    output = output.replace(/Join Our<br\s*\/?>\s*<span/gi, "Join Our<br> <span");
  }
  if (path === "/services/") {
    output = output.replace(/<h1([^>]*)>Archives:\s*<span>Services<\/span><\/h1>/i, '<h1$1>Our <span>Services</span></h1>');
  }
  return output;
}

function applyServiceSearchCorrections(path: string, html: string): string {
  let output = html;
  if (path === "/services/performance-marketing/") {
    output = output.replace(
      /Performance Marketing for\s*(<span\b[^>]*class=["'][^"']*\bdgs-gradient\b[^"']*["']>\s*Qualified Leads, Sales & ROI\s*<\/span>)/i,
      "Performance Marketing Agency in Mumbai for $1",
    );
    output = output.replace(/Performance Marketing for Qualified Leads, Sales & ROI/g, "Performance Marketing Agency in Mumbai for Qualified Leads, Sales & ROI");
    output = output.replace(/Talk To Our SEO Team/g, "Talk To Our Performance Marketing Team");
  }
  if (path === "/services/social-media-marketing/") {
    output = output.replace(
      /Transform Your Social Media Into a\s*<span class=["']smm-gradient-text["']>Strategic Revenue Channel<\/span>/i,
      'Social Media Marketing Agency in Mumbai for\n<span class="smm-gradient-text">Content, Ads & Growth</span>',
    );
    output = output.replace(/Transform Your Social Media Into a Strategic Revenue Channel/g, "Social Media Marketing Agency in Mumbai for Content, Ads & Growth");
  }
  if (path === "/services/branding/") {
    output = output.replace(
      /<span class=["']bp-t-line["']>TRANSFORM YOUR<\/span>\s*<span class=["']bp-t-line["']>BRAND IDENTITY INTO<\/span>\s*<span class=["']bp-t-line bp-t-grad["']>MARKET DOMINANCE<\/span>/i,
      '<span class="bp-t-line">BRANDING AGENCY IN MUMBAI FOR</span>\n<span class="bp-t-line">BRAND STRATEGY, IDENTITY</span>\n<span class="bp-t-line bp-t-grad">& DESIGN</span>',
    );
    output = output.replace(/TRANSFORM YOUR BRAND IDENTITY INTO MARKET DOMINANCE/g, "BRANDING AGENCY IN MUMBAI FOR BRAND STRATEGY, IDENTITY & DESIGN");
  }
  if (path === "/services/content-creation/") {
    output = output.replace(
      /<span class=["']line["']>Content that<\/span>\s*<span class=["']line["']><span class=["']gradient-word["']>transforms<\/span><\/span>\s*<span class=["']line["']>brands<\/span>/i,
      '<span class="line">Content Marketing Agency</span>\n<span class="line"><span class="gradient-word">in Mumbai</span></span>\n<span class="line">for SEO, Social & Brand Content</span>',
    );
    output = output.replace(/Content that transforms brands/g, "Content Marketing Agency in Mumbai for SEO, Social & Brand Content");
  }
  if (path === "/services/seo-service-pune/") {
    output = output.replace(/SEO Agency in Pune for Rankings, Qualified Traffic and Leads —\s*/g, "SEO Agency in Pune for Rankings, Qualified Traffic and Leads");
  }
  if (path === "/services/website-development-pune-page/") {
    output = output.replace(/Talk To Our SEO Team/g, "Talk To Our Website Development Team");
  }
  if (path === "/services/ai-video-production-agency/") {
    output = output.replace(
      '<h3><a href="/services/performance-marketing/">Performance Marketing</a></h3>',
      '<h3><a href="/services/performance-marketing/">Google Ads Services</a></h3>',
    );
    output = output.replace(
      '<p class="dgs-eyebrow">AI Video Production Services In Mumbai',
      '<p class="dgs-eyebrow">AI Video Production Services In Mumbai | Generative AI Services In Mumbai',
    );
    const clusterSection = `
<section class="dgs-section-tight" id="mumbai-ai-video-services-cluster">
<div class="dgs-wrap">
<div class="dgs-narrow dgs-center" style="margin-bottom:52px">
<p class="dgs-eyebrow">Specialized AI Video Services In Mumbai</p>
<div class="dgs-title-small" style="font-size:clamp(1.5rem, 3vw, 2.25rem);font-weight:700;line-height:1.25;margin-bottom:0.5rem;">AI Video Production In Mumbai For <span class="dgs-grad-text">Avatars, Festivals, TV Commercials & OTT</span></div>
<p class="dgs-copy" style="margin-top:18px">Expand your brand reach with specialized AI video production formats designed for modern digital campaigns, broadcast channels and streaming audiences across Mumbai and India. Our Mumbai studio combines human creative direction with advanced generative AI tools to produce broadcast-grade video assets at scale.</p>
</div>
<div class="dgs-grid dgs-services-grid">
<article class="dgs-card">
<small>Specialized Service</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI Avatar Videos In Mumbai</div>
<p>We create photorealistic AI avatar videos and digital spokesperson content for Mumbai businesses, corporate explainers, brand messaging, multilingual communication and digital training. AI avatars enable rapid production of consistent, studio-quality presenter videos without the logistical friction of studio shoots or recurring talent scheduling.</p>
</article>
<article class="dgs-card">
<small>Specialized Service</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI Festival Videos In Mumbai</div>
<p>Our AI festival videos help Mumbai and India-wide brands celebrate cultural milestones with high-impact visual storytelling. From Diwali, Navratri and Eid to New Year and Independence Day campaigns, we produce timely, topical AI video greetings, product teasers and emotional narrative films tailored for social media engagement and festive promotions.</p>
</article>
<article class="dgs-card">
<small>Specialized Service</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI TV Commercials In Mumbai</div>
<p>D’Genius Solutions delivers high-concept AI TV commercials and broadcast-ready commercial spots in Mumbai combining generative video aesthetics with cinematic storytelling, scripting, voiceover, sound design and precise color grading. We help consumer brands, fintech startups and enterprise clients produce TVC-quality ad films faster and at a fraction of traditional production overhead.</p>
</article>
<article class="dgs-card">
<small>Specialized Service</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI OTT Video Series In Mumbai</div>
<p>We produce episodic AI OTT video series, branded web episodes, narrative shorts and fictionalized digital stories for streaming platforms, YouTube and digital channels. Our Mumbai creative team blends human narrative development, character consistency, dynamic world-building and AI-assisted animation to bring episodic IP and entertainment concepts to life.</p>
</article>
<article class="dgs-card">
<small>Specialized Service</small>
<div class="dgs-card-title" style="font-size:1.25rem;font-weight:700;margin:0.5rem 0 0.75rem 0;line-height:1.3;">AI OTT Video Ads In Mumbai</div>
<p>Drive measurable performance with high-retention AI OTT video ads crafted for streaming platforms, connected TV (CTV) and video-on-demand apps. We design attention-grabbing video creatives, interactive ad hooks and high-impact visual storytelling engineered to maximize viewer completion rates, brand recall and downstream conversions across Mumbai and national audiences.</p>
</article>
</div>
</div>
</section>`;
    output = output.replace(
      'monthly brand calendars.</p></article></div></div></section>',
      'monthly brand calendars.</p></article></div></div></section>' + clusterSection,
    );
  }
  return output;
}

function lazyBelowFold(html: string): string {
  let count = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    count += 1;
    if (count <= 2) {
      return tag
        .replace(/\bloading=["']lazy["']/i, 'loading="eager"')
        .replace(/<img/i, count === 1 ? '<img fetchpriority="high"' : "<img");
    }
    if (!/\bloading=/i.test(tag)) {
      return tag.replace(/<img/i, '<img loading="lazy"');
    }
    return tag;
  });
}

function stripReviewStructuredData(html: string): string {
  let output = html;
  output = output.replace(/\s*itemscope\s+itemtype=["']https?:\/\/schema\.org\/Review["']/gi, "");
  output = output.replace(/\s*itemtype=["']https?:\/\/schema\.org\/Review["']\s*itemscope/gi, "");
  output = output.replace(/\s*itemtype=["']https?:\/\/schema\.org\/Review["']/gi, "");
  output = output.replace(/\s*itemprop=["']reviewBody["']/gi, "");
  output = output.replace(/\s*itemprop=["']itemReviewed["']/gi, "");
  output = output.replace(/\s*itemprop=["']reviewRating["']/gi, "");
  output = output.replace(/\s*itemprop=["']author["']/gi, "");
  return output;
}

export function prepareInnerPageMirror(
  content: InnerPageMirrorContent,
  wordpressId: number,
): PreparedInnerPageMirror {
  let body = stripReviewStructuredData(
    markElementorBackgroundsReady(
      unwrapMirrorLazyMedia(stripCapturedFooters(stripLeadingCloseTags(content.body || ""))),
    ),
  );
  if (content.path === "/portfolio/") {
    body = replaceEnviraWrapWithNativeMount(body);
  }
  body = body.replace(
    /(?:https:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-content\/uploads\/2026\/07\/Weavings-Home-page-\.png(?:\?[^"'\s>]*)?/g,
    "/images/case-studies/weavings-home-page-64820.png",
  );
  // DGS Quick Win 3: Eliminate broken external HumanXT dependencies
  body = body
    .replace(
      /https?:\/\/humanxt\.com\/wp-content\/uploads\/(?:2024\/05|2025\/08)\/h4-logo\.png/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Humanxt-1-300x300.png",
    )
    .replace(
      /<link\b[^>]*href=["']https?:\/\/humanxt\.com\/fonts\/fira-sans\.css["'][^>]*>/gi,
      "",
    )
    .replace(
      /https:\/\/s\.wordpress\.com\/mshots\/v1\/https%3A%2F%2Fhumanxt\.com%2F\?w=1600/g,
      "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp",
    )
    .replace(
      /<iframe\b[^>]*\b(?:humanxt\.com)[^>]*><\/iframe>/gi,
      '<img loading="lazy" class="live-preview-image e-lazyloaded" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Humanxt-scaled.webp" alt="HumanXT website preview by D’Genius Solutions" width="1600" height="1000" loading="lazy" decoding="async" referrerpolicy="no-referrer" />',
    );
  body = applyServiceSearchCorrections(content.path, normalizeSemanticH1(content.path, body));
  body = applyInternationalPageContent(content.path, body);
  body = applyLocationSeoContent(content.path, body);
  body = applyApprovedLinkCorrectionsToHtml(
    content.path,
    lazyBelowFold(rewriteWpUrls(body)),
  );
  // DGS Quick Win 6, 8 & 9: Ensure continuous marquee ticker logos are loaded eagerly so CSS transform animations do not block them
  body = body.replace(
    /(<(?:div|span|li)\b[^>]*class=["'][^"']*\b(?:smm-news-strip-logo|dgs-nc|nc|dgs-press-chip)\b[^"']*["'][^>]*>\s*<img\b[^>]*?)\bloading=["']lazy["']/gi,
    '$1loading="eager"',
  );
  body = body.replace(
    /(<(?:div|span|li)\b[^>]*class=["'][^"']*\b(?:smm-news-strip-logo|dgs-nc|nc|dgs-press-chip)\b[^"']*["'][^>]*>\s*<img\b[^>]*?)\bfetchpriority=["']low["']/gi,
    '$1',
  );
  const styles = rewriteWpUrls(content.styles || "");
  const fontLinks = content.fontLinks?.map((tag) => rewriteWpUrls(tag));
  const articleHtml = `<article data-migration-content data-wordpress-id="${wordpressId}">${body}</article>`;
  return {
    ...content,
    articleHtml,
    combinedStyles: styles,
    fontLinks,
  };
}
