import React from "react";
import MismatchesClientView from "./MismatchesClientView";
import { getMismatchedBacklinks, getMismatchSummary } from "@/lib/off-page/backlinks";

export const dynamic = "force-dynamic";

export default async function MismatchesPage() {
  const [data, summary] = await Promise.all([
    getMismatchedBacklinks({ status: "MISMATCH", limit: 50 }),
    getMismatchSummary(),
  ]);

  return <MismatchesClientView initialItems={data.items} initialTotal={data.total} initialSummary={summary} />;
}
