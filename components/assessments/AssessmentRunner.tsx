"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AssessmentRunner.module.css";
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, Check, Clock, FileText } from "lucide-react";

export interface PracticalTaskData {
  title: string;
  instructions: string;
  deliverables: string[];
}

export type PublicQuestion =
  | { id: string; type: "mcq"; prompt: string; options: string[]; competencyTag?: string }
  | { id: string; type: "short" | "long"; prompt: string; minWords?: number; scenario?: string; competencyTag?: string }
  | { id: string; type: "psychometric"; prompt: string; options: Array<{ id: string; label: string }>; competencyTag?: string }
  | { id: string; type: "practical"; prompt: string; instructions?: string; deliverables?: string[]; competencyTag?: string };

type Props = {
  token: string;
  assessmentKey: string;
  title: string;
  summary: string;
  durationMinutes: number;
  questions: PublicQuestion[];
  practicalTask?: PracticalTaskData | null;
};

type ActivityEvent = { type: string; at: string; detail?: string };

type SectionKey = "instructions" | "technical" | "psychometric" | "practical" | "review";

export function AssessmentRunner(props: Props) {
  const { token, assessmentKey, title, summary, durationMinutes, questions, practicalTask } = props;

  const [attemptId, setAttemptId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const [status, setStatus] = useState<"starting" | "ready" | "submitting" | "done" | "error">("starting");
  const [message, setMessage] = useState("");
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);

  const activity = useRef<ActivityEvent[]>([]);

  const addActivity = (type: string, detail?: string) => {
    activity.current.push({ type, detail, at: new Date().toISOString() });
  };

  // Separate questions by section
  const technicalQuestions = useMemo(
    () => questions.filter((q) => q.type === "mcq" || q.type === "short" || q.type === "long"),
    [questions]
  );

  const psychometricQuestions = useMemo(
    () => questions.filter((q) => q.type === "psychometric"),
    [questions]
  );

  const practicalQuestion = useMemo(
    () => questions.find((q) => q.type === "practical"),
    [questions]
  );

  const hasPractical = Boolean(practicalQuestion || practicalTask);

  // Available sections list
  const sections = useMemo<Array<{ key: SectionKey; label: string; count?: number }>>(() => {
    const list: Array<{ key: SectionKey; label: string; count?: number }> = [
      { key: "instructions", label: "Instructions" },
    ];
    if (technicalQuestions.length > 0) {
      list.push({ key: "technical", label: "Role Assessment", count: technicalQuestions.length });
    }
    if (psychometricQuestions.length > 0) {
      list.push({ key: "psychometric", label: "Psychometric Assessment", count: psychometricQuestions.length });
    }
    if (hasPractical) {
      list.push({ key: "practical", label: "Practical Task" });
    }
    list.push({ key: "review", label: "Review & Submit" });
    return list;
  }, [technicalQuestions.length, psychometricQuestions.length, hasPractical]);

  const [currentSection, setCurrentSection] = useState<SectionKey>("instructions");

  // Form answers state
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});

  // 1. Initial Assessment Start Ping
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const response = await fetch("/api/assessment/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, assessmentKey }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || "Unable to start assessment.");
        if (cancelled) return;
        setAttemptId(data.attemptId);
        setStartedAt(data.startedAt);
        setCandidateName(data.candidateName || "");
        setStatus("ready");
        addActivity("assessment_started");
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Unable to start assessment.");
        }
      }
    }
    void start();
    return () => {
      cancelled = true;
    };
  }, [token, assessmentKey]);

  // 2. Autosave and restore answers from localStorage
  useEffect(() => {
    if (!attemptId) return;
    try {
      const saved = localStorage.getItem(`dgs_attempt_${attemptId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormAnswers(parsed);
      }
    } catch {}
  }, [attemptId]);

  const handleInputChange = (questionId: string, value: string) => {
    setFormAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      if (attemptId) {
        try {
          localStorage.setItem(`dgs_attempt_${attemptId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // 3. Timer Countdown
  useEffect(() => {
    if (status !== "ready" || !startedAt) return;
    const update = () => {
      const started = new Date(startedAt.replace(" ", "T") + "Z").getTime();
      const left = Math.max(0, Math.floor((durationMinutes * 60 * 1000 - (Date.now() - started)) / 1000));
      setRemaining(left);
      if (left === 0) {
        addActivity("timer_expired");
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [status, startedAt, durationMinutes]);

  // 4. Tab visibility and blur detection
  useEffect(() => {
    if (status !== "ready") return;
    const visibility = () => addActivity(document.hidden ? "tab_hidden" : "tab_visible");
    const blur = () => addActivity("window_blur");
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", blur);
    };
  }, [status]);

  // 5. Timer auto-submit when expired
  useEffect(() => {
    if (status === "ready" && remaining === 0) {
      addActivity("auto_submitted_time_expired");
      void submitFinalAssessment();
    }
  }, [status, remaining]);

  const timerText = useMemo(() => {
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, [remaining]);

  // Section index helper
  const currentSectionIndex = sections.findIndex((s) => s.key === currentSection);

  // Completion calculation
  const technicalAnsweredCount = technicalQuestions.filter(
    (q) => formAnswers[q.id] !== undefined && formAnswers[q.id].trim() !== ""
  ).length;

  const psychometricAnsweredCount = psychometricQuestions.filter(
    (q) => formAnswers[q.id] !== undefined && formAnswers[q.id] !== ""
  ).length;

  const practicalAnswered = Boolean(
    formAnswers["practical_task"] || (practicalQuestion && formAnswers[practicalQuestion.id])
  );

  // Navigation handlers
  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      const nextKey = sections[currentSectionIndex + 1].key;
      setCurrentSection(nextKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      const prevKey = sections[currentSectionIndex - 1].key;
      setCurrentSection(prevKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit Final Assessment
  async function submitFinalAssessment() {
    if (!attemptId || status !== "ready") return;

    // Validate psychometric completion
    const unPsycho = psychometricQuestions.filter(
      (q) => formAnswers[q.id] === undefined || formAnswers[q.id] === ""
    );
    if (unPsycho.length > 0) {
      setMessage(`Please answer all ${psychometricQuestions.length} psychometric situational questions before submitting.`);
      setCurrentSection("psychometric");
      return;
    }

    setStatus("submitting");
    setMessage("");

    const answers: Record<string, unknown> = {};
    for (const q of questions) {
      const val = formAnswers[q.id] !== undefined ? formAnswers[q.id] : "";
      answers[q.id] = q.type === "mcq" || q.type === "psychometric" ? Number(val) : String(val);
    }
    if (formAnswers["practical_task"]) {
      answers["practical_task"] = formAnswers["practical_task"];
    }

    addActivity("assessment_submitted");

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers, activity: activity.current }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Submission failed.");

      try {
        localStorage.removeItem(`dgs_attempt_${attemptId}`);
      } catch {}

      setStatus("done");
      setMessage(
        "Your assessment has been received. Our recruitment team will review your complete technical and situational responses and contact you directly."
      );
    } catch (error) {
      setStatus("ready");
      setMessage(error instanceof Error ? error.message : "Submission failed. Please check your connection and retry.");
    }
  }

  if (status === "starting") {
    return <div className={styles.state}>Preparing your secure assessment…</div>;
  }
  if (status === "error") {
    return (
      <div className={styles.state}>
        <h2>Assessment Unavailable</h2>
        <p>{message}</p>
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className={styles.state}>
        <CheckCircle2 size={48} style={{ color: "#4ade80", margin: "0 auto 16px" }} />
        <h2 style={{ color: "#fff", marginBottom: "8px" }}>Assessment Submitted</h2>
        <p style={{ maxWidth: "520px", margin: "0 auto", lineHeight: "1.6", color: "#a5a5b5" }}>{message}</p>
      </div>
    );
  }

  return (
    <main className={styles.shell}>
      {/* Top Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>{"D'Genius Solutions"} · Candidate Assessment</p>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
        <div className={styles.timer} aria-live="polite">
          <span>Time Remaining</span>
          <strong style={{ color: remaining < 300 ? "#ef4444" : "inherit" }}>{timerText}</strong>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <nav className={styles.stepper} aria-label="Assessment Sections">
        <div className={styles.stepPills}>
          {sections.map((sec, idx) => {
            const isActive = sec.key === currentSection;
            let isComplete = false;
            if (sec.key === "instructions") isComplete = instructionsAccepted;
            if (sec.key === "technical") isComplete = technicalAnsweredCount === technicalQuestions.length && technicalQuestions.length > 0;
            if (sec.key === "psychometric") isComplete = psychometricAnsweredCount === psychometricQuestions.length && psychometricQuestions.length > 0;
            if (sec.key === "practical") isComplete = practicalAnswered;

            return (
              <button
                key={sec.key}
                type="button"
                className={`${styles.stepPill} ${isActive ? styles.active : ""} ${isComplete ? styles.completed : ""}`}
                onClick={() => {
                  setCurrentSection(sec.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span>{idx + 1}.</span>
                <span>{sec.label}</span>
                {isComplete && <Check size={12} />}
              </button>
            );
          })}
        </div>
        <div className={styles.progressLabel}>
          Step {currentSectionIndex + 1} of {sections.length}: <strong>{sections[currentSectionIndex].label}</strong>
        </div>
      </nav>

      {/* Candidate Notice */}
      <section className={styles.notice}>
        <div>
          <strong>{candidateName ? `Candidate: ${candidateName}` : "Secure Assessment Session"}</strong>
          <span> · Answers autosave locally. Independent work is expected.</span>
        </div>
        <span style={{ fontSize: "0.74rem", color: "#8b8c99" }}>Session Token Verified</span>
      </section>

      {message ? <div className={styles.error} style={{ maxWidth: "1040px", margin: "0 auto 16px" }}>{message}</div> : null}

      {/* SECTION 1: INSTRUCTIONS */}
      {currentSection === "instructions" && (
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeader}>
            <h2>Section 1: Assessment Instructions &amp; Integrity Guidelines</h2>
            <p>Please review these instructions carefully before proceeding to the technical and workplace evaluation.</p>
          </div>

          <div className={styles.instructionsCard}>
            <div className={styles.instructionItem}>
              <div className={styles.instructionNum}>1</div>
              <div className={styles.instructionText}>
                <h3>Structure &amp; Two-Part Evaluation</h3>
                <p>
                  This assessment evaluates both your <strong>Role &amp; Technical Competency</strong> (MCQs and case scenarios)
                  and your <strong>Workplace Situational Judgment</strong> (10 situational workplace questions). Both sections are
                  completed in this unified session.
                </p>
              </div>
            </div>

            <div className={styles.instructionItem}>
              <div className={styles.instructionNum}>2</div>
              <div className={styles.instructionText}>
                <h3>Continuous Autosave &amp; Navigation</h3>
                <p>
                  Your answers are autosaved on every input. You may freely use the navigation bar or the Previous and Next
                  buttons to review and refine your responses at any point before submitting.
                </p>
              </div>
            </div>

            <div className={styles.instructionItem}>
              <div className={styles.instructionNum}>3</div>
              <div className={styles.instructionText}>
                <h3>Time Allowance ({durationMinutes} Minutes)</h3>
                <p>
                  The overall timer is server-enforced and displayed at the top right. Once the timer reaches zero, the system
                  will automatically record your saved answers and finalize submission.
                </p>
              </div>
            </div>

            <div className={styles.instructionItem}>
              <div className={styles.instructionNum}>4</div>
              <div className={styles.instructionText}>
                <h3>Independent Work &amp; Human HR Review</h3>
                <p>
                  Work independently. Psychometric and situational questions are non-diagnostic, strictly supplemental, and
                  reviewed holistically by human HR evaluators with zero automated rejection.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px" }}>
              <label style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={instructionsAccepted}
                  onChange={(e) => setInstructionsAccepted(e.target.checked)}
                  style={{ accentColor: "#a900ff", width: "16px", height: "16px" }}
                />
                <span>I have read and understood the assessment instructions and agree to complete it independently.</span>
              </label>
            </div>
          </div>

          <div className={styles.actionNav}>
            <span style={{ fontSize: "0.82rem", color: "#8b8c99" }}>Step 1 of {sections.length}</span>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
              disabled={!instructionsAccepted}
              onClick={handleNextSection}
            >
              Start Assessment <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: TECHNICAL ASSESSMENT */}
      {currentSection === "technical" && (
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeader}>
            <h2>Section 2: Role &amp; Technical Assessment</h2>
            <p>
              Answer the following technical questions covering core domain competencies, practical execution, and problem solving.
              ({technicalAnsweredCount} of {technicalQuestions.length} answered)
            </p>
          </div>

          {technicalQuestions.map((q, idx) => (
            <section className={styles.question} key={q.id}>
              <div className={styles.questionHead}>
                <span>Q{String(idx + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{q.prompt}</h2>
                  {q.type !== "mcq" && (q as any).scenario && (
                    <div className={styles.scenarioContext}>
                      <strong>Scenario:</strong> {(q as any).scenario}
                    </div>
                  )}
                </div>
              </div>

              {q.type === "mcq" ? (
                <div className={styles.options}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = formAnswers[q.id] === String(optIdx);
                    return (
                      <label
                        key={optIdx}
                        className={`${styles.optionCard} ${isSelected ? styles.selected : ""}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={optIdx}
                          checked={isSelected}
                          onChange={() => handleInputChange(q.id, String(optIdx))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.textareaWrap}>
                  <textarea
                    name={q.id}
                    rows={q.type === "long" ? 9 : 5}
                    value={formAnswers[q.id] || ""}
                    placeholder="Type your structured technical response here..."
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    onPaste={() => addActivity("paste", q.id)}
                  />
                  <div className={styles.hint}>
                    {(() => {
                      const minW = "minWords" in q ? q.minWords : undefined;
                      const words = (formAnswers[q.id] || "").trim().split(/\s+/).filter(Boolean).length;
                      return (
                        <>
                          <span>
                            Words:{" "}
                            <strong className={minW && words >= minW ? styles.wordCountValid : styles.wordCountPending}>
                              {words}
                            </strong>
                            {minW ? ` (Minimum required: ${minW})` : ""}
                          </span>
                          <span>Autosaved</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </section>
          ))}

          <div className={styles.actionNav}>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={handlePrevSection}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={handleNextSection}>
              Save &amp; Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: PSYCHOMETRIC ASSESSMENT */}
      {currentSection === "psychometric" && (
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeader}>
            <h2>Section 3: Workplace Situational Judgment Assessment</h2>
            <p>
              Select the option that best describes how you would realistically handle each workplace scenario. There are
              no trick questions. All 10 questions in this section are mandatory. ({psychometricAnsweredCount} of{" "}
              {psychometricQuestions.length} answered)
            </p>
          </div>

          {psychometricQuestions.map((q, idx) => (
            <section className={styles.question} key={q.id}>
              <div className={styles.questionHead}>
                <span>S{String(idx + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{q.prompt}</h2>
                </div>
              </div>

              <div className={styles.options}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = formAnswers[q.id] === String(optIdx);
                  return (
                    <label
                      key={opt.id || optIdx}
                      className={`${styles.optionCard} ${isSelected ? styles.selected : ""}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => handleInputChange(q.id, String(optIdx))}
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}

          <div className={styles.actionNav}>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={handlePrevSection}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={handleNextSection}>
              Save &amp; Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: PRACTICAL TASK (IF CONFIGURED) */}
      {currentSection === "practical" && hasPractical && (
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeader}>
            <h2>Section 4: Practical Task Assessment</h2>
            <p>{practicalTask?.title || practicalQuestion?.prompt || "Agency Practical Assignment"}</p>
          </div>

          <div className={styles.instructionsCard}>
            <div style={{ fontSize: "0.92rem", color: "#ddd", lineHeight: "1.6" }}>
              {practicalTask?.instructions || (practicalQuestion as any)?.instructions || "Complete the practical task deliverables below."}
            </div>

            {practicalTask?.deliverables && practicalTask.deliverables.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <strong style={{ fontSize: "0.85rem", color: "#c9b5ff", textTransform: "uppercase" }}>Expected Deliverables:</strong>
                <ul style={{ margin: "8px 0 0 20px", color: "#9da0ae", fontSize: "0.88rem", display: "grid", gap: "6px" }}>
                  {practicalTask.deliverables.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#c9b5ff", marginBottom: "8px", fontWeight: 600 }}>
                Your Practical Submission / Working URLs / Documentation
              </label>
              <textarea
                rows={8}
                value={formAnswers["practical_task"] || ""}
                onChange={(e) => handleInputChange("practical_task", e.target.value)}
                placeholder="Paste your code repo links, Google Doc links, or write out your practical execution deliverable here..."
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#09090e",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div className={styles.actionNav}>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={handlePrevSection}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={handleNextSection}>
              Save &amp; Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: REVIEW & FINAL SUBMISSION */}
      {currentSection === "review" && (
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeader}>
            <h2>Section 5: Final Review &amp; Submission</h2>
            <p>Verify that you have completed all sections before submitting your assessment.</p>
          </div>

          <div className={styles.reviewGrid}>
            {/* Technical Review Card */}
            {technicalQuestions.length > 0 && (
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <h3>Role &amp; Technical Assessment</h3>
                  <span
                    className={`${styles.statusPill} ${
                      technicalAnsweredCount === technicalQuestions.length ? styles.statusPillSuccess : styles.statusPillWarn
                    }`}
                  >
                    {technicalAnsweredCount} / {technicalQuestions.length} Answered
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#8b8c99", lineHeight: "1.4" }}>
                  {technicalAnsweredCount === technicalQuestions.length
                    ? "All technical questions have answers recorded."
                    : "Some technical questions remain unanswered."}
                </p>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navBtnSecondary}`}
                  style={{ minHeight: "36px", fontSize: "0.78rem", padding: "0 12px", justifySelf: "start" }}
                  onClick={() => {
                    setCurrentSection("technical");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit Technical Answers
                </button>
              </div>
            )}

            {/* Psychometric Review Card */}
            {psychometricQuestions.length > 0 && (
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <h3>Workplace Situational Assessment</h3>
                  <span
                    className={`${styles.statusPill} ${
                      psychometricAnsweredCount === psychometricQuestions.length
                        ? styles.statusPillSuccess
                        : styles.statusPillWarn
                    }`}
                  >
                    {psychometricAnsweredCount} / {psychometricQuestions.length} Answered
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#8b8c99", lineHeight: "1.4" }}>
                  {psychometricAnsweredCount === psychometricQuestions.length
                    ? "All 10 workplace situational scenarios completed."
                    : `${psychometricQuestions.length - psychometricAnsweredCount} situational questions still required.`}
                </p>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navBtnSecondary}`}
                  style={{ minHeight: "36px", fontSize: "0.78rem", padding: "0 12px", justifySelf: "start" }}
                  onClick={() => {
                    setCurrentSection("psychometric");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit Situational Answers
                </button>
              </div>
            )}

            {/* Practical Task Review Card */}
            {hasPractical && (
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <h3>Practical Task</h3>
                  <span className={`${styles.statusPill} ${practicalAnswered ? styles.statusPillSuccess : styles.statusPillWarn}`}>
                    {practicalAnswered ? "Deliverable Provided" : "Optional / Pending"}
                  </span>
                </div>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.navBtnSecondary}`}
                  style={{ minHeight: "36px", fontSize: "0.78rem", padding: "0 12px", justifySelf: "start" }}
                  onClick={() => {
                    setCurrentSection("practical");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit Practical Deliverables
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              background: "rgba(169, 0, 255, 0.08)",
              border: "1px solid rgba(169, 0, 255, 0.25)",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <ShieldCheck size={28} style={{ color: "#c9b5ff", flexShrink: 0 }} />
            <div style={{ fontSize: "0.85rem", color: "#d1d1dc", lineHeight: "1.5" }}>
              <strong>Submission Finality:</strong> Once submitted, your assessment attempt is officially closed. Our talent
              evaluation team will review your complete technical reasoning and workplace situational profile.
            </div>
          </div>

          <div className={styles.actionNav}>
            <button type="button" className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={handlePrevSection}>
              <ArrowLeft size={16} /> Previous
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
              disabled={status === "submitting" || psychometricAnsweredCount < psychometricQuestions.length}
              onClick={submitFinalAssessment}
              style={{ minHeight: "48px", padding: "0 28px", fontWeight: 700 }}
            >
              {status === "submitting" ? "Submitting Securely…" : "Submit Final Assessment"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
