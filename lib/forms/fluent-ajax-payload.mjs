/**
 * Native Fluent Forms admin-ajax payload contract.
 *
 * Outer POST body:
 *   action=fluentform_submit
 *   form_id=<id>
 *   data=<serialized inner form string>
 *
 * Inner `data` is consumed by PHP parse_str($request->get('data'), $data).
 * Field names stay in original Fluent Forms form (including names[first_name]).
 * Do not emit outer data[field] parameters.
 */

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function encodeFluentPair(key, value) {
  return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, "+")}`;
}

export function serializeFluentFormData(fields) {
  const pairs = [];
  for (const [key, value] of Object.entries(fields || {})) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) pairs.push(encodeFluentPair(key, item));
    } else {
      pairs.push(encodeFluentPair(key, value));
    }
  }
  return pairs.join("&");
}

export function parseFluentFormData(serialized) {
  const out = {};
  if (!serialized) return out;
  for (const pair of String(serialized).split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    const value = decodeURIComponent(rawValue.replace(/\+/g, " "));
    if (Object.prototype.hasOwnProperty.call(out, key)) {
      const current = out[key];
      out[key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function nonceFieldName(fluentFormId) {
  return `_fluentform_${Number(fluentFormId)}_fluentformnonce`;
}

export function buildFluentInnerFields({
  fluentFormId,
  route,
  sanitizedFields,
  captchaToken,
  nonce,
  embeddedPostId,
  captchaProvider,
}) {
  const inner = { ...(sanitizedFields || {}) };
  inner[nonceFieldName(fluentFormId)] = nonce;
  inner.__fluent_form_embded_post_id = String(embeddedPostId);
  inner._wp_http_referer = route;
  if (captchaToken) {
    if (captchaProvider === "turnstile") inner["cf-turnstile-response"] = captchaToken;
    else inner["g-recaptcha-response"] = captchaToken;
  }
  return inner;
}

export function buildFluentFormsAjaxParams(options) {
  const fluentFormId = Number(options.fluentFormId);
  const inner = buildFluentInnerFields(options);
  const serialized = serializeFluentFormData(inner);
  const outer = new URLSearchParams();
  outer.set("action", options.submissionAction || "fluentform_submit");
  outer.set("form_id", String(fluentFormId));
  outer.set("data", serialized);
  return outer;
}

export function inspectFluentFormsAjaxBody(body) {
  const outer = body instanceof URLSearchParams ? body : new URLSearchParams(String(body));
  const keys = [...outer.keys()];
  const dataKeys = keys.filter((key) => key === "data" || key.startsWith("data["));
  const innerSerialized = outer.get("data") || "";
  return {
    keys,
    action: outer.get("action"),
    formId: outer.get("form_id"),
    dataCount: dataKeys.length,
    hasOuterBracketParams: keys.some((key) => /^data\[/.test(key)),
    innerSerialized,
    innerFields: parseFluentFormData(innerSerialized),
  };
}

/**
 * Interpret Fluent Forms admin-ajax JSON, including wp_send_json_success nesting:
 * { success: true, data: { insert_id, message } }
 */
export function interpretFluentAjaxResponse(parsed, httpOk) {
  const root = isPlainObject(parsed) ? parsed : {};
  const nested = isPlainObject(root.data) ? root.data : {};

  const errors = root.errors || nested.errors || root.error || nested.error || root.formErrors || nested.formErrors;
  const fieldErrors = {};
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const [key, value] of Object.entries(errors)) {
      fieldErrors[key] = Array.isArray(value) ? value.join(" ") : String(value);
    }
  }

  const success =
    httpOk &&
    (root.success === true ||
      root.result === "success" ||
      root.type === "success" ||
      nested.result === true ||
      nested.result === "success");

  const submissionId = root.insert_id ?? nested.insert_id ?? root.submission_id ?? nested.submission_id;
  const message = root.message ?? nested.message ?? (typeof nested.result === "string" ? nested.result : undefined);

  return {
    success: Boolean(success),
    message,
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    submissionId,
    errorText: typeof errors === "string" ? errors : undefined,
  };
}
