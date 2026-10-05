/**
 * DGS V8.12.7A — Page Intent Classification Engine
 *
 * Accurately determines the fundamental purpose of an external web page
 * before opportunity qualification. Ensures opportunity type is strictly compatible
 * with actual page intent, permanently blocking false positives like SEO guides
 * being misclassified as agency directories.
 */

export type PageIntent =
  | "BUSINESS_DIRECTORY"
  | "EDITORIAL_GUIDELINES"
  | "BLOG_ARTICLE"
  | "SEO_GUIDE"
  | "SERVICE_PAGE"
  | "PRODUCT_PAGE"
  | "CAREERS"
  | "CONTACT_PAGE"
  | "AWARD_PAGE"
  | "PARTNERSHIP_PAGE"
  | "RESOURCE_PAGE"
  | "NEWS_ARTICLE"
  | "JOURNALIST_REQUEST"
  | "PODCAST_PAGE"
  | "COMMUNITY_FORUM"
  | "UNKNOWN";

export interface PageIntentResult {
  intent: PageIntent;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
  signals: string[];
}

export function classifyPageIntent(params: {
  url: string;
  title: string;
  metaDescription: string;
  text: string;
  hasForm: boolean;
  formCount: number;
}): PageIntentResult {
  const urlLower = params.url.toLowerCase();
  let pathname = "";
  try {
    pathname = new URL(params.url).pathname.toLowerCase();
  } catch {
    pathname = urlLower;
  }
  const titleLower = params.title.toLowerCase();
  const descLower = params.metaDescription.toLowerCase();
  const textLower = params.text.slice(0, 40000).toLowerCase();

  const reasons: string[] = [];
  const signals: string[] = [];

  // Helper check
  const hasInUrl = (patterns: string[]) => patterns.some((p) => pathname.includes(p));
  const hasInTitle = (patterns: string[]) => patterns.some((p) => titleLower.includes(p));
  const hasInText = (patterns: string[]) => patterns.some((p) => textLower.includes(p));

  // 1. SEO Guide / Educational Article
  // e.g. seo.com/basics/, moz.com/learn/seo/what-is-seo, ahrefs.com/seo
  const isGuideUrl = hasInUrl(["/basics", "/learn/", "/guide/", "/tutorial/", "/what-is-", "/glossary", "/definition", "/intro-to-"]);
  const isGuideTitle = hasInTitle([
    "beginner's guide",
    "seo basics",
    "what is seo",
    "what is marketing",
    "complete guide",
    "how to do seo",
    "seo guide",
    "definition of",
    "glossary",
    "ultimate guide",
  ]);
  const isGuideText = hasInText([
    "master seo basics",
    "search engine optimization basics",
    "in this beginner's guide",
    "what is search engine optimization",
    "learn the basics of",
  ]);

  if ((isGuideUrl || isGuideTitle) && isGuideText) {
    reasons.push("URL or title indicates an educational guide/tutorial with educational text");
    signals.push("guide_url_title_match");
    return {
      intent: "SEO_GUIDE",
      confidence: "HIGH",
      reasons,
      signals,
    };
  }

  // 2. Careers / Job Portals
  if (
    hasInUrl(["/careers", "/jobs", "/job-opening", "/vacancies"]) ||
    hasInTitle(["careers at", "job openings", "work with us", "hiring"])
  ) {
    if (hasInText(["job description", "apply for this job", "submit your resume", "salary", "qualifications"])) {
      reasons.push("Careers portal or recruitment page");
      signals.push("careers_match");
      return { intent: "CAREERS", confidence: "HIGH", reasons, signals };
    }
  }

  // 3. Contact Us Page
  if (
    hasInUrl(["/contact", "/contact-us", "/reach-us", "/get-in-touch"]) ||
    titleLower === "contact us" ||
    titleLower.startsWith("contact us -")
  ) {
    // Distinguish generic contact form from write-for-us or directory submission
    if (!hasInUrl(["write", "submit", "listing", "guest", "partner"])) {
      reasons.push("Generic contact page");
      signals.push("contact_page_match");
      return { intent: "CONTACT_PAGE", confidence: "HIGH", reasons, signals };
    }
  }

  // 4. Editorial Guidelines / Write For Us
  const isContribUrl = hasInUrl([
    "/write-for-us",
    "/guest-post",
    "/contributor-guidelines",
    "/submit-article",
    "/editorial-guidelines",
    "/contribute",
    "/blog-guidelines",
  ]);
  const isContribTitle = hasInTitle([
    "write for us",
    "become a contributor",
    "guest post guidelines",
    "contributor guidelines",
    "submit an article",
    "guest author guidelines",
    "submission guidelines",
  ]);
  const isContribText = hasInText([
    "guidelines for contributing",
    "submit your draft",
    "pitch an article",
    "we welcome guest contributions",
    "interested in writing for us",
    "guest post requirements",
    "submit your pitch",
  ]);

  if (isContribUrl || isContribTitle || isContribText) {
    reasons.push("Explicit contributor and guest author submission guidelines detected");
    signals.push("editorial_guidelines_match");
    return {
      intent: "EDITORIAL_GUIDELINES",
      confidence: isContribUrl || isContribTitle ? "HIGH" : "MEDIUM",
      reasons,
      signals,
    };
  }

  // 5. Business Directory / Agency Listing
  const isDirectoryUrl = hasInUrl([
    "/add-business",
    "/add-company",
    "/get-listed",
    "/claim-listing",
    "/create-listing",
    "/join-directory",
    "/list-your-business",
    "/add-your-business",
    "/register-business",
    "/directory/add",
    "/addbusiness",
    "/free-listing",
    "/agency-registration",
    "/agency-join",
    "/add-agency",
    "/join",
    "/submit",
  ]);
  const isDirectoryTitle = hasInTitle([
    "add your business",
    "list your business",
    "get listed",
    "claim your listing",
    "add your company",
    "submit your company",
    "agency directory",
    "business directory",
  ]);
  const isDirectoryText = hasInText([
    "list your business for free",
    "add your agency to",
    "create your free company profile",
    "join our directory of",
    "claim your free listing",
    "register your agency",
    "add listing",
  ]);

  if (isDirectoryUrl || (isDirectoryTitle && isDirectoryText)) {
    reasons.push("Explicit business or agency directory submission pathway detected");
    signals.push("directory_submission_match");
    return {
      intent: "BUSINESS_DIRECTORY",
      confidence: isDirectoryUrl ? "HIGH" : "MEDIUM",
      reasons,
      signals,
    };
  }

  // 6. Partnership Program Page
  const isPartnerUrl = hasInUrl(["/partner-program", "/become-a-partner", "/agency-partners", "/partnerships"]);
  const isPartnerTitle = hasInTitle(["partner program", "become a partner", "agency partner program", "partner with us"]);
  const isPartnerText = hasInText(["solutions partner", "referral partner", "apply to become a partner", "partner benefits"]);

  if (isPartnerUrl || (isPartnerTitle && isPartnerText)) {
    reasons.push("Partnership program onboarding page detected");
    signals.push("partnership_program_match");
    return { intent: "PARTNERSHIP_PAGE", confidence: "HIGH", reasons, signals };
  }

  // 7. Award / Nomination Page
  const isAwardUrl = hasInUrl(["/awards", "/nominate", "/nomination", "/award-entry"]);
  const isAwardTitle = hasInTitle(["awards", "nominate now", "enter awards", "entry guidelines", "call for entries"]);
  if (isAwardUrl && (isAwardTitle || hasInText(["entry deadline", "judging criteria", "nominate your company"]))) {
    reasons.push("Industry award program or nomination intake page detected");
    signals.push("award_program_match");
    return { intent: "AWARD_PAGE", confidence: "HIGH", reasons, signals };
  }

  // 8. Podcast Guest Intake
  const isPodcastUrl = hasInUrl(["/podcast", "/be-a-guest", "/podcast-guest"]);
  if (isPodcastUrl && hasInText(["apply to be a guest", "podcast guest form", "suggest a guest", "be on our show"])) {
    reasons.push("Podcast guest application page detected");
    signals.push("podcast_guest_match");
    return { intent: "PODCAST_PAGE", confidence: "HIGH", reasons, signals };
  }

  // 9. Community Forum
  const isCommunityHost = ["reddit.com", "quora.com", "indiehackers.com", "dev.to", "hashnode.com", "growthhackers.com"].some(
    (d) => urlLower.includes(d)
  );
  if (isCommunityHost || hasInUrl(["/forum", "/community", "/discussions", "/thread"])) {
    reasons.push("Online community, developer network, or discussion forum");
    signals.push("community_forum_match");
    return { intent: "COMMUNITY_FORUM", confidence: "HIGH", reasons, signals };
  }

  // 10. Curated Resource Page
  if (hasInUrl(["/resources", "/tools", "/useful-links"]) || hasInTitle(["resources list", "curated resources", "useful tools"])) {
    reasons.push("Curated resource list or toolkit page");
    signals.push("resource_page_match");
    return { intent: "RESOURCE_PAGE", confidence: "MEDIUM", reasons, signals };
  }

  // 11. Blog Article / Post
  if (hasInUrl(["/blog/", "/article/", "/post/", "/news/"]) || hasInText(["posted on", "written by", "min read", "published on"])) {
    reasons.push("Standard editorial blog post or informational article");
    signals.push("blog_article_match");
    return { intent: "BLOG_ARTICLE", confidence: "MEDIUM", reasons, signals };
  }

  // 12. Service or Product Sales Page
  if (hasInUrl(["/services", "/solutions", "/pricing", "/features", "/product"])) {
    reasons.push("Commercial vendor service or product page");
    signals.push("service_product_match");
    return { intent: "SERVICE_PAGE", confidence: "MEDIUM", reasons, signals };
  }

  return {
    intent: "UNKNOWN",
    confidence: "LOW",
    reasons: ["No definitive page intent markers matched"],
    signals: [],
  };
}

