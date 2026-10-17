"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import type {
  IntentLeadSignal,
  IntentDiscoveryRun,
  GoogleBuyerIntentQuery,
  LinkedInFeedPresetSearch,
  IntentServiceCategory,
} from "@/lib/intent-leads/engine";
import {
  Radar,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  UserPlus,
  Sparkles,
  Search,
  Bookmark,
  MessageSquare,
  Send,
  Trash2,
  Globe,
  ShieldCheck,
  Filter,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

type Props = {
  initialSignals: IntentLeadSignal[];
  initialRuns: IntentDiscoveryRun[];
  initialGoogleBuyerQueries: GoogleBuyerIntentQuery[];
  ingestToken: string;
  presetSearches: LinkedInFeedPresetSearch[];
};

const SERVICE_LABELS: Record<string, string> = {
  SEO: "SEO & Organic Growth",
  AEO_GEO: "AEO / GEO & AI Search",
  WEB_DEV: "Website Dev & AMC",
  AI_VIDEO: "AI Video Production",
  PAID_MEDIA: "Performance Marketing",
  BRANDING: "Branding & Social Media",
};

const PLATFORM_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  LINKEDIN_FEED: { label: "LinkedIn Feed", color: "#60a5fa", bg: "rgba(37, 99, 235, 0.18)" },
  LINKEDIN_PUBLIC: { label: "LinkedIn Public", color: "#38bdf8", bg: "rgba(2, 132, 199, 0.18)" },
  REDDIT: { label: "Reddit", color: "#fb923c", bg: "rgba(234, 88, 12, 0.18)" },
  X_TWITTER: { label: "X / Twitter", color: "#cbd5e1", bg: "rgba(100, 116, 139, 0.22)" },
  WEB_FORUM: { label: "Web Forum", color: "#a78bfa", bg: "rgba(124, 58, 237, 0.18)" },
  GOOGLE_SERP_INTENT: { label: "Google Search", color: "#34d399", bg: "rgba(5, 150, 105, 0.18)" },
};

