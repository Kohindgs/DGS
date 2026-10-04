import { randomUUID } from "node:crypto";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "./db";
import type {
  AuthorityOpportunityType,
  OffPageAuthorityOpportunity,
  PriorityTier,
  RegionCode,
} from "./types";

/**
 * Scans the database and live states to synthesize all Types A through T Authority Opportunities.
 */
export async function getDetectedAuthorityOpportunities(filters?: {
  region?: RegionCode;
  type?: AuthorityOpportunityType;
  priorityTier?: PriorityTier;
}): Promise<OffPageAuthorityOpportunity[]> {
  await ensureOffPageTablesExist();

  const results: OffPageAuthorityOpportunity[] = [];

  // A. Competitor Gap Opportunities
  const { rows: compGaps } = await cmsQuery<{
    id: string;
    competitor_domain: string;
    source_domain: string;
    source_url: string;
    target_page_type: string;
    region: RegionCode;
    relevance_score: number;
    quality_score: number;
    difficulty_score: number;
  }>(`SELECT * FROM off_page_competitor_gaps WHERE status = 'IDENTIFIED' LIMIT 15`);

  for (const g of compGaps) {
    results.push({
      id: `auth_gap_${g.id}`,
      type: "COMPETITOR_GAP",
      title: `Competitor Link Gap: ${g.competitor_domain} listed on ${g.source_domain}`,
      description: `Competitor ${g.competitor_domain} has an active backlink on ${g.source_domain}. DGS has equivalent service offering.`,
      source_name: g.source_domain,
      source_url: g.source_url,
      target_page: g.target_page_type === "HOMEPAGE" ? "https://www.dgeniussolutions.com/" : "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
      region: g.region,
      priority_tier: g.quality_score >= 85 ? "P0" : "P1",
      authority_score: g.quality_score,
      signals: { seo: true, aeo: true, geo: true, llm: true },
      action_cta: "Create Competitor Gap Outreach Pitch",
    });
  }

  // B. Unlinked Brand Mentions
  const { rows: unlinkedMentions } = await cmsQuery<{
    id: string;
    brand_query: string;
    mention_url: string;
    mention_title: string;
    snippet: string;
  }>(`SELECT * FROM off_page_brand_mentions WHERE is_linked = 0 AND status = 'NEW' LIMIT 10`);

  for (const m of unlinkedMentions) {
    results.push({
      id: `auth_mention_${m.id}`,
      type: "UNLINKED_MENTION_RECLAIM",
      title: `Unlinked Mention on ${new URL(m.mention_url).hostname}`,
      description: `Author cited '${m.brand_query}' in '${m.mention_title || "article"}' without linking to DGS.`,
      source_name: new URL(m.mention_url).hostname,
      source_url: m.mention_url,
      target_page: "https://www.dgeniussolutions.com/",
      region: "GLOBAL",
      priority_tier: "P0",
      authority_score: 92,
      signals: { seo: true, aeo: true, geo: true, llm: true },
      action_cta: "Send Unlinked Mention Reclamation Email",
    });
  }

  // I. Lost Link Reclaim Opportunities
  const { rows: lostLinks } = await cmsQuery<{
    id: string;
    source_domain: string;
    source_url: string;
    target_url: string;
    anchor_text: string;
    source_region: RegionCode;
    authority_score: number;
  }>(`SELECT * FROM off_page_backlinks WHERE status = 'LOST' LIMIT 10`);

  for (const l of lostLinks) {
    results.push({
      id: `auth_lost_${l.id}`,
      type: "LOST_LINK_RECLAIM",
      title: `Lost Link Reclaim: ${l.source_domain}`,
      description: `Previously active backlink with anchor '${l.anchor_text}' was dropped or removed from ${l.source_domain}.`,
      source_name: l.source_domain,
      source_url: l.source_url,
      target_page: l.target_url,
      region: l.source_region,
      priority_tier: "P0",
      authority_score: l.authority_score || 85,
      signals: { seo: true, aeo: false, geo: false, llm: false },
      action_cta: "Launch Reclaim Outreach",
    });
  }

  // T. Citation NAP Corrections
  const { rows: badCitations } = await cmsQuery<{
    id: string;
    platform_name: string;
    listing_url: string;
    region: RegionCode;
    nap_issues: string;
  }>(`SELECT * FROM off_page_citations WHERE nap_status != 'CONSISTENT' LIMIT 5`);

  for (const c of badCitations) {
    results.push({
      id: `auth_cit_${c.id}`,
      type: "CITATION_CORRECTION",
      title: `NAP Discrepancy on ${c.platform_name}`,
      description: `Listing data issue detected: ${c.nap_issues || "Inconsistent phone or address"}. Correcting strengthens local entity authority.`,
      source_name: c.platform_name,
      source_url: c.listing_url || "https://" + c.platform_name.toLowerCase().replace(/\s+/g, "") + ".com",
      target_page: "https://www.dgeniussolutions.com/",
      region: c.region,
      priority_tier: "P1",
      authority_score: 85,
      signals: { seo: true, aeo: true, geo: true, llm: true },
      action_cta: "Submit NAP Update",
    });
  }

  // M. Digital PR & Expert Quotes (Connectively, Featured, Qwoted)
  const { rows: prOpps } = await cmsQuery<{
    id: string;
    site_name: string;
    exact_submission_url: string;
    region: RegionCode;
    recommended_dgs_target_page: string;
    authority_score: number;
    category: string;
  }>(`SELECT * FROM off_page_opportunities WHERE category IN ('DIGITAL_PR', 'EXPERT_CONTRIBUTION') AND status IN ('NEW', 'QUALIFIED', 'APPROVED') LIMIT 10`);

  for (const pr of prOpps) {
    results.push({
      id: `auth_pr_${pr.id}`,
      type: pr.category === "EXPERT_CONTRIBUTION" ? "EXPERT_QUOTE" : "DIGITAL_PR",
      title: `Expert Contribution Pitch: ${pr.site_name}`,
      description: `High-authority journalist/contributor outlet accepting expert quotes for AI, SEO, and video marketing.`,
      source_name: pr.site_name,
      source_url: pr.exact_submission_url,
      target_page: pr.recommended_dgs_target_page,
      region: pr.region,
      priority_tier: "P0",
      authority_score: pr.authority_score,
      signals: { seo: true, aeo: true, geo: true, llm: true },
      opportunity_id: pr.id,
      action_cta: "Draft Expert Pitch",
    });
  }

  // N. Podcast Guest Opportunities
  const { rows: podcastOpps } = await cmsQuery<{
    id: string;
    site_name: string;
    exact_submission_url: string;
    region: RegionCode;
    authority_score: number;
  }>(`SELECT * FROM off_page_opportunities WHERE category = 'PODCAST' AND status IN ('NEW', 'QUALIFIED') LIMIT 5`);

  for (const pod of podcastOpps) {
    results.push({
      id: `auth_pod_${pod.id}`,
      type: "PODCAST",
      title: `Podcast Guest Interview: ${pod.site_name}`,
      description: `Podcast community matching tech leaders on AI video production and next-gen search intelligence.`,
      source_name: pod.site_name,
      source_url: pod.exact_submission_url,
      target_page: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
      region: pod.region,
      priority_tier: "P1",
      authority_score: pod.authority_score,
      signals: { seo: true, aeo: true, geo: false, llm: true },
      opportunity_id: pod.id,
      action_cta: "Apply as Guest Speaker",
    });
  }

  // S. Target Page Authority Gaps
  const { rows: underPages } = await cmsQuery<{
    id: string;
    page_url: string;
    page_title: string;
    status: string;
  }>(`SELECT * FROM off_page_target_pages WHERE status IN ('UNDER_SUPPORTED', 'URGENT') LIMIT 5`);

  for (const p of underPages) {
    results.push({
      id: `auth_page_${p.id}`,
      type: "TARGET_PAGE_AUTHORITY_GAP",
      title: `Strategic Page Authority Deficit: ${p.page_title}`,
      description: `Page ${p.page_url} has fewer referring domains than ranking competitors. Requires targeted niche citations and outreach.`,
      source_name: "Internal Authority Engine",
      source_url: p.page_url,
      target_page: p.page_url,
      region: p.page_url.includes("dubai") ? "UAE" : p.page_url.includes("mumbai") ? "INDIA" : "GLOBAL",
      priority_tier: "P0",
      authority_score: 90,
      signals: { seo: true, aeo: true, geo: true, llm: true },
      action_cta: "View Filtered Opportunities for this URL",
    });
  }

  // Filter if requested
  let filtered = results;
  if (filters?.region) {
    filtered = filtered.filter((r) => r.region === filters.region || r.region === "GLOBAL");
  }
  if (filters?.type) {
    filtered = filtered.filter((r) => r.type === filters.type);
  }
  if (filters?.priorityTier) {
    filtered = filtered.filter((r) => r.priority_tier === filters.priorityTier);
  }

  return filtered;
}

