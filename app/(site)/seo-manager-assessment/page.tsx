import type { Metadata } from "next";
import { AssessmentRunner } from "@/components/assessments/AssessmentRunner";
import { getAssessmentByKey, getPublicQuestions } from "@/lib/assessments/definitions";

export const dynamic="force-dynamic";

export const metadata:Metadata={
  title:"SEO Manager Assessment | D'Genius Solutions",
  robots:{index:false,follow:false,nocache:true},
};

export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}) {
  const {token=""}=await searchParams;
  const definition=getAssessmentByKey("seo-manager");
  if(!definition) return null;
  if(!token) {
    return <main style={{minHeight:"70vh",display:"grid",placeContent:"center",background:"#08080b",color:"#fff",padding:32,textAlign:"center"}}>
      <div><h1>Private assessment</h1><p>This assessment requires a valid candidate link.</p></div>
    </main>;
  }
  return <AssessmentRunner
    token={token}
    assessmentKey={definition.key}
    title={definition.title}
    summary={definition.summary}
    durationMinutes={definition.durationMinutes}
    questions={getPublicQuestions(definition)}
  />;
}
