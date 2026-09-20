import { NextResponse } from "next/server";
import { getAssessmentByKey } from "@/lib/assessments/definitions";
import { getAttempt, submitAssessmentAttempt } from "@/lib/cms/assessments";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function countWords(value:unknown) {
  return String(value||"").trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request:Request) {
  try {
    const input=await request.json() as {
      attemptId?:string; answers?:Record<string,unknown>; activity?:unknown[];
    };
    const attemptId=String(input.attemptId||"");
    const attempt=await getAttempt(attemptId);
    if(!attempt || attempt.submitted_at) {
      return NextResponse.json({ok:false,message:"Assessment attempt is unavailable."},{status:400});
    }
    const definition=getAssessmentByKey(attempt.assessment_key);
    if(!definition) return NextResponse.json({ok:false,message:"Assessment configuration missing."},{status:400});

    const elapsed=Date.now()-new Date(attempt.started_at.replace(" ","T")+"Z").getTime();
    const allowedMs=(definition.durationMinutes+5)*60*1000;
    if(elapsed>allowedMs) return NextResponse.json({ok:false,message:"Assessment time has expired."},{status:408});

    const answers=input.answers||{};
    let score=0;
    let total=0;

    for(const question of definition.questions) {
      if(question.type==="mcq") {
        total+=1;
        if(Number(answers[question.id])===question.correctIndex) score+=1;
      } else if(question.minWords && countWords(answers[question.id])<question.minWords) {
        return NextResponse.json({
          ok:false,
          message:`Please complete ${question.id} with at least ${question.minWords} words.`,
        },{status:400});
      }
    }

    await submitAssessmentAttempt({
      id:attempt.id,
      answers,
      activity:Array.isArray(input.activity)?input.activity:[],
      score,
      total,
    });

    return NextResponse.json({
      ok:true,
      message:"Assessment submitted successfully.",
      objectiveScore:score,
      objectiveTotal:total,
    });
  } catch(error) {
    return NextResponse.json({ok:false,message:error instanceof Error?error.message:"Unable to submit assessment."},{status:500});
  }
}
