import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession, isAdminAuthConfigured } from "@/lib/cms/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (await hasAdminSession()) redirect("/admin/");

  const { error } = await searchParams;
  const configured = isAdminAuthConfigured();
  const message = !configured
    ? "Admin authentication is not configured."
    : error === "invalid"
      ? "Invalid email or password."
      : error === "unavailable"
        ? "Admin login is unavailable."
        : "";

  return (
    <main className="dgs-admin-shell dgs-admin-login-shell">
      {/* 2026 Ambient DGS Brand Light Backdrop */}
      <div className="dgs-ambient-canvas" aria-hidden="true">
        <div className="dgs-ambient-glow-tl" />
        <div className="dgs-ambient-glow-tr" />
        <div className="dgs-ambient-glow-b" />
      </div>

      <section className="dgs-admin-login-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: "18px" }}>
          <Image
            src="/images/brand/dgs-logo-trimmed.png"
            alt="D'Genius Solutions Logo"
            width={160}
            height={86}
            priority
            style={{
              display: "block",
              width: "auto",
              height: "auto",
              maxWidth: "160px",
              maxHeight: "44px",
              objectFit: "contain",
              objectPosition: "left center",
            }}
          />
        </div>

        <p className="dgs-admin-kicker" style={{ margin: "0 0 4px 0", color: "var(--dgs-brand-cyan)", fontWeight: 650 }}>
          {"D'Genius Solutions"}
        </p>
        <h1 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
          DGS Operations OS
        </h1>
        <p style={{ margin: 0, fontSize: "13.5px", color: "var(--dgs-text-muted)" }}>
          Sign in to the native administration workspace.
        </p>

        {message ? (
          <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.28)", color: "#FCA5A5", fontSize: "13px" }}>
            {message}
          </div>
        ) : null}

        <form action="/api/admin/session" method="post" className="dgs-admin-login-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              disabled={!configured}
              placeholder="admin@dgeniussolutions.com"
              style={{
                background: "var(--dgs-bg-input)",
                border: "1px solid var(--dgs-border)",
                borderRadius: "var(--dgs-radius-sm)",
                color: "var(--dgs-text-primary)",
                padding: "0 14px",
                height: "40px",
                outline: "none",
              }}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={!configured}
              placeholder="••••••••••••"
              style={{
                background: "var(--dgs-bg-input)",
                border: "1px solid var(--dgs-border)",
                borderRadius: "var(--dgs-radius-sm)",
                color: "var(--dgs-text-primary)",
                padding: "0 14px",
                height: "40px",
                outline: "none",
              }}
            />
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="dgs-saas-btn primary"
            style={{ width: "100%", height: "42px", marginTop: "8px", fontSize: "14px", fontWeight: 600 }}
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
