import { buildLocationsKml } from "@/lib/schema/locations-kml";

export function GET() {
  const kml = buildLocationsKml();
  return new Response(kml, {
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
