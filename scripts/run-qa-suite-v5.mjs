import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";

const SESSION_SECRET = "dgs-secret-qa-test-key-2026";
const ADMIN_EMAIL = "admin@dgeniussolutions.com";
const ADMIN_PASSWORD = "adminPassword123!";
const PORT = "3000";
const BASE_URL = `http://127.0.0.1:${PORT}`;

function waitForServer(url, timeoutMs = 45000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      const req = http.get(url, (res) => {
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Timeout waiting for server at ${url}`));
        } else {
          setTimeout(ping, 500);
        }
      });
    }
    ping();
  });
}

async function main() {
  console.log("Starting Next.js production server for V5 QA...");
  const server = spawn("cmd.exe", ["/c", "npx", "next", "start", "-p", PORT], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT,
      DGS_ADMIN_ENABLED: "true",
      DGS_ADMIN_EMAIL: ADMIN_EMAIL,
      DGS_ADMIN_PASSWORD: ADMIN_PASSWORD,
      DGS_ADMIN_SESSION_SECRET: SESSION_SECRET,
      NODE_OPTIONS: "--max-old-space-size=4096",
    },
    stdio: "inherit",
  });

  try {
    console.log(`Waiting for server to be ready at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    console.log("Server is ready! Running Playwright V5 Multi-Viewport Screenshot QA...");

    const { execSync } = await import("node:child_process");
    execSync(`node scripts/qa-v5-screenshots.mjs`, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        QA_BASE_URL: BASE_URL,
        DGS_ADMIN_EMAIL: ADMIN_EMAIL,
        DGS_ADMIN_SESSION_SECRET: SESSION_SECRET,
      },
      stdio: "inherit",
    });

    console.log("V5 Multi-Viewport Screenshot QA completed successfully!");
  } finally {
    console.log("Shutting down Next.js server...");
    try {
      const { execSync } = await import("node:child_process");
      execSync(`taskkill /F /T /PID ${server.pid}`, { stdio: "ignore" });
    } catch {}
  }
}

main().catch((err) => {
  console.error("V5 QA suite failed:", err);
  process.exit(1);
});
