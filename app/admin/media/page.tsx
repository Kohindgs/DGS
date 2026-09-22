import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/cms/auth";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listMediaAssets, getMediaStorageStats } from "@/lib/cms/media";
import MediaLibraryView from "./MediaLibraryView";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  if (process.env.DGS_ADMIN_ENABLED !== "true") notFound();
  if (!(await hasAdminSession())) redirect("/admin/login/");

  const dbReady = isCmsDatabaseConfigured();
  const [initialData, stats] = dbReady
    ? await Promise.all([listMediaAssets({ limit: 24 }), getMediaStorageStats()])
    : [{ assets: [], total: 0, page: 1, limit: 24, totalPages: 0 }, null];

  return (
    <main className="dgs-admin-shell">
      <header className="dgs-admin-header">
        <div>
          <p className="dgs-admin-kicker">DGS CMS · Assets</p>
          <h1>Media Library</h1>
          <p>
            Central repository for website images, videos, portfolio media, and service page assets with automatic visually lossless WebP/WebM conversion.
          </p>
        </div>
        <div className="dgs-admin-header-actions">
          <span className={dbReady ? "dgs-admin-badge ready" : "dgs-admin-badge"}>
            {dbReady ? "Database configured" : "Database not configured"}
          </span>
          <Link href="/admin/">Back to CMS</Link>
        </div>
      </header>

      {!dbReady ? (
        <section className="dgs-admin-status">
          <h2>Database setup required</h2>
          <p>The Media CMS requires database configuration to store asset records and track usage.</p>
        </section>
      ) : (
        <MediaLibraryView
          initialAssets={initialData.assets}
          initialTotal={initialData.total}
          initialStats={stats}
        />
      )}
    </main>
  );
}
