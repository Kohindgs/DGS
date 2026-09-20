"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AssessmentRunner.module.css";

type PublicQuestion =
  | { id:string; type:"mcq"; prompt:string; options:string[] }
  | { id:string; type:"short"|"long"; prompt:string; minWords?:number };

type Props={
  token:string;
  assessmentKey:string;
  title:string;
  summary:string;
  durationMinutes:number;
  questions:PublicQuestion[];
};

type ActivityEvent={ type:string; at:string; detail?:string };

export function AssessmentRunner(props:Props) {
  const {token,assessmentKey,title,summary,durationMinutes,questions}=props;
  const [attemptId,setAttemptId]=useState("");
  const [candidateName,setCandidateName]=useState("");
  const [startedAt,setStartedAt]=useState("");
  const [remaining,setRemaining]=useState(durationMinutes*60);
  const [status,setStatus]=useState<"starting"|"ready"|"submitting"|"done"|"error">("starting");
  const [message,setMessage]=useState("");
  const activity=useRef<ActivityEvent[]>([]);
  const formRef=useRef<HTMLFormElement>(null);

  const addActivity=(type:string,detail?:string)=>{
    activity.current.push({type,detail,at:new Date().toISOString()});
  };

  useEffect(()=>{
    let cancelled=false;
    async function start(){
      try{
        const response=await fetch("/api/assessment/start",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({token,assessmentKey}),
        });
        const data=await response.json();
        if(!response.ok||!data.ok) throw new Error(data.message||"Unable to start assessment.");
        if(cancelled) return;
        setAttemptId(data.attemptId);
        setStartedAt(data.startedAt);
        setCandidateName(data.candidateName||"");
        setStatus("ready");
        addActivity("assessment_started");
      }catch(error){
        if(!cancelled){setStatus("error");setMessage(error instanceof Error?error.message:"Unable to start assessment.");}
      }
    }
    void start();
    return()=>{cancelled=true;};
  },[token,assessmentKey]);

  useEffect(()=>{
    if(status!=="ready"||!startedAt) return;
    const update=()=>{
      const started=new Date(startedAt.replace(" ","T")+"Z").getTime();
      const left=Math.max(0,Math.floor((durationMinutes*60*1000-(Date.now()-started))/1000));
      setRemaining(left);
      if(left===0) addActivity("timer_expired");
    };
    update();
    const timer=window.setInterval(update,1000);
    return()=>window.clearInterval(timer);
  },[status,startedAt,durationMinutes]);

  useEffect(()=>{
    if(status!=="ready") return;
    const visibility=()=>addActivity(document.hidden?"tab_hidden":"tab_visible");
    const blur=()=>addActivity("window_blur");
    document.addEventListener("visibilitychange",visibility);
    window.addEventListener("blur",blur);
    return()=>{document.removeEventListener("visibilitychange",visibility);window.removeEventListener("blur",blur);};
  },[status]);

  const timerText=useMemo(()=>{
    const min=Math.floor(remaining/60);
    const sec=remaining%60;
    return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  },[remaining]);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!attemptId||status!=="ready") return;
    setStatus("submitting");setMessage("");
    const data=new FormData(event.currentTarget);
    const answers:Record<string,unknown>={};
    for(const question of questions){
      const value=data.get(question.id);
      answers[question.id]=question.type==="mcq" ? Number(value) : String(value||"");
    }
    addActivity("assessment_submitted");
    try{
      const response=await fetch("/api/assessment/submit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({attemptId,answers,activity:activity.current}),
      });
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.message||"Submission failed.");
      setStatus("done");
      setMessage("Your assessment has been submitted. Thank you.");
    }catch(error){
      setStatus("ready");
      setMessage(error instanceof Error?error.message:"Submission failed.");
    }
  }

  if(status==="starting") return <div className={styles.state}>Preparing your secure assessment…</div>;
  if(status==="error") return <div className={styles.state}><h2>Assessment unavailable</h2><p>{message}</p></div>;
  if(status==="done") return <div className={styles.state}><h2>Submitted</h2><p>{message}</p></div>;

  return <main className={styles.shell}>

    <header className={styles.header}>
      <div><p className={styles.kicker}>D&apos;Genius Solutions · Candidate Assessment</p><h1>{title}</h1><p>{summary}</p></div>
      <div className={styles.timer} aria-live="polite"><span>Time remaining</span><strong>{timerText}</strong></div>
    </header>
    <section className={styles.notice}>
      <strong>{candidateName ? `Candidate: ${candidateName}` : "Secure assessment"}</strong>
      <span>Answer independently. Leaving the tab is logged as an activity indicator for review, not an automatic rejection.</span>
    </section>
    <form ref={formRef} onSubmit={submit} className={styles.form}>
      {questions.map((q,index)=><section className={styles.question} key={q.id}>
        <div className={styles.questionHead}><span>{String(index+1).padStart(2,"0")}</span><h2>{q.prompt}</h2></div>
        {q.type==="mcq" ? <div className={styles.options}>
          {q.options.map((option,optionIndex)=><label key={option}>
            <input type="radio" name={q.id} value={optionIndex} required />
            <span>{option}</span>
          </label>)}
        </div> : <div>
          <textarea name={q.id} rows={q.type==="long"?10:6} required onPaste={()=>addActivity("paste",q.id)} />
          {q.minWords ? <p className={styles.hint}>Minimum {q.minWords} words.</p> : null}
        </div>}
      </section>)}
      {message ? <p className={styles.error} role="alert">{message}</p> : null}
      <button className={styles.submit} type="submit" disabled={status==="submitting"||remaining===0}>
        {status==="submitting"?"Submitting…":"Submit assessment"}
      </button>
    </form>
  </main>;
}
