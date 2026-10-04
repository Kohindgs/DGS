import { spawn } from "node:child_process";
import path from "node:path";
import registryData from "@/data/migration/nextjs-route-registry.generated.json";
import { cmsQuery, isCmsDatabaseConfigured } from "@/lib/cms/db";

export type SemanticDocumentKind = "page" | "service" | "location" | "blog";

export type SemanticSearchResult = {
  key: string;
  kind: SemanticDocumentKind | string;
  path: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  sourceId?: string | null;
  score: number;
};

export type SemanticStatus = {
  ok: boolean;
  available: boolean;
  engine?: string;
  model?: string;
  documents?: number;
  dimension?: number | null;
  message?: string;
  code?: string;
};

type SemanticDocument = Omit<SemanticSearchResult, "score"> & { text: string };
type PythonResponse = SemanticStatus & { indexed?: number; results?: SemanticSearchResult[] };

export function isSemanticIntelligenceEnabled() {
  return process.env.DGS_SEMANTIC_ENABLED === "true";
}

function pythonExecutable() {
  if (process.env.DGS_TURBOVEC_PYTHON) return process.env.DGS_TURBOVEC_PYTHON;
  return process.platform === "win32"
    ? path.join(process.cwd(), ".venv-turbovec", "Scripts", "python.exe")
    : path.join(process.cwd(), ".venv-turbovec", "bin", "python");
}

