
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: "About Us | D’Genius Solutions — Full-Service Digital Marketing Agency in Mumbai",
  description: "D’Genius Solutions is a premier digital marketing agency in Mumbai founded by Sneha & Kohin Bellara. Learn about our team, vision, and AI-driven growth solutions.",
  alternates: {
    canonical: "https://www.dgeniussolutions.com/about-us/",
  },
};

export default function Page() {
  return (
    <>
      {[].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
      <Header />
      <div dangerouslySetInnerHTML={{ __html: `<style id="dgs-local-font-face">@font-face{ font-family:"Manrope";src:url("/wp-content/cache/fonts/1/google-fonts/fonts/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap; }
@font-face{ font-family:"Space Grotesk";src:url("/wp-content/cache/fonts/1/google-fonts/fonts/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2") format("woff2");font-weight:300 700;font-style:normal;font-display:swap; }</style>
<style id="critical-css">body{font-family:"Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#d2d2cf;background-color:#020202;margin:0;padding:0;line-height:1.6}
h1,h2,h3,h4,h5,h6{font-family:"Space Grotesk","Manrope",-apple-system,BlinkMacSystemFont,sans-serif;color:#fff;margin:0 0 1rem;font-weight:500}
p{margin:0 0 1rem}a{color:#a900ff;text-decoration:none;transition:color .3s ease}a:hover{color:#b6b6b3}.cmsmasters-header{background-color:#020202;position:sticky;top:0;z-index:999;border-bottom:1px solid rgba(255,255,255,.05)}
.elementor-section{position:relative}img{max-width:100%;height:auto;display:block}.elementor-invisible{visibility:hidden}.elementor-widget-container:empty{min-height:50px}html{scroll-behavior:smooth}*{box-sizing:border-box}
#portfolio .elementor-invisible,#portfolio .elementor-widget,#portfolio .elementor-widget-container,#portfolio .elementor-element{visibility:visible!important;opacity:1!important;transform:none!important;animation:none!important}#portfolio video{display:block!important;visibility:visible!important;opacity:1!important}</style>
<style>.lazyload,
			.lazyloading {
				max-width: 100%;
			}</style>
<style id="wp-img-auto-sizes-contain-inline-css">img:is([sizes=auto i],[sizes^="auto," i]){contain-intrinsic-size:3000px 1500px}
/*# sourceURL=wp-img-auto-sizes-contain-inline-css */</style>
<style id="rank-math-related-posts-style-inline-css">.wp-block-rank-math-related-posts{--rm-related-gap: 1rem;--rm-related-border-radius: 6px;--rm-related-card-padding: 16px;--rm-related-hover-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);--rm-related-transition: 0.2s ease}.wp-block-rank-math-related-posts.rank-math-related-posts{display:block}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-wrap{display:grid;gap:var(--rm-related-gap)}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-vertical .rank-math-related-wrap,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-vertical .rank-math-related-wrap{grid-template-columns:repeat(auto-fill, minmax(220px, 1fr))}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-wrap,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-wrap{grid-template-columns:repeat(auto-fill, minmax(400px, 1fr))}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-item,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-item{display:flex;gap:16px;align-items:flex-start}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-thumb,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-thumb{flex:0 0 140px;overflow:hidden}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-thumb img,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-thumb img{width:140px;height:140px;-o-object-fit:cover;object-fit:cover}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-content,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-content{flex:1;min-width:0;display:flex;flex-direction:column}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-title,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-title{margin-top:0}@media (max-width: 640px){.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-wrap,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-wrap{grid-template-columns:1fr}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-thumb,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-thumb{flex:0 0 100px}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-grid-horizontal .rank-math-related-thumb img,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-grid-horizontal .rank-math-related-thumb img{width:100px;height:100px}}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-vertical .rank-math-related-wrap,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-vertical .rank-math-related-wrap{grid-template-columns:1fr}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-wrap,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-wrap{grid-template-columns:1fr}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-item,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-item{display:flex;gap:20px;align-items:flex-start}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb{flex:0 0 180px;overflow:hidden}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb img,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb img{width:180px;height:180px;-o-object-fit:cover;object-fit:cover}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-content,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-content{flex:1;min-width:0;display:flex;flex-direction:column}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-title,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-title{margin-top:0}@media (max-width: 640px){.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-item,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-item{gap:16px}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb{flex:0 0 120px}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb img,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb img{width:120px;height:120px}}@media (max-width: 480px){.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-item,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-item{flex-direction:column}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb{flex:0 0 auto;width:100%}.wp-block-rank-math-related-posts.rank-math-related-posts.is-style-list-horizontal .rank-math-related-thumb img,.wp-block-rank-math-related-posts.rank-math-related-posts.rank-math-related-list-horizontal .rank-math-related-thumb img{width:100%;height:auto;max-height:200px}}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-item{border-radius:var(--rm-related-border-radius);padding:var(--rm-related-card-padding);background:inherit;transition:transform var(--rm-related-transition),box-shadow var(--rm-related-transition)}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-item:hover{transform:translateY(-2px);box-shadow:var(--rm-related-hover-shadow)}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-title{margin:0.5rem 0;font-size:inherit;line-height:inherit}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-title a{color:inherit;text-decoration:none;transition:color 0.2s ease}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-title a:hover{color:#2563eb;text-decoration:underline}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-title:not(:has(a)){cursor:default}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-thumb{position:relative;overflow:hidden;border-radius:4px;display:block}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-thumb img{display:block;width:100%;height:auto;border-radius:4px;transition:transform 0.3s ease}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-thumb:hover img{transform:scale(1.05)}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-thumb:not(a){cursor:default}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-thumb:not(a):hover img{transform:none}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-date{margin-top:0.25rem;font-size:0.85em;opacity:0.7}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-terms{margin-top:0.5rem}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-chip{display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:999px;padding:0.15rem 0.5rem;margin-right:0.35rem;font-size:0.8em}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-excerpt{margin-top:0.5rem;color:inherit;opacity:0.8;font-size:0.9em;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-more{margin-top:1rem}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-button{display:inline-block;background:#111827;color:#fff;border-radius:6px;padding:0.625rem 1.25rem;text-decoration:none;font-weight:500;transition:background 0.2s ease, transform 0.2s ease}.wp-block-rank-math-related-posts.rank-math-related-posts .rank-math-related-button:hover{background:#1f2937;transform:translateY(-1px)}.wp-block-rank-math-related-posts.has-border-color .rank-math-related-item{border-color:inherit}.wp-block-rank-math-related-posts.has-border-width .rank-math-related-item{border-width:inherit}.wp-block-rank-math-related-posts.has-border-style .rank-math-related-item{border-style:inherit}.wp-block-rank-math-related-posts.has-border-radius .rank-math-related-item{border-radius:inherit}.wp-block-rank-math-related-posts:not(.has-border-color):not(.has-border-width):not(.has-border-style) .rank-math-related-item{border:1px solid #e5e7eb}

/*# sourceURL=https://www.dgeniussolutions.com/wp-content/plugins/seo-by-rank-math-pro/includes/modules/link-genius/blocks/related/assets/css/styles.css */</style>
<style id="woocommerce-inline-inline-css">.woocommerce form .form-row .required { visibility: visible; }
/*# sourceURL=woocommerce-inline-inline-css */</style>
<style id="softy-solutions-gutenberg-inline-css">.has-cmsmasters-colors-text-color {
				color: var(--cmsmasters-colors-text) !important;
			}

			.has-cmsmasters-colors-text-background-color {
				background-color: var(--cmsmasters-colors-text) !important;
			}
			
			.has-cmsmasters-colors-link-color {
				color: var(--cmsmasters-colors-link) !important;
			}

			.has-cmsmasters-colors-link-background-color {
				background-color: var(--cmsmasters-colors-link) !important;
			}
			
			.has-cmsmasters-colors-hover-color {
				color: var(--cmsmasters-colors-hover) !important;
			}

			.has-cmsmasters-colors-hover-background-color {
				background-color: var(--cmsmasters-colors-hover) !important;
			}
			
			.has-cmsmasters-colors-heading-color {
				color: var(--cmsmasters-colors-heading) !important;
			}

			.has-cmsmasters-colors-heading-background-color {
				background-color: var(--cmsmasters-colors-heading) !important;
			}
			
			.has-cmsmasters-colors-bg-color {
				color: var(--cmsmasters-colors-bg) !important;
			}

			.has-cmsmasters-colors-bg-background-color {
				background-color: var(--cmsmasters-colors-bg) !important;
			}
			
			.has-cmsmasters-colors-alternate-color {
				color: var(--cmsmasters-colors-alternate) !important;
			}

			.has-cmsmasters-colors-alternate-background-color {
				background-color: var(--cmsmasters-colors-alternate) !important;
			}
			
			.has-cmsmasters-colors-bd-color {
				color: var(--cmsmasters-colors-bd) !important;
			}

			.has-cmsmasters-colors-bd-background-color {
				background-color: var(--cmsmasters-colors-bd) !important;
			}
			
/*# sourceURL=softy-solutions-gutenberg-inline-css */</style>
<style>.no-js img.lazyload {
				display: none;
			}

			figure.wp-block-image img.lazyloading {
				min-width: 150px;
			}

			.lazyload,
			.lazyloading {
				--smush-placeholder-width: 100px;
				--smush-placeholder-bg-max-width: 120px;
				--smush-placeholder-aspect-ratio: 1/1;
				width: var(--smush-image-width, var(--smush-placeholder-width)) !important;
				aspect-ratio: var(--smush-image-aspect-ratio, var(--smush-placeholder-aspect-ratio)) !important;
			}

						.lazyload, .lazyloading {
				opacity: 0;
			}

			.lazyloaded {
				opacity: 1;
				transition: opacity 400ms;
				transition-delay: 0ms;
			}</style>
<style>.woocommerce-product-gallery{ opacity: 1 !important; }</style>
<style>.e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload),
				.e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) * {
					background-image: none !important;
				}
				@media screen and (max-height: 1024px) {
					.e-con.e-parent:nth-of-type(n+3):not(.e-lazyloaded):not(.e-no-lazyload),
					.e-con.e-parent:nth-of-type(n+3):not(.e-lazyloaded):not(.e-no-lazyload) * {
						background-image: none !important;
					}
				}
				@media screen and (max-height: 640px) {
					.e-con.e-parent:nth-of-type(n+2):not(.e-lazyloaded):not(.e-no-lazyload),
					.e-con.e-parent:nth-of-type(n+2):not(.e-lazyloaded):not(.e-no-lazyload) * {
						background-image: none !important;
					}
				}</style>
<style id="rocket-lazyrender-inline-css">[data-wpr-lazyrender] {content-visibility: auto;}</style>
<style>#dgsNav,
#dgsNav *,
#dgsNav *::before,
#dgsNav *::after {
  box-sizing: border-box !important;
  -webkit-font-smoothing: antialiased !important;
}

#dgsNav a,
#dgsNav a:hover,
#dgsNav a:visited,
#dgsNav a:focus,
#dgsNav a:active {
  text-decoration: none !important;
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

#dgsNav {
  --acc: #FD5C62;
  --blk: #080808;
  --bdr: rgba(255,255,255,0.08);
  --mut: rgba(255,255,255,0.35);
  --bar: 100px;
}

#dgsBar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: var(--bar) !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 48px !important;
  background: transparent !important;
  background-image: none !important;
  transition: background-color .4s ease !important;
}

#dgsBar.scrolled,
#dgsNav.nav-open #dgsBar {
  background-color: rgba(8,8,8,.93) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

#dgsLogo {
  display: flex !important;
  align-items: center !important;
  height: var(--bar) !important;
  flex-shrink: 0 !important;
  text-decoration: none !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

#dgsLogo img {
  height: 117px !important;
  width: 117px !important;
  object-fit: contain !important;
  display: block !important;
}

#dgsRight {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
}

#dgsPill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  text-transform: uppercase !important;
  color: #fff !important;
  background-color: #FD5C62 !important;
  background-image: none !important;
  padding: 11px 22px !important;
  border-radius: 100px !important;
  border: none !important;
  box-shadow: none !important;
  white-space: nowrap !important;
  cursor: pointer !important;
  transition: transform .3s ease, box-shadow .3s ease !important;
}

#dgsPill:hover {
  transform: scale(1.04) !important;
  box-shadow: 0 0 22px rgba(253,92,98,.5) !important;
  color: #fff !important;
}

#dgsPill svg {
  width: 13px;
  height: 13px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

#dgsTrig {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: 1px solid rgba(255,255,255,.22) !important;
  border-radius: 100px !important;
  padding: 10px 18px !important;
  cursor: pointer !important;
  box-shadow: none !important;
  outline: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  transition: border-color .3s, background-color .3s !important;
}

#dgsTrig:hover {
  background-color: rgba(255,255,255,.06) !important;
  border-color: rgba(255,255,255,.4) !important;
}

#dgsLines {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  width: 20px !important;
  pointer-events: none !important;
}

#dgsLines em {
  display: block !important;
  height: 1.5px !important;
  width: 100% !important;
  background-color: #ffffff !important;
  border-radius: 2px !important;
  font-style: normal !important;
  transition: transform .42s cubic-bezier(.76,0,.24,1),
              opacity .42s ease,
              width .42s ease !important;
}

#dgsLines em:nth-child(2) {
  width: 65% !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg) !important;
  width: 100% !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(2) {
  opacity: 0 !important;
  transform: scaleX(0) !important;
}

#dgsNav.nav-open #dgsLines em:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg) !important;
}

#dgsTrigLabel {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  min-width: 38px !important;
  pointer-events: none !important;
  line-height: 1 !important;
}

#dgsOverlay {
  position: fixed !important;
  top: var(--bar) !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: calc(100vh - var(--bar)) !important;
  height: calc(100dvh - var(--bar)) !important;
  z-index: 99998 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  overflow: hidden !important;
  max-width: 100vw !important;
  overscroll-behavior: contain !important;
}

#dgsNav.nav-open #dgsOverlay {
  visibility: visible !important;
  pointer-events: auto !important;
}

#dgsPanel {
  position: absolute !important;
  inset: 0 !important;
  height: 100% !important;
  background-color: #080808 !important;
  background-image: none !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  max-width: 100vw !important;
  transform: translateY(-100%) !important;
  transition: transform .8s cubic-bezier(.76,0,.24,1) !important;
}

#dgsNav.nav-open #dgsPanel {
  transform: translateY(0%) !important;
}

#dgsPanelBody {
  flex: 1 !important;
  display: grid !important;
  grid-template-columns: 1fr 300px !important;
  min-height: 0 !important;
  overflow: hidden !important;
  max-width: 100vw !important;
}

#dgsLinks {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  padding: 36px 48px 28px !important;
  border-right: 1px solid var(--bdr) !important;
  overflow: hidden !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

.dg-item {
  border-bottom: 1px solid var(--bdr) !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  position: relative !important;
  max-width: 100% !important;
  min-width: 0 !important;
}

#dgsNav.nav-open .dg-item:nth-child(1) .dg-row {
  animation: dgSlideIn .5s .38s both;
}

#dgsNav.nav-open .dg-item:nth-child(2) .dg-row {
  animation: dgSlideIn .5s .43s both;
}

#dgsNav.nav-open .dg-item:nth-child(3) .dg-row {
  animation: dgSlideIn .5s .48s both;
}

#dgsNav.nav-open .dg-item:nth-child(4) .dg-row {
  animation: dgSlideIn .5s .53s both;
}

#dgsNav.nav-open .dg-item:nth-child(5) .dg-row {
  animation: dgSlideIn .5s .58s both;
}

#dgsNav.nav-open .dg-item:nth-child(6) .dg-row {
  animation: dgSlideIn .5s .63s both;
}

#dgsNav.nav-open .dg-item:nth-child(7) .dg-row {
  animation: dgSlideIn .5s .68s both;
}

#dgsNav.nav-open .dg-item:nth-child(8) .dg-row {
  animation: dgSlideIn .5s .73s both;
}

@keyframes dgSlideIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dg-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 11px 0 !important;
  cursor: pointer !important;
  text-decoration: none !important;
  background: none !important;
  background-image: none !important;
  border: none !important;
  color: #fff !important;
  width: 100% !important;
  position: relative !important;
}

.dg-lbl {
  font-family: 'Syne', sans-serif !important;
  font-size: clamp(26px, 4vw, 56px) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  letter-spacing: -.02em !important;
  line-height: 1 !important;
  pointer-events: none !important;
  transition: color .28s ease, transform .32s ease !important;
}

.dg-item:hover .dg-lbl {
  color: #FD5C62 !important;
  transform: translateX(5px) !important;
}

.dg-badge {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 50% !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: background-color .28s ease, border-color .28s ease !important;
}

.dg-badge svg {
  width: 12px !important;
  height: 12px !important;
  stroke: rgba(255,255,255,.45) !important;
  fill: none !important;
  stroke-width: 1.8 !important;
  pointer-events: none !important;
  transition: stroke .28s ease, transform .35s cubic-bezier(.76,0,.24,1) !important;
}

.dg-item:hover .dg-badge,
.dg-item.svc-open .dg-badge {
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

.dg-item:hover .dg-badge svg,
.dg-item.svc-open .dg-badge svg {
  stroke: #fff !important;
  transform: rotate(45deg) !important;
}

.dg-mq {
  overflow: hidden !important;
  height: 0 !important;
  pointer-events: none !important;
  transition: height .38s cubic-bezier(.76,0,.24,1) !important;
}

.dg-item:hover .dg-mq {
  height: 20px !important;
}

.dg-mq-t {
  display: flex !important;
  white-space: nowrap !important;
  animation: dgRun 12s linear infinite !important;
}

.dg-mq-t span {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .2em !important;
  text-transform: uppercase !important;
  color: #FD5C62 !important;
  padding-right: 40px !important;
  flex-shrink: 0 !important;
  opacity: .85 !important;
}

@keyframes dgRun {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

#dgsSvcItem .dg-badge {
  background-color: rgba(253,92,98,0.12) !important;
  border-color: #FD5C62 !important;
  width: auto !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  gap: 4px !important;
}

#dgsSvcItem .dg-badge svg {
  stroke: #FD5C62 !important;
}

#dgsSvcItem .dg-badge::after {
  content: 'TAP TO EXPAND' !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 8px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  color: #FD5C62 !important;
  white-space: nowrap !important;
  display: block !important;
}

#dgsSvcItem.svc-open .dg-badge {
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

#dgsSvcItem.svc-open .dg-badge svg {
  stroke: #ffffff !important;
  transform: rotate(180deg) !important;
}

#dgsSvcItem.svc-open .dg-badge::after {
  color: #ffffff !important;
}

.dg-sub {
  display: grid !important;
  grid-template-columns: repeat(3,1fr) !important;
  gap: 4px 12px !important;
  max-height: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  transform: translateY(-6px) !important;
  transition: max-height .45s cubic-bezier(.76,0,.24,1),
              opacity .25s ease,
              padding .35s ease,
              transform .35s ease !important;
}

.dg-sub.open {
  max-height: 260px !important;
  opacity: 1 !important;
  padding: 4px 0 14px !important;
  transform: translateY(0) !important;
}

.dg-sub a {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  color: rgba(255,255,255,.6) !important;
  text-decoration: none !important;
  padding: 6px 0 !important;
  letter-spacing: .02em !important;
  transition: color .2s !important;
  display: block !important;
}

.dg-sub a:hover {
  color: #fff !important;
}

#dgsInfo {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  padding: 32px !important;
  overflow-y: auto !important;
  background-color: #080808 !important;
}

#dgsNav.nav-open .dg-ib:nth-child(1) {
  animation: dgFadeUp .5s .5s both;
}

#dgsNav.nav-open .dg-ib:nth-child(2) {
  animation: dgFadeUp .5s .56s both;
}

#dgsNav.nav-open .dg-ib:nth-child(3) {
  animation: dgFadeUp .5s .62s both;
}

#dgsNav.nav-open #dgsCtaBtn {
  animation: dgFadeUp .5s .68s both;
}

@keyframes dgFadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dg-ib {
  margin-bottom: 26px !important;
}

.dg-lbl2 {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .22em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.28) !important;
  margin-bottom: 10px !important;
  display: block !important;
}

.dg-cl {
  display: block !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #fff !important;
  text-decoration: none !important;
  line-height: 1.9 !important;
  transition: color .2s !important;
}

.dg-cl:hover {
  color: #FD5C62 !important;
}

.dg-addr {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 12px !important;
  color: rgba(255,255,255,.38) !important;
  line-height: 1.8 !important;
}

.dg-socrow {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}

.dg-soc {
  display: inline-flex !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .12em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.38) !important;
  text-decoration: none !important;
  border: 1px solid rgba(255,255,255,.1) !important;
  padding: 6px 12px !important;
  border-radius: 100px !important;
  background: transparent !important;
  background-image: none !important;
  transition: color .25s, background-color .25s, border-color .25s !important;
}

.dg-soc:hover {
  color: #fff !important;
  background-color: #FD5C62 !important;
  border-color: #FD5C62 !important;
}

#dgsCtaBtn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  font-family: 'Syne', sans-serif !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  letter-spacing: .1em !important;
  text-transform: uppercase !important;
  color: #fff !important;
  background-color: #FD5C62 !important;
  background-image: none !important;
  padding: 16px 20px !important;
  border-radius: 12px !important;
  text-decoration: none !important;
  border: none !important;
  box-shadow: none !important;
  width: 100% !important;
  transition: transform .3s, box-shadow .3s !important;
}

#dgsCtaBtn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 28px rgba(253,92,98,.4) !important;
  color: #fff !important;
}

#dgsCtaBtn svg {
  width: 14px;
  height: 14px;
  stroke: #fff;
  fill: none;
  stroke-width: 2;
  flex-shrink: 0;
}

#dgsFoot {
  flex-shrink: 0 !important;
  border-top: 1px solid var(--bdr) !important;
  padding: 14px 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background-color: #080808 !important;
}

#dgsFoot span {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  color: rgba(255,255,255,.28) !important;
}

.dg-fl {
  display: flex !important;
  gap: 20px !important;
}

.dg-fl a {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: .1em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.28) !important;
  text-decoration: none !important;
  transition: color .2s !important;
}

.dg-fl a:hover {
  color: #fff !important;
}

@media (max-height: 760px) and (min-width: 861px) {
  #dgsPanelBody {
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsLinks {
    justify-content: flex-start !important;
    overflow: visible !important;
    padding-top: 30px !important;
  }

  .dg-lbl {
    font-size: clamp(24px, 3.1vw, 42px) !important;
  }

  .dg-row {
    padding: 8px 0 !important;
  }

  #dgsInfo {
    padding: 24px !important;
  }
}

@media (max-width: 860px) {
  #dgsNav {
    --bar: 72px;
  }

  #dgsBar {
    padding: 0 16px !important;
    height: 72px !important;
    max-width: 100vw !important;
  }

  #dgsLogo {
    height: 72px !important;
  }

  #dgsLogo img {
    height: 58px !important;
    width: 58px !important;
  }

  #dgsPill {
    display: none !important;
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 !important;
    pointer-events: none !important;
  }

  #dgsTrig {
    padding: 9px 14px !important;
    gap: 8px !important;
  }

  #dgsPanelBody {
    grid-template-columns: 1fr !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    max-width: 100vw !important;
    height: 100% !important;
  }

  #dgsLinks {
    padding: 14px 16px 6px !important;
    border-right: none !important;
    border-bottom: 1px solid var(--bdr) !important;
    justify-content: flex-start !important;
    overflow: visible !important;
    max-width: 100vw !important;
    min-width: 0 !important;
  }

  .dg-mq {
    display: none !important;
  }

  .dg-lbl {
    font-size: clamp(24px, 6.2vw, 34px) !important;
  }

  .dg-row {
    padding: 6px 0 !important;
  }

  .dg-sub {
    grid-template-columns: repeat(2,1fr) !important;
    gap: 2px 10px !important;
  }

  .dg-sub.open {
    max-height: 300px !important;
    padding: 2px 0 10px !important;
  }

  .dg-sub a {
    font-size: 12px !important;
    line-height: 1.35 !important;
    padding: 4px 0 !important;
  }

  #dgsSvcItem .dg-badge::after {
    display: none !important;
  }

  #dgsSvcItem .dg-badge {
    padding: 0 10px !important;
    width: auto !important;
    min-width: 36px !important;
  }

  #dgsInfo {
    padding: 12px 16px 14px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  .dg-ib {
    margin-bottom: 10px !important;
  }

  .dg-lbl2 {
    margin-bottom: 5px !important;
    font-size: 9px !important;
  }

  .dg-cl {
    font-size: 12px !important;
    line-height: 1.45 !important;
    word-break: break-word !important;
  }

  .dg-addr {
    font-size: 11px !important;
    line-height: 1.45 !important;
    margin: 0 !important;
  }

  .dg-socrow {
    gap: 5px !important;
    flex-wrap: wrap !important;
    max-width: 100% !important;
  }

  .dg-soc {
    font-size: 9px !important;
    padding: 5px 10px !important;
  }

  #dgsCtaBtn {
    padding: 11px 16px !important;
    font-size: 11px !important;
    letter-spacing: .08em !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 4px !important;
    border-radius: 10px !important;
  }

  #dgsFoot {
    padding: 8px 16px !important;
    flex-direction: column !important;
    gap: 4px !important;
    align-items: flex-start !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  #dgsFoot span {
    font-size: 10px !important;
  }

  .dg-fl {
    gap: 12px !important;
  }

  .dg-fl a {
    font-size: 10px !important;
  }
}

@media (max-width: 480px) {
  #dgsTrigLabel {
    display: none !important;
  }

  #dgsTrig {
    padding: 10px 12px !important;
    gap: 0 !important;
  }

  #dgsRight {
    gap: 8px !important;
  }

  .dg-lbl {
    font-size: clamp(23px, 6vw, 32px) !important;
  }

  .dg-sub a {
    font-size: 12px !important;
  }

  #dgsInfo {
    padding-top: 10px !important;
  }
}

@media (max-width: 420px) and (max-height: 740px) {
  .dg-lbl {
    font-size: clamp(21px, 5.6vw, 28px) !important;
  }

  .dg-row {
    padding: 5px 0 !important;
  }

  #dgsLinks {
    padding: 10px 14px 4px !important;
  }

  #dgsInfo {
    padding: 9px 14px 10px !important;
  }

  .dg-ib {
    margin-bottom: 8px !important;
  }

  .dg-cl {
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .dg-addr {
    font-size: 10.5px !important;
    line-height: 1.35 !important;
  }

  .dg-soc {
    font-size: 8px !important;
    padding: 4px 8px !important;
  }

  #dgsCtaBtn {
    padding: 9px 14px !important;
  }

  #dgsFoot {
    padding: 6px 14px !important;
  }

  #dgsFoot span,
  .dg-fl a {
    font-size: 9px !important;
  }
}


/* DGS Let's Talk Popup Form - scoped and responsive */
#dgsTalkPopup,
#dgsTalkPopup *,
#dgsTalkPopup *::before,
#dgsTalkPopup *::after {
  box-sizing: border-box !important;
  -webkit-font-smoothing: antialiased !important;
}

#dgsTalkPopup {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1000000 !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 22px !important;
  font-family: 'DM Sans', sans-serif !important;
}

#dgsTalkPopup.is-open {
  display: flex !important;
}

.dgs-talk-backdrop {
  position: absolute !important;
  inset: 0 !important;
  background:
    radial-gradient(circle at 22% 18%, rgba(253,92,98,.20), transparent 34%),
    radial-gradient(circle at 80% 78%, rgba(253,92,98,.14), transparent 32%),
    rgba(8,8,8,.84) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  opacity: 0 !important;
  transition: opacity .28s ease !important;
}

#dgsTalkPopup.is-open .dgs-talk-backdrop {
  opacity: 1 !important;
}

.dgs-talk-box {
  position: relative !important;
  z-index: 2 !important;
  width: min(100%, 540px) !important;
  max-height: 88vh !important;
  overflow-y: auto !important;
  background: rgba(8,8,8,.94) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
  border-radius: 22px !important;
  color: #fff !important;
  box-shadow: 0 34px 100px rgba(0,0,0,.72), 0 0 46px rgba(253,92,98,.16) !important;
  transform: translateY(18px) scale(.97) !important;
  opacity: 0 !important;
  transition: transform .32s cubic-bezier(.76,0,.24,1), opacity .28s ease !important;
}

#dgsTalkPopup.is-open .dgs-talk-box {
  transform: translateY(0) scale(1) !important;
  opacity: 1 !important;
}

.dgs-talk-box::before {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  height: 3px !important;
  border-radius: 22px 22px 0 0 !important;
  background: linear-gradient(90deg, #FD5C62, #ff8a75, #FD5C62) !important;
}

.dgs-talk-head {
  position: sticky !important;
  top: 0 !important;
  z-index: 3 !important;
  padding: 28px 64px 20px 28px !important;
  background: rgba(8,8,8,.96) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border-bottom: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 22px 22px 0 0 !important;
}

.dgs-talk-kicker {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 10px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.55) !important;
}

.dgs-talk-kicker::before {
  content: '' !important;
  width: 7px !important;
  height: 7px !important;
  border-radius: 999px !important;
  background: #FD5C62 !important;
  box-shadow: 0 0 18px rgba(253,92,98,.85) !important;
}

.dgs-talk-title {
  margin: 0 0 8px !important;
  font-family: 'Syne', sans-serif !important;
  font-size: clamp(27px, 4vw, 36px) !important;
  line-height: 1.05 !important;
  font-weight: 800 !important;
  letter-spacing: -.04em !important;
  color: #fff !important;
  text-transform: uppercase !important;
}

.dgs-talk-title span {
  color: #FD5C62 !important;
}

.dgs-talk-subtitle {
  margin: 0 !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
  color: rgba(255,255,255,.62) !important;
}

.dgs-talk-close {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
  width: 38px !important;
  height: 38px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 999px !important;
  background: rgba(255,255,255,.06) !important;
  color: #fff !important;
  font-size: 22px !important;
  line-height: 1 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all .25s ease !important;
}

.dgs-talk-close:hover {
  border-color: #FD5C62 !important;
  background: rgba(253,92,98,.16) !important;
  transform: rotate(90deg) !important;
}

.dgs-talk-body {
  padding: 26px 28px 30px !important;
}

.dgs-talk-form .fluentform,
.dgs-talk-form form {
  text-align: left !important;
}

.dgs-talk-form .ff-el-group {
  margin-bottom: 16px !important;
}

.dgs-talk-form label,
.dgs-talk-form .ff-el-input--label label {
  color: rgba(255,255,255,.82) !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  margin-bottom: 7px !important;
}

.dgs-talk-form input,
.dgs-talk-form textarea,
.dgs-talk-form select,
.dgs-talk-form .ff-el-form-control {
  width: 100% !important;
  min-height: 48px !important;
  padding: 13px 15px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  background: rgba(255,255,255,.055) !important;
  color: #fff !important;
  box-shadow: none !important;
  outline: none !important;
}

.dgs-talk-form textarea,
.dgs-talk-form textarea.ff-el-form-control {
  min-height: 112px !important;
  resize: vertical !important;
}

.dgs-talk-form input::placeholder,
.dgs-talk-form textarea::placeholder {
  color: rgba(255,255,255,.38) !important;
}

.dgs-talk-form input:focus,
.dgs-talk-form textarea:focus,
.dgs-talk-form select:focus,
.dgs-talk-form .ff-el-form-control:focus {
  border-color: #FD5C62 !important;
  box-shadow: 0 0 0 3px rgba(253,92,98,.15) !important;
}

.dgs-talk-form .ff-btn-submit,
.dgs-talk-form button[type="submit"],
.dgs-talk-form input[type="submit"] {
  width: 100% !important;
  min-height: 52px !important;
  border: 0 !important;
  border-radius: 12px !important;
  background: #FD5C62 !important;
  color: #fff !important;
  font-family: 'Syne', sans-serif !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: .08em !important;
  text-transform: uppercase !important;
  cursor: pointer !important;
  box-shadow: 0 10px 34px rgba(253,92,98,.32) !important;
  transition: transform .25s ease, box-shadow .25s ease !important;
}

.dgs-talk-form .ff-btn-submit:hover,
.dgs-talk-form button[type="submit"]:hover,
.dgs-talk-form input[type="submit"]:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 14px 42px rgba(253,92,98,.42) !important;
}

.dgs-talk-form .ff_form_title,
.dgs-talk-form .fluentform .ff-form-title {
  display: none !important;
}

html.dgs-talk-popup-active,
body.dgs-talk-popup-active {
  overflow: hidden !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 12px !important;
  }

  .dgs-talk-box {
    width: 100% !important;
    max-height: 92vh !important;
    border-radius: 20px !important;
  }

  .dgs-talk-box::before,
  .dgs-talk-head {
    border-radius: 20px 20px 0 0 !important;
  }

  .dgs-talk-head {
    padding: 24px 58px 18px 20px !important;
  }

  .dgs-talk-body {
    padding: 22px 20px 24px !important;
  }

  .dgs-talk-title {
    font-size: 27px !important;
  }

  .dgs-talk-subtitle {
    font-size: 14px !important;
  }

  .dgs-talk-close {
    top: 18px !important;
    right: 18px !important;
    width: 36px !important;
    height: 36px !important;
  }
}

@media (max-width: 420px) {
  #dgsTalkPopup {
    padding: 8px !important;
  }

  .dgs-talk-head {
    padding: 22px 54px 16px 18px !important;
  }

  .dgs-talk-body {
    padding: 20px 18px 22px !important;
  }
}



/* DGS Popup v2 fixes: no desktop inner scrollbar, no orange top accent, captcha-safe sizing */
#dgsTalkPopup {
  overflow: hidden !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: rgba(0, 0, 0, 0.72) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
}

#dgsTalkPopup .dgs-talk-box {
  width: min(92vw, 640px) !important;
  max-height: none !important;
  overflow: visible !important;
  border-color: rgba(255,255,255,.10) !important;
}

#dgsTalkPopup .dgs-talk-box::before {
  display: none !important;
}

#dgsTalkPopup .dgs-talk-kicker::before {
  background: rgba(255,255,255,.42) !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-close {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 50% !important;
  background: rgba(255,255,255,.06) !important;
  background-image: none !important;
  box-shadow: none !important;
  color: #fff !important;
  appearance: none !important;
  -webkit-appearance: none !important;
}

#dgsTalkPopup .dgs-talk-form .g-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-hcaptcha,
#dgsTalkPopup .dgs-talk-form .cf-turnstile {
  position: relative !important;
  z-index: 4 !important;
  max-width: 100% !important;
  overflow: visible !important;
}

#dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="google.com/recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="hcaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="challenges.cloudflare"] {
  max-width: 100% !important;
}

.grecaptcha-badge,
div[style*="z-index: 2000000000"],
iframe[src*="google.com/recaptcha"] {
  z-index: 2147483647 !important;
}

@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-head {
    position: relative !important;
    top: auto !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    overflow: visible !important;
  }
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    overflow: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
  #dgsTalkPopup .dgs-talk-form iframe[src*="google.com/recaptcha"] {
    max-width: 100% !important;
  }
}

@media (max-width: 360px) {
  #dgsTalkPopup .dgs-talk-body {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  #dgsTalkPopup .dgs-talk-form .g-recaptcha,
  #dgsTalkPopup .dgs-talk-form .ff-el-recaptcha {
    transform: scale(.92) !important;
    transform-origin: left top !important;
    margin-bottom: -22px !important;
  }
}


/* DGS Popup v3 hard fixes: select dropdown visibility + remove all accent artifacts */
#dgsTalkPopup,
#dgsTalkPopup * {
  scrollbar-width: none !important;
}

@media (min-width: 768px) {
  #dgsTalkPopup,
  #dgsTalkPopup .dgs-talk-box,
  #dgsTalkPopup .dgs-talk-body,
  #dgsTalkPopup .dgs-talk-form,
  #dgsTalkPopup .fluentform,
  #dgsTalkPopup form {
    overflow: visible !important;
  }

  #dgsTalkPopup ::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
  }
}

@media (max-width: 767px) {
  #dgsTalkPopup .dgs-talk-box {
    scrollbar-width: thin !important;
  }
}

#dgsTalkPopup .dgs-talk-box,
#dgsTalkPopup .dgs-talk-head {
  border-top-color: rgba(255,255,255,.10) !important;
  box-shadow: 0 34px 100px rgba(0,0,0,.72) !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-box::after,
#dgsTalkPopup .dgs-talk-head::before,
#dgsTalkPopup .dgs-talk-head::after {
  content: none !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-kicker::before {
  background: rgba(255,255,255,.45) !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-title span {
  color: #fff !important;
}

#dgsTalkPopup .dgs-talk-form select,
#dgsTalkPopup .dgs-talk-form select.ff-el-form-control {
  color: #ffffff !important;
  background-color: rgba(255,255,255,.055) !important;
  background-image: none !important;
  -webkit-text-fill-color: #ffffff !important;
  appearance: auto !important;
  -webkit-appearance: menulist !important;
}

#dgsTalkPopup .dgs-talk-form select option,
#dgsTalkPopup .dgs-talk-form select optgroup {
  color: #111111 !important;
  background-color: #ffffff !important;
  -webkit-text-fill-color: #111111 !important;
}

#dgsTalkPopup .dgs-talk-form select option:checked,
#dgsTalkPopup .dgs-talk-form select option:hover,
#dgsTalkPopup .dgs-talk-form select option:focus {
  color: #ffffff !important;
  background-color: #FD5C62 !important;
  -webkit-text-fill-color: #ffffff !important;
}

#dgsTalkPopup .dgs-talk-form .ff-el-input--content,
#dgsTalkPopup .dgs-talk-form .ff-el-form-check,
#dgsTalkPopup .dgs-talk-form .ff-el-form-check-label {
  color: rgba(255,255,255,.82) !important;
}

#dgsTalkPopup .dgs-talk-form .ff-el-form-control:disabled,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control[readonly] {
  color: rgba(255,255,255,.70) !important;
  -webkit-text-fill-color: rgba(255,255,255,.70) !important;
}

/* Keep captcha visible without forcing the popup to scroll on desktop */
@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-box {
    width: min(92vw, 660px) !important;
  }

  #dgsTalkPopup .dgs-talk-form .g-recaptcha,
  #dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
  #dgsTalkPopup .dgs-talk-form .cf-turnstile {
    transform: none !important;
    transform-origin: left top !important;
  }
}


/* DGS Popup v4: no page overlay background + hard select/dropdown visibility override */
#dgsTalkPopup {
  background: transparent !important;
  pointer-events: none !important;
  padding: 18px !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-box {
  background: rgba(8,8,8,.98) !important;
  box-shadow: 0 32px 90px rgba(0,0,0,.72) !important;
  border-color: rgba(255,255,255,.14) !important;
}

/* Remove remaining red/orange decorative artifacts from popup top area */
#dgsTalkPopup .dgs-talk-kicker::before {
  display: none !important;
  content: none !important;
}

#dgsTalkPopup .dgs-talk-title span {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Keep desktop popup clean with no visible inner scrollbar */
@media (min-width: 768px) {
  #dgsTalkPopup .dgs-talk-box {
    width: min(92vw, 620px) !important;
    max-height: calc(100vh - 36px) !important;
    overflow: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-head {
    position: relative !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    max-height: calc(100vh - 250px) !important;
    overflow: visible !important;
  }
}

/* Hard override for theme/plugin dropdown colors */
body #dgsTalkPopup .dgs-talk-form select,
body #dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control[type="select"],
body #dgsTalkPopup .dgs-talk-form .ff-el-input--content select,
body #dgsTalkPopup .fluentform select,
body #dgsTalkPopup form select {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #151515 !important;
  background-color: #151515 !important;
  background-image: none !important;
  border-color: rgba(255,255,255,.18) !important;
  text-shadow: none !important;
  forced-color-adjust: none !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option,
body #dgsTalkPopup .dgs-talk-form select optgroup,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control option,
body #dgsTalkPopup .fluentform select option,
body #dgsTalkPopup form select option,
body #dgsTalkPopup option {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #111111 !important;
  background-color: #111111 !important;
  text-shadow: none !important;
  forced-color-adjust: none !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option:checked,
body #dgsTalkPopup .dgs-talk-form select option:hover,
body #dgsTalkPopup .dgs-talk-form select option:focus,
body #dgsTalkPopup .dgs-talk-form select option:active,
body #dgsTalkPopup option:checked,
body #dgsTalkPopup option:hover {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #FD5C62 !important;
  background-color: #FD5C62 !important;
}

/* Fluent Forms can add select2/nice-select wrappers depending on settings */
body #dgsTalkPopup .select2-container,
body #dgsTalkPopup .select2-dropdown,
body #dgsTalkPopup .select2-results,
body #dgsTalkPopup .select2-results__options,
body #dgsTalkPopup .nice-select,
body #dgsTalkPopup .nice-select .list {
  background: #111111 !important;
  color: #ffffff !important;
  border-color: rgba(255,255,255,.18) !important;
  z-index: 2147483647 !important;
}

body #dgsTalkPopup .select2-results__option,
body #dgsTalkPopup .nice-select .option {
  background: #111111 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

body #dgsTalkPopup .select2-results__option--highlighted,
body #dgsTalkPopup .select2-results__option[aria-selected="true"],
body #dgsTalkPopup .nice-select .option:hover,
body #dgsTalkPopup .nice-select .option.focus,
body #dgsTalkPopup .nice-select .option.selected {
  background: #FD5C62 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Mobile remains scrollable only when needed */
@media (max-width: 767px) {
  #dgsTalkPopup {
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    max-height: 92vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }

  #dgsTalkPopup .dgs-talk-body {
    max-height: none !important;
  }
}


/* === DGS POPUP HARD OVERRIDES - no overlay background, no desktop internal scrollbar, fixed select dropdown === */
#dgsTalkPopup {
  background: transparent !important;
  pointer-events: none !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
}

#dgsTalkPopup .dgs-talk-box {
  max-height: none !important;
  overflow: visible !important;
  width: min(100%, 560px) !important;
  background: #080808 !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-kicker::before {
  content: none !important;
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

#dgsTalkPopup .dgs-talk-kicker {
  gap: 0 !important;
}

#dgsTalkPopup .dgs-talk-head {
  position: relative !important;
  top: auto !important;
  background: #080808 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-form select,
#dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control[type="select"] {
  color: #ffffff !important;
  background-color: #171717 !important;
  background-image: none !important;
  -webkit-text-fill-color: #ffffff !important;
  appearance: auto !important;
  -webkit-appearance: auto !important;
}

#dgsTalkPopup .dgs-talk-form select option,
#dgsTalkPopup .dgs-talk-form select optgroup,
#dgsTalkPopup .dgs-talk-form .ff-el-form-control option {
  color: #111111 !important;
  background-color: #ffffff !important;
  -webkit-text-fill-color: #111111 !important;
  font-size: 15px !important;
  line-height: 1.5 !important;
}

#dgsTalkPopup .dgs-talk-form select option:checked,
#dgsTalkPopup .dgs-talk-form select option:hover {
  color: #ffffff !important;
  background-color: #FD5C62 !important;
  -webkit-text-fill-color: #ffffff !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92dvh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #dgsTalkPopup .dgs-talk-head {
    position: sticky !important;
    top: 0 !important;
  }
}


/* === DGS FINAL POPUP SCROLL FIX ===
   Shows the full Fluent Form inside the popup with a branded gradient scrollbar.
   Keeps the page behind the popup untouched: no dark overlay, no blur background. */
#dgsTalkPopup {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  overflow: hidden !important;
  pointer-events: none !important;
  padding: 16px !important;
  align-items: flex-start !important;
  justify-content: center !important;
}

#dgsTalkPopup.is-open {
  pointer-events: auto !important;
}

#dgsTalkPopup .dgs-talk-backdrop {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1 !important;
}

#dgsTalkPopup .dgs-talk-box {
  width: min(92vw, 640px) !important;
  max-height: calc(100dvh - 32px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: #080808 !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 22px !important;
  box-shadow: 0 32px 90px rgba(0,0,0,.72) !important;
  scrollbar-width: thin !important;
  scrollbar-color: #FD5C62 rgba(255,255,255,.08) !important;
  -webkit-overflow-scrolling: touch !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar {
  width: 10px !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-track {
  background: rgba(255,255,255,.07) !important;
  border-radius: 999px !important;
  margin: 16px 0 !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #FD5C62 0%, #E91E8C 52%, #FF6B35 100%) !important;
  border-radius: 999px !important;
  border: 2px solid #080808 !important;
}

#dgsTalkPopup .dgs-talk-box::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #FF6B35 0%, #E91E8C 52%, #FD5C62 100%) !important;
}

#dgsTalkPopup .dgs-talk-head {
  position: sticky !important;
  top: 0 !important;
  z-index: 5 !important;
  background: #080808 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

#dgsTalkPopup .dgs-talk-body {
  max-height: none !important;
  overflow: visible !important;
}

#dgsTalkPopup .dgs-talk-box::before,
#dgsTalkPopup .dgs-talk-box::after,
#dgsTalkPopup .dgs-talk-head::before,
#dgsTalkPopup .dgs-talk-head::after,
#dgsTalkPopup .dgs-talk-kicker::before {
  content: none !important;
  display: none !important;
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
}

#dgsTalkPopup .dgs-talk-kicker {
  gap: 0 !important;
}

/* Theme/plugin select dropdown visibility override */
body #dgsTalkPopup .dgs-talk-form select,
body #dgsTalkPopup .dgs-talk-form select.ff-el-form-control,
body #dgsTalkPopup .dgs-talk-form .ff-el-input--content select,
body #dgsTalkPopup .fluentform select,
body #dgsTalkPopup form select {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #171717 !important;
  background-color: #171717 !important;
  background-image: none !important;
  border-color: rgba(255,255,255,.18) !important;
  opacity: 1 !important;
  appearance: auto !important;
  -webkit-appearance: auto !important;
}

body #dgsTalkPopup .dgs-talk-form select option,
body #dgsTalkPopup .dgs-talk-form select optgroup,
body #dgsTalkPopup .dgs-talk-form .ff-el-form-control option,
body #dgsTalkPopup .fluentform select option,
body #dgsTalkPopup form select option,
body #dgsTalkPopup option {
  color: #111111 !important;
  -webkit-text-fill-color: #111111 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
}

body #dgsTalkPopup .dgs-talk-form select option:checked,
body #dgsTalkPopup .dgs-talk-form select option:hover,
body #dgsTalkPopup option:checked,
body #dgsTalkPopup option:hover {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #FD5C62 !important;
  background-color: #FD5C62 !important;
}

/* ReCAPTCHA / Turnstile stays visible inside the scrollable popup */
#dgsTalkPopup .dgs-talk-form .g-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-recaptcha,
#dgsTalkPopup .dgs-talk-form .ff-el-hcaptcha,
#dgsTalkPopup .dgs-talk-form .cf-turnstile,
#dgsTalkPopup .dgs-talk-form iframe[src*="recaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="hcaptcha"],
#dgsTalkPopup .dgs-talk-form iframe[src*="challenges.cloudflare"] {
  max-width: 100% !important;
  position: relative !important;
  z-index: 6 !important;
}

@media (max-width: 767px) {
  #dgsTalkPopup {
    align-items: flex-end !important;
    padding: 8px !important;
  }

  #dgsTalkPopup .dgs-talk-box {
    width: 100% !important;
    max-height: 92dvh !important;
    border-radius: 20px !important;
  }

  #dgsTalkPopup .dgs-talk-box::-webkit-scrollbar {
    width: 7px !important;
  }
}</style>
<style>* { margin: 0; padding: 0; box-sizing: border-box; }

.about-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 40px 60px;
    overflow: hidden;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.about-hero-content {
    position: relative;
    z-index: 2;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
}

.about-hero-content > div {
    max-width: 1100px;
}

.about-hero-subtitle {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.about-hero-title {
    font-size: clamp(0.5rem, 8vw, 6rem);
    font-weight: 300;
    line-height: 1;
    margin-bottom: 50px;
    letter-spacing: -0.05em;
    overflow: visible;
    color: #ffffff;
}

.about-hero-title span {
    display: block;
}

.about-title-line-1, .about-title-line-3 {
    color: rgba(255, 255, 255, 0.95);
}

/* DGS Brand Gradient: Cyan → Magenta → Orange */
.about-title-line-2 {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    will-change: background-position;
    animation: aboutGradientSlide 15s linear infinite;
    padding-bottom: 10px;
    filter: brightness(1.2) saturate(1.15);
}

.about-hero-description {
    font-size: clamp(1rem, 1.8vw, 1.35rem);
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    max-width: 850px;
    margin-bottom: 60px;
    letter-spacing: -0.01em;
}

.about-hero-stats {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    flex-wrap: wrap;
    margin-bottom: 50px;
}

.about-stat-item {
    text-align: left;
}

.about-stat-number {
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 500;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.about-stat-label {
    font-size: clamp(0.85rem, 1.2vw, 0.95rem);
    color: rgba(255, 255, 255, 0.55);
    font-weight: 400;
}

.about-stat-divider {
    width: 1px;
    height: 50px;
    background: rgba(255, 255, 255, 0.15);
}

.about-hero-cta {
    padding-top: 8px;
}

.about-hero-explore-btn {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
    font-weight: 500;
    letter-spacing: clamp(2px, 0.5vw, 3px);
    color: #fff;
    text-decoration: none;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 8px;
    display: inline-block;
    white-space: nowrap;
    transition: all 0.3s ease;
    cursor: pointer;
}

/* DGS Orange hover */
.about-hero-explore-btn:hover {
    border-bottom-color: #FF6B35;
    padding-left: 12px;
    color: #FF6B35;
}

.about-scroll-indicator {
    position: absolute;
    bottom: 60px;
    left: 40px;
    z-index: 2;
}

.about-scroll-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    position: relative;
}

/* DGS Brand Gradient for scroll line */
.about-scroll-line-inner {
    width: 1px;
    height: 20px;
    background: linear-gradient(180deg, #00D4FF, #FF00DC, #FF6B35);
    position: absolute;
    top: 0;
    will-change: transform;
    animation: aboutScrollLineDrop 2s ease infinite;
}

@keyframes aboutGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes aboutScrollLineDrop {
    0% { transform: translateY(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(60px); opacity: 0; }
}

@media (max-width: 968px) {
    .about-hero {
        padding: 120px 20px 60px !important;
    }
    .about-hero-title {
        font-size: clamp(3.5rem, 14vw, 5rem) !important;
        margin-bottom: 40px !important;
        line-height: 0.95 !important;
    }
    .about-hero-subtitle {
        font-size: 0.5rem !important;
        letter-spacing: 1.5px !important;
        margin-bottom: 25px !important;
    }
    .about-hero-description {
        font-size: clamp(0.95rem, 2vw, 1.1rem) !important;
        margin-bottom: 45px !important;
    }
    .about-hero-stats {
        gap: 1.5rem 1.2rem !important;
        margin-bottom: 40px !important;
    }
    .about-stat-divider {
        display: none;
    }
    .about-scroll-indicator {
        left: 20px;
        bottom: 40px;
    }
}

@media (max-width: 480px) {
    .about-hero-title {
        font-size: clamp(3rem, 13vw, 4rem) !important;
    }
    .about-hero-explore-btn {
        font-size: 0.7rem !important;
        letter-spacing: 1.5px !important;
    }
}</style>
<style>.founders-section {
    position: relative;
    padding: 120px 40px;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
}

.founders-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.founders-section-label {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
}

.founders-section-title {
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 500;
    line-height: 1.15;
    margin-bottom: 40px;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.98);
    max-width: 900px;
}

.founders-intro {
    font-size: clamp(1.1rem, 1.8vw, 1.45rem);
    font-weight: 400;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.75);
    max-width: 1100px;
    margin-bottom: 80px;
    letter-spacing: -0.01em;
}

.gradient-highlight {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    font-weight: 600;
}

/* Journey Timeline */
.journey-timeline {
    position: relative;
    max-width: 1200px;
    margin: 0 auto 100px;
    padding-left: 80px;
}

.journey-timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    opacity: 0.3;
}

.timeline-item {
    position: relative;
    margin-bottom: 50px;
    padding: 35px 40px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(255, 0, 220, 0.05) 50%, rgba(255, 107, 53, 0.08) 100%);
    backdrop-filter: blur(20px);
    border-left: 3px solid transparent;
    border-radius: 16px;
    transition: all 0.5s ease;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -83px;
    top: 40px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    animation: pulse 2s ease infinite;
}

.timeline-item:hover {
    border-left-color: #FF6B35;
    transform: translateX(12px);
    box-shadow: 0 15px 50px rgba(255, 107, 53, 0.2);
}

.timeline-year {
    font-size: clamp(0.75rem, 1vw, 0.85rem);
    font-weight: 600;
    letter-spacing: 3px;
    color: #FF6B35;
    margin-bottom: 12px;
    text-transform: uppercase;
}

.timeline-milestone {
    font-size: clamp(1.25rem, 1.8vw, 1.6rem);
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
}

.timeline-description {
    font-size: clamp(0.95rem, 1.15vw, 1.05rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
}

/* Founders Grid */
.founders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 3rem;
    margin-top: 80px;
}

.founder-card {
    position: relative;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.06) 0%, rgba(255, 0, 220, 0.04) 50%, rgba(255, 107, 53, 0.06) 100%);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.founder-card::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    border-radius: 24px;
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: -1;
}

.founder-card:hover::before {
    opacity: 0.15;
}

.founder-card:hover {
    transform: translateY(-10px);
    box-shadow: 
        0 30px 80px rgba(0, 212, 255, 0.2),
        0 40px 100px rgba(255, 0, 220, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.founder-image-wrapper {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 700px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(255, 0, 220, 0.15) 50%, rgba(255, 107, 53, 0.2) 100%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20px;
}

.founder-image-placeholder {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    padding: 20px;
    letter-spacing: 1px;
}

.founder-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    transition: transform 0.6s ease;
}

.founder-card:hover .founder-image {
    transform: scale(1.08);
}

.founder-content {
    padding: 45px 40px 50px;
}

.founder-badge {
    display: inline-block;
    padding: 8px 18px;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 0, 220, 0.15) 50%, rgba(255, 107, 53, 0.15) 100%);
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: #FF6B35;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.founder-name {
    font-size: clamp(2rem, 2.8vw, 2.5rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 10px;
    letter-spacing: -0.03em;
}

.founder-title {
    font-size: clamp(1.05rem, 1.3vw, 1.2rem);
    font-weight: 500;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    margin-bottom: 28px;
    letter-spacing: 0.5px;
}

.founder-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    margin: 25px 0;
    border-radius: 10px;
}

.founder-expertise-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.founder-role-description {
    font-size: clamp(1rem, 1.2vw, 1.1rem);
    font-weight: 400;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 30px;
    letter-spacing: -0.01em;
}

.founder-achievements {
    margin-bottom: 30px;
}

.achievement-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.achievement-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.achievement-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: clamp(0.95rem, 1.1vw, 1.02rem);
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
}

.achievement-item::before {
    content: '✦';
    color: #FF6B35;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
}

.founder-brands {
    margin-bottom: 32px;
}

.brands-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.brands-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.brand-tag {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
}

.brand-tag:hover {
    background: rgba(255, 107, 53, 0.15);
    border-color: rgba(255, 107, 53, 0.4);
    color: #ffffff;
}

.founder-stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
}

.stat-box {
    flex: 1;
    min-width: 140px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    text-align: center;
}

.stat-number {
    font-size: clamp(2rem, 3vw, 2.5rem);
    font-weight: 700;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    line-height: 1;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
}

/* LinkedIn Link */
.founder-linkedin {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    background: rgba(10, 102, 194, 0.12);
    border: 1px solid rgba(10, 102, 194, 0.35);
    border-radius: 100px;
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 0.5px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.founder-linkedin:hover {
    background: rgba(10, 102, 194, 0.28);
    border-color: rgba(10, 102, 194, 0.7);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(10, 102, 194, 0.25);
}

.founder-linkedin svg {
    width: 18px;
    height: 18px;
    fill: #0A66C2;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.founder-linkedin:hover svg {
    transform: scale(1.1);
}

@keyframes textGradientFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }
    50% {
        transform: scale(1.15);
        box-shadow: 0 0 30px rgba(255, 0, 220, 0.8);
    }
}

@media (max-width: 1100px) {
    .founders-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 968px) {
    .founders-section {
        padding: 80px 20px !important;
    }
    
    .founders-intro {
        margin-bottom: 60px !important;
    }
    
    .journey-timeline {
        padding-left: 60px;
        margin-bottom: 70px !important;
    }
    
    .journey-timeline::before {
        left: 15px;
    }
    
    .timeline-item::before {
        left: -63px;
    }
    
    .founders-grid {
        gap: 2.5rem;
        margin-top: 60px !important;
    }
    
    .founder-image-wrapper {
        min-height: 600px;
    }
    
    .founder-content {
        padding: 38px 32px 42px;
    }
}

@media (max-width: 580px) {
    .founders-section {
        padding: 60px 20px !important;
    }
    
    .journey-timeline {
        padding-left: 40px;
    }
    
    .timeline-item {
        padding: 25px 20px;
    }
    
    .timeline-item::before {
        left: -50px;
        width: 16px;
        height: 16px;
    }
    
    .timeline-item:hover {
        transform: translateX(6px);
    }
    
    .founder-image-wrapper {
        min-height: 500px;
    }
    
    .founder-content {
        padding: 32px 26px 36px;
    }
    
    .founder-stats {
        flex-direction: column;
    }
}</style>
<style>.about-us-section {
    position: relative;
    padding: 120px 40px;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
}

.about-us-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.about-section-label {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
}

.about-section-title {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 300;
    line-height: 1.1;
    margin-bottom: 50px;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.95);
    max-width: 950px;
}

.about-section-title .gradient-text {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientSlide 15s linear infinite;
    filter: brightness(1.2) saturate(1.15);
}

.about-description {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    font-weight: 400;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    max-width: 950px;
    margin-bottom: 100px;
    letter-spacing: -0.01em;
}

.strengths-wrapper {
    max-width: 1600px;
}

.strengths-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.98);
    margin-bottom: 70px;
    letter-spacing: -0.02em;
}

.strengths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
}

.strength-card {
    position: relative;
    padding: 45px 35px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(255, 0, 220, 0.05) 50%, rgba(255, 107, 53, 0.08) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    overflow: hidden;
}

.strength-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 0, 220, 0.1) 50%, rgba(255, 107, 53, 0.15) 100%);
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: 0;
}

.strength-card:hover::before {
    opacity: 1;
}

.strength-card:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: rgba(255, 107, 53, 0.4);
    box-shadow: 
        0 20px 60px rgba(0, 212, 255, 0.2),
        0 30px 80px rgba(255, 0, 220, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.strength-card-inner {
    position: relative;
    z-index: 1;
}

.strength-number {
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 20px;
    transition: all 0.5s ease;
    letter-spacing: -0.03em;
}

.strength-card:hover .strength-number {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: numberGradientSlide 2s linear infinite;
    filter: brightness(1.3);
    transform: scale(1.05);
}

.strength-text {
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
    font-weight: 500;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.01em;
}

.strength-card:hover .strength-text {
    color: #ffffff;
}

/* Decorative gradient orb */
.strength-card::after {
    content: '';
    position: absolute;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%);
    top: -75px;
    right: -75px;
    opacity: 0;
    transition: all 0.6s ease;
    filter: blur(40px);
    z-index: 0;
}

.strength-card:hover::after {
    opacity: 1;
    transform: scale(1.5);
}

@keyframes textGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes numberGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@media (max-width: 968px) {
    .about-us-section {
        padding: 80px 20px !important;
    }
    
    .about-section-title {
        margin-bottom: 35px !important;
    }
    
    .about-description {
        margin-bottom: 70px !important;
    }
    
    .strengths-title {
        margin-bottom: 50px !important;
    }
    
    .strengths-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .strength-card {
        padding: 35px 28px;
    }
    
    .strength-card:hover {
        transform: translateY(-8px) scale(1.01);
    }
}

@media (max-width: 480px) {
    .about-us-section {
        padding: 60px 20px !important;
    }
    
    .strengths-grid {
        gap: 1.25rem;
    }
    
    .strength-card {
        padding: 30px 24px;
    }
}</style>
<style>/* ========================================
   FOOTER - LIGHTWEIGHT & SEXY DESIGN
   ======================================== */

.dgs-footer-wrapper * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dgs-footer-wrapper {
  position: relative;
  background: transparent;
  padding: 0;
  margin: 0;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

.dgs-footer {
  position: relative;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 40px) 0;
  color: #fff;
  overflow: hidden;
}

.dgs-footer-container {
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.dgs-footer-grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr);
  gap: clamp(30px, 4vw, 40px);
  margin-bottom: clamp(40px, 5vw, 55px);
}

.dgs-footer-column {
  display: flex;
  flex-direction: column;
}

.dgs-footer-logo-column {
  max-width: 280px;
}

.dgs-footer-logo {
  display: block;
  width: clamp(130px, 15vw, 160px);
  height: auto;
  margin-bottom: 22px;
  transition: transform 0.4s ease;
  opacity: 0.95;
}

.dgs-footer-logo:hover {
  transform: scale(1.03);
  opacity: 1;
}

.dgs-footer-tagline {
  font-size: clamp(0.8rem, 1.2vw, 0.88rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;
  margin-top: 0;
  margin-bottom: 22px;
  line-height: 1.7;
}

.dgs-footer-column-title {
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: clamp(16px, 2vw, 20px);
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  width: fit-content;
}

.dgs-footer-column-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 30px;
  height: 1px;
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  border-radius: 10px;
  opacity: 0.6;
}

.dgs-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dgs-footer-link-item {
  margin-bottom: 8px;
}

.dgs-footer-link {
  display: inline-block;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 0;
  letter-spacing: 0.3px;
}

.dgs-footer-link::before {
  content: '→';
  position: absolute;
  left: -18px;
  opacity: 0;
  color: #FF6B35;
  transition: all 0.3s ease;
  font-weight: 300;
}

.dgs-footer-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 18px;
}

.dgs-footer-link:hover::before {
  opacity: 1;
  left: 0;
}

.dgs-footer-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  font-size: clamp(0.82rem, 1.2vw, 0.9rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
}

.dgs-footer-contact-item div {
  text-align: left;
}

.dgs-footer-contact-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  opacity: 1;
  background: transparent !important;
}

.dgs-footer-contact-icon path {
  fill: none !important;
  background: none !important;
}

.dgs-footer-contact-item strong {
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-contact-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
  margin-bottom: 6px;
  font-weight: 300;
}

.dgs-footer-contact-link:hover {
  color: rgba(255, 255, 255, 0.95);
  padding-left: 6px;
}

.dgs-footer-map-container {
  margin-top: 12px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.5s ease;
  border-radius: 12px;
}

.dgs-footer-map-container.active {
  max-height: 350px;
  opacity: 1;
  margin-top: 16px;
}

.dgs-footer-map-container iframe {
  width: 100%;
  height: 300px;
  border: 0;
  border-radius: 12px;
  display: block;
}

.dgs-footer-address-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover {
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-address-clickable strong {
  position: relative;
  display: inline-block;
}

.dgs-footer-address-clickable strong::after {
  content: ' ↗';
  font-size: 0.85em;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.dgs-footer-address-clickable:hover strong::after {
  opacity: 1;
  transform: translateX(2px) translateY(-2px);
}

.dgs-footer-social {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 0;
}

.dgs-footer-social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.4s ease;
}

.dgs-footer-social-link:hover {
  background: transparent;
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.15);
  color: rgba(255, 255, 255, 0.95);
}

.dgs-footer-social-icon {
  width: 18px;
  height: 18px;
}

.dgs-footer-stalk-box {
  margin-top: 18px;
  width: 100%;
}

.dgs-footer-stalk-title {
  font-size: clamp(0.82rem, 1.2vw, 0.92rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.3px;
  margin-bottom: 12px;
  line-height: 1.35;
}

.dgs-footer-contact-column .dgs-footer-social {
  justify-content: flex-start;
}

.dgs-footer-contact-column .dgs-footer-social-link {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.035);
}

/* AI Summary Shortcut Icons - Latest Brand Icons */
.dgs-footer-ai-summary {
  margin: 0 0 22px;
  width: 100%;
}

.dgs-footer-ai-heading {
  font-size: clamp(0.76rem, 1.1vw, 0.84rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 0.25px;
  margin-bottom: 10px;
  line-height: 1.45;
}

.dgs-footer-ai-icons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dgs-footer-ai-link {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.065);
  text-decoration: none;
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dgs-footer-ai-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.18), rgba(255, 0, 220, 0.14), rgba(255, 107, 53, 0.18));
  opacity: 0;
  transition: opacity 0.35s ease;
}

.dgs-footer-ai-link:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 107, 53, 0.55);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.18);
}

.dgs-footer-ai-link:hover::before {
  opacity: 1;
}

.dgs-footer-ai-icon {
  position: relative;
  z-index: 1;
  width: 19px;
  height: 19px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.22));
}

.dgs-footer-ai-fallback {
  position: relative;
  z-index: 1;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.2px;
}

.dgs-ai-prompt-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%) translateY(20px);
  z-index: 999999;
  max-width: min(92vw, 420px);
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(10, 10, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.82rem;
  line-height: 1.45;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.28s ease;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dgs-ai-prompt-toast.active {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}


.dgs-footer-ai-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 0 clamp(32px, 4vw, 45px);
  padding: 16px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.18);
}

.dgs-footer-ai-top .dgs-footer-ai-heading {
  margin-bottom: 0;
  text-align: center;
}


.dgs-footer-trust-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 22px;
}

.dgs-footer-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  max-width: 100%;
  min-height: 58px;
  padding: 9px 14px 9px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
  transition: all 0.35s ease;
}

.dgs-footer-trust-badge:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.45);
  box-shadow: 0 12px 30px rgba(255, 107, 53, 0.18);
}

.dgs-footer-trust-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 42px;
  padding: 4px 6px;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  flex-shrink: 0;
}

.dgs-footer-trust-logo-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dgs-footer-trust-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.15;
  text-align: left;
}

.dgs-footer-trust-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.2px;
  margin-bottom: 3px;
}

.dgs-footer-trust-stars {
  font-size: 0.82rem;
  font-weight: 500;
  color: #ff6b35;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.dgs-footer-trust-subtext {
  font-size: 0.68rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.58);
  letter-spacing: 0.25px;
}

.dgs-footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: clamp(20px, 3vw, 28px) 0;
  text-align: center;
}

.dgs-footer-copyright {
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.dgs-footer-copyright-gradient {
  background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientSlideFooter 8s linear infinite;
  font-weight: 400;
}

.dgs-footer-legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.dgs-footer-legal-link {
  font-size: clamp(0.75rem, 1.2vw, 0.82rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.dgs-footer-legal-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

.dgs-footer-legal-divider {
  color: rgba(255, 255, 255, 0.25);
  font-weight: 300;
}

@keyframes gradientSlideFooter {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (max-width: 1100px) {
  .dgs-footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(28px, 4vw, 35px);
  }

  .dgs-footer-trust-badges {
    justify-content: center;
  }

  .dgs-footer-logo-column {
    grid-column: 1 / -1;
    max-width: 100%;
    text-align: center;
    align-items: center;
  }

  .dgs-footer-logo {
    margin-left: auto;
    margin-right: auto;
  }

  .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-ai-summary {
    text-align: center;
  }

  .dgs-footer-ai-icons {
    justify-content: center;
  }
}

@media (max-width: 968px) {
  .dgs-footer {
    padding: clamp(50px, 7vw, 70px) clamp(20px, 4vw, 30px) 0 !important;
  }

  .dgs-footer-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
  }

  .dgs-footer-column {
    text-align: center;
    align-items: center;
  }

  .dgs-footer-column-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .dgs-footer-link::before {
    display: none;
  }

  .dgs-footer-link:hover {
    padding-left: 0;
  }

  .dgs-footer-contact-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .dgs-footer-contact-item div {
    text-align: center;
  }

  .dgs-footer-contact-icon {
    margin-top: 0;
  }

  .dgs-footer-social {
    justify-content: center;
  }
}


  .dgs-footer-contact-column .dgs-footer-social {
    justify-content: center;
  }

  .dgs-footer-stalk-box {
    text-align: center;
  }

@media (max-width: 580px) {
  .dgs-footer {
    padding: 45px 20px 0 !important;
  }

  .dgs-footer-trust-badges {
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .dgs-footer-trust-badge {
    padding: 9px 12px 9px 9px;
    gap: 10px;
  }

  .dgs-footer-trust-logo-wrap {
    width: 68px;
    height: 40px;
  }

  .dgs-footer-trust-title {
    font-size: 0.74rem;
  }

  .dgs-footer-trust-stars {
    font-size: 0.78rem;
  }

  .dgs-footer-trust-subtext {
    font-size: 0.64rem;
  }

  .dgs-footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .dgs-footer-legal-links {
    flex-direction: column;
    gap: 10px;
  }

  .dgs-footer-legal-divider {
    display: none;
  }



  .dgs-footer-ai-top {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 30px;
    padding: 16px;
  }
  .dgs-footer-map-container iframe {
    height: 250px;
  }
}</style>
<style>form.fluent_form_1 .ff-btn-submit:not(.ff_btn_no_style) { background-color: var(--fluentform-primary); color: #ffffff; }</style>` }} />
      <div dangerouslySetInnerHTML={{ __html: `<main  id="main" class="cmsmasters-main site-main"><div  class="cmsmasters-main__outer"><div  class="cmsmasters-main__inner"><div class="cmsmasters-content-wrap"><div class="cmsmasters-content"><div data-elementor-type="wp-page" data-elementor-id="38769" class="elementor elementor-38769" data-elementor-post-type="page"><div class="elementor-element elementor-element-fb6e7dd e-con-full e-flex cmsmasters-block-default e-con e-parent" data-id="fb6e7dd" data-element_type="container" data-e-type="container"><div class="elementor-element elementor-element-d9e76aa cmsmasters-block-default cmsmasters-sticky-default elementor-widget elementor-widget-html" data-id="d9e76aa" data-element_type="widget" data-e-type="widget" data-widget_type="html.default"><style>* { margin: 0; padding: 0; box-sizing: border-box; }

.about-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 40px 60px;
    overflow: hidden;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.about-hero-content {
    position: relative;
    z-index: 2;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
}

.about-hero-content > div {
    max-width: 1100px;
}

.about-hero-subtitle {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.about-hero-title {
    font-size: clamp(0.5rem, 8vw, 6rem);
    font-weight: 300;
    line-height: 1;
    margin-bottom: 50px;
    letter-spacing: -0.05em;
    overflow: visible;
    color: #ffffff;
}

.about-hero-title span {
    display: block;
}

.about-title-line-1, .about-title-line-3 {
    color: rgba(255, 255, 255, 0.95);
}

/* DGS Brand Gradient: Cyan → Magenta → Orange */
.about-title-line-2 {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    will-change: background-position;
    animation: aboutGradientSlide 15s linear infinite;
    padding-bottom: 10px;
    filter: brightness(1.2) saturate(1.15);
}

.about-hero-description {
    font-size: clamp(1rem, 1.8vw, 1.35rem);
    font-weight: 400;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    max-width: 850px;
    margin-bottom: 60px;
    letter-spacing: -0.01em;
}

.about-hero-stats {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    flex-wrap: wrap;
    margin-bottom: 50px;
}

.about-stat-item {
    text-align: left;
}

.about-stat-number {
    font-size: clamp(2rem, 3.5vw, 2.75rem);
    font-weight: 500;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 0.5rem;
}

.about-stat-label {
    font-size: clamp(0.85rem, 1.2vw, 0.95rem);
    color: rgba(255, 255, 255, 0.55);
    font-weight: 400;
}

.about-stat-divider {
    width: 1px;
    height: 50px;
    background: rgba(255, 255, 255, 0.15);
}

.about-hero-cta {
    padding-top: 8px;
}

.about-hero-explore-btn {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
    font-weight: 500;
    letter-spacing: clamp(2px, 0.5vw, 3px);
    color: #fff;
    text-decoration: none;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 8px;
    display: inline-block;
    white-space: nowrap;
    transition: all 0.3s ease;
    cursor: pointer;
}

/* DGS Orange hover */
.about-hero-explore-btn:hover {
    border-bottom-color: #FF6B35;
    padding-left: 12px;
    color: #FF6B35;
}

.about-scroll-indicator {
    position: absolute;
    bottom: 60px;
    left: 40px;
    z-index: 2;
}

.about-scroll-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    position: relative;
}

/* DGS Brand Gradient for scroll line */
.about-scroll-line-inner {
    width: 1px;
    height: 20px;
    background: linear-gradient(180deg, #00D4FF, #FF00DC, #FF6B35);
    position: absolute;
    top: 0;
    will-change: transform;
    animation: aboutScrollLineDrop 2s ease infinite;
}

@keyframes aboutGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes aboutScrollLineDrop {
    0% { transform: translateY(0); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(60px); opacity: 0; }
}

@media (max-width: 968px) {
    .about-hero {
        padding: 120px 20px 60px !important;
    }
    .about-hero-title {
        font-size: clamp(3.5rem, 14vw, 5rem) !important;
        margin-bottom: 40px !important;
        line-height: 0.95 !important;
    }
    .about-hero-subtitle {
        font-size: 0.5rem !important;
        letter-spacing: 1.5px !important;
        margin-bottom: 25px !important;
    }
    .about-hero-description {
        font-size: clamp(0.95rem, 2vw, 1.1rem) !important;
        margin-bottom: 45px !important;
    }
    .about-hero-stats {
        gap: 1.5rem 1.2rem !important;
        margin-bottom: 40px !important;
    }
    .about-stat-divider {
        display: none;
    }
    .about-scroll-indicator {
        left: 20px;
        bottom: 40px;
    }
}

@media (max-width: 480px) {
    .about-hero-title {
        font-size: clamp(3rem, 13vw, 4rem) !important;
    }
    .about-hero-explore-btn {
        font-size: 0.7rem !important;
        letter-spacing: 1.5px !important;
    }
}</style><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><section class="about-hero" id="about-hero-section"><div class="about-hero-content"><div><p class="about-hero-subtitle">Who We Are</p><h1 class="about-hero-title">
<span class="about-title-line-1">Innovators Driven by</span>
<span class="about-title-line-2">Passion & Purpose</span>
<span class="about-title-line-3">Since 2021</span></h1><p class="about-hero-description">
We're a collective of digital strategists, AI specialists, and creative minds transforming how brands connect with their audience through cutting-edge technology and innovative marketing solutions.</p><div class="about-hero-stats"><div class="about-stat-item"><div class="about-stat-number">5+</div><div class="about-stat-label">Years</div></div><div class="about-stat-divider" aria-hidden="true"></div><div class="about-stat-item"><div class="about-stat-number">50+</div><div class="about-stat-label">Team Members</div></div><div class="about-stat-divider" aria-hidden="true"></div><div class="about-stat-item"><div class="about-stat-number">12+</div><div class="about-stat-label">Industries</div></div></div><div class="about-hero-cta">
<a href="#our-story" class="about-hero-explore-btn" aria-label="Explore our journey">
EXPLORE OUR JOURNEY
</a></div></div></div><div class="about-scroll-indicator" aria-hidden="true"><div class="about-scroll-line"><div class="about-scroll-line-inner"></div></div></div></section> <script src="data:text/javascript;base64,ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFib3V0LWhlcm8tZXhwbG9yZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmN0aW9uKGUpe2UucHJldmVudERlZmF1bHQoKTtjb25zdCB0YXJnZXRTZWN0aW9uPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdXItc3RvcnknKTtpZih0YXJnZXRTZWN0aW9uKXt0YXJnZXRTZWN0aW9uLnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjonc21vb3RoJyxibG9jazonc3RhcnQnfSl9fSk=" defer></script> </div></div><div class="elementor-element elementor-element-6a4d58c e-con-full e-flex cmsmasters-block-default e-con e-parent" data-id="6a4d58c" data-element_type="container" data-e-type="container"><div class="elementor-element elementor-element-fe21361 cmsmasters-block-default cmsmasters-sticky-default elementor-widget elementor-widget-html" data-id="fe21361" data-element_type="widget" data-e-type="widget" data-widget_type="html.default"><style>.founders-section {
    position: relative;
    padding: 120px 40px;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
}

.founders-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.founders-section-label {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
}

.founders-section-title {
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 500;
    line-height: 1.15;
    margin-bottom: 40px;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.98);
    max-width: 900px;
}

.founders-intro {
    font-size: clamp(1.1rem, 1.8vw, 1.45rem);
    font-weight: 400;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.75);
    max-width: 1100px;
    margin-bottom: 80px;
    letter-spacing: -0.01em;
}

.gradient-highlight {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    font-weight: 600;
}

/* Journey Timeline */
.journey-timeline {
    position: relative;
    max-width: 1200px;
    margin: 0 auto 100px;
    padding-left: 80px;
}

.journey-timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    opacity: 0.3;
}

.timeline-item {
    position: relative;
    margin-bottom: 50px;
    padding: 35px 40px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(255, 0, 220, 0.05) 50%, rgba(255, 107, 53, 0.08) 100%);
    backdrop-filter: blur(20px);
    border-left: 3px solid transparent;
    border-radius: 16px;
    transition: all 0.5s ease;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: -83px;
    top: 40px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    animation: pulse 2s ease infinite;
}

.timeline-item:hover {
    border-left-color: #FF6B35;
    transform: translateX(12px);
    box-shadow: 0 15px 50px rgba(255, 107, 53, 0.2);
}

.timeline-year {
    font-size: clamp(0.75rem, 1vw, 0.85rem);
    font-weight: 600;
    letter-spacing: 3px;
    color: #FF6B35;
    margin-bottom: 12px;
    text-transform: uppercase;
}

.timeline-milestone {
    font-size: clamp(1.25rem, 1.8vw, 1.6rem);
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
}

.timeline-description {
    font-size: clamp(0.95rem, 1.15vw, 1.05rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
}

/* Founders Grid */
.founders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 3rem;
    margin-top: 80px;
}

.founder-card {
    position: relative;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.06) 0%, rgba(255, 0, 220, 0.04) 50%, rgba(255, 107, 53, 0.06) 100%);
    backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.founder-card::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    border-radius: 24px;
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: -1;
}

.founder-card:hover::before {
    opacity: 0.15;
}

.founder-card:hover {
    transform: translateY(-10px);
    box-shadow: 
        0 30px 80px rgba(0, 212, 255, 0.2),
        0 40px 100px rgba(255, 0, 220, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.founder-image-wrapper {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 700px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(255, 0, 220, 0.15) 50%, rgba(255, 107, 53, 0.2) 100%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20px;
}

.founder-image-placeholder {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    padding: 20px;
    letter-spacing: 1px;
}

.founder-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    transition: transform 0.6s ease;
}

.founder-card:hover .founder-image {
    transform: scale(1.08);
}

.founder-content {
    padding: 45px 40px 50px;
}

.founder-badge {
    display: inline-block;
    padding: 8px 18px;
    background: linear-gradient(90deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 0, 220, 0.15) 50%, rgba(255, 107, 53, 0.15) 100%);
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: #FF6B35;
    text-transform: uppercase;
    margin-bottom: 20px;
}

.founder-name {
    font-size: clamp(2rem, 2.8vw, 2.5rem);
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 10px;
    letter-spacing: -0.03em;
}

.founder-title {
    font-size: clamp(1.05rem, 1.3vw, 1.2rem);
    font-weight: 500;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    margin-bottom: 28px;
    letter-spacing: 0.5px;
}

.founder-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    margin: 25px 0;
    border-radius: 10px;
}

.founder-expertise-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.founder-role-description {
    font-size: clamp(1rem, 1.2vw, 1.1rem);
    font-weight: 400;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 30px;
    letter-spacing: -0.01em;
}

.founder-achievements {
    margin-bottom: 30px;
}

.achievement-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.achievement-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.achievement-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    font-size: clamp(0.95rem, 1.1vw, 1.02rem);
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
}

.achievement-item::before {
    content: '✦';
    color: #FF6B35;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
}

.founder-brands {
    margin-bottom: 32px;
}

.brands-label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    margin-bottom: 15px;
}

.brands-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.brand-tag {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
}

.brand-tag:hover {
    background: rgba(255, 107, 53, 0.15);
    border-color: rgba(255, 107, 53, 0.4);
    color: #ffffff;
}

.founder-stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 28px;
}

.stat-box {
    flex: 1;
    min-width: 140px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    text-align: center;
}

.stat-number {
    font-size: clamp(2rem, 3vw, 2.5rem);
    font-weight: 700;
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientFlow 8s linear infinite;
    line-height: 1;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
}

/* LinkedIn Link */
.founder-linkedin {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    background: rgba(10, 102, 194, 0.12);
    border: 1px solid rgba(10, 102, 194, 0.35);
    border-radius: 100px;
    font-size: 0.88rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 0.5px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.founder-linkedin:hover {
    background: rgba(10, 102, 194, 0.28);
    border-color: rgba(10, 102, 194, 0.7);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(10, 102, 194, 0.25);
}

.founder-linkedin svg {
    width: 18px;
    height: 18px;
    fill: #0A66C2;
    flex-shrink: 0;
    transition: transform 0.3s ease;
}

.founder-linkedin:hover svg {
    transform: scale(1.1);
}

@keyframes textGradientFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }
    50% {
        transform: scale(1.15);
        box-shadow: 0 0 30px rgba(255, 0, 220, 0.8);
    }
}

@media (max-width: 1100px) {
    .founders-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 968px) {
    .founders-section {
        padding: 80px 20px !important;
    }
    
    .founders-intro {
        margin-bottom: 60px !important;
    }
    
    .journey-timeline {
        padding-left: 60px;
        margin-bottom: 70px !important;
    }
    
    .journey-timeline::before {
        left: 15px;
    }
    
    .timeline-item::before {
        left: -63px;
    }
    
    .founders-grid {
        gap: 2.5rem;
        margin-top: 60px !important;
    }
    
    .founder-image-wrapper {
        min-height: 600px;
    }
    
    .founder-content {
        padding: 38px 32px 42px;
    }
}

@media (max-width: 580px) {
    .founders-section {
        padding: 60px 20px !important;
    }
    
    .journey-timeline {
        padding-left: 40px;
    }
    
    .timeline-item {
        padding: 25px 20px;
    }
    
    .timeline-item::before {
        left: -50px;
        width: 16px;
        height: 16px;
    }
    
    .timeline-item:hover {
        transform: translateX(6px);
    }
    
    .founder-image-wrapper {
        min-height: 500px;
    }
    
    .founder-content {
        padding: 32px 26px 36px;
    }
    
    .founder-stats {
        flex-direction: column;
    }
}</style><section class="founders-section"><div class="founders-container"><p class="founders-section-label">Our Story</p><h2 class="founders-section-title">
Built on Trust, Grown by References</h2><p class="founders-intro">
After witnessing years of <span class="gradient-highlight">broken promises and lack of transparency</span> in traditional agency-client relationships, Sneha and Kohin Bellara had a vision: create an agency that operates as an <span class="gradient-highlight">extended marketing arm</span>, not just another vendor. In 2021, they founded D'Genius Solutions on a radical principle—<span class="gradient-highlight">100% transparency and partnership</span>. Today, every client is a reference, every project a testament to trust. With <span class="gradient-highlight">34 years of combined experience</span>, they've built an empire purely on word-of-mouth, serving 200+ brands and 20,000+ customers.</p><div class="journey-timeline"><div class="timeline-item"><div class="timeline-year">2008-2010</div><h3 class="timeline-milestone">Kohin's Foundation: Mastering Brand Strategy</h3><p class="timeline-description">
Kohin began his journey consulting for industry giants like Raymonds and Aditya Birla Fashion. He witnessed firsthand how traditional agencies treated brands as transactions, not partnerships. This frustration planted the seed for a new agency model built on transparency and strategic collaboration.</p></div><div class="timeline-item"><div class="timeline-year">2010-2015</div><h3 class="timeline-milestone">Sneha's Rise: Production Excellence Meets Creativity</h3><p class="timeline-description">
Sneha crafted her expertise working on Oscar-reaching projects like Swan Princess at Crest Animation Studios, then revolutionized content execution at Network 18. She saw brands struggling with agencies that lacked operational transparency. Her mission became clear: bring precision and honesty to every execution.</p></div><div class="timeline-item"><div class="timeline-year">2015-2020</div><h3 class="timeline-milestone">The Breaking Point: Industry Frustrations</h3><p class="timeline-description">
While Kohin won multiple awards consulting for Onida, Eureka Forbes, and Aditya Birla Education Trust, both founders experienced the same pain point: brands craved <strong>transparency, accountability, and a partner who truly understood their business</strong>. The traditional agency model was broken. The solution? Build something better.</p></div><div class="timeline-item"><div class="timeline-year">2021</div><h3 class="timeline-milestone">D'Genius Solutions is Born</h3><p class="timeline-description">
United by their shared vision, Sneha and Kohin launched D'Genius Solutions with a revolutionary promise: <strong>operate as your extended marketing team, not just an agency</strong>. No hidden costs. No opaque processes. Complete transparency from strategy to execution. They started with zero advertising budget—relying purely on delivering exceptional results that turned clients into advocates.</p></div><div class="timeline-item"><div class="timeline-year">2021-2024</div><h3 class="timeline-milestone">The Reference Revolution</h3><p class="timeline-description">
Every satisfied client became a walking testimonial. D'Genius Solutions grew organically through <strong>referrals alone</strong>—proof that transparency and partnership-driven work speaks louder than any marketing campaign. Sneha pioneered generative AI integration while Kohin architected performance systems that delivered measurable ROI. The result? 200+ brands trusting them as their extended marketing arm.</p></div><div class="timeline-item"><div class="timeline-year">2026</div><h3 class="timeline-milestone">Industry Leaders Redefining Agency Culture</h3><p class="timeline-description">
Today, D'Genius Solutions stands as Mumbai's premier AI-powered digital marketing agency—built entirely on trust and transparency. With a 20+ member team serving 15+ industries, Sneha and Kohin have proven that when you treat clients as partners and operate with radical honesty, <strong>growth becomes inevitable</strong>. Every project reinforces their founding principle: be the marketing team brands deserve.</p></div></div><div class="founders-grid"><div class="founder-card"><div class="founder-image-wrapper">
<img width="1080" height="1350" decoding="async" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/Sneha-Maam.webp" alt="Sneha Bellara - COO & Co-Founder" class="founder-image lazyload" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" style="--smush-placeholder-width: 1080px; --smush-placeholder-aspect-ratio: 1080/1350;"></div><div class="founder-content">
<span class="founder-badge">Co-Founder</span><h3 class="founder-name">Sneha Bellara</h3><p class="founder-title">Chief Operating Officer</p><div class="founder-divider"></div><p class="founder-expertise-label">Expertise</p><p class="founder-role-description">
Orchestrates operations and execution excellence across Social Media Marketing, Content Creation, and Generative AI solutions. Pioneering AI-driven content workflows from conceptual scripting through flawless final execution.</p><div class="founder-achievements"><p class="achievement-label">Career Highlights</p><div class="achievement-list"><div class="achievement-item">Contributed to Oscar-reaching Swan Princess at Crest Animation Studios</div><div class="achievement-item">Revolutionized content workflows and execution at Network 18</div><div class="achievement-item">Spearheading generative AI transformation in digital marketing operations</div><div class="achievement-item">Built transparent operational frameworks for 100+ brands</div></div></div><div class="founder-brands"><p class="brands-label">Notable Collaborations</p><div class="brands-list">
<span class="brand-tag">Network 18</span>
<span class="brand-tag">Crest Animation</span>
<span class="brand-tag">Oscar Projects</span></div></div><div class="founder-stats"><div class="stat-box"><div class="stat-number">16+</div><div class="stat-label">Years</div></div><div class="stat-box"><div class="stat-number">100%</div><div class="stat-label">Transparency</div></div></div><a href="https://www.linkedin.com/in/sneha-bellara-3a3319200/" target="_blank" rel="noopener noreferrer" class="founder-linkedin">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>
Connect on LinkedIn
</a></div></div><div class="founder-card"><div class="founder-image-wrapper">
<img width="1080" height="1350" decoding="async" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/Kohin-Sir-1.webp" alt="Kohin Bellara - CEO & Co-Founder" class="founder-image lazyload" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" style="--smush-placeholder-width: 1080px; --smush-placeholder-aspect-ratio: 1080/1350;"></div><div class="founder-content">
<span class="founder-badge">Co-Founder</span><h3 class="founder-name">Kohin Bellara</h3><p class="founder-title">Chief Executive Officer</p><div class="founder-divider"></div><p class="founder-expertise-label">Expertise</p><p class="founder-role-description">
Drives Business Strategy and Technology innovation encompassing SEO, Website Design & Development, Performance Marketing, and strategic growth. Architect of transparent, data-driven marketing systems that deliver measurable ROI.</p><div class="founder-achievements"><p class="achievement-label">Career Highlights</p><div class="achievement-list"><div class="achievement-item">Multiple marketing awards for D'Genius Solutions and personal recognition</div><div class="achievement-item">Strategic consultant for Fortune 500 brands across diverse industries</div><div class="achievement-item">Pioneered partnership-first agency model built purely on references</div><div class="achievement-item">Transformed 200+ brands through transparent collaboration</div></div></div><div class="founder-brands"><p class="brands-label">Notable Clients</p><div class="brands-list">
<span class="brand-tag">Raymonds</span>
<span class="brand-tag">Aditya Birla Fashion</span>
<span class="brand-tag">Onida</span>
<span class="brand-tag">Eureka Forbes</span>
<span class="brand-tag">ABET</span></div></div><div class="founder-stats"><div class="stat-box"><div class="stat-number">18+</div><div class="stat-label">Years</div></div><div class="stat-box"><div class="stat-number">200+</div><div class="stat-label">Brands</div></div></div><a href="https://www.linkedin.com/in/kohinbellara/" target="_blank" rel="noopener noreferrer" class="founder-linkedin">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
</svg>
Connect on LinkedIn
</a></div></div></div></div></section></div></div><div class="elementor-element elementor-element-1524c4a e-con-full e-flex cmsmasters-block-default e-con e-parent" data-id="1524c4a" data-element_type="container" data-e-type="container"><div class="elementor-element elementor-element-15c9146 cmsmasters-block-default cmsmasters-sticky-default elementor-widget elementor-widget-html" data-id="15c9146" data-element_type="widget" data-e-type="widget" data-widget_type="html.default"><style>.about-us-section {
    position: relative;
    padding: 120px 40px;
    background: transparent;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
}

.about-us-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.about-section-label {
    font-size: clamp(0.5rem, 1.2vw, 0.7rem);
    font-weight: 300;
    letter-spacing: clamp(2px, 0.5vw, 4px);
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 30px;
    text-transform: uppercase;
}

.about-section-title {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 300;
    line-height: 1.1;
    margin-bottom: 50px;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.95);
    max-width: 950px;
}

.about-section-title .gradient-text {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: textGradientSlide 15s linear infinite;
    filter: brightness(1.2) saturate(1.15);
}

.about-description {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    font-weight: 400;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.7);
    max-width: 950px;
    margin-bottom: 100px;
    letter-spacing: -0.01em;
}

.strengths-wrapper {
    max-width: 1600px;
}

.strengths-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.98);
    margin-bottom: 70px;
    letter-spacing: -0.02em;
}

.strengths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
}

.strength-card {
    position: relative;
    padding: 45px 35px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(255, 0, 220, 0.05) 50%, rgba(255, 107, 53, 0.08) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
    overflow: hidden;
}

.strength-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(255, 0, 220, 0.1) 50%, rgba(255, 107, 53, 0.15) 100%);
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: 0;
}

.strength-card:hover::before {
    opacity: 1;
}

.strength-card:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: rgba(255, 107, 53, 0.4);
    box-shadow: 
        0 20px 60px rgba(0, 212, 255, 0.2),
        0 30px 80px rgba(255, 0, 220, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.strength-card-inner {
    position: relative;
    z-index: 1;
}

.strength-number {
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 20px;
    transition: all 0.5s ease;
    letter-spacing: -0.03em;
}

.strength-card:hover .strength-number {
    background: linear-gradient(90deg, #00D4FF 0%, #FF00DC 50%, #FF6B35 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: numberGradientSlide 2s linear infinite;
    filter: brightness(1.3);
    transform: scale(1.05);
}

.strength-text {
    font-size: clamp(1.05rem, 1.4vw, 1.25rem);
    font-weight: 500;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.01em;
}

.strength-card:hover .strength-text {
    color: #ffffff;
}

/* Decorative gradient orb */
.strength-card::after {
    content: '';
    position: absolute;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%);
    top: -75px;
    right: -75px;
    opacity: 0;
    transition: all 0.6s ease;
    filter: blur(40px);
    z-index: 0;
}

.strength-card:hover::after {
    opacity: 1;
    transform: scale(1.5);
}

@keyframes textGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes numberGradientSlide {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@media (max-width: 968px) {
    .about-us-section {
        padding: 80px 20px !important;
    }
    
    .about-section-title {
        margin-bottom: 35px !important;
    }
    
    .about-description {
        margin-bottom: 70px !important;
    }
    
    .strengths-title {
        margin-bottom: 50px !important;
    }
    
    .strengths-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .strength-card {
        padding: 35px 28px;
    }
    
    .strength-card:hover {
        transform: translateY(-8px) scale(1.01);
    }
}

@media (max-width: 480px) {
    .about-us-section {
        padding: 60px 20px !important;
    }
    
    .strengths-grid {
        gap: 1.25rem;
    }
    
    .strength-card {
        padding: 30px 24px;
    }
}</style><section class="about-us-section" id="our-story"><div class="about-us-container"><p class="about-section-label">Our Story</p><h2 class="about-section-title">
A Team Built on <span class="gradient-text">Expertise & Innovation</span></h2><p class="about-description">
D'Genius Solutions boasts a unique, close-knit team with experts in all facets of Digital Marketing. We combine our internet expertise and our digital marketing masterminds to give you an unfair competitive advantage. As an experienced digital marketing agency in Mumbai, we bring a veracious brand presence and social media advertising created with a well-rounded line of stories to promote the brand in full capacity.</p><div class="strengths-wrapper"><h3 class="strengths-title">Our Strengths</h3><div class="strengths-grid"><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">01</div><div class="strength-text">360° Top Digital Marketing Services</div></div></div><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">02</div><div class="strength-text">Never been Mapped before Strategies & Solutions</div></div></div><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">03</div><div class="strength-text">Proficient, Professional & Seamless Execution</div></div></div><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">04</div><div class="strength-text">Develop deeper Relationships with Our Clients</div></div></div><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">05</div><div class="strength-text">Demonstrate Critical and Strategic Thinking</div></div></div><div class="strength-card"><div class="strength-card-inner"><div class="strength-number">06</div><div class="strength-text">Professional & Dexterous Execution</div></div></div></div></div></div></section></div></div></div><div class="xs_social_share_widget xs_share_url after_content 		main_content  wslu-style-1 wslu-share-box-shaped wslu-fill-colored wslu-none wslu-share-horizontal wslu-theme-font-no wslu-main_content"><ul></ul></div><div class="cmsmasters-single-comments cmsmasters-section-container"></div></div></div></div></div></main>` }} />
      <Footer />
    </>
  );
}
