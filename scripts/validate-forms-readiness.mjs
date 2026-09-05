#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_FILE = path.join(ROOT, "data/migration/forms-public-evidence.json");
const APPROVED_FILE = path.join(ROOT, "data/forms/definitions.approved.json");

const REQUIRED_IDS = [1, 3, 4, 6, 9, 10, 11, 19, 20, 21, 26];
  const SECRET_RE = /\b(authorization\s*[:=]|api[_-]?key\s*[:=]|webhook\.|password\s*[:=]|bearer\s+[a-z0-9]|Basic\s+[A-Za-z0-9+/=]{20,})/i;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const errors = [];
const warnings = [];
const [publicEvidence, approved] = await Promise.all([
  readJson(PUBLIC_FILE, "public form evidence"),
  readJson(APPROVED_FILE, "approved form definitions"),
]);

if (!errors.length) {
  const forms = approved.forms || [];
  const approvedByRoute = new Map();
  const ids = new Set();
  const routes = new Set();

  if (approved.inventoryStatus !== "AUTHENTICATED_INVENTORY_CAPTURED") {
    errors.push("inventoryStatus must be AUTHENTICATED_INVENTORY_CAPTURED");
  }
  if (!(forms.length >= 11)) errors.push(`Expected at least 11 unique form definitions, found ${forms.length}`);

  for (const definition of forms) {
    const id = Number(definition.fluentFormId);
    if (ids.has(id)) errors.push(`Duplicate Fluent Form ID ${id}`);
    ids.add(id);

    if (!definition.provenance?.sourceExportSha256) errors.push(`Form ${id}: missing sourceExportSha256`);
    if (!definition.provenance?.retrievedAt) errors.push(`Form ${id}: missing retrievedAt`);
    if (/public/i.test(String(definition.provenance?.source || "")) && !/authenticated/i.test(String(definition.provenance?.source || ""))) {
      errors.push(`Form ${id}: public-evidence-only provenance is not accepted`);
    }
    if (!Array.isArray(definition.fields) || !definition.fields.length) errors.push(`Form ${id}: missing fields`);
    if (!Array.isArray(definition.allowedFieldKeys) || !definition.allowedFieldKeys.length) {
      errors.push(`Form ${id}: missing allowedFieldKeys`);
    }

    const fieldNames = new Set();
    for (const [index, field] of (definition.fields || []).entries()) {
      if (!field.name || !field.type) errors.push(`Form ${id}: incomplete field at index ${index}`);
      if (fieldNames.has(field.name)) errors.push(`Form ${id}: duplicate field name ${field.name}`);
      fieldNames.add(field.name);
      if ((field.type === "select" || field.type === "radio" || field.type === "checkbox") && !Array.isArray(field.options)) {
        errors.push(`Form ${id}:${field.name}: options required`);
      }
      if (field.conditionalLogic == null) errors.push(`Form ${id}:${field.name}: missing conditionalLogic`);
    }

    const routeList = definition.sourceRoutes?.length
      ? definition.sourceRoutes
      : definition.sourceRoute
        ? [definition.sourceRoute]
        : [];
    if (!routeList.length) errors.push(`Form ${id}: missing sourceRoutes`);
    for (const route of routeList) {
      if (routes.has(route)) errors.push(`Duplicate route mapping ${route}`);
      routes.add(route);
      approvedByRoute.set(route, definition);
    }

    if (definition.backend?.adapter !== "fluent-forms-wordpress") {
      errors.push(`Form ${id}: unsupported adapter ${definition.backend?.adapter}`);
    }
    if (!definition.backend?.submissionEndpoint) errors.push(`Form ${id}: missing submission endpoint`);

    const serialized = JSON.stringify(definition);
    if (SECRET_RE.test(serialized)) errors.push(`Form ${id}: literal secret-like value present`);
    for (const match of serialized.match(EMAIL_RE) || []) {
      if (!match.endsWith("@example.com")) errors.push(`Form ${id}: literal email present (${match})`);
    }
  }

  for (const id of REQUIRED_IDS) {
    if (!ids.has(id)) errors.push(`Missing required Fluent Form ID ${id}`);
  }

  for (const evidence of publicEvidence.forms || []) {
    const definition = approvedByRoute.get(evidence.route);
    if (!definition) {
      errors.push(`${evidence.route}: no authenticated approved form definition for public Fluent Form ${evidence.fluentFormId}`);
      continue;
    }
    if (Number(definition.fluentFormId) !== Number(evidence.fluentFormId)) {
      errors.push(
        `${evidence.route}: approved Fluent Form ID ${definition.fluentFormId} does not match public evidence ${evidence.fluentFormId}`,
      );
    }
  }

  const shared = approvedByRoute.get("/") && approvedByRoute.get("/contact-us/");
  if (!shared || Number(approvedByRoute.get("/")?.fluentFormId) !== 1 || Number(approvedByRoute.get("/contact-us/")?.fluentFormId) !== 1) {
    errors.push("Shared Form ID 1 must map to both / and /contact-us/");
  }

  if (routes.size !== 12) errors.push(`Expected 12 route mappings, found ${routes.size}`);

  const activationReady = forms.every(
    (form) => form.activationEnabled === true && form.approvalState === "APPROVED_FOR_IMPLEMENTATION",
  );
  if (!activationReady) warnings.push("Not all forms are marked APPROVED_FOR_IMPLEMENTATION/activationEnabled");
}

const result = {
  ready: errors.length === 0,
  inventoryComplete: errors.length === 0,
  submissionActivationReady: errors.length === 0 && (approved.submissionActivationStatus === "ENABLED_FOR_VERIFIED_FORMS"),
  dummySubmissionResult: approved.dummySubmissionResult || "NOT_TESTED",
  emailCrmWebhookResult: approved.emailCrmWebhookResult || "NOT_TESTED",
  approvedForms: (approved.forms || []).length,
  errors,
  warnings,
};

if (errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(result, null, 2));
}

async function readJson(file, label) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    errors.push(`Missing or unreadable ${label}: ${file} (${error.message})`);
    return {};
  }
}
