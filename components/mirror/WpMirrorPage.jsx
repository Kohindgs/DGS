import { absoluteCanonical } from "@/lib/seo/canonical-overrides";

/**
 * Renders synced WordPress HTML without plugin JS at runtime.
 * Images/videos stay on wp-content CDN for zero migration cost.
 */
export function buildMetadata(content) {
  const canonical = absoluteCanonical(content.seo.canonical || content.path);
  const robots = content.noindex
    ? { index: false, follow: true }
    : { index: true, follow: true };

  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical },
    robots,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      url: canonical,
      type: "website",
      ...(content.seo.ogImage ? { images: [{ url: content.seo.ogImage }] } : {}),
    },
    twitter: {
      card: content.seo.ogImage ? "summary_large_image" : "summary",
      title: content.seo.title,
      description: content.seo.description,
    },
  };
}

export default function WpMirrorPage({ content }) {
  return (
    <>
      {content.schemas?.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
      {content.fontLinks?.map((linkHtml, i) => (
        <div key={`font-${i}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
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
