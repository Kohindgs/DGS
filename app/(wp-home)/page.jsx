import WpHomeClient from '../components/WpHomeClient';
import { unstable_cache } from 'next/cache';
import { getWpHomeMirror } from '../../lib/wp-mirror';

/**
 * SSR (avoids Hostinger OOM during `next build`) + 5-minute cache so cold
 * traffic does not re-fetch the full WordPress homepage on every hit.
 */
const getCachedWpHomeMirror = unstable_cache(
  async () => getWpHomeMirror({ revalidate: 0 }),
  ['wp-home-mirror-v1'],
  { revalidate: 300 }
);

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  try {
    const { meta } = await getCachedWpHomeMirror();
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
      alternates: { canonical: 'https://dimgrey-goat-473970.hostingersite.com/' },
    };
  }
}

export default async function WpHomePage() {
  const mirror = await getCachedWpHomeMirror();

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

      {mirror.schemas.map((json, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
      />

      <style>{`
        /* Default scrollable; cooperate with menu/talk/case scroll-lock */
        html, body {
          overflow-x: clip !important;
          height: auto !important;
          min-height: 100% !important;
        }
        html:not(.dgs-scroll-locked):not(:has(#dgsNav.nav-open)):not(.dgs-talk-popup-active):not(:has(body.dgs-case-modal-active)),
        body:not(.dgs-scroll-locked):not(.dgs-talk-popup-active):not(:has(#dgsNav.nav-open)):not(.dgs-case-modal-active) {
          overflow-y: auto !important;
        }
        html.dgs-scroll-locked,
        html.dgs-scroll-locked body,
        html:has(#dgsNav.nav-open),
        html:has(#dgsNav.nav-open) body,
        body.dgs-scroll-locked,
        body.dgs-talk-popup-active,
        body.dgs-case-modal-active,
        body:has(#dgsNav.nav-open) {
          overflow: hidden !important;
        }
        body:not(.dgs-scroll-locked):not(.dgs-talk-popup-active):not(:has(#dgsNav.nav-open)):not(.dgs-case-modal-active) {
          position: static !important;
          top: auto !important;
          width: auto !important;
        }
        #dgs-wp-home-mirror { min-height: 100vh; }
        img.lazyload, img.lazyloading { opacity: 1 !important; }
        video { max-width: 100%; }

        /*
          Background plane must stay still — only particle dots should move.
          WP ships a drifting gradient fallback + mouse parallax on the whole
          canvas/grid layer; kill both so motion stays in DgsFastBackground.
        */
        .dgs-v1215 {
          --v1215-grid-x: 0px !important;
          --v1215-grid-y: 0px !important;
        }
        .dgs-v1215-fallback {
          opacity: 1 !important;
          visibility: visible !important;
          inset: 0 !important;
          transform: none !important;
          animation: none !important;
          will-change: auto !important;
        }
        #dgs-v1215-canvas,
        .dgs-v1215-grid {
          transform: none !important;
          will-change: auto !important;
        }

        /* Fast Canvas2D bg — keep canvas visible on desktop once ready */
        @media (min-width: 901px) {
          .dgs-v1215.v1215-webgl-ready #dgs-v1215-canvas {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: none !important;
            transform: none !important;
          }
          .dgs-v1215.v1215-webgl-ready .dgs-v1215-fallback {
            opacity: 0.64 !important;
            transform: none !important;
            animation: none !important;
          }
        }

        /* Syne everywhere — medium weight (SEO-page style, not thick 700/800) */
        html body,
        html body #dgs-wp-home-mirror,
        html body #dgs-wp-home-mirror *:not(script):not(style),
        html body .dgs-v1215,
        html body .dgs-talk-popup,
        html body .fluentform,
        html body .dgs-case-modal {
          font-family: 'Syne', sans-serif !important;
        }
        html body .dgs-v1215 h1,
        html body .dgs-v1215 h2,
        html body .dgs-v1215 h3,
        html body .dgs-v1215 .dgs-v1215-section-head h2,
        html body .dgs-v1215 .dgs-v1215-hero h1,
        html body .dgs-v1215 .dgs-v1215-hero-copy h1,
        html body .dgs-talk-popup h2,
        html body .dgs-talk-popup .ff-btn,
        html body .dgs-talk-popup button[type="submit"],
        html body .fluentform .ff-btn-submit,
        html body .dgs-case-modal-body h3 {
          font-family: 'Syne', sans-serif !important;
          font-weight: 500 !important;
        }
        html body .dgs-v1215 h1 {
          font-weight: 600 !important;
        }
        html body .dgs-v1215 p,
        html body .dgs-v1215 li,
        html body .dgs-v1215 .dgs-v1215-hero-copy p {
          font-weight: 400 !important;
          line-height: 1.7 !important;
        }

        /* Flat solid close/nav — no gradients, glows, or coral fills */
        #lightbox.portfolio-lightbox.is-open #lightbox-close,
        #lightbox.portfolio-lightbox.is-open #lightbox-prev,
        #lightbox.portfolio-lightbox.is-open #lightbox-next,
        .portfolio-lightbox.is-open .portfolio-lightbox-btn,
        .envirabox-container .envirabox-button,
        .envirabox-container .envirabox-button--close,
        .envirabox-container .envirabox-close,
        .envirabox-container .envirabox-nav,
        .envirabox-container .envirabox-arrow,
        .envirabox-container .envirabox-button--arrow_left,
        .envirabox-container .envirabox-button--arrow_right,
        .dgs-case-modal-close,
        .dgs-case-modal-nav {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 2147483647 !important;
          pointer-events: auto !important;
          color: #fff !important;
          background: #111 !important;
          background-image: none !important;
          border: 1px solid rgba(255,255,255,.35) !important;
          border-radius: 999px !important;
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
        }
        #lightbox-close.portfolio-lightbox-close,
        .dgs-case-modal-close,
        .envirabox-container .envirabox-button--close,
        .envirabox-container .envirabox-close {
          position: fixed !important;
          top: 18px !important;
          right: 18px !important;
          width: 48px !important;
          height: 48px !important;
          font-size: 1.75rem !important;
          line-height: 1 !important;
        }
        .envirabox-container .envirabox-close:before,
        .envirabox-container .envirabox-button--close:before {
          content: "×" !important;
          font-family: 'Syne', system-ui, sans-serif !important;
          font-size: 28px !important;
          font-weight: 400 !important;
          color: #fff !important;
          line-height: 1 !important;
          background: none !important;
        }
        .envirabox-container .envirabox-arrow--left span:before,
        .envirabox-container .envirabox-prev span:before,
        .envirabox-container .envirabox-button--arrow_left:after {
          content: "‹" !important;
          font-family: 'Syne', system-ui, sans-serif !important;
          font-size: 36px !important;
          color: #fff !important;
          background: none !important;
        }
        .envirabox-container .envirabox-arrow--right span:before,
        .envirabox-container .envirabox-next span:before,
        .envirabox-container .envirabox-button--arrow_right:after {
          content: "›" !important;
          font-family: 'Syne', system-ui, sans-serif !important;
          font-size: 36px !important;
          color: #fff !important;
          background: none !important;
        }
        .envirabox-container .envirabox-toolbar,
        .envirabox-container .envira-close-button,
        .envirabox-container .envirabox-navigation {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 999999 !important;
          background: none !important;
          background-image: none !important;
        }

        /* Case studies modal */
        .dgs-case-modal {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0,0,0,.92);
        }
        .dgs-case-modal.is-open { display: flex; }
        .dgs-case-modal-panel {
          width: min(960px, 94vw);
          max-height: 90vh;
          overflow: auto;
          background: #111;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 16px;
          color: #fff;
        }
        .dgs-case-modal-media img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 52vh;
          object-fit: cover;
        }
        .dgs-case-modal-body { padding: 20px 24px 28px; }
        .dgs-case-modal-kicker {
          display: block;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,.55);
          margin-bottom: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 500;
        }
        .dgs-case-modal-body h3 {
          margin: 0 0 10px;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: clamp(22px, 3vw, 32px);
        }
        .dgs-case-modal-body p {
          margin: 0 0 16px;
          color: rgba(255,255,255,.78);
          line-height: 1.7;
          font-weight: 400;
        }
        .dgs-case-modal-close,
        .dgs-case-modal-nav,
        .dgs-case-modal-close::before,
        .dgs-case-modal-close::after,
        .dgs-case-modal-nav::before,
        .dgs-case-modal-nav::after,
        #lightbox-close::before,
        #lightbox-close::after,
        #lightbox-prev::before,
        #lightbox-prev::after,
        #lightbox-next::before,
        #lightbox-next::after,
        .portfolio-lightbox-btn::before,
        .portfolio-lightbox-btn::after {
          background: #111 !important;
          background-image: none !important;
          background-color: #111 !important;
          box-shadow: none !important;
          filter: none !important;
          -webkit-mask: none !important;
          mask: none !important;
          border-image: none !important;
        }
        .dgs-case-modal-close::before,
        .dgs-case-modal-close::after,
        .dgs-case-modal-nav::before,
        .dgs-case-modal-nav::after {
          content: none !important;
          display: none !important;
        }
        .dgs-case-modal-close,
        .dgs-case-modal-nav {
          position: fixed;
          z-index: 2147483001;
          width: 48px;
          height: 48px;
          font-size: 1.75rem;
          cursor: pointer;
          line-height: 1;
        }
        .dgs-case-modal-close { top: 18px; right: 18px; }
        .dgs-case-modal-prev { left: 16px; top: 50%; transform: translateY(-50%); }
        .dgs-case-modal-next { right: 16px; top: 50%; transform: translateY(-50%); }
        .dgs-case-modal-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .dgs-case-modal-metrics strong { display: block; font-size: 1.25rem; }
        .dgs-case-modal-metrics small { color: rgba(255,255,255,.55); }

        /* Mobile: keep arrows off the case study card — bottom bar like portfolio lightbox */
        @media (max-width: 900px) {
          .dgs-case-modal {
            padding: 12px 12px 96px !important;
            align-items: flex-start !important;
          }
          .dgs-case-modal-panel {
            width: 100% !important;
            max-width: 100% !important;
            max-height: calc(100dvh - 110px) !important;
            margin-top: 52px !important;
          }
          .dgs-case-modal-close {
            top: calc(env(safe-area-inset-top, 0px) + 10px) !important;
            right: 10px !important;
            width: 44px !important;
            height: 44px !important;
          }
          .dgs-case-modal-prev,
          .dgs-case-modal-next {
            top: auto !important;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 18px) !important;
            transform: none !important;
            width: 44px !important;
            height: 44px !important;
          }
          .dgs-case-modal-prev {
            left: calc(50% - 54px) !important;
            right: auto !important;
          }
          .dgs-case-modal-next {
            left: calc(50% + 10px) !important;
            right: auto !important;
          }

          /* Portfolio / Envira lightboxes — same bottom placement on small screens */
          #lightbox.portfolio-lightbox.is-open #lightbox-prev,
          #lightbox.portfolio-lightbox.is-open #lightbox-next,
          .portfolio-lightbox.is-open .portfolio-lightbox-arrow {
            top: auto !important;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 18px) !important;
            transform: none !important;
          }
          #lightbox.portfolio-lightbox.is-open #lightbox-prev,
          .portfolio-lightbox.is-open .portfolio-lightbox-prev {
            left: calc(50% - 54px) !important;
            right: auto !important;
          }
          #lightbox.portfolio-lightbox.is-open #lightbox-next,
          .portfolio-lightbox.is-open .portfolio-lightbox-next {
            left: calc(50% + 10px) !important;
            right: auto !important;
          }
          .envirabox-container .envirabox-nav,
          .envirabox-container .envirabox-arrow,
          .envirabox-container .envirabox-button--arrow_left,
          .envirabox-container .envirabox-button--arrow_right {
            top: auto !important;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 18px) !important;
            transform: none !important;
          }
        }

        /* Demo host cannot use production Google reCAPTCHA keys — hide widget;
           Hostinger WP mu-plugin skips captcha for proxied demo submits. */
        .ff-el-recaptcha,
        .g-recaptcha,
        .ff-el-group:has(.g-recaptcha),
        .ff-el-group:has(.ff-el-recaptcha) {
          display: none !important;
        }
      `}</style>

      <meta name="dgs-build" content="wp-mirror-2026-08-07c" />

      <div
        id="dgs-wp-home-mirror"
        className="dgs-wp-home-mirror"
        data-dgs-build="wp-mirror-2026-08-07c"
        dangerouslySetInnerHTML={{ __html: mirror.bodyHtml }}
      />

      <WpHomeClient
        bodyId={mirror.bodyId}
        bodyClass={mirror.bodyClass}
        externalScripts={mirror.externalScripts}
        inlineScripts={mirror.inlineScripts}
        demoOrigin={mirror.demoOrigin}
      />
    </>
  );
}
