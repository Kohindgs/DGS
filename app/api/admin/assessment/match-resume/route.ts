import { NextRequest, NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { compareResumeToJD } from "@/lib/assessments/gemini-engine";
import { storePrivateCandidateFile } from "@/lib/cms/assessments";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

/**
 * Extract text from buffer based on file extension / mime type
 */
async function extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "txt") {
    return buffer.toString("utf8");
  }

  if (ext === "docx" || mimeType.includes("wordprocessingml")) {
    try {
      const res = await mammoth.extractRawText({ buffer });
      return res.value.trim();
    } catch (err) {
      console.warn("Mammoth extraction error:", err);
    }
  }

  if (ext === "pdf" || mimeType.includes("pdf")) {
    const raw = buffer.toString("binary");
    let text = "";
    const matches = raw.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.replace(/^stream[\r\n]+/, "").replace(/[\r\n]+endstream$/, "");
        // Extract printable ascii strings
        const textSnippets = cleaned.match(/[A-Za-z0-9 .,:;\-_'/()]{4,}/g);
        if (textSnippets) {
          text += " " + textSnippets.join(" ");
        }
      }
    }
    if (text.trim().length > 50) {
      return text.trim();
    }
  }

  return "";
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "assessments", "create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const candidateId = String(formData.get("candidate_id") || "temp_" + Date.now());
    const roleTitle = String(formData.get("role_title") || "Target Role");
    const jdContent = String(formData.get("jd_content") || "");
    let resumeText = String(formData.get("resume_text") || "");
    const file = formData.get("cv_file") as File | null;

    let docId: string | null = null;

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Store in private storage outside web root
      docId = await storePrivateCandidateFile({
        candidateId,
        documentType: "cv",
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        buffer,
      });

      if (!resumeText) {
        resumeText = await extractText(buffer, file.type, file.name);
      }
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "No resume text could be extracted. Please paste resume text directly." },
        { status: 400 }
      );
    }

    if (!jdContent.trim()) {
      return NextResponse.json({ error: "Job Description content is required." }, { status: 400 });
    }

    const matchResult = await compareResumeToJD(jdContent, resumeText, roleTitle);

    return NextResponse.json({
      success: true,
      docId,
      matchResult,
      extractedSnippet: resumeText.slice(0, 300) + "...",
    });
  } catch (err: any) {
    console.error("Resume matching error:", err);
    return NextResponse.json({ error: err.message || "Resume comparison failed" }, { status: 500 });
  }
}
