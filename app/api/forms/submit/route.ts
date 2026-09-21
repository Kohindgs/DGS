import { NextResponse } from "next/server";
import { forwardToFluentForms, validateClientSubmitPayload } from "@/lib/forms/submit";
import { isNativeFormEnabled, submitNativeLeadForm } from "@/lib/forms/native/submit";

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
    const options = {
      definition: validated.definition,
      route: (body as { route: string }).route,
      sanitizedFields: validated.sanitizedFields,
      captchaToken: validated.captchaToken,
    };
    const native = isNativeFormEnabled(validated.definition.fluentFormId);
    const result = native
      ? await submitNativeLeadForm(options)
      : await forwardToFluentForms(options);

    return NextResponse.json(
      { ...result, provider: native ? "native" : "wordpress" },
      { status: result.ok ? 200 : 422 },
    );
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
