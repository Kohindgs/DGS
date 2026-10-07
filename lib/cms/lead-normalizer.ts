import type { CmsLead } from "./leads";
import { formatDateTimeIST } from "@/lib/utils/date";

export interface NormalizedAnswer {
  key: string;
  label: string;
  value: string | number | boolean | string[];
}

export interface NormalizedUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface NormalizedLead {
  leadId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;

  formId: number | null;
  formTitle: string;
  formKey: string;

  serviceInterest: string;
  acquisitionSource: string;
  pageContext: string;

  route: string;
  pageUrl: string;
  sourcePageTitle: string;

  status: string;
  createdAt: string;
  receivedAtIST: string;

  utm: NormalizedUtm;
  hasUtm: boolean;

  answers: NormalizedAnswer[];

  isCareer: boolean;
  careerData?: {
    position?: string;
    location?: string;
    company?: string;
    education?: string;
    experience?: string;
    currentSalary?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    portfolioUrl?: string;
    resume?: {
      originalName?: string;
      storedName?: string;
      size?: number;
    };
    portfolio?: {
      originalName?: string;
      storedName?: string;
      size?: number;
    };
    consent?: boolean;
  };

  rawPayload: Record<string, unknown>;
}

/**
 * Route path to friendly business page title map
 */
const ROUTE_PAGE_TITLES: Record<string, string> = {
  "/": "Home Page",
  "/contact-us/": "Contact Us",
  "/seo-pricing/": "SEO Pricing",
  "/us-landing-page/": "US Growth Landing Page",
  "/australia-page/": "Australia Landing Page",
  "/career/": "Careers",
  "/services/ai-video-production-agency/": "AI Video Production Agency",
  "/services/ai-production-dubai-page/": "AI Video Production (Dubai)",
  "/services/shirdi-se-sai-tak-case-study/": "Shirdi Se Sai Tak Case Study",
  "/services/seo-services-in-mumbai/": "SEO Services Mumbai",
  "/services/dubai-seo/": "Dubai SEO Agency",
  "/services/aeo-services-in-mumbai/": "AEO Services Mumbai",
  "/aeo-dubai/": "AEO Dubai",
  "/services/geo/": "GEO Services",
  "/services/llm-seo-service/": "LLM SEO Services",
  "/services/website-development-amc/": "Website Development AMC",
  "/services/website-development-company-in-mumbai/": "Web Development Mumbai",
  "/services/website-development-pune-page/": "Web Development Pune",
  "/services/branding/": "Brand Strategy & Identity",
  "/services/content-creation/": "Content Creation & Marketing",
  "/services/social-media-marketing/": "Social Media Marketing",
  "/services/performance-marketing/": "Performance Marketing",
  "/seo-services-mumbai-google-ads-landing-page/": "SEO Ads Landing Page",
  "/aeo-services-mumbai-google-ads-landing-page/": "AEO Ads Landing Page",
  "/ai-production-videos-google-ads-landing-page/": "AI Video Ads Landing Page",
  "/better-ceasons-case-study/": "Better Seasons Case Study",
};

/**
 * Known Form Field mappings by formKey
 */
const FORM_FIELD_CONFIG: Record<
  string,
  {
    title: string;
    formId: number;
    fieldLabels: Record<string, string>;
  }
