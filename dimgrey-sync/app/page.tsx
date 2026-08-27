import { WpMirrorPage, buildMirrorMetadata } from "@/components/mirror/WpMirrorPage";
import homepageContent from "@/data/wordpress/content/page-best-digital-marketing-agency-in-mumbai.json";
import type { WpMirrorContent } from "@/lib/wordpress/mirror-types";

const content = homepageContent as WpMirrorContent;

export const metadata = buildMirrorMetadata(content);

export default function HomePage() {
  return <WpMirrorPage content={content} />;
}
