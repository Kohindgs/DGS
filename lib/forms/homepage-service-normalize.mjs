/** UI-locked homepage #fluentform_1 service labels → authenticated Form 1 option values. */
export const HOMEPAGE_SERVICE_UI_TO_FORM1 = {
  SEO: "Search Engine Optimization",
  AEO: "AEO ",
  GEO: "GEO",
  "AI Video Production": "Video Production",
  "Website Development": "Website Design & Development",
};

export function normalizeHomepageServiceDropdown(value) {
  if (value == null || value === "") return value;
  const key = String(value);
  return HOMEPAGE_SERVICE_UI_TO_FORM1[key] ?? key;
}

export function normalizeHomepageBridgeFields(fields) {
  if (!fields || typeof fields !== "object") return fields;
  const out = { ...fields };
  if ("dropdown" in out) {
    out.dropdown = normalizeHomepageServiceDropdown(out.dropdown);
  }
  return out;
}
