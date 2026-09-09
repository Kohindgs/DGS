import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const cache = new Map<string, string[]>();

/**
 * Combines route mirror CSS files into a single ordered route-specific stylesheet.
 * Preserves cascade order, hoists @import rules to top, and caches by content hash.
 */
export function aggregateMirrorCss(cssFiles: string[] | undefined): string[] {
  if (!cssFiles || !cssFiles.length) return [];
  const key = cssFiles.join(",");
  const cached = cache.get(key);
  if (cached) return cached;

  const publicCssDir = join(process.cwd(), "public/wp-mirror-css");
  const genDir = join(publicCssDir, "generated");
  if (!existsSync(genDir)) mkdirSync(genDir, { recursive: true });

  const imports: string[] = [];
  const bodies: string[] = [];

  for (const f of cssFiles) {
    const filePath = join(publicCssDir, f);
    if (!existsSync(filePath)) continue;
    const raw = readFileSync(filePath, "utf8");
    const stripped = raw.replace(/@import\s+[^;]+;/g, (match) => {
      if (!imports.includes(match)) imports.push(match);
      return "";
    });
    bodies.push(`/* ${f} */\n${stripped}`);
  }

  const combined = `${imports.join("\n")}\n${bodies.join("\n\n")}`;
  const hash = createHash("sha256").update(combined).digest("hex").slice(0, 16);
  const outFilename = `generated/${hash}.css`;
  const outPath = join(publicCssDir, outFilename);

  if (!existsSync(outPath)) {
    writeFileSync(outPath, combined, "utf8");
  }

  const result = [outFilename];
  cache.set(key, result);
  return result;
}
