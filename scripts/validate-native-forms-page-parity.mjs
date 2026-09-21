import fs from "node:fs";
import path from "node:path";

const root = "C:/Projects/DGS-Phase2-CMS";
const defs = JSON.parse(fs.readFileSync(path.join(root, "data/forms/definitions.approved.json"), "utf8"));
const pagesDir = path.join(root, "data/wordpress/mirrors/pages");
const mirrors = new Map();

for (const name of fs.readdirSync(pagesDir)) {
  if (!name.endsWith(".json")) continue;
  const page = JSON.parse(fs.readFileSync(path.join(pagesDir, name), "utf8"));
  if (page.path) mirrors.set(page.path, page);
}

const homepage = JSON.parse(
  fs.readFileSync(path.join(root, "data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json"), "utf8"),
);
if (homepage.path) mirrors.set(homepage.path, homepage);

const decode = (value) => String(value)
  .replaceAll("&amp;", "&")
  .replaceAll("&#038;", "&")
  .replaceAll("&quot;", "\"")
  .replaceAll("&#039;", "'")
  .trim();

const esc = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const failures = [];
const checks = [];
for (const form of defs.forms) {
  for (const route of form.sourceRoutes) {
    const page = mirrors.get(route);
    if (!page) {
      failures.push("Form " + form.fluentFormId + ": missing mirror for " + route);
      continue;
    }
    const body = page.body || "";
    const result = { formId: form.fluentFormId, route, fields: 0, selects: 0 };

    for (const field of form.fields) {
      const namePattern = new RegExp("name=(?:[\\\"\\'])" + esc(field.name) + "(?:[\\\"\\'])", "i");
      if (!namePattern.test(body)) {
        failures.push("Form " + form.fluentFormId + " " + route + ": missing field " + field.name);
        continue;
      }
      result.fields += 1;

      if (field.type === "select") {
        const selectPattern = new RegExp("<select[^>]*name=(?:[\\\"\\'])" + esc(field.name) + "(?:[\\\"\\'])[^>]*>([\\s\\S]*?)<\\/select>", "i");
        const match = body.match(selectPattern);
        if (!match) {
          failures.push("Form " + form.fluentFormId + " " + route + ": select markup missing " + field.name);
          continue;
        }
        const liveValues = [...match[1].matchAll(/<option[^>]*value=(?:[\"'])(.*?)(?:[\"'])[^>]*>/gi)]
          .map((m) => decode(m[1]))
          .filter(Boolean);
        const approvedValues = (field.options || []).map((option) => decode(option.value));        if (JSON.stringify(liveValues) !== JSON.stringify(approvedValues)) {
          failures.push("Form " + form.fluentFormId + " " + route + ": option mismatch " + field.name + " approved=" + JSON.stringify(approvedValues) + " live=" + JSON.stringify(liveValues));
        } else {
          result.selects += 1;
        }
      }
    }
    checks.push(result);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, checkedRoutes: checks.length, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  forms: defs.forms.length,
  checkedRoutes: checks.length,
  checks,
}, null, 2));