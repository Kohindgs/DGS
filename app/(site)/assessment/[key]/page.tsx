import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveAssessmentDefinition, getPublicQuestions } from "@/lib/assessments/definitions";
import { AssessmentRunner } from "@/components/assessments/AssessmentRunner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidate Technical Assessment | D'Genius Solutions",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type Props = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function AssessmentPage({ params, searchParams }: Props) {
  const { key } = await params;
  const { token } = await searchParams;

  const definition = await resolveAssessmentDefinition(key);
  if (!definition) {
    notFound();
  }

  if (!token) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: "560px", background: "var(--dgs-bg-card, #13141a)", border: "1px solid var(--dgs-border, #2a2b36)", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.4rem", color: "#f87171", marginBottom: "12px" }}>Access Token Required</h1>
          <p style={{ color: "#a1a1aa", fontSize: "0.95rem", lineHeight: "1.5" }}>
            This technical assessment requires a valid private candidate link. Please use the personalized invitation link sent to your registered email address.
          </p>
        </div>
      </main>
    );
  }

  const publicQuestions = getPublicQuestions(definition);

  return (
    <main style={{ minHeight: "85vh", padding: "40px 20px" }}>
      <AssessmentRunner
        token={token}
        assessmentKey={key}
        title={definition.title}
        summary={definition.summary}
        durationMinutes={definition.durationMinutes}
        questions={publicQuestions}
      />
    </main>
  );
}
