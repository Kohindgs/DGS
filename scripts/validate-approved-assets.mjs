#!/usr/bin/env node
import { validateApprovedAssetsOffline } from "./lib/approved-assets.mjs";

const ROOT = process.cwd();
const result = await validateApprovedAssetsOffline(ROOT);

if (result.ok) {
  console.log("PASS — APPROVED ASSETS");
  console.log(JSON.stringify({ ok: true }, null, 2));
  process.exit(0);
}

console.error("FAIL — APPROVED ASSETS");
console.error(JSON.stringify({ ok: false, issues: result.issues }, null, 2));
process.exit(1);
