import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createCmsLead, createCmsSubmission } from "@/lib/cms/leads";
import { sendCareerApplicationEmail } from "@/lib/notifications/career-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function field(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = field(form,"name");
    const email = field(form,"email");
    const phone = field(form,"phone");
    const position = field(form,"position");
    const location = field(form,"location");
    const experience = field(form,"experience");
    const currentSalary = field(form,"currentSalary");
    const expectedSalary = field(form,"expectedSalary");
    const noticePeriod = field(form,"noticePeriod");
    const consent = field(form,"consent");

    if (!name || !email || !phone || !position || !location || !experience || !consent) {
      return NextResponse.json({ ok:false, message:"Please complete all required fields." }, { status:400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok:false, message:"Please enter a valid email address." }, { status:400 });
    }

    const resume = form.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json({ ok:false, message:"Please attach your CV." }, { status:400 });
    }
    if (resume.size > MAX_RESUME_BYTES || !ALLOWED_TYPES.has(resume.type)) {
      return NextResponse.json({ ok:false, message:"CV must be a PDF, DOC or DOCX file up to 5 MB." }, { status:400 });
    }

    const uploadRoot = process.env.DGS_PRIVATE_UPLOAD_DIR || path.join(process.cwd(),"storage","careers");
    const storedName = `${Date.now()}-${randomUUID()}-${safeName(resume.name)}`;
    await mkdir(uploadRoot,{ recursive:true });
    await writeFile(path.join(uploadRoot,storedName), Buffer.from(await resume.arrayBuffer()));

    const payload = {
      position, location, experience, currentSalary, expectedSalary, noticePeriod,
      resume: { originalName: resume.name, storedName, mimeType: resume.type, size: resume.size },
      consent: true,
    };

    const leadId = await createCmsLead({
      formKey:"career-application", route:"/career/", name, email, phone,
      company:"", payload,
    });
    const submissionId = await createCmsSubmission({
      formKey:"career-application", route:"/career/", payload:{ name,email,phone,...payload },
      leadId, provider:"native",
    });

    const notification = await sendCareerApplicationEmail({
      name,email,phone,position,location,experience,currentSalary,expectedSalary,noticePeriod,resumeName:resume.name,
    }).catch(() => ({ sent:false, reason:"send-failed" }));

    return NextResponse.json({
      ok:true, submissionId,
      message:"Thank you. Your application has been received.",
      notificationSent:notification.sent,
    });
  } catch (error) {
    console.error("Career application failed", error);
    return NextResponse.json({ ok:false, message:"Unable to submit your application. Please try again." }, { status:500 });
  }
}
