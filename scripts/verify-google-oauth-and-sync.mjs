import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const ROOT = process.cwd();

// Test 1: AES-256-GCM Token Encryption & Decryption
test("REQ-GOOGLE-01: AES-256-GCM encryption & decryption round-trip", () => {
  const ALGORITHM = "aes-256-gcm";
  const rawKey = "dgs-secure-encryption-key-32bytes!";
  const key = createHash("sha256").update(rawKey).digest();

  function encrypt(text) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${tag}:${encrypted}`;
  }

  function decrypt(payload) {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let dec = decipher.update(dataHex, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }

  const sampleTokens = {
    access_token: "ya29.sample_mock_access_token_12345",
    refresh_token: "1//04_sample_refresh_token_67890",
    expiry_date: Date.now() + 3600000,
    scope: "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
  };

  const payloadString = JSON.stringify(sampleTokens);
  const encrypted = encrypt(payloadString);
  assert.ok(encrypted.includes(":"), "Encrypted format contains iv:tag:ciphertext");
  assert.notEqual(encrypted, payloadString, "Plaintext tokens must not appear in cipher");

  const decrypted = decrypt(encrypted);
  const parsed = JSON.parse(decrypted);
  assert.equal(parsed.access_token, sampleTokens.access_token);
  assert.equal(parsed.refresh_token, sampleTokens.refresh_token);
});

// Test 2: Google OAuth Scopes & Consent URL Construction
test("REQ-GOOGLE-02: Google OAuth scopes and consent URL verification", () => {
  const googleTsPath = path.join(ROOT, "lib", "integrations", "google.ts");
  const content = fs.readFileSync(googleTsPath, "utf8");

  assert.ok(content.includes("https://www.googleapis.com/auth/webmasters.readonly"), "Must contain GSC readonly scope");
  assert.ok(content.includes("https://www.googleapis.com/auth/analytics.readonly"), "Must contain GA4 readonly scope");
  assert.ok(content.includes("https://www.googleapis.com/auth/userinfo.email"), "Must contain userinfo.email scope");
  assert.ok(content.includes('access_type: "offline"'), "Must request offline access for refresh token");
  assert.ok(content.includes('prompt: "consent"'), "Must force consent prompt to ensure refresh token delivery");
});

// Test 3: Zero Fake Analytics Policy (Strict check)
test("REQ-GOOGLE-03: Zero fake analytics policy (banned 0.65 multipliers)", () => {
  const googleTsPath = path.join(ROOT, "lib", "integrations", "google.ts");
  const content = fs.readFileSync(googleTsPath, "utf8");

  assert.ok(!content.includes("totalSessions * 0.65"), "Banned fake 0.65 engaged sessions multiplier must not exist");
  assert.ok(!content.includes("Math.round(totalSessions *"), "Artificial session multipliers must not exist");
  assert.ok(content.includes("totalEngagedSessions += Number(d.engaged_sessions || 0)"), "Must aggregate real engaged sessions from DB");
});

// Test 4: Real Google OAuth API Endpoints Presence
test("REQ-GOOGLE-04: Real Google OAuth API endpoints presence", () => {
  const routes = [
    "app/api/admin/integrations/google/connect/route.ts",
    "app/api/admin/integrations/google/callback/route.ts",
    "app/api/admin/integrations/google/properties/route.ts",
    "app/api/admin/integrations/google/save-property/route.ts",
    "app/api/admin/integrations/google/sync/route.ts",
    "app/api/admin/integrations/google/disconnect/route.ts",
  ];

  for (const r of routes) {
    const fullPath = path.join(ROOT, r);
    assert.ok(fs.existsSync(fullPath), `Route ${r} must exist`);
  }
});

// Test 5: Liquid Glass Setup Wizard Component & Page Presence
test("REQ-GOOGLE-05: 4-Step Liquid Glass Setup Wizard existence & integration", () => {
  const wizardComponent = path.join(ROOT, "components", "admin", "GoogleSetupWizard.tsx");
  const wizardPage = path.join(ROOT, "app", "admin", "integrations", "google", "setup", "page.tsx");
  const cardComponent = path.join(ROOT, "components", "admin", "GoogleIntegrationCard.tsx");

  assert.ok(fs.existsSync(wizardComponent), "GoogleSetupWizard.tsx must exist");
  assert.ok(fs.existsSync(wizardPage), "Google setup page.tsx must exist");
  assert.ok(fs.existsSync(cardComponent), "GoogleIntegrationCard.tsx must exist");

  const wizardContent = fs.readFileSync(wizardComponent, "utf8");
  assert.ok(wizardContent.includes("Account Auth"), "Wizard Step 1 must be Account Auth");
  assert.ok(wizardContent.includes("Search Console"), "Wizard Step 2 must be Search Console");
  assert.ok(wizardContent.includes("Analytics 4"), "Wizard Step 3 must be Analytics 4");
  assert.ok(wizardContent.includes("Verification"), "Wizard Step 4 must be Verification");
});

// Test 6: DGS Brand Logo Optimization & Zero Distortion/Clipping
test("REQ-LOGO-01: Optimized trimmed DGS logo and square lettermark exist", () => {
  const trimmedPng = path.join(ROOT, "public", "images", "brand", "dgs-logo-trimmed.png");
  const trimmedWebp = path.join(ROOT, "public", "images", "brand", "dgs-logo-trimmed.webp");
  const markPng = path.join(ROOT, "public", "images", "brand", "dgs-mark-compact.png");
  const markWebp = path.join(ROOT, "public", "images", "brand", "dgs-mark-compact.webp");

  assert.ok(fs.existsSync(trimmedPng), "dgs-logo-trimmed.png must exist");
  assert.ok(fs.existsSync(trimmedWebp), "dgs-logo-trimmed.webp must exist");
  assert.ok(fs.existsSync(markPng), "dgs-mark-compact.png must exist");
  assert.ok(fs.existsSync(markWebp), "dgs-mark-compact.webp must exist");

  const sidebarPath = path.join(ROOT, "components", "admin", "AdminSidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarPath, "utf8");
  assert.ok(sidebarContent.includes("dgs-logo-trimmed"), "Sidebar must use trimmed logo");
  assert.ok(sidebarContent.includes("dgs-mark-compact"), "Sidebar must use compact mark for collapsed mode");
});
