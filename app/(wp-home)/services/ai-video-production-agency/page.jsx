import DeferredHomeClient from '../../../components/DeferredHomeClient';
import ImmediateMirrorScripts from '../../../components/ImmediateMirrorScripts';
import { unstable_cache } from 'next/cache';
import {
  getAskAiPromptBootScript,
  getWpAiProductionMirror,
  isAiPortfolioBootScript,
  isNavBootScript,
} from '../../../../lib/wp-mirror';

/**
 * AI Video Production service — ranking page mirror.
 * Intentional change: Syne font only.
 * Preserve WP title/description/robots/canonical/schema/content.
 * Safe perf: one CSS bundle, keep inline nav CSS, fast CSS/font apply,
 * Syne display=swap, same-origin media proxy.
 * WebGL particle sphere is deferred (idle) so first paint is not blocked.
 */
const getCachedWpAiProductionMirror = unstable_cache(
  async () => getWpAiProductionMirror({ revalidate: 0 }),
  ['wp-ai-production-mirror-v8'],
  { revalidate: 900 }
);

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const { meta } = await getCachedWpAiProductionMirror();
    return {
      title: { absolute: meta.title },
      description: meta.description,
      robots: meta.robots,
      // Upstream WP canonical — do not invent a competing demo URL for this ranking page.
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
      title: { absolute: "AI Video Production Agency in Mumbai | D'Genius Solutions" },
      description:
        'AI video production agency in Mumbai creating AI video ads, product films, reels, brand videos and AI product videos for businesses. Book a free strategy call.',
      alternates: {
        canonical: 'https://www.dgeniussolutions.com/services/ai-video-production-agency/',
      },
    };
  }
}

