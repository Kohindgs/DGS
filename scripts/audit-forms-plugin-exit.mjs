#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/forms-plugin-exit-audit.json");
const PUBLIC = path.join(ROOT, "data/migration/forms-public-evidence.json");
const APPROVED = path.join(ROOT, "data/forms/definitions.approved.json");

const publicEvidence = JSON.parse(readFileSync(PUBLIC, "utf8"));
const approved = JSON.parse(readFileSync(APPROVED, "utf8"));

const requiredForms = (publicEvidence.forms || []).filter((form) =>
  ["/", "/contact-us/"].includes(form.route),
);

const report = {
  generatedAt: new Date().toISOString(),
  policy: "Native Next UI + controlled submission endpoint. Fluent Forms backend only when authenticated configuration is available.",
  homepage: {
    route: "/",
    fluentFormId: 1,
    state: "DISPLAY_ONLY_SUBMISSION_DISABLED",
    dataSubmissionAttribute: "disabled",
    publicFieldEvidence: requiredForms.find((f) => f.route === "/")?.fields || [],
    approvedDefinitionPresent: (approved.forms || []).some((f) => f.sourceRoute === "/"),
    activationBlocker: "Authenticated Fluent Forms backend configuration not approved in data/forms/definitions.approved.json",
  },
  contact: {
    route: "/contact-us/",
    fluentFormId: 1,
    state: "DISPLAY_ONLY_SUBMISSION_DISABLED",
    dataSubmissionAttribute: "disabled",
    publicFieldEvidence: requiredForms.find((f) => f.route === "/contact-us/")?.fields || [],
    approvedDefinitionPresent: (approved.forms || []).some((f) => f.sourceRoute === "/contact-us/"),
    activationBlocker: "Authenticated Fluent Forms backend configuration not approved in data/forms/definitions.approved.json",
  },
  stagingDummySubmissionTested: false,
  emailCrmWebhookResult: "NOT_TESTED — submissions remain disabled",
  remainingActivationBlocker:
    "Populate data/forms/definitions.approved.json from authenticated WordPress Fluent Forms admin (read-only inventory). No customer PII inspection performed.",
  inventoryNotes: {
    fieldOrder: "See data/migration/forms-public-evidence.json public markup evidence",
    captcha: "reCAPTCHA markup evidenced on tier-0 service routes; homepage/contact use Fluent Form 1 presentation only",
    successBehavior: "UNKNOWN until backend endpoint configured",
    failureBehavior: "UNKNOWN until backend endpoint configured",
  },
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
