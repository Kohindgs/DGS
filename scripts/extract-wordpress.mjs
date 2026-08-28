import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const WP_BASE = process.env.WP_REST_BASE_URL || "https://www.dgeniussolutions.com/wp-json/wp/v2";
const OUT_DIR = path.resolve("data/wordpress");

async function request(endpoint, params = {}) {
  const url = new URL(`${WP_BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`${url.pathname}: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function all(endpoint, fields) {
  const first = await request(endpoint, {
    per_page: 100,
    page: 1,
    context: "view",
    _fields: fields.join(","),
  });

  const firstItems = await first.json();
  const totalPages = Number(first.headers.get("x-wp-totalpages") || "1");
  const result = [...firstItems];

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await request(endpoint, {
      per_page: 100,
      page,
      context: "view",
      _fields: fields.join(","),
    });
    result.push(...(await response.json()));
  }

  return result;
}

function routePath(link) {
  try {
    return new URL(link).pathname;
  } catch {
    return link;
  }
}

await mkdir(path.join(OUT_DIR, "raw"), { recursive: true });
await mkdir(path.join(OUT_DIR, "inventory"), { recursive: true });

const contentFields = [
  "id",
  "slug",
  "link",
  "status",
  "date",
  "modified",
  "parent",
  "title",
  "content",
  "excerpt",
  "featured_media",
  "type",
  "meta",
];

const mediaFields = [
  "id",
  "source_url",
  "alt_text",
  "caption",
  "media_type",
  "mime_type",
  "date",
  "modified",
  "media_details",
  "sizes",
];

const [pages, services, posts, media] = await Promise.all([
  all("/pages", contentFields),
  all("/services", contentFields),
  all("/posts", contentFields),
  all("/media", mediaFields),
]);

const writeJson = (file, value) =>
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");

await Promise.all([
  writeJson(path.join(OUT_DIR, "raw/pages.json"), pages),
  writeJson(path.join(OUT_DIR, "raw/services.json"), services),
  writeJson(path.join(OUT_DIR, "raw/posts.json"), posts),
  writeJson(path.join(OUT_DIR, "raw/media.json"), media),
]);

const routes = [
  ...pages.map((item) => ({ id: item.id, type: "page", path: routePath(item.link), slug: item.slug, status: item.status, modified: item.modified })),
  ...services.map((item) => ({ id: item.id, type: "service", path: routePath(item.link), slug: item.slug, status: item.status, modified: item.modified })),
  ...posts.map((item) => ({ id: item.id, type: "post", path: routePath(item.link), slug: item.slug, status: item.status, modified: item.modified })),
].sort((a, b) => a.path.localeCompare(b.path));

await writeJson(path.join(OUT_DIR, "inventory/routes.json"), routes);
await writeJson(path.join(OUT_DIR, "inventory/summary.json"), {
  generatedAt: new Date().toISOString(),
  source: WP_BASE,
  totals: {
    pages: pages.length,
    services: services.length,
    posts: posts.length,
    media: media.length,
    routes: routes.length,
  },
});

console.log(`Extracted ${pages.length} pages, ${services.length} services, ${posts.length} posts and ${media.length} media records.`);
