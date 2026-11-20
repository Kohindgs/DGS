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
  THREADS: { label: "🧵 Threads", color: "#f472b6", bg: "rgba(236, 72, 153, 0.18)" },
  X_TWITTER: { label: "𝕏 X (Twitter)", color: "#e2e8f0", bg: "rgba(100, 116, 139, 0.25)" },
  REDDIT: { label: "Reddit Buyer Forum", color: "#fb923c", bg: "rgba(234, 88, 12, 0.18)" },
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
  "3D": { label: "📅 Past Week (2d–7d)", color: "#fbbf24", bg: "rgba(245, 158, 11, 0.18)" },
};

export type VaultChannelTab =
  | "ALL"
  | "LINKEDIN_INDIA"
  | "LINKEDIN_USA"
  | "LINKEDIN_UAE"
  | "THREADS_X"
  | "MY_LINKEDIN_FEED"
  | "REDDIT_FORUMS"
  | "GOOGLE_SEARCH";

function parseUtcDate(val?: string | null): Date {
  if (!val) return new Date();
  const s = String(val).trim();
  if (!s) return new Date();
  if (s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s)) return new Date(s);
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(s)) {
    return new Date(`${s.replace(" ", "T")}Z`);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatIstDateTime(val?: string | null): string {
  const d = parseUtcDate(val);
  try {
    return (
      d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " IST"
    );
  } catch {
    return d.toLocaleString();
  }
}

function formatIstTimeOnly(val?: string | null): string {
  const d = parseUtcDate(val);
  try {
    return (
      d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " IST"
    );
  } catch {
    return d.toLocaleTimeString();
  }
}

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
  const [sortBy, setSortBy] = useState<"LATEST_FIRST" | "SCORE_FIRST">("LATEST_FIRST");
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
  const [cronCountdownSec, setCronCountdownSec] = useState<number>(900);

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

  // Automatically sync latest signals every 60s & trigger 15-minute live auto-discovery cron while Vault is unlocked
  useEffect(() => {
    if (unlockedPin === "021514") {
      refreshSignals(false);
      const syncTimer = setInterval(() => {
        refreshSignals(false);
      }, 60 * 1000);
      const countdownTimer = setInterval(() => {
        setCronCountdownSec((prev) => {
          if (prev <= 1) {
            refreshSignals(true);
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(syncTimer);
        clearInterval(countdownTimer);
      };
    }
  }, [unlockedPin]);

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
          posts.push({ postUrl: postUrl, pageUrl: window.location.href, authorName: authorName.slice(0,120), authorRole: authorRole.slice(0,160), ageText: ageText.slice(0,60), postText: text.slice(0,12000) });
        });
        if (posts.length === 0) {
          var sel = window.getSelection().toString().trim();
          if (sel.length > 25) {
            posts.push({ postUrl: window.location.href, pageUrl: window.location.href, authorName: document.title.slice(0,80), ageText: '1h ago', postText: sel.slice(0,12000) });
          }
        }
        if (posts.length === 0) {
          alert('DGS Scanner: Scroll through your LinkedIn, X, or Threads search results first, or highlight a post text before clicking.');
          return;
        }
        var badge = document.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#0f172a;color:#f8fafc;border:1px solid #3b82f6;padding:14px 20px;border-radius:12px;font-family:sans-serif;font-size:14px;box-shadow:0 12px 32px rgba(0,0,0,0.45);';
        badge.innerText = 'DGS Buyer-Intent AI: Qualifying ' + posts.length + ' fresh agency buyer posts...';
        document.body.appendChild(badge);
        fetch('${endpoint}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-DGS-Ingest-Token': '${ingestToken}' },
          body: JSON.stringify({ token: '${ingestToken}', sendEmailDigest: true, posts: posts.slice(0, 30) })
        }).then(function(r){ return r.json(); }).then(function(res){
          badge.style.borderColor = '#10b981';
          badge.innerText = res.message || ('Fetched ' + (res.result && res.result.qualifiedAdded || 0) + ' agency buyer leads & emailed alert!');
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

  // Compute channel counts for the bifurcated tab bar (includes all Past Week <=168h leads)
  const channelCounts = useMemo(() => {
    const fresh = signals.filter((s) => (s.age_hours ?? 6) <= 168);
    const isLinkedIn = (s: IntentLeadSignal) =>
      s.source_platform === "LINKEDIN_PUBLIC" || s.source_platform === "LINKEDIN_FEED";
    const isThreadsOrX = (s: IntentLeadSignal) =>
      s.source_platform === "THREADS" || s.source_platform === "X_TWITTER";
    const isForumOrReddit = (s: IntentLeadSignal) =>
      s.source_platform === "REDDIT" || s.source_platform === "WEB_FORUM";

    return {
      ALL: fresh.length,
      LINKEDIN_INDIA: fresh.filter((s) => isLinkedIn(s) && s.target_region === "INDIA").length,
      LINKEDIN_USA: fresh.filter((s) => isLinkedIn(s) && (s.target_region === "USA" || s.target_region === "GLOBAL")).length,
      LINKEDIN_UAE: fresh.filter((s) => isLinkedIn(s) && s.target_region === "UAE_DUBAI").length,
      THREADS_X: fresh.filter((s) => isThreadsOrX(s)).length,
      MY_LINKEDIN_FEED: fresh.filter((s) => s.source_platform === "LINKEDIN_FEED").length,
      REDDIT_FORUMS: fresh.filter((s) => isForumOrReddit(s)).length,
      GOOGLE_SEARCH: googleQueries.length,
    };
  }, [signals, googleQueries]);

  const filteredSignals = useMemo(() => {
    const matching = signals.filter((s) => {
      const age = s.age_hours ?? 6;
      if (age > 168) return false; // Never show stale leads > 7 days
      if (freshnessFilter === "1H_12H" && age > 12) return false;
      if (freshnessFilter === "24H" && age > 24) return false;
      if (freshnessFilter === "3D" && age > 168) return false;

      const isLi = s.source_platform === "LINKEDIN_PUBLIC" || s.source_platform === "LINKEDIN_FEED";
      const isThreadsOrX = s.source_platform === "THREADS" || s.source_platform === "X_TWITTER";
      const isForum = s.source_platform === "REDDIT" || s.source_platform === "WEB_FORUM";

      // Bifurcated Channel Tab Filtering
      if (activeChannelTab === "LINKEDIN_INDIA") {
        if (!isLi || s.target_region !== "INDIA") return false;
      } else if (activeChannelTab === "LINKEDIN_USA") {
        if (!isLi || (s.target_region !== "USA" && s.target_region !== "GLOBAL")) return false;
      } else if (activeChannelTab === "LINKEDIN_UAE") {
        if (!isLi || s.target_region !== "UAE_DUBAI") return false;
      } else if (activeChannelTab === "THREADS_X") {
        if (!isThreadsOrX) return false;
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

    const statusOrder = (st: string) => (st === "NEW" ? 0 : st === "CONTACTED" ? 1 : 2);

    return matching.slice().sort((a, b) => {
      const stDiff = statusOrder(a.status) - statusOrder(b.status);
      if (stDiff !== 0) return stDiff;

      const ageA = a.age_hours ?? 1;
      const ageB = b.age_hours ?? 1;
      const discA = a.discovered_at ? parseUtcDate(a.discovered_at).getTime() : 0;
      const discB = b.discovered_at ? parseUtcDate(b.discovered_at).getTime() : 0;
      const pubA = a.published_at ? parseUtcDate(a.published_at).getTime() : discA;
      const pubB = b.published_at ? parseUtcDate(b.published_at).getTime() : discB;

      if (sortBy === "SCORE_FIRST") {
        if (b.intent_score !== a.intent_score) return b.intent_score - a.intent_score;
        if (ageA !== ageB) return ageA - ageB;
        return discB - discA;
      }

      // Default: LATEST_FIRST — strictly newest/latest leads on top (1h -> 2h -> 3h -> ... -> 7d)
      if (ageA !== ageB) return ageA - ageB;
      if (discB !== discA) return discB - discA;
      if (pubB !== pubA) return pubB - pubA;
      return (b.intent_score || 0) - (a.intent_score || 0);
    });
  }, [signals, activeChannelTab, freshnessFilter, regionFilter, serviceFilter, statusFilter, sortBy, searchQuery]);

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
    if (showToast) {
      setScanBanner(
        "Refreshing Vault & scanning live LinkedIn, Reddit, Threads & X for fresh agency/company buyer leads..."
      );
    }
    try {
      const res = showToast
        ? await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
            method: "POST",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "X-DGS-Intent-Pin": unlockedPin,
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify({
              action: "discover",
              pin: unlockedPin,
              serviceCategory: serviceFilter,
              sendEmailDigest: false,
            }),
          })
        : await fetch(`/api/admin/intent-leads/?t=${Date.now()}`, {
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              "X-DGS-Intent-Pin": unlockedPin,
              "Cache-Control": "no-cache",
            },
          });
      const data = await res.json();
      if (data.ok || Array.isArray(data.signals)) {
        setSignals(data.signals || []);
        setRuns(data.runs || []);
        if (data.linkedinSession) {
          setLinkedinConnected(Boolean(data.linkedinSession.connected));
          setLinkedinMaskedCookie(data.linkedinSession.maskedCookie || null);
        }
        if (showToast) {
          const totalLoaded = (data.signals || []).length;
          const summary = data.result?.summaryText
            ? `${data.result.summaryText} (${totalLoaded} verified buyer leads in Vault)`
            : `Vault list refreshed (${totalLoaded} verified service-needing buyer leads loaded).`;
          setScanBanner(summary);
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
    setScanBanner(
      status === "CONTACTED"
        ? "Lead marked as Contacted ✓"
        : status === "ARCHIVED"
          ? "Lead archived in Vault 📦"
          : status === "DISMISSED"
            ? "Lead dismissed from Vault."
            : "Lead reopened as New."
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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {}
    setCopiedKey(key);
    setScanBanner(key.startsWith("reply-") ? "Copied Suggested Public Reply to clipboard!" : "Copied Suggested Direct Message (DM) to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  }

  const cronMm = String(Math.floor(cronCountdownSec / 60)).padStart(2, "0");
  const cronSs = String(cronCountdownSec % 60).padStart(2, "0");
  const latestRun = runs && runs.length > 0 ? runs[0] : null;

  // ============================================================================
  // PRIVATE PIN GATE (PIN: 021514)
  // ============================================================================
  if (!unlockedPin) {
    return (
      <div
        style={{
          minHeight: "74vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
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
            maxWidth: "460px",
            background:
              "linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(124, 58, 237, 0.14) 50%, rgba(249, 115, 22, 0.12) 100%), rgba(15, 23, 42, 0.78)",
            backdropFilter: "blur(28px) saturate(170%)",
            WebkitBackdropFilter: "blur(28px) saturate(170%)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "24px",
            padding: "38px 34px",
            boxShadow:
              "0 28px 68px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            textAlign: "center",
          }}
        >
          {/* Official D'Genius Solutions Logo Emblem */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 24px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.03))",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow:
                "0 12px 32px rgba(6, 182, 212, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
              marginBottom: "18px",
            }}
          >
            <img
              src="/images/brand/dgs-logo-trimmed.png"
              alt="D'Genius Solutions Official Logo"
              style={{
                height: "54px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 14px rgba(124, 58, 237, 0.35))",
              }}
            />
          </div>

          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#34d399",
                background: "rgba(16, 185, 129, 0.16)",
                border: "1px solid rgba(52, 211, 153, 0.35)",
                padding: "4px 12px",
                borderRadius: "999px",
                marginBottom: "12px",
              }}
            >
              <Lock size={12} /> PRIVATE EXECUTIVE VAULT • PIN PROTECTED
            </div>
          </div>

          <h1 style={{ fontSize: "23px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
            D&apos;Genius Buyer-Intent Lead Vault
          </h1>
          <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "0 0 24px 0", lineHeight: 1.55 }}>
            Restricted executive radar isolated from public website lead forms. Enter your 6-digit security passcode below to unlock fresh (<strong>1h–12h / 24h / &le;7d</strong>) agency buyer leads.
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
                background: "rgba(9, 13, 22, 0.78)",
                backdropFilter: "blur(12px)",
                color: "#f8fafc",
                border: pinError
                  ? "1px solid #ef4444"
                  : "1px solid rgba(56, 189, 248, 0.45)",
                borderRadius: "14px",
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
              background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 52%, #ec4899 100%)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              padding: "13px 20px",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 800,
              boxShadow: "0 10px 28px rgba(124, 58, 237, 0.38)",
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
  const newUncontactedCount = signals.filter((s) => s.status === "NEW").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px", paddingBottom: "48px", position: "relative" }}>
      {/* Glassmorphic Brand Hero Header with Official DGS Logo & Live 15m Cron Status */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          background:
            "linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(124, 58, 237, 0.15) 45%, rgba(236, 72, 153, 0.12) 75%, rgba(249, 115, 22, 0.14) 100%), rgba(15, 23, 42, 0.72)",
          backdropFilter: "blur(28px) saturate(175%)",
          WebkitBackdropFilter: "blur(28px) saturate(175%)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          boxShadow:
            "0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
          borderRadius: "22px",
          padding: "24px 26px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px", maxWidth: "820px" }}>
          {/* Official D'Genius Solutions Logo Glass Emblem */}
          <div
            style={{
              display: "flex",
               flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 20px",
              borderRadius: "18px",
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.03) 100%)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow:
                "0 12px 32px rgba(6, 182, 212, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.28)",
              flexShrink: 0,
            }}
          >
            <img
              src="/images/brand/dgs-logo-trimmed.png"
              alt="D'Genius Solutions Official Logo"
              style={{
                height: "56px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 12px rgba(0, 198, 255, 0.28))",
              }}
            />
          </div>

          <div style={{ flex: "1 1 460px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 182, 212, 0.20))",
                  color: "#6ee7b7",
                  border: "1px solid rgba(52, 211, 153, 0.45)",
                  padding: "4px 11px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                  boxShadow: "0 0 16px rgba(16, 185, 129, 0.22)",
                }}
              >
                <Lock size={12} /> PRIVATE PIN VAULT UNLOCKED
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.20), rgba(139, 92, 246, 0.22))",
                  color: "#7dd3fc",
                  border: "1px solid rgba(56, 189, 248, 0.40)",
                  padding: "4px 11px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                🟢 15-Min Auto-Cron Active • Next Scan in {cronMm}:{cronSs}
              </span>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgba(236, 72, 153, 0.16)",
                  color: "#f9a8d4",
                  border: "1px solid rgba(244, 114, 182, 0.35)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Agency / Company / Production House Buyers Only
              </span>
            </div>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#f8fafc",
                margin: "0 0 6px 0",
                letterSpacing: "-0.01em",
              }}
            >
              D&apos;Genius Agency Buyer-Intent Vault (LinkedIn • X • Threads • Reddit)
            </h1>
            <p style={{ fontSize: "13.5px", color: "#cbd5e1", margin: 0, lineHeight: 1.55 }}>
              Exclusively captures <strong style={{ color: "#ffffff" }}>verified agency &amp; company buyer leads</strong> (founders &amp; decision makers explicitly looking for an{" "}
              <strong style={{ color: "#67e8f9" }}>
                SEO Agency, Digital Marketing Company, Website Development Agency, or AI Video Production Company / House
              </strong>
              ). Auto-discovery cron executes every <strong>15 minutes</strong> &amp; highlights fresh leads with distinct glass colors.
            </p>
          </div>
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
              background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 52%, #ec4899 100%)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 8px 24px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 800,
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
            onClick={() => {
              setCronCountdownSec(900);
              refreshSignals(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(59, 130, 246, 0.18))",
              backdropFilter: "blur(14px)",
              color: "#bae6fd",
              border: "1px solid rgba(56, 189, 248, 0.45)",
              padding: "10px 15px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 800,
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
              background: linkedinConnected
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.16))"
                : "rgba(245, 158, 11, 0.18)",
              backdropFilter: "blur(14px)",
              color: linkedinConnected ? "#6ee7b7" : "#fbbf24",
              border: linkedinConnected
                ? "1px solid rgba(52, 211, 153, 0.45)"
                : "1px solid rgba(245, 158, 11, 0.42)",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 800,
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
              background: "rgba(239, 68, 68, 0.16)",
              backdropFilter: "blur(14px)",
              color: "#fca5a5",
              border: "1px solid rgba(248, 113, 113, 0.35)",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Lock size={14} /> Lock Vault
          </button>
        </div>
      </div>

      {/* Live 15-Minute Auto-Cron Heartbeat & Discovery Telemetry Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          background:
            "linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.10) 35%, rgba(124, 58, 237, 0.10) 70%, rgba(249, 115, 22, 0.10) 100%), rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border: "1px solid rgba(52, 211, 153, 0.32)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          padding: "11px 16px",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(16, 185, 129, 0.22)",
              color: "#6ee7b7",
              border: "1px solid rgba(52, 211, 153, 0.45)",
              padding: "3px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            ⚡ AUTO-CRON RUNNING (EVERY 15M)
          </span>
          <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
            {latestRun
              ? `Latest Run (${latestRun.run_type}): Evaluated ${latestRun.raw_candidates_found} live posts across ${latestRun.queries_executed} queries • Rejected ${latestRun.rejected_noise_count} noise/freelancers • Completed ${formatIstTimeOnly(latestRun.completed_at || latestRun.started_at)}`
              : "15-Minute Auto-Cron active across LinkedIn India, USA, UAE, Reddit, Threads & X"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#7dd3fc", fontWeight: 700 }}>
          <span>Auto-Syncs Every 60s</span>
          <span>•</span>
          <span>Next Live Discovery Scan: {cronMm}:{cronSs}</span>
        </div>
      </div>

      {/* LinkedIn Session Auto-Sync Configuration Drawer */}
      {showLinkedinConnect && (
        <form
          onSubmit={handleSaveLinkedinSession}
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.90), rgba(30, 58, 138, 0.32))",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(56, 189, 248, 0.45)",
            borderRadius: "16px",
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
                background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
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
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(124, 58, 237, 0.16))",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(56, 189, 248, 0.42)",
            borderRadius: "14px",
            padding: "12px 16px",
            color: "#f8fafc",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={16} color="#38bdf8" />
            <span>{scanBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanBanner(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#cbd5e1",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Glassmorphic Multi-Color Gradient KPI Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Card 1: Emerald-Cyan Aurora Glass */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.14) 55%, rgba(15, 23, 42, 0.65) 100%)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(52, 211, 153, 0.42)",
            boxShadow: "0 14px 34px -8px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
            borderRadius: "18px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#a7f3d0", marginBottom: "4px" }}>
            ✨ New &amp; Ultra-Fresh (1h to 12h Old)
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#34d399", letterSpacing: "-0.02em" }}>
            {ultraFreshCount}
          </div>
          <div style={{ fontSize: "11px", color: "#6ee7b7", marginTop: "4px", fontWeight: 600 }}>
             Emerald-Cyan Glass • Highest conversion window
          </div>
        </div>

        {/* Card 2: Cyan-Indigo Glass */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.14) 55%, rgba(15, 23, 42, 0.65) 100%)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(56, 189, 248, 0.42)",
            boxShadow: "0 14px 34px -8px rgba(14, 165, 233, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
            borderRadius: "18px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#bae6fd", marginBottom: "4px" }}>
            🔥 Last 24 Hours Total
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#38bdf8", letterSpacing: "-0.02em" }}>
            {past24hCount}
          </div>
          <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "4px", fontWeight: 600 }}>
            Sky-Indigo Glass • Posted within 24 hours
          </div>
        </div>

        {/* Card 3: Violet-Magenta Glass */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(236, 72, 153, 0.14) 55%, rgba(15, 23, 42, 0.65) 100%)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(192, 132, 252, 0.40)",
            boxShadow: "0 14px 34px -8px rgba(139, 92, 246, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
            borderRadius: "18px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#e9d5ff", marginBottom: "4px" }}>
            📅 Active Vault (Past Week / &le; 7d)
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#e879f9", letterSpacing: "-0.02em" }}>
            {signals.length}
          </div>
          <div style={{ fontSize: "11px", color: "#f0abfc", marginTop: "4px", fontWeight: 600 }}>
            {newUncontactedCount} Unread New Leads • Violet-Rose Glass
          </div>
        </div>

        {/* Card 4: Warm Orange-Magenta Glass */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(236, 72, 153, 0.14) 55%, rgba(15, 23, 42, 0.65) 100%)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(251, 146, 60, 0.42)",
            boxShadow: "0 14px 34px -8px rgba(249, 115, 22, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20)",
            borderRadius: "18px",
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#fed7aa", marginBottom: "4px" }}>
            🎯 Hot Buyer Intent (Score 80+)
          </div>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "#fb923c", letterSpacing: "-0.02em" }}>
            {highUrgencyCount}
          </div>
          <div style={{ fontSize: "11px", color: "#fdba74", marginTop: "4px", fontWeight: 600 }}>
            Freelancers &amp; self-promos strictly rejected
          </div>
        </div>
      </div>

      {/* SOURCE & REGION BIFURCATION TABS (Glassmorphic Multi-Color Bar) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background:
            "linear-gradient(135deg, rgba(6, 182, 212, 0.10) 0%, rgba(124, 58, 237, 0.10) 50%, rgba(249, 115, 22, 0.08) 100%), rgba(15, 23, 42, 0.72)",
          backdropFilter: "blur(24px) saturate(165%)",
          WebkitBackdropFilter: "blur(24px) saturate(165%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 14px 36px -10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
          borderRadius: "18px",
          padding: "16px 18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", color: "#7dd3fc" }}>
            BIFURCATED LEAD CHANNELS BY SOURCE &amp; REGION (LINKEDIN • THREADS • X • REDDIT)
          </span>
          <span style={{ fontSize: "12px", color: "#6ee7b7", fontWeight: 700 }}>
            ⏱️ 15-Minute Auto-Cron Active • Strict Agency / Company / Production House Filter (Freelancers Excluded)
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {(
            [
              {
                key: "ALL" as VaultChannelTab,
                label: "🌐 All Agency Buyer Leads",
                count: channelCounts.ALL,
                accent: "#38bdf8",
              },
              {
                key: "LINKEDIN_INDIA" as VaultChannelTab,
                label: "🇮🇳 LinkedIn India",
                count: channelCounts.LINKEDIN_INDIA,
                accent: "#fb923c",
              },
              {
                key: "LINKEDIN_USA" as VaultChannelTab,
                label: "🇺🇸 LinkedIn USA & Global",
                count: channelCounts.LINKEDIN_USA,
                accent: "#60a5fa",
              },
              {
                key: "LINKEDIN_UAE" as VaultChannelTab,
                label: "🇦🇪 LinkedIn UAE / Dubai",
                count: channelCounts.LINKEDIN_UAE,
                accent: "#34d399",
              },
              {
                key: "THREADS_X" as VaultChannelTab,
                label: "🧵 Threads & 𝕏 X Buyer Leads",
                count: channelCounts.THREADS_X,
                accent: "#f472b6",
              },
              {
                key: "MY_LINKEDIN_FEED" as VaultChannelTab,
                label: "⚡ My LinkedIn Feed (1-Click Scanner)",
                count: channelCounts.MY_LINKEDIN_FEED,
                accent: "#c084fc",
              },
              {
                key: "REDDIT_FORUMS" as VaultChannelTab,
                label: "💬 Reddit Buyer Forums",
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
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isActive
                    ? "linear-gradient(135deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%)"
                    : "rgba(15, 23, 42, 0.58)",
                  backdropFilter: "blur(12px)",
                  color: isActive ? "#ffffff" : "#e2e8f0",
                  border: isActive
                    ? "1px solid rgba(255, 255, 255, 0.32)"
                    : "1px solid rgba(255, 255, 255, 0.10)",
                  boxShadow: isActive
                    ? "0 8px 22px rgba(124, 58, 237, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
                    : "none",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? "rgba(255, 255, 255, 0.24)" : "rgba(255, 255, 255, 0.08)",
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

      {/* LINKEDIN, THREADS & X REGIONAL SEARCH HUB */}
      {(activeChannelTab === "LINKEDIN_INDIA" ||
        activeChannelTab === "LINKEDIN_USA" ||
        activeChannelTab === "LINKEDIN_UAE" ||
        activeChannelTab === "THREADS_X" ||
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
                  AGENCY / COMPANY / PRODUCTION HOUSE BUYERS ONLY • FREELANCER POSTS EXCLUDED
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
                    ? "🇺🇸 LinkedIn USA & Global (Founders • SaaS • E-Commerce • Enterprise)"
                    : activeChannelTab === "LINKEDIN_UAE"
                      ? "🇦🇪 LinkedIn UAE / Dubai (Dubai • Abu Dhabi • MENA)"
                      : activeChannelTab === "THREADS_X"
                        ? "🧵 Threads & 𝕏 X Live Agency Buyer Search"
                        : "⚡ Personal LinkedIn Feed & Network"}
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px 0" }}>
              {activeChannelTab === "LINKEDIN_INDIA"
                ? "🇮🇳 LinkedIn India Agency Buyer Feed & 1-Click Browser Scanner"
                : activeChannelTab === "LINKEDIN_USA"
                  ? "🇺🇸 LinkedIn USA Agency Buyer Feed & 1-Click Browser Scanner"
                  : activeChannelTab === "LINKEDIN_UAE"
                    ? "🇦🇪 LinkedIn UAE / Dubai Agency Buyer Feed & 1-Click Browser Scanner"
                    : activeChannelTab === "THREADS_X"
                      ? "🧵 Threads & 𝕏 X (Twitter) Live Agency / Production House Buyer Search"
                      : "⚡ How to Fetch Leads From Your Personal LinkedIn, X, or Threads Feed"}
            </h2>

            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 16px 0", maxWidth: "880px" }}>
              Every preset search below targets decision makers explicitly asking for an <strong>Agency, Company, or AI Video Production House</strong> (strictly filtering out <code>&quot;hire someone&quot;</code> and <code>&quot;freelancer&quot;</code> posts).
              <br />
              <strong>Step 1:</strong> Drag <strong>⚡ Scan Feed to DGS</strong> below to your browser Bookmarks Bar once.{" "}
              <strong>Step 2:</strong> Click any <strong>LinkedIn (Past 24h)</strong>, <strong>𝕏 X (Live)</strong>, or <strong>🧵 Threads</strong> search button below.{" "}
              <strong>Step 3:</strong> Click <strong>⚡ Scan Feed to DGS</strong> in your Bookmarks Bar to qualify and save visible agency buyer posts directly into your Vault!
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <a
                ref={bookmarkletRef}
                href="#dgs-linkedin-scanner"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "Drag this button to your browser Bookmarks Bar (Ctrl+Shift+B)! Then click it whenever you have LinkedIn, X, or Threads open in your browser."
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
                <Bookmark size={15} />⚡ Scan Feed to DGS
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
                Open LinkedIn Feed ↗
              </a>

              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                ← Drag the blue button to your Bookmarks Bar (<code>Ctrl+Shift+B</code>), then click it on any LinkedIn, X, or Threads page.
              </span>
            </div>

            {/* Region-Filtered LinkedIn, X & Threads Search Cards */}
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
                          {regBadge.label} • Agency Buyers
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
                        LinkedIn (24h) <ArrowUpRight size={12} />
                      </a>

                      {preset.linkedinSearchWeekUrl && (
                        <a
                          href={preset.linkedinSearchWeekUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "rgba(59, 130, 246, 0.22)",
                            color: "#93c5fd",
                            border: "1px solid rgba(59, 130, 246, 0.45)",
                            textDecoration: "none",
                            padding: "6px 11px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          LinkedIn (Week) <ArrowUpRight size={12} />
                        </a>
                      )}

                      {preset.xSearchUrl && (
                        <a
                          href={preset.xSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "rgba(100, 116, 139, 0.28)",
                            color: "#f8fafc",
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                            textDecoration: "none",
                            padding: "6px 11px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          𝕏 X (Live) <ArrowUpRight size={12} />
                        </a>
                      )}

                      {preset.threadsSearchUrl && (
                        <a
                          href={preset.threadsSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: "rgba(236, 72, 153, 0.18)",
                            color: "#f472b6",
                            border: "1px solid rgba(236, 72, 153, 0.4)",
                            textDecoration: "none",
                            padding: "6px 11px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          🧵 Threads <ArrowUpRight size={12} />
                        </a>
                      )}

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
                        Google (24h) <ExternalLink size={11} />
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
          {/* Glassmorphic Filter Bar + Visual Color Legend for New Leads */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 45%, rgba(124, 58, 237, 0.08) 100%), rgba(15, 23, 42, 0.72)",
              backdropFilter: "blur(24px) saturate(165%)",
              WebkitBackdropFilter: "blur(24px) saturate(165%)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              boxShadow: "0 12px 32px -8px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#cbd5e1", fontSize: "12px", fontWeight: 700 }}>
                <Clock size={14} /> Freshness:
              </div>

              {[
                { key: "ALL", label: "All Fresh (Past Week)" },
                { key: "1H_12H", label: "✨ 1h to 12h New" },
                { key: "24H", label: "🔥 Past 24 Hours" },
                { key: "3D", label: "📅 Past Week (≤7 Days)" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setFreshnessFilter(pill.key)}
                  style={{
                    background:
                      freshnessFilter === pill.key
                        ? "linear-gradient(135deg, rgba(6, 182, 212, 0.32), rgba(124, 58, 237, 0.32))"
                        : "rgba(15, 23, 42, 0.58)",
                    backdropFilter: "blur(10px)",
                    color: freshnessFilter === pill.key ? "#ffffff" : "#cbd5e1",
                    border:
                      freshnessFilter === pill.key
                        ? "1px solid rgba(56, 189, 248, 0.6)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
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
                aria-label="Filter by Region"
                value={regionFilter}
                onChange={(e) => {
                  const nextRegion = e.target.value;
                  setRegionFilter(nextRegion);
                  if (
                    nextRegion !== "ALL" &&
                    (activeChannelTab === "LINKEDIN_INDIA" ||
                      activeChannelTab === "LINKEDIN_USA" ||
                      activeChannelTab === "LINKEDIN_UAE")
                  ) {
                    setActiveChannelTab("ALL");
                  }
                }}
                style={{
                  background: "rgba(9, 13, 22, 0.78)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All Regions (India / USA / UAE / Global)</option>
                <option value="INDIA">🇮🇳 India</option>
                <option value="USA">🇺🇸 USA &amp; North America</option>
                <option value="UAE_DUBAI">🇦🇪 UAE / Dubai</option>
                <option value="UK">🇬🇧 UK</option>
                <option value="GLOBAL">🌍 Global</option>
              </select>

              <select
                aria-label="Filter by Service"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                style={{
                  background: "rgba(9, 13, 22, 0.78)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All DGS Services</option>
                <option value="SEO">SEO (/services/seo/)</option>
                <option value="AEO_GEO">AEO / GEO (/services/aeo-geo-aio/)</option>
                <option value="WEB_DEV">Website Dev &amp; AMC (/services/website-development/)</option>
                <option value="AI_VIDEO">AI Video (/services/ai-video-production-agency/)</option>
                <option value="PAID_MEDIA">Performance Marketing (/services/digital-marketing/)</option>
                <option value="BRANDING">Branding &amp; Social (/services/branding/)</option>
              </select>

              <select
                aria-label="Filter by Lead Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: "rgba(9, 13, 22, 0.78)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All Lead Statuses</option>
                <option value="NEW">🟢 New (Uncontacted)</option>
                <option value="CONTACTED">✓ Contacted</option>
                <option value="ARCHIVED">📦 Archived in Vault</option>
              </select>

              <select
                aria-label="Sort Leads Order"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "LATEST_FIRST" | "SCORE_FIRST")}
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.18)), rgba(9, 13, 22, 0.85)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(52, 211, 153, 0.48)",
                  borderRadius: "10px",
                  padding: "7px 12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <option value="LATEST_FIRST" style={{ background: "#090d16", color: "#6ee7b7" }}>
                  ⚡ Sort: Latest Leads on Top (1h → 7d)
                </option>
                <option value="SCORE_FIRST" style={{ background: "#090d16", color: "#f8fafc" }}>
                  🔥 Sort: Highest Buyer Score First
                </option>
              </select>

              <div style={{ position: "relative", flex: "1 1 180px" }}>
                <input
                  type="text"
                  placeholder="Filter by keyword, city (Mumbai, USA, Dubai)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(9, 13, 22, 0.78)",
                    color: "#f1f5f9",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "10px",
                    padding: "7px 12px",
                    fontSize: "12px",
                  }}
                />
              </div>

              {(freshnessFilter !== "ALL" ||
                regionFilter !== "ALL" ||
                serviceFilter !== "ALL" ||
                statusFilter !== "ALL" ||
                searchQuery.trim() !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setFreshnessFilter("ALL");
                    setRegionFilter("ALL");
                    setServiceFilter("ALL");
                    setStatusFilter("ALL");
                    setSearchQuery("");
                  }}
                  style={{
                    background: "rgba(239, 68, 68, 0.18)",
                    color: "#fca5a5",
                    border: "1px solid rgba(248, 113, 113, 0.4)",
                    borderRadius: "10px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Reset Filters
                </button>
              )}

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#6ee7b7",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.18))",
                  border: "1px solid rgba(52, 211, 153, 0.42)",
                  padding: "6px 12px",
                  borderRadius: "10px",
                }}
              >
                Showing {filteredSignals.length} of {signals.length} Leads (Latest on Top)
              </span>
            </div>

            {/* Color Legend Bar for New Leads vs 24h vs Past Week vs Contacted */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "11px",
                color: "#cbd5e1",
              }}
            >
              <span style={{ fontWeight: 800, color: "#f8fafc", letterSpacing: "0.03em" }}>
                🎨 LEAD COLOR GUIDE:
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 182, 212, 0.20))",
                  border: "1px solid rgba(52, 211, 153, 0.48)",
                  color: "#6ee7b7",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 800,
                }}
              >
                ✨ New &amp; Ultra-Fresh (1h–12h Unread) — Emerald-Cyan Aurora Glass
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(99, 102, 241, 0.18))",
                  border: "1px solid rgba(56, 189, 248, 0.45)",
                  color: "#7dd3fc",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 700,
                }}
              >
                🔥 Active 24h Window (12h–24h) — Sky-Indigo Glass
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(236, 72, 153, 0.18))",
                  border: "1px solid rgba(192, 132, 252, 0.42)",
                  color: "#f0abfc",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 700,
                }}
              >
                📅 Past Week (2d–7d) — Violet-Magenta-Orange Glass
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.16))",
                  border: "1px solid rgba(251, 191, 36, 0.42)",
                  color: "#fde68a",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 700,
                }}
              >
                ✓ Contacted — Amber-Gold Glass
              </span>
            </div>
          </div>

          {/* Signals List */}
          {filteredSignals.length === 0 ? (
            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(20px)",
                border: "1px dashed rgba(148, 163, 184, 0.25)",
                borderRadius: "16px",
                padding: "36px 24px",
                textAlign: "center",
              }}
            >
              <Radar size={34} color="#60a5fa" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 6px 0" }}>
                {activeChannelTab === "LINKEDIN_INDIA"
                  ? "No Saved 🇮🇳 LinkedIn India Leads Matching Current Filters"
                  : activeChannelTab === "LINKEDIN_USA"
                    ? "No Saved 🇺🇸 LinkedIn USA Leads Matching Current Filters"
                    : activeChannelTab === "LINKEDIN_UAE"
                      ? "No Saved 🇦🇪 LinkedIn UAE / Dubai Leads Matching Current Filters"
                      : "No Warm Buyer Leads Matching Current Filters"}
              </h3>
              <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "620px", margin: "0 auto 18px auto", lineHeight: 1.55 }}>
                {freshnessFilter !== "ALL" ||
                regionFilter !== "ALL" ||
                serviceFilter !== "ALL" ||
                statusFilter !== "ALL" ||
                searchQuery.trim() !== ""
                  ? "Try clicking 'Reset Filters' below to view all verified buyer leads in this channel."
                  : "Click any 'LinkedIn (Past 24h)' or 'LinkedIn (Past Week)' button above to open live LinkedIn buyer posts in your browser, or click 'Fetch Fresh Leads Now'."}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                {(freshnessFilter !== "ALL" ||
                  regionFilter !== "ALL" ||
                  serviceFilter !== "ALL" ||
                  statusFilter !== "ALL" ||
                  searchQuery.trim() !== "") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFreshnessFilter("ALL");
                      setRegionFilter("ALL");
                      setServiceFilter("ALL");
                      setStatusFilter("ALL");
                      setSearchQuery("");
                    }}
                    style={{
                      background: "rgba(239, 68, 68, 0.18)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Reset All Filters
                  </button>
                )}
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handleRunLiveDiscovery}
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
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
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredSignals.map((sig, index) => {
                const plat = PLATFORM_LABELS[sig.source_platform] || PLATFORM_LABELS.LINKEDIN_PUBLIC;
                const regBadge = REGION_BADGES[sig.target_region] || REGION_BADGES.GLOBAL;
                const ageHours = sig.age_hours ?? 6;
                const tierKey = ageHours <= 12 ? "1H_12H" : ageHours <= 24 ? "24H" : "3D";
                const freshBadge = FRESHNESS_BADGES[tierKey];
                const isNewUltraFresh = sig.status === "NEW" && ageHours <= 12;
                const isNew24h = sig.status === "NEW" && ageHours > 12 && ageHours <= 24;
                const isContacted = sig.status === "CONTACTED";

                // Distinct Glassmorphism & Subtle Color Gradients per Lead Tier
                const cardBackground = isContacted
                  ? "linear-gradient(135deg, rgba(245, 158, 11, 0.17) 0%, rgba(217, 119, 6, 0.10) 48%, rgba(15, 23, 42, 0.74) 100%)"
                  : isNewUltraFresh
                    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.21) 0%, rgba(6, 182, 212, 0.15) 48%, rgba(15, 23, 42, 0.68) 100%)"
                    : isNew24h
                      ? "linear-gradient(135deg, rgba(14, 165, 233, 0.19) 0%, rgba(99, 102, 241, 0.14) 50%, rgba(15, 23, 42, 0.72) 100%)"
                      : "linear-gradient(135deg, rgba(139, 92, 246, 0.17) 0%, rgba(236, 72, 153, 0.11) 52%, rgba(249, 115, 22, 0.08) 100%), rgba(15, 23, 42, 0.74)";

                const cardBorder = isContacted
                  ? "1px solid rgba(251, 191, 36, 0.45)"
                  : isNewUltraFresh
                    ? "1px solid rgba(52, 211, 153, 0.52)"
                    : isNew24h
                      ? "1px solid rgba(56, 189, 248, 0.46)"
                      : "1px solid rgba(192, 132, 252, 0.40)";

                const cardLeftAccent = isContacted
                  ? "5px solid #f59e0b"
                  : isNewUltraFresh
                    ? "5px solid #10b981"
                    : isNew24h
                      ? "5px solid #38bdf8"
                      : "5px solid #c084fc";

                const cardShadow = isNewUltraFresh
                  ? "0 18px 42px -10px rgba(16, 185, 129, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.22)"
                  : isNew24h
                    ? "0 16px 38px -10px rgba(14, 165, 233, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18)"
                    : "0 14px 34px -10px rgba(139, 92, 246, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.15)";

                return (
                  <div
                    key={sig.id}
                    style={{
                      background: cardBackground,
                      backdropFilter: "blur(24px) saturate(165%)",
                      WebkitBackdropFilter: "blur(24px) saturate(165%)",
                      border: cardBorder,
                      borderLeft: cardLeftAccent,
                      boxShadow: cardShadow,
                      borderRadius: "18px",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {/* Top Row: NEW LEAD Pill + Freshness + Platform + Region + Service + Intent Score */}
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
                        {sortBy === "LATEST_FIRST" && index < 3 && (
                          <span
                            style={{
                              background: "linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)",
                              color: "#ffffff",
                              border: "1px solid rgba(255, 255, 255, 0.28)",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 900,
                              letterSpacing: "0.04em",
                            }}
                          >
                            ⚡ #{index + 1} LATEST
                          </span>
                        )}

                        {isNewUltraFresh && (
                          <span
                            style={{
                              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
                              color: "#ffffff",
                              boxShadow: "0 0 18px rgba(16, 185, 129, 0.55)",
                              padding: "4px 11px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 900,
                              letterSpacing: "0.04em",
                            }}
                          >
                            ✨ NEW LEAD
                          </span>
                        )}

                        {!isNewUltraFresh && sig.status === "NEW" && (
                          <span
                            style={{
                              background: isNew24h
                                ? "linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(99, 102, 241, 0.35))"
                                : "linear-gradient(135deg, rgba(139, 92, 246, 0.32), rgba(236, 72, 153, 0.28))",
                              color: isNew24h ? "#bae6fd" : "#f5d0fe",
                              border: isNew24h
                                ? "1px solid rgba(56, 189, 248, 0.55)"
                                : "1px solid rgba(192, 132, 252, 0.5)",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            {isNew24h ? "🔥 24H ACTIVE BUYER" : "🟣 UNREAD BUYER"}
                          </span>
                        )}

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
                            background: "rgba(99, 102, 241, 0.20)",
                            color: "#c7d2fe",
                            border: "1px solid rgba(129, 140, 248, 0.32)",
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
                            background: "rgba(16, 185, 129, 0.18)",
                            color: "#6ee7b7",
                            border: "1px solid rgba(52, 211, 153, 0.42)",
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
                              background: "rgba(245, 158, 11, 0.24)",
                              color: "#fde68a",
                              border: "1px solid rgba(251, 191, 36, 0.45)",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            ✓ Contacted
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#e2e8f0",
                          background: "rgba(15, 23, 42, 0.55)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Clock size={12} color="#34d399" />
                        Posted ~{ageHours}h ago • Fetched {formatIstDateTime(sig.discovered_at)}
                      </div>
                    </div>

                    {/* Author, Company Legitimacy & Full Untruncated Post Message */}
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                          {sig.author_name ? `${sig.author_name}` : sig.post_title || "Active Service Buyer"}
                        </span>
                        {sig.author_role ? (
                          <span style={{ fontWeight: 500, color: "#cbd5e1", fontSize: "13px" }}>
                            • {sig.author_role}
                          </span>
                        ) : null}

                        <span
                          style={{
                            background:
                              sig.company_legitimacy_status === "VERIFIED_LIVE_COMPANY"
                                ? "rgba(16, 185, 129, 0.22)"
                                : sig.company_legitimacy_status === "VERIFIED_DECISION_MAKER"
                                  ? "rgba(59, 130, 246, 0.22)"
                                  : "rgba(148, 163, 184, 0.18)",
                            color:
                              sig.company_legitimacy_status === "VERIFIED_LIVE_COMPANY"
                                ? "#6ee7b7"
                                : sig.company_legitimacy_status === "VERIFIED_DECISION_MAKER"
                                  ? "#93c5fd"
                                  : "#e2e8f0",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
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
                              background: "rgba(16, 185, 129, 0.18)",
                              color: "#6ee7b7",
                              border: "1px solid rgba(52, 211, 153, 0.35)",
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
                              background: "rgba(168, 85, 247, 0.20)",
                              color: "#e9d5ff",
                              border: "1px solid rgba(192, 132, 252, 0.3)",
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
                              background: "rgba(245, 158, 11, 0.20)",
                              color: "#fde68a",
                              border: "1px solid rgba(251, 191, 36, 0.35)",
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

                      {/* VERIFICATION LINKS, WEBSITE, EMAIL ID & PHONE NUMBER PANEL (Frosted Glass) */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: "10px",
                          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.58), rgba(2, 6, 23, 0.48))",
                          backdropFilter: "blur(14px)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.10)",
                          borderRadius: "12px",
                          padding: "12px 15px",
                          marginBottom: "10px",
                          fontSize: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 800, color: "#7dd3fc", letterSpacing: "0.04em", marginBottom: "3px" }}>
                            🔗 LINKEDIN / SOURCE VERIFICATION LINK
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <a
                              href={sig.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#bae6fd", fontWeight: 700, textDecoration: "underline", wordBreak: "break-all" }}
                            >
                              {sig.post_url} ↗
                            </a>
                            {sig.author_profile_url && sig.author_profile_url !== sig.post_url && (
                              <a
                                href={sig.author_profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#e2e8f0", fontSize: "11px", textDecoration: "underline", wordBreak: "break-all" }}
                              >
                                👤 Author Profile: {sig.author_profile_url} ↗
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 800, color: "#6ee7b7", letterSpacing: "0.04em", marginBottom: "3px" }}>
                            🌐 COMPANY &amp; WEBSITE LINK
                          </div>
                          <div style={{ color: "#f1f5f9" }}>
                            {sig.company_name ? <strong style={{ display: "block", marginBottom: "2px" }}>{sig.company_name}</strong> : null}
                            {sig.company_domain ? (
                              <a
                                href={`https://${sig.company_domain.replace(/^https?:\/\//, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#6ee7b7", fontWeight: 700, textDecoration: "underline", wordBreak: "break-all" }}
                              >
                                https://{sig.company_domain.replace(/^https?:\/\//, "")} ↗
                              </a>
                            ) : (
                              <span style={{ color: "#cbd5e1", fontSize: "11px" }}>No external website listed — verify via profile link</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fde68a", letterSpacing: "0.04em", marginBottom: "3px" }}>
                            📧 EMAIL ID &amp; 📞 PHONE / DIRECT CONTACT
                          </div>
                          <div style={{ color: "#fef08a", fontWeight: 600, wordBreak: "break-word", lineHeight: 1.45 }}>
                            {sig.contact_hint || "Direct Message via LinkedIn / Reddit Profile Link"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "14px",
                          color: "#f8fafc",
                          lineHeight: 1.68,
                          margin: "0 0 12px 0",
                          background: "rgba(2, 6, 23, 0.46)",
                          backdropFilter: "blur(12px)",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflow: "visible",
                          maxHeight: "none",
                        }}
                      >
                        {sig.post_text}
                      </div>

                      {sig.ai_reasoning && (
                        <div style={{ fontSize: "12px", color: "#bae6fd", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
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
                              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.55), rgba(2, 6, 23, 0.45))",
                              backdropFilter: "blur(12px)",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              borderRadius: "12px",
                              padding: "12px 14px",
                              marginTop: "8px",
                              fontSize: "12px",
                            }}
                          >
                            {breakdown && (
                              <div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#6ee7b7", marginBottom: "4px" }}>
                                  🎯 INTENT &amp; BUYING STAGE BREAKDOWN
                                </div>
                                <div style={{ color: "#f1f5f9", marginBottom: "3px" }}>
                                  <strong>Stage:</strong> {String(breakdown.buyingStage || "ACTIVE_SHORTLIST").replace(/_/g, " ")}
                                </div>
                                {Array.isArray(breakdown.painPointsDetected) && breakdown.painPointsDetected.length > 0 && (
                                  <div style={{ color: "#e2e8f0", marginBottom: "3px" }}>
                                    <strong>Pain Point:</strong> {breakdown.painPointsDetected.join(" • ")}
                                  </div>
                                )}
                                {breakdown.budgetOrScaleSignal && (
                                  <div style={{ color: "#fde68a" }}>
                                    <strong>Scale / Budget Signal:</strong> {breakdown.budgetOrScaleSignal}
                                  </div>
                                )}
                              </div>
                            )}

                            {playbook && (
                              <div>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "#7dd3fc", marginBottom: "4px" }}>
                                  🏢 COMPANY VALIDATION &amp; CONVERSION PLAYBOOK
                                </div>
                                {playbook.companyVerificationNote && (
                                  <div style={{ color: "#e2e8f0", marginBottom: "3px" }}>
                                    <strong>Legitimacy Check:</strong> {playbook.companyVerificationNote}
                                  </div>
                                )}
                                {playbook.recommendedHook && (
                                  <div style={{ color: "#f1f5f9", marginBottom: "3px" }}>
                                    <strong>Winning Angle:</strong> {playbook.recommendedHook}
                                  </div>
                                )}
                                {playbook.caseStudyToMention && (
                                  <div style={{ color: "#d8b4fe" }}>
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
                          background: "rgba(15, 23, 42, 0.46)",
                          backdropFilter: "blur(12px)",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
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
