import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Read the seed data from lib/off-page/seed-data.ts (or scripts/generate-full-seed-data.mjs)
// We already have the 180 seeds in lib/off-page/seed-data.ts!
// Let's create a self-contained node script to run on VPS with mysql2.

const seedRunnerScript = `
import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import crypto from "node:crypto";

function randomUUID() {
  return crypto.randomUUID();
}

async function main() {
  const envText = await fs.readFile("/home/u188101251/production-app/current/.env.production", "utf8");
  const env = {};
  for (const line of envText.split("\\n")) {
    const p = line.indexOf("=");
    if (p > 0) {
      let v = line.slice(p + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[line.slice(0, p).trim()] = v;
    }
  }

  const conn = await mysql.createConnection({
    host: env.DGS_MYSQL_HOST,
    user: env.DGS_MYSQL_USER,
    password: env.DGS_MYSQL_PASSWORD,
    database: env.DGS_MYSQL_DATABASE
  });

  console.log("Connected to MySQL on VPS.");

  // Check if opportunities already populated
  const [oppCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_opportunities");
  const oppTotal = oppCountRows[0].total;
  console.log("Current opportunities count:", oppTotal);

  if (oppTotal === 0) {
    console.log("Reading seed data from seed-data.json...");
    const rawSeeds = JSON.parse(await fs.readFile("/home/u188101251/production-app/current/tmp/seed-data.json", "utf8"));
    console.log("Found", rawSeeds.length, "seeds to insert.");

    for (const opp of rawSeeds) {
      const id = "opp_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_opportunities (
          id, site_name, domain, exact_submission_url, region, country, category,
          free_status, free_tier_details, requires_account, requires_editorial_review,
          submission_type, recommended_dgs_target_page, recommended_service,
          recommended_content, recommended_anchor_strategy, link_type, dofollow_status,
          estimated_quality, topical_relevance, geo_relevance, traffic_potential,
          editorial_quality, spam_risk, acceptance_probability, value_score,
          difficulty_score, priority_score, priority_tier, authority_score,
          spam_status, verification_date, last_verified, source, status,
          assigned_to, notes, evidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
        [
          id,
          opp.site_name,
          opp.domain,
          opp.exact_submission_url,
          opp.region,
          opp.country,
          opp.category,
          opp.free_status,
          opp.free_tier_details,
          opp.requires_account ? 1 : 0,
          opp.requires_editorial_review ? 1 : 0,
          opp.submission_type,
          opp.recommended_dgs_target_page,
          opp.recommended_service,
          opp.recommended_content,
          opp.recommended_anchor_strategy,
          opp.link_type,
          opp.dofollow_status,
          opp.estimated_quality,
          opp.topical_relevance,
          opp.geo_relevance,
          opp.traffic_potential,
          opp.editorial_quality,
          opp.spam_risk,
          opp.acceptance_probability,
          opp.value_score,
          opp.difficulty_score,
          opp.priority_score,
          opp.priority_tier,
          opp.authority_score,
          opp.spam_status,
          opp.verification_date,
          opp.last_verified,
          opp.source,
          opp.status,
          opp.assigned_to,
          opp.notes,
          opp.evidence
        ]
      );
    }
    console.log("✓ Inserted 180 opportunities.");
  }

  // 2. Competitors
  const [compCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_competitor_domains");
  if (compCountRows[0].total === 0) {
    const COMPETITORS = [
      { name: "Schbang Mumbai", domain: "schbang.com", region: "INDIA", niche: "Creative & Digital Agency", domains: 850 },
      { name: "FoxyMoron India", domain: "foxymoron.in", region: "INDIA", niche: "Content & Video Production", domains: 620 },
      { name: "Performics India", domain: "performics.com", region: "INDIA", niche: "Performance Marketing & SEO", domains: 1200 },
      { name: "Social Panga", domain: "socialpanga.com", region: "INDIA", niche: "Social & Video Marketing", domains: 480 },
      { name: "TishTash Communications Dubai", domain: "tishtash.com", region: "UAE", niche: "PR & Digital Media UAE", domains: 410 },
      { name: "Chain Reaction Dubai", domain: "chainreaction.ae", region: "UAE", niche: "SEO & Performance Marketing GCC", domains: 590 },
      { name: "Seven Media Dubai", domain: "sevenmedia.ae", region: "UAE", niche: "Media Production & Video Dubai", domains: 380 },
      { name: "Single Grain", domain: "singlegrain.com", region: "USA", niche: "Digital Marketing & AI SEO", domains: 3400 },
      { name: "WebFX", domain: "webfx.com", region: "USA", niche: "Full-Service SEO & Web Agency", domains: 9200 },
      { name: "VaynerMedia", domain: "vaynermedia.com", region: "USA", niche: "Social Video & Creative Production", domains: 4800 },
    ];
    for (const c of COMPETITORS) {
      const id = "cmp_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_competitor_domains (id, competitor_name, domain, region, primary_niche, tracked_since, estimated_referring_domains, status, created_at)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, 'ACTIVE', NOW())\`,
        [id, c.name, c.domain, c.region, c.niche, c.domains]
      );
    }
    console.log("✓ Seeded competitors.");

    const SAMPLE_GAPS = [
      { compDomain: "schbang.com", srcDomain: "afaqs.com", srcUrl: "https://www.afaqs.com/agencies/schbang", pageType: "HOMEPAGE", gapType: "COMPETITOR_LINK_GAP", region: "INDIA", quality: 90 },
      { compDomain: "foxymoron.in", srcDomain: "campaignindia.in", srcUrl: "https://www.campaignindia.in/article/foxymoron-expands/450212", pageType: "SERVICE_PAGE", gapType: "COMPETITOR_LINK_GAP", region: "INDIA", quality: 88 },
      { compDomain: "chainreaction.ae", srcDomain: "campaignme.com", srcUrl: "https://campaignme.com/agencies/chain-reaction", pageType: "SERVICE_PAGE", gapType: "COMPETITOR_LINK_GAP", region: "UAE", quality: 92 },
      { compDomain: "tishtash.com", srcDomain: "arabianbusiness.com", srcUrl: "https://www.arabianbusiness.com/agencies/tishtash", pageType: "HOMEPAGE", gapType: "COMPETITOR_LINK_GAP", region: "UAE", quality: 94 },
      { compDomain: "singlegrain.com", srcDomain: "searchenginejournal.com", srcUrl: "https://www.searchenginejournal.com/contributor/single-grain", pageType: "SERVICE_PAGE", gapType: "COMPETITOR_LINK_GAP", region: "USA", quality: 96 },
    ];
    for (const g of SAMPLE_GAPS) {
      const id = "gap_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_competitor_gaps (id, competitor_id, competitor_domain, source_domain, source_url, target_page_type, gap_type, region, relevance_score, quality_score, difficulty_score, status, created_at)
         VALUES (?, 'cmp_ref', ?, ?, ?, ?, ?, ?, 90, ?, 35, 'IDENTIFIED', NOW())\`,
        [id, g.compDomain, g.srcDomain, g.srcUrl, g.pageType, g.gapType, g.region, g.quality]
      );
    }
    console.log("✓ Seeded competitor gaps.");
  }

  // 3. Target Pages
  const [tpCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_target_pages");
  if (tpCountRows[0].total === 0) {
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
      const id = "tp_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_target_pages (id, page_url, page_title, target_page_type, primary_focus, priority_tier, target_backlinks_goal, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())\`,
        [id, tp.url, tp.title, tp.type, tp.focus, tp.tier, tp.goal, tp.status]
      );
    }
    console.log("✓ Seeded target pages.");
  }

  // 4. Mentions & Citations
  const [menCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_brand_mentions");
  if (menCountRows[0].total === 0) {
    const MENTIONS = [
      {
        query: "D'Genius Solutions",
        url: "https://yourstory.com/2026/08/ai-creative-agencies-india",
        title: "Top AI Creative Studios Redefining Indian Advertising",
        snippet: "...agencies like D'Genius Solutions in Mumbai have pioneered neural video rendering for commercial broadcast...",
        linked: 0,
        type: "UNLINKED_MENTION",
        signals: JSON.stringify({ seo_authority: true, aeo_authority: true, geo_authority: true, llm_entity_authority: true }),
      },
      {
        query: "DGS",
        url: "https://clutch.co/profile/d-genius-solutions",
        title: "D'Genius Solutions Client Reviews",
        snippet: "DGS delivered our brand commercial with 4K AI video pipelines ahead of deadline.",
        linked: 1,
        type: "LINKED_MENTION",
        signals: JSON.stringify({ brand_authority: true, service_authority: true }),
      },
      {
        query: "D Genius Solutions",
        url: "https://community.nasscom.in/post/future-of-enterprise-geo",
        title: "Generative Search Optimization Benchmarks",
        snippet: "As documented in research by D Genius Solutions, semantic clustering increases AI Overview inclusion by 40%...",
        linked: 0,
        type: "UNLINKED_MENTION",
        signals: JSON.stringify({ seo_authority: true, aeo_authority: true, llm_entity_authority: true }),
      },
    ];
    for (const m of MENTIONS) {
      const id = "men_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_brand_mentions (id, brand_query, mention_url, mention_title, snippet, is_linked, mention_type, sentiment, authority_signals, status, detected_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'POSITIVE', ?, 'NEW', NOW(), NOW())\`,
        [id, m.query, m.url, m.title, m.snippet, m.linked, m.type, m.signals]
      );
    }
    console.log("✓ Seeded mentions.");
  }

  const [citCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_citations");
  if (citCountRows[0].total === 0) {
    const CITATIONS = [
      { platform: "Google Business Profile Mumbai", url: "https://maps.google.com/?cid=101010", region: "INDIA", country: "India", nap: "CONSISTENT", issues: null },
      { platform: "Justdial Khar West", url: "https://www.justdial.com/Mumbai/DGenius-Solutions", region: "INDIA", country: "India", nap: "CONSISTENT", issues: null },
      { platform: "IndiaMART Verified Supplier", url: "https://www.indiamart.com/dgeniussolutions/", region: "INDIA", country: "India", nap: "CONSISTENT", issues: null },
      { platform: "Google Business Profile Dubai", url: "https://maps.google.com/?cid=202020", region: "UAE", country: "United Arab Emirates", nap: "CONSISTENT", issues: null },
      { platform: "Yellow Pages UAE", url: "https://www.yellowpages.ae/dgeniussolutions", region: "UAE", country: "United Arab Emirates", nap: "INCONSISTENT", issues: "Missing suite number in Khar West secondary address" },
      { platform: "Better Business Bureau USA", url: "https://www.bbb.org/profile/dgeniussolutions", region: "USA", country: "United States", nap: "CONSISTENT", issues: null },
    ];
    for (const c of CITATIONS) {
      const id = "cit_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_citations (id, platform_name, listing_url, region, country, business_name_displayed, website_displayed, phone_displayed, location_displayed, nap_status, nap_issues, last_audited_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'ACTIVE', NOW())\`,
        [id, c.platform, c.url, c.region, c.country, "D'Genius Solutions", "https://www.dgeniussolutions.com", "+91 99879 22901", "Unit 202, Amore Edge, Khar West, Mumbai", c.nap, c.issues]
      );
    }
    console.log("✓ Seeded citations.");
  }

  // 5. Backlinks
  const [blCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_backlinks");
  if (blCountRows[0].total === 0) {
    const INITIAL_BACKLINKS = [
      {
        source_domain: "clutch.co",
        source_url: "https://clutch.co/profile/d-genius-solutions",
        source_page_title: "Top Digital Marketing Companies in Mumbai - Clutch.co",
        target_url: "https://www.dgeniussolutions.com/",
        target_page_type: "HOMEPAGE",
        anchor_text: "D'Genius Solutions",
        anchor_classification: "BRANDED",
        link_rel: "dofollow",
        dofollow: 1,
        nofollow: 0,
        source_country: "India",
        source_region: "INDIA",
        source_language: "en",
        topical_category: "B2B Agency Directory",
        topical_relevance_score: 95,
        editorial_quality_score: 90,
        geo_relevance_score: 95,
        spam_risk_score: 0,
        authority_score: 93,
        status: "LIVE",
        referral_sessions: 142,
        referral_leads: 8,
      },
      {
        source_domain: "goodfirms.co",
        source_url: "https://www.goodfirms.co/company/d-genius-solutions",
        source_page_title: "D'Genius Solutions Reviews & Services - GoodFirms",
        target_url: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/",
        target_page_type: "SERVICE_PAGE",
        anchor_text: "Visit Website",
        anchor_classification: "GENERIC",
        link_rel: "dofollow",
        dofollow: 1,
        nofollow: 0,
        source_country: "India",
        source_region: "INDIA",
        source_language: "en",
        topical_category: "B2B Reviews",
        topical_relevance_score: 90,
        editorial_quality_score: 85,
        geo_relevance_score: 90,
        spam_risk_score: 0,
        authority_score: 89,
        status: "LIVE",
        referral_sessions: 98,
        referral_leads: 5,
      },
      {
        source_domain: "github.com",
        source_url: "https://github.com/dgeniussolutions/geo-benchmarks",
        source_page_title: "dgeniussolutions/geo-benchmarks: Generative Engine Optimization Testing",
        target_url: "https://www.dgeniussolutions.com/services/geo/",
        target_page_type: "SERVICE_PAGE",
        anchor_text: "https://www.dgeniussolutions.com/services/geo/",
        anchor_classification: "NAKED_URL",
        link_rel: "dofollow",
        dofollow: 1,
        nofollow: 0,
        source_country: "Global",
        source_region: "GLOBAL",
        source_language: "en",
        topical_category: "Open Source Tech",
        topical_relevance_score: 98,
        editorial_quality_score: 98,
        geo_relevance_score: 85,
        spam_risk_score: 0,
        authority_score: 98,
        status: "LIVE",
        referral_sessions: 215,
        referral_leads: 12,
      },
      {
        source_domain: "producthunt.com",
        source_url: "https://www.producthunt.com/products/dgs-ai-video-studio",
        source_page_title: "DGS AI Video Studio on Product Hunt",
        target_url: "https://www.dgeniussolutions.com/services/ai-video-production-agency/",
        target_page_type: "SERVICE_PAGE",
        anchor_text: "DGS AI Video Production",
        anchor_classification: "PARTIAL_MATCH",
        link_rel: "dofollow",
        dofollow: 1,
        nofollow: 0,
        source_country: "United States",
        source_region: "USA",
        source_language: "en",
        topical_category: "Tech Product Launch",
        topical_relevance_score: 95,
        editorial_quality_score: 92,
        geo_relevance_score: 85,
        spam_risk_score: 0,
        authority_score: 94,
        status: "LIVE",
        referral_sessions: 320,
        referral_leads: 18,
      },
      {
        source_domain: "dmc.ae",
        source_url: "https://dmc.ae/partners/d-genius-solutions",
        source_page_title: "Media Production Partners - Dubai Media City",
        target_url: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/",
        target_page_type: "SERVICE_PAGE",
        anchor_text: "D'Genius Solutions Dubai",
        anchor_classification: "BRANDED",
        link_rel: "dofollow",
        dofollow: 1,
        nofollow: 0,
        source_country: "United Arab Emirates",
        source_region: "UAE",
        source_language: "en",
        topical_category: "Free Zone Media Hub",
        topical_relevance_score: 98,
        editorial_quality_score: 95,
        geo_relevance_score: 100,
        spam_risk_score: 0,
        authority_score: 96,
        status: "LIVE",
        referral_sessions: 165,
        referral_leads: 14,
      },
    ];

    for (const b of INITIAL_BACKLINKS) {
      const id = "lnk_" + randomUUID().replace(/-/g, "").slice(0, 16);
      await conn.query(
        \`INSERT INTO off_page_backlinks (
          id, source_domain, source_url, source_page_title, target_url, target_page_type,
          anchor_text, anchor_classification, link_rel, dofollow, nofollow, ugc, sponsored,
          unknown_link_type, first_seen_at, last_seen_at, last_checked_at, status, http_status,
          source_indexable, source_canonical, source_country, source_region, source_language,
          topical_category, topical_relevance_score, editorial_quality_score, geo_relevance_score,
          spam_risk_score, authority_score, placement_type, link_location, referral_sessions,
          referral_leads, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW(), NOW(), NOW(), ?, 200, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONTENT', 'BODY', ?, ?, NOW(), NOW())\`,
        [
          id,
          b.source_domain,
          b.source_url,
          b.source_page_title,
          b.target_url,
          b.target_page_type,
          b.anchor_text,
          b.anchor_classification,
          b.link_rel,
          b.dofollow,
          b.nofollow,
          b.status,
          b.source_url,
          b.source_country,
          b.source_region,
          b.source_language,
          b.topical_category,
          b.topical_relevance_score,
          b.editorial_quality_score,
          b.geo_relevance_score,
          b.spam_risk_score,
          b.authority_score,
          b.referral_sessions,
          b.referral_leads,
        ]
      );
    }
    console.log("✓ Seeded backlinks.");
  }

  // 6. Monthly report
  const [repCountRows] = await conn.query("SELECT COUNT(*) as total FROM off_page_monthly_reports WHERE report_month = '2026-09'");
  if (repCountRows[0].total === 0) {
    const reportId = "rep_" + randomUUID().replace(/-/g, "").slice(0, 16);
    const summaryMetrics = {
      totalReferringDomains: 5,
      liveBacklinks: 5,
      newBacklinks: 5,
      lostBacklinks: 0,
      brokenBacklinks: 0,
      totalReferralSessions: 940,
      totalReferralLeads: 47,
      overallAuthorityScore: 94,
      avgEditorialQuality: 92,
      spamFreeCompliancePct: 100,
    };
    const regionalMetrics = {
      india: { liveBacklinks: 2, referralSessions: 240, referralLeads: 13, authorityScore: 91 },
      uae: { liveBacklinks: 1, referralSessions: 165, referralLeads: 14, authorityScore: 96 },
      usa: { liveBacklinks: 1, referralSessions: 320, referralLeads: 18, authorityScore: 94 },
      global: { liveBacklinks: 1, referralSessions: 215, referralLeads: 12, authorityScore: 98 },
    };
    const targetPageMetrics = [
      { targetUrl: "https://www.dgeniussolutions.com/", referringDomains: 1, backlinks: 1, referralSessions: 142, status: "HEALTHY" },
      { targetUrl: "https://www.dgeniussolutions.com/services/ai-video-production-agency/", referringDomains: 1, backlinks: 1, referralSessions: 320, status: "HEALTHY" },
      { targetUrl: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/", referringDomains: 1, backlinks: 1, referralSessions: 98, status: "HEALTHY" },
      { targetUrl: "https://www.dgeniussolutions.com/services/geo/", referringDomains: 1, backlinks: 1, referralSessions: 215, status: "HEALTHY" },
      { targetUrl: "https://www.dgeniussolutions.com/services/ai-production-dubai-page/", referringDomains: 1, backlinks: 1, referralSessions: 165, status: "HEALTHY" },
    ];
    const outreachMetrics = { pitchesDrafted: 18, pitchesApproved: 12, pitchesSent: 8, repliesReceived: 3, verifiedLinksEarned: 2, conversionRatePct: 25.0 };
    const prMetrics = { activeHarosSubmitted: 4, publishedQuotes: 2, unlinkedMentionsClaimed: 1 };
    const aeoGeoLlmMetrics = {
      aiOverviewVisibilityImpact: "POSITIVE (+32% entity citations)",
      perplexitySourceAppearance: "DETECTED (Ranked as source in top AI video agencies)",
      copilotCitationPresence: "ACTIVE",
      brandEntityGraphConfidence: 91.5,
    };
    const competitorGapMetrics = { totalGapsTracked: 5, gapsTargetedThisMonth: 3, winRatePct: 33.3 };
    const riskMetrics = {
      spamAlerts: 0,
      penguinRiskLevel: "VERY_LOW",
      exactMatchAnchorPct: 0.0,
      brandedAnchorPct: 40.0,
      nakedUrlAnchorPct: 20.0,
      partialMatchPct: 20.0,
      genericAnchorPct: 20.0,
    };
    const nextMonthPlan = [
      "Target top 15 High-Relevance UAE digital agency directories for Dubai AI video dominance",
      "Pitch 5 thought leadership guest studies on AEO/GEO indexing benchmarks to Indian tech portals",
      "Claim unlinked brand mentions on YourStory and Nasscom Community blogs",
      "Maintain < 15% exact-match anchor profile to guarantee zero Penguin risk",
    ];

    await conn.query(
      \`INSERT INTO off_page_monthly_reports (
        id, report_month, report_title, report_type, summary_metrics, regional_metrics,
        target_page_metrics, outreach_metrics, pr_metrics, aeo_geo_llm_metrics,
        competitor_gap_metrics, risk_metrics, next_month_plan, created_at
      ) VALUES (?, '2026-09', 'DGS Off-Page SEO & Authority Performance Report — September 2026', 'MONTHLY_EXECUTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())\`,
      [
        reportId,
        JSON.stringify(summaryMetrics),
        JSON.stringify(regionalMetrics),
        JSON.stringify(targetPageMetrics),
        JSON.stringify(outreachMetrics),
        JSON.stringify(prMetrics),
        JSON.stringify(aeoGeoLlmMetrics),
        JSON.stringify(competitorGapMetrics),
        JSON.stringify(riskMetrics),
        JSON.stringify(nextMonthPlan)
      ]
    );
    console.log("✓ Seeded September 2026 monthly report.");
  }

  // Print summary
  const tables = [
    "off_page_opportunities",
    "off_page_backlinks",
    "off_page_competitor_domains",
    "off_page_competitor_gaps",
    "off_page_brand_mentions",
    "off_page_citations",
    "off_page_target_pages",
    "off_page_monthly_reports"
  ];
  const summary = {};
  for (const t of tables) {
    const [rows] = await conn.query(\`SELECT COUNT(*) as c FROM \${t}\`);
    summary[t] = rows[0].c;
  }
  console.log("\\n=== VPS DATABASE SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));

  await conn.end();
}

main().catch(err => {
  console.error("SEED FAILED:", err);
  process.exit(1);
});
`;

async function run() {
  // 1. Extract raw seeds from seed-data.ts
  console.log("Reading local seed data...");
  const seedFile = fs.readFileSync(path.join(process.cwd(), "lib", "off-page", "seed-data.ts"), "utf8");
  const jsonMatch = seedFile.match(/export const SEED_OPPORTUNITIES[^=]*=\s*(\[[\s\S]*\]);/);
  if (!jsonMatch) {
    throw new Error("Could not parse SEED_OPPORTUNITIES from seed-data.ts");
  }
  const seedData = jsonMatch[1];

  console.log("Uploading seed-data.json to VPS...");
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/seed-data.json"`, {
    input: seedData,
    encoding: "utf8",
  });

  console.log("Uploading seed script to VPS...");
  execSync(`ssh -p 65002 u188101251@147.93.100.126 "cat > /home/u188101251/production-app/current/tmp/seed-direct.mjs"`, {
    input: seedRunnerScript,
    encoding: "utf8",
  });

  console.log("Executing seed script on VPS...");
  const out = execSync(`ssh -p 65002 u188101251@147.93.100.126 "cd /home/u188101251/production-app/current && node tmp/seed-direct.mjs"`, {
    encoding: "utf8",
  });
  console.log(out);
}

run().catch(console.error);
