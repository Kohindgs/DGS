import React from "react";
import ActionCenterClientView from "./ActionCenterClientView";
import { getActionCenterKpis, getTodayTasks } from "@/lib/off-page/action-center";

export const dynamic = "force-dynamic";

export default async function ActionCenterPage() {
  const [kpis, todayTasks] = await Promise.all([
    getActionCenterKpis(),
    getTodayTasks({ limit: 50 }),
  ]);

  return <ActionCenterClientView initialKpis={kpis} initialTodayTasks={todayTasks} />;
}
