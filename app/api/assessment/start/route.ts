import { NextResponse } from "next/server";
import { getAssessmentByKey } from "@/lib/assessments/definitions";
import { startAssessmentAttempt } from "@/lib/cms/assessments";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:Request) {
  try {
    const input=await request.json() as { token?:string; assessmentKey?:string };
    const token=String(input.token||"");
    const assessmentKey=String(input.assessmentKey||"");
    const definition=getAssessmentByKey(assessmentKey);
    if(!definition || !token) return NextResponse.json({ok:false,message:"Invalid assessment link."},{status:400});
    const attempt=await startAssessmentAttempt(token,assessmentKey);
    return NextResponse.json({
      ok:true,
      attemptId:attempt.id,
      startedAt:attempt.started_at,
      durationMinutes:definition.durationMinutes,
      candidateName:attempt.candidate_name,
    });
  } catch(error) {
    return NextResponse.json({ok:false,message:error instanceof Error?error.message:"Unable to start assessment."},{status:400});
  }
}
