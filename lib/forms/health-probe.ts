import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";
import { listApprovedForms, getFormDefinitionById } from "./registry";
import { getFormEventName } from "./analytics";

export type FormHealthMetric = {
  key: string;
  fluentFormId: number;
  title: string;
  sourceRoutes: string[];
  status: "HEALTHY" | "DEGRADED" | "FAILED";
  fieldCount: number;
  captchaEnabled: boolean;
  notificationDestination: string;
  analyticsEvent: string;
  totalSubmissions: number;
  submissions24h: number;
  submissions7d: number;
  lastSubmissionAt: string | null;
  issues: string[];
};

export type FormHealthProbeResult = {
  timestamp: string;
  overallStatus: "HEALTHY" | "DEGRADED" | "FAILED";
  totalForms: number;
  healthyCount: number;
  degradedCount: number;
  failedCount: number;
  forms: FormHealthMetric[];
  dbConfigured: boolean;
  smtpConfigured: boolean;
};

export async function runFormHealthProbe(): Promise<FormHealthProbeResult> {
  const timestamp = new Date().toISOString();
  const approvedForms = listApprovedForms();
  const dbConfigured = isCmsDatabaseConfigured();
  const smtpConfigured = Boolean(
    process.env.DGS_SMTP_HOST && process.env.DGS_SMTP_USER && process.env.DGS_SMTP_PASS,
  );
  const defaultRecipient =
    process.env.DGS_FORM_NOTIFICATION_TO || "business@dgeniussolutions.com";

  // Fetch submission stats per form key from database if available
  const statsMap = new Map<
    string,
    { total: number; count24h: number; count7d: number; lastAt: string | null }
  >();

  if (dbConfigured) {
    try {
      const { rows } = await cmsQuery<{
        form_key: string;
        total_count: number;
        count_24h: number;
        count_7d: number;
        last_at: string | null;
      }>(`
        SELECT 
          form_key,
          COUNT(*) as total_count,
          SUM(CASE WHEN created_at >= NOW() - INTERVAL 1 DAY THEN 1 ELSE 0 END) as count_24h,
          SUM(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) as count_7d,
          MAX(created_at) as last_at
        FROM form_submissions
        GROUP BY form_key
      `);

      for (const row of rows) {
        statsMap.set(row.form_key, {
          total: Number(row.total_count) || 0,
          count24h: Number(row.count_24h) || 0,
          count7d: Number(row.count_7d) || 0,
          lastAt: row.last_at ? new Date(row.last_at).toISOString() : null,
        });
      }
    } catch (err) {
      console.warn("Could not query form_submissions stats:", err);
    }
  }

  const results: FormHealthMetric[] = [];

  for (const form of approvedForms) {
    const issues: string[] = [];
    const stats = statsMap.get(form.key) || {
      total: 0,
      count24h: 0,
      count7d: 0,
      lastAt: null,
    };

    if (!form.activationEnabled) {
      issues.push("Activation is disabled in approved definitions");
    }

    const visibleFields = form.fields.filter((f) => !f.hidden && f.type !== "captcha");
    if (visibleFields.length === 0) {
      issues.push("No visible fields defined");
    }

    const routes = form.sourceRoutes || (form.sourceRoute ? [form.sourceRoute] : []);
    if (routes.length === 0) {
      issues.push("No routes mapped to this form");
    }

    let status: "HEALTHY" | "DEGRADED" | "FAILED" = "HEALTHY";
    if (issues.length > 0 || !dbConfigured) {
      status = "FAILED";
    } else if (!smtpConfigured) {
      status = "DEGRADED";
    }

    const primaryRoute = routes[0] || "/";
    const notificationDest =
      form.key === "fluentform-15" || primaryRoute.includes("/career")
        ? process.env.DGS_CAREER_NOTIFICATION_TO || "hr@dgeniussolutions.com"
        : defaultRecipient;

    results.push({
      key: form.key,
      fluentFormId: form.fluentFormId,
      title: form.title,
      sourceRoutes: routes,
      status,
      fieldCount: visibleFields.length,
      captchaEnabled: Boolean(form.captcha?.enabled),
      notificationDestination: notificationDest,
      analyticsEvent: getFormEventName(form.fluentFormId, primaryRoute),
      totalSubmissions: stats.total,
      submissions24h: stats.count24h,
      submissions7d: stats.count7d,
      lastSubmissionAt: stats.lastAt,
      issues,
    });
  }

  const healthyCount = results.filter((r) => r.status === "HEALTHY").length;
  const degradedCount = results.filter((r) => r.status === "DEGRADED").length;
  const failedCount = results.filter((r) => r.status === "FAILED").length;

  let overallStatus: "HEALTHY" | "DEGRADED" | "FAILED" = "HEALTHY";
  if (failedCount > 0) overallStatus = "FAILED";
  else if (degradedCount > 0) overallStatus = "DEGRADED";

  return {
    timestamp,
    overallStatus,
    totalForms: results.length,
    healthyCount,
    degradedCount,
    failedCount,
    forms: results,
    dbConfigured,
    smtpConfigured,
  };
}
