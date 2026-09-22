import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

function loadEnvFile(file) {
  return fs
    .readFile(file, "utf8")
    .then((text) => {
      for (const raw of text.split(/\r?\n/)) {
        const match = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
      }
    })
    .catch(() => {});
}

await loadEnvFile(path.join(process.cwd(), ".env.production"));
await loadEnvFile(path.join(process.cwd(), ".env.local"));

function connectionOptions() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    };
  }

  if (
    !process.env.DGS_MYSQL_HOST ||
    !process.env.DGS_MYSQL_USER ||
    !process.env.DGS_MYSQL_DATABASE
  ) {
    throw new Error("CMS database configuration is missing");
  }

  return {
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD || "",
    database: process.env.DGS_MYSQL_DATABASE,
  };
}

function classifyUpdate(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes("core update") || text.includes("broad core")) {
    return { category: "Core Update", severity: "CRITICAL" };
  }
  if (text.includes("spam update") || text.includes("link spam") || text.includes("site reputation")) {
    return { category: "Spam Update", severity: "HIGH" };
  }
  if (text.includes("helpful content") || text.includes("reviews update") || text.includes("review system")) {
    return { category: "Content & Review Systems", severity: "HIGH" };
  }
  if (
    text.includes("ranking incident") ||
    text.includes("indexing issue") ||
    text.includes("serving outage") ||
    text.includes("search incident") ||
    text.includes("service disruption")
  ) {
    return { category: "Search System Incident", severity: "HIGH" };
  }
  if (text.includes("ai overview") || text.includes("sge") || text.includes("structured data") || text.includes("schema")) {
    return { category: "Search Features & Schema", severity: "MEDIUM" };
  }
  return { category: "General Search Announcement", severity: "INFORMATIONAL" };
}

function generateDgsImpact(title, category, severity) {
  if (severity === "CRITICAL" || category === "Core Update") {
    return {
      impactAnalysis:
        "Broad core algorithm updates re-evaluate all indexed content against holistic quality and search intent. DGS flagship service pages (/services/seo-services-in-mumbai/, /services/ai-video-production-agency/) and core blog articles may experience standard volatility during the 10-14 day rollout window. Brand queries and local Mumbai service signals remain fortified.",
      affectedAreas: [
        "/services/seo-services-in-mumbai/",
        "/services/ai-video-production-agency/",
        "/services/performance-marketing/",
        "/blogs/",
        "Organic Brand Queries",
      ],
    };
  }

  if (category === "Spam Update") {
    return {
      impactAnalysis:
        "Google is cracking down on low-effort scaled content, site reputation abuse, and expired domains. DGS adheres strictly to original editorial standards and white-hat organic practices. Competitors employing manipulative strategies may lose rankings, creating organic capture opportunities for DGS.",
      affectedAreas: [
        "Competitive SERP Visibility",
        "Backlink Quality Profiling",
        "Blog Editorial Integrity",
      ],
    };
  }

  return {
    impactAnalysis:
      "General search platform update or infrastructure incident. Low risk to active ranking positions. Monitor crawl and indexing metrics.",
    affectedAreas: ["Technical SEO Guidelines", "Search Console Reporting"],
  };
}

function generateSafeRecommendations(severity, category) {
  return [
    "STRICT POLICY: Do NOT automatically alter or rewrite ranked pages, H1s, titles, or canonicals during an active Google rollout.",
    "Monitor daily search clicks, impressions, and average position in Google Search Console over the next 14 days.",
    "Verify that server response times, uptime, and SSL certificates are performing without interruption.",
    "Observe SERP fluctuations calmly before considering any structural optimization.",
  ];
}

async function fetchSources() {
  const items = [];

  // Source 1: Google Search Status Dashboard
  try {
    const res = await fetch("https://status.search.google.com/incidents.json", {
      headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const inc of data.slice(0, 10)) {
          const summary =
            inc.external_desc ||
            inc.summary ||
            inc.updates?.[0]?.description ||
            "Google Search incident";
          const title = inc.service_name
            ? `${inc.service_name}: ${summary.slice(0, 75)}`
            : `Search Status: ${summary.slice(0, 75)}`;
          items.push({
            title,
            source: "Google Search Status Dashboard",
            sourceUrl: `https://status.search.google.com/incidents/${inc.id || inc.service_key || "incident"}`,
            publishedAt: inc.begin || inc.created || new Date().toISOString(),
            summary,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Status dashboard fetch warning:", err.message);
  }

  // Source 2: Google Search Central Blog RSS
  for (const url of [
    "https://feeds.feedburner.com/blogspot/amDG",
    "https://developers.google.com/search/blog/rss.xml",
  ]) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "DGS-SearchMonitor/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<rss") && !text.includes("<feed")) continue;
      const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
      for (const itemXml of itemMatches.slice(0, 10)) {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const descMatch =
          itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
          itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);

        const title = titleMatch
          ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim()
          : "Search Central Update";
        const sourceUrl = linkMatch
          ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim()
          : "https://developers.google.com/search/blog";
        const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
        const publishedAt = pubDateStr
          ? new Date(pubDateStr).toISOString()
          : new Date().toISOString();
        const rawSummary = descMatch
          ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
          : "";
        const summary = rawSummary
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 400);

        items.push({
          title,
          source: "Google Search Central Blog",
          sourceUrl,
          publishedAt,
          summary: summary || title,
        });
      }
      if (itemMatches.length > 0) break;
    } catch (err) {
      console.warn("Search Central blog fetch warning:", err.message);
    }
  }

  return items;
}

