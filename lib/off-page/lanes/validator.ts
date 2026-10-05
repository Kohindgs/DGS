/**
 * DGS V8.12.7A — Lane Validators & Evidence-Based Qualification Gate
 *
 * Implements strict, lane-specific qualification rules backed by:
 *   1. Page Intent Classification (blocks SEO guides/articles from becoming directories)
 *   2. Negative Context Detection (blocks search engine/sitemap submission false positives)
 *   3. 4-Part Actionability Test (explicit CTA, submission mechanism, DGS relevance, confidence)
 *   4. Low-confidence / bot-protected results routed to SEO Analyst Verification, never Manager Review
 */

import type { FreeStatus, LinkTypeStatus, RegionCode } from "../types";
import type { LaneDefinition } from "./config";
import { checkUrlStatus, mapLimit, type PageAnalysis } from "./page-analyzer";
import { classifyPageIntent, isPageIntentCompatibleWithLane, type PageIntent } from "./page-intent";
import { detectNegativeContext } from "./negative-context";
import { evaluateActionability, type ActionRequired, type ActionableEvidence } from "./actionability";

export interface LaneVerdict {
  decision: "QUALIFIED" | "DISCOVERED" | "REJECTED";
  reasons: string[];
  signals: string[];
  freeStatus: FreeStatus;
  linkType: LinkTypeStatus;
  region: RegionCode;
  relevance: number; // 0-100, keyword evidence based
  brokenLinks?: Array<{ href: string; status: number; anchor: string }>;
  competitorLinks?: string[];
  // V8.12.7A additions
  pageIntent: PageIntent;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  actionRequired: ActionRequired;
  actionDestination: string;
  actionabilityScore: number;
  actionableEvidence?: ActionableEvidence;
  needsVerification: boolean;
}

// Stricter directory signals: require business / agency / company context
const SUBMISSION_SIGNALS = [
  "add your business",
  "list your business",
  "add a business",
  "add business",
  "add listing",
  "add your listing",
  "submit your business",
  "submit your company",
  "submit company",
  "add your company",
  "add company",
  "list your company",
  "list your agency",
  "add your agency",
  "add agency",
  "submit your agency",
  "submit agency",
  "get listed",
  "claim your listing",
  "claim your business",
  "claim this business",
  "claim profile",
  "register your business",
  "register your company",
  "free listing",
  "create a free profile",
  "create your profile",
  "create company profile",
  "sign up your business",
  "join the directory",
  "submit listing",
  "submit a listing",
  "add your firm",
  "list your firm",
  "submit your website to our directory",
  "submit site to directory",
];

const CONTRIBUTION_SIGNALS = [
  "write for us",
  "guest post guidelines",
  "guest posting guidelines",
  "submit a guest post",
  "guest contributor",
  "become a contributor",
  "contributor guidelines",
  "submission guidelines",
  "submit an article",
  "submit your article",
  "pitch us",
  "pitch your article",
  "pitch your idea",
  "we accept guest",
  "accepting guest",
  "guest author",
  "editorial guidelines",
  "contributor program",
  "contribute an article",
  "expert contributor",
  "share your expertise",
  "guidelines for contributing",
  "blog guidelines",
  "contributing guest posts",
  "submit your draft",
];

const PR_SIGNALS = [
  "journalist request",
  "journalist requests",
  "media request",
  "source request",
  "sources wanted",
  "looking for experts",
  "expert sources",
  "seeking experts",
  "seeking sources",
  "#journorequest",
  "journorequest",
  "press request",
  "reporter request",
  "media opportunities",
  "expert commentary",
  "quote request",
  "respond to journalists",
  "connect with journalists",
  "pr opportunities",
];

const COMMUNITY_SIGNALS = [
  "forum",
  "community",
  "discussion",
  "threads",
  "replies",
  "ask a question",
  "answers",
  "members",
  "join the conversation",
  "posted by",
  "reply",
  "upvote",
];

const COMMUNITY_DOMAINS = [
  "reddit.com",
  "quora.com",
  "stackexchange.com",
  "stackoverflow.com",
  "indiehackers.com",
  "growthhackers.com",
  "warriorforum.com",
  "digitalpoint.com",
  "community.hubspot.com",
  "producthunt.com",
  "dev.to",
  "hashnode.com",
  "linkedin.com",
  "medium.com",
  "moz.com",
  "webmasterworld.com",
  "sitepoint.com",
  "community.",
];

