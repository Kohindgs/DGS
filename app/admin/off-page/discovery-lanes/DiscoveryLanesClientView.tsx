"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Play, RefreshCw, Save, ShieldCheck, AlertTriangle, Radar } from "lucide-react";

type LaneQuery = { query: string; region: string };
type Lane = {
  id: string;
  label: string;
  category: string;
  validator: string;
  providers: string[];
  description: string;
  queries: LaneQuery[];
  ready: boolean;
  readiness: string;
  last_run: null | {
    run_id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    message: string | null;
    qualified: number | null;
    discovered: number | null;
    rejected: number | null;
    results: number | null;
  };
};

type Overview = {
  ok: boolean;
  lanes: Lane[];
  brave: { health: { status: string; reason?: string }; usage: { used: number; quota: number; date: string } };
  webSearch?: { health: { status: string; reason?: string }; usage: { used: number; quota: number; date: string } };
  competitors: string[];
  running: Array<{ lane: string; runId: string; startedAt: string }>;
  recentRuns: any[];
  error?: string;
};

const card: React.CSSProperties = {
  padding: "16px 18px",
  background: "rgba(17, 24, 39, 0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "var(--dgs-radius-lg)",
};

function queriesToText(qs: LaneQuery[]): string {
  return qs.map((q) => `${q.region} | ${q.query}`).join("\n");
}
function textToQueries(t: string): LaneQuery[] {
  return t
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(INDIA|UAE|USA|GLOBAL)\s*\|\s*(.+)$/i);
      return m ? { region: m[1].toUpperCase(), query: m[2].trim() } : { region: "GLOBAL", query: l };
    });
}

