#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/hostinger-crawler-safety.json");

async function probe(url, userAgent) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": userAgent }, redirect: "manual" });
    return { status: response.status, xRobots: response.headers.get("x-robots-tag") || null };
  } catch (error) {
    return { status: 0, error: String(error.message || error) };
  }
}

const target = "https://dimgrey-goat-473970.hostingersite.com/";
const probes = {
  defaultCurl: await probe(target, "curl/8.0"),
  chromeBrowser: await probe(target, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
  auditAgent: await probe(target, "DGS-Full-Site-Audit/1.0"),
  googlebot: await probe(target, "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"),
};

const report = {
  generatedAt: new Date().toISOString(),
  probes,
  observations: {
    http429Reproduced: Object.values(probes).some((p) => p.status === 429),
    origin403Note:
      "Server-side curl to http://127.0.0.1/ with Host header returned 403 during Phase 1 deploy — LiteSpeed origin guard, not Next.js app logic",
    crawlerRiskAssessment:
      "Intermittent Hostinger CDN/WAF may return 429 for some browser-like automated probes. Repository validators use audit UA. Do not infer crawler support from UA spoofing alone.",
    hostChangeRequired: false,
    proposedHostChange: null,
    rollback: null,
    securityImplications: "No WAF weakening recommended in Phase 2A",
  },
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.observations, null, 2));
