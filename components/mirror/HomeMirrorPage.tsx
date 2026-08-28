import { WpMirrorPage, buildMirrorMetadata } from "@/components/mirror/WpMirrorPage";
import { NativePortfolioGallery } from "@/components/portfolio/NativePortfolioGallery";
import { loadHomepageGallery } from "@/lib/portfolio/load-homepage-gallery";
import { sanitizeHomepageMirror } from "@/lib/wordpress/sanitize-homepage-mirror";
import type { WpMirrorContent } from "@/lib/wordpress/mirror-types";

export function buildHomeMirrorMetadata(content: WpMirrorContent) {
  return buildMirrorMetadata(content);
}

export function HomeMirrorPage({ content }: { content: WpMirrorContent }) {
  const sanitized = sanitizeHomepageMirror(content);
  const gallery = loadHomepageGallery();
  const hasGallerySplit = Boolean(sanitized.bodyAfterGallery);

  if (!hasGallerySplit) {
    return <WpMirrorPage content={sanitized} />;
  }

  return (
    <>
      {sanitized.schemas?.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
      {sanitized.fontLinks?.map((linkHtml, index) => (
        <div key={`font-${index}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
      ))}
      {sanitized.styles ? (
        <style dangerouslySetInnerHTML={{ __html: sanitized.styles }} />
      ) : null}
      <div className={sanitized.bodyClass || "dgs-wp-mirror"}>
        <div dangerouslySetInnerHTML={{ __html: sanitized.bodyBeforeGallery }} />
        <NativePortfolioGallery items={gallery.items} />
        <div dangerouslySetInnerHTML={{ __html: sanitized.bodyAfterGallery }} />
      </div>
    </>
  );
}
