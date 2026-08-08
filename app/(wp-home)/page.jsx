import WpHomeClient from '../components/WpHomeClient';
import { unstable_cache } from 'next/cache';
import { getWpHomeMirror } from '../../lib/wp-mirror';

/**
 * SSR (avoids Hostinger OOM during `next build`) + 15-minute server cache so
 * warm hits do not re-fetch WordPress (main TTFB lever on Hostinger).
 */
const getCachedWpHomeMirror = unstable_cache(
  async () => getWpHomeMirror({ revalidate: 0 }),
  ['wp-home-mirror-v32'],
  { revalidate: 900 }
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
  // Version query so long-lived CSS cache can be busted with deploys.
  const cssBundle = '/api/wp-css?bundle=home&v=08r';
  const lcpPreload = mirror.lcpImage || '';
  const lcpMaster = lcpPreload
    ? lcpPreload.replace(/([?&])dgs_w=\d+/g, '').replace(/[?&]$/, '')
    : '';
  const lcpJoin = lcpMaster.includes('?') ? '&' : '?';
  const lcpSrcset = lcpMaster
    ? `${lcpMaster}${lcpJoin}dgs_w=640 640w, ${lcpMaster}${lcpJoin}dgs_w=720 720w, ${lcpMaster}${lcpJoin}dgs_w=800 800w`
    : '';

  return (
    <>
      {/* Critical first: dark paint before WP CSS. Do NOT min-height the fixed nav
          (that stretched #dgsNav to 100vh and left a huge empty banner). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
html,body{background:#020202;color:#e8e8e6;color-scheme:dark;margin:0;padding:0}
#dgs-wp-home-mirror,.dgs-v1215,.dgs-v1215-fallback{background:#020202}
#dgsNav{background:transparent;min-height:0;height:auto}
.dgs-v1215-shell{width:min(1200px,92vw);margin:0 auto;padding:0 4vw}
.dgs-v1215-hero{min-height:100svh;display:flex;align-items:center;padding:88px 0 40px;box-sizing:border-box}
.dgs-v1215-hero-layout{display:grid;gap:28px;align-items:center}
.dgs-v1215-copy h1{color:#fff;font-family:Syne,system-ui,sans-serif;font-weight:600;letter-spacing:-.04em;line-height:1.05;margin:0;font-size:clamp(2rem,8vw,3.4rem)}
.dgs-v1215-copy p{color:rgba(255,255,255,.74);margin:20px 0 0;line-height:1.6;font-size:1rem}
.dgs-v1215-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px;align-items:center}
.dgs-v1215-actions a{color:#fff;text-decoration:none}
.dgs-v1215-btn,.dgs-v1215-btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:14px 22px;border-radius:999px;background:#FD5C62;color:#fff;font-weight:600}
#dgsPill{color:#fff;background:#FD5C62}
@media(min-width:901px){.dgs-v1215-hero-layout{grid-template-columns:1fr 1fr;gap:48px}}
`.replace(/\n/g, ''),
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.dgeniussolutions.com" />
      {/* LCP image first so it wins bandwidth vs fonts. */}
      {lcpPreload ? (
        <link
          rel="preload"
          as="image"
          href={lcpPreload}
          imageSrcSet={lcpSrcset || undefined}
          imageSizes="(max-width: 900px) min(92vw, 420px), 500px"
          fetchPriority="high"
        />
      ) : null}
      {/* Non-blocking home CSS (~227KB gzip): critical hero CSS paints first on Slow 4G. */}
      <link rel="preload" href={cssBundle} as="style" />
      <link data-dgs-css="home" rel="stylesheet" href={cssBundle} media="print" />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var l=document.querySelector('link[data-dgs-css=\"home\"]');if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();setTimeout(go,2500);})();",
        }}
      />
      <noscript>
        <link rel="stylesheet" href={cssBundle} />
      </noscript>

      {/* Non-blocking Syne (RSC-safe: no React onLoad — use media=print + tiny script). */}
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
      />
      <link
        data-dgs-font="syne"
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
        media="print"
      />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var l=document.querySelector('link[data-dgs-font=\"syne\"]');if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();setTimeout(go,1200);})();",
        }}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
        />
      </noscript>

      <meta name="dgs-build" content="wp-mirror-2026-08-08r" />

      <div
        id="dgs-wp-home-mirror"
        className="dgs-wp-home-mirror"
        data-dgs-build="wp-mirror-2026-08-08r"
        dangerouslySetInnerHTML={{ __html: mirror.bodyHtml }}
      />

      {mirror.stylesheets.map((sheet) => {
        const href =
          typeof sheet.href === 'string' && sheet.href.includes('/api/wp-css?bundle=home')
            ? null
            : sheet.href;
        if (!href) return null;
        if (
          typeof sheet.href === 'string' &&
          sheet.href.includes('/api/wp-css?bundle=home')
        ) {
          return null;
        }
        return (
          <link
            key={`late-${sheet.rel}-${href}`}
            rel={sheet.rel === 'preload' ? 'stylesheet' : sheet.rel}
            href={href}
            media={sheet.media || undefined}
            sizes={sheet.sizes || undefined}
          />
        );
      })}
      {mirror.inlineStyles.map((css, i) => (
        <style key={`inline-style-${i}`} dangerouslySetInnerHTML={{ __html: css }} />
      ))}

      {/* JSON-LD after CSS so it does not compete with first paint. */}
      {mirror.schemas.map((json, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}

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

        /* Invisible hit-target button so case cards stay <article> in the a11y tree */
        .dgs-v1215-case-visual-card,
        .dgs-v1215-case-mini {
          position: relative;
        }
        .dgs-case-open-btn {
          /* Do NOT cover the card — a full-bleed overlay was painting as a
             blue→pink gradient slab on top of screenshots + copy. */
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          clip-path: inset(50%) !important;
          border: 0 !important;
          white-space: nowrap !important;
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          opacity: 0 !important;
          appearance: none !important;
          -webkit-appearance: none !important;
        }
        .dgs-case-open-btn:focus-visible {
          clip: auto !important;
          clip-path: none !important;
          width: auto !important;
          height: auto !important;
          margin: 0 !important;
          inset: 8px auto auto 8px !important;
          opacity: 1 !important;
          color: #fff !important;
          background: #111 !important;
          padding: 6px 10px !important;
          outline: 2px solid #fff !important;
        }

        /*
          Kill rainbow outline ::after. Critical: never set mask:none while
          content/background still apply — that turns the 1px outline into a
          full-card blue→pink gradient cover (what users were seeing).
        */
        html body .dgs-v1215-case-visual-card::before,
        html body .dgs-v1215-case-visual-card::after,
        html body .dgs-v1215-case-mini::before,
        html body .dgs-v1215-case-mini::after,
        html body .dgs-v1215-case-visual-card:hover::before,
        html body .dgs-v1215-case-visual-card:hover::after,
        html body .dgs-v1215-case-mini:hover::before,
        html body .dgs-v1215-case-mini:hover::after {
          content: none !important;
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          padding: 0 !important;
          inset: auto !important;
          background: transparent !important;
          background-image: none !important;
          pointer-events: none !important;
        }

        /* Case study screenshots must paint — no frosted/gradient glass */
        html body .dgs-v1215-case-visual-card,
        html body .dgs-v1215-case-mini {
          background: #111 !important;
          background-image: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          isolation: auto !important;
        }
        html body .dgs-v1215-case-media,
        html body .dgs-weavings-case-media {
          position: relative !important;
          z-index: 1 !important;
          background: #0a0a0a !important;
          background-image: none !important;
          min-height: 220px !important;
        }
        html body .dgs-v1215-case-media img,
        html body .dgs-weavings-case-media img,
        html body .dgs-v1215-case-visual-card img {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
          position: relative !important;
          z-index: 1 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: top center !important;
          filter: none !important;
          mix-blend-mode: normal !important;
        }
        html body .dgs-v1215-case-content {
          position: relative !important;
          z-index: 2 !important;
          background: #111 !important;
          background-image: none !important;
        }

        /*
          Portfolio: flat dark tiles until a real frame/poster is ready.
          Never show the WP radial pink/orange gradient fallback.
        */
        .thumb-fallback,
        .gallery-item .thumb-fallback,
        .case-study-item .thumb-fallback {
          background: #0a0a0a !important;
          background-image: none !important;
          opacity: 1 !important;
        }
        .thumb-video {
          opacity: 0 !important;
          visibility: visible !important;
          z-index: 1 !important;
        }
        .gallery-item.video-ready .thumb-video,
        .case-study-item.video-ready .thumb-video {
          opacity: 1 !important;
        }
        .thumb-poster,
        .thumb-img.thumb-poster {
          z-index: 2 !important;
        }
        .gallery-item.video-ready .thumb-fallback,
        .case-study-item.video-ready .thumb-fallback {
          opacity: 0 !important;
        }
        .gallery-item.thumb-failed .thumb-fallback,
        .case-study-item.thumb-failed .thumb-fallback,
        .gallery-item.awaiting-frame .thumb-fallback,
        .case-study-item.awaiting-frame .thumb-fallback {
          opacity: 1 !important;
          background: #0a0a0a !important;
          background-image: none !important;
        }
        /* Hide WP loading spinners sitting on empty tiles */
        .gallery-item .loading-spinner,
        .case-study-item .loading-spinner,
        .gallery-item .spinner,
        .case-study-item .spinner {
          display: none !important;
        }

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

        /* About Us band — centered copy like other sections + full-bleed video */
        html body .dgs-v1215-about {
          position: relative;
          z-index: 2;
          padding: clamp(3.5rem, 7vw, 5.75rem) 0 0;
          overflow: clip;
        }
        html body .dgs-v1215-about-head {
          text-align: center;
          max-width: 52rem;
          margin: 0 auto clamp(2.25rem, 4.5vw, 3.25rem);
        }
        html body .dgs-v1215-about-head .dgs-v1215-section-kicker {
          margin-bottom: 0.95rem;
        }
        html body .dgs-v1215-about-head h2 {
          margin: 0 0 1.15rem;
          /* Match other dgs-v1215 section titles (do not shrink) */
          font-size: clamp(2rem, 4.2vw, 3.15rem) !important;
          line-height: 1.12 !important;
          letter-spacing: -0.02em;
          color: #fff;
        }
        html body .dgs-v1215-about-head p {
          margin: 0 auto 1rem;
          max-width: 44rem;
          color: rgba(255, 255, 255, 0.78);
          font-size: clamp(1.05rem, 1.55vw, 1.2rem) !important;
          line-height: 1.7 !important;
        }
        html body .dgs-v1215-about-founders {
          color: rgba(255, 255, 255, 0.62) !important;
          font-size: clamp(1rem, 1.4vw, 1.12rem) !important;
        }
        html body .dgs-v1215-about-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 1rem 1.35rem;
          margin-top: 1.75rem;
        }
        html body .dgs-v1215-about-inline {
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          font-size: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.35);
          padding-bottom: 2px;
        }
        html body .dgs-v1215-about-inline:hover {
          color: #fff;
          border-bottom-color: rgba(255, 255, 255, 0.8);
        }
        /* Dedicated end-to-end video plane (breaks out of the content shell) */
        html body .dgs-v1215-about-media {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          aspect-ratio: 21 / 9;
          min-height: clamp(220px, 42vw, 560px);
          overflow: hidden;
          background: #0a0a0a;
          border: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        html body .dgs-about-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
          cursor: pointer;
          background: #0a0a0a;
          color: #fff;
        }
        html body .dgs-about-video img,
        html body .dgs-about-video-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 0;
          display: block;
        }
        html body .dgs-about-video img {
          /* Keep cover crisp on the wide band without overserving huge bytes */
          background: #0a0a0a;
        }
        html body .dgs-about-video-frame {
          object-fit: unset;
        }
        html body .dgs-about-video-play {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 4.5rem;
          height: 4.5rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: none;
          pointer-events: none;
        }
        html body .dgs-about-video:hover .dgs-about-video-play,
        html body .dgs-about-video:focus-visible .dgs-about-video-play {
          border-color: #fff;
          background: #161616;
        }
        @media (max-width: 900px) {
          html body .dgs-v1215-about-media {
            aspect-ratio: 16 / 9;
            min-height: 0;
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

        /* Footer legal/copyright: WP used rgba(255,255,255,.45) which fails contrast. */
        html body .dgs-footer-copyright,
        html body .dgs-footer-legal-link {
          color: rgba(255, 255, 255, 0.78) !important;
        }
        html body .dgs-footer-legal-link:hover {
          color: rgba(255, 255, 255, 0.95) !important;
        }
        html body .dgs-footer-legal-divider {
          color: rgba(255, 255, 255, 0.55) !important;
        }

        /* LET'S TALK pill — brand coral */
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
          background-image: none !important;
          box-shadow: 0 0 18px rgba(253, 92, 98, 0.45) !important;
        }
        html body #dgsPill svg,
        html body #dgsPill svg path {
          stroke: #ffffff !important;
        }

      `}</style>

      {/* After mirror HTML: responsive + contact overrides win on cascade */}
      <style id="dgs-responsive-overrides">{`
        /* Reinforce pill brand color after mirrored WP CSS */
        html body #dgsPill.dgs-talk-trigger,
        html body #dgsPill {
          color: #ffffff !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
        }

        /* ——— Global: contain horizontal overflow from 4K → phone ——— */
        html body #dgs-wp-home-mirror,
        html body #dgs-wp-home-mirror .dgs-v1215 {
          overflow-x: clip !important;
          max-width: 100% !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-shell {
          width: min(1480px, calc(100% - 32px)) !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-rail-line,
        html body #dgs-wp-home-mirror .dgs-v1215-rail-track {
          max-width: 100% !important;
          overflow: hidden !important;
        }

        /* Stat line: fluid columns + never mid-word break "Mumbai" */
        html body #dgs-wp-home-mirror .dgs-v1215-statline {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-statline div {
          min-width: 0 !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-statline strong {
          white-space: nowrap !important;
          overflow-wrap: normal !important;
          word-break: keep-all !important;
          font-size: clamp(1.35rem, 2.4vw, 2.75rem) !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-statline span {
          font-size: clamp(11px, 1.05vw, 14px) !important;
        }

        /* Logo / card grids: never force 150px mins that overflow phones */
        html body #dgs-wp-home-mirror .dgs-v1215-logo-track {
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        }
        html body #dgs-wp-home-mirror .dgs-v1215-authority-grid,
        html body #dgs-wp-home-mirror .dgs-v1215-proof-strip,
        html body #dgs-wp-home-mirror .dgs-v1215-testimonial-grid,
        html body #dgs-wp-home-mirror .dgs-v1215-faq-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        }

        /* ——— Contact Us: centered, flat submit, one-line CTA ——— */
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: clamp(20px, 2.5vw, 36px) !important;
          text-align: center !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > div {
          width: 100% !important;
          max-width: min(720px, 100%) !important;
          margin-left: auto !important;
          margin-right: auto !important;
          text-align: center !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > div > span,
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card h2,
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card p {
          text-align: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 100% !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card h2 {
          font-size: clamp(1.85rem, 4.2vw, 4.5rem) !important;
          line-height: 1.05 !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-form-shortcode,
        html body #contact-form.dgs-v1215-final .fluentform,
        html body #contact-form.dgs-v1215-final form.fluent_form_1 {
          width: 100% !important;
          max-width: min(560px, 100%) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-form-shortcode {
          margin-top: 22px !important;
        }
        html body #contact-form.dgs-v1215-final .ff-el-group:has(.ff-btn-submit),
        html body #contact-form.dgs-v1215-final .ff-el-group.ff-text-left:has(.ff-btn-submit),
        html body #contact-form.dgs-v1215-final .ff-t-container:has(.ff-btn-submit) {
          text-align: center !important;
          display: flex !important;
          justify-content: center !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn,
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn-primary {
          align-self: center !important;
          justify-self: center !important;
          margin-left: auto !important;
          margin-right: auto !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: min(100%, 420px) !important;
          min-height: 0 !important;
          height: auto !important;
          padding: 12px 22px !important;
          white-space: nowrap !important;
          text-align: center !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 10px !important;
          font-size: clamp(12px, 1.05vw, 15px) !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          background: #FD5C62 !important;
          background-image: none !important;
          background-color: #FD5C62 !important;
          box-shadow: none !important;
        }
        html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn span {
          margin-left: 0 !important;
        }
        html body #contact-form .fluentform .ff-btn-submit,
        html body #contact-form .fluentform button[type="submit"],
        html body #contact-form form.fluent_form_1 .ff-btn-submit:not(.ff_btn_no_style),
        html body #contact-form .ff-btn.ff-btn-submit.ff_btn_style {
          position: relative !important;
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
          border: 0 !important;
          box-shadow: none !important;
          color: #fff !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        html body #contact-form .fluentform .ff-btn-submit::before,
        html body #contact-form .fluentform .ff-btn-submit::after,
        html body #contact-form .fluentform button[type="submit"]::before,
        html body #contact-form .fluentform button[type="submit"]::after,
        html body #contact-form form.fluent_form_1 .ff-btn-submit::before,
        html body #contact-form form.fluent_form_1 .ff-btn-submit::after,
        html body #contact-form .ff-btn.ff-btn-submit.ff_btn_style::before,
        html body #contact-form .ff-btn.ff-btn-submit.ff_btn_style::after {
          content: none !important;
          display: none !important;
          background: none !important;
          background-image: none !important;
          background-color: transparent !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          visibility: hidden !important;
        }
        html body #contact-form .fluentform .ff-btn-submit:hover,
        html body #contact-form .fluentform button[type="submit"]:hover,
        html body #contact-form form.fluent_form_1 .ff-btn-submit:not(.ff_btn_no_style):hover {
          background: #FD5C62 !important;
          background-color: #FD5C62 !important;
          background-image: none !important;
          opacity: 0.92 !important;
          box-shadow: none !important;
        }

        /* ——— Breakpoints: 4K → tablet → phone ——— */
        @media (min-width: 1920px) {
          html body #dgs-wp-home-mirror .dgs-v1215-shell {
            width: min(1760px, calc(100% - 96px)) !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > div {
            max-width: min(900px, 100%) !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-form-shortcode,
          html body #contact-form.dgs-v1215-final .fluentform,
          html body #contact-form.dgs-v1215-final form.fluent_form_1 {
            max-width: min(640px, 100%) !important;
          }
        }
        @media (min-width: 2560px) {
          html body #dgs-wp-home-mirror .dgs-v1215-shell {
            width: min(2200px, calc(100% - 160px)) !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > div {
            max-width: min(1100px, 100%) !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-form-shortcode,
          html body #contact-form.dgs-v1215-final .fluentform,
          html body #contact-form.dgs-v1215-final form.fluent_form_1 {
            max-width: min(720px, 100%) !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card h2 {
            font-size: clamp(3.5rem, 3.2vw, 5.5rem) !important;
          }
        }
        @media (max-width: 1180px) {
          html body #dgs-wp-home-mirror .dgs-v1215-authority-grid,
          html body #dgs-wp-home-mirror .dgs-v1215-proof-strip,
          html body #dgs-wp-home-mirror .dgs-v1215-testimonial-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          html body #dgs-wp-home-mirror .dgs-v1215-logo-track {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          html body #dgs-wp-home-mirror .dgs-v1215-statline {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 700px) {
          html body #dgs-wp-home-mirror .dgs-v1215-shell {
            width: min(100% - 24px, 1480px) !important;
          }
          html body #dgs-wp-home-mirror .dgs-v1215-faq-grid,
          html body #dgs-wp-home-mirror .dgs-v1215-authority-grid,
          html body #dgs-wp-home-mirror .dgs-v1215-proof-strip,
          html body #dgs-wp-home-mirror .dgs-v1215-testimonial-grid,
          html body #dgs-wp-home-mirror .dgs-v1215-logo-track {
            grid-template-columns: 1fr !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card {
            padding: clamp(22px, 5vw, 34px) clamp(16px, 4vw, 24px) !important;
            border-radius: 24px !important;
          }
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn,
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn-primary {
            width: auto !important;
            max-width: 100% !important;
            font-size: 12px !important;
            padding: 11px 18px !important;
            white-space: nowrap !important;
          }
        }
        @media (max-width: 560px) {
          html body #dgs-wp-home-mirror .dgs-v1215-statline {
            grid-template-columns: 1fr !important;
          }
          html body #dgs-wp-home-mirror .dgs-v1215-logo-track {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 380px) {
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn,
          html body #contact-form.dgs-v1215-final .dgs-v1215-final-card > .dgs-v1215-btn-primary {
            white-space: normal !important;
            text-align: center !important;
            line-height: 1.25 !important;
          }
        }
      `}</style>

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
