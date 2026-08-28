import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LIVE_FILE = path.join(ROOT, "data/audit/live/analytics-tags.generated.json");
const APPROVED_FILE = path.join(ROOT, "data/analytics/config.approved.json");
const errors = [];
const warnings = [];
const [live, approved] = await Promise.all([
  readJson(LIVE_FILE, "live analytics evidence"),
  readJson(APPROVED_FILE, "approved analytics configuration"),
]);

if (!errors.length) {
  const liveGtm = new Set(live.detected?.googleTagManagerIds || []);
  const liveGa4 = new Set(live.detected?.googleAnalytics4Ids || []);
  const liveAds = new Set(live.detected?.googleAdsIds || []);

  if (!approved.googleTagManager && !(approved.googleAnalytics4 || []).length && !(approved.googleAds || []).length) {
    errors.push("No production analytics configuration is approved yet");
  }

  if (approved.googleTagManager?.id && liveGtm.size && !liveGtm.has(approved.googleTagManager.id)) {
    warnings.push(`Approved GTM ${approved.googleTagManager.id} was not detected in the public baseline`);
  }

  for (const property of approved.googleAnalytics4 || []) {
    if (!property.measurementId) errors.push("Approved GA4 property is missing measurementId");
    else if (liveGa4.size && !liveGa4.has(property.measurementId)) warnings.push(`Approved GA4 ${property.measurementId} was not detected in the public baseline`);
  }

  for (const account of approved.googleAds || []) {
    if (!account.id) errors.push("Approved Google Ads configuration is missing id");
    else if (liveAds.size && !liveAds.has(account.id)) warnings.push(`Approved Google Ads ${account.id} was not detected in the public baseline`);
  }

  const eventNames = new Set();
  for (const event of approved.events || []) {
    if (!event.name) errors.push("Approved analytics event is missing name");
    if (eventNames.has(event.name)) errors.push(`Duplicate analytics event definition: ${event.name}`);
    eventNames.add(event.name);
  }

  for (const conversion of approved.conversions || []) {
    if (!conversion.name) errors.push("Approved conversion is missing name");
    if (!conversion.trigger) errors.push(`${conversion.name || "conversion"}: trigger definition is missing`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ready: false, errors, warnings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ready: true, warnings, approvedEvents: approved.events.length, approvedConversions: approved.conversions.length }, null, 2));
}

async function readJson(file, label) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`Missing or unreadable ${label}: ${file} (${error.message})`);
    return {};
  }
}
