import type { Metadata } from "next";
import { getReferenceCheckByToken } from "@/lib/reference-checks/db";
import type { PublicReferenceCheckView } from "@/lib/reference-checks/types";
import RefCheckPublicClient from "./RefCheckPublicClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confidential Reference Check | D'Genius Solutions HR",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function PublicRefCheckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await getReferenceCheckByToken(token).catch(() => null);

  let initialData: PublicReferenceCheckView | null = null;
  if (record) {
    const expired =
      Boolean(record.token_expires_at) &&
      new Date(record.token_expires_at as string).getTime() < Date.now() &&
      record.status === "pending";

    initialData = {
      id: record.id,
      candidateName: record.candidate_name,
      candidatePosition: record.candidate_position,
      lastCompany: record.last_company,
      lastDesignation: record.last_designation,
      lastEmploymentDates: record.last_employment_dates,
      pocName: record.poc_name,
      pocDesignation: record.poc_designation,
      status: record.status,
      questions: (record.questions || []).filter((q) => q.enabled !== false).slice(0, 10),
      submittedAt: record.submitted_at,
      expired,
    };
  }

  return <RefCheckPublicClient initialData={initialData} token={token} />;
}
