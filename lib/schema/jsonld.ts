export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

function filterSelfServingReviews(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => {
        if (!item || typeof item !== "object") return true;
        const type = (item as Record<string, unknown>)["@type"];
        return type !== "Review" && !(Array.isArray(type) && type.includes("Review"));
      })
      .map(filterSelfServingReviews);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const type = record["@type"];
    if (type === "Review" || (Array.isArray(type) && type.includes("Review"))) {
      return null;
    }
  }
  return value;
}

export function serializeJsonLd(value: JsonLdValue) {
  const sanitized = filterSelfServingReviews(value);
  return JSON.stringify(sanitized).replace(/</g, "\\u003c");
}

export function collectSchemaTypes(value: unknown, found = new Set<string>()): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, found));
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const type = record["@type"];
    if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
    else if (type) found.add(String(type));
    Object.values(record).forEach((item) => collectSchemaTypes(item, found));
  }
  return [...found].sort();
}

export function mergeJsonLd(...values: (JsonLdValue | null | undefined)[]): Record<string, unknown>[] {
  const flattened = values.flatMap((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });

  const seen = new Set<string>();
  const result: Record<string, unknown>[] = [];
  for (const item of flattened) {
    const id = typeof item["@id"] === "string" ? item["@id"] : null;
    const type = Array.isArray(item["@type"]) ? item["@type"].join("|") : String(item["@type"] || "");
    if (type === "Review" || (Array.isArray(item["@type"]) && item["@type"].includes("Review"))) {
      continue;
    }
    const key = id || `${type}:${JSON.stringify(item)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
