#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanPath } from "./lib/full-site-route-audit.mjs";

const ROOT = process.cwd();
const TARGET = process.env.MIGRATION_TARGET_URL || "http://127.0.0.1:3025";
const base = TARGET.replace(/\/$/, "");

async function fetchInfo(route) {
  const url = `${base}${route}`;
  const response = await fetch(url, { headers: { "User-Agent": "DGS-Crawler-Files/1.0" } });
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();
  return { status: response.status, contentType, body };
}

const checks = [];
const failures = [];

async function checkRoute(route, expectations) {
  const info = await fetchInfo(route);
  const leak = /dimgrey-goat-473970\.hostingersite\.com/i.test(info.body);
  const has400050 = /400050/.test(info.body);
  const ok =
    info.status === 200 &&
    expectations.contentTypes.some((type) => info.contentType.includes(type)) &&
    !leak &&
    !has400050;
  if (!ok) failures.push({ route, ...info, leak, has400050 });
  checks.push({ route, ok, status: info.status, contentType: info.contentType, leak, has400050 });
}

await checkRoute("/robots.txt", { contentTypes: ["text/plain"] });
await checkRoute("/sitemap.xml", { contentTypes: ["xml"] });
await checkRoute("/llms.txt", { contentTypes: ["text/plain"] });
await checkRoute("/llms-full.txt", { contentTypes: ["text/plain"] });
await checkRoute("/locations.kml", { contentTypes: ["kml", "xml"] });

const sitemap = checks.find((c) => c.route === "/sitemap.xml");
let sitemapUrlCount = 0;
if (sitemap?.ok) {
  const body = (await fetchInfo("/sitemap.xml")).body;
  sitemapUrlCount = (body.match(/<loc>/g) || []).length;
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    if (!loc.startsWith("https://www.dgeniussolutions.com/")) {
      failures.push({ route: "/sitemap.xml", issue: "non-production hostname", loc });
    }
  }
}

const ok = failures.length === 0;
console.log(ok ? "PASS — CRAWLER FILES" : "FAIL — CRAWLER FILES");
console.log(JSON.stringify({ ok, sitemapUrlCount, checks, failures }, null, 2));
process.exit(ok ? 0 : 1);
