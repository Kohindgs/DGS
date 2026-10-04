import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import mysql from "mysql2/promise";

const root = process.cwd();

function loadEnv(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnv(".env.local");
loadEnv(".env.production");
loadEnv(".env");

const registry = JSON.parse(fs.readFileSync(path.join(root, "data", "migration", "nextjs-route-registry.generated.json"), "utf8"));

function stripHtml(value) {
  return String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}
function parseContent(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch { return {}; }
}
function classifyRoute(route) {
  const p = String(route.path || "");
  if (p.startsWith("/services/")) return "service";
  if (/\/(mumbai|dubai|uae|india|pune|bangalore|delhi|location)/i.test(p)) return "location";
  if (route.wordpressType === "post" || p.startsWith("/blogs/")) return "blog";
  return "page";
}

const documents = (registry.routes || [])
  .filter((route) => route.indexable !== false && route.path && route.path !== "/404/")
  .map((route) => {
    const headings = Array.isArray(route.headings) ? route.headings.map((h) => h?.text).filter(Boolean).join(" ") : "";
    const faqs = Array.isArray(route.faqItems) ? route.faqItems.map((f) => `${f?.question || ""} ${f?.answer || ""}`).join(" ") : "";
    const kind = classifyRoute(route);
    const title = route.title || route.h1 || route.path;
    return {
      key: `route:${route.path}`, kind, path: route.path, title,
      description: route.description || null, category: kind, status: "published",
      sourceId: route.wordpressId ? String(route.wordpressId) : null,
      text: [title, route.h1, route.description, headings, faqs].filter(Boolean).join("\n"),
    };
  });

async function addBlogs() {
  let pool;
  if (process.env.DGS_DATABASE_URL || process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DGS_DATABASE_URL || process.env.DATABASE_URL);
  } else if (process.env.DGS_MYSQL_HOST && process.env.DGS_MYSQL_USER && process.env.DGS_MYSQL_DATABASE) {
    pool = mysql.createPool({
      host: process.env.DGS_MYSQL_HOST,
      port: Number(process.env.DGS_MYSQL_PORT || 3306),
      user: process.env.DGS_MYSQL_USER,
      password: process.env.DGS_MYSQL_PASSWORD || "",
      database: process.env.DGS_MYSQL_DATABASE,
    });
  } else {
    console.warn("No CMS database config found; indexing static routes only.");
    return;
  }
  try {
    const [rows] = await pool.query("SELECT id, slug, title, excerpt, content, status, category, focus_keyword FROM blog_posts WHERE deleted_at IS NULL");
    for (const row of rows) {
      const content = parseContent(row.content);
      const seo = content?.optimization?.seo || {};
      documents.push({
        key: `blog:${row.id}`, kind: "blog", path: `/blogs/${row.slug}/`,
        title: String(row.title || ""), description: row.excerpt || seo.description || null,
        category: row.category || "Blog", status: row.status || "draft", sourceId: String(row.id),
        text: [row.title, row.excerpt, row.focus_keyword, seo.focusKeyword,
          Array.isArray(seo.secondaryKeywords) ? seo.secondaryKeywords.join(" ") : seo.secondaryKeywords,
          stripHtml(content?.bodyHtml || "")].filter(Boolean).join("\n"),
      });
    }
  } catch (error) {
    console.warn(`CMS database unavailable; indexing static routes only (${error?.code || error?.message || "unknown error"}).`);
  } finally {
    await pool.end().catch(() => {});
  }
}

await addBlogs();

const python = process.env.DGS_TURBOVEC_PYTHON || (process.platform === "win32"
  ? path.join(root, ".venv-turbovec", "Scripts", "python.exe")
  : path.join(root, ".venv-turbovec", "bin", "python"));
const child = spawn(python, [path.join(root, "scripts", "turbovec-service.py")], {
  cwd: root,
  env: { ...process.env, DGS_SEMANTIC_EMBEDDING_MODEL: process.env.DGS_SEMANTIC_EMBEDDING_MODEL || "nomic-embed-text", DGS_SEMANTIC_OLLAMA_URL: process.env.DGS_SEMANTIC_OLLAMA_URL || "http://127.0.0.1:11434" },
  stdio: ["pipe", "pipe", "inherit"],
});
let output = "";
child.stdout.on("data", (chunk) => output += chunk.toString());
child.stdin.end(JSON.stringify({ command: "reindex", documents, bit_width: 4 }));
const code = await new Promise((resolve) => child.on("close", resolve));
if (code !== 0) process.exit(code || 1);
const result = JSON.parse(output || "{}");
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
