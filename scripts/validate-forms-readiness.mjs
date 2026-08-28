import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_FILE = path.join(ROOT, "data/migration/forms-public-evidence.json");
const APPROVED_FILE = path.join(ROOT, "data/forms/definitions.approved.json");

const errors = [];
const warnings = [];
const [publicEvidence, approved] = await Promise.all([
  readJson(PUBLIC_FILE, "public form evidence"),
  readJson(APPROVED_FILE, "approved form definitions"),
]);

if (!errors.length) {
  const evidenceByRoute = new Map((publicEvidence.forms || []).map((item) => [item.route, item]));
  const approvedByRoute = new Map((approved.forms || []).map((item) => [item.sourceRoute, item]));

  for (const evidence of publicEvidence.forms || []) {
    const definition = approvedByRoute.get(evidence.route);
    if (!definition) {
      errors.push(`${evidence.route}: no authenticated approved form definition for public Fluent Form ${evidence.fluentFormId}`);
      continue;
    }
    if (Number(definition.fluentFormId) !== Number(evidence.fluentFormId)) {
      errors.push(`${evidence.route}: approved Fluent Form ID ${definition.fluentFormId} does not match public evidence ${evidence.fluentFormId}`);
    }
    const approvedNames = new Set((definition.fields || []).map((field) => field.name));
    for (const publicName of evidence.fields || []) {
      if (!approvedNames.has(publicName)) warnings.push(`${evidence.route}: public field '${publicName}' is not represented in approved definition`);
    }
    if (!definition.backend?.submissionEndpoint) errors.push(`${evidence.route}: authenticated submission endpoint is missing`);
    if (definition.backend?.adapter !== "fluent-forms-wordpress") errors.push(`${evidence.route}: unsupported form adapter '${definition.backend?.adapter}'`);
  }

  for (const definition of approved.forms || []) {
    if (!definition.key) errors.push(`Approved form on ${definition.sourceRoute || "unknown route"} is missing a stable key`);
    if (!evidenceByRoute.has(definition.sourceRoute)) warnings.push(`${definition.sourceRoute}: approved form has no matching public markup evidence`);
    for (const field of definition.fields || []) {
      if (!field.name || !field.label || !field.type) errors.push(`${definition.sourceRoute}: incomplete approved field definition`);
      if (field.type === "select" && !Array.isArray(field.options)) errors.push(`${definition.sourceRoute}:${field.name}: select field requires authenticated options`);
    }
    if (definition.captcha?.provider && !["recaptcha", "turnstile"].includes(definition.captcha.provider)) {
      errors.push(`${definition.sourceRoute}: unsupported CAPTCHA provider '${definition.captcha.provider}'`);
    }
  }

  if (!(approved.forms || []).length) errors.push("No authenticated Fluent Forms definitions are approved yet");
}

if (errors.length) {
  console.error(JSON.stringify({ ready: false, errors, warnings }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ready: true, approvedForms: approved.forms.length, warnings }, null, 2));
}

async function readJson(file, label) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`Missing or unreadable ${label}: ${file} (${error.message})`);
    return {};
  }
}