const PARTNERSHIP_SIGNALS = [
  "partner program",
  "partner programme",
  "become a partner",
  "agency partner",
  "partner directory",
  "referral partner",
  "reseller program",
  "solutions partner",
  "certified partner",
  "partner network",
  "apply to become a partner",
  "partner with us",
];

const RESOURCE_SIGNALS = [
  "resources",
  "useful links",
  "recommended",
  "tools",
  "further reading",
  "helpful links",
  "resource list",
  "directory of",
  "suggest a resource",
  "submit a tool",
];

const PAID_ONLY_SIGNALS = [
  "paid guest post",
  "sponsored post price",
  "price per post",
  "per post price",
  "submission fee",
  "listing fee",
  "paid listing only",
  "buy guest post",
  "guest post price",
  "pricing per article",
  "only paid listings",
  "sponsored articles only",
  "we charge",
  "fee for publishing",
  "publication fee",
];

const PAID_SOFT_SIGNALS = ["premium listing", "featured listing", "paid plan", "pricing", "upgrade to premium", "sponsored post"];

const FREE_SIGNALS = [
  "free listing",
  "free profile",
  "list for free",
  "free of charge",
  "it's free",
  "it’s free",
  "100% free",
  "free to join",
  "free basic listing",
  "free submission",
  "no fee",
  "free registration",
  "sign up free",
  "join free",
];

const SPAM_TERMS = [
  "casino",
  "betting",
  "escort",
  "viagra",
  "cialis",
  "payday loan",
  "porn",
  "xxx",
  "gambling",
  "crypto pump",
  "replica watches",
  "essay writing service",
];

const BLOCKED_TLDS = [".cn", ".ru", ".su", ".by", ".xyz", ".top", ".click", ".loan", ".work"];
const BLOCKED_LANGS = ["zh", "ru"];

const TOPIC_TERMS = [
  "seo",
  "search engine",
  "digital marketing",
  "marketing",
  "advertising",
  "ai ",
  "artificial intelligence",
  "generative",
  "video production",
  "video",
  "web development",
  "website",
  "web design",
  "agency",
  "agencies",
  "brand",
  "business",
  "startup",
  "technology",
  "content",
  "social media",
  "ecommerce",
  "e-commerce",
  "growth",
  "answer engine",
  "geo ",
];

const INDIA_TERMS = ["india", "mumbai", "bengaluru", "bangalore", "delhi", "pune", "hyderabad", "chennai", "kolkata", "gurugram", "noida", "ahmedabad"];
const UAE_TERMS = ["uae", "dubai", "abu dhabi", "sharjah", "united arab emirates", "ajman"];
const USA_TERMS = ["usa", "united states", "new york", "california", "texas", "florida", "chicago"];

function hits(text: string, terms: string[]): string[] {
  return terms.filter((t) => text.includes(t));
}

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function classifyRegion(a: PageAnalysis, fallback: RegionCode): RegionCode {
  const host = hostOf(a.finalUrl || a.url);
  if (host.endsWith(".in") || host.endsWith(".co.in")) return "INDIA";
  if (host.endsWith(".ae")) return "UAE";
  if (host.endsWith(".us")) return "USA";
  const head = `${a.title} ${a.metaDescription} ${a.text.slice(0, 20000)}`;
  const ind = hits(head, INDIA_TERMS).length;
  const uae = hits(head, UAE_TERMS).length;
  const usa = hits(head, USA_TERMS).length;
  const best = Math.max(ind, uae, usa);
  if (best >= 2) return ind === best ? "INDIA" : uae === best ? "UAE" : "USA";
  return fallback;
}

export function classifyFree(a: PageAnalysis): { status: FreeStatus; signals: string[] } {
  const paidHard = hits(a.text, PAID_ONLY_SIGNALS);
  const paidSoft = hits(a.text, PAID_SOFT_SIGNALS);
  const free = hits(a.text, FREE_SIGNALS);
  if (paidHard.length > 0 && free.length === 0) return { status: "NOT_FREE", signals: paidHard.map((s) => `paid:${s}`) };
  if (free.length > 0 && (paidHard.length > 0 || paidSoft.length > 0)) {
    return { status: "FREEMIUM", signals: [...free.map((s) => `free:${s}`), ...[...paidHard, ...paidSoft].map((s) => `paid:${s}`)] };
  }
  if (free.length > 0) return { status: "FREE", signals: free.map((s) => `free:${s}`) };
  return { status: "UNKNOWN", signals: paidSoft.map((s) => `paid-soft:${s}`) };
}

export interface ValidateContext {
  queryRegion: RegionCode;
  competitorDomains?: string[];
  brokenLinkCheckLimit?: number;
}

