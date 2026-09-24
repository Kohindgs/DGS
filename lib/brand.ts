/**
 * Canonical brand definitions and normalization utilities for DGS.
 * Ensures consistent, clean brand presentation across all metadata, schema,
 * HTML mirrors, blogs, and UI components without HTML entity leakage.
 */

export const DGS_BRAND_NAME = "D'Genius Solutions";
export const DGS_COMPANY_NAME = "D'Genius Solutions";
export const DGS_SHORT_NAME = "D'Genius";

/**
 * Decodes common HTML entities including numeric, hex, and named entities.
 * Handles single and double-encoded occurrences safely.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input || typeof input !== "string") return "";
  let text = input;

  // Run up to 2 passes to resolve double-escaped entities like &amp;#x27; -> &#x27; -> '
  for (let pass = 0; pass < 2; pass++) {
    if (!text.includes("&")) break;
    text = text
      // Apostrophes & single quotes
      .replace(/&(?:#x0*27|#0*39|#8217|apos|rsquo|lsquo);/gi, "'")
      // Quotation marks
      .replace(/&(?:#x0*22|#0*34|#8220|#8221|quot|ldquo|rdquo);/gi, '"')
      // Ampersand
      .replace(/&amp;/gi, "&")
      // Less / greater than
      .replace(/&(?:#x0*3c|#0*60|lt);/gi, "<")
      .replace(/&(?:#x0*3e|#0*62|gt);/gi, ">")
      // Spaces
      .replace(/&(?:#x0*a0|#0*160|nbsp);/gi, " ")
      // Dashes
      .replace(/&(?:#x0*2013|#0*8211|ndash);/gi, "–")
      .replace(/&(?:#x0*2014|#0*8212|mdash);/gi, "—");
  }

  return text;
}

/**
 * Normalizes any variation of D'Genius Solutions or D'Genius in text.
 * Replaces encoded entities, double-escaped entities, and curly apostrophes
 * in the brand name with the canonical ASCII single quote (').
 *
 * NOTE: Preserves curly apostrophes in normal English prose (e.g. "don’t", "we’re").
 * Only normalizes apostrophes that are part of the DGS brand name.
 */
export function normalizeBrandName(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Step 1: Pre-clean any double-escaped or entity-encoded brand tokens
  // Matches: D&#x27;Genius, D&amp;#x27;Genius, D&#039;Genius, D&apos;Genius, D&#8217;Genius, etc.
  // with or without 'Solutions'
  return input.replace(
    /\bD(?:&(?:amp;)?(?:#x0*27|#0*39|#8217|apos|rsquo|lsquo);|['’`‛′ʻʼ])\s*Genius(?:\s+Solutions)?\b/gi,
    (match) => {
      if (/solutions/i.test(match)) {
        return DGS_BRAND_NAME;
      }
      return DGS_SHORT_NAME;
    }
  );
}
