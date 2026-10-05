import React from "react";
import ActionCenterClientView from "./ActionCenterClientView";
import {
  getActionCenterKpis,
  getTodayTasks,
  getNeedsReviewItems,
  getNeedsVerificationItems,
  getResultsAndLostLinks,
} from "@/lib/off-page/action-center";

export const dynamic = "force-dynamic";

export default async function ActionCenterPage() {
  const [kpis, todayTasks, needsReviewItems, needsVerificationItems, resultsAndLostLinks] = await Promise.all([
    getActionCenterKpis(),
    getTodayTasks({ limit: 50 }),
    getNeedsReviewItems({ limit: 50 }),
    getNeedsVerificationItems({ limit: 50 }),
    getResultsAndLostLinks({ limit: 50 }),
  ]);

  return (
    <ActionCenterClientView
      initialKpis={kpis}
      initialTodayTasks={todayTasks}
      initialNeedsReviewItems={needsReviewItems}
      initialNeedsVerificationItems={needsVerificationItems}
      initialResultsAndLostLinks={resultsAndLostLinks}
    />
  );
}