/**
 * Validates a candidate against its discovery lane with V8.12.7A enhanced gates:
 *  - Page Intent classification
 *  - Negative context suppression
 *  - Actionability evaluation
 *  - Precision >= 95% guard
 */
export async function validateForLane(a: PageAnalysis, lane: LaneDefinition, ctx: ValidateContext): Promise<LaneVerdict> {
  const reasons: string[] = [];
  const signals: string[] = [];
  const host = hostOf(a.finalUrl || a.url);
  const region = a.fetched && a.httpStatus && a.httpStatus < 400 ? classifyRegion(a, ctx.queryRegion) : ctx.queryRegion;
  const linkNA = !!lane.linkNotApplicable;
  const baseLinkType: LinkTypeStatus = a.dgsLinks.length > 0 ? a.dgsLinkType : linkNA ? "N/A" : "UNKNOWN";

  // 1. Initial Page Intent
  const intentResult = classifyPageIntent({
    url: a.finalUrl || a.url,
    title: a.title,
    metaDescription: a.metaDescription,
    text: a.text,
    hasForm: a.hasForm,
    formCount: a.formCount,
  });
  signals.push(`intent:${intentResult.intent}`);

  const verdict = (decision: LaneVerdict["decision"], extra: Partial<LaneVerdict> = {}): LaneVerdict => ({
    decision,
    reasons,
    signals,
    freeStatus: "UNKNOWN",
    linkType: baseLinkType,
    region,
    relevance: 0,
    pageIntent: intentResult.intent,
    confidence: "LOW",
    actionRequired: "NO_ACTION",
    actionDestination: a.finalUrl || a.url,
    actionabilityScore: 0,
    needsVerification: false,
    ...extra,
  });

  // 2. HTTP status checks
  if (!a.fetched) {
    reasons.push(a.error || "UNREACHABLE");
    return verdict("REJECTED");
  }

  // 403 / 429 = bot-protected or rate-limited. Never qualify automatically; route to Needs Verification
  if (a.httpStatus === 403 || a.httpStatus === 429) {
    reasons.push(`HTTP_${a.httpStatus}:BOT_PROTECTED`);
    return verdict("DISCOVERED", { confidence: "LOW", needsVerification: true });
  }

  if (!a.httpStatus || a.httpStatus < 200 || a.httpStatus >= 300) {
    reasons.push(`HTTP_${a.httpStatus ?? 0}`);
    return verdict("REJECTED");
  }

  if (a.error) {
    reasons.push(a.error);
    return verdict("REJECTED");
  }

  // 3. Domain & Language Gates
  if (host === "dgeniussolutions.com" || host.endsWith(".dgeniussolutions.com")) {
    reasons.push("OWN_DOMAIN");
    return verdict("REJECTED");
  }
  if (BLOCKED_TLDS.some((t) => host.endsWith(t))) {
    reasons.push(`BLOCKED_TLD:${host}`);
    return verdict("REJECTED");
  }
  if (BLOCKED_LANGS.some((l) => a.lang === l || a.lang.startsWith(`${l}-`))) {
    reasons.push(`BLOCKED_LANGUAGE:${a.lang}`);
    return verdict("REJECTED");
  }

  // 4. Spam Filter
  const spam = hits(`${a.title} ${a.metaDescription} ${a.text.slice(0, 50000)}`, SPAM_TERMS);
  if (spam.length >= 2) {
    reasons.push(`SPAM_TERMS:${spam.join("|")}`);
    return verdict("REJECTED");
  }

  // 5. Negative Context Engine (V8.12.7A)
  const negContext = detectNegativeContext({
    url: a.finalUrl || a.url,
    title: a.title,
    metaDescription: a.metaDescription,
    text: a.text,
  });
  if (negContext.hasNegativeContext) {
    signals.push(...negContext.patterns);
    reasons.push(...negContext.reasons);
    return verdict("REJECTED", { confidence: "LOW" });
  }

  // 6. Page Intent Compatibility Check (V8.12.7A)
  const comp = isPageIntentCompatibleWithLane(intentResult.intent, lane.id);
  if (!comp.compatible) {
    reasons.push(comp.reason || `PAGE_INTENT_MISMATCH:${intentResult.intent}`);
    return verdict("REJECTED", { confidence: "LOW" });
  }

  // 7. Free / Paid Evaluation
  const free = classifyFree(a);
  signals.push(...free.signals);
  const freeStatus = linkNA && free.status === "UNKNOWN" ? "UNKNOWN" : free.status;
  if (freeStatus === "NOT_FREE") {
    reasons.push("PAID_ONLY");
    return verdict("REJECTED", { freeStatus });
  }

  // 8. Topical Relevance
  const topicHits = hits(` ${a.title.toLowerCase()} ${a.metaDescription.toLowerCase()} ${a.text.slice(0, 60000)} `, TOPIC_TERMS);
  const relevance = Math.min(100, topicHits.length * 12);
  if (topicHits.length > 0) signals.push(`topics:${topicHits.slice(0, 6).join("|")}`);

  const relevant = lane.validator === "UNLINKED_MENTION" || relevance >= 12;
  if (!relevant) {
    reasons.push("NOT_DGS_RELEVANT");
    return verdict("REJECTED", { freeStatus, relevance });
  }

  // 9. Lane-Specific Signal Evaluation
  const text = a.text;
  let lanePass = false;
  let extra: Partial<LaneVerdict> = {};

  switch (lane.validator) {
    case "SUBMISSION": {
      const s = hits(text, SUBMISSION_SIGNALS);
      signals.push(...s.map((x) => `submit:${x}`));
      // Require directory intent AND at least 1 positive directory submission phrase
      lanePass = intentResult.intent === "BUSINESS_DIRECTORY" && s.length > 0;
      if (!lanePass) {
        if (intentResult.intent !== "BUSINESS_DIRECTORY") reasons.push("NOT_A_BUSINESS_DIRECTORY");
        if (s.length === 0) reasons.push("NO_SUBMISSION_SIGNAL");
      }
      break;
    }

    case "CONTRIBUTION": {
      const s = hits(text, CONTRIBUTION_SIGNALS);
      const head = `${a.title} ${a.metaDescription} ${a.finalUrl || ""}`.toLowerCase().replace(/[-_/]+/g, " ");
      const headHits = hits(head, [...CONTRIBUTION_SIGNALS, "contribute", "contributor", "guest post", "write for"]);
      signals.push(...s.map((x) => `contrib:${x}`), ...headHits.map((x) => `contrib-head:${x}`));
      lanePass = intentResult.intent === "EDITORIAL_GUIDELINES" && (headHits.length > 0 || s.length >= 2);
      if (!lanePass) {
        if (intentResult.intent !== "EDITORIAL_GUIDELINES") reasons.push("NOT_EDITORIAL_GUIDELINES");
        reasons.push(s.length === 1 ? "WEAK_CONTRIBUTOR_SIGNAL" : "NO_CONTRIBUTOR_SIGNAL");
      }
      break;
    }

    case "PR_REQUEST": {
      const s = hits(text, PR_SIGNALS);
      signals.push(...s.map((x) => `pr:${x}`));
      lanePass = s.length > 0;
      if (!lanePass) reasons.push("NO_JOURNALIST_REQUEST_SIGNAL");
      break;
    }

    case "COMMUNITY": {
      const domainMatch = COMMUNITY_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`) || host.startsWith(d));
      const s = hits(text, COMMUNITY_SIGNALS);
      signals.push(...s.slice(0, 5).map((x) => `community:${x}`));
      lanePass = domainMatch || s.length >= 3;
      if (!lanePass) reasons.push("NOT_A_COMMUNITY_PAGE");
      if (lanePass && baseLinkType === "UNKNOWN") extra.linkType = "UNKNOWN";
      break;
    }

    case "PARTNERSHIP": {
      const s = hits(text, PARTNERSHIP_SIGNALS);
      signals.push(...s.map((x) => `partner:${x}`));
      lanePass = intentResult.intent === "PARTNERSHIP_PAGE" && s.length > 0;
      if (!lanePass) {
        if (intentResult.intent !== "PARTNERSHIP_PAGE") reasons.push("NOT_A_PARTNERSHIP_PAGE");
        if (s.length === 0) reasons.push("NO_PARTNER_PROGRAM_SIGNAL");
      }
      break;
    }

    case "RESOURCE": {
      const s = hits(`${a.title.toLowerCase()} ${(a.finalUrl || "").toLowerCase()}`, RESOURCE_SIGNALS);
      const uniqueHosts = new Set(a.outboundLinks.map((l) => l.host)).size;
      signals.push(`outbound_hosts:${uniqueHosts}`, ...s.map((x) => `resource:${x}`));
      lanePass = s.length > 0 && uniqueHosts >= 10;
      if (!lanePass) reasons.push(s.length === 0 ? "NOT_A_RESOURCE_PAGE" : `TOO_FEW_OUTBOUND_LINKS:${uniqueHosts}`);
      break;
    }

    case "BROKEN_LINK": {
      const s = hits(`${a.title.toLowerCase()} ${(a.finalUrl || "").toLowerCase()}`, RESOURCE_SIGNALS);
      const uniq = new Map<string, { href: string; anchor: string }>();
      for (const l of a.outboundLinks) {
        if (!uniq.has(l.href) && !/facebook|twitter|x\.com|linkedin|instagram|youtube|pinterest|whatsapp/i.test(l.host)) {
          uniq.set(l.href, { href: l.href, anchor: l.anchor });
        }
      }
      const toCheck = Array.from(uniq.values()).slice(0, ctx.brokenLinkCheckLimit ?? 25);
      const statuses = await mapLimit(toCheck, 6, async (l) => ({ ...l, status: await checkUrlStatus(l.href, 7000) }));
      const broken = statuses.filter((x) => x.status === 0 || x.status === 404 || x.status === 410 || x.status >= 500);
      signals.push(`outbound_checked:${toCheck.length}`, `broken:${broken.length}`);
      extra.brokenLinks = broken.map((b) => ({ href: b.href, status: b.status, anchor: b.anchor }));
      lanePass = s.length > 0 && broken.length > 0;
      if (!lanePass) reasons.push(s.length === 0 ? "NOT_A_RESOURCE_PAGE" : "NO_BROKEN_OUTBOUND_LINKS_FOUND");
      break;
    }

    case "UNLINKED_MENTION": {
      if (!a.brandMentioned) {
        reasons.push("BRAND_NOT_MENTIONED_ON_PAGE");
        lanePass = false;
      } else if (a.dgsLinks.length > 0) {
        reasons.push("ALREADY_LINKS_TO_DGS");
        signals.push(`dgs_links:${a.dgsLinks.length}`);
        lanePass = false;
      } else {
        signals.push("brand_mentioned_without_link");
        lanePass = true;
      }
      break;
    }

    case "COMPETITOR_GAP": {
      const comps = (ctx.competitorDomains || []).map((d) => d.toLowerCase().replace(/^www\./, ""));
      const compLinks = a.outboundLinks.filter((l) => comps.some((c) => l.host.replace(/^www\./, "") === c)).map((l) => l.href);
      extra.competitorLinks = Array.from(new Set(compLinks)).slice(0, 10);
      lanePass = compLinks.length > 0 && a.dgsLinks.length === 0;
      if (!lanePass) reasons.push(compLinks.length === 0 ? "NO_COMPETITOR_LINK" : "ALREADY_LINKS_TO_DGS");
      break;
    }
  }

  // 10. Actionability Test (V8.12.7A)
  const act = evaluateActionability({
    url: a.finalUrl || a.url,
    title: a.title,
    laneId: lane.id,
    pageIntent: intentResult.intent,
    hasForm: a.hasForm,
    formCount: a.formCount,
    text: a.text,
    signals,
    relevanceScore: relevance,
  });

  extra.actionRequired = act.actionRequired;
  extra.actionDestination = act.actionDestination;
  extra.actionabilityScore = act.actionabilityScore;
  extra.actionableEvidence = act.evidence;
  extra.confidence = act.confidence;

  if (a.noindex) signals.push("page_noindex");

  // Only qualify if lane passed AND actionability is HIGH or MEDIUM
  if (lanePass && act.actionable) {
    reasons.push("PASSED_LANE_VALIDATOR");
    return verdict("QUALIFIED", {
      freeStatus,
      relevance,
      confidence: act.confidence,
      actionRequired: act.actionRequired,
      actionDestination: act.actionDestination,
      actionabilityScore: act.actionabilityScore,
      actionableEvidence: act.evidence,
      ...extra,
    });
  }

  // If lane had partial signals but failed actionability, send to Needs Verification (SEO Analyst queue)
  if (lanePass && !act.actionable) {
    reasons.push("NO_ACTIONABLE_OPPORTUNITY");
    reasons.push(...act.reasons);
    return verdict("DISCOVERED", {
      freeStatus,
      relevance,
      confidence: act.confidence,
      actionRequired: act.actionRequired,
      actionDestination: act.actionDestination,
      actionabilityScore: act.actionabilityScore,
      actionableEvidence: act.evidence,
      needsVerification: true,
      ...extra,
    });
  }

  // Failed lane requirements
  return verdict("REJECTED", {
    freeStatus,
    relevance,
    confidence: act.confidence,
    actionRequired: act.actionRequired,
    actionDestination: act.actionDestination,
    actionabilityScore: act.actionabilityScore,
    actionableEvidence: act.evidence,
    ...extra,
  });
}
