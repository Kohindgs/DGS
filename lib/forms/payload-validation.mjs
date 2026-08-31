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

function hiddenFieldNames(definition) {
  return new Set((definition.fields || []).filter((field) => field.hidden).map((field) => field.name));
}

function clientAllowedFieldKeys(definition) {
  const hidden = hiddenFieldNames(definition);
  const allowed = definition.allowedFieldKeys || (definition.fields || []).map((field) => field.name);
  return new Set(allowed.filter((key) => !hidden.has(key)));
}

/**
 * Shared payload validation for production (submit.ts) and mocked tests.
 * Hidden/default fields are server-owned; client-supplied hidden keys are rejected.
 */
export function validateFormPayload(input, { getDefinitionById, assertRouteFormMapping }) {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "Invalid submission payload", status: 400 };
  }

  const fluentFormId = Number(input.fluentFormId);
  const route = typeof input.route === "string" ? input.route : "";
  const fields = input.fields && typeof input.fields === "object" ? input.fields : null;

  if (!Number.isInteger(fluentFormId) || fluentFormId <= 0) {
    return { ok: false, message: "Invalid form ID", status: 400 };
  }
  if (!route.startsWith("/")) {
    return { ok: false, message: "Invalid route", status: 400 };
  }
  if (!fields) {
    return { ok: false, message: "Missing fields", status: 400 };
  }

  if (!getDefinitionById(fluentFormId)) {
    return { ok: false, message: "Form ID is not allowlisted", status: 403 };
  }

  let definition;
  try {
    definition = assertRouteFormMapping(route, fluentFormId);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Route/form mismatch",
      status: 403,
    };
  }

  const hidden = hiddenFieldNames(definition);
  const clientAllowed = clientAllowedFieldKeys(definition);
  const fieldErrors = {};
  const sanitizedFields = {};

  for (const key of Object.keys(fields)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_CLIENT_KEYS.some((forbidden) => lower.includes(forbidden))) {
      return { ok: false, message: "Unexpected privileged field", status: 400 };
    }
    if (hidden.has(key)) {
      return { ok: false, message: `Hidden field must not be supplied by client: ${key}`, status: 400 };
    }
    if (!clientAllowed.has(key)) {
      return { ok: false, message: `Unexpected field: ${key}`, status: 400 };
    }
  }

  for (const field of definition.fields || []) {
    if (field.hidden) {
      if (field.defaultValue != null && String(field.defaultValue).length > 0) {
        sanitizedFields[field.name] = String(field.defaultValue);
      }
      continue;
    }
    if (field.type === "captcha") continue;

    const raw = fields[field.name];
    const value =
      raw == null
        ? ""
        : Array.isArray(raw)
          ? raw.map(String).join(",")
          : raw === true
            ? "1"
            : raw === false
              ? ""
              : String(raw).trim();

    if (field.required && !value) {
      fieldErrors[field.name] = field.validationMessages?.required || `${field.label} is required`;
      continue;
    }
    if (!value) continue;

    if (field.type === "email" && !EMAIL_RE.test(value)) {
      fieldErrors[field.name] = field.validationMessages?.email || "Enter a valid email address";
      continue;
    }
    if (field.type === "url" && !URL_RE.test(value)) {
      fieldErrors[field.name] = field.validationMessages?.url || "Enter a valid URL";
      continue;
    }
    if (field.type === "tel" && value.replace(/[^\d+]/g, "").length < 7) {
      fieldErrors[field.name] = field.validationMessages?.phone || "Enter a valid phone number";
      continue;
    }
    if ((field.type === "select" || field.type === "radio") && field.options?.length) {
      const allowedValues = new Set(field.options.map((option) => option.value));
      if (!allowedValues.has(value)) {
        fieldErrors[field.name] = `Invalid option for ${field.label}`;
        continue;
      }
    }

    sanitizedFields[field.name] = value;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: "Please correct the highlighted fields",
      fieldErrors,
      status: 422,
    };
  }

  if (definition.captcha?.enabled && !input.captchaToken) {
    return {
      ok: false,
      message: "CAPTCHA verification is required",
      fieldErrors: { captcha: "CAPTCHA verification is required" },
      status: 422,
    };
  }

  return {
    ok: true,
    definition,
    sanitizedFields,
    captchaToken: typeof input.captchaToken === "string" ? input.captchaToken : undefined,
  };
}
