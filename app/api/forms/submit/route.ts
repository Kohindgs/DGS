import { NextResponse } from "next/server";
import { validateClientSubmitPayload } from "@/lib/forms/submit";
import { submitNativeLeadForm } from "@/lib/forms/native/submit";

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

    const result = await submitNativeLeadForm(options);

    return NextResponse.json(
      { ...result, provider: "native" },
      { status: result.ok ? 200 : 422 },
    );
  } catch (error) {
    console.error("Live lead form submission failed:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't submit your enquiry right now. Please call +91 99879 22901 or email business@dgeniussolutions.com.",
      },
      { status: 500 },
    );
  }
}