> = {
  "fluentform-1": {
    title: "Home Page Form",
    formId: 1,
    fieldLabels: {
      "names[first_name]": "Full Name",
      email: "Email",
      phone: "Phone / Mobile",
      input_text: "Company Name",
      dropdown_1: "How Did You Find Us?",
      subject: "Subject",
      dropdown: "Service Interest",
      message: "Your Message",
    },
  },
  "fluentform-3": {
    title: "Free SEO Audit Form",
    formId: 3,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      phone: "Phone / Mobile",
      input_text: "Company Name",
      message: "Your Message",
    },
  },
  "fluentform-4": {
    title: "Social Media Form",
    formId: 4,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      url: "Website URL",
      phone: "Phone / Mobile",
      hidden: "Page Context",
    },
  },
  "fluentform-6": {
    title: "Website Development Form",
    formId: 6,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company Name",
      phone: "Phone / Mobile",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      hidden: "Page Context",
    },
  },
  "fluentform-9": {
    title: "Generative AI",
    formId: 9,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company",
      input_text_1: "Phone",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      description: "Additional Brief",
      hidden: "Page / Form Context",
    },
  },
  "fluentform-10": {
    title: "Branding Form",
    formId: 10,
    fieldLabels: {
      input_text_1: "Contact Name",
      email: "Email",
      url: "Website URL",
      phone: "Phone / Mobile",
      dropdown_3: "Estimated Budget",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      hidden: "Page Context",
    },
  },
  "fluentform-11": {
    title: "Content Creation Form",
    formId: 11,
    fieldLabels: {
      input_text_1: "Contact Name",
      email: "Email",
      url: "Website URL",
      phone: "Phone / Mobile",
      dropdown: "Service Requirement",
      dropdown_1: "How Did You Find Us?",
      dropdown_2: "Monthly Budget",
      Content_creation: "Page Context",
    },
  },
  "fluentform-18": {
    title: "SEO Pricing Form",
    formId: 18,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company Name",
      url: "Website URL",
      dropdown_2: "Plan Tenure",
      dropdown: "Monthly Plan",
      dropdown_3: "Annual Plan",
      phone: "Phone / Mobile",
      dropdown_1: "Where Did You Hear About Us?",
      "checkbox[]": "Selection Confirmation",
      hidden: "Page Context",
    },
  },
  "fluentform-19": {
    title: "Free AEO Audit Form",
    formId: 19,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company Name",
      url: "Website URL",
      phone: "Phone / Mobile",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      hidden: "Page Context",
    },
  },
  "fluentform-20": {
    title: "Free LLM Audit Form",
    formId: 20,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company Name",
      url: "Website URL",
      phone: "Phone / Mobile",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      hidden: "Page Context",
    },
  },
  "fluentform-21": {
    title: "Free GEO Audit Form",
    formId: 21,
    fieldLabels: {
      "names[first_name]": "First Name",
      "names[last_name]": "Last Name",
      email: "Email",
      input_text: "Company Name",
      url: "Website URL",
      phone: "Phone / Mobile",
      dropdown: "Interested In",
      dropdown_1: "How Did You Find Us?",
      hidden: "Page Context",
    },
  },
  "fluentform-22": {
    title: "SEO Mumbai Google Ads Landing Page",
    formId: 22,
    fieldLabels: {
      "full_name[first_name]": "First Name",
      "full_name[last_name]": "Last Name",
      email: "Business Email",
      phone: "Work Phone / WhatsApp",
      input_text: "Company Name",
      company_website: "Company Website",
      role: "Your Role",
      budget: "Marketing Budget",
      start_timeline: "Target Start Timeline",
      requirement: "Business Requirement",
      contact_consent: "Contact Consent",
      service_name: "Service Name",
      lead_source: "Lead Source",
      "business_confirmation[]": "Business Confirmation",
    },
  },
  "fluentform-23": {
    title: "AEO Mumbai Google Ads Landing Page",
    formId: 23,
    fieldLabels: {
      "full_name[first_name]": "First Name",
      "full_name[last_name]": "Last Name",
      email: "Business Email",
      phone: "Work Phone / WhatsApp",
      input_text: "Company Name",
      company_website: "Company Website",
      role: "Your Role",
      budget: "Marketing Budget",
      start_timeline: "Target Start Timeline",
      requirement: "Business Requirement",
      contact_consent: "Contact Consent",
      service_name: "Service Name",
      lead_source: "Lead Source",
      "business_confirmation[]": "Business Confirmation",
    },
  },
  "fluentform-24": {
    title: "AI Production Google Ads Landing Page",
    formId: 24,
    fieldLabels: {
      "full_name[first_name]": "First Name",
      "full_name[last_name]": "Last Name",
      email: "Business Email",
      phone: "Work Phone / WhatsApp",
      input_text: "Company Name",
      company_website: "Company Website",
      role: "Your Role",
      budget: "Marketing Budget",
      start_timeline: "Target Start Timeline",
      requirement: "Business Requirement",
      contact_consent: "Contact Consent",
      service_name: "Service Name",
      lead_source: "Lead Source",
      "business_confirmation[]": "Business Confirmation",
    },
  },
  "fluentform-26": {
    title: "Performance Marketing Landing Page",
    formId: 26,
    fieldLabels: {
      "full_name[first_name]": "First Name",
      "full_name[last_name]": "Last Name",
      email: "Business Email",
      phone: "Work Phone / WhatsApp",
      input_text: "Company Name",
      company_website: "Company Website",
      role: "Your Role",
      budget: "Marketing Budget",
      start_timeline: "Target Start Timeline",
      requirement: "Business Requirement",
      contact_consent: "Contact Consent",
      service_name: "Service Name",
      lead_source: "Lead Source",
      "business_confirmation[]": "Business Confirmation",
    },
  },
  "fluentform-27": {
    title: "Australia Page Form",
    formId: 27,
    fieldLabels: {
      "names[first_name]": "Full Name",
      email: "Email",
      phone: "Phone / Mobile",
      input_text: "Company Name",
      dropdown_1: "How Did You Find Us?",
      subject: "Subject",
      dropdown: "Service Interest",
      message: "Your Message",
    },
  },
  "fluentform-28": {
    title: "Web Development Pune Landing Page",
    formId: 28,
    fieldLabels: {
      "full_name[first_name]": "First Name",
      "full_name[last_name]": "Last Name",
      email: "Business Email",
      phone: "Work Phone / WhatsApp",
      input_text: "Company Name",
      company_website: "Company Website",
      role: "Your Role",
      budget: "Marketing Budget",
      start_timeline: "Target Start Timeline",
      requirement: "Business Requirement",
      contact_consent: "Contact Consent",
      service_name: "Service Name",
      lead_source: "Lead Source",
      "business_confirmation[]": "Business Confirmation",
    },
  },
  "fluentform-50": {
    title: "US Landing Page Growth Form",
    formId: 50,
    fieldLabels: {
      name: "Full Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      website: "Website",
      service: "Primary Requirement",
      message: "Tell Us More",
    },
  },
};

