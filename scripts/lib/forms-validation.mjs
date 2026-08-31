import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const definitions = JSON.parse(
  readFileSync(path.join(ROOT, "data/forms/definitions.approved.json"), "utf8"),
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
const FORBIDDEN_CLIENT_KEYS = [
  "authorization",
  "cookie",
  "password",
  "application_password",
  "api_key",
  "apitoken",
  "webhook",
  "secret",
];

export function listForms() {
  return definitions.forms || [];
}

export function getById(id) {
  return listForms().find((form) => Number(form.fluentFormId) === Number(id)) || null;
}

export function getByRoute(route) {
  return (
    listForms().find((form) => (form.sourceRoutes || []).includes(route) || form.sourceRoute === route) ||
    null
  );
}

export function buildValidFields(definition, overrides = {}) {
  const fields = {};
  for (const field of definition.fields || []) {
    if (field.hidden || field.type === "captcha") continue;
    if (field.type === "email") fields[field.name] = "person@example.com";
    else if (field.type === "url") fields[field.name] = "https://example.com";
    else if (field.type === "tel") fields[field.name] = "+919876543210";
    else if ((field.type === "select" || field.type === "radio") && field.options?.[0]) {
      fields[field.name] = field.options[0].value;
    } else if (field.type === "checkbox" && field.options?.[0]) {
      fields[field.name] = field.options[0].value;
    } else fields[field.name] = "Test value";
  }
  return { ...fields, ...overrides };
}

export function validatePayload(input) {
  if (!input || typeof input !== "object") return { ok: false, message: "Invalid submission payload", status: 400 };
  const fluentFormId = Number(input.fluentFormId);
  const route = typeof input.route === "string" ? input.route : "";
  const fields = input.fields && typeof input.fields === "object" ? input.fields : null;
  if (!Number.isInteger(fluentFormId) || fluentFormId <= 0) return { ok: false, message: "Invalid form ID", status: 400 };
  if (!route.startsWith("/")) return { ok: false, message: "Invalid route", status: 400 };
  if (!fields) return { ok: false, message: "Missing fields", status: 400 };

  const definition = getById(fluentFormId);
  if (!definition) return { ok: false, message: "Form ID is not allowlisted", status: 403 };
  const mapped = getByRoute(route);
  if (!mapped || Number(mapped.fluentFormId) !== fluentFormId) {
    return { ok: false, message: "Route/form mismatch", status: 403 };
  }

  for (const key of Object.keys(fields)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_CLIENT_KEYS.some((forbidden) => lower.includes(forbidden))) {
      return { ok: false, message: "Unexpected privileged field", status: 400 };
    }
  }

  const allowed = new Set(definition.allowedFieldKeys || []);
  for (const key of Object.keys(fields)) {
    if (!allowed.has(key)) return { ok: false, message: `Unexpected field: ${key}`, status: 400 };
  }

  const fieldErrors = {};
  const sanitizedFields = {};
  for (const field of definition.fields || []) {
    if (field.hidden) {
      if (field.defaultValue) sanitizedFields[field.name] = String(field.defaultValue);
      continue;
    }
    if (field.type === "captcha") continue;
    const raw = fields[field.name];
    const value = raw == null ? "" : String(raw).trim();
    if (field.required && !value) {
      fieldErrors[field.name] = `${field.label} is required`;
      continue;
    }
    if (!value) continue;
    if (field.type === "email" && !EMAIL_RE.test(value)) fieldErrors[field.name] = "Enter a valid email address";
    else if (field.type === "url" && !URL_RE.test(value)) fieldErrors[field.name] = "Enter a valid URL";
    else if (field.type === "tel" && value.replace(/[^\d+]/g, "").length < 7) {
      fieldErrors[field.name] = "Enter a valid phone number";
    } else sanitizedFields[field.name] = value;
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please correct the highlighted fields", fieldErrors, status: 422 };
  }
  if (definition.captcha?.enabled && !input.captchaToken) {
    return { ok: false, message: "CAPTCHA verification is required", status: 422 };
  }
  return {
    ok: true,
    definition,
    sanitizedFields,
    captchaToken: typeof input.captchaToken === "string" ? input.captchaToken : undefined,
  };
}

/**
 * Mocked submission pipeline — never contacts WordPress.
 * Modes: success | backend-error | network-error | duplicate
 */
export async function mockSubmit(input, options = {}) {
  const mode = options.mode || "success";
  const inFlight = options.inFlight === true;
  if (inFlight || mode === "duplicate") {
    return { ok: false, status: 409, message: "Duplicate submission blocked", state: "duplicate-click" };
  }

  const validated = validatePayload(input);
  if (!validated.ok) {
    return { ...validated, state: "validation-error" };
  }

  if (mode === "network-error") {
    return {
      ok: false,
      status: 502,
      message: "Network error while submitting the form. Please try again.",
      state: "network-error",
    };
  }

  if (mode === "backend-error") {
    return {
      ok: false,
      status: 422,
      message: options.backendMessage || "Submission failed",
      fieldErrors: options.fieldErrors || { email: "Backend rejected this value" },
      state: "backend-error",
    };
  }

  // Ensure only allowlisted keys would be forwarded
  const allowed = new Set(validated.definition.allowedFieldKeys || []);
  for (const key of Object.keys(validated.sanitizedFields)) {
    if (!allowed.has(key)) {
      return { ok: false, status: 400, message: `Unexpected field: ${key}`, state: "validation-error" };
    }
  }

  return {
    ok: true,
    status: 200,
    message: validated.definition.confirmation?.message || "Thank you for your submission.",
    submissionId: "mock-entry-not-created",
    forwardedFieldKeys: Object.keys(validated.sanitizedFields).sort(),
    state: "success",
  };
}
