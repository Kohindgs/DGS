"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, AlertCircle, Building2, UserCheck, Send } from "lucide-react";
import type { PublicReferenceCheckView, ReferenceAnswer } from "@/lib/reference-checks/types";

type Props = {
  initialData: PublicReferenceCheckView | null;
  token: string;
};

export default function RefCheckPublicClient({ initialData, token }: Props) {
  const [status, setStatus] = useState<"ready" | "submitted" | "invalid" | "expired">(
    !initialData
      ? "invalid"
      : initialData.status === "submitted"
      ? "submitted"
      : initialData.expired
      ? "expired"
      : "ready"
  );
  const [pocConfirmedTitle, setPocConfirmedTitle] = useState(initialData?.lastDesignation || "");
  const [pocConfirmedDates, setPocConfirmedDates] = useState(
    initialData?.lastEmploymentDates || ""
  );
  const [additionalComments, setAdditionalComments] = useState("");
  const [answers, setAnswers] = useState<
    Record<string, { yesNo?: "Yes" | "No"; comment: string }>
  >(() => {
    const map: Record<string, { yesNo?: "Yes" | "No"; comment: string }> = {};
    for (const q of initialData?.questions || []) {
      map[q.id] = { yesNo: undefined, comment: "" };
    }
    return map;
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const questions = (initialData?.questions || []).slice(0, 10);

  const setChoice = (qId: string, yesNo: "Yes" | "No") => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || { comment: "" }), yesNo },
    }));
    setErrorMsg(null);
  };

  const setComment = (qId: string, comment: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || { comment: "" }), comment },
    }));
  };

  const answeredCount = questions.filter((q) => Boolean(answers[q.id]?.yesNo)).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const payloadResponses: ReferenceAnswer[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const entry = answers[q.id];
      if (!entry?.yesNo) {
        setErrorMsg(`Please select Yes or No for Question ${i + 1}.`);
        return;
      }
      payloadResponses.push({
        questionId: q.id,
        yesNo: entry.yesNo,
        comment: entry.comment.trim() || undefined,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reference-checks/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: payloadResponses,
          pocConfirmedTitle: pocConfirmedTitle.trim() || undefined,
          pocConfirmedDates: pocConfirmedDates.trim() || undefined,
          additionalComments: additionalComments.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMsg(json?.message || "Could not submit feedback. Please try again.");
        return;
      }
      setStatus("submitted");
    } catch (err: any) {
      setErrorMsg(err?.message || "Network error while submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at 12% 10%, rgba(121, 40, 202, 0.16), transparent 40%), radial-gradient(circle at 88% 15%, rgba(6, 182, 212, 0.14), transparent 38%), #07080d",
        color: "#f1f5f9",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif",
        padding: "clamp(16px, 3vw, 48px)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "20px 24px",
            background: "rgba(17, 19, 28, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            marginBottom: "24px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c084fc",
                marginBottom: "4px",
              }}
            >
              D&apos;GENIUS SOLUTIONS HR &bull; CONFIDENTIAL VERIFICATION
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(20px, 2.2vw, 30px)", fontWeight: 700, color: "#ffffff" }}>
              {initialData
                ? `Professional Reference Check: ${initialData.candidateName}`
                : "Professional Reference Check"}
            </h1>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "9999px",
              background: "rgba(34, 211, 238, 0.12)",
              border: "1px solid rgba(34, 211, 238, 0.3)",
              color: "#67e8f9",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={16} />
            Confidential &bull; Under 2 Minutes
          </div>
        </header>

        {status === "invalid" && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "rgba(17, 19, 28, 0.9)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              borderRadius: "16px",
            }}
          >
            <AlertCircle size={44} color="#f87171" style={{ marginBottom: "14px" }} />
            <h2 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#fff" }}>
              Reference Check Link Invalid or Not Found
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              Please contact D&apos;Genius Solutions HR (hr@dgeniussolutions.com) if you believe this is an error.
            </p>
          </div>
        )}

        {status === "expired" && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "rgba(17, 19, 28, 0.9)",
              border: "1px solid rgba(251, 191, 36, 0.25)",
              borderRadius: "16px",
            }}
          >
            <AlertCircle size={44} color="#fbbf24" style={{ marginBottom: "14px" }} />
            <h2 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#fff" }}>
              Reference Link Expired
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
              This verification window has closed. Please reach out to hr@dgeniussolutions.com for a fresh link.
            </p>
          </div>
        )}

        {status === "submitted" && (
          <div
            style={{
              padding: "56px 24px",
              textAlign: "center",
              background: "rgba(17, 19, 28, 0.92)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              borderRadius: "16px",
            }}
          >
            <CheckCircle2 size={52} color="#34d399" style={{ marginBottom: "16px" }} />
            <h2 style={{ margin: "0 0 10px 0", fontSize: "26px", color: "#ffffff" }}>
              Thank You! Reference Feedback Submitted
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "620px", color: "#94a3b8", fontSize: "15px", lineHeight: 1.6 }}>
              Your verification for <strong style={{ color: "#fff" }}>{initialData?.candidateName}</strong> ({initialData?.lastCompany}) has been securely recorded by D&apos;Genius Solutions Human Resources.
            </p>
          </div>
        )}

        {status === "ready" && initialData && (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
            {/* Context + Quick Confirmation Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              <section
                style={{
                  padding: "20px 24px",
                  background: "rgba(17, 19, 28, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#c084fc", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <Building2 size={16} /> Candidate Employment Claim
                </div>
                <div style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                  <div><span style={{ color: "#94a3b8" }}>Candidate: </span><strong>{initialData.candidateName}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Organization: </span><strong>{initialData.lastCompany}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Stated Designation: </span><strong>{initialData.lastDesignation}</strong></div>
                  <div><span style={{ color: "#94a3b8" }}>Stated Dates: </span><strong>{initialData.lastEmploymentDates || "Not provided"}</strong></div>
                </div>
              </section>

              <section
                style={{
                  padding: "20px 24px",
                  background: "rgba(17, 19, 28, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "#67e8f9", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <UserCheck size={16} /> Referee Details &amp; Quick Confirm
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#94a3b8" }}>
                  Responding as <strong style={{ color: "#fff" }}>{initialData.pocName}</strong> ({initialData.pocDesignation}). Correct designation or dates below if different:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                      Actual Designation Held
                    </label>
                    <input
                      type="text"
                      value={pocConfirmedTitle}
                      onChange={(e) => setPocConfirmedTitle(e.target.value)}
                      placeholder="Confirm or correct designation"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "#0b0d14",
                        color: "#fff",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
                      Actual Dates of Employment
                    </label>
                    <input
                      type="text"
                      value={pocConfirmedDates}
                      onChange={(e) => setPocConfirmedDates(e.target.value)}
                      placeholder="Confirm or correct dates"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "#0b0d14",
                        color: "#fff",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Progress Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              <span>
                Please answer all <strong style={{ color: "#fff" }}>{questions.length}</strong> short verification items below:
              </span>
              <span style={{ color: answeredCount === questions.length ? "#34d399" : "#c084fc", fontWeight: 700 }}>
                {answeredCount} / {questions.length} Answered
              </span>
            </div>

            {/* Questions Grid (Multi-column on 4K/ultrawide, 1-col on mobile) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                gap: "16px",
              }}
            >
              {questions.map((q, idx) => {
                const state = answers[q.id] || { yesNo: undefined, comment: "" };
                return (
                  <div
                    key={q.id}
                    data-question-id={q.id}
                    style={{
                      padding: "20px 22px",
                      background: "rgba(17, 19, 28, 0.92)",
                      border: state.yesNo
                        ? "1px solid rgba(192, 132, 252, 0.35)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Question {idx + 1} of {questions.length}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            textTransform: "uppercase",
                            background:
                              q.category === "resume_claim"
                                ? "rgba(6, 182, 212, 0.14)"
                                : "rgba(192, 132, 252, 0.14)",
                            color: q.category === "resume_claim" ? "#67e8f9" : "#d8b4fe",
                          }}
                        >
                          {q.category === "resume_claim" ? "Resume Claim" : "Common Check"}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.5, color: "#ffffff", fontWeight: 500 }}>
                        {q.questionText}
                      </p>
                    </div>

                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {(["Yes", "No"] as const).map((opt) => {
                          const selected = state.yesNo === opt;
                          const isYes = opt === "Yes";
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setChoice(q.id, opt)}
                              aria-pressed={selected}
                              style={{
                                minHeight: "46px",
                                borderRadius: "10px",
                                border: selected
                                  ? isYes
                                    ? "1.5px solid #34d399"
                                    : "1.5px solid #f87171"
                                  : "1px solid rgba(255,255,255,0.12)",
                                background: selected
                                  ? isYes
                                    ? "rgba(16, 185, 129, 0.18)"
                                    : "rgba(239, 68, 68, 0.18)"
                                  : "#0b0d14",
                                color: selected ? "#ffffff" : "#cbd5e1",
                                fontWeight: 700,
                                fontSize: "14px",
                                cursor: "pointer",
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        value={state.comment}
                        onChange={(e) => setComment(q.id, e.target.value)}
                        placeholder="Optional brief remark / clarification..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.09)",
                          background: "#0b0d14",
                          color: "#e2e8f0",
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Comments */}
            <div
              style={{
                padding: "20px 24px",
                background: "rgba(17, 19, 28, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
              }}
            >
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", marginBottom: "8px" }}>
                Any additional remarks or context for our HR team? (Optional)
              </label>
              <textarea
                rows={3}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Share any helpful strengths, working style observations, or clarifications..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#0b0d14",
                  color: "#fff",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.14)",
                  border: "1px solid rgba(248, 113, 113, 0.4)",
                  color: "#fca5a5",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  minHeight: "52px",
                  padding: "0 32px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #7928ca 0%, #0891b2 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Send size={17} />
                {submitting ? "Submitting Feedback..." : "Submit Confidential Reference Check"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
