import React from "react";
import ActionCenterClientView from "./ActionCenterClientView";
import {
  getActionCenterKpis,
  getTodayTasks,
  getNeedsReviewItems,
  getResultsAndLostLinks,
} from "@/lib/off-page/action-center";

export const dynamic = "force-dynamic";

export default async function ActionCenterPage() {
  const [kpis, todayTasks, needsReviewItems, resultsAndLostLinks] = await Promise.all([
    getActionCenterKpis(),
    getTodayTasks({ limit: 50 }),
    getNeedsReviewItems({ limit: 50 }),
    getResultsAndLostLinks({ limit: 50 }),
  ]);

  return (
    <ActionCenterClientView
      initialKpis={kpis}
      initialTodayTasks={todayTasks}
      initialNeedsReviewItems={needsReviewItems}
      initialResultsAndLostLinks={resultsAndLostLinks}
    />
  );
}