export default function IntentLeadsClientView({
  initialSignals,
  initialRuns,
  initialGoogleBuyerQueries,
  ingestToken,
  presetSearches,
}: Props) {
  const [activeTab, setActiveTab] = useState<"signals" | "linkedin-companion" | "google-radar">("signals");
  const [signals, setSignals] = useState<IntentLeadSignal[]>(initialSignals);
  const [runs, setRuns] = useState<IntentDiscoveryRun[]>(initialRuns);
  const [googleQueries] = useState<GoogleBuyerIntentQuery[]>(initialGoogleBuyerQueries);

  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isScanning, setIsScanning] = useState(false);
  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // Manual LinkedIn post paste modal/card state
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [isIngestingManual, setIsIngestingManual] = useState(false);

  const bookmarkletRef = useRef<HTMLAnchorElement | null>(null);

  // Build self-contained Bookmarklet JS code that scans currently visible LinkedIn feed/search posts
  const bookmarkletHref = useMemo(() => {
    const endpoint = "https://www.dgeniussolutions.com/api/admin/intent-leads/ingest";
    const code = `(function(){
      try {
        var posts = [];
        var containers = document.querySelectorAll('.feed-shared-update-v2, .occludable-update, [data-urn*="urn:li:activity:"], article');
        containers.forEach(function(el){
          var textEl = el.querySelector('.update-components-text, .feed-shared-update-v2__description, .break-words');
          var text = (textEl ? textEl.innerText : el.innerText || '').trim();
          if (!text || text.length < 35) return;
          var authorEl = el.querySelector('.update-components-actor__name, .update-components-actor__title, a[href*="/in/"]');
          var authorName = authorEl ? authorEl.innerText.split('\\n')[0].trim() : 'LinkedIn Member';
          var roleEl = el.querySelector('.update-components-actor__description, .update-components-actor__sub-description');
          var authorRole = roleEl ? roleEl.innerText.split('\\n')[0].trim() : '';
          var linkEl = el.querySelector('a[href*="/feed/update/"], a[href*="/posts/"]');
          var urn = el.getAttribute('data-urn') || '';
          var postUrl = linkEl ? linkEl.href : (urn ? 'https://www.linkedin.com/feed/update/' + urn : window.location.href);
          posts.push({ postUrl: postUrl, authorName: authorName.slice(0,120), authorRole: authorRole.slice(0,160), postText: text.slice(0,1800) });
        });
        if (posts.length === 0) {
          var sel = window.getSelection().toString().trim();
          if (sel.length > 25) {
            posts.push({ postUrl: window.location.href, authorName: document.title.slice(0,80), postText: sel.slice(0,1800) });
          }
        }
        if (posts.length === 0) {
          alert('DGS Scanner: Scroll through your LinkedIn Feed or Search results first, or highlight a post text before clicking.');
          return;
        }
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#0f172a;color:#f8fafc;border:1px solid #3b82f6;padding:14px 20px;border-radius:12px;font-family:sans-serif;font-size:14px;box-shadow:0 12px 32px rgba(0,0,0,0.45);';
        badge.innerText = 'DGS Buyer-Intent AI: Qualifying ' + posts.length + ' LinkedIn posts...';
        document.body.appendChild(badge);
        fetch('${endpoint}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-DGS-Ingest-Token': '${ingestToken}' },
          body: JSON.stringify({ token: '${ingestToken}', posts: posts.slice(0, 30) })
        }).then(function(r){ return r.json(); }).then(function(res){
          badge.style.borderColor = '#10b981';
          badge.innerText = res.message || ('Qualified ' + (res.result && res.result.qualifiedAdded || 0) + ' buyer leads!');
          setTimeout(function(){ badge.remove(); }, 6000);
        }).catch(function(err){
          badge.style.borderColor = '#ef4444';
          badge.innerText = 'DGS Sync Error: ' + err.message;
          setTimeout(function(){ badge.remove(); }, 6000);
        });
      } catch(e) { alert('DGS Scanner error: ' + e.message); }
    })();`;
    return `javascript:${encodeURIComponent(code.replace(/\s+/g, " ").trim())}`;
  }, [ingestToken]);

  useEffect(() => {
    if (bookmarkletRef.current) {
      bookmarkletRef.current.setAttribute("href", bookmarkletHref);
    }
  }, [bookmarkletHref, activeTab]);

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      if (platformFilter !== "ALL" && s.source_platform !== platformFilter) return false;
      if (serviceFilter !== "ALL" && s.service_category !== serviceFilter) return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${s.author_name || ""} ${s.author_role || ""} ${s.post_title || ""} ${s.post_text || ""} ${s.service_category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [signals, platformFilter, serviceFilter, statusFilter, searchQuery]);

  async function refreshSignals() {
    try {
      const res = await fetch("/api/admin/intent-leads");
      const data = await res.json();
      if (data.ok) {
        setSignals(data.signals || []);
        setRuns(data.runs || []);
      }
    } catch {}
  }

  async function handleRunLiveDiscovery(sendEmail = false) {
    setIsScanning(true);
    setScanBanner("Scanning Public LinkedIn Posts, Reddit Buyer Threads & Web Forums + running Gemini 2.5 Qualification...");
    try {
      const res = await fetch("/api/admin/intent-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "discover",
          serviceCategory: serviceFilter,
          sendEmailDigest: sendEmail,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setScanBanner(data.result.summaryText || "Discovery run completed.");
      } else {
        setScanBanner(data.message || "Discovery run completed.");
      }
      await refreshSignals();
    } catch (err: any) {
      setScanBanner(`Discovery scan failed: ${err?.message || "Network error"}`);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleStatusChange(id: string, status: "NEW" | "CONTACTED" | "CONVERTED_TO_LEAD" | "DISMISSED") {
    setSignals((prev) =>
      status === "DISMISSED"
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    await fetch("/api/admin/intent-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", id, status }),
    }).catch(() => {});
  }

  async function handleConvertToCrm(id: string) {
    setConvertingId(id);
    try {
      const res = await fetch("/api/admin/intent-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert-to-crm", id }),
      });
      const data = await res.json();
      if (data.ok) {
        setSignals((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "CONVERTED_TO_LEAD", crm_lead_id: data.crmLeadId }
              : item
          )
        );
        setScanBanner("Lead converted and added to main DGS Leads CRM (/admin/leads/)!");
      }
    } finally {
      setConvertingId(null);
    }
  }

  async function handleManualPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualText.trim() || manualText.trim().length < 25) return;
    setIsIngestingManual(true);
    try {
      const res = await fetch("/api/admin/intent-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual-paste-ingest",
          posts: [
            {
              authorName: manualAuthor.trim() || "LinkedIn Prospect",
              authorRole: manualRole.trim() || "",
              postUrl: manualUrl.trim() || "https://www.linkedin.com/feed/",
              postText: manualText.trim(),
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const added = data.result?.qualifiedAdded || 0;
        setScanBanner(
          added > 0
            ? `AI qualified and added your LinkedIn post to Buyer-Intent Leads!`
            : `Post analyzed — classified as non-buyer/already saved (Skipped: ${data.result?.skippedNoise || 0}, Duplicate: ${data.result?.duplicates || 0}).`
        );
        setManualAuthor("");
        setManualRole("");
        setManualUrl("");
        setManualText("");
        await refreshSignals();
        setActiveTab("signals");
      }
    } finally {
      setIsIngestingManual(false);
    }
  }

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  }

  const highUrgencyCount = signals.filter((s) => s.urgency_level === "HIGH").length;
  const linkedinCount = signals.filter((s) => s.source_platform.startsWith("LINKEDIN")).length;
  const convertedCount = signals.filter((s) => s.status === "CONVERTED_TO_LEAD").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85))",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "740px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(37, 99, 235, 0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              <Radar size={14} /> DGS V8.13 • AI BUYER-INTENT RADAR
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              LinkedIn Feed • LinkedIn Public • Reddit • X • Google Search
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Buyer-Intent & LinkedIn Lead Discovery
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: 1.55 }}>
            Finds founders, CMOs, and businesses actively asking for{" "}
            <strong style={{ color: "#e2e8f0" }}>
              SEO, Website Development & AMC, AI Video Production, AEO/GEO, and Performance Marketing
            </strong>{" "}
            across LinkedIn, Reddit, and Google — with Gemini 2.5 filtering out job seekers and competing agency promos.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            disabled={isScanning}
            onClick={() => handleRunLiveDiscovery(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: isScanning ? "wait" : "pointer",
              opacity: isScanning ? 0.75 : 1,
            }}
          >
            <RefreshCw size={15} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? "Scanning Live Web & LinkedIn..." : "Scan Web & LinkedIn Now"}
          </button>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => handleRunLiveDiscovery(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.16)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              padding: "10px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isScanning ? "wait" : "pointer",
            }}
          >
            <Send size={14} />
            Scan + Email Digest
          </button>
        </div>
      </div>

      {/* Live Status Banner */}
      {scanBanner && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            background: "rgba(37, 99, 235, 0.14)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#e2e8f0",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={16} color="#60a5fa" />
            <span>{scanBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanBanner(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            Qualified Buyer Signals
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#f8fafc" }}>{signals.length}</div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px" }}>
            Job seekers & agency promos filtered out
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            High-Urgency Leads (Score 80+)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#f97316" }}>{highUrgencyCount}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Actively requesting agency recommendations
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            LinkedIn Posts Captured
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#60a5fa" }}>{linkedinCount}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Personal Feed + Public LinkedIn Posts
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            Google Search Buyer Queries
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399" }}>
            {googleQueries.length}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            {convertedCount} converted to DGS CRM Leads
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
          paddingBottom: "12px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("signals")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            background: activeTab === "signals" ? "#2563eb" : "rgba(15, 23, 42, 0.7)",
            color: activeTab === "signals" ? "#ffffff" : "#94a3b8",
            border:
              activeTab === "signals"
                ? "1px solid #3b82f6"
                : "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <Sparkles size={15} />
          1. Qualified Social & Web Buyer Leads ({signals.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("linkedin-companion")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            background: activeTab === "linkedin-companion" ? "#2563eb" : "rgba(15, 23, 42, 0.7)",
            color: activeTab === "linkedin-companion" ? "#ffffff" : "#94a3b8",
            border:
              activeTab === "linkedin-companion"
                ? "1px solid #3b82f6"
                : "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <Bookmark size={15} />
          2. Personal LinkedIn Feed Scanner & Deep-Links
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("google-radar")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            background: activeTab === "google-radar" ? "#2563eb" : "rgba(15, 23, 42, 0.7)",
            color: activeTab === "google-radar" ? "#ffffff" : "#94a3b8",
            border:
              activeTab === "google-radar"
                ? "1px solid #3b82f6"
                : "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <Globe size={15} />
          3. Google Search Buyer-Intent Radar ({googleQueries.length})
        </button>
      </div>

      {/* TAB 1: QUALIFIED SOCIAL & WEB BUYER LEADS */}
      {activeTab === "signals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Filters Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "12px" }}>
              <Filter size={14} /> Filters:
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "12px",
              }}
            >
              <option value="ALL">All Platforms</option>
              <option value="LINKEDIN_FEED">Personal LinkedIn Feed</option>
              <option value="LINKEDIN_PUBLIC">Public LinkedIn Posts</option>
              <option value="REDDIT">Reddit Buyer Threads</option>
              <option value="X_TWITTER">X / Twitter</option>
              <option value="WEB_FORUM">Startup & Web Forums</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "12px",
              }}
            >
              <option value="ALL">All DGS Services</option>
              <option value="SEO">SEO & Organic Growth</option>
              <option value="AEO_GEO">AEO / GEO & AI Search (Dubai/Global)</option>
              <option value="WEB_DEV">Website Development & AMC</option>
              <option value="AI_VIDEO">AI Video Production</option>
              <option value="PAID_MEDIA">Performance Marketing / Ads</option>
              <option value="BRANDING">Branding & Social Media</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "12px",
              }}
            >
              <option value="ALL">All Active Statuses</option>
              <option value="NEW">New (Uncontacted)</option>
              <option value="CONTACTED">Contacted / Replied</option>
              <option value="CONVERTED_TO_LEAD">Converted to CRM Lead</option>
            </select>

            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <input
                type="text"
                placeholder="Search by author, keyword, city (e.g. Dubai, Mumbai, redesign)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>

          {/* Signals List */}
          {filteredSignals.length === 0 ? (
            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px dashed rgba(148, 163, 184, 0.25)",
                borderRadius: "16px",
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <Radar size={36} color="#60a5fa" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
                No Buyer-Intent Leads Match Your Current Filter
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "520px", margin: "0 auto 18px auto" }}>
                Click <strong>&ldquo;Scan Web & LinkedIn Now&rdquo;</strong> above to fetch fresh public LinkedIn & Reddit buyer threads, or open Tab 2 to scan your personal LinkedIn feed with 1 click.
              </p>
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleRunLiveDiscovery(false)}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Run First Live Discovery Scan
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredSignals.map((sig) => {
                const plat = PLATFORM_LABELS[sig.source_platform] || PLATFORM_LABELS.LINKEDIN_PUBLIC;
                const scoreColor =
                  sig.intent_score >= 82
                    ? "#34d399"
                    : sig.intent_score >= 68
                      ? "#60a5fa"
                      : "#fbbf24";

                return (
                  <div
                    key={sig.id}
                    style={{
                      background: "rgba(15, 23, 42, 0.82)",
                      border:
                        sig.status === "CONVERTED_TO_LEAD"
                          ? "1px solid rgba(16, 185, 129, 0.4)"
                          : "1px solid rgba(148, 163, 184, 0.16)",
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {/* Top Row: Badges + Score + Actions */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            background: plat.bg,
                            color: plat.color,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {plat.label}
                        </span>

                        <span
                          style={{
                            background: "rgba(99, 102, 241, 0.16)",
                            color: "#a5b4fc",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {SERVICE_LABELS[sig.service_category] || sig.service_category}
                        </span>

                        <span
                          style={{
                            background: "rgba(148, 163, 184, 0.14)",
                            color: "#cbd5e1",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {sig.target_region}
                        </span>

                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.14)",
                            color: scoreColor,
                            border: `1px solid ${scoreColor}44`,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          Intent Score: {sig.intent_score}/100 ({sig.urgency_level})
                        </span>

                        {sig.status === "CONTACTED" && (
                          <span
                            style={{
                              background: "rgba(59, 130, 246, 0.2)",
                              color: "#93c5fd",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Contacted
                          </span>
                        )}

                        {sig.status === "CONVERTED_TO_LEAD" && (
                          <Link
                            href="/admin/leads/"
                            style={{
                              background: "rgba(16, 185, 129, 0.22)",
                              color: "#34d399",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            ✓ In DGS Leads CRM →
                          </Link>
                        )}
                      </div>

                      <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={12} />
                        {new Date(sig.discovered_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Author & Post Content */}
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                        {sig.author_name ? `${sig.author_name}` : sig.post_title || "Prospective Service Buyer"}
                        {sig.author_role ? (
                          <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: "13px" }}>
                            {" "}
                            • {sig.author_role}
                          </span>
                        ) : null}
                        {sig.contact_hint ? (
                          <span
                            style={{
                              marginLeft: "10px",
                              background: "rgba(245, 158, 11, 0.18)",
                              color: "#fbbf24",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {sig.contact_hint}
                          </span>
                        ) : null}
                      </div>

                      <p
                        style={{
                          fontSize: "13px",
                          color: "#cbd5e1",
                          lineHeight: 1.6,
                          margin: "0 0 10px 0",
                          background: "rgba(2, 6, 23, 0.55)",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148, 163, 184, 0.1)",
                        }}
                      >
                        {sig.post_text}
                      </p>

                      {sig.ai_reasoning && (
                        <div style={{ fontSize: "12px", color: "#93c5fd", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Sparkles size={13} />
                          <span>
                            <strong>AI Qualification:</strong> {sig.ai_reasoning}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* AI Suggested Comment & DM Box */}
                    {(sig.suggested_reply || sig.suggested_dm) && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "12px",
                          background: "rgba(30, 41, 59, 0.45)",
                          borderRadius: "10px",
                          padding: "12px",
                          border: "1px solid rgba(59, 130, 246, 0.18)",
                        }}
                      >
                        {sig.suggested_reply && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "6px",
                              }}
                            >
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>
                                SUGGESTED PUBLIC COMMENT REPLY
                              </span>
                              <button
                                type="button"
                                onClick={() => copyText(`reply-${sig.id}`, sig.suggested_reply!)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(59, 130, 246, 0.18)",
                                  color: "#60a5fa",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "3px 8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                {copiedKey === `reply-${sig.id}` ? <Check size={12} /> : <Copy size={12} />}
                                {copiedKey === `reply-${sig.id}` ? "Copied!" : "Copy Reply"}
                              </button>
                            </div>
                            <div style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.5 }}>
                              {sig.suggested_reply}
                            </div>
                          </div>
                        )}

                        {sig.suggested_dm && (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "6px",
                              }}
                            >
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>
                                SUGGESTED LINKEDIN / DIRECT MESSAGE
                              </span>
                              <button
                                type="button"
                                onClick={() => copyText(`dm-${sig.id}`, sig.suggested_dm!)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(16, 185, 129, 0.18)",
                                  color: "#34d399",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "3px 8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                {copiedKey === `dm-${sig.id}` ? <Check size={12} /> : <Copy size={12} />}
                                {copiedKey === `dm-${sig.id}` ? "Copied!" : "Copy DM"}
                              </button>
                            </div>
                            <div style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.5 }}>
                              {sig.suggested_dm}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        paddingTop: "4px",
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <a
                          href={sig.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#2563eb",
                            color: "#ffffff",
                            textDecoration: "none",
                            padding: "7px 14px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Open Post & Reply <ExternalLink size={13} />
                        </a>

                        {sig.status !== "CONTACTED" && sig.status !== "CONVERTED_TO_LEAD" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sig.id, "CONTACTED")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(59, 130, 246, 0.15)",
                              color: "#93c5fd",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <CheckCircle2 size={13} /> Mark Contacted
                          </button>
                        )}

                        {sig.status !== "CONVERTED_TO_LEAD" && (
                          <button
                            type="button"
                            disabled={convertingId === sig.id}
                            onClick={() => handleConvertToCrm(sig.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(16, 185, 129, 0.16)",
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.35)",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <UserPlus size={13} />
                            {convertingId === sig.id ? "Saving..." : "Convert to CRM Lead"}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(sig.id, "DISMISSED")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "transparent",
                          color: "#64748b",
                          border: "none",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={13} /> Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Discovery Run History */}
          {runs.length > 0 && (
            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                borderRadius: "14px",
                padding: "18px",
                marginTop: "8px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", margin: "0 0 12px 0" }}>
                Recent Automated & Manual Discovery Runs
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {runs.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      padding: "8px 12px",
                      background: "rgba(2, 6, 23, 0.45)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          color: r.status === "SUCCESS" ? "#34d399" : "#f87171",
                          fontWeight: 700,
                        }}
                      >
                        ● {r.status}
                      </span>
                      <span style={{ color: "#94a3b8" }}>[{r.run_type}]</span>
                      <span style={{ color: "#e2e8f0" }}>{r.summary_text || "Discovery check"}</span>
                    </div>
                    <div style={{ color: "#64748b" }}>
                      {new Date(r.started_at).toLocaleString()} ({r.duration_ms}ms)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSONAL LINKEDIN FEED SCANNER & DEEP-LINKS */}
      {activeTab === "linkedin-companion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Step 1: 1-Click Bookmarklet */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.9))",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <ShieldCheck size={18} color="#34d399" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#34d399", letterSpacing: "0.04em" }}>
                100% ACCOUNT-SAFE PERSONAL LINKEDIN FEED SCANNER (ZERO COOKIE SHARING)
              </span>
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
              Scan Your Personal LinkedIn Feed & Search Results in 1 Click
            </h2>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px 0", maxWidth: "780px" }}>
              Because LinkedIn restricts datacenter bots from reading your personal feed, this browser companion runs{" "}
              <strong>locally inside your own logged-in browser tab</strong>. Drag the blue button below to your Chrome/Edge Bookmarks Bar. Whenever you are scrolling your LinkedIn Feed or LinkedIn Post Search results, click it — it will automatically extract visible posts, send them to DGS Gemini 2.5 AI, filter out job seekers, and save genuine buyer leads here!
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
              <a
                ref={bookmarkletRef}
                href="#dgs-linkedin-scanner"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Drag this button to your browser Bookmarks Bar! Then click it while you have LinkedIn.com open."
                  );
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  padding: "12px 22px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
                  border: "1px solid #60a5fa",
                  cursor: "grab",
                }}
              >
                <Bookmark size={16} />⚡ Scan LinkedIn Feed to DGS
              </a>

              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                ← <strong>Drag this button</strong> up to your browser&apos;s Bookmarks Bar (Press{" "}
                <code>Ctrl+Shift+B</code> if your Bookmarks Bar is hidden).
              </div>
            </div>
          </div>

          {/* Step 2: 1-Click LinkedIn Buyer Search Deep-Links */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "16px",
              padding: "22px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
              High-Intent LinkedIn Content Search Deep-Links (Sorted by Latest Posts)
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
              Click any service below to open LinkedIn&apos;s live Content Feed filtered for people asking for recommendations right now, then click your <strong>⚡ Scan LinkedIn Feed to DGS</strong> bookmarklet to import & AI-qualify them:
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "14px",
              }}
            >
              {presetSearches.map((preset) => (
                <div
                  key={preset.id}
                  style={{
                    background: "rgba(2, 6, 23, 0.55)",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#60a5fa",
                          background: "rgba(37, 99, 235, 0.16)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {SERVICE_LABELS[preset.serviceCategory] || preset.serviceCategory}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{preset.region}</span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                      {preset.label}
                    </div>
                    <code
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#94a3b8",
                        background: "rgba(15, 23, 42, 0.9)",
                        padding: "8px",
                        borderRadius: "6px",
                        wordBreak: "break-word",
                      }}
                    >
                      {preset.booleanQuery}
                    </code>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <a
                      href={preset.linkedinSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "#2563eb",
                        color: "#ffffff",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Open in LinkedIn Feed <ArrowUpRight size={13} />
                    </a>

                    <a
                      href={preset.googleDorkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(16, 185, 129, 0.16)",
                        color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Google LinkedIn Dork <ExternalLink size={12} />
                    </a>

                    <a
                      href={preset.redditSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(234, 88, 12, 0.16)",
                        color: "#fb923c",
                        border: "1px solid rgba(234, 88, 12, 0.3)",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Reddit Latest <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Quick Paste & Qualify Box */}
          <form
            onSubmit={handleManualPasteSubmit}
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "16px",
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              Quick Paste LinkedIn Post → AI Qualify & Generate Personalized Reply
            </h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Spotted a post on mobile or WhatsApp? Paste the post text below to qualify it with Gemini 2.5 and generate a custom reply & DM.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              <input
                type="text"
                placeholder="Author Name (e.g. Rahul Sharma)"
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                }}
              />
              <input
                type="text"
                placeholder="Author Role / Company (e.g. Founder at FinTech Co)"
                value={manualRole}
                onChange={(e) => setManualRole(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                }}
              />
              <input
                type="url"
                placeholder="Post URL (optional)"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                }}
              />
            </div>

            <textarea
              rows={4}
              required
              placeholder="Paste the LinkedIn post text here (e.g. 'Looking for a reliable SEO & web development agency in Mumbai/Dubai to help us scale organic traffic...')"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            />

            <div>
              <button
                type="submit"
                disabled={isIngestingManual}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <MessageSquare size={15} />
                {isIngestingManual ? "Analyzing with Gemini 2.5..." : "Qualify Post & Generate Reply"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GOOGLE SEARCH BUYER-INTENT RADAR */}
      {activeTab === "google-radar" && (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: "16px",
            padding: "22px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
              Live Google Search Commercial Buyer Queries (Last 28 Days via GSC)
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Real searches on Google where prospective buyers are looking for agencies/services and D&apos;Genius Solutions appeared in search results — ranked by commercial intent and impressions.
            </p>
          </div>

          {googleQueries.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              No Google Search Console query rows found yet. Run a GSC sync from Search Console Insights to populate buyer queries.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "11px",
                    }}
                  >
                    <th style={{ padding: "10px 12px" }}>GOOGLE BUYER QUERY</th>
                    <th style={{ padding: "10px 12px" }}>SERVICE</th>
                    <th style={{ padding: "10px 12px" }}>INTENT TIER</th>
                    <th style={{ padding: "10px 12px" }}>IMPR.</th>
                    <th style={{ padding: "10px 12px" }}>CLICKS</th>
                    <th style={{ padding: "10px 12px" }}>AVG POS</th>
                    <th style={{ padding: "10px 12px" }}>ACTIONABLE LEAD CAPTURE RECOMMENDATION</th>
                  </tr>
                </thead>
                <tbody>
                  {googleQueries.slice(0, 60).map((q, idx) => (
                    <tr
                      key={`${q.query_text}-${idx}`}
                      style={{
                        borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                      }}
                    >
                      <td style={{ padding: "12px", fontWeight: 700, color: "#f8fafc" }}>
                        {q.query_text}
                        <div style={{ fontSize: "11px", fontWeight: 400, color: "#64748b", marginTop: "2px" }}>
                          {q.page_url}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#a5b4fc",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {SERVICE_LABELS[q.service_category] || q.service_category}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            background:
                              q.buyer_intent_tier === "HIGH_COMMERCIAL"
                                ? "rgba(16, 185, 129, 0.16)"
                                : "rgba(59, 130, 246, 0.16)",
                            color: q.buyer_intent_tier === "HIGH_COMMERCIAL" ? "#34d399" : "#60a5fa",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {q.buyer_intent_tier === "HIGH_COMMERCIAL" ? "HIGH BUYER INTENT" : "SOLUTION AWARE"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#e2e8f0", fontWeight: 600 }}>{q.impressions}</td>
                      <td style={{ padding: "12px", color: "#34d399", fontWeight: 700 }}>{q.clicks}</td>
                      <td style={{ padding: "12px", color: q.position <= 10 ? "#34d399" : "#fbbf24", fontWeight: 700 }}>
                        #{q.position}
                      </td>
                      <td style={{ padding: "12px", color: "#cbd5e1", fontSize: "12px", maxWidth: "360px" }}>
                        {q.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
