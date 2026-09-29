export type FormConversionEventData = {
  eventName:
    | "generate_lead"
    | "contact_submit"
    | "seo_audit_submit"
    | "pricing_enquiry"
    | "career_application"
    | "form_submit";
  formId?: number | string;
  formTitle: string;
  route: string;
  leadId?: string;
  submissionId?: string;
  service?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};

export function getFormEventName(
  formId?: number | string,
  route?: string,
):
  | "generate_lead"
  | "contact_submit"
  | "seo_audit_submit"
  | "pricing_enquiry"
  | "career_application" {
  if (route?.includes("/career")) return "career_application";
  if (Number(formId) === 18 || route?.includes("/seo-pricing")) return "pricing_enquiry";
  if (Number(formId) === 1 || route === "/" || route === "/contact-us/") return "contact_submit";
  if (
    Number(formId) === 3 ||
    Number(formId) === 19 ||
    Number(formId) === 20 ||
    Number(formId) === 21
  ) {
    return "seo_audit_submit";
  }
  return "generate_lead";
}

export function extractUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utms[key] = val.trim();
  }
  return utms;
}

export function fireFormConversionAnalytics(data: FormConversionEventData) {
  if (typeof window === "undefined") return;

  const payload: Record<string, unknown> = {
    event: data.eventName,
    form_id: data.formId,
    form_title: data.formTitle,
    page_path: data.route,
    lead_id: data.leadId,
    service: data.service,
    ...data.utm,
    conversion_timestamp: new Date().toISOString(),
  };

  // 1. Google Tag Manager / GA4 dataLayer
  const win = window as unknown as {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(payload);

  // 2. Global gtag if present
  if (typeof win.gtag === "function") {
    win.gtag("event", data.eventName, {
      event_category: "Lead Generation",
      event_label: data.formTitle,
      value: 1,
      page_path: data.route,
    });
  }

  // 3. Meta Pixel if present
  if (typeof win.fbq === "function") {
    win.fbq("track", "Lead", {
      content_name: data.formTitle,
      content_category: data.service || "Inbound Lead",
    });
  }

  // Custom DOM event for testing and telemetry
  try {
    window.dispatchEvent(
      new CustomEvent("dgs:form_conversion", { detail: payload }),
    );
  } catch {
    // Ignore in older environments
  }
}