async function sendAlertEmail(item) {
  if (
    !process.env.DGS_SMTP_HOST ||
    !process.env.DGS_SMTP_USER ||
    !process.env.DGS_SMTP_PASSWORD
  ) {
    console.log("SMTP not configured, skipping email alert.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.DGS_SMTP_HOST,
    port: Number(process.env.DGS_SMTP_PORT || 587),
    secure: process.env.DGS_SMTP_SECURE === "true",
    auth: {
      user: process.env.DGS_SMTP_USER,
      pass: process.env.DGS_SMTP_PASSWORD,
    },
  });

  const recipient =
    process.env.DGS_SEARCH_UPDATE_NOTIFICATION_TO ||
    "ankur.vishwakarma@dgeniussolutions.com";
  const from = process.env.DGS_SMTP_FROM || process.env.DGS_SMTP_USER;

  const subject = `[DGS Search Alert] [${item.severity}] ${item.title}`;
  const text = [
    `D'GENIUS SOLUTIONS — GOOGLE SEARCH UPDATE ALERT`,
    `==============================================`,
    `Severity: [${item.severity}]`,
    `Title: ${item.title}`,
    `Category: ${item.category}`,
    `Published: ${item.publishedAt}`,
    `Source: ${item.source} (${item.sourceUrl})`,
    "",
    "SUMMARY:",
    item.summary,
    "",
    "DGS IMPACT ASSESSMENT:",
    item.impactAnalysis,
    `Affected Areas: ${item.affectedAreas.join(", ")}`,
    "",
    "SAFE ACTION RECOMMENDATIONS:",
    ...item.recommendedActions.map((a, i) => `  ${i + 1}. ${a}`),
    "",
    "POLICY NOTICE:",
    "Do NOT rewrite ranked content, H1s, titles, or canonicals during rollout. Observe ranking fluctuations first.",
    "",
    `Dashboard: https://www.dgeniussolutions.com/admin/search-updates/`,
  ].join("\n");

  await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text,
  });

  return true;
}

async function run() {
  console.log("Starting Google Search Update monitoring check...");
  const connection = await mysql.createConnection(connectionOptions());
  try {
    const items = await fetchSources();
    console.log(`Fetched ${items.length} updates from official Google feeds.`);

    let inserted = 0;
    let notified = 0;

    for (const item of items) {
      const [existing] = await connection.execute(
        "SELECT id FROM google_search_updates WHERE source_url = ? LIMIT 1",
        [item.sourceUrl],
      );

      if (existing.length > 0) continue;

      const id = crypto.randomUUID();
      const detectedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
      const publishedAt = new Date(item.publishedAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const { category, severity } = classifyUpdate(item.title, item.summary);
      const { impactAnalysis, affectedAreas } = generateDgsImpact(
        item.title,
        category,
        severity,
      );
      const recommendedActions = generateSafeRecommendations(severity, category);

      await connection.execute(
        `INSERT INTO google_search_updates
        (id, title, source, source_url, published_at, detected_at, category, severity, summary, impact_analysis, recommended_actions, affected_dgs_areas, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.title,
          item.source,
          item.sourceUrl,
          publishedAt,
          detectedAt,
          category,
          severity,
          item.summary,
          impactAnalysis,
          JSON.stringify(recommendedActions),
          JSON.stringify(affectedAreas),
          "new",
        ],
      );

      inserted++;
      console.log(`[NEW] [${severity}] ${item.title}`);

      if (severity === "CRITICAL" || severity === "HIGH") {
        const sent = await sendAlertEmail({
          id,
          title: item.title,
          source: item.source,
          sourceUrl: item.sourceUrl,
          publishedAt,
          category,
          severity,
          summary: item.summary,
          impactAnalysis,
          affectedAreas,
          recommendedActions,
        }).catch((e) => {
          console.error("Alert email failure:", e.message);
          return false;
        });

        if (sent) {
          notified++;
          await connection.execute(
            "UPDATE google_search_updates SET notified_at = ? WHERE id = ?",
            [detectedAt, id],
          );
        }
      }
    }

    console.log(
      `Check complete. New updates: ${inserted}, Alert notifications sent: ${notified}`,
    );
  } finally {
    await connection.end();
  }
}

run().catch((err) => {
  console.error("Check runner failed:", err);
  process.exit(1);
});
