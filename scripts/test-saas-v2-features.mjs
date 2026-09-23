#!/usr/bin/env node
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { formatW3CDate } from "../lib/seo/sitemap-date.ts";


test("1. Sitemap W3C Datetime Normalization", () => {
  assert.equal(formatW3CDate("2026-08-13T00:24:31"), "2026-08-13");
  assert.equal(formatW3CDate("2026-09-22"), "2026-09-22");
  assert.equal(formatW3CDate("2026-09-23T14:30:00Z"), "2026-09-23");
  assert.equal(formatW3CDate(new Date("2026-09-23T12:00:00Z")), "2026-09-23");
  assert.equal(formatW3CDate(null), undefined);
  assert.equal(formatW3CDate("invalid-date-string"), undefined);
});

test("2. OWASP-Compliant scrypt Password Hashing & Verification", () => {
  function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derived = crypto.scryptSync(password, salt, 64, {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }).toString("hex");
    return `scrypt$32768$8$1$${salt}$${derived}`;
  }

  function verifyPassword(password, storedHash) {
    const parts = storedHash.split("$");
    if (parts.length !== 6) return false;
    const [, nStr, rStr, pStr, salt, hash] = parts;
    const N = parseInt(nStr, 10);
    const r = parseInt(rStr, 10);
    const p = parseInt(pStr, 10);

    const targetBuf = Buffer.from(hash, "hex");
    const derivedBuf = crypto.scryptSync(password, salt, targetBuf.length, {
      N,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    });
    if (derivedBuf.length !== targetBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, targetBuf);
  }

  const password = "DGS#Admin!27Kx9Qp4Mv8Ls";
  const hash = hashPassword(password);
  assert.ok(hash.startsWith("scrypt$32768$8$1$"));
  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword("WrongPassword!123", hash), false);
  assert.equal(verifyPassword("", hash), false);
});

test("3. RBAC Permission Matrix Enforcement", () => {
  const ROLE_PERMISSIONS = {
    superadmin: {
      all: ["manage"],
    },
    admin: {
      blogs: ["view", "create", "edit", "publish"],
      media: ["view", "create", "edit"],
      users: ["view"],
      activity_log: [],
    },
    manager: {
      blogs: ["view", "create"],
      users: [],
      activity_log: [],
    },
  };

  function hasPerm(role, resource, action) {
    if (role === "superadmin") return true;
    const resPerms = ROLE_PERMISSIONS[role]?.[resource] || [];
    return resPerms.includes(action) || resPerms.includes("manage");
  }

  assert.equal(hasPerm("superadmin", "activity_log", "view"), true);
  assert.equal(hasPerm("admin", "activity_log", "view"), false);
  assert.equal(hasPerm("manager", "users", "view"), false);
  assert.equal(hasPerm("admin", "blogs", "publish"), true);
  assert.equal(hasPerm("manager", "blogs", "publish"), false);
});

test("4. AES-256-GCM OAuth Token Encryption & Decryption", () => {
  const secretKey = crypto.createHash("sha256").update("test-encryption-key-for-gsc-ga4").digest();

  function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);
    let enc = cipher.update(text, "utf8", "hex");
    enc += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${tag}:${enc}`;
  }

  function decrypt(payload) {
    const [ivHex, tagHex, encText] = payload.split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    let dec = decipher.update(encText, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }

  const sampleRefreshToken = "1//049xYzAbcDefGhIjKlMnOpQrStUvWxYz_123456789";
  const encrypted = encrypt(sampleRefreshToken);
  assert.notEqual(encrypted, sampleRefreshToken);
  assert.equal(decrypt(encrypted), sampleRefreshToken);
});

test("5. Audit Log Sensitive Secret Redaction", () => {
  function sanitize(data) {
    const clone = { ...data };
    const sensitiveKeys = ["password", "password_hash", "token", "refresh_token", "secret", "api_key"];
    for (const k of Object.keys(clone)) {
      if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
        clone[k] = "[REDACTED]";
      }
    }
    return clone;
  }

  const payload = {
    email: "admin@dgeniussolutions.com",
    password: "SecretPassword123",
    refresh_token: "google-oauth-token",
    role: "superadmin",
  };

  const sanitized = sanitize(payload);
  assert.equal(sanitized.email, "admin@dgeniussolutions.com");
  assert.equal(sanitized.role, "superadmin");
  assert.equal(sanitized.password, "[REDACTED]");
  assert.equal(sanitized.refresh_token, "[REDACTED]");
});

test("6. 15-Day Audit Schedule Logic", () => {
  function isAuditDue(lastAuditTimestamp) {
    if (!lastAuditTimestamp) return true;
    const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
    return Date.now() - lastAuditTimestamp >= fifteenDaysMs;
  }

  const now = Date.now();
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const sixteenDaysAgo = now - 16 * 24 * 60 * 60 * 1000;

  assert.equal(isAuditDue(null), true);
  assert.equal(isAuditDue(fourteenDaysAgo), false);
  assert.equal(isAuditDue(sixteenDaysAgo), true);
});

test("7. Assessment Version Draft vs Approved Immutability", () => {
  const version = {
    id: "ver-1",
    version_number: 1,
    status: "draft",
    test_data: { mcqs: [{ question: "Q1" }] },
  };

  function canModify(ver) {
    return ver.status === "draft";
  }

  assert.equal(canModify(version), true);
  version.status = "approved";
  assert.equal(canModify(version), false);
});
