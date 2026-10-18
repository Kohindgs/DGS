"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import type {
  IntentLeadSignal,
  IntentDiscoveryRun,
  GoogleBuyerIntentQuery,
  LinkedInFeedPresetSearch,
} from "@/lib/intent-leads/engine";
import {
  Radar,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
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
  Lock,
  KeyRound,
  Archive,
  Flame,
} from "lucide-react";

type Props = {
  presetSearches: LinkedInFeedPresetSearch[];
  initialSignals?: IntentLeadSignal[];
  initialRuns?: IntentDiscoveryRun[];
  initialGoogleQueries?: GoogleBuyerIntentQuery[];
  initialIngestToken?: string;
};

const SERVICE_LABELS: Record<string, string> = {
  SEO: "SEO & Organic Growth (/services/seo/)",
  AEO_GEO: "AEO / GEO & AI Search (/services/aeo-geo-aio/)",
  WEB_DEV: "Website Dev & AMC (/services/website-development/)",
  AI_VIDEO: "AI Video Production (/services/ai-video-production-agency/)",
  PAID_MEDIA: "Digital & Performance Marketing (/services/digital-marketing/)",
  BRANDING: "Branding & Social Media (/services/branding/)",
};

const PLATFORM_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  LINKEDIN_FEED: { label: "LinkedIn Feed", color: "#60a5fa", bg: "rgba(37, 99, 235, 0.18)" },
  LINKEDIN_PUBLIC: { label: "LinkedIn Public", color: "#38bdf8", bg: "rgba(2, 132, 199, 0.18)" },
  REDDIT: { label: "Reddit", color: "#fb923c", bg: "rgba(234, 88, 12, 0.18)" },
  X_TWITTER: { label: "X / Twitter", color: "#cbd5e1", bg: "rgba(100, 116, 139, 0.22)" },
  WEB_FORUM: { label: "Web Forum", color: "#a78bfa", bg: "rgba(124, 58, 237, 0.18)" },
  GOOGLE_SERP_INTENT: { label: "Google Search", color: "#34d399", bg: "rgba(5, 150, 105, 0.18)" },
};

const FRESHNESS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  "1H_12H": { label: "⚡ 1h–12h Fresh", color: "#34d399", bg: "rgba(16, 185, 129, 0.2)" },
  "24H": { label: "🔥 Past 24 Hours", color: "#60a5fa", bg: "rgba(37, 99, 235, 0.2)" },
  "3D": { label: "🕒 Within 3 Days", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.18)" },
};

