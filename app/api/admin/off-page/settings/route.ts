import { NextResponse } from "next/server";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { cmsExecute, cmsQuery } from "@/lib/cms/db";
import { ensureOffPageTablesExist } from "@/lib/off-page/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  const { rows } = await cmsQuery<{ key_name: string; key_value: string; description: string }>(
    `SELECT * FROM off_page_settings`
  );

  const defaults: Record<string, string> = {
    daily_discovery_enabled: "true",
    auto_revalidation_enabled: "true",
    spam_risk_threshold: "40",
    exact_match_alert_pct: "20",
    default_outreach_followup_days: "5",
    primary_regions: "INDIA,UAE,USA",
    free_only_enforcement: "true",
    primary_monitored_domain: "dgeniussolutions.com",
    monitored_domain_aliases: "www.dgeniussolutions.com",
    monitored_brand_name: "D'Genius Solutions",
  };

  const settingsMap: Record<string, string> = { ...defaults };
  for (const r of rows) {
    settingsMap[r.key_name] = r.key_value;
  }

  return NextResponse.json({ ok: true, settings: settingsMap });
}

export async function PUT(req: Request) {
  const currentUser = await getCurrentCmsUser();
  if (!currentUser || !hasPermission(currentUser.role, "off_page", "manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ensureOffPageTablesExist();

  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      const { rows } = await cmsQuery<{ id: string }>(`SELECT id FROM off_page_settings WHERE key_name = ? LIMIT 1`, [key]);
      if (rows.length > 0) {
        await cmsExecute(`UPDATE off_page_settings SET key_value = ?, updated_at = NOW() WHERE key_name = ?`, [String(value), key]);
      } else {
        await cmsExecute(
          `INSERT INTO off_page_settings (id, key_name, key_value, updated_at) VALUES (?, ?, ?, NOW())`,
          [`set_${key}`.slice(0, 64), key, String(value)]
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed saving settings:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