/**
 * Checks whether an identified page intent is compatible with a given discovery lane.
 * If incompatible, the opportunity CANNOT be qualified under that lane.
 */
export function isPageIntentCompatibleWithLane(intent: PageIntent, laneId: string): { compatible: boolean; reason?: string } {
  switch (laneId) {
    case "AGENCY_DIRECTORIES":
    case "BUSINESS_CITATIONS":
    case "LOCAL_LISTINGS":
    case "REVIEW_PLATFORMS": {
      if (intent === "BUSINESS_DIRECTORY") return { compatible: true };
      if (intent === "SEO_GUIDE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:SEO_GUIDE (Informational guide, not a business directory)" };
      if (intent === "BLOG_ARTICLE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:BLOG_ARTICLE (Informational article, not a business directory)" };
      if (intent === "CAREERS") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:CAREERS (Recruitment page, not a business directory)" };
      if (intent === "CONTACT_PAGE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:CONTACT_PAGE (Generic contact form, not a business directory)" };
      if (intent === "PRODUCT_PAGE" || intent === "SERVICE_PAGE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:COMMERCIAL_VENDOR (Vendor sales page, not a business directory)" };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "ARTICLE_CONTRIBUTIONS":
    case "EXPERT_CONTRIBUTIONS": {
      if (intent === "EDITORIAL_GUIDELINES") return { compatible: true };
      if (intent === "SEO_GUIDE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:SEO_GUIDE (Educational guide lacking author submission intake)" };
      if (intent === "CAREERS") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:CAREERS (Employment recruitment page, not guest post intake)" };
      if (intent === "CONTACT_PAGE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:CONTACT_PAGE (Generic contact page lacking contributor guidelines)" };
      if (intent === "PRODUCT_PAGE") return { compatible: false, reason: "PAGE_INTENT_MISMATCH:PRODUCT_PAGE (Software product page, not editorial intake)" };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "PARTNERSHIPS": {
      if (intent === "PARTNERSHIP_PAGE") return { compatible: true };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "RESOURCE_PAGES": {
      if (intent === "RESOURCE_PAGE" || intent === "BLOG_ARTICLE") return { compatible: true };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "COMMUNITIES_QA": {
      if (intent === "COMMUNITY_FORUM") return { compatible: true };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "DIGITAL_PR": {
      if (intent === "JOURNALIST_REQUEST" || intent === "EDITORIAL_GUIDELINES" || intent === "NEWS_ARTICLE") return { compatible: true };
      return { compatible: false, reason: `PAGE_INTENT_MISMATCH:${intent}` };
    }

    case "BROKEN_LINKS":
    case "UNLINKED_MENTIONS":
    case "COMPETITOR_LINK_GAP":
      return { compatible: true };

    default:
      return { compatible: intent !== "CAREERS" && intent !== "PRODUCT_PAGE", reason: "UNKNOWN_LANE_CHECK" };
  }
}
