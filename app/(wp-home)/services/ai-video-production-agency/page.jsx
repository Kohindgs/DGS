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
 */
const getCachedWpAiProductionMirror = unstable_cache(
  async () => getWpAiProductionMirror({ revalidate: 0 }),
  ['wp-ai-production-mirror-v4'],
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
  const cssBundle = '/api/wp-css?bundle=ai-production&v=10b';
  const lcpPreloadHref = mirror.lcpImage || '';
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
#dgs-wp-service-mirror{background:#020202;min-height:100vh}
#dgsNav{background:transparent;min-height:0;height:auto}
#dgsPill{color:#fff;background:#FD5C62}
`.replace(/\n/g, ''),
        }}
      />
      {lcpPreloadHref ? (
        <link rel="preload" as="image" href={lcpPreloadHref} fetchPriority="high" />
      ) : null}
      <link data-dgs-css="ai-production" rel="stylesheet" href={cssBundle} media="print" />
      <link
        data-dgs-font="syne"
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
        media="print"
      />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){function on(sel){var l=document.querySelector(sel);if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();setTimeout(go,400);}on('link[data-dgs-css=\"ai-production\"]');on('link[data-dgs-font=\"syne\"]');})();",
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `${immediateScripts.filter(isNavBootScript).join('\n;')}\n${getAskAiPromptBootScript()}`,
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

        /* ONLY intentional visual change on this ranking page: Syne */
        html body,
        html body #dgs-wp-service-mirror,
        html body #dgs-wp-service-mirror *:not(script):not(style),
        html body .dgs-talk-popup,
        html body .fluentform {
          font-family: 'Syne', system-ui, sans-serif !important;
        }
        html body h1,
        html body h2,
        html body h3,
        html body h4,
        html body .dgs-talk-popup h2,
        html body .fluentform .ff-btn-submit {
          font-family: 'Syne', system-ui, sans-serif !important;
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

      <meta name="dgs-build" content="wp-ai-production-2026-08-10b" />

      <div
        id="dgs-wp-service-mirror"
        className="dgs-wp-service-mirror"
        data-dgs-build="wp-ai-production-2026-08-10b"
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
