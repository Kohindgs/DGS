/**
 * V8.12.6 lane validators + qualification gate.
 *
 * Input: a live PageAnalysis (real fetch). Output: an evidence-backed verdict.
 * A candidate is QUALIFIED only when:
 *   HTTP 2xx  AND  passes its lane validator  AND  not paid-only  AND  not geo/spam blocked
 *   AND  DGS-topic relevant  (semantic duplicates are handled at ingest).
 * Everything else is recorded as DISCOVERED (needs human look) or REJECTED with explicit reasons.
 */
import type { FreeStatus, LinkTypeStatus, RegionCode } from "../types";
import type { LaneDefinition } from "./config";
import { checkUrlStatus, mapLimit, type PageAnalysis } from "./page-analyzer";

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
}

const SUBMISSION_SIGNALS = [
  "add your business", "list your business", "add a business", "add business", "add listing", "add your listing",
  "submit your business", "submit your company", "submit company", "add your company", "add company", "list your company",
  "list your agency", "add your agency", "submit your agency", "get listed", "claim your listing", "claim your business",
  "claim this business", "register your business", "register your company", "free listing", "create a free profile",
  "create your profile", "create a profile", "create company profile", "sign up your business", "join the directory",
  "submit listing", "submit a listing", "add your firm", "submit your site", "submit website", "list your firm",
];
const CONTRIBUTION_SIGNALS = [
  "write for us", "guest post guidelines", "guest posting guidelines", "submit a guest post", "guest contributor",
  "become a contributor", "contributor guidelines", "submission guidelines", "submit an article", "submit your article",
  "pitch us", "pitch your", "we accept guest", "accepting guest", "guest author", "editorial guidelines",
  "contributor program", "contribute an article", "expert contributor", "share your expertise",
];
const PR_SIGNALS = [
  "journalist request", "journalist requests", "media request", "source request", "sources wanted", "looking for experts",
  "expert sources", "seeking experts", "seeking sources", "#journorequest", "journorequest", "press request",
  "reporter request", "media opportunities", "expert commentary", "quote request", "respond to journalists",
  "connect with journalists", "pr opportunities",
];
const COMMUNITY_SIGNALS = [
  "forum", "community", "discussion", "threads", "replies", "ask a question", "answers", "members", "join the conversation",
  "posted by", "reply", "upvote",
];
const COMMUNITY_DOMAINS = [
  "reddit.com", "quora.com", "stackexchange.com", "stackoverflow.com", "indiehackers.com", "growthhackers.com",
  "warriorforum.com", "digitalpoint.com", "community.hubspot.com", "producthunt.com", "dev.to", "hashnode.com",
  "linkedin.com", "medium.com", "moz.com", "webmasterworld.com", "sitepoint.com", "community.",
];
const PARTNERSHIP_SIGNALS = [
  "partner program", "partner programme", "become a partner", "agency partner", "partner directory", "referral partner",
  "reseller program", "solutions partner", "certified partner", "partner network", "apply to become a partner",
];
const RESOURCE_SIGNALS = ["resources", "useful links", "recommended", "tools", "further reading", "helpful links", "resource list", "directory of"];

const PAID_ONLY_SIGNALS = [
  "paid guest post", "sponsored post price", "price per post", "per post price", "submission fee", "listing fee",
  "paid listing only", "buy guest post", "guest post price", "pricing per article", "only paid listings",
  "sponsored articles only", "we charge", "fee for publishing", "publication fee",
];
const PAID_SOFT_SIGNALS = ["premium listing", "featured listing", "paid plan", "pricing", "upgrade to premium", "sponsored post"];
const FREE_SIGNALS = ["free listing", "free profile", "list for free", "free of charge", "it's free", "it’s free", "100% free", "free to join", "free basic listing", "free submission", "no fee", "free registration", "sign up free", "join free"];

const SPAM_TERMS = ["casino", "betting", "escort", "viagra", "cialis", "payday loan", "porn", "xxx", "gambling", "crypto pump", "replica watches", "essay writing service"];
const BLOCKED_TLDS = [".cn", ".ru", ".su", ".by", ".xyz", ".top", ".click", ".loan", ".work"];
const BLOCKED_LANGS = ["zh", "ru"];

const TOPIC_TERMS = [
  "seo", "search engine", "digital marketing", "marketing", "advertising", "ai ", "artificial intelligence", "generative",
  "video production", "video", "web development", "website", "web design", "agency", "agencies", "brand", "business",
  "startup", "technology", "content", "social media", "ecommerce", "e-commerce", "growth", "answer engine", "geo ",
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
  /** Max outbound links to HEAD-check for broken-link lane. */
  brokenLinkCheckLimit?: number;
}

