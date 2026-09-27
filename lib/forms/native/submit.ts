import type { FormDefinition, FormSubmissionResult } from "../types.ts";
import { isApprovedFormId } from "../registry.ts";
import { createCmsLead, createCmsSubmission } from "../../cms/leads.ts";
import { sendNativeFormNotification } from "../../notifications/form-email.ts";
import { publishNotificationEvent } from "../../notifications/engine.ts";
import { extractLeadContactFields } from "../contact-fields.ts";

function nativeIds() {
  return new Set(
    String(process.env.DGS_NATIVE_FORM_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function isNativeFormEnabled(fluentFormId?: number) {
  if (fluentFormId && isApprovedFormId(fluentFormId)) {
    return true;
  }
  const ids = nativeIds();
  if (ids.size === 0 || ids.has("*")) {
    return true;
  }
  return fluentFormId ? ids.has(String(fluentFormId)) : true;
}

async function verifyRecaptcha(token?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY || "";
  if (!secret) return { ok: false, message: "CAPTCHA verification is not configured." };
  if (!token) return { ok: false, message: "CAPTCHA verification is required." };

  const body = new URLSearchParams({ secret, response: token });
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success
    ? { ok: true as const }
    : { ok: false as const, message: "CAPTCHA verification failed. Please try again." };
}

export async function submitNativeLeadForm(options: {
  definition: FormDefinition;
  route: string;
  sanitizedFields: Record<string, string>;
  captchaToken?: string;
}): Promise<FormSubmissionResult> {
  const { definition, route, sanitizedFields, captchaToken } = options;

  if (definition.captcha?.enabled) {
    if (definition.captcha.provider !== "recaptcha") {
      return { ok: false, message: "This CAPTCHA provider is not yet enabled for native submission." };
    }
    const captcha = await verifyRecaptcha(captchaToken);
    if (!captcha.ok) return { ok: false, message: captcha.message, fieldErrors: { captcha: captcha.message } };
  }

  const payload = {
    fluentFormId: definition.fluentFormId,
    formTitle: definition.title,
    route,
    fields: sanitizedFields,
  };

  const contact = extractLeadContactFields(definition, sanitizedFields);

  const leadId = await createCmsLead({
    formKey: definition.key,
    route,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    payload,
  });

  const submissionId = await createCmsSubmission({
    formKey: definition.key,
    route,
    payload,
    leadId,
    provider: "native",
  });

  const notification = await sendNativeFormNotification({
    definition,
    route,
    fields: sanitizedFields,
    leadId,
    contact,
  }).catch((error) => {
    console.error("Native form notification failed", error);
    return { sent: false };
  });

  if (!notification.sent) {
    console.warn("Native form submission saved but notification was not sent", {
      formKey: definition.key,
      submissionId,
    });
  }

  const senderDisplayName = contact.name || contact.email || "Inbound Lead";
  await publishNotificationEvent({
    type: "new_lead",
    severity: "info",
    title: `New Inbound Lead: ${senderDisplayName}`,
    message: `Submitted via ${definition.title || definition.key} from ${route}`,
    resource_type: "lead",
    resource_id: leadId,
    resource_url: `/admin/leads/?leadId=${leadId}`,
    recipient_role: "marketing",
  }).catch((err) => console.error("Failed to publish lead notification event", err));

  return {
    ok: true,
    message: definition.confirmation?.message || "Thank you for your submission.",
    submissionId,
  };
}
