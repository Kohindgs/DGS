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
  initialUnlockedPin?: string | null;
  initialPinError?: string | null;
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
  LINKEDIN_FEED: { label: "My LinkedIn Feed", color: "#60a5fa", bg: "rgba(37, 99, 235, 0.18)" },
  LINKEDIN_PUBLIC: { label: "LinkedIn", color: "#38bdf8", bg: "rgba(2, 132, 199, 0.18)" },
  REDDIT: { label: "Reddit Buyer Forum", color: "#fb923c", bg: "rgba(234, 88, 12, 0.18)" },
  X_TWITTER: { label: "X / Twitter", color: "#cbd5e1", bg: "rgba(100, 116, 139, 0.22)" },
  WEB_FORUM: { label: "Web Forum", color: "#a78bfa", bg: "rgba(124, 58, 237, 0.18)" },
  GOOGLE_SERP_INTENT: { label: "Google Search", color: "#34d399", bg: "rgba(5, 150, 105, 0.18)" },
};

const REGION_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  INDIA: { label: "🇮🇳 India", color: "#fb923c", bg: "rgba(249, 115, 22, 0.18)" },
  USA: { label: "🇺🇸 USA", color: "#60a5fa", bg: "rgba(59, 130, 246, 0.18)" },
  UAE_DUBAI: { label: "🇦🇪 UAE / Dubai", color: "#34d399", bg: "rgba(16, 185, 129, 0.18)" },
  UK: { label: "🇬🇧 UK", color: "#c084fc", bg: "rgba(168, 85, 247, 0.18)" },
  GLOBAL: { label: "🌍 Global", color: "#cbd5e1", bg: "rgba(148, 163, 184, 0.16)" },
};

const FRESHNESS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  "1H_12H": { label: "⚡ 1h–12h Fresh", color: "#34d399", bg: "rgba(16, 185, 129, 0.2)" },
  "24H": { label: "🔥 Past 24 Hours", color: "#60a5fa", bg: "rgba(37, 99, 235, 0.2)" },
  "3D": { label: "🕒 Within 3 Days", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.18)" },
};

export type VaultChannelTab =
  | "ALL"
  | "LINKEDIN_INDIA"
  | "LINKEDIN_USA"
  | "LINKEDIN_UAE"
  | "MY_LINKEDIN_FEED"
  | "REDDIT_FORUMS"
  | "GOOGLE_SEARCH";

