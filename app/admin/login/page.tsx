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
      <section className="dgs-admin-login-card">
        <p className="dgs-admin-kicker">D&apos;Genius Solutions</p>
        <h1>DGS CMS</h1>
        <p>Sign in to the native administration workspace.</p>
        {message ? <p className="dgs-admin-login-message">{message}</p> : null}
        <form action="/api/admin/session" method="post" className="dgs-admin-login-form">
          <label>
            <span>Email</span>
            <input type="email" name="email" autoComplete="username" required disabled={!configured} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" autoComplete="current-password" required disabled={!configured} />
          </label>
          <button type="submit" disabled={!configured}>Sign in</button>
        </form>
      </section>
    </main>
  );
}
