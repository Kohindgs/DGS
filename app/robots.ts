import type { MetadataRoute } from "next";
import { buildRobotsManifest } from "@/lib/seo/robots-policy";

export default function robots(): MetadataRoute.Robots {
  return buildRobotsManifest();
}