/**
 * Technical / Security keys to omit from ordinary CRM Answers
 */
const TECHNICAL_OMIT_KEYS = new Set([
  "g-recaptcha-response",
  "_wp_http_referer",
  "_fluentform_nonce",
  "__fluent_form_embadded_post_id",
  "gclid",
  "campaignid",
  "adgroupid",
  "creative",
  "matchtype",
  "device",
  "landing_page_url",
  "referrer_url",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]);

/**
 * Universal fallback humanizer for unknown field keys
 */
export function humanizeKey(rawKey: string): string {
  const clean = rawKey
    .replace(/^names?\[(.*?)\]$/i, "$1")
    .replace(/^full_name\[(.*?)\]$/i, "$1")
    .replace(/\[\]$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  return clean
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Clean path to human-readable page title
 */
export function humanizeRoute(route: string): string {
  if (!route || route === "/") return "Home Page";
  if (ROUTE_PAGE_TITLES[route]) return ROUTE_PAGE_TITLES[route];

  const trimmed = route.replace(/^\/|\/$/g, "");
  const segments = trimmed.split("/");
  const last = segments[segments.length - 1] || "Home";

  return last
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Canonical Normalization Engine for DGS Leads
 */
export function normalizeLead(lead: CmsLead): NormalizedLead {
  let parsedPayload: Record<string, any> = {};
  if (lead.payload) {
    if (typeof lead.payload === "object") {
      parsedPayload = lead.payload as Record<string, any>;
    } else {
      try {
        parsedPayload = JSON.parse(String(lead.payload));
      } catch {
        parsedPayload = {};
      }
    }
  }

  const rawFields: Record<string, any> =
    parsedPayload.fields && typeof parsedPayload.fields === "object"
      ? parsedPayload.fields
      : parsedPayload;

  const isCareer =
    lead.source_form_key === "career-application" ||
    Boolean(parsedPayload.position || parsedPayload.resume || parsedPayload.education);

  // 1. Form Key, ID, and Title
  const formKey = lead.source_form_key || parsedPayload.formKey || (isCareer ? "career-application" : "generic");
  let formId: number | null = parsedPayload.fluentFormId || parsedPayload.form_id || null;
  if (!formId && formKey.startsWith("fluentform-")) {
    const num = parseInt(formKey.replace("fluentform-", ""), 10);
    if (!isNaN(num)) formId = num;
  }

  const config = FORM_FIELD_CONFIG[formKey];
  const formTitle =
    parsedPayload.formTitle ||
    config?.title ||
    (isCareer ? "Career Application" : formId ? `Fluent Form #${formId}` : "Website Enquiry");

  // 2. Authoritative Database Contact Fields first, enriched by payload
  let fullName = (lead.name || "").trim();
  let firstName = "";
  let lastName = "";

  if (!fullName) {
    const fName =
      rawFields["names[first_name]"] ||
      rawFields["full_name[first_name]"] ||
      rawFields.firstName ||
      rawFields.first_name ||
      "";
    const lName =
      rawFields["names[last_name]"] ||
      rawFields["full_name[last_name]"] ||
      rawFields.lastName ||
      rawFields.last_name ||
      "";

    if (fName || lName) {
      firstName = String(fName).trim();
      lastName = String(lName).trim();
      fullName = `${firstName} ${lastName}`.trim();
    } else if (rawFields.name || rawFields.fullName || rawFields.contact_name) {
      fullName = String(rawFields.name || rawFields.fullName || rawFields.contact_name).trim();
    }
  }

  if (fullName && (!firstName || !lastName)) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ");
  }

  const email = (
    lead.email ||
    rawFields.email ||
    rawFields.business_email ||
    rawFields.contact_email ||
    ""
  ).trim();

  let phone = (
    lead.phone ||
    rawFields.phone ||
    rawFields.mobile ||
    rawFields.phone_number ||
    rawFields["Work Phone / WhatsApp"] ||
    ""
  ).trim();

  // For Form 9, input_text_1 is Phone
  if (!phone && (formId === 9 || formKey === "fluentform-9") && rawFields.input_text_1) {
    phone = String(rawFields.input_text_1).trim();
  }

  let company = (
    lead.company ||
    rawFields.company ||
    rawFields.company_name ||
    rawFields.brand_name ||
    ""
  ).trim();

  // For Form 9 and others, input_text is Company
  if (!company && rawFields.input_text) {
    company = String(rawFields.input_text).trim();
  }

  // 3. Service Interest / Requirement
  let serviceInterest = "";
  if (isCareer) {
    serviceInterest = String(parsedPayload.position || "Job Application");
  } else if (formId === 9 || formKey === "fluentform-9") {
    serviceInterest = String(rawFields.dropdown || rawFields.hidden || "Generative AI");
  } else if (formId === 50 || formKey === "fluentform-50") {
    serviceInterest = String(rawFields.service || "US Enterprise Growth");
  } else if (rawFields.dropdown && !/^(google|meta|friend|twitter|linkedin|other)/i.test(String(rawFields.dropdown))) {
    serviceInterest = String(rawFields.dropdown);
  } else if (rawFields.service || rawFields.service_name || rawFields.requirement) {
    serviceInterest = String(rawFields.service || rawFields.service_name || rawFields.requirement);
  } else if (rawFields.subject) {
    serviceInterest = String(rawFields.subject);
  }

  // 4. Acquisition Source (How Did You Find Us?)
  let acquisitionSource = "";
  if (rawFields.dropdown_1) {
    acquisitionSource = String(rawFields.dropdown_1);
  } else if (rawFields.lead_source) {
    acquisitionSource = String(rawFields.lead_source);
  } else if (parsedPayload.utm?.source || rawFields.utm_source) {
    acquisitionSource = String(parsedPayload.utm?.source || rawFields.utm_source);
  }

  // 5. Page Context
  let pageContext = "";
  if (rawFields.hidden) {
    pageContext = String(rawFields.hidden);
  } else if (rawFields.service_name) {
    pageContext = String(rawFields.service_name);
  } else if (rawFields.Home_Page) {
    pageContext = String(rawFields.Home_Page);
  } else if (rawFields.Content_creation) {
    pageContext = String(rawFields.Content_creation);
  }

  // 6. Route and URLs
  const route = lead.source_route || parsedPayload.route || "/";
  const sourcePageTitle = humanizeRoute(route);
  const pageUrl =
    parsedPayload.pageUrl ||
    (route ? `https://www.dgeniussolutions.com${route.startsWith("/") ? "" : "/"}${route}` : "");

  // 7. UTM Attribution
  const utmPayload = parsedPayload.utm && typeof parsedPayload.utm === "object" ? parsedPayload.utm : {};
  const utm: NormalizedUtm = {
    source: utmPayload.source || rawFields.utm_source || undefined,
    medium: utmPayload.medium || rawFields.utm_medium || undefined,
    campaign: utmPayload.campaign || rawFields.utm_campaign || undefined,
    term: utmPayload.term || rawFields.utm_term || undefined,
    content: utmPayload.content || rawFields.utm_content || undefined,
  };

  const hasUtm = Boolean(
    utm.source || utm.medium || utm.campaign || utm.term || utm.content
  );

  // 8. Meaningful Business Answers
  const answers: NormalizedAnswer[] = [];

  // Define keys that are primary contact info already displayed in the Contact card
  const isPrimaryContactKey = (k: string) => {
    if (k === "names[first_name]" || k === "names[last_name]" || k === "full_name[first_name]" || k === "full_name[last_name]") return true;
    if (k === "name" || k === "fullName" || k === "firstName" || k === "lastName") return true;
    if (k === "email" || k === "business_email") return true;
    if (k === "phone" || k === "Work Phone / WhatsApp" || k === "mobile") return true;
    if (k === "company" || k === "company_name") return true;
    // Form 9 specific
    if ((formId === 9 || formKey === "fluentform-9") && (k === "input_text" || k === "input_text_1")) return true;
    // Form 1, 3, 6, 18, 19, 20, 21, 27 where input_text is Company Name
    if (k === "input_text" && company) return true;
    return false;
  };

  // Specific ordering preference for answers
  const entries = Object.entries(rawFields);
  for (const [rawKey, rawVal] of entries) {
    if (TECHNICAL_OMIT_KEYS.has(rawKey)) continue;
    if (rawKey === "resume" || rawKey === "portfolio") continue;
    if (isPrimaryContactKey(rawKey)) continue;

    // Resolve human label
    let label = config?.fieldLabels[rawKey];
    if (!label) {
      label = humanizeKey(rawKey);
    }

    // Format value
    let val = rawVal;
    if (val == null || val === "") continue;

    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      val = val.join(", ");
    } else if (typeof val === "boolean") {
      val = val ? "Yes" : "No";
    } else if (typeof val === "object") {
      continue; // Never stringify arbitrary raw objects into the CRM answer view
    } else {
      val = String(val).trim();
    }

    if (!val) continue;

    answers.push({
      key: rawKey,
      label,
      value: val,
    });
  }

  // 9. Career Data Structure
  let careerData: NormalizedLead["careerData"] = undefined;
  if (isCareer) {
    careerData = {
      position: parsedPayload.position || undefined,
      location: parsedPayload.location || undefined,
      company: parsedPayload.company || company || undefined,
      education: parsedPayload.education || undefined,
      experience: parsedPayload.experience || undefined,
      currentSalary: parsedPayload.currentSalary || undefined,
      expectedSalary: parsedPayload.expectedSalary || undefined,
      noticePeriod: parsedPayload.noticePeriod || undefined,
      portfolioUrl: parsedPayload.portfolioUrl || undefined,
      resume: parsedPayload.resume
        ? {
            originalName: parsedPayload.resume.originalName,
            storedName: parsedPayload.resume.storedName,
            size: parsedPayload.resume.size,
          }
        : undefined,
      portfolio: parsedPayload.portfolio
        ? {
            originalName: parsedPayload.portfolio.originalName,
            storedName: parsedPayload.portfolio.storedName,
            size: parsedPayload.portfolio.size,
          }
        : undefined,
      consent: Boolean(parsedPayload.consent),
    };
  }

  // 10. Date formatting
  const receivedAtIST = formatDateTimeIST(lead.created_at);

  return {
    leadId: lead.id,
    fullName: fullName || "Unnamed Lead",
    firstName,
    lastName,
    email: email || "—",
    phone: phone || "—",
    company: company || "—",

    formId,
    formTitle,
    formKey,

    serviceInterest: serviceInterest || formTitle,
    acquisitionSource: acquisitionSource || "—",
    pageContext: pageContext || sourcePageTitle,

    route,
    pageUrl,
    sourcePageTitle,

    status: (lead.status || "new").toLowerCase(),
    createdAt: lead.created_at,
    receivedAtIST,

    utm,
    hasUtm,

    answers,

    isCareer,
    careerData,

    rawPayload: parsedPayload,
  };
}