function semanticRequest<T extends PythonResponse>(payload: Record<string, unknown>): Promise<T> {
  if (!isSemanticIntelligenceEnabled()) {
    return Promise.resolve({
      ok: false,
      available: false,
      code: "SEMANTIC_DISABLED",
      message: "Semantic intelligence is disabled.",
    } as T);
  }

  return new Promise((resolve) => {
    const child = spawn(/* turbopackIgnore: true */ pythonExecutable(), [path.join(process.cwd(), "scripts", "turbovec-service.py")], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DGS_SEMANTIC_EMBEDDING_MODEL: process.env.DGS_SEMANTIC_EMBEDDING_MODEL || "nomic-embed-text",
        DGS_SEMANTIC_OLLAMA_URL: process.env.DGS_SEMANTIC_OLLAMA_URL || "http://127.0.0.1:11434",
      },
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    const timer = setTimeout(() => {
      child.kill();
      finish({
        ok: false,
        available: false,
        code: "SEMANTIC_TIMEOUT",
        message: "TurboVec semantic request timed out.",
      } as T);
    }, 130_000);

    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", (error) =>
      finish({
        ok: false,
        available: false,
        code: "SEMANTIC_PROCESS_ERROR",
        message: error.message,
      } as T)
    );
    child.on("close", () => {
      try {
        finish(JSON.parse(stdout || "{}") as T);
      } catch {
        finish({
          ok: false,
          available: false,
          code: "SEMANTIC_INVALID_RESPONSE",
          message: stderr || stdout || "TurboVec returned no response.",
        } as T);
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseContent(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, any>;
  if (typeof value !== "string") return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function classifyRoute(route: any): SemanticDocumentKind {
  const routePath = String(route.path || "");
  if (routePath.startsWith("/services/")) return "service";
  if (/\/(mumbai|dubai|uae|india|pune|bangalore|delhi|location)/i.test(routePath)) return "location";
  if (route.wordpressType === "post" || routePath.startsWith("/blogs/")) return "blog";
  return "page";
}

function staticCorpus(): SemanticDocument[] {
  return (registryData.routes || [])
    .filter((route: any) => route.indexable !== false && route.path && route.path !== "/404/")
    .map((route: any) => {
      const headings = Array.isArray(route.headings)
        ? route.headings.map((heading: any) => heading?.text).filter(Boolean).join(" ")
        : "";
      const faqs = Array.isArray(route.faqItems)
        ? route.faqItems.map((item: any) => `${item?.question || ""} ${item?.answer || ""}`).join(" ")
        : "";
      const title = route.title || route.h1 || route.path;
      const description = route.description || null;
      const kind = classifyRoute(route);
      return {
        key: `route:${route.path}`,
        kind,
        path: route.path,
        title,
        description,
        category: kind,
        status: "published",
        sourceId: route.wordpressId ? String(route.wordpressId) : null,
        text: [title, route.h1, description, headings, faqs].filter(Boolean).join("\n"),
      };
    });
}

async function blogCorpus(): Promise<SemanticDocument[]> {
  if (!isCmsDatabaseConfigured()) return [];

  const result = await cmsQuery<any>(
    `SELECT id, slug, title, excerpt, content, status, category, focus_keyword
       FROM blog_posts
      WHERE deleted_at IS NULL`
  );

  return result.rows.map((row: any) => {
    const content = parseContent(row.content);
    const seo = content?.optimization?.seo || {};
    const body = stripHtml(String(content?.bodyHtml || ""));
    const title = String(row.title || "");
    return {
      key: `blog:${row.id}`,
      kind: "blog",
      path: `/blogs/${row.slug}/`,
      title,
      description: row.excerpt || seo.description || null,
      category: row.category || "Blog",
      status: row.status || "draft",
      sourceId: String(row.id),
      text: [
        title,
        row.excerpt,
        row.focus_keyword,
        seo.focusKeyword,
        Array.isArray(seo.secondaryKeywords) ? seo.secondaryKeywords.join(" ") : seo.secondaryKeywords,
        body,
      ].filter(Boolean).join("\n"),
    };
  });
}

export async function getSemanticStatus(): Promise<SemanticStatus> {
  return semanticRequest<SemanticStatus>({ command: "status" });
}

export async function rebuildSemanticIndex() {
  if (!isSemanticIntelligenceEnabled()) return getSemanticStatus();
  const documents = [...staticCorpus(), ...(await blogCorpus())];
  return semanticRequest<PythonResponse>({ command: "reindex", documents, bit_width: 4 });
}

export async function semanticSearch(input: {
  query: string;
  k?: number;
  limit?: number;
  kinds?: string[];
  excludeKeys?: string[];
  minScore?: number;
}): Promise<{ available: boolean; results: SemanticSearchResult[]; message?: string; model?: string }> {
  const response = await semanticRequest<PythonResponse>({
    command: "search",
    query: input.query,
    k: input.k || Math.max((input.limit || 10) * 3, 20),
    limit: input.limit || 10,
    kinds: input.kinds || [],
    exclude_keys: input.excludeKeys || [],
    min_score: input.minScore ?? -1,
  });
  return {
    available: Boolean(response.available),
    results: response.results || [],
    message: response.message,
    model: response.model,
  };
}

export function semanticTextForBlog(blog: any) {
  const content = parseContent(blog?.content);
  const seo = content?.optimization?.seo || {};
  return [
    blog?.title,
    blog?.excerpt,
    blog?.focus_keyword,
    seo?.title,
    seo?.description,
    seo?.focusKeyword,
    Array.isArray(seo?.secondaryKeywords) ? seo.secondaryKeywords.join(" ") : seo?.secondaryKeywords,
    stripHtml(String(content?.bodyHtml || "")),
  ].filter(Boolean).join("\n");
}

export async function findSimilarContentForBlog(blog: any, limit = 8) {
  const text = semanticTextForBlog(blog);
  if (!text.trim()) return { available: false, results: [] as SemanticSearchResult[] };
  return semanticSearch({
    query: text,
    limit,
    k: Math.max(limit * 4, 24),
    excludeKeys: blog?.id ? [`blog:${blog.id}`] : [],
  });
}

export async function semanticInternalLinksForBlog(blog: any, limit = 5) {
  const search = await findSimilarContentForBlog(blog, 16);
  const bodyHtml = String(parseContent(blog?.content)?.bodyHtml || "");
  const currentPath = `/blogs/${blog?.slug || ""}/`;
  const results = search.results
    .filter((item) => item.path && item.path !== currentPath)
    .filter((item) => item.status === "published")
    .filter((item) => !bodyHtml.includes(item.path))
    .filter((item) => item.score >= 0.58)
    .slice(0, limit);
  return { available: search.available, results, model: search.model };
}

export async function semanticCannibalizationForBlog(blog: any) {
  const search = await findSimilarContentForBlog(blog, 12);
  const currentPath = `/blogs/${blog?.slug || ""}/`;
  const competitors = search.results
    .filter((item) => item.path !== currentPath)
    .filter((item) => item.status === "published")
    .filter((item) => item.score >= 0.72)
    .slice(0, 6);
  const highestScore = competitors[0]?.score || 0;
  const risk: "HIGH_OVERLAP" | "REVIEW" | "LOW" =
    highestScore >= 0.9 ? "HIGH_OVERLAP" :
    highestScore >= 0.8 ? "REVIEW" :
    "LOW";
  return { available: search.available, risk, highestScore, competitors, model: search.model };
}
