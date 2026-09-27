import type { FormDefinition } from "./types";

export type NormalizedContact = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

/**
 * Extracts and normalizes contact fields (name, email, phone, company) from raw form submission fields.
 * Uses definition.fields (labels and types) to resolve ambiguous field keys across all 11 approved forms:
 * - Form 1: names[first_name] (Full Name), email, phone, input_text (Company Name)
 * - Form 3, 4, 6, 19, 20, 21: names[first_name], names[last_name], email, phone, input_text (Company Name) / url (Website)
 * - Form 9: names[first_name], names[last_name], email, input_text (Brand Name), input_text_1 (Phone/Mobile)
 * - Form 10, 11: input_text_1 (Full Name), email, url (Company Name), phone
 * - Form 26: full_name[first_name], full_name[last_name], email, phone, input_text (Company Name), company_website
 */
export function extractLeadContactFields(
  definition?: FormDefinition | null,
  sanitizedFields?: Record<string, string> | null,
): NormalizedContact {
  const fields = sanitizedFields || {};
  let name = "";
  let email = "";
  let phone = "";
  let company = "";

  // 1. NAME EXTRACTION
  // Check composite names first (Fluent Forms standard name fields)
  const firstName = fields["names[first_name]"] || fields["full_name[first_name]"] || "";
  const lastName = fields["names[last_name]"] || fields["full_name[last_name]"] || "";
  if (firstName || lastName) {
    name = [firstName, lastName].filter(Boolean).join(" ").trim();
  }

  // If definition is available, inspect fields by label and type
  if (definition?.fields) {
    if (!name) {
      // Find field whose label indicates person's name (e.g. input_text_1 in Form 10/11 is "Full Name")
      for (const field of definition.fields) {
        if (field.hidden || field.type === "captcha") continue;
        const label = field.label.toLowerCase();
        if (
          (label.includes("name") || label.includes("full name")) &&
          !label.includes("company") &&
          !label.includes("brand") &&
          !label.includes("service") &&
          !label.includes("page")
        ) {
          const val = fields[field.name];
          if (val && typeof val === "string" && val.trim()) {
            name = val.trim();
            break;
          }
        }
      }
    }

    // 2. EMAIL EXTRACTION
    for (const field of definition.fields) {
      if (field.hidden || field.type === "captcha") continue;
      if (field.type === "email" || field.label.toLowerCase().includes("email")) {
        const val = fields[field.name];
        if (val && typeof val === "string" && val.trim()) {
          email = val.trim();
          break;
        }
      }
    }

    // 3. PHONE EXTRACTION
    for (const field of definition.fields) {
      if (field.hidden || field.type === "captcha") continue;
      const label = field.label.toLowerCase();
      if (
        field.type === "tel" ||
        label.includes("phone") ||
        label.includes("mobile") ||
        label.includes("whatsapp")
      ) {
        const val = fields[field.name];
        if (val && typeof val === "string" && val.trim()) {
          phone = val.trim();
          break;
        }
      }
    }

    // 4. COMPANY / BRAND / WEBSITE EXTRACTION
    // First priority: explicit company or brand name (e.g. input_text in Form 9 is "Brand Name", url in Form 10/11 is "Company Name")
    for (const field of definition.fields) {
      if (field.hidden || field.type === "captcha") continue;
      const label = field.label.toLowerCase();
      if (
        (label.includes("company") || label.includes("brand") || label.includes("organization")) &&
        !label.includes("website") &&
        !label.includes("url")
      ) {
        const val = fields[field.name];
        if (val && typeof val === "string" && val.trim()) {
          company = val.trim();
          break;
        }
      }
    }
    // Second priority: website / url if company name wasn't found (e.g. Form 4 has url for website)
    if (!company) {
      for (const field of definition.fields) {
        if (field.hidden || field.type === "captcha") continue;
        const label = field.label.toLowerCase();
        if (
          field.type === "url" ||
          label.includes("website") ||
          field.name === "company_website" ||
          field.name === "url"
        ) {
          const val = fields[field.name];
          if (val && typeof val === "string" && val.trim()) {
            company = val.trim();
            break;
          }
        }
      }
    }
  }

  // Fallbacks if not resolved via definition
  if (!name) {
    name = (
      fields.name ||
      fields.full_name ||
      fields.your_name ||
      fields.contact_name ||
      fields.first_name ||
      ""
    ).trim();
  }

  if (!email) {
    email = (fields.email || fields.business_email || fields.your_email || "").trim();
  }

  if (!phone) {
    phone = (fields.phone || fields.mobile || fields.whatsapp || fields.work_phone || "").trim();
  }

  if (!company) {
    company = (
      fields.company ||
      fields.organization ||
      fields.company_name ||
      fields.brand_name ||
      fields.input_text ||
      fields.company_website ||
      fields.url ||
      fields.website ||
      ""
    ).trim();
  }

  return { name, email, phone, company };
}
