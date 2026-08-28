const SITE = "https://www.dgeniussolutions.com";

export function normalizePath(input: string): string {
  try {
    const url = new URL(input, SITE);
    let pathname = url.pathname || "/";
    if (pathname !== "/" && !pathname.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(pathname)) {
      pathname += "/";
    }
    return pathname;
  } catch {
    if (input === "/") return "/";
    if (!input.endsWith("/") && !/\.[a-z0-9]{1,8}$/i.test(input)) {
      return input + "/";
    }
    return input;
  }
}

export function pathToSlug(path: string): string[] {
  return normalizePath(path).split("/").filter(Boolean);
}

export function slugToPath(slug: string[]): string {
  return normalizePath("/" + slug.join("/"));
}