export default function DiscoveryLanesClientView() {
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [competitorText, setCompetitorText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/off-page/lanes", { cache: "no-store" });
    const json = (await res.json()) as Overview;
    setData(json);
    if (json?.competitors) setCompetitorText((prev) => prev || json.competitors.join(", "));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data?.running?.length) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [data?.running?.length, load]);

  const post = async (payload: any, label: string) => {
    setBusy(label);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/off-page/lanes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setNotice(json.message || json.error || (json.ok ? "Done" : "Failed"));
      await load();
    } catch (e: any) {
      setNotice(e?.message || "Request failed");
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <div style={card}>Loading discovery lanes…</div>;
  if (!data.ok) return <div style={card}>Error: {data.error}</div>;

  const braveOk = data.brave.health.status === "ACTIVE" || data.brave.health.status === "DEGRADED";
  const runningSet = new Set(data.running.map((r) => r.lane));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 8 }}>
            <Radar size={18} /> Live Opportunity Acquisition Lanes
          </h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem" }}>
            Every candidate is a real URL from a live provider, fetched and validated. Only QUALIFIED records reach the manager
            Needs Review queue. Link type is UNKNOWN until observed on a live page.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span
            className="dgs-saas-chip success"
            style={{ fontSize: "0.74rem", fontWeight: 700 }}
            data-testid="web-search-status"
          >
            WEB SEARCH (NATIVE) — ACTIVE · {data.webSearch?.usage?.used ?? 0}/{data.webSearch?.usage?.quota ?? 100} today
          </span>
          <span
            className={`dgs-saas-chip ${braveOk ? "success" : "warning"}`}
            style={{ fontSize: "0.74rem", fontWeight: 700 }}
            data-testid="brave-status"
          >
            {braveOk
              ? `WEB SEARCH (BRAVE) — ACTIVE · ${data.brave.usage.used}/${data.brave.usage.quota} today`
              : "WEB SEARCH (BRAVE) — NOT CONFIGURED"}
          </span>
          <button className="dgs-saas-btn secondary" disabled={!!busy} onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="dgs-saas-btn primary"
            disabled={!!busy || data.running.length > 0}
            onClick={() => post({ action: "run_all" }, "run_all")}
          >
            <Play size={14} /> Run all ready lanes
          </button>
          <button
            className="dgs-saas-btn secondary"
            disabled={!!busy || runningSet.has("__REVERIFY__")}
            onClick={() => {
              if (confirm("Live re-verify all unassigned pipeline records now? Records that fail are moved out of Needs Review with the reason logged.")) {
                post({ action: "reverify_existing" }, "reverify");
              }
            }}
          >
            <ShieldCheck size={14} /> Re-verify existing records
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ ...card, color: "#e5e7eb", fontSize: "0.85rem" }} data-testid="lanes-notice">
          {notice}
        </div>
      )}
      {data.running.length > 0 && (
        <div style={{ ...card, color: "var(--dgs-brand-cyan)", fontSize: "0.85rem" }}>
          Running: {data.running.map((r) => (r.lane === "__REVERIFY__" ? "Re-verification" : r.lane)).join(", ")} — auto-refreshing…
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {data.lanes.map((lane) => {
          const running = runningSet.has(lane.id);
          const text = editing[lane.id] ?? queriesToText(lane.queries);
          return (
            <div key={lane.id} style={card} data-testid={`lane-${lane.id}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{lane.label}</strong>
                <span className={`dgs-saas-chip ${lane.ready ? "success" : "warning"}`} style={{ fontSize: "0.68rem" }}>
                  {lane.ready ? "READY" : "NOT CONFIGURED"}
                </span>
              </div>
              <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>{lane.description}</p>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
                Providers: {lane.providers.join(", ")} · Validator: {lane.validator} · {lane.readiness}
              </div>
              <div style={{ marginTop: 8, fontSize: "0.76rem", color: "#d1d5db" }}>
                {lane.last_run ? (
                  <>
                    Last run {lane.last_run.status} · {String(lane.last_run.started_at).replace("T", " ").slice(0, 16)}
                    <br />
                    {lane.last_run.message || "—"}
                  </>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>Never run</span>
                )}
              </div>
              <textarea
                value={text}
                onChange={(e) => setEditing((p) => ({ ...p, [lane.id]: e.target.value }))}
                rows={Math.min(Math.max(lane.queries.length, 2), 7)}
                style={{
                  width: "100%",
                  marginTop: 8,
                  fontSize: "0.74rem",
                  background: "rgba(0,0,0,0.3)",
                  color: "#e5e7eb",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: 8,
                  fontFamily: "monospace",
                }}
                placeholder="REGION | query (one per line)"
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="dgs-saas-btn primary"
                  disabled={!!busy || running || !lane.ready}
                  onClick={() => post({ action: "run", lane: lane.id }, lane.id)}
                >
                  <Play size={13} /> {running ? "Running…" : "Run lane"}
                </button>
                <button
                  className="dgs-saas-btn secondary"
                  disabled={!!busy || editing[lane.id] === undefined}
                  onClick={() => post({ action: "save_queries", lane: lane.id, queries: textToQueries(text) }, `save_${lane.id}`)}
                >
                  <Save size={13} /> Save queries
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={card}>
        <strong style={{ color: "#fff" }}>Competitor domains (link-gap lane)</strong>
        <p style={{ margin: "4px 0 8px", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
          Comma-separated. Only explicitly configured competitors are used — nothing is assumed.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={competitorText}
            onChange={(e) => setCompetitorText(e.target.value)}
            placeholder="competitor1.com, competitor2.ae"
            style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#e5e7eb", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8 }}
          />
          <button className="dgs-saas-btn secondary" disabled={!!busy} onClick={() => post({ action: "save_competitors", domains: competitorText }, "competitors")}>
            <Save size={13} /> Save
          </button>
        </div>
      </div>

      <div style={card}>
        <strong style={{ color: "#fff" }}>Recent lane runs (measured)</strong>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", fontSize: "0.76rem", color: "#d1d5db", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "rgba(255,255,255,0.5)" }}>
                <th>Started</th>
                <th>Lane</th>
                <th>Status</th>
                <th>Queries</th>
                <th>Results</th>
                <th>Qualified</th>
                <th>Inserted</th>
                <th>Rejected</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {data.recentRuns.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 8, color: "rgba(255,255,255,0.45)" }}>
                    No lane runs yet.
                  </td>
                </tr>
              )}
              {data.recentRuns.map((r) => (
                <tr key={r.run_id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "6px 4px" }}>{String(r.started_at).slice(0, 16)}</td>
                  <td>{String(r.provider).replace("LANE:", "")}</td>
                  <td>{r.status}</td>
                  <td>{r.queries_run}</td>
                  <td>{r.results_returned}</td>
                  <td>{r.valid_candidates}</td>
                  <td>{r.inserted_count}</td>
                  <td>{r.spam_rejected}</td>
                  <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.errors || ""}>
                    {r.errors ? (
                      <span style={{ color: "#fbbf24" }}>
                        <AlertTriangle size={11} /> {r.errors}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
