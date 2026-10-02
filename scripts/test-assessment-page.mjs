import fs from "node:fs";
import { execSync } from "node:child_process";

async function test() {
  const loginOut = execSync("node scripts/test-cms-session.mjs").toString();
  const match = loginOut.match(/dgs_cms_session=([^;]+)/);
  if (!match) throw new Error("No cookie found from login");
  const cookie = "dgs_cms_session=" + match[1];
  console.log("Got cookie:", cookie.substring(0, 35) + "...");

  const res = await fetch("https://www.dgeniussolutions.com/admin/assessment/", {
    headers: { "Cookie": cookie }
  });
  console.log("Assessment page HTTP status:", res.status);
  const html = await res.text();
  console.log("HTML length:", html.length);
  console.log("Includes 'Assessment':", html.includes("Assessment"));
  console.log("Includes 'Make an Assessment':", /make\s+an?\s+assessment/i.test(html));
  console.log("Includes 'Create Job Description':", /create\s+job\s+description/i.test(html));
  console.log("Includes 'Generate Test':", /generate\s+test/i.test(html));
  console.log("Includes 'Test Gemini AI Connection':", /test\s+gemini/i.test(html));
}

test().catch(console.error);
