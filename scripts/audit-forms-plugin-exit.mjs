#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/audit/forms-plugin-exit-audit.json");
const PUBLIC = path.join(ROOT, "data/migration/forms-public-evidence.json");
const APPROVED = path.join(ROOT, "data/forms/definitions.approved.json");

const publicEvidence = JSON.parse(readFileSync(PUBLIC, "utf8"));
const approved = JSON.parse(readFileSync(APPROVED, "utf8"));

const forms = approved.forms || [];
const byRoute = new Map();
for (const form of forms) {
  for (const route of form.sourceRoutes || []) byRoute.set(route, form);
}

const report = {
  generatedAt: new Date().toISOString(),
  policy: "Native Next UI + same-origin /api/forms/submit forwarding to Fluent Forms public admin-ajax endpoint.",
  inventoryStatus: approved.inventoryStatus,
  submissionActivationStatus: approved.submissionActivationStatus,
  homepage: {
    route: "/",
    fluentFormId: 1,
    state: byRoute.get("/")?.activationEnabled ? "SUBMISSION_ENABLED" : "DISPLAY_ONLY_SUBMISSION_DISABLED",
    dataSubmissionAttribute: byRoute.get("/")?.activationEnabled ? "enabled" : "disabled",
    approvedDefinitionPresent: Boolean(byRoute.get("/")),
  },
  contact: {
    route: "/contact-us/",
    fluentFormId: 1,
    state: byRoute.get("/contact-us/")?.activationEnabled ? "SUBMISSION_ENABLED" : "DISPLAY_ONLY_SUBMISSION_DISABLED",
    dataSubmissionAttribute: byRoute.get("/contact-us/")?.activationEnabled ? "enabled" : "disabled",
    approvedDefinitionPresent: Boolean(byRoute.get("/contact-us/")),
  },
  formsActivated: forms.filter((form) => form.activationEnabled).map((form) => form.fluentFormId),
  routeMappings: publicEvidence.forms.map((item) => ({
    route: item.route,
    fluentFormId: item.fluentFormId,
    approved: Boolean(byRoute.get(item.route)),
  })),
  stagingDummySubmissionTested: false,
  emailCrmWebhookResult: approved.emailCrmWebhookResult || "NOT_TESTED",
  dummySubmissionResult: approved.dummySubmissionResult || "NOT_TESTED",
  architecture: {
    nextJsEndpoint: "/api/forms/submit/",
    wordpressEndpointClass: "public-admin-ajax",
    credentialsInBrowser: false,
  },
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
