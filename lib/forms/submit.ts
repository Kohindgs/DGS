import type { FormDefinition, FormSubmissionResult } from "./types";
import { assertRouteFormMapping, getFormDefinitionById } from "./registry";

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

export type ClientSubmitPayload = {
  fluentFormId: number;
  route: string;
  fields: Record<string, string | string[] | boolean | null | undefined>;
  captchaToken?: string;
};

export type ValidationFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
  status: number;
};

export type ValidationSuccess = {
  ok: true;
  definition: FormDefinition;
  sanitizedFields: Record<string, string>;
  captchaToken?: string;
};

export function validateClientSubmitPayload(input: unknown): ValidationSuccess | ValidationFailure {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "Invalid submission payload", status: 400 };
  }

  const body = input as Partial<ClientSubmitPayload>;
  const fluentFormId = Number(body.fluentFormId);
  const route = typeof body.route === "string" ? body.route : "";
  const fields = body.fields && typeof body.fields === "object" ? body.fields : null;

  if (!Number.isInteger(fluentFormId) || fluentFormId <= 0) {
    return { ok: false, message: "Invalid form ID", status: 400 };
  }
  if (!route.startsWith("/")) {
    return { ok: false, message: "Invalid route", status: 400 };
  }
  if (!fields) {
    return { ok: false, message: "Missing fields", status: 400 };
  }

  if (!getFormDefinitionById(fluentFormId)) {
    return { ok: false, message: "Form ID is not allowlisted", status: 403 };
  }

  let definition: FormDefinition;
  try {
    definition = assertRouteFormMapping(route, fluentFormId);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Route/form mismatch",
      status: 403,
    };
  }

  const allowed = new Set(definition.allowedFieldKeys || definition.fields.map((field) => field.name));
  const fieldErrors: Record<string, string> = {};
  const sanitizedFields: Record<string, string> = {};

  for (const key of Object.keys(fields)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_CLIENT_KEYS.some((forbidden) => lower.includes(forbidden))) {
      return { ok: false, message: "Unexpected privileged field", status: 400 };
    }
    if (!allowed.has(key)) {
      return { ok: false, message: `Unexpected field: ${key}`, status: 400 };
    }
  }

  for (const field of definition.fields) {
    if (field.hidden) {
      if (field.defaultValue) sanitizedFields[field.name] = String(field.defaultValue);
      const provided = fields[field.name];
      if (provided !== undefined && provided !== null && String(provided).length > 0) {
        sanitizedFields[field.name] = String(provided);
      }
      continue;
    }

    const raw = fields[field.name];
    const value = Array.isArray(raw) ? raw.map(String).join(",") : raw === true ? "1" : raw === false ? "" : raw == null ? "" : String(raw).trim();

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

  if (definition.captcha?.enabled && !body.captchaToken) {
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
    captchaToken: typeof body.captchaToken === "string" ? body.captchaToken : undefined,
  };
}

