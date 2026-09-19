import { NextResponse } from "next/server";
import { forwardToFluentForms, validateClientSubmitPayload } from "@/lib/forms/submit";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { captureFormSubmission } from "@/lib/cms/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateClientSubmitPayload(body);
  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: validated.message,
        fieldErrors: validated.fieldErrors,
      },
      { status: validated.status },
    );
  }

  try {
    const route = (body as { route: string }).route;
    const result = await forwardToFluentForms({
      definition: validated.definition,
      route,
      sanitizedFields: validated.sanitizedFields,
      captchaToken: validated.captchaToken,
    });

    if (result.ok && isCmsDatabaseConfigured()) {
      try {
        await captureFormSubmission({
          formKey: validated.definition.key,
          sourceRoute: route,
          fields: validated.sanitizedFields,
          provider: "fluentforms-shadow",
          providerSubmissionId: result.submissionId,
        });
      } catch (error) {
        console.error("Native CMS lead shadow capture failed", error);
      }
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Network error while submitting the form. Please try again.",
      },
      { status: 502 },
    );
  }
}
