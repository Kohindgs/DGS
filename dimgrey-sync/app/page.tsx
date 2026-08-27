import { HomeMirrorPage, buildHomeMirrorMetadata } from "@/components/mirror/HomeMirrorPage";
import homepageContent from "@/data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json";
import type { WpMirrorContent } from "@/lib/wordpress/mirror-types";

const content = homepageContent as WpMirrorContent;

export const metadata = buildHomeMirrorMetadata(content);

export default function HomePage() {
  return <HomeMirrorPage content={content} />;
}
