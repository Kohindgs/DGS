import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const kml = await readFile(path.join(process.cwd(), "public/locations.kml"), "utf8");
  return new Response(kml, {
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
