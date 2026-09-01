const WP_ORIGIN = "https://www.dgeniussolutions.com";

function noncePatterns(formId) {
  const name = `_fluentform_${formId}_fluentformnonce`;
  return [
    new RegExp(`name=["']${name}["'][^>]*value=["']([^"']+)["']`, "i"),
    new RegExp(`value=["']([^"']+)["'][^>]*name=["']${name}["']`, "i"),
  ];
}

function extractNonce(html, formId) {
  for (const pattern of noncePatterns(formId)) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

function extractScopedEmbeddedPostId(html, formId) {
  const wrapperPatterns = [
    new RegExp(
      `fluentform_wrapper_${formId}[\\s\\S]{0,12000}?name=["']__fluent_form_embded_post_id["'][^>]*value=["'](\\d+)["']`,
      "i",
    ),
    new RegExp(
      `fluentform_wrapper_${formId}[\\s\\S]{0,12000}?value=["'](\\d+)["'][^>]*name=["']__fluent_form_embded_post_id["']`,
      "i",
    ),
    new RegExp(
      `data-form_id=["']${formId}["'][\\s\\S]{0,12000}?name=["']__fluent_form_embded_post_id["'][^>]*value=["'](\\d+)["']`,
      "i",
    ),
    new RegExp(
      `data-form_id=["']${formId}["'][\\s\\S]{0,12000}?value=["'](\\d+)["'][^>]*name=["']__fluent_form_embded_post_id["']`,
      "i",
    ),
  ];
  for (const pattern of wrapperPatterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return "";
}

/**
 * Resolve Fluent Forms nonce + embedded post ID for a single route/form pair.
 * Never borrows homepage Form 1 context for another form.
 */
export function resolveFormContextFromHtml(html, definition, route) {
  const formId = Number(definition.fluentFormId);
  const routePageId = definition.backend?.wordpressPageIds?.[route];
  const referer = `${WP_ORIGIN}${route}`;
  const nonce = extractNonce(html, formId);

  if (!nonce) {
    return {
      ok: false,
      message: "Form security token unavailable for this route",
      status: 502,
      referer,
      routePageId: routePageId ? String(routePageId) : "",
    };
  }

  const scopedPostId = extractScopedEmbeddedPostId(html, formId);
  const embeddedPostId = scopedPostId || (routePageId ? String(routePageId) : "");

  if (!embeddedPostId) {
    return {
      ok: false,
      message: "Form page context unavailable for this route",
      status: 502,
      referer,
      routePageId: routePageId ? String(routePageId) : "",
    };
  }

  return {
    ok: true,
    nonce,
    embeddedPostId,
    referer,
    routePageId: String(routePageId || embeddedPostId),
  };
}

export async function fetchFormContext(definition, route, fetchImpl = fetch) {
  const url = `${WP_ORIGIN}${route}`;
  let html = "";
  try {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": "DGS-Form-Submit/2C.1A", Accept: "text/html" },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        message: "Unable to load form page context",
        status: 502,
        referer: url,
        routePageId: definition.backend?.wordpressPageIds?.[route]
          ? String(definition.backend.wordpressPageIds[route])
          : "",
      };
    }
    html = await response.text();
  } catch {
    return {
      ok: false,
      message: "Network error while loading form page context",
      status: 502,
      referer: url,
      routePageId: definition.backend?.wordpressPageIds?.[route]
        ? String(definition.backend.wordpressPageIds[route])
        : "",
    };
  }

  return resolveFormContextFromHtml(html, definition, route);
}
