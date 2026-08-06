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
      alternates: { canonical: 'https://dimgrey-goat-473970.hostingersite.com/' },
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
        /* Keep page scrollable unless menu/talk popup intentionally locks it */
        html, body {
          overflow-x: clip !important;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100% !important;
        }
        body:not(.dgs-talk-popup-active):not(:has(#dgsNav.nav-open)):not(.dgs-case-modal-active) {
          position: static !important;
          top: auto !important;
          width: auto !important;
        }
        #dgs-wp-home-mirror { min-height: 100vh; }
        img.lazyload, img.lazyloading { opacity: 1 !important; }
        .dgs-v1215-fallback { opacity: 1 !important; visibility: visible !important; }
        video { max-width: 100%; }

        /* Syne — medium weight, not thick 700/800 */
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

        /* Portfolio lightbox controls — always visible */
        #lightbox.portfolio-lightbox.is-open #lightbox-close,
        #lightbox.portfolio-lightbox.is-open #lightbox-prev,
        #lightbox.portfolio-lightbox.is-open #lightbox-next,
        .portfolio-lightbox.is-open .portfolio-lightbox-btn {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 2147483647 !important;
          pointer-events: auto !important;
          color: #fff !important;
          background: rgba(18,18,18,.88) !important;
          border: 1px solid rgba(255,255,255,.35) !important;
        }
        #lightbox-close.portfolio-lightbox-close {
          position: fixed !important;
          top: 18px !important;
          right: 18px !important;
          width: 56px !important;
          height: 56px !important;
          border-radius: 999px !important;
          font-size: 2rem !important;
          line-height: 1 !important;
          background: #FD5C62 !important;
          border: 1px solid rgba(255,255,255,.55) !important;
          box-shadow: 0 10px 28px rgba(0,0,0,.45) !important;
        }

        /* Envira lightbox — icon font often 404s on demo; paint unicode fallbacks */
        .envirabox-container .envirabox-button--close,
        .envirabox-container .envirabox-close,
        .envirabox-container .envirabox-nav,
        .envirabox-container .envirabox-arrow {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 999999 !important;
          pointer-events: auto !important;
          color: #fff !important;
          background: rgba(0,0,0,.55) !important;
          width: 48px !important;
          height: 48px !important;
          border-radius: 999px !important;
          text-decoration: none !important;
        }
        .envirabox-container .envirabox-close:before,
        .envirabox-container .envirabox-button--close:before {
          content: "×" !important;
          font-family: system-ui, sans-serif !important;
          font-size: 28px !important;
          font-weight: 400 !important;
          color: #fff !important;
          line-height: 1 !important;
        }
        .envirabox-container .envirabox-arrow--left span:before,
        .envirabox-container .envirabox-prev span:before {
          content: "‹" !important;
          font-family: system-ui, sans-serif !important;
          font-size: 36px !important;
          color: #fff !important;
        }
        .envirabox-container .envirabox-arrow--right span:before,
        .envirabox-container .envirabox-next span:before {
          content: "›" !important;
          font-family: system-ui, sans-serif !important;
          font-size: 36px !important;
          color: #fff !important;
        }
        .envirabox-container .envirabox-toolbar,
        .envirabox-container .envira-close-button,
        .envirabox-container .envirabox-navigation {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 999999 !important;
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
          line-height: 1.55;
        }
        .dgs-case-modal-close,
        .dgs-case-modal-nav {
          position: fixed;
          z-index: 2147483001;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.35);
          background: rgba(18,18,18,.88);
          color: #fff;
          font-size: 1.75rem;
          cursor: pointer;
          line-height: 1;
        }
        .dgs-case-modal-close { top: 20px; right: 20px; }
        .dgs-case-modal-prev { left: 16px; top: 50%; transform: translateY(-50%); }
        .dgs-case-modal-next { right: 16px; top: 50%; transform: translateY(-50%); }
        .dgs-case-modal-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .dgs-case-modal-metrics strong { display: block; font-size: 1.25rem; }
        .dgs-case-modal-metrics small { color: rgba(255,255,255,.55); }
      `}</style>

      <meta name="dgs-build" content="wp-mirror-2026-08-06f" />

      <div
        id="dgs-wp-home-mirror"
        className="dgs-wp-home-mirror"
        data-dgs-build="wp-mirror-2026-08-06f"
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