/**
 * Seeds initial competitor sets and competitor gaps if empty.
 */
export async function seedCompetitorsIfEmpty(): Promise<number> {
  await ensureOffPageTablesExist();

  const { rows: countRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_competitor_domains`
  );
  if (Number(countRows[0]?.total || 0) > 0) return 0;

  const COMPETITORS = [
    // India
    { name: "Schbang Mumbai", domain: "schbang.com", region: "INDIA" as RegionCode, niche: "Creative & Digital Agency", domains: 850 },
    { name: "FoxyMoron India", domain: "foxymoron.in", region: "INDIA" as RegionCode, niche: "Content & Video Production", domains: 620 },
    { name: "Performics India", domain: "performics.com", region: "INDIA" as RegionCode, niche: "Performance Marketing & SEO", domains: 1200 },
    { name: "Social Panga", domain: "socialpanga.com", region: "INDIA" as RegionCode, niche: "Social & Video Marketing", domains: 480 },
    // UAE
    { name: "TishTash Communications Dubai", domain: "tishtash.com", region: "UAE" as RegionCode, niche: "PR & Digital Media UAE", domains: 410 },
    { name: "Chain Reaction Dubai", domain: "chainreaction.ae", region: "UAE" as RegionCode, niche: "SEO & Performance Marketing GCC", domains: 590 },
    { name: "Seven Media Dubai", domain: "sevenmedia.ae", region: "UAE" as RegionCode, niche: "Media Production & Video Dubai", domains: 380 },
    // USA
    { name: "Single Grain", domain: "singlegrain.com", region: "USA" as RegionCode, niche: "Digital Marketing & AI SEO", domains: 3400 },
    { name: "WebFX", domain: "webfx.com", region: "USA" as RegionCode, niche: "Full-Service SEO & Web Agency", domains: 9200 },
    { name: "VaynerMedia", domain: "vaynermedia.com", region: "USA" as RegionCode, niche: "Social Video & Creative Production", domains: 4800 },
  ];

  for (const c of COMPETITORS) {
    const id = `cmp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_competitor_domains (id, competitor_name, domain, region, primary_niche, tracked_since, estimated_referring_domains, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 'ACTIVE', NOW())`,
      [id, c.name, c.domain, c.region, c.niche, c.domains]
    );
  }

  return COMPETITORS.length;
}

/**
 * Seeds target pages with realistic baseline metrics if empty.
 */
export async function seedTargetPagesIfEmpty(): Promise<number> {
  await ensureOffPageTablesExist();

  const { rows: countRows } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_target_pages`
  );
  if (Number(countRows[0]?.total || 0) > 0) return 0;

  const TARGET_PAGES = [
    { url: "https://www.dgeniussolutions.com/", title: "DGS Homepage & Brand Entity", type: "HOMEPAGE", focus: "Full-Service Digital Agency & Brand", tier: "P0", goal: 100, status: "HEALTHY" },
    { url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/", title: "AI Video Production Agency Mumbai", type: "SERVICE_PAGE", focus: "AI Commercials & Video Content", tier: "P0", goal: 80, status: "HEALTHY" },
    { url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/", title: "SEO Services in Mumbai", type: "SERVICE_PAGE", focus: "Enterprise Organic Search", tier: "P0", goal: 60, status: "HEALTHY" },
    { url: "https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/", title: "AEO Services in Mumbai", type: "SERVICE_PAGE", focus: "Answer Engine Optimization", tier: "P0", goal: 50, status: "STRONG" },
    { url: "https://www.dgeniussolutions.com/services/geo/", title: "GEO Services", type: "SERVICE_PAGE", focus: "Generative Engine Optimization", tier: "P0", goal: 50, status: "HEALTHY" },
    { url: "https://www.dgeniussolutions.com/services/llm-seo-service/", title: "LLM SEO Services", type: "SERVICE_PAGE", focus: "Large Language Model Visibility", tier: "P0", goal: 50, status: "UNDER_SUPPORTED" },
    { url: "https://www.dgeniussolutions.com/services/performance-marketing/", title: "Performance Marketing Agency", type: "SERVICE_PAGE", focus: "Paid Ads & ROI Conversion", tier: "P1", goal: 40, status: "UNDER_SUPPORTED" },
    { url: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/", title: "AI Production Agency in Dubai", type: "SERVICE_PAGE", focus: "UAE Creative Video & Media", tier: "P0", goal: 75, status: "UNDER_SUPPORTED" },
    { url: "https://www.dgeniussolutions.com/services/website-design-development/", title: "Web Design & Development Agency", type: "SERVICE_PAGE", focus: "UX/UI & Web Development", tier: "P1", goal: 40, status: "HEALTHY" },
    { url: "https://www.dgeniussolutions.com/blogs/", title: "DGS Marketing & AI Intelligence Blog", type: "BLOG", focus: "Thought Leadership & Research", tier: "P1", goal: 60, status: "HEALTHY" },
  ];

  for (const tp of TARGET_PAGES) {
    const id = `tp_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await cmsExecute(
      `INSERT INTO off_page_target_pages (id, page_url, page_title, target_page_type, primary_focus, priority_tier, target_backlinks_goal, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, tp.url, tp.title, tp.type, tp.focus, tp.tier, tp.goal, tp.status]
    );
  }

  return TARGET_PAGES.length;
}

/**
 * Seeds initial brand mentions and citation records if empty.
 * Zero-demo: synthetic brand mentions are permanently removed.
 */
export async function seedMentionsAndCitationsIfEmpty(): Promise<void> {
  await ensureOffPageTablesExist();

  const { rows: citationCount } = await cmsQuery<{ total: number }>(
    `SELECT COUNT(*) as total FROM off_page_citations`
  );
  if (Number(citationCount[0]?.total || 0) === 0) {
    const CITATIONS = [
      { platform: "Google Business Profile Mumbai", url: "https://maps.google.com/?cid=101010", region: "INDIA" as RegionCode, country: "India", nap: "CONSISTENT", issues: null },
      { platform: "Justdial Khar West", url: "https://www.justdial.com/Mumbai/DGenius-Solutions", region: "INDIA" as RegionCode, country: "India", nap: "CONSISTENT", issues: null },
      { platform: "IndiaMART Verified Supplier", url: "https://www.indiamart.com/dgeniussolutions/", region: "INDIA" as RegionCode, country: "India", nap: "CONSISTENT", issues: null },
      { platform: "Google Business Profile Dubai", url: "https://maps.google.com/?cid=202020", region: "UAE" as RegionCode, country: "United Arab Emirates", nap: "CONSISTENT", issues: null },
      { platform: "Yellow Pages UAE", url: "https://www.yellowpages.ae/dgeniussolutions", region: "UAE" as RegionCode, country: "United Arab Emirates", nap: "INCONSISTENT", issues: "Missing suite number in Khar West secondary address" },
      { platform: "Better Business Bureau USA", url: "https://www.bbb.org/profile/dgeniussolutions", region: "USA" as RegionCode, country: "United States", nap: "CONSISTENT", issues: null },
    ];

    for (const c of CITATIONS) {
      const id = `cit_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      await cmsExecute(
        `INSERT INTO off_page_citations (id, platform_name, listing_url, region, country, business_name_displayed, website_displayed, phone_displayed, location_displayed, nap_status, nap_issues, last_audited_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'D\\'Genius Solutions', 'https://www.dgeniussolutions.com', '+91 99999 99999', 'Khar West, Mumbai, Maharashtra, India', ?, ?, NOW(), 'ACTIVE', NOW())`,
        [id, c.platform, c.url, c.region, c.country, c.nap, c.issues]
      );
    }
  }
}
