/**
 * DGS V8.12.7A — Negative Context Engine
 *
 * Scans page title, URL, and content for explicit negative patterns that override
 * ambiguous generic positive keywords (e.g. "submit your site to google" != "submit your agency").
 * Ensures that informational SEO guides or support forms NEVER qualify as Off-Page opportunities.
 */

export interface NegativeContextResult {
  hasNegativeContext: boolean;
  patterns: string[];
  reasons: string[];
}

const SEARCH_ENGINE_SUBMISSION_PATTERNS = [
  "submit your site to google",
  "submit your website to google",
  "submit site to google",
  "submit website to search engine",
  "submit your site to search engine",
  "submit to search engines",
  "submit website to search engines",
  "search engine submission",
  "submit sitemap",
  "submit your sitemap",
  "submitting your sitemap",
  "submit url to google",
  "submit url to search engine",
  "submit your url to google",
  "how to submit your site",
  "submitting your site to google",
  "submitting your website to google",
  "submit your website to bing",
  "submit your site to bing",
  "submit to google search console",
  "submit sitemap to google",
];

const GENERIC_INTERACTION_PATTERNS = [
  "submit support ticket",
  "submit a ticket",
  "submit a support request",
  "submit job application",
  "submit your job application",
  "submit resume",
  "submit your resume",
  "submit comment",
  "submit your comment",
  "submit reply",
  "submit query",
  "submit your query",
  "submit search",
  "submit payment",
  "submit your payment",
  "submit order",
  "submit password",
  "contact customer service",
  "customer support",
  "register domain",
  "register your domain",
  "domain registration",
  "buy domain",
  "sign in to your account",
  "log in to your account",
  "forgot password",
  "reset password",
  "subscribe to newsletter",
  "sign up for our newsletter",
];

const CLOSED_SUBMISSION_PATTERNS = [
  "we don't accept guest",
  "we do not accept guest",
  "not accepting guest",
  "not accepting contributions",
  "no guest posts",
  "guest posting is closed",
  "submissions are currently closed",
  "submissions are closed",
  "no unsolicited submissions",
  "internal authors only",
  "we do not accept paid or sponsored",
  "guest articles are not accepted",
];

export function detectNegativeContext(params: {
  url: string;
  title: string;
  metaDescription: string;
  text: string;
}): NegativeContextResult {
  const haystack = `${params.title} ${params.metaDescription} ${params.text.slice(0, 50000)}`.toLowerCase();
  const patterns: string[] = [];
  const reasons: string[] = [];

  // 1. Search engine submission false positive (The SEO.com defect)
  for (const p of SEARCH_ENGINE_SUBMISSION_PATTERNS) {
    if (haystack.includes(p)) {
      patterns.push(`search_engine_submit:${p}`);
      reasons.push(`GENERIC_SUBMIT_LANGUAGE: Phrase refers to search engine/sitemap submission ("${p}")`);
    }
  }

  // 2. Generic support / jobs / customer service
  for (const p of GENERIC_INTERACTION_PATTERNS) {
    if (haystack.includes(p)) {
      patterns.push(`generic_interaction:${p}`);
      reasons.push(`GENERIC_INTERACTION: Phrase refers to support, resume, or account action ("${p}")`);
    }
  }

  // 3. Explicitly closed submissions
  for (const p of CLOSED_SUBMISSION_PATTERNS) {
    if (haystack.includes(p)) {
      patterns.push(`closed_submission:${p}`);
      reasons.push(`SUBMISSIONS_CLOSED: Site explicitly states ("${p}")`);
    }
  }

  return {
    hasNegativeContext: patterns.length > 0,
    patterns,
    reasons,
  };
}
