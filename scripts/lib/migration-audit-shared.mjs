/**
 * Shared JSON-LD type extraction — supports object, array, @graph, nested arrays.
 */
export function collectJsonLdTypes(value, types = new Set()) {
  if (value == null) return types;

  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdTypes(item, types);
    return types;
  }

  if (typeof value !== "object") return types;

  if (value["@graph"]) collectJsonLdTypes(value["@graph"], types);

  const type = value["@type"];
  if (typeof type === "string") types.add(type);
  else if (Array.isArray(type)) type.forEach((t) => typeof t === "string" && types.add(t));

  for (const [key, child] of Object.entries(value)) {
    if (key === "@type" || key === "@graph") continue;
    if (child && (typeof child === "object" || Array.isArray(child))) {
      collectJsonLdTypes(child, types);
    }
  }

  return types;
}

export function jsonLdTypesFromHtml(html) {
  const types = new Set();
  for (const block of html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []) {
    const raw = block.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/, "").trim();
    try {
      collectJsonLdTypes(JSON.parse(raw), types);
    } catch {
      types.add("INVALID_JSON_LD");
    }
  }
  return [...types].sort();
}

export function expectsStagingNoindex() {
  return process.env.MIGRATION_EXPECT_NOINDEX === "1";
}

export function classifyNoindex(robots = "", xRobots = "") {
  const combined = `${robots} ${xRobots}`.toLowerCase();
  const hasNoindex = /noindex/.test(combined);
  if (!hasNoindex) return { hasNoindex: false, classification: null };
  if (expectsStagingNoindex()) {
    return { hasNoindex: true, classification: "A", label: "EXPECTED_STAGING_NOINDEX" };
  }
  return { hasNoindex: true, classification: "D", label: "UNEXPECTED_NOINDEX" };
}
