import { hasAdminSession } from "@/lib/cms/auth";
import { getCurrentCmsUser, hasPermission } from "@/lib/cms/auth-db";
import { isCmsDatabaseConfigured } from "@/lib/cms/db";

export async function authorizeSemanticAdmin(action: "view" | "edit" = "view") {
  if (process.env.DGS_ADMIN_ENABLED !== "true") return { ok: false as const, status: 404, user: null };
  if (!(await hasAdminSession())) return { ok: false as const, status: 401, user: null };
  if (!isCmsDatabaseConfigured()) return { ok: false as const, status: 503, user: null };
  const user = await getCurrentCmsUser();
  if (!user || !hasPermission(user.role, "blogs", action)) {
    return { ok: false as const, status: 403, user: null };
  }
  return { ok: true as const, status: 200, user };
}
