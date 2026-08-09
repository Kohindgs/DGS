import DeferredHomeClient from '../../components/DeferredHomeClient';
import { unstable_cache } from 'next/cache';
import { getAskAiPromptBootScript, getWpAboutMirror } from '../../../lib/wp-mirror';

/**
 * WordPress About Us HTML mirror — same dos/donts as homepage:
 * - Keep WP inline <style> (nav #dgsNav / #dgsTrig lives there)
 * - One CSS bundle, apply on load (media=print → all; no multi-second delay)
 * - No clipped fixed header / no min-height:100vh on #dgsNav
 * - Dark early paint, Syne optional, CTA #FD5C62
 * - Defer client JS after first paint
 * - force-dynamic + server cache (Hostinger build OOM safety)
 */
const getCachedWpAboutMirror = unstable_cache(
  async () => getWpAboutMirror({ revalidate: 0 }),
  ['wp-about-mirror-v2'],
  { revalidate: 900 }
);

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const { meta } = await getCachedWpAboutMirror();
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
          {
            url: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-32x32.png',
            sizes: '32x32',
          },
          {
            url: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-192x192.png',
            sizes: '192x192',
          },
        ],
        apple: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-DGS-LOGO-180x180.png',
      },
    };
  } catch {
    return {
      title: { absolute: "About Us | D'Genius Solutions" },
      description:
        "Meet D'Genius Solutions — a Mumbai digital marketing agency built on trust, expertise, and AI-led creative production.",
      alternates: {
        canonical: 'https://dimgrey-goat-473970.hostingersite.com/about-us',
      },
    };
  }
}

export default async function WpAboutPage() {
  const mirror = await getCachedWpAboutMirror();
  const cssBundle = '/api/wp-css?bundle=about&v=09k';
  const lcpPreloadHref = mirror.lcpImage || '';

  return (
    <>
      {/* Critical: dark canvas + safe nav shell only. Full look from WP CSS. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
html,body{background:#020202;color:#e8e8e6;color-scheme:dark;margin:0;padding:0}
#dgs-wp-about-mirror{background:#020202;min-height:100vh}
#dgsNav{background:transparent;min-height:0;height:auto}
#dgsPill{color:#fff;background:#FD5C62}
`.replace(/\n/g, ''),
        }}
      />
      {lcpPreloadHref ? (
        <link rel="preload" as="image" href={lcpPreloadHref} fetchPriority="high" />
      ) : null}
      {/* Apply About CSS as soon as it loads — no 12s delay (that broke layout). */}
      <link data-dgs-css="about" rel="stylesheet" href={cssBundle} media="print" />
      <link
        data-dgs-font="syne"
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=optional"
        media="print"
      />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){function on(sel){var l=document.querySelector(sel);if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();setTimeout(go,3000);}on('link[data-dgs-css=\"about\"]');on('link[data-dgs-font=\"syne\"]');})();",
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: getAskAiPromptBootScript() }} />

      {/* WP inline <style> (custom nav) — not in the linked CSS bundle. */}
      {mirror.inlineStyles.map((css, i) => (
        <style
          // eslint-disable-next-line react/no-danger
          key={`about-inline-style-${i}`}
          dangerouslySetInnerHTML={{ __html: css }}
        />
      ))}

      <style>{`
        html, body {
          overflow-x: clip !important;
          height: auto !important;
          min-height: 100% !important;
        }
        html:not(.dgs-scroll-locked):not(:has(#dgsNav.nav-open)):not(.dgs-talk-popup-active),
        body:not(.dgs-scroll-locked):not(.dgs-talk-popup-active):not(:has(#dgsNav.nav-open)) {
          overflow-y: auto !important;
        }
        html.dgs-scroll-locked,
        html.dgs-scroll-locked body,
        html:has(#dgsNav.nav-open),
        html:has(#dgsNav.nav-open) body,
        body.dgs-scroll-locked,
        body.dgs-talk-popup-active,
        body:has(#dgsNav.nav-open) {
          overflow: hidden !important;
        }
        body:not(.dgs-scroll-locked):not(.dgs-talk-popup-active):not(:has(#dgsNav.nav-open)) {
          position: static !important;
          top: auto !important;
          width: auto !important;
        }
        #dgs-wp-about-mirror { min-height: 100vh; }
        img.lazyload, img.lazyloading { opacity: 1 !important; }
        video { max-width: 100%; }

        /* Syne everywhere — medium weight */
        html body,
        html body #dgs-wp-about-mirror,
        html body #dgs-wp-about-mirror *:not(script):not(style),
        html body .dgs-talk-popup,
        html body .fluentform {
          font-family: system-ui, 'Syne', sans-serif !important;
        }
        html body h1,
        html body h2,
        html body h3,
        html body .dgs-talk-popup h2,
        html body .fluentform .ff-btn-submit {
          font-family: system-ui, 'Syne', sans-serif !important;
          font-weight: 500 !important;
        }
        html body h1 { font-weight: 600 !important; }

        /* LET'S TALK brand coral — never the darker #C73A40 experiment */
        html body #dgsPill.dgs-talk-trigger,
        html body #dgsPill {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
        }
        html body #dgsPill.dgs-talk-trigger:hover,
        html body #dgsPill:hover {
          color: #ffffff !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          opacity: 0.92 !important;
        }

        /* Contain horizontal overflow without clipping full-bleed bands */
        html body #dgs-wp-about-mirror {
          overflow-x: clip !important;
          max-width: 100% !important;
        }
      `}</style>

      <meta name="dgs-build" content="wp-about-mirror-2026-08-09k" />

      <div
        id="dgs-wp-about-mirror"
        className="dgs-wp-about-mirror"
        data-dgs-build="wp-about-mirror-2026-08-09k"
        dangerouslySetInnerHTML={{ __html: mirror.bodyHtml }}
      />

      {mirror.schemas.map((json, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

      <DeferredHomeClient
        bodyId={mirror.bodyId}
        bodyClass={mirror.bodyClass}
        externalScripts={mirror.externalScripts}
        inlineScripts={mirror.inlineScripts}
        demoOrigin={mirror.demoOrigin}
        mirrorRootId="dgs-wp-about-mirror"
      />
    </>
  );
}