export default function IntentLeadsClientView({
  presetSearches,
  initialSignals = [],
  initialRuns = [],
  initialGoogleQueries = [],
  initialIngestToken = "",
  initialUnlockedPin = null,
  initialPinError = null,
}: Props) {
  const [pinInput, setPinInput] = useState<string>("");
  const [unlockedPin, setUnlockedPin] = useState<string | null>(initialUnlockedPin);
  const [pinError, setPinError] = useState<string | null>(initialPinError);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  const [activeChannelTab, setActiveChannelTab] = useState<VaultChannelTab>("ALL");
  const [signals, setSignals] = useState<IntentLeadSignal[]>(initialSignals);
  const [runs, setRuns] = useState<IntentDiscoveryRun[]>(initialRuns);
  const [googleQueries, setGoogleQueries] = useState<GoogleBuyerIntentQuery[]>(initialGoogleQueries);
  const [ingestToken, setIngestToken] = useState<string>(initialIngestToken);

  const [freshnessFilter, setFreshnessFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scanBanner, setScanBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [linkedinConnected, setLinkedinConnected] = useState<boolean>(false);
  const [linkedinMaskedCookie, setLinkedinMaskedCookie] = useState<string | null>(null);
  const [showLinkedinConnect, setShowLinkedinConnect] = useState<boolean>(false);
  const [liAtInput, setLiAtInput] = useState<string>("");
  const [isSavingLinkedin, setIsSavingLinkedin] = useState<boolean>(false);

  const [manualAuthor, setManualAuthor] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualRegion, setManualRegion] = useState<"INDIA" | "USA" | "UAE_DUBAI" | "GLOBAL">("INDIA");
  const [isIngestingManual, setIsIngestingManual] = useState(false);

  const bookmarkletRef = useRef<HTMLAnchorElement | null>(null);

  // Restore unlocked session within the same browser tab or via URL parameter
  useEffect(() => {
    try {
      const urlPin = new URLSearchParams(window.location.search).get("pin")?.trim();
      if (urlPin === "021514") {
        setUnlockedPin("021514");
        sessionStorage.setItem("dgs_intent_vault_pin", "021514");
        window.history.replaceState({}, "", "/admin/intent-leads/");
        return;
      }
      const savedPin = sessionStorage.getItem("dgs_intent_vault_pin");
      if (savedPin === "021514") {
        setUnlockedPin("021514");
      }
    } catch {}
  }, []);

  // Sync manualRegion default when switching LinkedIn regional tabs
  useEffect(() => {
    if (activeChannelTab === "LINKEDIN_INDIA") setManualRegion("INDIA");
    else if (activeChannelTab === "LINKEDIN_USA") setManualRegion("USA");
    else if (activeChannelTab === "LINKEDIN_UAE") setManualRegion("UAE_DUBAI");
  }, [activeChannelTab]);

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
      const res = await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
        method: "POST",
        cache: "no-store",
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
        if (data.linkedinSession) {
          setLinkedinConnected(Boolean(data.linkedinSession.connected));
          setLinkedinMaskedCookie(data.linkedinSession.maskedCookie || null);
        }
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
      if (window.location.search) {
        window.history.replaceState({}, "", "/admin/intent-leads/");
      }
    } catch {}
    setUnlockedPin(null);
    setPinInput("");
  }

  // Build self-contained Bookmarklet JS code that extracts post age ("2h", "1d", "2w"), pageUrl for region tagging, and filters out stale posts >3 days
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
          posts.push({ postUrl: postUrl, pageUrl: window.location.href, authorName: authorName.slice(0,120), authorRole: authorRole.slice(0,160), ageText: ageText.slice(0,60), postText: text.slice(0,1800) });
        });
        if (posts.length === 0) {
          var sel = window.getSelection().toString().trim();
          if (sel.length > 25) {
            posts.push({ postUrl: window.location.href, pageUrl: window.location.href, authorName: document.title.slice(0,80), ageText: '1h ago', postText: sel.slice(0,1800) });
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
  }, [bookmarkletHref, activeChannelTab, unlockedPin]);

  // Compute channel counts for the bifurcated tab bar
  const channelCounts = useMemo(() => {
    const fresh = signals.filter((s) => (s.age_hours ?? 6) <= 72);
    const isLinkedIn = (s: IntentLeadSignal) =>
      s.source_platform === "LINKEDIN_PUBLIC" || s.source_platform === "LINKEDIN_FEED";
    const isForumOrReddit = (s: IntentLeadSignal) =>
      s.source_platform === "REDDIT" || s.source_platform === "WEB_FORUM" || s.source_platform === "X_TWITTER";

    return {
      ALL: fresh.length,
      LINKEDIN_INDIA: fresh.filter((s) => isLinkedIn(s) && s.target_region === "INDIA").length,
      LINKEDIN_USA: fresh.filter((s) => isLinkedIn(s) && (s.target_region === "USA" || s.target_region === "GLOBAL")).length,
      LINKEDIN_UAE: fresh.filter((s) => isLinkedIn(s) && s.target_region === "UAE_DUBAI").length,
      MY_LINKEDIN_FEED: fresh.filter((s) => s.source_platform === "LINKEDIN_FEED").length,
      REDDIT_FORUMS: fresh.filter((s) => isForumOrReddit(s)).length,
      GOOGLE_SEARCH: googleQueries.length,
    };
  }, [signals, googleQueries]);

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      const age = s.age_hours ?? 6;
      if (age > 72) return false; // Never show stale leads > 3 days
      if (freshnessFilter === "1H_12H" && age > 12) return false;
      if (freshnessFilter === "24H" && age > 24) return false;
      if (freshnessFilter === "3D" && age > 72) return false;

      const isLi = s.source_platform === "LINKEDIN_PUBLIC" || s.source_platform === "LINKEDIN_FEED";
      const isForum =
        s.source_platform === "REDDIT" ||
        s.source_platform === "WEB_FORUM" ||
        s.source_platform === "X_TWITTER";

      // Bifurcated Channel Tab Filtering
      if (activeChannelTab === "LINKEDIN_INDIA") {
        if (!isLi || s.target_region !== "INDIA") return false;
      } else if (activeChannelTab === "LINKEDIN_USA") {
        if (!isLi || (s.target_region !== "USA" && s.target_region !== "GLOBAL")) return false;
      } else if (activeChannelTab === "LINKEDIN_UAE") {
        if (!isLi || s.target_region !== "UAE_DUBAI") return false;
      } else if (activeChannelTab === "MY_LINKEDIN_FEED") {
        if (s.source_platform !== "LINKEDIN_FEED") return false;
      } else if (activeChannelTab === "REDDIT_FORUMS") {
        if (!isForum) return false;
      }

      if (regionFilter !== "ALL" && s.target_region !== regionFilter) return false;
      if (serviceFilter !== "ALL" && s.service_category !== serviceFilter) return false;
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${s.author_name || ""} ${s.author_role || ""} ${s.post_title || ""} ${s.post_text || ""} ${s.service_category} ${s.target_region}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [signals, activeChannelTab, freshnessFilter, regionFilter, serviceFilter, statusFilter, searchQuery]);

  const activePresetSearches = useMemo(() => {
    if (activeChannelTab === "LINKEDIN_INDIA") {
      return presetSearches.filter((p) => p.region === "INDIA");
    }
    if (activeChannelTab === "LINKEDIN_USA") {
      return presetSearches.filter((p) => p.region === "USA" || p.region === "GLOBAL");
    }
    if (activeChannelTab === "LINKEDIN_UAE") {
      return presetSearches.filter((p) => p.region === "UAE_DUBAI");
    }
    return presetSearches;
  }, [presetSearches, activeChannelTab]);

  async function refreshSignals(showToast = false) {
    if (!unlockedPin) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "X-DGS-Intent-Pin": unlockedPin,
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();
      if (data.ok) {
        setSignals(data.signals || []);
        setRuns(data.runs || []);
        if (data.linkedinSession) {
          setLinkedinConnected(Boolean(data.linkedinSession.connected));
          setLinkedinMaskedCookie(data.linkedinSession.maskedCookie || null);
        }
        if (showToast) {
          setScanBanner(`Vault list refreshed (${(data.signals || []).length} verified service-needing buyer leads loaded).`);
        }
      }
    } catch {
      if (showToast) {
        setScanBanner("Could not refresh list — please check connection.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRunLiveDiscovery() {
    if (!unlockedPin) return;
    setIsScanning(true);
    setScanBanner(
      "Scanning Fresh (<72h / 24h / 1h–12h) Buyer-Only Leads (strictly excluding service providers/agencies)..."
    );
    try {
      const res = await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
        method: "POST",
        cache: "no-store",
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
      if (Array.isArray(data.signals)) {
        setSignals(data.signals);
      } else {
        await refreshSignals(false);
      }
      if (Array.isArray(data.runs)) {
        setRuns(data.runs);
      }
      if (data.linkedinSession) {
        setLinkedinConnected(Boolean(data.linkedinSession.connected));
        setLinkedinMaskedCookie(data.linkedinSession.maskedCookie || null);
      }
      if (data.result) {
        setScanBanner(data.result.summaryText || "Discovery run completed & vault refreshed.");
      } else {
        setScanBanner(data.message || "Discovery run completed & vault refreshed.");
      }
    } catch (err: any) {
      setScanBanner(`Discovery scan failed: ${err?.message || "Network error"}`);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleSaveLinkedinSession(e: React.FormEvent) {
    e.preventDefault();
    if (!unlockedPin) return;
    setIsSavingLinkedin(true);
    try {
      const res = await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-DGS-Intent-Pin": unlockedPin,
        },
        body: JSON.stringify({
          action: "save-linkedin-session",
          pin: unlockedPin,
          liAtCookie: liAtInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const connected = Boolean(data.linkedinSession?.connected);
        setLinkedinConnected(connected);
        setLinkedinMaskedCookie(data.linkedinSession?.maskedCookie || null);
        if (Array.isArray(data.signals)) setSignals(data.signals);
        if (Array.isArray(data.runs)) setRuns(data.runs);
        setLiAtInput("");
        setShowLinkedinConnect(false);
        setScanBanner(
          connected
            ? `LinkedIn Session Connected (${data.linkedinSession?.maskedCookie})! Auto-scanned LinkedIn India, USA & UAE (${data.result?.qualifiedLeadsAdded || 0} new buyer leads added).`
            : "LinkedIn session cleared."
        );
      }
    } finally {
      setIsSavingLinkedin(false);
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
      cache: "no-store",
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
      const sourceChannelHint =
        activeChannelTab === "MY_LINKEDIN_FEED" ? "LINKEDIN_FEED" : "LINKEDIN_PUBLIC";
      const res = await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
        method: "POST",
        cache: "no-store",
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
              regionHint: manualRegion,
              sourceChannelHint,
              ageText: "1h ago",
              postText: manualText.trim(),
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        const added = data.result?.qualifiedAdded || 0;
        if (Array.isArray(data.signals)) setSignals(data.signals);
        if (Array.isArray(data.runs)) setRuns(data.runs);
        setScanBanner(
          added > 0
            ? `Lead Fetched (${manualRegion})! AI qualified your LinkedIn post, saved it to this tab, and sent an email notification.`
            : `Post analyzed — filtered out as service provider, job seeker, or duplicate (Skipped: ${data.result?.skippedNoise || 0}, Duplicate: ${data.result?.duplicates || 0}).`
        );
        setManualAuthor("");
        setManualRole("");
        setManualUrl("");
        setManualText("");
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
          method="GET"
          action="/admin/intent-leads/"
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
              name="pin"
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
            {isScanning ? "Fetching Buyer Leads..." : "Fetch Fresh Leads Now (+ Email Alert)"}
          </button>

          <button
            type="button"
            disabled={isRefreshing || isScanning}
            onClick={() => refreshSignals(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(37, 99, 235, 0.16)",
              color: "#93c5fd",
              border: "1px solid rgba(59, 130, 246, 0.38)",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: isRefreshing ? "wait" : "pointer",
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh List"}
          </button>

          <button
            type="button"
            onClick={() => setShowLinkedinConnect((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: linkedinConnected ? "rgba(16, 185, 129, 0.16)" : "rgba(245, 158, 11, 0.16)",
              color: linkedinConnected ? "#34d399" : "#fbbf24",
              border: linkedinConnected
                ? "1px solid rgba(16, 185, 129, 0.35)"
                : "1px solid rgba(245, 158, 11, 0.38)",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <KeyRound size={14} />
            {linkedinConnected
              ? `LinkedIn Connected (${linkedinMaskedCookie})`
              : "Connect LinkedIn Auto-Sync"}
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

      {/* LinkedIn Session Auto-Sync Configuration Drawer */}
      {showLinkedinConnect && (
        <form
          onSubmit={handleSaveLinkedinSession}
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 58, 138, 0.25))",
            border: "1px solid rgba(59, 130, 246, 0.45)",
            borderRadius: "14px",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc" }}>
              🔗 Connect Your LinkedIn Session (`li_at`) for Automatic 1h–24h LinkedIn India / USA / UAE Lead Fetching
            </div>
            <span style={{ fontSize: "11px", color: "#93c5fd" }}>
              Chrome on linkedin.com → F12 (DevTools) → Application → Cookies → Copy `li_at` value
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <input
              type="password"
              value={liAtInput}
              onChange={(e) => setLiAtInput(e.target.value)}
              placeholder="Paste your LinkedIn li_at session cookie here (e.g. AQEDAT...)"
              style={{
                flex: "1 1 320px",
                background: "#020617",
                color: "#f8fafc",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              disabled={isSavingLinkedin}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isSavingLinkedin ? "wait" : "pointer",
              }}
            >
              {isSavingLinkedin ? "Connecting & Scanning LinkedIn..." : "Save Session & Fetch LinkedIn Leads Now"}
            </button>
          </div>
        </form>
      )}

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

      {/* SOURCE & REGION BIFURCATION TABS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "14px",
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", color: "#93c5fd" }}>
            BIFURCATED LEAD CHANNELS BY SOURCE & REGION
          </span>
          <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700 }}>
            🔒 Zero LinkedIn Login Needed • Safe Browser-Session Bookmarklet + 30m Automated Forum & Search Radar
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {(
            [
              {
                key: "ALL" as VaultChannelTab,
                label: "🌐 All Fresh Leads",
                count: channelCounts.ALL,
                accent: "#3b82f6",
              },
              {
                key: "LINKEDIN_INDIA" as VaultChannelTab,
                label: "🇮🇳 LinkedIn India",
                count: channelCounts.LINKEDIN_INDIA,
                accent: "#f97316",
              },
              {
                key: "LINKEDIN_USA" as VaultChannelTab,
                label: "🇺🇸 LinkedIn USA",
                count: channelCounts.LINKEDIN_USA,
                accent: "#60a5fa",
              },
              {
                key: "LINKEDIN_UAE" as VaultChannelTab,
                label: "🇦🇪 LinkedIn UAE / Dubai",
                count: channelCounts.LINKEDIN_UAE,
                accent: "#10b981",
              },
              {
                key: "MY_LINKEDIN_FEED" as VaultChannelTab,
                label: "⚡ My LinkedIn Feed (1-Click Scanner)",
                count: channelCounts.MY_LINKEDIN_FEED,
                accent: "#8b5cf6",
              },
              {
                key: "REDDIT_FORUMS" as VaultChannelTab,
                label: "💬 Reddit & Startup Forums",
                count: channelCounts.REDDIT_FORUMS,
                accent: "#fb923c",
              },
              {
                key: "GOOGLE_SEARCH" as VaultChannelTab,
                label: "🔍 Google Search Buyer Queries",
                count: channelCounts.GOOGLE_SEARCH,
                accent: "#34d399",
              },
            ]
          ).map((tab) => {
            const isActive = activeChannelTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveChannelTab(tab.key);
                  setRegionFilter("ALL");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isActive ? "#2563eb" : "rgba(2, 6, 23, 0.7)",
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  border: isActive ? "1px solid #60a5fa" : "1px solid rgba(148, 163, 184, 0.2)",
                  boxShadow: isActive ? "0 6px 18px rgba(37, 99, 235, 0.35)" : "none",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? "rgba(255, 255, 255, 0.22)" : "rgba(148, 163, 184, 0.16)",
                    color: isActive ? "#ffffff" : tab.accent,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LINKEDIN REGIONAL & PERSONAL FEED HUB (Shown on LinkedIn India, LinkedIn USA, LinkedIn UAE, and My LinkedIn Feed tabs) */}
      {(activeChannelTab === "LINKEDIN_INDIA" ||
        activeChannelTab === "LINKEDIN_USA" ||
        activeChannelTab === "LINKEDIN_UAE" ||
        activeChannelTab === "MY_LINKEDIN_FEED") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(30, 58, 138, 0.35), rgba(15, 23, 42, 0.92))",
              border: "1px solid rgba(59, 130, 246, 0.38)",
              borderRadius: "16px",
              padding: "22px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#34d399" />
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399", letterSpacing: "0.04em" }}>
                  DO WE NEED YOUR LINKEDIN LOGIN? NO — NEVER SHARE YOUR PASSWORD OR COOKIES
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#93c5fd",
                  background: "rgba(37, 99, 235, 0.2)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                {activeChannelTab === "LINKEDIN_INDIA"
                  ? "🇮🇳 LinkedIn India (Mumbai • Bangalore • Delhi NCR • Pune • Hyderabad)"
                  : activeChannelTab === "LINKEDIN_USA"
                    ? "🇺🇸 LinkedIn USA (US Founders • SaaS • E-Commerce • Agencies)"
                    : activeChannelTab === "LINKEDIN_UAE"
                      ? "🇦🇪 LinkedIn UAE / Dubai (Dubai • Abu Dhabi • MENA)"
                      : "⚡ Personal LinkedIn Feed & Network"}
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
              {activeChannelTab === "LINKEDIN_INDIA"
                ? "🇮🇳 LinkedIn India Past-24h Buyer Feed & 1-Click Browser Scanner"
                : activeChannelTab === "LINKEDIN_USA"
                  ? "🇺🇸 LinkedIn USA Past-24h Buyer Feed & 1-Click Browser Scanner"
                  : activeChannelTab === "LINKEDIN_UAE"
                    ? "🇦🇪 LinkedIn UAE / Dubai Past-24h Buyer Feed & 1-Click Browser Scanner"
                    : "⚡ How to Fetch Leads From Your Personal LinkedIn Feed Without Sharing Your Login"}
            </h2>

            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 16px 0", maxWidth: "880px" }}>
              Giving your LinkedIn email/password to a cloud server can trigger LinkedIn security restrictions. Instead, because you are already logged into LinkedIn in your own browser:
              <br />
              <strong>Step 1:</strong> Drag <strong>⚡ Scan LinkedIn Feed to DGS</strong> below to your browser Bookmarks Bar once.{" "}
              <strong>Step 2:</strong> Click any{" "}
              <strong>
                {activeChannelTab === "LINKEDIN_INDIA"
                  ? "🇮🇳 LinkedIn India (Past 24h)"
                  : activeChannelTab === "LINKEDIN_USA"
                    ? "🇺🇸 LinkedIn USA (Past 24h)"
                    : activeChannelTab === "LINKEDIN_UAE"
                      ? "🇦🇪 LinkedIn UAE (Past 24h)"
                      : "LinkedIn (Past 24h)"}
              </strong>{" "}
              search button below (or open your personal LinkedIn Home Feed).{" "}
              <strong>Step 3:</strong> Click <strong>⚡ Scan LinkedIn Feed to DGS</strong> in your Bookmarks Bar — it reads the visible posts on your screen, auto-tags the region, filters for warm buyer intent (&le;72h old), saves them directly into this tab, and sends your email alert!
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <a
                ref={bookmarkletRef}
                href="#dgs-linkedin-scanner"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Drag this button to your browser Bookmarks Bar (Ctrl+Shift+B)! Then click it whenever you have LinkedIn open in your browser."
                  );
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  padding: "11px 20px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
                  border: "1px solid #60a5fa",
                  cursor: "grab",
                }}
              >
                <Bookmark size={15} />⚡ Scan LinkedIn Feed to DGS
              </a>

              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(16, 185, 129, 0.16)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Open My LinkedIn Feed ↗
              </a>

              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                ← Drag the blue button to your Bookmarks Bar (<code>Ctrl+Shift+B</code>), then click it on any LinkedIn page.
              </span>
            </div>

            {/* Region-Filtered LinkedIn Past-24h Search Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                gap: "12px",
              }}
            >
              {activePresetSearches.map((preset) => {
                const regBadge = REGION_BADGES[preset.region] || REGION_BADGES.GLOBAL;
                return (
                  <div
                    key={preset.id}
                    style={{
                      background: "rgba(2, 6, 23, 0.65)",
                      border: "1px solid rgba(148, 163, 184, 0.18)",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
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
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: regBadge.color,
                            background: regBadge.bg,
                            padding: "2px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {regBadge.label} • Past 24h
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
                        {preset.label}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
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
                          padding: "6px 11px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        LinkedIn (Past 24h) <ArrowUpRight size={12} />
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
                          padding: "6px 11px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Google Dork (24h) <ExternalLink size={11} />
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
                          padding: "6px 11px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Google Dork (3d) <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Paste LinkedIn Post into this Regional Tab */}
          <form
            onSubmit={handleManualPasteSubmit}
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                Quick Paste LinkedIn Requirement → Qualify, Save to{" "}
                {manualRegion === "INDIA"
                  ? "🇮🇳 LinkedIn India"
                  : manualRegion === "USA"
                    ? "🇺🇸 LinkedIn USA"
                    : manualRegion === "UAE_DUBAI"
                      ? "🇦🇪 LinkedIn UAE / Dubai"
                      : "Vault"}{" "}
                & Send Email Alert
              </h3>
              <select
                value={manualRegion}
                onChange={(e) => setManualRegion(e.target.value as any)}
                style={{
                  background: "#090d16",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <option value="INDIA">Target Tab: 🇮🇳 LinkedIn India</option>
                <option value="USA">Target Tab: 🇺🇸 LinkedIn USA</option>
                <option value="UAE_DUBAI">Target Tab: 🇦🇪 LinkedIn UAE / Dubai</option>
                <option value="GLOBAL">Target Tab: 🌍 Global</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
              <input
                type="text"
                placeholder="Author Name (e.g. Rahul Sharma / David Miller)"
                value={manualAuthor}
                onChange={(e) => setManualAuthor(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              />
              <input
                type="text"
                placeholder="Author Role & Company (e.g. Founder at FinScale)"
                value={manualRole}
                onChange={(e) => setManualRole(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              />
              <input
                type="url"
                placeholder="LinkedIn Post URL (optional)"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <textarea
                rows={2}
                required
                placeholder="Paste the LinkedIn post requirement here (e.g. 'Looking for an SEO or web development agency in Mumbai/USA...')..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                style={{
                  flex: "1 1 360px",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              />
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
                  padding: "12px 18px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <MessageSquare size={14} />
                {isIngestingManual ? "Qualifying..." : "Qualify & Save Lead"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LEADS STREAM (Shown on All Leads, LinkedIn India, LinkedIn USA, LinkedIn UAE, My LinkedIn Feed, and Reddit & Forums tabs) */}
      {activeChannelTab !== "GOOGLE_SEARCH" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Freshness Quick-Pills + Region & Service Filters */}
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

            {(activeChannelTab === "ALL" || activeChannelTab === "REDDIT_FORUMS") && (
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="ALL">All Regions (India / USA / UAE / Global)</option>
                <option value="INDIA">🇮🇳 India</option>
                <option value="USA">🇺🇸 USA & North America</option>
                <option value="UAE_DUBAI">🇦🇪 UAE / Dubai</option>
                <option value="UK">🇬🇧 UK</option>
                <option value="GLOBAL">🌍 Global</option>
              </select>
            )}

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
                placeholder="Filter by keyword, city (Mumbai, USA, Dubai)..."
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
                padding: "36px 24px",
                textAlign: "center",
              }}
            >
              <Radar size={34} color="#60a5fa" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
                {activeChannelTab === "LINKEDIN_INDIA"
                  ? "No Saved 🇮🇳 LinkedIn India Leads in This Filter Yet — Use the Past-24h Buttons Above!"
                  : activeChannelTab === "LINKEDIN_USA"
                    ? "No Saved 🇺🇸 LinkedIn USA Leads in This Filter Yet — Use the Past-24h Buttons Above!"
                    : activeChannelTab === "LINKEDIN_UAE"
                      ? "No Saved 🇦🇪 LinkedIn UAE / Dubai Leads in This Filter Yet — Use the Past-24h Buttons Above!"
                      : "No Fresh (≤72h) Warm Buyer Leads in This Filter Yet"}
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "620px", margin: "0 auto 18px auto", lineHeight: 1.55 }}>
                {activeChannelTab === "LINKEDIN_INDIA" ||
                activeChannelTab === "LINKEDIN_USA" ||
                activeChannelTab === "LINKEDIN_UAE" ||
                activeChannelTab === "MY_LINKEDIN_FEED"
                  ? "Click any 'LinkedIn (Past 24h)' or 'Google Dork (24h)' button above to open live LinkedIn buyer posts in your browser, then click the '⚡ Scan LinkedIn Feed to DGS' bookmarklet (or paste a post above) to populate this tab and trigger an email alert."
                  : "Click 'Fetch Fresh Leads Now (+ Email Alert)' to scan the last 1h–72h of buyer requests, or switch to the LinkedIn India / LinkedIn USA tabs."}
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
                const regBadge = REGION_BADGES[sig.target_region] || REGION_BADGES.GLOBAL;
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
                    {/* Top Row: Freshness + Platform + Region + Service + Intent Score */}
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
                            background: regBadge.bg,
                            color: regBadge.color,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {regBadge.label}
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

      {/* GOOGLE SEARCH BUYER-INTENT RADAR TAB */}
      {activeChannelTab === "GOOGLE_SEARCH" && (
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
              🔍 High-Intent Google Search Queries (People Searching Google for DGS Services)
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
              Real commercial searches on Google where prospective buyers in India, UAE/Dubai, USA & Global markets are looking for your services and D&apos;Genius Solutions appeared in search results.
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
                    <th style={{ padding: "10px 12px" }}>REGION</th>
                    <th style={{ padding: "10px 12px" }}>SERVICE</th>
                    <th style={{ padding: "10px 12px" }}>INTENT TIER</th>
                    <th style={{ padding: "10px 12px" }}>IMPR.</th>
                    <th style={{ padding: "10px 12px" }}>CLICKS</th>
                    <th style={{ padding: "10px 12px" }}>AVG POS</th>
                    <th style={{ padding: "10px 12px" }}>RECOMMENDED ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {googleQueries.slice(0, 60).map((q, idx) => {
                    const reg = REGION_BADGES[q.target_region] || REGION_BADGES.GLOBAL;
                    return (
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
                              background: reg.bg,
                              color: reg.color,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {reg.label}
                          </span>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
