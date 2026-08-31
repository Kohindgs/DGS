import type { FormDefinition, FormSubmissionResult } from "./types";
import { assertRouteFormMapping, getFormDefinitionById } from "./registry";
// @ts-expect-error shared validation module consumed by production and mocked tests
import { validateFormPayload } from "./payload-validation.mjs";
// @ts-expect-error shared form-context module consumed by production and mocked tests
import { fetchFormContext } from "./form-context.mjs";

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

// @ts-expect-error shared form-context module consumed by production and mocked tests
export { resolveFormContextFromHtml } from "./form-context.mjs";

export function validateClientSubmitPayload(input: unknown): ValidationSuccess | ValidationFailure {
  return validateFormPayload(input, {
    getDefinitionById: getFormDefinitionById,
    assertRouteFormMapping,
  }) as ValidationSuccess | ValidationFailure;
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

export async function forwardToFluentForms(options: {
  definition: FormDefinition;
  route: string;
  sanitizedFields: Record<string, string>;
  captchaToken?: string;
}): Promise<FormSubmissionResult> {
  const { definition, route, sanitizedFields, captchaToken } = options;
  const context = await fetchFormContext(definition, route);

  if (!context.ok) {
    return {
      ok: false,
      message: context.message,
    };
  }

  const form = new URLSearchParams();
  form.set("action", definition.backend.submissionAction || "fluentform_submit");
  form.set("form_id", String(definition.fluentFormId));

  const nested = expandNestedFields(sanitizedFields);
  const flatEntries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(sanitizedFields)) {
    flatEntries.push([`data[${key}]`, value]);
  }
  for (const [key, value] of Object.entries(nested)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [child, childValue] of Object.entries(value as Record<string, string>)) {
        flatEntries.push([`data[${key}][${child}]`, String(childValue)]);
      }
    }
  }
  for (const [key, value] of flatEntries) form.append(key, value);

  form.set(`_fluentform_${definition.fluentFormId}_fluentformnonce`, context.nonce);
  form.set(`data[_fluentform_${definition.fluentFormId}_fluentformnonce]`, context.nonce);
  form.set("__fluent_form_embded_post_id", context.embeddedPostId);
  form.set("data[__fluent_form_embded_post_id]", context.embeddedPostId);
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
