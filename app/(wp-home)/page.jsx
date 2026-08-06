import WpHomeClient from '../components/WpHomeClient';
import { getWpHomeMirror } from '../../lib/wp-mirror';

export const revalidate = 300;

export async function generateMetadata() {
  try {
    const { meta } = await getWpHomeMirror();
    return {
      title: { absolute: meta.title },
      description: meta.description,
      robots: meta.robots,
      alternates: { canonical: meta.canonical },
      openGraph: {
        title: meta.og['og:title'] || meta.title,
        description: meta.og['og:description'] || meta.description,
        url: meta.og['og:url'] || meta.canonical,
        siteName: meta.og['og:site_name'] || "D'Genius Solutions",
        locale: meta.og['og:locale'] || 'en_US',
        type: meta.og['og:type'] || 'website',
        images: meta.og['og:image'] ? [{ url: meta.og['og:image'] }] : undefined,
      },
      twitter: {
        card: meta.og['twitter:card'] || 'summary_large_image',
        title: meta.og['twitter:title'] || meta.title,
        description: meta.og['twitter:description'] || meta.description,
        images: meta.og['twitter:image'] ? [meta.og['twitter:image']] : undefined,
      },
      icons: {
        icon: [
          { url: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-32x32.png', sizes: '32x32' },
          { url: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-192x192.png', sizes: '192x192' },
        ],
        apple: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-180x180.png',
      },
    };
  } catch {
    return {
      title: { absolute: "Digital Marketing Agency in Mumbai | D'Genius Solutions" },
      description:
        "D'Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.",
      alternates: { canonical: 'https://www.dgeniussolutions.com/' },
    };
  }
}

export default async function WpHomePage() {
  const mirror = await getWpHomeMirror();

  return (
    <>
      {mirror.stylesheets.map((sheet) => (
        <link
          key={`${sheet.rel}-${sheet.href}`}
          rel={sheet.rel}
          href={sheet.href}
          media={sheet.media || undefined}
          sizes={sheet.sizes || undefined}
        />
      ))}

      {mirror.inlineStyles.map((css, i) => (
        <style key={`inline-style-${i}`} dangerouslySetInnerHTML={{ __html: css }} />
      ))}

      {/* Exact Rank Math / custom JSON-LD from WordPress (Organization, FAQ, LocalBusiness, ItemList) */}
      {mirror.schemas.map((json, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

      {/* Prevent WP menu/chat CSS from locking page scroll on this host */}
      <style>{`
        html, body { overflow-x: hidden !important; overflow-y: auto !important; height: auto !important; }
        #dgs-wp-home-mirror { min-height: 100vh; }
      `}</style>

      {/* Visible build stamp so we can confirm cache is cleared */}
      <meta name="dgs-build" content="wp-mirror-2026-08-06b" />

      <div
        id="dgs-wp-home-mirror"
        className="dgs-wp-home-mirror"
        data-dgs-build="wp-mirror-2026-08-06b"
        dangerouslySetInnerHTML={{ __html: mirror.bodyHtml }}
      />

      <WpHomeClient bodyId={mirror.bodyId} bodyClass={mirror.bodyClass} />
    </>
  );
}
