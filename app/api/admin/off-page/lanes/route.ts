import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { guardOffPage } from "@/lib/off-page/route-auth";
import { cmsQuery } from "@/lib/cms/db";
import { LANES, getLane } from "@/lib/off-page/lanes/config";
import {
  COMPETITOR_DOMAINS_SETTINGS_KEY,
  LANE_QUERY_SETTINGS_KEY,
  getCompetitorDomains,
  getLaneOverview,
  getLaneQueryConfig,
  runDiscoveryLane,
  setSetting,
} from "@/lib/off-page/lanes/runner";
import { BraveSearchDiscoveryProvider, getBraveUsageToday } from "@/lib/off-page/providers/brave";

export const dynamic = "force-dynamic";

declare global {
  // eslint-disable-next-line no-var
  var __dgsLaneJobs: Map<string, { runId: string; startedAt: string }> | undefined;
}
const jobs = (global.__dgsLaneJobs ||= new Map());

export async function GET() {
  const denied = await guardOffPage("view");
  if (denied) return denied;
  try {
    const [lanes, braveHealth, usage, competitors] = await Promise.all([
      getLaneOverview(),
      new BraveSearchDiscoveryProvider().health(),
      getBraveUsageToday(),
      getCompetitorDomains(),
    ]);
    const { rows: recentRuns } = await cmsQuery<any>(
      `SELECT run_id, provider, started_at, completed_at, status, queries_run, results_returned,
              valid_candidates, inserted_count, spam_rejected, duplicates_rejected, errors
         FROM off_page_discovery_runs WHERE provider LIKE 'LANE:%' ORDER BY started_at DESC LIMIT 30`
    );
    return NextResponse.json({
      ok: true,
      lanes,
      brave: { health: braveHealth, usage },
      competitors,
      running: Array.from(jobs.entries()).map(([lane, j]) => ({ lane, ...j })),
      recentRuns,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "run");

  if (action === "reverify_existing") {
    const denied = await guardOffPage("manage");
    if (denied) return denied;
    if (jobs.has("__REVERIFY__")) {
      return NextResponse.json({ ok: false, error: "Re-verification already running" }, { status: 409 });
    }
    jobs.set("__REVERIFY__", { runId: "pending", startedAt: new Date().toISOString() });
    void (async () => {
      try {
        const { reverifyExistingOpportunities } = await import("@/lib/off-page/lanes/reverify");
        await reverifyExistingOpportunities();
      } catch (e) {
        console.error("[lanes] reverify failed", e);
      } finally {
        jobs.delete("__REVERIFY__");
      }
    })();
    return NextResponse.json({ ok: true, message: "Live re-verification started. Results are logged under provider REVERIFY:EXISTING." }, { status: 202 });
  }

  if (action === "save_queries" || action === "save_competitors") {
    const denied = await guardOffPage("manage");
    if (denied) return denied;
    try {
      if (action === "save_queries") {
        const laneId = String(body.lane || "");
        if (!getLane(laneId)) return NextResponse.json({ ok: false, error: "Unknown lane" }, { status: 400 });
        const queries = Array.isArray(body.queries) ? body.queries : [];
        const current = await getLaneQueryConfig();
        current[laneId] = queries
          .filter((x: any) => x && typeof x.query === "string" && x.query.trim())
          .slice(0, 25)
          .map((x: any) => ({ query: String(x.query).trim().slice(0, 200), region: ["INDIA", "UAE", "USA", "GLOBAL"].includes(x.region) ? x.region : "GLOBAL" }));
        await setSetting(LANE_QUERY_SETTINGS_KEY, JSON.stringify(current), "Admin-configured discovery queries per lane (V8.12.6)");
        return NextResponse.json({ ok: true, lane: laneId, queries: current[laneId] });
      }
      const domains = String(body.domains || "")
        .split(/[\s,]+/)
        .map((d: string) => d.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 25)
        .join(",");
      await setSetting(COMPETITOR_DOMAINS_SETTINGS_KEY, domains, "Competitor domains for link-gap lane (admin configured)");
      return NextResponse.json({ ok: true, competitors: await getCompetitorDomains() });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
    }
  }

  const denied = await guardOffPage("create");
  if (denied) return denied;

  const laneIds: string[] =
    action === "run_all" ? LANES.map((l) => l.id) : [String(body.lane || "")].filter((id) => !!getLane(id));
  if (laneIds.length === 0) return NextResponse.json({ ok: false, error: "Unknown lane" }, { status: 400 });

  const busy = laneIds.filter((id) => jobs.has(id));
  if (busy.length === laneIds.length) {
    return NextResponse.json({ ok: false, error: `Already running: ${busy.join(", ")}` }, { status: 409 });
  }

  const opts = {
    maxQueries: Number(body.maxQueries) || undefined,
    perQuery: Number(body.perQuery) || undefined,
    maxValidate: Number(body.maxValidate) || undefined,
  };

  const started: Array<{ lane: string; run_id: string }> = [];
  for (const id of laneIds) {
    if (jobs.has(id)) continue;
    const runId = `lane_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    jobs.set(id, { runId, startedAt: new Date().toISOString() });
    started.push({ lane: id, run_id: runId });
  }

  // Background execution (sequential, to respect provider quotas). Results are persisted to
  // off_page_discovery_runs and visible via GET.
  void (async () => {
    for (const s of started) {
      try {
        await runDiscoveryLane(s.lane, { ...opts, runId: s.run_id });
      } catch (e) {
        console.error(`[lanes] ${s.lane} failed`, e);
      } finally {
        jobs.delete(s.lane);
      }
    }
  })();

  return NextResponse.json({ ok: true, started, message: `Started ${started.length} lane run(s). Poll GET for results.` }, { status: 202 });
}
