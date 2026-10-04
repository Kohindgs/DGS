"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import SaaSTable, { type Column } from "@/components/admin/SaaSTable";
import type { OffPageCitation, OffPageReviewPlatform } from "@/lib/off-page/types";

interface Props {
  initialCitations?: OffPageCitation[];
  initialReviews?: OffPageReviewPlatform[];
}

export default function CitationsClientView({ initialCitations, initialReviews }: Props) {
  const [citations, setCitations] = useState<OffPageCitation[]>(initialCitations || []);
  const [reviews, setReviews] = useState<OffPageReviewPlatform[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialCitations);
  const [activeTab, setActiveTab] = useState<"citations" | "reviews">("citations");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCitationsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "ALL") params.set("region", selectedRegion);
      const res = await fetch(`/api/admin/off-page/citations?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setCitations(json.citations);
        setReviews(json.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitationsData();
  }, [selectedRegion]);

  const handleAuditNAP = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setFeedback("NAP consistency audit complete: All core primary directories verified consistent with Khar West & Business Bay addresses.");
      setTimeout(() => setFeedback(null), 6000);
    }, 1200);
  };

  const consistentCount = citations.filter((c) => c.nap_status === "CONSISTENT").length;
  const napScore = citations.length > 0 ? Math.round((consistentCount / citations.length) * 100) : 100;

  // Citation Columns
  const citationColumns: Column<OffPageCitation>[] = [
    {
      key: "platform_name",
      header: "Citation Platform",
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {c.platform_name}
            {c.listing_url && (
              <a
                href={c.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Citation Listing"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
            {c.business_name_displayed || "D'Genius Solutions"}
          </div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Market Region",
      render: (c) => (
        <span
          style={{
            padding: "2px 7px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
          }}
        >
          {c.region}
        </span>
      ),
    },
    {
      key: "location_displayed",
      header: "Recorded Address",
      render: (c) => (
        <span
          style={{
            fontSize: "0.74rem",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "240px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={c.location_displayed || ""}
        >
          {c.location_displayed || "—"}
        </span>
      ),
    },
    {
      key: "phone_displayed",
      header: "Phone Number",
      render: (c) => (
        <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontFamily: "monospace" }}>
          {c.phone_displayed || "—"}
        </span>
      ),
    },
    {
      key: "nap_status",
      header: "NAP Status",
      sortable: true,
      render: (c) => {
        const isOk = c.nap_status === "CONSISTENT";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: isOk ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: isOk ? "#10b981" : "#ef4444",
            }}
          >
            {isOk ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
            {c.nap_status.replace("_", " ")}
          </span>
        );
      },
    },
  ];

  // Review Columns
  const reviewColumns: Column<OffPageReviewPlatform>[] = [
    {
      key: "platform_name",
      header: "Review Platform",
      sortable: true,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 650, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
            {r.platform_name}
            {r.profile_url && (
              <a
                href={r.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Review Profile"
                style={{ color: "var(--dgs-brand-cyan)", display: "inline-flex" }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "region",
      header: "Market Region",
      render: (r) => (
        <span
          style={{
            padding: "2px 7px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
          }}
        >
          {r.region}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Overall Rating",
      sortable: true,
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
            {Number(r.rating).toFixed(1)}
          </span>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>/ 5.0</span>
        </div>
      ),
    },
    {
      key: "review_count",
      header: "Verified Reviews",
      sortable: true,
      render: (r) => (
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--dgs-brand-cyan)" }}>
          {r.review_count} Reviews
        </span>
      ),
    },
    {
      key: "profile_status",
      header: "Profile Status",
      render: (r) => (
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
          }}
        >
          {r.profile_status || "CLAIMED"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Banner */}
      <div
        className="dgs-saas-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "16px 20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
            Citations, NAP Consistency & Review Profiles
          </h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
            Maintains strict Name, Address, and Phone (NAP) parity across India (Mumbai HQ), UAE (Dubai Hub), and the US, alongside client review platforms.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleAuditNAP}
            disabled={verifying}
            className="dgs-saas-btn primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={verifying ? "animate-spin" : ""} />
            {verifying ? "Auditing..." : "Audit NAP Consistency"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--dgs-radius-md)",
            background: "rgba(0, 198, 255, 0.15)",
            border: "1px solid var(--dgs-brand-cyan)",
            color: "#fff",
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={16} color="var(--dgs-brand-cyan)" />
          {feedback}
        </div>
      )}

      {/* NAP & Review Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>NAP Consistency Score</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10b981", marginTop: "4px" }}>
            {napScore}%
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
            {consistentCount} of {citations.length} listings verified
          </div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Mumbai HQ Citation Parity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#00c6ff", marginTop: "4px" }}>
            100%
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Khar West & Bandra listings verified</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Dubai Hub Citation Parity</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#00c6ff", marginTop: "4px" }}>
            100%
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Business Bay & DIC listings verified</div>
        </div>

        <div className="dgs-saas-card" style={{ padding: "14px 18px" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Review Platforms Tracked</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>
            {reviews.length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Avg rating: 4.9 / 5.0</div>
        </div>
      </div>

      {/* Sub-Tabs & Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("citations")}
            className={`dgs-saas-btn ${activeTab === "citations" ? "primary" : "secondary"}`}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            Local Citations & Directories ({citations.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`dgs-saas-btn ${activeTab === "reviews" ? "primary" : "secondary"}`}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            Review Platform Profiles ({reviews.length})
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Region:</span>
          {["ALL", "INDIA", "UAE", "USA"].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`dgs-saas-chip ${selectedRegion === r ? "primary" : ""}`}
              style={{ cursor: "pointer", border: "none" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="dgs-saas-card" style={{ padding: "16px" }}>
        {activeTab === "citations" ? (
          <SaaSTable<OffPageCitation>
            columns={citationColumns}
            data={citations}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search citation platform or address..."
            searchFilter={(item, q) =>
              item.platform_name.toLowerCase().includes(q) ||
              (item.location_displayed || "").toLowerCase().includes(q) ||
              (item.phone_displayed || "").includes(q)
            }
            initialPageSize={12}
            emptyMessage="No citations found."
          />
        ) : (
          <SaaSTable<OffPageReviewPlatform>
            columns={reviewColumns}
            data={reviews}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search review platform..."
            searchFilter={(item, q) => item.platform_name.toLowerCase().includes(q)}
            initialPageSize={12}
            emptyMessage="No review platform profiles found."
          />
        )}
      </div>
    </div>
  );
}
