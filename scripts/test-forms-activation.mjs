#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buildValidFields,
  getById,
  getByRoute,
  listForms,
  mockSubmit,
  resolveFormContextFromHtml,
  validatePayload,
} from "./lib/forms-validation.mjs";
import {
  HOMEPAGE_SERVICE_UI_TO_FORM1,
  normalizeHomepageBridgeFields,
  normalizeHomepageServiceDropdown,
} from "../lib/forms/homepage-service-normalize.mjs";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const definitions = JSON.parse(readFileSync(path.join(ROOT, "data/forms/definitions.approved.json"), "utf8"));
const publicEvidence = JSON.parse(readFileSync(path.join(ROOT, "data/migration/forms-public-evidence.json"), "utf8"));
const REQUIRED_IDS = [1, 3, 4, 6, 9, 10, 11, 19, 20, 21, 26];
const REQUIRED_MAPPINGS = [
  { id: 1, routes: ["/", "/contact-us/"] },
  { id: 3, routes: ["/services/seo-services-in-mumbai/"] },
  { id: 4, routes: ["/services/social-media-marketing/"] },
  { id: 6, routes: ["/services/website-development-amc/"] },
  { id: 9, routes: ["/services/ai-video-production-agency/"] },
  { id: 10, routes: ["/services/branding/"] },
  { id: 11, routes: ["/services/content-creation/"] },
  { id: 19, routes: ["/services/aeo-services-in-mumbai/"] },
  { id: 20, routes: ["/services/llm-seo-service/"] },
  { id: 21, routes: ["/services/geo/"] },
  { id: 26, routes: ["/services/performance-marketing/"] },
];

test("all 11 form IDs are approved", () => {
  assert.deepEqual(listForms().map((form) => form.fluentFormId).sort((a, b) => a - b), REQUIRED_IDS);
});

test("all required route mappings including shared form 1", () => {
  for (const mapping of REQUIRED_MAPPINGS) {
    for (const route of mapping.routes) {
      assert.equal(getByRoute(route)?.fluentFormId, mapping.id, `${route} → ${mapping.id}`);
    }
  }
  assert.equal(publicEvidence.forms.length, 12);
  for (const item of publicEvidence.forms) {
    assert.equal(getByRoute(item.route)?.fluentFormId, item.fluentFormId);
  }
});

test("field-key parity with public WordPress evidence", () => {
  for (const item of publicEvidence.forms) {
    const definition = getByRoute(item.route);
    const allowed = new Set(definition.allowedFieldKeys);
    for (const field of item.fields || []) assert.ok(allowed.has(field), `${item.route} missing ${field}`);
  }
});

test("homepage UI service options normalize and pass Form 1 validator", () => {
  const definition = getById(1);
  const uiOptions = Object.keys(HOMEPAGE_SERVICE_UI_TO_FORM1);
  assert.equal(uiOptions.length, 5);

  for (const uiValue of uiOptions) {
    const fields = buildValidFields(definition, { dropdown: uiValue });
    const normalized = normalizeHomepageBridgeFields(fields);
    assert.equal(normalized.dropdown, HOMEPAGE_SERVICE_UI_TO_FORM1[uiValue], `normalize ${uiValue}`);
    const result = validatePayload({
      fluentFormId: 1,
      route: "/",
      fields: normalized,
      captchaToken: "token",
    });
    assert.equal(result.ok, true, `Form 1 validator rejected normalized value for UI option ${uiValue}`);
    assert.equal(result.sanitizedFields.dropdown, HOMEPAGE_SERVICE_UI_TO_FORM1[uiValue]);
  }
});

