import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WpMirrorContent } from "@/lib/wordpress/mirror-types";

/**
 * Renders synced WordPress HTML without plugin JS at runtime.
 * Images and videos stay on wp-content CDN.
 */
export function buildMirrorMetadata(content: WpMirrorContent): Metadata {
  const canonicalPath = content.seo.canonical || content.path;

  return buildPageMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: content.path,
    canonicalPath,
    indexable: !content.noindex,
    image: content.seo.ogImage || undefined,
  });
}

export function WpMirrorPage({ content }: { content: WpMirrorContent }) {
  return (
    <>
      {content.schemas?.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
      {content.fontLinks?.map((linkHtml, index) => (
        <div key={`font-${index}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
      ))}
      {content.styles ? (
        <style dangerouslySetInnerHTML={{ __html: content.styles }} />
      ) : null}
      <div
        className={content.bodyClass || "dgs-wp-mirror"}
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </>
  );
}
