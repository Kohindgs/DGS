import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { getCronHealthSummary } from "@/lib/cms/cron-logger";
import { getCmsDatabaseHealthMetrics } from "@/lib/cms/db";

export const dynamic = "force-dynamic";

export default async function AdminCronHealthPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const [cronHealth, dbHealth] = await Promise.all([
    getCronHealthSummary(),
    getCmsDatabaseHealthMetrics(),
  ]);

  const statusColor = (status: string) => {
    if (status === "HEALTHY" || status === "SUCCESS") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (status === "DEGRADED" || status === "PARTIAL" || status === "STALE") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (status === "FAILED" || status === "CRITICAL") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              DGS V8.12.7B · Production Scheduler &amp; Database Telemetry
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              Cron &amp; Database Reliability Monitor
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time execution status, stale-job detection, and MariaDB pool diagnostics across all scheduled services.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor(cronHealth.overallStatus)}`}>
              Overall Fleet: {cronHealth.overallStatus}
            </span>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        {/* MariaDB Pool & Connection Health */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">MariaDB Shared Pool &amp; Server Health</h2>
            <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${dbHealth.ok ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30"}`}>
              {dbHealth.ok ? `CONNECTED (${dbHealth.pingMs}ms)` : "UNREACHABLE"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-xs">Pool Limit / Idle Timeout</div>
              <div className="text-white font-semibold mt-1">
                {dbHealth.poolConfig.connectionLimit} conns / {dbHealth.poolConfig.idleTimeout / 1000}s
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-xs">Threads Connected / Running</div>
              <div className="text-white font-semibold mt-1">
                {dbHealth.serverStatus?.Threads_connected ?? "—"} / {dbHealth.serverStatus?.Threads_running ?? "—"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-xs">Max Used / Max Connections</div>
              <div className="text-white font-semibold mt-1">
                {dbHealth.serverStatus?.Max_used_connections ?? "—"} / {dbHealth.serverVariables?.max_connections ?? "—"}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-xs">Server wait_timeout</div>
              <div className="text-white font-semibold mt-1">
                {dbHealth.serverVariables?.wait_timeout ?? "—"}s
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 text-xs">Server Uptime</div>
              <div className="text-white font-semibold mt-1">
                {dbHealth.serverStatus?.Uptime != null
                  ? `${(Number(dbHealth.serverStatus.Uptime) / 3600).toFixed(1)}h`
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Jobs Matrix */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Scheduled Services &amp; Stale-Job Detection</h2>
            <p className="text-xs text-slate-400 mt-1">
              Stale thresholds: Scheduled Blog Publisher (&gt; 75 mins), Google Search Update Monitor (&gt; 7 hours), Off-Page Monitor (&gt; 26 hours).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">Job Name</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Endpoint</th>
                  <th className="py-3.5 px-4">Last Success</th>
                  <th className="py-3.5 px-4">Last Failure</th>
                  <th className="py-3.5 px-4">Age / Threshold</th>
                  <th className="py-3.5 px-4">Last Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cronHealth.jobs.map((item) => (
                  <tr key={item.job.jobName} className="hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-medium text-white">
                      <div>{item.job.displayName}</div>
                      <div className="text-xs text-slate-400">{item.job.triggerSource}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <div>{item.job.scheduleHuman}</div>
                      <code className="text-xs text-slate-500">{item.job.scheduleCron}</code>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-xs text-indigo-300">{item.job.endpoint}</code>
                    </td>
                    <td className="py-4 px-4 text-slate-300 text-xs">
                      {item.lastSuccess?.completed_at || item.lastSuccess?.started_at || "Never"}
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      <div>{item.lastFailure?.started_at || "None"}</div>
                      {item.lastFailure?.error_summary && (
                        <div className="text-rose-400 truncate max-w-xs" title={item.lastFailure.error_summary}>
                          {item.lastFailure.error_summary}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      {item.minutesSinceLastSuccess != null ? `${item.minutesSinceLastSuccess}m ago` : "N/A"} /{" "}
                      <span className="text-slate-500">max {item.job.staleThresholdMinutes}m</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      {item.lastRun?.duration_ms != null ? `${item.lastRun.duration_ms}ms` : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(item.currentStatus)}`}>
                        {item.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Cron Run History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Recent Execution Log (`cron_run_history`)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Started (UTC)</th>
                  <th className="py-3 px-4">Job</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HTTP</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Checked / Processed</th>
                  <th className="py-3 px-4">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cronHealth.recentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                      No cron runs recorded in `cron_run_history` yet.
                    </td>
                  </tr>
                ) : (
                  cronHealth.recentHistory.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-800/40 text-xs">
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{run.started_at}</td>
                      <td className="py-3 px-4 font-medium text-white">{run.job_name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${statusColor(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{run.http_status ?? "—"}</td>
                      <td className="py-3 px-4 text-slate-300">{run.duration_ms}ms</td>
                      <td className="py-3 px-4 text-slate-300">
                        {run.records_checked} / {run.records_processed}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-md truncate">
                        {run.error_summary ? (
                          <span className="text-rose-400">{run.error_summary}</span>
                        ) : (
                          "OK"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
