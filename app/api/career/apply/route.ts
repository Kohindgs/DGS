import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createCmsLead, createCmsSubmission } from "@/lib/cms/leads";
import { sendCareerApplicationEmail } from "@/lib/notifications/career-email";
import { loadActiveCareerJobs } from "@/lib/careers/jobs";
import { publishNotificationEvent } from "@/lib/notifications/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PORTFOLIO_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream", // Fallback when browser sends generic stream
]);

function field(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString("utf-8") === "%PDF";
}

function isDocOrDocxBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // DOCX / ZIP magic bytes: PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) return true;
  // DOC / OLECF magic bytes: \xD0\xCF\x11\xE0
  if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const firstName = field(form, "firstName");
    const lastName = field(form, "lastName");
    const rawName = field(form, "name");
    const name = rawName || (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName);

    const email = field(form, "email");
    const phone = field(form, "phone");
    const position = field(form, "position");
    const location = field(form, "location");
    const company = field(form, "company") || field(form, "currentCompany");
    const experience = field(form, "experience");
    const currentSalary = field(form, "currentSalary");
    const expectedSalary = field(form, "expectedSalary");
    const noticePeriod = field(form, "noticePeriod");
    const education = field(form, "education");
    const portfolioUrl = field(form, "portfolioUrl") || field(form, "portfolio_url");
    const consent = field(form, "consent");

    if (!name || !email || !phone || !position || !location || !experience || !consent) {
      return NextResponse.json(
        { ok: false, message: "Please complete all required fields." },
        { status: 400 },
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Load active job definition to inspect creative requirement rules
    const jobs = await loadActiveCareerJobs();
    const matchedJob = jobs.find(
      (j) =>
        j.title.toLowerCase() === position.toLowerCase() ||
        j.slug.toLowerCase() === position.toLowerCase(),
    );

    // Validate Resume file
    const resumeEntry = form.get("resume") || form.get("cv");
    if (!(resumeEntry instanceof File) || resumeEntry.size === 0) {
      return NextResponse.json(
        { ok: false, message: "Please attach your CV." },
        { status: 400 },
      );
    }
    if (resumeEntry.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { ok: false, message: "CV must be a PDF, DOC or DOCX file up to 5 MB." },
        { status: 400 },
      );
    }

    const resumeExt = path.extname(resumeEntry.name).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(resumeExt)) {
      return NextResponse.json(
        { ok: false, message: "CV must have a .pdf, .doc, or .docx file extension." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resumeEntry.arrayBuffer());
    if (resumeExt === ".pdf" && !isPdfBuffer(resumeBuffer)) {
      return NextResponse.json(
        { ok: false, message: "The uploaded CV is not a valid PDF document." },
        { status: 400 },
      );
    }
    if ([".doc", ".docx"].includes(resumeExt) && !isDocOrDocxBuffer(resumeBuffer)) {
      return NextResponse.json(
        { ok: false, message: "The uploaded CV is not a valid Word document." },
        { status: 400 },
      );
    }

    // Validate Creative Requirements (e.g. Generative AI Artist or configured jobs)
    const portfolioEntry = form.get("portfolioFile") || form.get("portfolio");
    const hasPortfolioFile = portfolioEntry instanceof File && portfolioEntry.size > 0;
    const hasPortfolioUrl = Boolean(portfolioUrl && /^https?:\/\//i.test(portfolioUrl));

    const creativeReq = matchedJob?.creativeRequirements;
    const isPortfolioRequired =
      creativeReq?.required ||
      matchedJob?.slug === "generative-ai-artist" ||
      position.toLowerCase().includes("generative ai artist");

    if (isPortfolioRequired && !hasPortfolioUrl && !hasPortfolioFile) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please provide a portfolio link or upload your portfolio PDF.",
        },
        { status: 400 },
      );
    }

    let portfolioBuffer: Buffer | undefined;
    let portfolioStoredName: string | undefined;
    let portfolioOriginalName: string | undefined;
    let portfolioMimeType: string | undefined;

    if (hasPortfolioFile && portfolioEntry instanceof File) {
      if (portfolioEntry.size > MAX_PORTFOLIO_BYTES) {
        return NextResponse.json(
          { ok: false, message: "Portfolio file exceeds the 15 MB limit." },
          { status: 400 },
        );
      }
      const portExt = path.extname(portfolioEntry.name).toLowerCase();
      if (portExt !== ".pdf") {
        return NextResponse.json(
          { ok: false, message: "Portfolio file must be a PDF document." },
          { status: 400 },
        );
      }
      portfolioBuffer = Buffer.from(await portfolioEntry.arrayBuffer());
      if (!isPdfBuffer(portfolioBuffer)) {
        return NextResponse.json(
          { ok: false, message: "Uploaded portfolio is not a valid PDF file." },
          { status: 400 },
        );
      }
      portfolioOriginalName = portfolioEntry.name;
      portfolioMimeType = portfolioEntry.type || "application/pdf";
    }

    // Secure Private File Storage (NEVER in public /cms-media/)
    const uploadRoot =
      process.env.DGS_PRIVATE_UPLOAD_DIR ||
      path.join(process.cwd(), "storage", "careers");
    await mkdir(uploadRoot, { recursive: true });

    const resumeStoredName = `${Date.now()}-${randomUUID()}-${safeFileName(resumeEntry.name)}`;
    await writeFile(path.join(uploadRoot, resumeStoredName), resumeBuffer);

    if (portfolioBuffer && portfolioOriginalName) {
      portfolioStoredName = `${Date.now()}-${randomUUID()}-portfolio-${safeFileName(portfolioOriginalName)}`;
      await writeFile(path.join(uploadRoot, portfolioStoredName), portfolioBuffer);
    }

    // Structured Lead & Submission Payload
    const payload = {
      firstName: firstName || name.split(" ")[0] || "",
      lastName: lastName || name.split(" ").slice(1).join(" ") || "",
      position,
      location,
      company: company || "",
      education: education || "",
      experience,
      currentSalary: currentSalary || "",
      expectedSalary: expectedSalary || "",
      noticePeriod: noticePeriod || "",
      portfolioUrl: portfolioUrl || "",
      portfolio: portfolioStoredName
        ? {
            originalName: portfolioOriginalName,
            storedName: portfolioStoredName,
            mimeType: portfolioMimeType,
            size: portfolioBuffer?.length,
          }
        : undefined,
      resume: {
        originalName: resumeEntry.name,
        storedName: resumeStoredName,
        mimeType: resumeEntry.type || "application/pdf",
        size: resumeEntry.size,
      },
      consent: true,
    };

    const leadId = await createCmsLead({
      formKey: "career-application",
      route: "/career/",
      name,
      email,
      phone,
      company: company || "",
      payload,
    });

    const submissionId = await createCmsSubmission({
      formKey: "career-application",
      route: "/career/",
      payload: { name, email, phone, ...payload },
      leadId,
      provider: "native",
    });

    // Send DGS Branded Email Notification with file attachments
    const notification = await sendCareerApplicationEmail({
      name,
      email,
      phone,
      position,
      location,
      company,
      education,
      experience,
      currentSalary,
      expectedSalary,
      noticePeriod,
      portfolioUrl,
      resumeName: resumeEntry.name,
      resumeBuffer,
      resumeMimeType: resumeEntry.type,
      portfolioName: portfolioOriginalName,
      portfolioBuffer,
      portfolioMimeType,
      leadId,
    }).catch((err) => {
      console.error("Failed to send career application email notification:", err);
      return { sent: false, reason: "send-failed" };
    });

    await publishNotificationEvent({
      type: "new_application",
      severity: "info",
      title: `New Candidate: ${name} (${position})`,
      message: `Experience: ${experience || "Not specified"}. Location: ${location || "Not specified"}.`,
      resource_type: "career_application",
      resource_id: leadId,
      resource_url: `/admin/hr-pipeline/?candidate=${encodeURIComponent(email)}`,
      recipient_role: "hr",
    }).catch((err) => console.error("Failed to publish career application notification event", err));

    return NextResponse.json({
      ok: true,
      submissionId,
      leadId,
      message: "Thank you. Your application has been received.",
      notificationSent: notification.sent,
    });
  } catch (error) {
    console.error("Career application failed:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to submit your application. Please try again." },
      { status: 500 },
    );
  }
}
