import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/cms/auth";
import { getFormDefinitionById } from "@/lib/forms/registry";
import { submitNativeLeadForm } from "@/lib/forms/native/submit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") {
    return NextResponse.json({ ok: false, message: "Admin disabled" }, { status: 404 });
  }

  if (!(await hasAdminSession())) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: { fluentFormId?: number; route?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { fluentFormId, route } = body;
  if (!fluentFormId) {
    return NextResponse.json({ ok: false, message: "Missing fluentFormId" }, { status: 400 });
  }

  const definition = getFormDefinitionById(Number(fluentFormId));
  if (!definition) {
    return NextResponse.json({ ok: false, message: `Form ID ${fluentFormId} not found` }, { status: 404 });
  }

  const targetRoute =
    route || definition.sourceRoutes?.[0] || definition.sourceRoute || "/";

  // Build compliant QA synthetic fields matching form definition
  const sanitizedFields: Record<string, string> = {};

  for (const field of definition.fields) {
    if (field.hidden) {
      if (field.defaultValue) sanitizedFields[field.name] = String(field.defaultValue);
      continue;
    }
    if (field.type === "captcha") continue;

    const lower = field.name.toLowerCase();
    const labelLower = field.label.toLowerCase();

    if (field.type === "email" || lower.includes("email")) {
      sanitizedFields[field.name] = "business@dgeniussolutions.com";
    } else if (field.type === "tel" || lower.includes("phone") || labelLower.includes("phone") || labelLower.includes("mobile")) {
      sanitizedFields[field.name] = "+91 99879 22901";
    } else if (field.type === "url" || lower.includes("url") || labelLower.includes("website")) {
      sanitizedFields[field.name] = "https://www.dgeniussolutions.com";
    } else if (field.type === "select" || field.type === "radio") {
      const firstOpt = field.options?.[0]?.value || field.options?.[0]?.label || "General";
      sanitizedFields[field.name] = String(firstOpt);
    } else if (field.type === "checkbox") {
      const firstOpt = field.options?.[0]?.value || "1";
      sanitizedFields[field.name] = String(firstOpt);
    } else if (field.type === "textarea" || lower.includes("message") || lower.includes("tell") || lower.includes("requirement")) {
      sanitizedFields[field.name] = "Automated production form QA test submission — safe to ignore";
    } else if (lower.includes("company") || labelLower.includes("company") || labelLower.includes("brand")) {
      sanitizedFields[field.name] = "DGS INTERNAL QA";
    } else if (lower.includes("name") || labelLower.includes("name")) {
      sanitizedFields[field.name] = "DGS FORM QA TEST";
    } else {
      sanitizedFields[field.name] = "QA Test Input";
    }
  }

  // Ensure contact fields are properly mapped
  if (definition.fields.some((f) => f.name === "names[first_name]")) sanitizedFields["names[first_name]"] = "DGS FORM QA";
  if (definition.fields.some((f) => f.name === "names[last_name]")) sanitizedFields["names[last_name]"] = "TEST";
  if (definition.fields.some((f) => f.name === "full_name[first_name]")) sanitizedFields["full_name[first_name]"] = "DGS FORM QA";
  if (definition.fields.some((f) => f.name === "full_name[last_name]")) sanitizedFields["full_name[last_name]"] = "TEST";

  try {
    const result = await submitNativeLeadForm({
      definition,
      route: targetRoute,
      sanitizedFields,
      skipCaptcha: true,
    });

    return NextResponse.json({
      ok: result.ok,
      leadId: result.leadId,
      submissionId: result.submissionId,
      message: result.message,
      route: targetRoute,
      formKey: definition.key,
      title: definition.title,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
