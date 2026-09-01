import { readFileSync } from "node:fs";
import path from "node:path";
import { validateFormPayload } from "../../lib/forms/payload-validation.mjs";
import { resolveFormContextFromHtml } from "../../lib/forms/form-context.mjs";

const ROOT = process.cwd();
const definitions = JSON.parse(
  readFileSync(path.join(ROOT, "data/forms/definitions.approved.json"), "utf8"),
);

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

function assertRouteFormMapping(route, fluentFormId) {
  const definition = getByRoute(route);
  if (!definition) throw new Error(`No approved form mapped to route ${route}`);
  if (Number(definition.fluentFormId) !== Number(fluentFormId)) {
    throw new Error(`Route ${route} is mapped to Fluent Form ${definition.fluentFormId}, not ${fluentFormId}`);
  }
  if (!definition.activationEnabled || definition.approvalState !== "APPROVED_FOR_IMPLEMENTATION") {
    throw new Error(`Form ${fluentFormId} is not approved for activation`);
  }
  return definition;
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
  return validateFormPayload(input, {
    getDefinitionById: getById,
    assertRouteFormMapping,
  });
}

export { resolveFormContextFromHtml };

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