export default async function WpAiProductionPage() {
  const mirror = await getCachedWpAiProductionMirror();
  const cssBundle = '/api/wp-css?bundle=ai-production&v=10g';
  const lcpPreloadHref = mirror.lcpImage || '';
  // Portfolio + nav only — WebGL/Three.js wait until after first paint.
  const immediateScripts = (mirror.inlineScripts || []).filter(
    (code) => isNavBootScript(code) || isAiPortfolioBootScript(code)
  );
  const deferredInlineScripts = (mirror.inlineScripts || []).filter(
    (code) => !(isNavBootScript(code) || isAiPortfolioBootScript(code))
  );

  return (
    <>
      {/* Critical shell only — do not restyle ranking content. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
html,body{background:#020202;color:#e8e8e6;color-scheme:dark;margin:0;padding:0}
#dgs-wp-service-mirror{background:transparent;min-height:100vh}
#dgsNav{background:transparent;min-height:0;height:auto}
#dgsPill{color:#fff;background:#FD5C62}
.elementor-invisible{visibility:visible!important;opacity:1!important}
.dgs-hero,.dgs-hero-copy,.dgs-wrap{opacity:1!important;visibility:visible!important}
`.replace(/\n/g, ''),
        }}
      />
      {lcpPreloadHref ? (
        <link rel="preload" as="image" href={lcpPreloadHref} fetchPriority="high" />
      ) : null}
      <link rel="preload" as="style" href={cssBundle} />
      <link data-dgs-css="ai-production" rel="stylesheet" href={cssBundle} />
      <link
        data-dgs-font="syne"
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `${immediateScripts.filter(isNavBootScript).join('\n;')}\n${getAskAiPromptBootScript()}\n${immediateScripts.filter(isAiPortfolioBootScript).join('\n;')}`,
        }}
      />

      {/* WP inline <style> kept — layout/theme; font faces remapped to Syne in mirror. */}
      {mirror.inlineStyles.map((css, i) => (
        <style
          // eslint-disable-next-line react/no-danger
          key={`ai-prod-inline-style-${i}`}
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
        #dgs-wp-service-mirror { min-height: 100vh; }
        img.lazyload, img.lazyloading { opacity: 1 !important; }
        video { max-width: 100%; }

        /* WebGL particle-sphere background (fixed behind content) */
        #global-webgl-background {
          position: fixed !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100vh !important;
          z-index: 0 !important;
          pointer-events: none !important;
          background:
            radial-gradient(ellipse 70% 55% at 50% 42%, rgba(253, 92, 98, 0.14), transparent 58%),
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(114, 193, 216, 0.1), transparent 55%),
            radial-gradient(ellipse 45% 35% at 30% 55%, rgba(255, 174, 51, 0.08), transparent 50%),
            #020202 !important;
        }
        #global-webgl-background canvas {
          display: block !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 0 !important;
        }
        html body #dgs-wp-service-mirror {
          position: relative !important;
          z-index: 1 !important;
          background: transparent !important;
        }
        html body #dgs-wp-service-mirror .dgs-ai-page,
        html body #dgs-wp-service-mirror .dgs-hero,
        html body #dgs-wp-service-mirror .elementor-invisible {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Unified Syne — section heads above logos, all weights */
        html body,
        html body #dgs-wp-service-mirror,
        html body #dgs-wp-service-mirror *:not(script):not(style),
        html body .dgs-talk-popup,
        html body .fluentform,
        html body #dgs-wp-service-mirror .dgs-v1215-section-head,
        html body #dgs-wp-service-mirror .dgs-v1215-section-head *,
        html body #dgs-wp-service-mirror .dgs-v1215-section-kicker,
        html body #dgs-wp-service-mirror .dgs-v1215-eyebrow {
          font-family: 'Syne', system-ui, sans-serif !important;
          font-style: normal !important;
        }
        html body h1,
        html body h2,
        html body h3,
        html body h4,
        html body .dgs-talk-popup h2,
        html body .fluentform .ff-btn-submit,
        html body #dgs-wp-service-mirror .dgs-v1215-section-head h2,
        html body #dgs-wp-service-mirror .dgs-v1215-section-kicker,
        html body #dgs-wp-service-mirror .dgs-v1215-eyebrow {
          font-family: 'Syne', system-ui, sans-serif !important;
          font-weight: 500 !important;
        }

        /* Client logo wall — visible tiles, responsive grid */
        html body #dgs-wp-service-mirror .dgs-v1215-logo-track {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        }
        html body #dgs-wp-service-mirror .dgs-v1215-logo-tile {
          min-height: 148px !important;
          overflow: visible !important;
        }
        html body #dgs-wp-service-mirror .dgs-v1215-logo-tile img {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
          max-width: min(82%, 190px) !important;
          max-height: 78px !important;
          object-fit: contain !important;
        }

        /* Prominent Load More — coral pill, full width */
        html body #dgs-wp-service-mirror #load-more-btn,
        html body #dgs-wp-service-mirror .dgs-btn-ghost#load-more-btn {
          display: block !important;
          width: min(100%, 440px) !important;
          margin: 32px auto 0 !important;
          padding: 16px 32px !important;
          font-family: 'Syne', system-ui, sans-serif !important;
          font-size: clamp(15px, 1.4vw, 18px) !important;
          font-weight: 600 !important;
          letter-spacing: 0.02em !important;
          color: #fff !important;
          -webkit-text-fill-color: #fff !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
          border: 2px solid #FD5C62 !important;
          border-radius: 999px !important;
          text-align: center !important;
          cursor: pointer !important;
          box-shadow: 0 10px 28px rgba(253, 92, 98, 0.38) !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        html body #dgs-wp-service-mirror #load-more-btn:hover {
          opacity: 0.92 !important;
          transform: translateY(-1px) !important;
        }

        @media (max-width: 1180px) {
          html body #dgs-wp-service-mirror .dgs-v1215-logo-track {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 700px) {
          html body #dgs-wp-service-mirror .dgs-v1215-logo-track {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 560px) {
          html body #dgs-wp-service-mirror .dgs-v1215-logo-track {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        html body #dgsPill.dgs-talk-trigger,
        html body #dgsPill {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
        }

        /* Flat solid submit — kill WP pink→orange gradient on CTA / FluentForm */
        html body #dgs-wp-service-mirror .dgs-form-wrapper .ff-btn-submit,
        html body #dgs-wp-service-mirror .dgs-form-wrapper button[type="submit"],
        html body #dgs-wp-service-mirror .dgs-form-wrapper input[type="submit"],
        html body #dgs-wp-service-mirror .fluentform .ff-btn-submit,
        html body #dgs-wp-service-mirror .fluentform button[type="submit"],
        html body #cta-form .ff-btn-submit,
        html body #cta-form button[type="submit"],
        html body .dgs-talk-popup .ff-btn-submit,
        html body .dgs-talk-popup button[type="submit"] {
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
          color: #fff !important;
          -webkit-text-fill-color: #fff !important;
          box-shadow: none !important;
          filter: none !important;
          border: 0 !important;
        }
        html body #dgs-wp-service-mirror .dgs-form-wrapper .ff-btn-submit::before,
        html body #dgs-wp-service-mirror .dgs-form-wrapper .ff-btn-submit::after,
        html body #dgs-wp-service-mirror .fluentform .ff-btn-submit::before,
        html body #dgs-wp-service-mirror .fluentform .ff-btn-submit::after,
        html body #cta-form .ff-btn-submit::before,
        html body #cta-form .ff-btn-submit::after {
          display: none !important;
          content: none !important;
          background: none !important;
          background-image: none !important;
        }
        html body #dgs-wp-service-mirror .dgs-form-wrapper .ff-btn-submit:hover,
        html body #dgs-wp-service-mirror .fluentform .ff-btn-submit:hover,
        html body #cta-form .ff-btn-submit:hover {
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
          opacity: 0.92 !important;
        }

        html body #dgs-wp-service-mirror {
          overflow-x: clip !important;
          max-width: 100% !important;
        }
      `}</style>

      <meta name="dgs-build" content="wp-ai-production-2026-08-10g" />

      <div
        id="dgs-wp-service-mirror"
        className="dgs-wp-service-mirror"
        data-dgs-build="wp-ai-production-2026-08-10g"
        dangerouslySetInnerHTML={{ __html: mirror.bodyHtml }}
      />

      {/* Keep WP JSON-LD as-is (ranking schema URLs stay on dgeniussolutions.com). */}
      {mirror.schemas.map((json, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

      {/* Nav + portfolio/FAQ before deferred client. */}
      <ImmediateMirrorScripts scripts={immediateScripts} idPrefix="dgs-ai-imm" />

      <DeferredHomeClient
        bodyId={mirror.bodyId}
        bodyClass={mirror.bodyClass}
        externalScripts={mirror.externalScripts}
        inlineScripts={deferredInlineScripts}
        demoOrigin={mirror.demoOrigin}
        mirrorRootId="dgs-wp-service-mirror"
      />
    </>
  );
}
