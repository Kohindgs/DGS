import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dgs_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  return process.env.DGS_ADMIN_SESSION_SECRET || "";
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.DGS_ADMIN_EMAIL &&
    process.env.DGS_ADMIN_PASSWORD &&
    getSessionSecret(),
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createAdminSessionToken(email: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function verifyAdminSessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !getSessionSecret()) return false;

  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return parsed.email === process.env.DGS_ADMIN_EMAIL && parsed.expires > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function hasLegacyAdminSession() {
  if (!isAdminAuthConfigured()) return false;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function hasAdminSession() {
  try {
    const { getCurrentCmsUser } = await import("./auth-db");
    const dbUser = await getCurrentCmsUser();
    if (dbUser && (dbUser.is_active === 1 || dbUser.is_active === true)) {
      return true;
    }
  } catch {}

  return hasLegacyAdminSession();
}

export const adminSessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_TTL_SECONDS,
};

function safeEqualText(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function validateAdminCredentials(email: string, password: string) {
  if (!isAdminAuthConfigured()) return false;
  return safeEqualText(email.trim().toLowerCase(), process.env.DGS_ADMIN_EMAIL!.trim().toLowerCase())
    && safeEqualText(password, process.env.DGS_ADMIN_PASSWORD!);
}