/** Applies geo/spam/HTTP gates + the lane-specific validator. */
export async function validateForLane(a: PageAnalysis, lane: LaneDefinition, ctx: ValidateContext): Promise<LaneVerdict> {
  const reasons: string[] = [];
  const signals: string[] = [];
  const host = hostOf(a.finalUrl || a.url);
  const region = a.fetched && a.httpStatus && a.httpStatus < 400 ? classifyRegion(a, ctx.queryRegion) : ctx.queryRegion;
  const linkNA = !!lane.linkNotApplicable;
  const baseLinkType: LinkTypeStatus = a.dgsLinks.length > 0 ? a.dgsLinkType : linkNA ? "N/A" : "UNKNOWN";

  const verdict = (decision: LaneVerdict["decision"], extra: Partial<LaneVerdict> = {}): LaneVerdict => ({
    decision,
    reasons,
    signals,
    freeStatus: "UNKNOWN",
    linkType: baseLinkType,
    region,
    relevance: 0,
    ...extra,
  });

  // 1. HTTP gate
  if (!a.fetched) {
    reasons.push(a.error || "UNREACHABLE");
    return verdict("REJECTED");
  }
  if (!a.httpStatus || a.httpStatus < 200 || a.httpStatus >= 300) {
    reasons.push(`HTTP_${a.httpStatus ?? 0}`);
    // 403/429 = bot-protected; the page may exist. Keep for human check, never qualify.
    return verdict(a.httpStatus === 403 || a.httpStatus === 429 ? "DISCOVERED" : "REJECTED");
  }
  if (a.error) {
    reasons.push(a.error);
    return verdict("REJECTED");
  }

  // 2. Geo / spam gate
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
  const spam = hits(`${a.title} ${a.metaDescription} ${a.text.slice(0, 50000)}`, SPAM_TERMS);
  if (spam.length >= 2) {
    reasons.push(`SPAM_TERMS:${spam.join("|")}`);
    return verdict("REJECTED");
  }

  // 3. Free / paid
  const free = classifyFree(a);
  signals.push(...free.signals);
  const freeStatus = linkNA && free.status === "UNKNOWN" ? "UNKNOWN" : free.status;
  if (freeStatus === "NOT_FREE") {
    reasons.push("PAID_ONLY");
    return verdict("REJECTED", { freeStatus });
  }

  // 4. Relevance (keyword evidence on the live page)
  const topicHits = hits(` ${a.title.toLowerCase()} ${a.metaDescription.toLowerCase()} ${a.text.slice(0, 60000)} `, TOPIC_TERMS);
  const relevance = Math.min(100, topicHits.length * 12);
  if (topicHits.length > 0) signals.push(`topics:${topicHits.slice(0, 6).join("|")}`);

  // 5. Lane validator
  const text = a.text;
  let lanePass = false;
  let extra: Partial<LaneVerdict> = {};

  switch (lane.validator) {
    case "SUBMISSION": {
      const s = hits(text, SUBMISSION_SIGNALS);
      signals.push(...s.map((x) => `submit:${x}`));
      lanePass = s.length > 0;
      if (!lanePass) reasons.push("NO_SUBMISSION_SIGNAL");
      break;
    }
    case "CONTRIBUTION": {
      const s = hits(text, CONTRIBUTION_SIGNALS);
      const head = `${a.title} ${a.metaDescription} ${a.finalUrl || ""}`.toLowerCase().replace(/[-_/]+/g, " ");
      const headHits = hits(head, [...CONTRIBUTION_SIGNALS, "contribute", "contributor", "guest post", "write for"]);
      signals.push(...s.map((x) => `contrib:${x}`), ...headHits.map((x) => `contrib-head:${x}`));
      lanePass = headHits.length > 0 || s.length >= 2;
      if (!lanePass) reasons.push(s.length === 1 ? "WEAK_CONTRIBUTOR_SIGNAL" : "NO_CONTRIBUTOR_SIGNAL");
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
      if (lanePass && baseLinkType === "UNKNOWN") extra.linkType = "UNKNOWN"; // UGC only once observed
      break;
    }
    case "PARTNERSHIP": {
      const s = hits(text, PARTNERSHIP_SIGNALS);
      signals.push(...s.map((x) => `partner:${x}`));
      lanePass = s.length > 0;
      if (!lanePass) reasons.push("NO_PARTNER_PROGRAM_SIGNAL");
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
        reasons.push("ALREADY_LINKS_TO_DGS"); // this is a backlink, handled by the backlink pipeline
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

  if (a.noindex) signals.push("page_noindex");

  // Brand-mention lane is relevant by definition; citations need only basic business relevance.
  const relevant = lane.validator === "UNLINKED_MENTION" || relevance >= 12;
  if (!relevant) reasons.push("NOT_DGS_RELEVANT");

  if (lanePass && relevant) {
    reasons.push("PASSED_LANE_VALIDATOR");
    return verdict("QUALIFIED", { freeStatus, relevance, ...extra });
  }
  // Reachable but failing the lane rule: keep as a raw candidate only when it is at least relevant.
  return verdict(relevant ? "DISCOVERED" : "REJECTED", { freeStatus, relevance, ...extra });
}
