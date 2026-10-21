import type { WordPressContentRecord, WordPressMedia } from "./types";

const DEFAULT_WP_BASE_URL = "https://www.dgeniussolutions.com/wp-json/wp/v2";
const DEFAULT_REVALIDATE_SECONDS = 3600;

function wpBaseUrl() {
  return process.env.WP_REST_BASE_URL || DEFAULT_WP_BASE_URL;
}

function buildUrl(path: string, params?: URLSearchParams) {
  const suffix = params?.toString();
  return `${wpBaseUrl()}${path}${suffix ? `?${suffix}` : ""}`;
}

async function wpResponse(path: string, params?: URLSearchParams) {
  const response = await fetch(buildUrl(path, params), {
    headers: { Accept: "application/json" },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `WordPress request failed for ${path}: ${response.status} ${response.statusText}`,
    );
  }

  return response;
}

async function wpFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const response = await wpResponse(path, params);
  return response.json() as Promise<T>;
}

async function getAllPaginated<T>(path: string, fields?: string[]) {
  const firstParams = new URLSearchParams({
    per_page: "100",
    page: "1",
    context: "view",
  });

  if (fields?.length) {
    firstParams.set("_fields", fields.join(","));
  }

  const firstResponse = await wpResponse(path, firstParams);
  const firstPage = (await firstResponse.json()) as T[];
  const totalPages = Number(firstResponse.headers.get("x-wp-totalpages") || "1");

  if (totalPages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => {
      const params = new URLSearchParams(firstParams);
      params.set("page", String(index + 2));
      return wpFetch<T[]>(path, params);
    }),
  );

  return [firstPage, ...remainingPages].flat();
}

export function getWordPressPage(id: number) {
  return wpFetch<WordPressContentRecord>(`/pages/${id}`, new URLSearchParams({ context: "view" }));
}

export function getWordPressService(id: number) {
  return wpFetch<WordPressContentRecord>(
    `/services/${id}`,
    new URLSearchParams({ context: "view" }),
  );
}

export function getWordPressPost(id: number) {
  return wpFetch<WordPressContentRecord>(`/posts/${id}`, new URLSearchParams({ context: "view" }));
}

export function getWordPressMedia(id: number) {
  return wpFetch<WordPressMedia>(`/media/${id}`, new URLSearchParams({ context: "view" }));
}

export function getAllWordPressPages() {
  return getAllPaginated<WordPressContentRecord>("/pages", [
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
  ]);
}

export function getAllWordPressServices() {
  return getAllPaginated<WordPressContentRecord>("/services", [
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
  ]);
}

export function getAllWordPressPosts() {
  return getAllPaginated<WordPressContentRecord>("/posts", [
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
  ]);
}

export function getAllWordPressMediaInventory() {
  return getAllPaginated<WordPressMedia>("/media", [
    "id",
    "source_url",
    "alt_text",
    "caption",
    "media_type",
    "mime_type",
  ]);
}
