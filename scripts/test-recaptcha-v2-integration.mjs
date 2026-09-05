#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const definitions = JSON.parse(readFileSync(path.join(ROOT, "data/forms/definitions.approved.json"), "utf8"));
const captchaClient = readFileSync(path.join(ROOT, "components/forms/captcha-client.ts"), "utf8");
const fluentLead = readFileSync(path.join(ROOT, "components/forms/FluentLeadForm.tsx"), "utf8");
const homeBridge = readFileSync(path.join(ROOT, "components/forms/HomeFormBridge.tsx"), "utf8");

test("verified recaptcha forms are marked v2_explicit from live WordPress evidence", () => {
  const recaptchaForms = definitions.forms.filter((form) => form.captcha?.provider === "recaptcha");
  assert.ok(recaptchaForms.length >= 3);
  for (const form of recaptchaForms) {
    assert.equal(form.captcha.version, "v2_explicit", `form ${form.fluentFormId}`);
    assert.equal(form.captcha.publicSiteKey, "6LfK6VgsAAAAAFeLVFPu7qFDLc4phIeAPApUFy-k");
  }
  const e2eIds = [1, 3, 19];
  for (const id of e2eIds) {
    const form = definitions.forms.find((item) => item.fluentFormId === id);
    assert.equal(form.captcha.provider, "recaptcha");
    assert.equal(form.captcha.version, "v2_explicit");
  }
});

test("shared captcha helper loads explicit v2 API and renders a visible widget", () => {
  assert.match(captchaClient, /api\.js\?render=explicit/);
  assert.match(captchaClient, /grecaptcha\.render/);
  assert.match(captchaClient, /expired-callback/);
  assert.match(captchaClient, /error-callback/);
  assert.match(captchaClient, /grecaptcha\?\.reset/);
  assert.match(captchaClient, /getResponse/);
  assert.doesNotMatch(captchaClient, /api\.js\?render=\$\{siteKey\}/);
  assert.doesNotMatch(captchaClient, /grecaptcha\?\.execute/);
  assert.doesNotMatch(captchaClient, /action:\s*"fluentform_submit"/);
});

test("FluentLeadForm and HomeFormBridge use the shared v2 helper, not v3 execute", () => {
  assert.match(fluentLead, /renderRecaptchaV2/);
  assert.match(fluentLead, /data-recaptcha-v2-host/);
  assert.match(fluentLead, /submittingRef/);
  assert.match(fluentLead, /CAPTCHA verification is required/);
  assert.doesNotMatch(fluentLead, /grecaptcha\.execute/);
  assert.doesNotMatch(fluentLead, /api\.js\?render=\$\{/);

  assert.match(homeBridge, /renderRecaptchaV2/);
  assert.match(homeBridge, /ensureHomepageRecaptchaHost/);
  assert.match(homeBridge, /CAPTCHA verification is required/);
  assert.match(homeBridge, /restoreSubmitChrome/);
  assert.doesNotMatch(homeBridge, /grecaptcha\.execute/);
  assert.doesNotMatch(homeBridge, /api\.js\?render=\$\{/);
  assert.doesNotMatch(homeBridge, /normalizeHomepageServiceDropdown/);
});

test("homepage service mapping file is unchanged", () => {
  const normalize = readFileSync(path.join(ROOT, "lib/forms/homepage-service-normalize.mjs"), "utf8");
  assert.match(normalize, /SEO:\s*"Search Engine Optimization"/);
  assert.match(normalize, /AEO:\s*"AEO "/);
  assert.match(normalize, /GEO:\s*"GEO"/);
  assert.match(normalize, /"AI Video Production":\s*"Video Production"/);
  assert.match(normalize, /"Website Development":\s*"Website Design & Development"/);
});