test("rejects arbitrary form IDs", () => {
  const result = validatePayload({ fluentFormId: 9999, route: "/", fields: { email: "a@b.com" } });
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("rejects route/form mismatch", () => {
  const result = validatePayload({ fluentFormId: 3, route: "/", fields: { email: "a@b.com" } });
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
});

test("rejects unexpected fields", () => {
  const definition = getById(1);
  const visibleKeys = definition.allowedFieldKeys.filter(
    (key) => !definition.fields.some((field) => field.hidden && field.name === key),
  );
  const fields = Object.fromEntries(visibleKeys.map((key) => [key, "x"]));
  fields.unexpected_field = "nope";
  const result = validatePayload({ fluentFormId: 1, route: "/", fields, captchaToken: "token" });
  assert.equal(result.ok, false);
  assert.match(result.message, /Unexpected field/);
});

test("rejects client-supplied hidden field tampering", () => {
  const definition = getById(3);
  const fields = buildValidFields(definition, { hidden: "TAMPERED_VALUE" });
  const result = validatePayload({
    fluentFormId: 3,
    route: "/services/seo-services-in-mumbai/",
    fields,
    captchaToken: "token",
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /Hidden field must not be supplied by client/);
});

test("server-owned hidden defaults are applied without client input", () => {
  const definition = getById(3);
  const fields = buildValidFields(definition);
  const result = validatePayload({
    fluentFormId: 3,
    route: "/services/seo-services-in-mumbai/",
    fields,
    captchaToken: "token",
  });
  assert.equal(result.ok, true);
  assert.equal(result.sanitizedFields.hidden, "SEO Page");
  assert.equal(fields.hidden, undefined);
});

test("service form context fails when only homepage Form 1 nonce is present", () => {
  const definition = getById(3);
  const route = "/services/seo-services-in-mumbai/";
  const poisonedHtml = `
    <input name="_fluentform_1_fluentformnonce" value="homepage-nonce" />
    <input name="__fluent_form_embded_post_id" value="63505" />
    <div class="fluentform_wrapper_3">service form without route nonce</div>
  `;
  const context = resolveFormContextFromHtml(poisonedHtml, definition, route);
  assert.equal(context.ok, false);
  assert.match(context.message, /security token/i);
  assert.notEqual(context.embeddedPostId, "63505");
});

test("service form context uses route-scoped post ID, not homepage Form 1", () => {
  const definition = getById(3);
  const route = "/services/seo-services-in-mumbai/";
  const html = `
    <input name="__fluent_form_embded_post_id" value="63505" />
    <div class="fluentform_wrapper_3">
      <input name="_fluentform_3_fluentformnonce" value="service-nonce-abc" />
      <input name="__fluent_form_embded_post_id" value="40278" />
    </div>
  `;
  const context = resolveFormContextFromHtml(html, definition, route);
  assert.equal(context.ok, true);
  assert.equal(context.nonce, "service-nonce-abc");
  assert.equal(context.embeddedPostId, "40278");
  assert.notEqual(context.embeddedPostId, "63505");
});

test("service form context fails safely when route nonce missing but page ID exists", () => {
  const definition = getById(3);
  const route = "/services/seo-services-in-mumbai/";
  const html = `<div class="fluentform_wrapper_3">no nonce on target page</div>`;
  const context = resolveFormContextFromHtml(html, definition, route);
  assert.equal(context.ok, false);
  assert.equal(context.routePageId, "40278");
  assert.match(context.message, /security token/i);
});

test("rejects privileged secret-like field keys", () => {
  const definition = getById(9);
  const fields = buildValidFields(definition, { api_key: "should-not-pass" });
  const result = validatePayload({
    fluentFormId: 9,
    route: "/services/ai-video-production-agency/",
    fields,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /privileged|Unexpected/i);
});

test("rejects required-field omissions", () => {
  const result = validatePayload({
    fluentFormId: 1,
    route: "/contact-us/",
    fields: { email: "person@example.com" },
    captchaToken: "token",
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 422);
});

test("rejects invalid email and telephone values", () => {
  const definition = getById(1);
  const fields = buildValidFields(definition, { email: "not-an-email", phone: "123" });
  const result = validatePayload({ fluentFormId: 1, route: "/", fields, captchaToken: "token" });
  assert.equal(result.ok, false);
  assert.ok(result.fieldErrors?.email || result.fieldErrors?.phone);
});

test("success validation for every approved form (mocked)", async () => {
  for (const mapping of REQUIRED_MAPPINGS) {
    const definition = getById(mapping.id);
    for (const route of mapping.routes) {
      const fields = buildValidFields(definition);
      const result = await mockSubmit({
        fluentFormId: mapping.id,
        route,
        fields,
        captchaToken: definition.captcha?.enabled ? "mock-captcha-token" : undefined,
      });
      assert.equal(result.ok, true, `form ${mapping.id} @ ${route}`);
      assert.equal(result.state, "success");
      assert.equal(result.submissionId, "mock-entry-not-created");
    }
  }
});

test("mocked backend-error response", async () => {
  const definition = getById(9);
  const result = await mockSubmit(
    {
      fluentFormId: 9,
      route: "/services/ai-video-production-agency/",
      fields: buildValidFields(definition),
    },
    { mode: "backend-error" },
  );
  assert.equal(result.ok, false);
  assert.equal(result.state, "backend-error");
  assert.equal(result.status, 422);
});

test("mocked network-error response", async () => {
  const definition = getById(26);
  const result = await mockSubmit(
    {
      fluentFormId: 26,
      route: "/services/performance-marketing/",
      fields: buildValidFields(definition),
    },
    { mode: "network-error" },
  );
  assert.equal(result.ok, false);
  assert.equal(result.state, "network-error");
  assert.equal(result.status, 502);
});

test("mocked duplicate-click / in-flight guard", async () => {
  const definition = getById(1);
  const payload = {
    fluentFormId: 1,
    route: "/",
    fields: buildValidFields(definition),
    captchaToken: "token",
  };
  const first = await mockSubmit(payload, { mode: "success" });
  assert.equal(first.ok, true);
  const duplicate = await mockSubmit(payload, { mode: "duplicate" });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.state, "duplicate-click");
  const inFlight = await mockSubmit(payload, { inFlight: true });
  assert.equal(inFlight.state, "duplicate-click");
});

test("no literal secrets in definitions or form client/server sources", () => {
  const blob = JSON.stringify(definitions);
  assert.equal(/Basic\s+[A-Za-z0-9+/=]{12,}/.test(blob), false);
  assert.equal(/application[_-]?password\s*[:=]/i.test(blob), false);
  assert.equal(/wp_create_nonce|sk_live_[A-Za-z0-9]+/i.test(blob), false);
  assert.equal(/"secret"\s*:\s*"[^"]+"/i.test(blob), false);

  const scanRoots = [
    "app/api/forms",
    "components/forms",
    "lib/forms",
    "data/forms",
  ];
  const secretPatterns = [
    /Basic\s+[A-Za-z0-9+/=]{20,}/,
    /Authorization:\s*Basic/i,
    /dlI1aSBNMnE0/,
    /wordpress_logged_in_/,
    /sk_live_[A-Za-z0-9]+/,
  ];
  for (const root of scanRoots) {
    const abs = path.join(ROOT, root);
    const files = walkFiles(abs);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of secretPatterns) {
        assert.equal(pattern.test(text), false, `${file} matched ${pattern}`);
      }
    }
  }
});

function homepageFormSsrHtml() {
  const source = readFileSync(path.join(ROOT, "lib/wp-exact/build-mirror-swap-html.ts"), "utf8");
  const fnStart = source.indexOf("export function buildHomeFormHtml");
  assert.ok(fnStart >= 0, "buildHomeFormHtml is exported");
  const tickStart = source.indexOf("`", fnStart);
  const tickEnd = source.indexOf("`;", tickStart + 1);
  assert.ok(tickStart >= 0 && tickEnd > tickStart, "buildHomeFormHtml returns a template string");
  return source.slice(tickStart + 1, tickEnd);
}

function simulateHomeFormBridgeActivation(html) {
  const $ = cheerio.load(html);
  const form = $("#fluentform_1");
  form.attr("data-submission", "enabled");
  form.removeAttr("readonly");
  form.find("input, textarea, select").each((_, el) => {
    const node = $(el);
    node.removeAttr("readonly");
    node.removeAttr("disabled");
    node.prop("disabled", false);
  });
  const button = form.find("button.ff-btn-submit, button[type='button'], button[type='submit']").first();
  button.removeAttr("disabled");
  button.removeAttr("aria-disabled");
  button.prop("disabled", false);
  button.attr("type", "submit");
  return $;
}

function homepageFormOverridesCss() {
  return readFileSync(path.join(ROOT, "lib/wp-exact/wp-mirror-overrides.css"), "utf8");
}

function cssRule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  return match ? match[1] : "";
}

test("homepage Service select keeps all five UI options and readable native popup text", () => {
  const $ = cheerio.load(homepageFormSsrHtml());
  const values = $("#fluentform_1 select[name='dropdown'] option")
    .toArray()
    .map((el) => $(el).attr("value"))
    .filter((value) => value);
  assert.deepEqual(values, ["SEO", "AEO", "GEO", "AI Video Production", "Website Development"]);

  const css = homepageFormOverridesCss();
  const closedSelect = cssRule(css, "#contact-form .dgs-v1215-form-shortcode select.ff-el-form-control");
  assert.match(closedSelect, /color:\s*#fff\s*!important/);
  assert.doesNotMatch(closedSelect, /option/);

  const optionRule = cssRule(css, "#contact-form .dgs-v1215-form-shortcode select.ff-el-form-control option");
  assert.match(optionRule, /color:\s*#111(?:111)?\s*!important/);
  assert.match(optionRule, /background-color:\s*#fff(?:fff)?\s*!important/);
});

test("homepage submit cursor follows actual disabled state", () => {
  const css = homepageFormOverridesCss();
  const base = cssRule(css, "#contact-form .dgs-v1215-form-shortcode .ff-btn-submit");
  assert.doesNotMatch(base, /cursor:\s*not-allowed/);
  assert.doesNotMatch(base, /cursor:\s*pointer/);

  const disabled = cssRule(css, "#contact-form .dgs-v1215-form-shortcode .ff-btn-submit:disabled");
  assert.match(disabled, /cursor:\s*not-allowed\s*!important/);

  const enabled = cssRule(css, "#contact-form .dgs-v1215-form-shortcode .ff-btn-submit:not(:disabled)");
  assert.match(enabled, /cursor:\s*pointer\s*!important/);
  assert.match(enabled, /opacity:\s*1\s*!important/);

  const html = homepageFormSsrHtml();
  const $ssr = cheerio.load(html);
  assert.ok($ssr("#fluentform_1 button.ff-btn-submit").attr("disabled") != null);
  const $bound = simulateHomeFormBridgeActivation(html);
  assert.equal($bound("#fluentform_1 button.ff-btn-submit").attr("disabled"), undefined);
});

test("homepage SSR text fields are editable before hydration", () => {
  const html = homepageFormSsrHtml();
  assert.doesNotMatch(html, /\breadonly\b/);
  const $ = cheerio.load(html);
  const textControls = $("#fluentform_1 input[type='text'], #fluentform_1 input[type='email'], #fluentform_1 input[type='tel'], #fluentform_1 textarea");
  assert.equal(textControls.length, 6);
  textControls.each((_, el) => {
    const node = $(el);
    assert.equal(node.attr("readonly"), undefined, `${node.attr("name")} must not be readonly before hydration`);
    assert.equal(node.attr("disabled"), undefined, `${node.attr("name")} must not be disabled before hydration`);
  });
  assert.equal($("#fluentform_1").attr("data-submission"), "disabled");
});

test("homepage SSR submit stays disabled until HomeFormBridge binds", () => {
  const html = homepageFormSsrHtml();
  const $ssr = cheerio.load(html);
  const ssrButton = $ssr("#fluentform_1 button.ff-btn-submit");
  assert.equal(ssrButton.length, 1);
  assert.ok(ssrButton.attr("disabled") != null);
  assert.equal(ssrButton.attr("aria-disabled"), "true");
  assert.equal(ssrButton.attr("type"), "button");
  assert.equal($ssr("#fluentform_1").attr("data-submission"), "disabled");

  const homeBridge = readFileSync(path.join(ROOT, "components/forms/HomeFormBridge.tsx"), "utf8");
  assert.match(homeBridge, /form\.setAttribute\("data-submission", "enabled"\)/);
  assert.match(homeBridge, /button\.disabled = false/);
  assert.match(homeBridge, /button\.removeAttribute\("aria-disabled"\)/);
  assert.match(homeBridge, /button\.type = "submit"/);
  assert.match(homeBridge, /form\.addEventListener\("submit", onSubmit\)/);

  const $bound = simulateHomeFormBridgeActivation(html);
  const boundButton = $bound("#fluentform_1 button.ff-btn-submit");
  assert.equal($bound("#fluentform_1").attr("data-submission"), "enabled");
  assert.equal(boundButton.attr("disabled"), undefined);
  assert.equal(boundButton.attr("aria-disabled"), undefined);
  assert.equal(boundButton.attr("type"), "submit");
});

test("homepage UI option SEO still normalizes to Search Engine Optimization", () => {
  assert.equal(normalizeHomepageServiceDropdown("SEO"), "Search Engine Optimization");
  const fields = buildValidFields(getById(1), { dropdown: "SEO" });
  const normalized = normalizeHomepageBridgeFields(fields);
  assert.equal(normalized.dropdown, "Search Engine Optimization");
  const result = validatePayload({
    fluentFormId: 1,
    route: "/",
    fields: normalized,
    captchaToken: "token",
  });
  assert.equal(result.ok, true);
  assert.equal(result.sanitizedFields.dropdown, "Search Engine Optimization");
  const rawRejected = validatePayload({
    fluentFormId: 1,
    route: "/",
    fields: buildValidFields(getById(1), { dropdown: "SEO" }),
    captchaToken: "token",
  });
  assert.equal(rawRejected.ok, false);
  assert.match(String(rawRejected.fieldErrors?.dropdown || rawRejected.message), /Invalid option|Service/);
});

test("homepage captcha remains required after editability fix", () => {
  const definition = getById(1);
  const fields = normalizeHomepageBridgeFields(buildValidFields(definition, { dropdown: "SEO" }));
  const missing = validatePayload({ fluentFormId: 1, route: "/", fields });
  assert.equal(missing.ok, false);
  assert.equal(missing.status, 422);
  assert.match(missing.message, /CAPTCHA verification is required/);
  const empty = validatePayload({ fluentFormId: 1, route: "/", fields, captchaToken: "" });
  assert.equal(empty.ok, false);
  assert.match(empty.message, /CAPTCHA verification is required/);

  const homeBridge = readFileSync(path.join(ROOT, "components/forms/HomeFormBridge.tsx"), "utf8");
  assert.match(homeBridge, /renderRecaptchaV2/);
  assert.match(homeBridge, /CAPTCHA verification is required/);
  assert.match(homeBridge, /captchaWidget\?\.getToken\(\)/);
  assert.doesNotMatch(homeBridge, /grecaptcha\.execute/);
});

test("activation, provenance, and data-submission enabled wiring", () => {
  for (const form of listForms()) {
    assert.equal(form.activationEnabled, true);
    assert.equal(form.approvalState, "APPROVED_FOR_IMPLEMENTATION");
    assert.ok(form.provenance?.sourceExportSha256);
    assert.match(String(form.provenance?.source || ""), /authenticated/i);
    assert.equal(form.backend.submissionEndpointClass, "public-admin-ajax");
    assert.match(form.backend.submissionEndpoint, /admin-ajax\.php$/);
  }

  const fluentLead = readFileSync(path.join(ROOT, "components/forms/FluentLeadForm.tsx"), "utf8");
  assert.match(fluentLead, /data-submission="enabled"/);
  assert.match(fluentLead, /backend-error/);
  assert.match(fluentLead, /network-error/);
  assert.match(fluentLead, /submittingRef/);
  assert.doesNotMatch(fluentLead, /data-submission="disabled"/);

  const homeBridge = readFileSync(path.join(ROOT, "components/forms/HomeFormBridge.tsx"), "utf8");
  assert.match(homeBridge, /data-submission/);
  assert.match(homeBridge, /\/api\/forms\/submit\//);
  assert.match(homeBridge, /fluentform_1/);
  assert.match(homeBridge, /renderRecaptchaV2/);

  const routeApi = readFileSync(path.join(ROOT, "app/api/forms/submit/route.ts"), "utf8");
  assert.match(routeApi, /validateClientSubmitPayload/);
  assert.match(routeApi, /forwardToFluentForms/);
  assert.doesNotMatch(routeApi, /Authorization|application_password|FLUENTFORM_.*SECRET/i);

  const submitAdapter = readFileSync(path.join(ROOT, "lib/forms/submit.ts"), "utf8");
  assert.match(submitAdapter, /buildFluentFormsAjaxParams/);
  assert.match(submitAdapter, /interpretFluentAjaxResponse/);
  assert.doesNotMatch(submitAdapter, /data\[\$\{/);
  assert.doesNotMatch(submitAdapter, /form\.set\(`data\[/);
});

test("definitions status flags for activation", () => {
  assert.equal(definitions.inventoryStatus, "AUTHENTICATED_INVENTORY_CAPTURED");
  assert.equal(definitions.submissionActivationStatus, "ENABLED_FOR_VERIFIED_FORMS");
  assert.equal(definitions.dummySubmissionResult, "NOT_TESTED");
});

function walkFiles(dir) {
  const out = [];
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}
