#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFluentFormsAjaxParams,
  inspectFluentFormsAjaxBody,
  interpretFluentAjaxResponse,
  nonceFieldName,
  parseFluentFormData,
} from "../lib/forms/fluent-ajax-payload.mjs";

const CONTEXT = {
  fluentFormId: 3,
  route: "/services/seo-services-in-mumbai/",
  sanitizedFields: {
    "names[first_name]": "DGS",
    "names[last_name]": "E2E",
    email: "person@example.com",
    phone: "+919876543210",
  },
  captchaToken: "captcha-token-value",
  nonce: "route-scoped-nonce",
  embeddedPostId: "40278",
  captchaProvider: "recaptcha",
  submissionAction: "fluentform_submit",
};

test("outer Fluent Forms ajax body uses native action/form_id/data contract", () => {
  const body = buildFluentFormsAjaxParams(CONTEXT);
  const inspected = inspectFluentFormsAjaxBody(body);

  assert.equal(inspected.action, "fluentform_submit");
  assert.equal(inspected.formId, "3");
  assert.deepEqual(inspected.keys.sort(), ["action", "data", "form_id"]);
  assert.equal(inspected.dataCount, 1);
  assert.equal(inspected.hasOuterBracketParams, false);
  assert.equal(body.has("data[email]"), false);
  assert.equal(body.has("data[names][first_name]"), false);
  assert.equal(body.toString().includes("data[email]="), false);
  assert.equal(body.toString().includes("data[phone]="), false);
  assert.equal(body.toString().includes("data[names][first_name]="), false);
});

test("inner serialized data reconstructs fields, nested names, nonce, post id, referer, captcha", () => {
  const inspected = inspectFluentFormsAjaxBody(buildFluentFormsAjaxParams(CONTEXT));
  const inner = inspected.innerFields;

  assert.equal(inner.email, "person@example.com");
  assert.equal(inner.phone, "+919876543210");
  assert.equal(inner["names[first_name]"], "DGS");
  assert.equal(inner["names[last_name]"], "E2E");
  assert.equal(inner[nonceFieldName(3)], "route-scoped-nonce");
  assert.equal(inner.__fluent_form_embded_post_id, "40278");
  assert.equal(inner._wp_http_referer, "/services/seo-services-in-mumbai/");
  assert.equal(inner["g-recaptcha-response"], "captcha-token-value");
  assert.equal(inner["cf-turnstile-response"], undefined);

  const roundTrip = parseFluentFormData(inspected.innerSerialized);
  assert.equal(roundTrip["names[first_name]"], "DGS");
});

test("turnstile token is forwarded as cf-turnstile-response inside inner data", () => {
  const inspected = inspectFluentFormsAjaxBody(
    buildFluentFormsAjaxParams({ ...CONTEXT, captchaProvider: "turnstile" }),
  );
  assert.equal(inspected.innerFields["cf-turnstile-response"], "captcha-token-value");
  assert.equal(inspected.innerFields["g-recaptcha-response"], undefined);
  assert.equal(inspected.hasOuterBracketParams, false);
});

test("homepage Form 1 inner data keeps names[first_name] and referer", () => {
  const inspected = inspectFluentFormsAjaxBody(
    buildFluentFormsAjaxParams({
      fluentFormId: 1,
      route: "/",
      sanitizedFields: {
        "names[first_name]": "DGS 2C1A",
        email: "person@example.com",
        dropdown: "Search Engine Optimization",
      },
      captchaToken: "home-captcha",
      nonce: "home-nonce",
      embeddedPostId: "63505",
    }),
  );
  assert.equal(inspected.action, "fluentform_submit");
  assert.equal(inspected.formId, "1");
  assert.equal(inspected.innerFields["names[first_name]"], "DGS 2C1A");
  assert.equal(inspected.innerFields._wp_http_referer, "/");
  assert.equal(inspected.innerFields.__fluent_form_embded_post_id, "63505");
  assert.equal(inspected.innerFields[nonceFieldName(1)], "home-nonce");
  assert.equal(inspected.innerFields["g-recaptcha-response"], "home-captcha");
});

test("wp_send_json_success nested insert_id is extracted", () => {
  const interpreted = interpretFluentAjaxResponse(
    {
      success: true,
      data: {
        insert_id: 4417,
        result: true,
        message: "Thank you for your message. We will get in touch with you shortly",
      },
    },
    true,
  );
  assert.equal(interpreted.success, true);
  assert.equal(interpreted.submissionId, 4417);
  assert.match(String(interpreted.message), /Thank you/);
});

test("wp_send_json_error nested field errors are extracted", () => {
  const interpreted = interpretFluentAjaxResponse(
    {
      success: false,
      data: {
        errors: { email: ["This field must contain a valid email"] },
        message: "Validation failed",
      },
    },
    true,
  );
  assert.equal(interpreted.success, false);
  assert.equal(interpreted.fieldErrors.email, "This field must contain a valid email");
  assert.equal(interpreted.message, "Validation failed");
});

test("legacy top-level insert_id still works", () => {
  const interpreted = interpretFluentAjaxResponse({ success: true, insert_id: 99, message: "ok" }, true);
  assert.equal(interpreted.success, true);
  assert.equal(interpreted.submissionId, 99);
});
