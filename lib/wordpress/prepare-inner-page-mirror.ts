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
    output = output.replace(/Performance Marketing for Qualified Leads, Sales & ROI/g, "Performance Marketing Agency in Mumbai for Qualified Leads, Sales & ROI");
    output = output.replace(/Talk To Our SEO Team/g, "Talk To Our Performance Marketing Team");
  }
  if (path === "/services/social-media-marketing/") {
    output = output.replace(/Transform Your Social Media Into a Strategic Revenue Channel/g, "Social Media Marketing Agency in Mumbai for Content, Ads & Growth");
  }
  if (path === "/services/branding/") {
    output = output.replace(/TRANSFORM YOUR BRAND IDENTITY INTO MARKET DOMINANCE/g, "Branding Agency in Mumbai for Brand Strategy, Identity & Design");
  }
  if (path === "/services/content-creation/") {
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

export function prepareInnerPageMirror(
  content: InnerPageMirrorContent,
  wordpressId: number,
): PreparedInnerPageMirror {
  let body = markElementorBackgroundsReady(
    unwrapMirrorLazyMedia(stripCapturedFooters(stripLeadingCloseTags(content.body || ""))),
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
