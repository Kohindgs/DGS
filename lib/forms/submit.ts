import type { FormDefinition, FormSubmissionResult } from "./types";
import { assertRouteFormMapping, getFormDefinitionById } from "./registry";
// @ts-expect-error shared validation module consumed by production and mocked tests
import { validateFormPayload } from "./payload-validation.mjs";
// @ts-expect-error shared form-context module consumed by production and mocked tests
import { fetchFormContext, getWordpressBackendOrigin } from "./form-context.mjs";
// @ts-expect-error shared Fluent Forms ajax payload builder consumed by production and mocked tests
import { buildFluentFormsAjaxParams, interpretFluentAjaxResponse } from "./fluent-ajax-payload.mjs";

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
// @ts-expect-error shared Fluent Forms ajax payload builder
export { buildFluentFormsAjaxParams, inspectFluentFormsAjaxBody, interpretFluentAjaxResponse } from "./fluent-ajax-payload.mjs";

export function validateClientSubmitPayload(input: unknown): ValidationSuccess | ValidationFailure {
  return validateFormPayload(input, {
    getDefinitionById: getFormDefinitionById,
    assertRouteFormMapping,
  }) as ValidationSuccess | ValidationFailure;
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

  const form = buildFluentFormsAjaxParams({
    fluentFormId: definition.fluentFormId,
    route,
    sanitizedFields,
    captchaToken,
    nonce: context.nonce,
    embeddedPostId: context.embeddedPostId,
    captchaProvider: definition.captcha?.provider,
    submissionAction: definition.backend.submissionAction || "fluentform_submit",
  });

  const backendOrigin = getWordpressBackendOrigin();
  const endpoint = process.env.DGS_WORDPRESS_BACKEND_ORIGIN
    ? `${backendOrigin}/wp-admin/admin-ajax.php`
    : (definition.backend.submissionEndpoint || `${backendOrigin}/wp-admin/admin-ajax.php`);
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

  const interpreted = interpretFluentAjaxResponse(parsed, response.ok);

  if (!interpreted.success) {
    let failureMsg = "";
    if (interpreted.fieldErrors?.["g-recaptcha-response"]) {
      failureMsg = "reCAPTCHA verification failed. Please complete the CAPTCHA and try again.";
    } else if (interpreted.errorText && typeof interpreted.errorText === "string") {
      failureMsg = interpreted.errorText;
    } else if (interpreted.message && typeof interpreted.message === "string") {
      failureMsg = interpreted.message;
    } else if (interpreted.fieldErrors && Object.keys(interpreted.fieldErrors).length > 0) {
      failureMsg = "Please correct the highlighted fields and try again.";
    } else {
      failureMsg = definition.failureMessage || "Unable to submit the form. Please check the highlighted fields and try again.";
    }

    return {
      ok: false,
      message: failureMsg,
      fieldErrors: interpreted.fieldErrors,
    };
  }

  const successMsg = String(
    interpreted.message || definition.confirmation?.message || "Thank you for your submission.",
  );

  return {
    ok: true,
    message: successMsg,
    submissionId: interpreted.submissionId,
  };
}