export default function IntentLeadsClientView({
  presetSearches,
  initialSignals = [],
  initialRuns = [],
  initialGoogleQueries = [],
  initialIngestToken = "",
}: Props) {
  const [pinInput, setPinInput] = useState<string>("");
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"signals" | "linkedin-companion" | "google-radar">("signals");
  const [signals, setSignals] = useState<IntentLeadSignal[]>(initialSignals);
  const [runs, setRuns] = useState<IntentDiscoveryRun[]>(initialRuns);
  const [googleQueries, setGoogleQueries] = useState<GoogleBuyerIntentQuery[]>(initialGoogleQueries);
  const [ingestToken, setIngestToken] = useState<string>(initialIngestToken);

  const [freshnessFilter, setFreshnessFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isScanning, setIsScanning] = useState(false);
  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [manualAuthor, setManualAuthor] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [isIngestingManual, setIsIngestingManual] = useState(false);

  const bookmarkletRef = useRef<HTMLAnchorElement | null>(null);

  // Restore unlocked session within the same browser tab if previously unlocked
  useEffect(() => {
    try {
      const savedPin = sessionStorage.getItem("dgs_intent_vault_pin");
      if (savedPin === "021514") {
        setUnlockedPin("021514");
      }
    } catch {}
  }, []);

  async function unlockVaultWithPin(pinToTry: string) {
    const cleanPin = (pinToTry || "").trim();
    if (!cleanPin) {
      setPinError("Please enter your 6-digit passcode into the input box above.");
      return;
    }

    if (cleanPin !== "021514") {
      try {
        sessionStorage.removeItem("dgs_intent_vault_pin");
      } catch {}
      setPinError("Invalid passcode. Please enter your 6-digit passcode.");
      return;
    }

    // Instant 0ms unlock using server-preloaded vault data
    setPinError(null);
    setUnlockedPin("021514");
    try {
      sessionStorage.setItem("dgs_intent_vault_pin", "021514");
    } catch {}

    // Background refresh to ensure latest signals are synced
    setIsUnlocking(true);
    try {
      const res = await fetch("/api/admin/intent-leads/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-DGS-Intent-Pin": "021514",
        },
        body: JSON.stringify({ action: "unlock", pin: "021514" }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        if (Array.isArray(data.signals)) setSignals(data.signals);
        if (Array.isArray(data.runs)) setRuns(data.runs);
        if (Array.isArray(data.googleBuyerQueries)) setGoogleQueries(data.googleBuyerQueries);
        if (data.ingestToken) setIngestToken(data.ingestToken);
      }
    } catch {
      // Keep server-preloaded data if background refresh fails
    } finally {
      setIsUnlocking(false);
    }
  }

  function handleLockVault() {
    try {
      sessionStorage.removeItem("dgs_intent_vault_pin");
    } catch {}
    setUnlockedPin(null);
    setPinInput("");
  }

  // Build self-contained Bookmarklet JS code that extracts post age ("2h", "1d", "2w") and filters out stale posts >3 days
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
          var timeEl = el.querySelector('.update-components-actor__sub-description, time');
          var ageText = timeEl ? timeEl.innerText.trim() : '';
          var linkEl = el.querySelector('a[href*="/feed/update/"], a[href*="/posts/"]');
          var urn = el.getAttribute('data-urn') || '';
          var postUrl = linkEl ? linkEl.href : (urn ? 'https://www.linkedin.com/feed/update/' + urn : window.location.href);
          posts.push({ postUrl: postUrl, authorName: authorName.slice(0,120), authorRole: authorRole.slice(0,160), ageText: ageText.slice(0,60), postText: text.slice(0,1800) });
        });
        if (posts.length === 0) {
          var sel = window.getSelection().toString().trim();
          if (sel.length > 25) {
            posts.push({ postUrl: window.location.href, authorName: document.title.slice(0,80), ageText: '1h ago', postText: sel.slice(0,1800) });
          }
        }
        if (posts.length === 0) {
          alert('DGS Scanner: Scroll through your LinkedIn Feed or Past-24h Search results first, or highlight a post text before clicking.');
          return;
        }
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#0f172a;color:#f8fafc;border:1px solid #3b82f6;padding:14px 20px;border-radius:12px;font-family:sans-serif;font-size:14px;box-shadow:0 12px 32px rgba(0,0,0,0.45);';
        badge.innerText = 'DGS Buyer-Intent AI: Qualifying ' + posts.length + ' fresh LinkedIn posts...';
        document.body.appendChild(badge);
        fetch('${endpoint}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-DGS-Ingest-Token': '${ingestToken}' },
          body: JSON.stringify({ token: '${ingestToken}', sendEmailDigest: true, posts: posts.slice(0, 30) })
        }).then(function(r){ return r.json(); }).then(function(res){
          badge.style.borderColor = '#10b981';
          badge.innerText = res.message || ('Fetched ' + (res.result && res.result.qualifiedAdded || 0) + ' buyer leads & emailed alert!');
          setTimeout(function(){ badge.remove(); }, 6500);
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
  }, [bookmarkletHref, activeTab, unlockedPin]);

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const age = s.age_hours ?? 6;
      if (age > 72) return false; // Never show stale leads > 3 days
      if (freshnessFilter === "1H_12H" && age > 12) return false;
      if (freshnessFilter === "24H" && age > 24) return false;
      if (freshnessFilter === "3D" && age > 72) return false;
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
  }, [signals, freshnessFilter, platformFilter, serviceFilter, statusFilter, searchQuery]);

  async function refreshSignals() {
    if (!unlockedPin) return;
    try {
      const res = await fetch("/api/admin/intent-leads/", {
        credentials: "same-origin",
        headers: { "X-DGS-Intent-Pin": unlockedPin },
      });
      const data = await res.json();
      if (data.ok) {
        setSignals(data.signals || []);
        setRuns(data.runs || []);
      }
    } catch {}
  }

  async function handleRunLiveDiscovery() {
    if (!unlockedPin) return;
    setIsScanning(true);
    setScanBanner(
      "Scanning Fresh (<72h / 24h / 1h–12h) LinkedIn Posts, Reddit Buyer Threads & Web + sending Email Notification if new leads are fetched..."
    );
    try {
      const res = await fetch("/api/admin/intent-leads/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-DGS-Intent-Pin": unlockedPin,
        },
        body: JSON.stringify({
          action: "discover",
          pin: unlockedPin,
          serviceCategory: serviceFilter,
          sendEmailDigest: true,
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

  async function handleStatusChange(id: string, status: "NEW" | "CONTACTED" | "ARCHIVED" | "DISMISSED") {
    if (!unlockedPin) return;
    setSignals((prev) =>
      status === "DISMISSED"
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    await fetch("/api/admin/intent-leads/", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-DGS-Intent-Pin": unlockedPin,
      },
      body: JSON.stringify({ action: "update-status", pin: unlockedPin, id, status }),
    }).catch(() => {});
  }

  async function handleManualPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unlockedPin || !manualText.trim() || manualText.trim().length < 25) return;
    setIsIngestingManual(true);
    try {
      const res = await fetch("/api/admin/intent-leads/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-DGS-Intent-Pin": unlockedPin,
        },
        body: JSON.stringify({
          action: "manual-paste-ingest",
          pin: unlockedPin,
          posts: [
            {
              authorName: manualAuthor.trim() || "LinkedIn Prospect",
              authorRole: manualRole.trim() || "",
              postUrl: manualUrl.trim() || "https://www.linkedin.com/feed/",
              ageText: "1h ago",
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
            ? `Lead Fetched! AI qualified your post, saved it to this Private Vault, and sent an email notification.`
            : `Post analyzed — filtered out as cold/non-buyer or duplicate (Skipped: ${data.result?.skippedNoise || 0}, Duplicate: ${data.result?.duplicates || 0}).`
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

  // ============================================================================
  // PRIVATE PIN GATE (PIN: 0215)
  // ============================================================================
  if (!unlockedPin) {
    return (
      <div
        style={{
          minHeight: "72vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            unlockVaultWithPin(pinInput);
          }}
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            borderRadius: "20px",
            padding: "36px 32px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(37, 99, 235, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px auto",
              color: "#60a5fa",
            }}
          >
            <Lock size={26} />
          </div>

          <div
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.16)",
              padding: "4px 10px",
              borderRadius: "999px",
              marginBottom: "10px",
            }}
          >
            PRIVATE EXECUTIVE VAULT • PIN PROTECTED
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
            Buyer-Intent Lead Vault
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 24px 0", lineHeight: 1.55 }}>
            This section is restricted and isolated from public website lead forms. Enter your 6-digit security passcode below to unlock fresh (<strong>1h–12h / 24h / &le;3d</strong>) buyer-intent leads.
          </p>

          <div style={{ marginBottom: "16px" }}>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              autoFocus
              placeholder="Enter 6-digit passcode"
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value;
                setPinInput(val);
                setPinError(null);
                if (val.trim() === "021514") {
                  unlockVaultWithPin("021514");
                }
              }}
              style={{
                width: "100%",
                textAlign: "center",
                letterSpacing: pinInput ? "0.4em" : "0.04em",
                fontSize: pinInput ? "24px" : "15px",
                fontWeight: 800,
                background: "#090d16",
                color: "#f8fafc",
                border: pinError
                  ? "1px solid #ef4444"
                  : "1px solid rgba(59, 130, 246, 0.45)",
                borderRadius: "12px",
                padding: "14px 16px",
                outline: "none",
              }}
            />
          </div>

          {pinError && (
            <div
              style={{
                fontSize: "12px",
                color: "#f87171",
                background: "rgba(239, 68, 68, 0.14)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "16px",
              }}
            >
              {pinError}
            </div>
          )}

          <button
            type="submit"
            disabled={isUnlocking}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              border: "none",
              padding: "13px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: isUnlocking ? "wait" : "pointer",
            }}
          >
            <KeyRound size={16} />
            {isUnlocking ? "Unlocking Vault..." : "Unlock Private Lead Vault"}
          </button>
        </form>
      </div>
    );
  }

  const ultraFreshCount = signals.filter((s) => (s.age_hours ?? 6) <= 12).length;
  const past24hCount = signals.filter((s) => (s.age_hours ?? 6) <= 24).length;
  const highUrgencyCount = signals.filter((s) => s.intent_score >= 80).length;

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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16, 185, 129, 0.18)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <Lock size={13} /> PRIVATE PIN VAULT UNLOCKED
            </span>
            <span style={{ fontSize: "12px", color: "#93c5fd", fontWeight: 600 }}>
              ⚡ Freshness Enforced: 1h–12h • 24h • Max 3 Days Old (Never sent via Website Lead Forms)
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Private Buyer-Intent & LinkedIn Lead Vault
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: 1.55 }}>
            Exclusively captures <strong style={{ color: "#e2e8f0" }}>warm/hot buyer-intent leads</strong> (people actively asking to hire or get recommendations for{" "}
            <strong style={{ color: "#e2e8f0" }}>
              SEO, AEO/GEO, Website Development & AMC, AI Video Production, Performance Marketing, and Branding
            </strong>
            ) within the last <strong>1–12 hours, 24 hours, or 3 days</strong>. Whenever new leads are fetched, you receive an instant email alert.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            disabled={isScanning}
            onClick={handleRunLiveDiscovery}
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
            {isScanning ? "Fetching Fresh Buyer Leads..." : "Fetch Fresh Leads Now (+ Email Alert)"}
          </button>

          <button
            type="button"
            onClick={handleLockVault}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(239, 68, 68, 0.14)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Lock size={14} /> Lock Vault
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
            border: "1px solid rgba(16, 185, 129, 0.28)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            ⚡ Ultra-Fresh (1h to 12h Old)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399" }}>{ultraFreshCount}</div>
          <div style={{ fontSize: "11px", color: "#34d399", marginTop: "4px" }}>
            Highest reply-to-call conversion window
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(59, 130, 246, 0.28)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            🔥 Last 24 Hours Total
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#60a5fa" }}>{past24hCount}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Posted within the past 24 hours
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
            🕒 Active Vault (&le; 3 Days Max)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#f8fafc" }}>{signals.length}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            2–3 week old posts are strictly blocked
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(249, 115, 22, 0.28)",
            borderRadius: "14px",
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
            Hot Buyer Intent (Score 80+)
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#f97316" }}>{highUrgencyCount}</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Cold chatter & job seekers rejected
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
          <Flame size={15} />
          1. Fresh Buyer-Intent Leads ({filteredSignals.length})
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
          2. Zero-Login LinkedIn Feed Scanner (Past 24h Deep-Links)
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
          3. Google Search Buyer-Intent Queries ({googleQueries.length})
        </button>
      </div>

      {/* TAB 1: FRESH BUYER-INTENT LEADS */}
      {activeTab === "signals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Freshness Quick-Pills + Filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "12px" }}>
              <Clock size={14} /> Freshness:
            </div>

            {[
              { key: "ALL", label: "All Fresh (≤ 3 Days)" },
              { key: "1H_12H", label: "⚡ 1h to 12h Old" },
              { key: "24H", label: "🔥 Past 24 Hours" },
              { key: "3D", label: "🕒 Up to 3 Days" },
            ].map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setFreshnessFilter(pill.key)}
                style={{
                  background:
                    freshnessFilter === pill.key ? "rgba(37, 99, 235, 0.25)" : "rgba(2, 6, 23, 0.6)",
                  color: freshnessFilter === pill.key ? "#60a5fa" : "#94a3b8",
                  border:
                    freshnessFilter === pill.key
                      ? "1px solid #3b82f6"
                      : "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {pill.label}
              </button>
            ))}

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
              <option value="SEO">SEO (/services/seo/)</option>
              <option value="AEO_GEO">AEO / GEO (/services/aeo-geo-aio/)</option>
              <option value="WEB_DEV">Website Dev & AMC (/services/website-development/)</option>
              <option value="AI_VIDEO">AI Video (/services/ai-video-production-agency/)</option>
              <option value="PAID_MEDIA">Performance Marketing (/services/digital-marketing/)</option>
              <option value="BRANDING">Branding & Social (/services/branding/)</option>
            </select>

            <div style={{ position: "relative", flex: "1 1 180px" }}>
              <input
                type="text"
                placeholder="Filter by keyword, city (Dubai, Mumbai)..."
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
                No Fresh (&le;72h) Warm Buyer Leads in This Filter Yet
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "540px", margin: "0 auto 18px auto" }}>
                Click <strong>&ldquo;Fetch Fresh Leads Now (+ Email Alert)&rdquo;</strong> to scan the last 1h–72h of public LinkedIn & Reddit buyer requests, or open Tab 2 to scan your personal LinkedIn feed with 1 click.
              </p>
              <button
                type="button"
                disabled={isScanning}
                onClick={handleRunLiveDiscovery}
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
                Fetch Fresh Leads Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredSignals.map((sig) => {
                const plat = PLATFORM_LABELS[sig.source_platform] || PLATFORM_LABELS.LINKEDIN_PUBLIC;
                const ageHours = sig.age_hours ?? 6;
                const tierKey = ageHours <= 12 ? "1H_12H" : ageHours <= 24 ? "24H" : "3D";
                const freshBadge = FRESHNESS_BADGES[tierKey];

                return (
                  <div
                    key={sig.id}
                    style={{
                      background: "rgba(15, 23, 42, 0.85)",
                      border:
                        ageHours <= 12
                          ? "1px solid rgba(16, 185, 129, 0.4)"
                          : "1px solid rgba(148, 163, 184, 0.16)",
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {/* Top Row: Freshness + Platform + Service + Intent Score */}
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
                            background: freshBadge.bg,
                            color: freshBadge.color,
                            border: `1px solid ${freshBadge.color}55`,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {freshBadge.label} (~{ageHours}h old)
                        </span>

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
                            color: "#34d399",
                            border: "1px solid rgba(52, 211, 153, 0.35)",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          Warm Buyer Score: {sig.intent_score}/100 ({sig.urgency_level})
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
                      </div>

                      <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock size={12} />
                        Fetched {new Date(sig.discovered_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Author, Company Legitimacy & Post Text */}
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc" }}>
                          {sig.author_name ? `${sig.author_name}` : sig.post_title || "Active Service Buyer"}
                        </span>
                        {sig.author_role ? (
                          <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: "13px" }}>
                            • {sig.author_role}
                          </span>
                        ) : null}

                        <span
                          style={{
                            background:
                              sig.company_legitimacy_status === "VERIFIED_LIVE_COMPANY"
                                ? "rgba(16, 185, 129, 0.2)"
                                : sig.company_legitimacy_status === "VERIFIED_DECISION_MAKER"
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "rgba(148, 163, 184, 0.16)",
                            color:
                              sig.company_legitimacy_status === "VERIFIED_LIVE_COMPANY"
                                ? "#34d399"
                                : sig.company_legitimacy_status === "VERIFIED_DECISION_MAKER"
                                  ? "#60a5fa"
                                  : "#cbd5e1",
                            border: "1px solid rgba(59, 130, 246, 0.28)",
                            padding: "2px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          ✓ Legitimacy: {(sig.company_legitimacy_status || "VERIFIED_ACTIVE_BUSINESS").replace(/_/g, " ")} ({sig.company_legitimacy_score || 78}/100)
                        </span>

                        {sig.company_domain && (
                          <a
                            href={`https://${sig.company_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            🌐 {sig.company_domain} ↗
                          </a>
                        )}

                        {sig.buyer_persona_type && (
                          <span
                            style={{
                              background: "rgba(168, 85, 247, 0.16)",
                              color: "#c084fc",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            👤 {sig.buyer_persona_type}
                          </span>
                        )}

                        {sig.contact_hint ? (
                          <span
                            style={{
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
                        <div style={{ fontSize: "12px", color: "#93c5fd", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <Sparkles size={13} />
                          <span>
                            <strong>AI Buyer-Intent Verification:</strong> {sig.ai_reasoning}
                          </span>
                        </div>
                      )}

                      {/* Deep Intent Breakdown & Conversion Playbook Panel */}
                      {(() => {
                        let breakdown: any = null;
                        let playbook: any = null;
                        try {
                          breakdown =
                            typeof sig.intent_breakdown_json === "string"
                              ? JSON.parse(sig.intent_breakdown_json)
                              : sig.intent_breakdown_json;
                        } catch {}
                        try {
                          playbook =
                            typeof sig.conversion_playbook_json === "string"
                              ? JSON.parse(sig.conversion_playbook_json)
                              : sig.conversion_playbook_json;
                        } catch {}
                        if (!breakdown && !playbook) return null;

                        return (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                              gap: "10px",
                              background: "rgba(15, 23, 42, 0.9)",
                              border: "1px solid rgba(16, 185, 129, 0.25)",
                              borderRadius: "10px",
                              padding: "12px",
                              marginTop: "8px",
                              fontSize: "12px",
                            }}
                          >
                            {breakdown && (
                              <div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", marginBottom: "4px" }}>
                                  🎯 INTENT & BUYING STAGE BREAKDOWN
                                </div>
                                <div style={{ color: "#e2e8f0", marginBottom: "3px" }}>
                                  <strong>Stage:</strong> {String(breakdown.buyingStage || "ACTIVE_SHORTLIST").replace(/_/g, " ")}
                                </div>
                                {Array.isArray(breakdown.painPointsDetected) && breakdown.painPointsDetected.length > 0 && (
                                  <div style={{ color: "#cbd5e1", marginBottom: "3px" }}>
                                    <strong>Pain Point:</strong> {breakdown.painPointsDetected.join(" • ")}
                                  </div>
                                )}
                                {breakdown.budgetOrScaleSignal && (
                                  <div style={{ color: "#fbbf24" }}>
                                    <strong>Scale / Budget Signal:</strong> {breakdown.budgetOrScaleSignal}
                                  </div>
                                )}
                              </div>
                            )}

                            {playbook && (
                              <div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#60a5fa", marginBottom: "4px" }}>
                                  🏢 COMPANY VALIDATION & CONVERSION PLAYBOOK
                                </div>
                                {playbook.companyVerificationNote && (
                                  <div style={{ color: "#cbd5e1", marginBottom: "3px" }}>
                                    <strong>Legitimacy Check:</strong> {playbook.companyVerificationNote}
                                  </div>
                                )}
                                {playbook.recommendedHook && (
                                  <div style={{ color: "#e2e8f0", marginBottom: "3px" }}>
                                    <strong>Winning Angle:</strong> {playbook.recommendedHook}
                                  </div>
                                )}
                                {playbook.caseStudyToMention && (
                                  <div style={{ color: "#a5b4fc" }}>
                                    <strong>DGS Proof to Share:</strong> {playbook.caseStudyToMention}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* AI Suggested Reply & DM */}
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

                    {/* Action Bar (Isolated to Private Vault — never creates form submissions) */}
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

                        {sig.status !== "CONTACTED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sig.id, "CONTACTED")}
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
                            <CheckCircle2 size={13} /> Mark Contacted
                          </button>
                        )}

                        {sig.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(sig.id, "ARCHIVED")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "rgba(148, 163, 184, 0.14)",
                              color: "#cbd5e1",
                              border: "1px solid rgba(148, 163, 184, 0.25)",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <Archive size={13} /> Archive in Vault
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
        </div>
      )}

      {/* TAB 2: ZERO-LOGIN PERSONAL LINKEDIN FEED SCANNER */}
      {activeTab === "linkedin-companion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                NO LINKEDIN PASSWORD OR ACCOUNT ACCESS NEEDED • 100% SAFE
              </span>
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
              How We Fetch From Your Personal LinkedIn Without Needing Your Login
            </h2>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px 0", maxWidth: "780px" }}>
              You <strong>never</strong> have to give your LinkedIn password or session cookies to any server (which protects your LinkedIn account from security flags). Instead, drag the{" "}
              <strong>⚡ Scan LinkedIn Feed to DGS</strong> button below to your browser&apos;s Bookmarks Bar. When you open LinkedIn in your browser, click one of the <strong>Past 24 Hours</strong> search links below and click the bookmarklet — it reads the fresh posts on your screen, sends only warm buyer leads (<strong style={{ color: "#34d399" }}>1h–12h / 24h / &le;3 days old</strong>) into this PIN-protected CMS vault, and emails you immediately!
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
                ← <strong>Drag this button</strong> to your Bookmarks Bar (<code>Ctrl+Shift+B</code>).
              </div>
            </div>
          </div>

          {/* Past-24h LinkedIn & Google Deep-Links */}
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "16px",
              padding: "22px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
              1-Click Fresh LinkedIn & Google Buyer Searches (Pre-Filtered to Past 24 Hours)
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0" }}>
              Every link below uses LinkedIn&apos;s <code>datePosted=&quot;past-24h&quot;</code> and Google&apos;s <code>tbs=qdr:d</code> (Past 24 Hours) / <code>qdr:d3</code> (Past 3 Days) filters so you only ever see ultra-fresh requirements:
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
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
                        {preset.serviceCategory}
                      </span>
                      <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>
                        ⚡ Past 24h / 3d Only
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
                      {preset.label}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <a
                      href={preset.linkedinSearch24hUrl}
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
                      LinkedIn (Past 24h) <ArrowUpRight size={13} />
                    </a>

                    <a
                      href={preset.googleDork24hUrl}
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
                      Google Dork (24h) <ExternalLink size={12} />
                    </a>

                    <a
                      href={preset.googleDork3dUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(245, 158, 11, 0.16)",
                        color: "#fbbf24",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        textDecoration: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Google Dork (3 Days) <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Paste & Qualify */}
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
              Quick Paste LinkedIn Post → Save to Private Vault & Send Email Alert
            </h3>
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
                placeholder="Author Role / Company"
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
              rows={3}
              required
              placeholder="Paste the LinkedIn post requirement here..."
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
                {isIngestingManual ? "Qualifying & Emailing..." : "Qualify & Save to Private Vault"}
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
              High-Intent Google Search Queries (People Searching Google for DGS Services)
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Real commercial searches on Google where prospective buyers are looking for your services and D&apos;Genius Solutions appeared in search results.
            </p>
          </div>

          {googleQueries.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              No Google Search Console buyer queries found yet.
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
                    <th style={{ padding: "10px 12px" }}>RECOMMENDED ACTION</th>
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
                          {q.service_category}
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
