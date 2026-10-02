const adminRoutes = [
  "/admin/",
  "/admin/activity-log/",
  "/admin/analytics/",
  "/admin/applications/",
  "/admin/assessment/",
  "/admin/blogs/",
  "/admin/careers/",
  "/admin/forms/",
  "/admin/google-updates/",
  "/admin/hr-pipeline/",
  "/admin/integrations/",
  "/admin/leads/",
  "/admin/media/",
  "/admin/portfolio/",
  "/admin/search-console/",
  "/admin/search-updates/",
  "/admin/seo/",
  "/admin/seo/approvals/",
  "/admin/seo/keywords/",
  "/admin/seo/pages/",
  "/admin/settings/",
  "/admin/site-audits/",
  "/admin/users/"
];

async function checkAdminRoutes() {
  console.log("=== CHECKING ALL ADMIN SIDEBAR ROUTES FOR 404s ===");
  let errorCount = 0;
  for (const r of adminRoutes) {
    const res = await fetch(`https://www.dgeniussolutions.com${r}`, { redirect: "manual" });
    const status = res.status;
    const isOk = status === 200 || (status >= 300 && status < 400);
    if (!isOk) {
      console.log(`❌ FAIL: ${r} -> HTTP ${status}`);
      errorCount++;
    } else {
      console.log(`✓ OK: ${r} -> HTTP ${status}`);
    }
  }
  console.log(`\nADMIN_MENU_404S = ${errorCount}`);
}

checkAdminRoutes();