function expandNestedFields(fields: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(/^([^[\]]+)\[([^\]]+)\]$/);
    if (match) {
      const [, parent, child] = match;
      const current = (out[parent] as Record<string, string> | undefined) || {};
      current[child] = value;
      out[parent] = current;
    } else if (key.endsWith("[]")) {
      const base = key.slice(0, -2);
      const existing = (out[base] as string[] | undefined) || [];
      existing.push(value);
      out[base] = existing;
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function fetchPublicFormContext(definition: FormDefinition, route: string) {
  const pageId = definition.backend.wordpressPageIds?.[route];
  const candidateUrls = [
    `https://www.dgeniussolutions.com${route}`,
    "https://www.dgeniussolutions.com/",
  ];

  let html = "";
  let usedUrl = candidateUrls[0];
  for (const url of candidateUrls) {
    const response = await fetch(url, {
      headers: { "User-Agent": "DGS-Form-Submit/2C.1A", Accept: "text/html" },
      cache: "no-store",
    });
    if (!response.ok) continue;
    html = await response.text();
    usedUrl = url;
    if (html.includes(`_fluentform_${definition.fluentFormId}_fluentformnonce`)) break;
  }

  const nonceMatch = html.match(
    new RegExp(`name=["']_fluentform_${definition.fluentFormId}_fluentformnonce["'][^>]*value=["']([^"']+)["']`, "i"),
  ) || html.match(
    new RegExp(`value=["']([^"']+)["'][^>]*name=["']_fluentform_${definition.fluentFormId}_fluentformnonce["']`, "i"),
  );
  const postIdMatch = html.match(/name=["']__fluent_form_embded_post_id["'][^>]*value=["'](\d+)["']/i)
    || html.match(/value=["'](\d+)["'][^>]*name=["']__fluent_form_embded_post_id["']/i);

  return {
    nonce: nonceMatch?.[1] || "",
    embeddedPostId: postIdMatch?.[1] || (pageId ? String(pageId) : ""),
    referer: usedUrl,
  };
}

export async function forwardToFluentForms(options: {
  definition: FormDefinition;
  route: string;
  sanitizedFields: Record<string, string>;
  captchaToken?: string;
}): Promise<FormSubmissionResult> {
  const { definition, route, sanitizedFields, captchaToken } = options;
  const context = await fetchPublicFormContext(definition, route);

  const form = new URLSearchParams();
  form.set("action", definition.backend.submissionAction || "fluentform_submit");
  form.set("form_id", String(definition.fluentFormId));

  const nested = expandNestedFields(sanitizedFields);
  // Fluent Forms expects data as nested object serialized into data[...] keys
  const flatEntries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(sanitizedFields)) {
    flatEntries.push([`data[${key}]`, value]);
  }
  // Also provide nested name fields in PHP-style for compatibility
  for (const [key, value] of Object.entries(nested)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [child, childValue] of Object.entries(value as Record<string, string>)) {
        flatEntries.push([`data[${key}][${child}]`, String(childValue)]);
      }
    }
  }
  for (const [key, value] of flatEntries) form.append(key, value);

  if (context.nonce) {
    form.set(`_fluentform_${definition.fluentFormId}_fluentformnonce`, context.nonce);
    form.set(`data[_fluentform_${definition.fluentFormId}_fluentformnonce]`, context.nonce);
  }
  if (context.embeddedPostId) {
    form.set("__fluent_form_embded_post_id", context.embeddedPostId);
    form.set("data[__fluent_form_embded_post_id]", context.embeddedPostId);
  }
  form.set("_wp_http_referer", route);
  form.set("data[_wp_http_referer]", route);

  if (captchaToken) {
    if (definition.captcha?.provider === "turnstile") {
      form.set("cf-turnstile-response", captchaToken);
      form.set("data[cf-turnstile-response]", captchaToken);
    } else {
      form.set("g-recaptcha-response", captchaToken);
      form.set("data[g-recaptcha-response]", captchaToken);
    }
  }

  const endpoint = definition.backend.submissionEndpoint;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      Referer: context.referer,
      "User-Agent": "DGS-Form-Submit/2C.1A",
    },
    body: form.toString(),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { message: text.slice(0, 300) };
  }

  // Never echo WordPress secrets
  const safeMessage = String(parsed.message || parsed.result || definition.confirmation?.message || "Submitted");
  const errors = (parsed.errors || parsed.error || parsed.formErrors) as Record<string, string | string[]> | string | undefined;
  const fieldErrors: Record<string, string> = {};
  if (errors && typeof errors === "object") {
    for (const [key, value] of Object.entries(errors)) {
      fieldErrors[key] = Array.isArray(value) ? value.join(" ") : String(value);
    }
  }

  const success = response.ok && (parsed.success === true || parsed.result === "success" || parsed.type === "success");
  if (!success) {
    return {
      ok: false,
      message: typeof errors === "string" ? errors : safeMessage || definition.failureMessage || "Submission failed",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }

  return {
    ok: true,
    message: definition.confirmation?.message || safeMessage || "Thank you for your submission.",
    submissionId: (parsed.insert_id as string | number | undefined) || (parsed.submission_id as string | number | undefined),
  };
}
