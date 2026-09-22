import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dgeniussolutions.com";

const routes = [
  "/",
  "/about-us/",
  "/services/seo-services-in-mumbai/",
  "/services/aeo-services-in-mumbai/",
  "/services/geo/",
  "/services/llm-seo-service/",
  "/services/ai-video-production-agency/",
  "/services/performance-marketing/",
  "/services/website-development-amc/",
  "/services/social-media-marketing/",
  "/services/branding/",
  "/services/content-creation/",
  "/portfolio/",
  "/blogs/",
  "/career/",
  "/career/generative-ai-artist/",
  "/contact-us/",
];

function loadEnvFile(file) {
  try {
    if (!fs.existsSync(file)) return;
    const text = fs.readFileSync(file, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const match = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !process.env[match[1]]) {
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  } catch {}
}

loadEnvFile("/home/u188101251/production-app/shared/.env.production");
loadEnvFile("/home/u188101251/production-app/current/.env.production");
loadEnvFile(path.join(process.cwd(), ".env.production"));

async function getDb() {
  const uri = process.env.DGS_DATABASE_URL || process.env.DATABASE_URL;
  if (uri) {
    const url = new URL(uri);
    return mysql.createConnection({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      ssl: url.searchParams.get("ssl") === "true" ? {} : undefined,
    });
  }
  return mysql.createConnection({
    host: process.env.DGS_MYSQL_HOST,
    port: Number(process.env.DGS_MYSQL_PORT || 3306),
    user: process.env.DGS_MYSQL_USER,
    password: process.env.DGS_MYSQL_PASSWORD,
    database: process.env.DGS_MYSQL_DATABASE,
  });
}

async function audit() {
  console.log("Starting Live Network & HTML Dependency Audit on", SITE_URL);

  const routeResults = {};
  const allMediaUrls = new Map();
  const allWpJsonUrls = new Set();
  const allWpOriginUrls = new Set();
  const allPhpUrls = new Set();

  for (const route of routes) {
    try {
      const res = await fetch(`${SITE_URL}${route}`, {
        headers: { "User-Agent": "DGS-Retirement-Auditor/1.0" },
      });
      const html = await res.text();

      // Extract wp-content/uploads references
      const uploadsMatches = html.match(/(?:https?:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-content\/uploads\/[^\s"'><\)\\]+/gi) || [];
      const cleanUploads = [...new Set(uploadsMatches.map((u) => {
        let clean = u.replace(/^https?:\/\/(?:www\.)?dgeniussolutions\.com/i, "");
        clean = clean.replace(/[?#].*$/, "");
        return clean;
      }))];

      // Extract other wp-content or wp-includes
      const otherWp = html.match(/(?:https?:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-(?:includes|content\/(?!uploads))[^\s"'><\)\\]+/gi) || [];
      const cleanOtherWp = [...new Set(otherWp.map((u) => u.replace(/^https?:\/\/(?:www\.)?dgeniussolutions\.com/i, "").replace(/[?#].*$/, "")))];

      // Extract wp-json
      const jsonMatches = html.match(/(?:https?:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-json\/[^\s"'><\)\\]+/gi) || [];
      const cleanJson = [...new Set(jsonMatches)];

      // Extract wp-origin
      const originMatches = html.match(/https?:\/\/wp-origin\.dgeniussolutions\.com[^\s"'><\)\\]*/gi) || [];
      const cleanOrigin = [...new Set(originMatches)];

      // Extract .php
      const phpMatches = html.match(/[^\s"'><\)\\]+\.php[^\s"'><\)\\]*/gi) || [];
      const cleanPhp = [...new Set(phpMatches.filter((p) => !p.includes("node_modules")))];

      routeResults[route] = {
        status: res.status,
        uploadsCount: cleanUploads.length,
        uploads: cleanUploads,
        otherWpCount: cleanOtherWp.length,
        otherWp: cleanOtherWp,
        jsonCount: cleanJson.length,
        originCount: cleanOrigin.length,
        phpCount: cleanPhp.length,
      };

      for (const u of cleanUploads) {
        if (!allMediaUrls.has(u)) {
          allMediaUrls.set(u, new Set());
        }
        allMediaUrls.get(u).add(route);
      }
      for (const j of cleanJson) allWpJsonUrls.add(j);
      for (const o of cleanOrigin) allWpOriginUrls.add(o);
      for (const p of cleanPhp) allPhpUrls.add(p);
    } catch (err) {
      routeResults[route] = { error: err.message };
    }
  }

  console.log("\n=== SUMMARY BY ROUTE ===");
  for (const [r, d] of Object.entries(routeResults)) {
    console.log(`${r.padEnd(45)} HTTP ${d.status || d.error} | Uploads: ${d.uploadsCount || 0} | Other WP: ${d.otherWpCount || 0} | WP-JSON: ${d.jsonCount || 0} | WP-Origin: ${d.originCount || 0} | PHP: ${d.phpCount || 0}`);
  }

  console.log(`\nTotal Unique /wp-content/uploads/ references across audited routes: ${allMediaUrls.size}`);
  console.log(`Total Unique /wp-json/ references: ${allWpJsonUrls.size}`);
  console.log(`Total Unique wp-origin references: ${allWpOriginUrls.size}`);
  console.log(`Total Unique PHP references: ${allPhpUrls.size}`);

  if (allWpJsonUrls.size > 0) {
    console.log("WP-JSON URLs:", [...allWpJsonUrls]);
  }
  if (allWpOriginUrls.size > 0) {
    console.log("WP-Origin URLs:", [...allWpOriginUrls]);
  }
  if (allPhpUrls.size > 0) {
    console.log("PHP URLs:", [...allPhpUrls]);
  }

  // Probe media files
  console.log("\n=== MEDIA AUDIT ===");
  const mediaReport = [];
  const nextAppPublicRoot = "/home/u188101251/production-app/current/public";
  const wpPublicHtmlRoot = "/home/u188101251/domains/dgeniussolutions.com/public_html";

  for (const [mediaPath, routesUsing] of allMediaUrls.entries()) {
    const fullUrl = `${SITE_URL}${mediaPath}`;
    let httpStatus = 0;
    try {
      const head = await fetch(fullUrl, { method: "HEAD" });
      httpStatus = head.status;
    } catch {
      httpStatus = 0;
    }

    const inNextPublic = fs.existsSync(path.join(nextAppPublicRoot, mediaPath));
    const inWpPublicHtml = fs.existsSync(path.join(wpPublicHtmlRoot, mediaPath));

    mediaReport.push({
      path: mediaPath,
      httpStatus,
      inNextPublic,
      inWpPublicHtml,
      routes: [...routesUsing],
    });
  }

  const inNextCount = mediaReport.filter((m) => m.inNextPublic).length;
  const onlyInWpCount = mediaReport.filter((m) => !m.inNextPublic && m.inWpPublicHtml).length;
  const missingCount = mediaReport.filter((m) => !m.inNextPublic && !m.inWpPublicHtml).length;

  console.log(`Media present in Next.js public/: ${inNextCount}/${mediaReport.length}`);
  console.log(`Media ONLY in WordPress public_html/: ${onlyInWpCount}/${mediaReport.length}`);
  console.log(`Media missing everywhere (broken): ${missingCount}/${mediaReport.length}`);

  if (onlyInWpCount > 0) {
    console.log("\n--- Media files ONLY in WordPress public_html (MUST BE COPIED/MIGRATED) ---");
    for (const m of mediaReport.filter((m) => !m.inNextPublic && m.inWpPublicHtml)) {
      console.log(`  ${m.path} (HTTP ${m.httpStatus}) used on: ${m.routes.join(", ")}`);
    }
  }

  if (missingCount > 0) {
    console.log("\n--- Broken media references (missing everywhere) ---");
    for (const m of mediaReport.filter((m) => !m.inNextPublic && !m.inWpPublicHtml)) {
      console.log(`  ${m.path} (HTTP ${m.httpStatus}) used on: ${m.routes.join(", ")}`);
    }
  }

  fs.writeFileSync(
    "media-audit-report.json",
    JSON.stringify({ routeResults, mediaReport, inNextCount, onlyInWpCount, missingCount }, null, 2),
  );
  console.log("\nWrote detailed media-audit-report.json");
}

audit().catch(console.error);
