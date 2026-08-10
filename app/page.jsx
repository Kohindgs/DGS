
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  title: "D'Genius Solutions — AI Video, SEO/AEO/GEO & Digital Marketing Agency, Mumbai",
  description: "Mumbai's premier digital agency. AI Video Production, Generative Engine Optimization (AEO/GEO/LLM), High-Performance Web Development, Performance Marketing, Social Media & Brand Content.",
  alternates: {
    canonical: "https://www.dgeniussolutions.com/",
  },
};

export default function Page() {
  return (
    <>
      {["{\n    \"@context\":\"https://schema.org\",\n    \"@type\":\"ItemList\",\n    \"@id\":\"https://www.dgeniussolutions.com/#services\",\n    \"name\":\"Digital Marketing Services\",\n    \"itemListElement\":[\n      {\"@type\":\"ListItem\",\"position\":1,\"name\":\"Search Engine Optimisation\",\"url\":\"https://www.dgeniussolutions.com/services/seo-services-in-mumbai/\"},\n      {\"@type\":\"ListItem\",\"position\":2,\"name\":\"Answer Engine Optimisation\",\"url\":\"https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/\"},\n      {\"@type\":\"ListItem\",\"position\":3,\"name\":\"Generative Engine Optimisation\",\"url\":\"https://www.dgeniussolutions.com/services/geo/\"},\n      {\"@type\":\"ListItem\",\"position\":4,\"name\":\"LLM SEO Services\",\"url\":\"https://www.dgeniussolutions.com/services/llm-seo-service/\"},\n      {\"@type\":\"ListItem\",\"position\":5,\"name\":\"Website Development and AMC\",\"url\":\"https://www.dgeniussolutions.com/services/website-development-amc/\"},\n      {\"@type\":\"ListItem\",\"position\":6,\"name\":\"Social Media Marketing\",\"url\":\"https://www.dgeniussolutions.com/services/social-media-marketing/\"},\n      {\"@type\":\"ListItem\",\"position\":7,\"name\":\"Performance Marketing\",\"url\":\"https://www.dgeniussolutions.com/services/performance-marketing/\"},\n      {\"@type\":\"ListItem\",\"position\":8,\"name\":\"AI Video Production\",\"url\":\"https://www.dgeniussolutions.com/services/ai-video-production-agency/\"}\n    ]\n  }"].map((schema, index) => (
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
<style>.dgs-v1215,
.dgs-v1215 *,
#portfolio,
#portfolio *{
  box-sizing:border-box !important;
  font-family:"Manrope", Inter, Arial, sans-serif !important;
}

.dgs-v1215{
  --v1215-scroll:0;
  --v1215-blue:#00d4ff;
  --v1215-coral:#FD5C62;
  --v1215-purple:#9d4edd;
  --v1215-yellow:#f7d757;
  --v1215-outline-gradient:linear-gradient(135deg, rgba(0,212,255,.95), rgba(106,76,255,.85), rgba(253,92,98,.95), rgba(247,215,87,.85));
  position:relative !important;
  isolation:isolate !important;
  overflow:clip !important;
  background:#020202 !important;
  color:#fff !important;
  font-family:"Manrope", Inter, Arial, sans-serif !important;
}

.dgs-v1215 a,
#portfolio a{
  color:inherit !important;
  text-decoration:none !important;
}

.dgs-v1215-shell{
  width:min(1480px, calc(100% - 36px)) !important;
  margin:0 auto !important;
  position:relative !important;
  z-index:4 !important;
}

.dgs-v1215-bg{
  position:fixed !important;
  inset:0 !important;
  z-index:-2 !important;
  pointer-events:none !important;
  overflow:hidden !important;
  background:#020202 !important;
}

#dgs-v1215-canvas{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  display:block;
}

.dgs-v1215-fallback{
  position:absolute !important;
  inset:-18% !important;
  background:
    radial-gradient(circle at 18% 18%, rgba(0,212,255,.36), transparent 25%),
    radial-gradient(circle at 86% 22%, rgba(253,92,98,.28), transparent 29%),
    radial-gradient(circle at 50% 86%, rgba(157,78,221,.32), transparent 32%),
    linear-gradient(135deg, #020202 0%, #08020f 48%, #020202 100%) !important;
  animation:dgsV1215FallbackDrift 18s ease-in-out infinite alternate !important;
}

@keyframes dgsV1215FallbackDrift{
  from{transform:translate3d(-1%, -1%, 0) scale(1.04);}
  to{transform:translate3d(1%, -4%, 0) scale(1.08);}
}

.dgs-v1215.v1215-webgl-ready .dgs-v1215-fallback{
  opacity:.64 !important;
}

.dgs-v1215-grid{
  position:absolute !important;
  inset:0 !important;
  opacity:.22 !important;
  background-image:linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px) !important;
  background-size:72px 72px !important;
  mask-image:radial-gradient(circle at center, black 0%, transparent 82%) !important;
}

.dgs-v1215-vignette{
  position:absolute !important;
  inset:0 !important;
  background:radial-gradient(circle at 52% 45%, transparent 0%, rgba(0,0,0,.06) 48%, rgba(0,0,0,.54) 100%) !important;
}

.dgs-v1215-hero{
  min-height:calc(100svh - 80px) !important;
  padding:clamp(82px, 8vw, 130px) 0 clamp(44px, 6vw, 82px) !important;
  display:flex !important;
  align-items:center !important;
}

.dgs-v1215-hero-layout{
  display:grid !important;
  grid-template-columns:minmax(0,.9fr) minmax(360px,.9fr) !important;
  gap:clamp(32px,5vw,80px) !important;
  align-items:center !important;
}

.dgs-v1215-copy{
  position:relative !important;
  z-index:5 !important;
}

.dgs-v1215-kicker,
.dgs-v1215-section-kicker{
  display:inline-flex !important;
  align-items:center !important;
  gap:10px !important;
  padding:9px 13px !important;
  border-radius:999px !important;
  border:1px solid rgba(255,255,255,.14) !important;
  background:rgba(255,255,255,.055) !important;
  color:rgba(255,255,255,.78) !important;
  font-size:clamp(10px,.8vw,12px) !important;
  line-height:1.25 !important;
  letter-spacing:.11em !important;
  text-transform:uppercase !important;
  backdrop-filter:blur(18px) !important;
  -webkit-backdrop-filter:blur(18px) !important;
  margin-bottom:clamp(20px,2.5vw,30px) !important;
}

.dgs-v1215-kicker span{
  width:7px !important;
  height:7px !important;
  border-radius:50% !important;
  background:#FD5C62 !important;
  box-shadow:0 0 18px rgba(253,92,98,.8) !important;
}

.dgs-v1215-copy h1,
.dgs-v1215-section-head h2,
.dgs-v1215-final-card h2{
  margin:0 !important;
  color:rgba(255,255,255,.96) !important;
  font-weight:800 !important;
  letter-spacing:-.06em !important;
}

.dgs-v1215-copy h1{
  max-width:820px !important;
  font-size:clamp(2.45rem,5.2vw,5.85rem) !important;
  line-height:1.04 !important;
}

.dgs-v1215-copy h1 span,
.dgs-v1215-section-head h2 span{
  background:linear-gradient(90deg,#69a7ff 0%,#12d6ff 28%,#e3d3ff 58%,#FD5C62 100%) !important;
  background-size:190% 100% !important;
  background-clip:text !important;
  -webkit-background-clip:text !important;
  color:transparent !important;
}

.dgs-v1215-copy p,
.dgs-v1215-section-head p,
.dgs-v1215-final-card p{
  color:rgba(255,255,255,.66) !important;
  font-size:clamp(15px,1.05vw,18px) !important;
  line-height:1.72 !important;
}

.dgs-v1215-copy p{
  width:min(670px,100%) !important;
  margin:clamp(24px,3vw,36px) 0 0 !important;
  color:rgba(255,255,255,.74) !important;
  font-size:clamp(16px,1.16vw,19px) !important;
}

.dgs-v1215-actions{
  display:flex !important;
  flex-wrap:wrap !important;
  align-items:center !important;
  gap:14px !important;
  margin-top:clamp(28px,3.5vw,42px) !important;
}

.dgs-v1215-btn{
  position:relative !important;
  isolation:isolate !important;
  overflow:hidden !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:11px !important;
  min-height:52px !important;
  padding:15px 22px !important;
  border-radius:999px !important;
  font-size:13px !important;
  font-weight:800 !important;
  letter-spacing:.035em !important;
  transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease !important;
}

.dgs-v1215-btn-primary{
  color:#fff !important;
  background:#FD5C62 !important;
  border:1px solid rgba(253,92,98,.65) !important;
  box-shadow:0 18px 50px rgba(253,92,98,.28) !important;
}

.dgs-v1215-btn-secondary{
  color:rgba(255,255,255,.9) !important;
  background:rgba(255,255,255,.055) !important;
  border:1px solid rgba(255,255,255,.18) !important;
}

.dgs-v1215-btn::after,
.dgs-v1215-award-card::after,
.dgs-v1215-service-menu article::after,
.dgs-ai-service-clarity::after,
.dgs-v1215-case-visual-card::after,
.dgs-v1215-case-mini::after,
.dgs-v1215-gallery-frame::after,
.dgs-v1215-testimonial-card::after,
.dgs-v1215-authority-card::after,
.dgs-v1215-proof-strip article::after,
.dgs-v1215-faq-grid details::after,
.dgs-v1215-final-card::after{
  content:"" !important;
  position:absolute !important;
  inset:0 !important;
  padding:1px !important;
  border-radius:inherit !important;
  background:var(--v1215-outline-gradient) !important;
  opacity:0 !important;
  pointer-events:none !important;
  z-index:1 !important;
  -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  -webkit-mask-composite:xor !important;
  mask-composite:exclude !important;
  transition:opacity .24s ease !important;
}

.dgs-v1215-btn:hover,
.dgs-v1215-award-card:hover,
.dgs-v1215-service-menu article:hover,
.dgs-v1215-case-visual-card:hover,
.dgs-v1215-case-mini:hover,
.dgs-v1215-gallery-frame:hover,
.dgs-v1215-testimonial-card:hover,
.dgs-v1215-authority-card:hover,
.dgs-v1215-proof-strip article:hover,
.dgs-v1215-faq-grid details:hover,
.dgs-v1215-final-card:hover{
  border-color:transparent !important;
  transform:translateY(-4px) !important;
  box-shadow:0 24px 70px rgba(0,0,0,.28), 0 0 18px rgba(253,92,98,.10) !important;
}

.dgs-v1215-btn:hover::after,
.dgs-v1215-award-card:hover::after,
.dgs-v1215-service-menu article:hover::after,
.dgs-ai-service-clarity:hover::after,
.dgs-v1215-case-visual-card:hover::after,
.dgs-v1215-case-mini:hover::after,
.dgs-v1215-gallery-frame:hover::after,
.dgs-v1215-testimonial-card:hover::after,
.dgs-v1215-authority-card:hover::after,
.dgs-v1215-proof-strip article:hover::after,
.dgs-v1215-faq-grid details:hover::after,
.dgs-v1215-final-card:hover::after{
  opacity:1 !important;
}

.dgs-v1215-visual{
  position:relative !important;
  min-height:clamp(460px,50vw,600px) !important;
}

.dgs-v1215-robot-wrap{
  position:relative !important;
  width:min(500px,100%) !important;
  margin:auto !important;
  min-height:clamp(460px,50vw,600px) !important;
}

.dgs-v1215-robot-aura{
  position:absolute !important;
  inset:14% 7% !important;
  border-radius:999px !important;
  background:radial-gradient(circle, rgba(255,255,255,.2), transparent 58%), linear-gradient(135deg, rgba(0,212,255,.34), rgba(253,92,98,.26), rgba(157,78,221,.28)) !important;
  filter:blur(38px) !important;
  opacity:.82 !important;
}

.dgs-v1215-robot-wrap img{
  position:relative !important;
  z-index:2 !important;
  width:100% !important;
  max-height:600px !important;
  object-fit:contain !important;
  display:block !important;
  filter:saturate(1.08) contrast(1.06) drop-shadow(0 44px 90px rgba(0,0,0,.78)) !important;
  mask-image:linear-gradient(180deg, black 0%, black 82%, transparent 99%) !important;
  -webkit-mask-image:linear-gradient(180deg, black 0%, black 82%, transparent 99%) !important;
}

.dgs-v1215-floating-chip{
  position:absolute !important;
  z-index:4 !important;
  min-width:150px !important;
  padding:13px 15px !important;
  border-radius:18px !important;
  background:rgba(2,2,2,.72) !important;
  border:1px solid rgba(255,255,255,.13) !important;
  backdrop-filter:blur(20px) !important;
  box-shadow:0 20px 60px rgba(0,0,0,.42) !important;
  animation:dgsV1215Float 7s ease-in-out infinite !important;
}

.dgs-v1215-floating-chip span{
  display:block !important;
  color:rgba(255,255,255,.52) !important;
  font-size:11px !important;
  letter-spacing:.1em !important;
  text-transform:uppercase !important;
  margin-bottom:6px !important;
}

.dgs-v1215-floating-chip strong{
  display:block !important;
  color:rgba(255,255,255,.92) !important;
  font-size:15px !important;
  line-height:1.2 !important;
  font-weight:700 !important;
}

.dgs-v1215-chip-one{top:16% !important; left:0 !important;}
.dgs-v1215-chip-two{top:46% !important; right:-2% !important; animation-delay:.5s !important;}
.dgs-v1215-chip-three{bottom:12% !important; left:8% !important; animation-delay:1s !important;}

@keyframes dgsV1215Float{
  0%,100%{transform:translate3d(0,0,0);}
  50%{transform:translate3d(0,-12px,0);}
}

.dgs-v1215-statline{
  margin-top:clamp(36px,4.5vw,64px) !important;
  display:grid !important;
  grid-template-columns:repeat(4,1fr) !important;
  border-top:1px solid rgba(255,255,255,.14) !important;
  border-bottom:1px solid rgba(255,255,255,.14) !important;
  background:linear-gradient(90deg, rgba(255,255,255,.025), rgba(255,255,255,.06), rgba(255,255,255,.025)) !important;
  backdrop-filter:blur(18px) !important;
}

.dgs-v1215-statline div{
  padding:clamp(19px,2.6vw,30px) !important;
  border-right:1px solid rgba(255,255,255,.08) !important;
}

.dgs-v1215-statline div:last-child{
  border-right:none !important;
}

.dgs-v1215-statline strong{
  display:block !important;
  font-size:clamp(28px,3.2vw,46px) !important;
  line-height:1 !important;
  font-weight:800 !important;
  margin-bottom:8px !important;
}

.dgs-v1215-statline span{
  display:block !important;
  color:rgba(255,255,255,.58) !important;
  font-size:13px !important;
  line-height:1.45 !important;
}

.dgs-v1215-rail{
  padding:clamp(36px,5vw,68px) 0 !important;
}

.dgs-v1215-rail-line{
  position:relative !important;
  left:50% !important;
  width:132vw !important;
  margin-left:-66vw !important;
  display:flex !important;
  align-items:center !important;
  overflow:hidden !important;
  border-top:1px solid rgba(255,255,255,.15) !important;
  border-bottom:1px solid rgba(255,255,255,.15) !important;
  background:rgba(255,255,255,.055) !important;
  backdrop-filter:blur(18px) !important;
  transform:rotate(-1deg) !important;
}

.dgs-v1215-rail-track{
  flex:0 0 auto !important;
  min-width:max-content !important;
  display:flex !important;
  align-items:center !important;
  animation:dgsV1215Rail 42s linear infinite !important;
}

.dgs-v1215-rail-track span{
  display:inline-flex !important;
  align-items:center !important;
  padding:16px 25px !important;
  font-size:clamp(15px,1.35vw,22px) !important;
  font-weight:800 !important;
  color:#fff !important;
  white-space:nowrap !important;
}

.dgs-v1215-rail-track span::after{
  content:"" !important;
  width:6px !important;
  height:6px !important;
  margin-left:25px !important;
  border-radius:999px !important;
  background:#FD5C62 !important;
}

@keyframes dgsV1215Rail{
  from{transform:translateX(0);}
  to{transform:translateX(-100%);}
}

.dgs-v1215-proof-stack,
.dgs-v1215-service-clarity,
.dgs-v1215-ai-portfolio,
.dgs-v1215-case-block,
.dgs-v1215-portfolio,
.dgs-v1215-testimonials,
.dgs-v1215-search-authority,
.dgs-v1215-industries,
.dgs-v1215-why,
.dgs-v1215-faq,
.dgs-v1215-final{
  position:relative !important;
  padding:clamp(82px,10vw,150px) 0 !important;
}

.dgs-v1215-section-head{
  max-width:1120px !important;
  margin:0 0 clamp(34px,4vw,58px) !important;
}

.dgs-v1215-section-head h2{
  font-size:clamp(2.65rem,5.6vw,6.25rem) !important;
  line-height:.98 !important;
}

.dgs-v1215-section-head p{
  max-width:860px !important;
  margin:26px 0 0 !important;
}

.dgs-v1215-logo-marquee{
  overflow:hidden !important;
  border-radius:34px !important;
  border:1px solid rgba(255,255,255,.12) !important;
  background:rgba(255,255,255,.08) !important;
  backdrop-filter:blur(18px) !important;
  margin-bottom:clamp(78px,9vw,130px) !important;
}

.dgs-v1215-logo-track{
  display:grid !important;
  grid-template-columns:repeat(5, minmax(150px,1fr)) !important;
  gap:1px !important;
}

.dgs-v1215-logo-tile{
  min-height:128px !important;
  padding:24px !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  background:rgba(2,2,2,.46) !important;
  transition:background .28s ease, transform .28s ease !important;
}

.dgs-v1215-logo-tile:hover{
  background:rgba(255,255,255,.07) !important;
  transform:translateY(-3px) !important;
}

.dgs-v1215-logo-tile img{
  max-width:160px !important;
  max-height:62px !important;
  width:auto !important;
  height:auto !important;
  object-fit:contain !important;
  display:block !important;
  filter:grayscale(1) brightness(1.35) contrast(1.05) !important;
  opacity:.78 !important;
}

.dgs-v1215-logo-tile:hover img{
  filter:grayscale(0) brightness(1.08) contrast(1.02) !important;
  opacity:1 !important;
}

.dgs-v1215-logo-text{
  color:rgba(255,255,255,.76) !important;
  font-weight:800 !important;
  text-transform:uppercase !important;
  letter-spacing:.08em !important;
  text-align:center !important;
}

.dgs-v1215-awards-block{
  margin-top:clamp(78px,9vw,130px) !important;
}

.dgs-v1215-awards-grid,
.dgs-v1215-service-menu,
.dgs-v1215-case-visual-grid,
.dgs-v1215-testimonial-grid{
  display:grid !important;
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  gap:18px !important;
}

.dgs-v1215-service-menu{
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
}

.dgs-v1215-case-visual-grid{
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
}

.dgs-v1215-award-card,
.dgs-v1215-service-menu article,
.dgs-ai-service-clarity,
.dgs-v1215-case-visual-card,
.dgs-v1215-case-mini,
.dgs-v1215-gallery-frame,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-v1215-final-card{
  position:relative !important;
  isolation:isolate !important;
  overflow:hidden !important;
  background:linear-gradient(135deg, rgba(255,255,255,.072), rgba(255,255,255,.026)), rgba(2,2,2,.36) !important;
  border:1px solid rgba(255,255,255,.12) !important;
  backdrop-filter:blur(18px) !important;
  transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease !important;
}

.dgs-v1215-award-card,
.dgs-v1215-service-menu article,
.dgs-ai-service-clarity,
.dgs-v1215-case-visual-card,
.dgs-v1215-gallery-frame,
.dgs-v1215-testimonial-card{
  border-radius:34px !important;
}

.dgs-v1215-award-image{
  height:390px !important;
  padding:12px 12px 0 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
}

.dgs-v1215-award-image img{
  width:100% !important;
  height:100% !important;
  object-fit:contain !important;
}

.dgs-v1215-award-body,
.dgs-v1215-service-menu article,
.dgs-v1215-case-content,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article{
  padding:clamp(22px,2.6vw,34px) !important;
}

.dgs-v1215-award-body span,
.dgs-v1215-service-menu article span,
.dgs-v1215-case-content span,
.dgs-v1215-case-mini span,
.dgs-v1215-authority-card span,
.dgs-v1215-testimonial-card span,
.dgs-v1215-proof-strip article span{
  display:inline-flex !important;
  padding:6px 11px !important;
  border-radius:999px !important;
  background:rgba(253,92,98,.09) !important;
  border:1px solid rgba(253,92,98,.22) !important;
  color:rgba(255,255,255,.78) !important;
  font-size:10px !important;
  font-weight:800 !important;
  letter-spacing:.12em !important;
  text-transform:uppercase !important;
  margin-bottom:14px !important;
}

.dgs-v1215-award-body h3,
.dgs-v1215-service-menu article h3,
.dgs-v1215-case-content h3,
.dgs-v1215-case-mini h3,
.dgs-v1215-authority-card h3,
.dgs-v1215-testimonial-card h3,
.dgs-v1215-proof-strip article h3{
  margin:0 !important;
  color:#fff !important;
  font-size:clamp(21px,1.8vw,34px) !important;
  line-height:1.08 !important;
  letter-spacing:-.045em !important;
  font-weight:800 !important;
}

.dgs-v1215-award-body p,
.dgs-v1215-service-menu article p,
.dgs-v1215-case-content p,
.dgs-v1215-authority-card p,
.dgs-v1215-testimonial-card p,
.dgs-v1215-proof-strip article p{
  margin:14px 0 0 !important;
  color:rgba(255,255,255,.62) !important;
  font-size:15px !important;
  line-height:1.62 !important;
}

.dgs-v1215-service-menu article div{
  display:flex !important;
  flex-wrap:wrap !important;
  gap:8px !important;
  margin-top:22px !important;
}

.dgs-v1215-service-menu article a{
  display:inline-flex !important;
  align-items:center !important;
  min-height:34px !important;
  padding:8px 11px !important;
  border-radius:999px !important;
  background:rgba(255,255,255,.07) !important;
  border:1px solid rgba(255,255,255,.12) !important;
  color:rgba(255,255,255,.82) !important;
  font-size:11px !important;
  font-weight:800 !important;
}

/* AI PORTFOLIO */
#portfolio{
  position:relative !important;
  background:transparent !important;
  isolation:isolate !important;
  z-index:10 !important;
}

.dgs-ai-shell{
  max-width:1800px !important;
}

.dgs-ai-service-clarity{
  z-index:18 !important;
  margin:0 0 clamp(34px,5vw,64px) !important;
  padding:clamp(22px,3.4vw,42px) !important;
}

.dgs-ai-service-grid{
  display:grid !important;
  grid-template-columns:minmax(280px,.88fr) minmax(0,1.12fr) !important;
  gap:clamp(24px,4vw,56px) !important;
  align-items:start !important;
}

.dgs-ai-service-kicker{
  display:inline-flex !important;
  width:fit-content !important;
  margin:0 0 18px !important;
  padding:8px 13px !important;
  border-radius:999px !important;
  border:1px solid rgba(255,255,255,.14) !important;
  background:rgba(255,255,255,.055) !important;
  color:rgba(255,255,255,.72) !important;
  font-size:11px !important;
  line-height:1.2 !important;
  letter-spacing:.14em !important;
  text-transform:uppercase !important;
  font-weight:800 !important;
}

.dgs-ai-service-copy h3{
  margin:0 !important;
  max-width:760px !important;
  color:#fff !important;
  font-size:clamp(1.9rem,3.5vw,4.4rem) !important;
  line-height:1 !important;
  letter-spacing:-.06em !important;
  font-weight:800 !important;
}

.dgs-ai-service-copy p:not(.dgs-ai-service-kicker){
  margin:22px 0 0 !important;
  max-width:720px !important;
  color:rgba(255,255,255,.68) !important;
  font-size:clamp(15px,1.05vw,18px) !important;
  line-height:1.7 !important;
  font-weight:400 !important;
}

.dgs-ai-service-points{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:12px !important;
}

.dgs-ai-service-points article{
  min-height:190px !important;
  padding:22px !important;
  border-radius:24px !important;
  background:rgba(255,255,255,.045) !important;
  border:1px solid rgba(255,255,255,.105) !important;
}

.dgs-ai-service-points span{
  display:block !important;
  margin-bottom:14px !important;
  color:rgba(255,255,255,.44) !important;
  font-size:11px !important;
  letter-spacing:.15em !important;
  text-transform:uppercase !important;
  font-weight:900 !important;
}

.dgs-ai-service-points h4{
  margin:0 !important;
  color:#fff !important;
  font-size:clamp(20px,1.5vw,28px) !important;
  line-height:1.08 !important;
  letter-spacing:-.04em !important;
  font-weight:800 !important;
}

.dgs-ai-service-points p{
  margin:12px 0 0 !important;
  color:rgba(255,255,255,.62) !important;
  font-size:14px !important;
  line-height:1.58 !important;
}

.dgs-ai-process-strip{
  display:grid !important;
  grid-template-columns:repeat(5,minmax(0,1fr)) !important;
  gap:1px !important;
  margin-top:clamp(22px,3vw,34px) !important;
  border:1px solid rgba(255,255,255,.11) !important;
  border-radius:24px !important;
  overflow:hidden !important;
  background:rgba(255,255,255,.08) !important;
}

.dgs-ai-process-strip div{
  min-height:118px !important;
  padding:18px !important;
  background:rgba(0,0,0,.34) !important;
}

.dgs-ai-process-strip strong{
  display:block !important;
  color:#fff !important;
  font-size:15px !important;
  line-height:1.2 !important;
  font-weight:900 !important;
  letter-spacing:-.02em !important;
  margin-bottom:8px !important;
}

.dgs-ai-process-strip span{
  display:block !important;
  color:rgba(255,255,255,.58) !important;
  font-size:13px !important;
  line-height:1.5 !important;
}

.portfolio-filters{
  display:flex !important;
  gap:clamp(15px,3vw,40px) !important;
  margin-bottom:clamp(26px,4vw,48px) !important;
  overflow-x:auto !important;
  scrollbar-width:thin !important;
  scrollbar-color:rgba(255,255,255,0.3) transparent !important;
  position:relative !important;
  z-index:20 !important;
  -webkit-overflow-scrolling:touch !important;
}

.portfolio-filters::-webkit-scrollbar{height:4px;}
.portfolio-filters::-webkit-scrollbar-track{background:transparent;}
.portfolio-filters::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:10px;}

.portfolio-filter-tab{
  font-size:clamp(.7rem,1.5vw,.8rem) !important;
  font-weight:700 !important;
  letter-spacing:clamp(1.5px,.4vw,2.5px) !important;
  color:rgba(255,255,255,.5) !important;
  text-transform:uppercase !important;
  white-space:nowrap !important;
  padding-bottom:12px !important;
  position:relative !important;
  display:inline-block !important;
  cursor:pointer !important;
  transition:color .2s ease !important;
}

.portfolio-filter-tab span{
  position:absolute !important;
  bottom:0 !important;
  left:0 !important;
  width:100% !important;
  height:1px !important;
  background:linear-gradient(90deg,#ff6b9d,#ffa834) !important;
  opacity:0 !important;
}

.portfolio-filter-tab.active{
  color:#fff !important;
}

.portfolio-filter-tab.active span{
  opacity:1 !important;
}

.content-view{
  display:none !important;
  opacity:0 !important;
  transition:opacity .35s ease !important;
}

.content-view.active-view{
  display:block !important;
  opacity:1 !important;
}

#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery,
#tvc-gallery{
  display:block !important;
  width:100% !important;
  column-gap:clamp(8px,1vw,12px) !important;
  margin-bottom:0 !important;
}

#portfolio-gallery{
  columns:5 260px !important;
  padding:clamp(6px,1vw,10px) !important;
  background:rgba(0,0,0,.4) !important;
  min-height:400px !important;
}

#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery{
  columns:4 260px !important;
}

#tvc-gallery{
  columns:2 420px !important;
}

.gallery-item,
.case-study-item{
  display:block !important;
  width:100% !important;
  margin:0 0 clamp(8px,1vw,12px) 0 !important;
  break-inside:avoid !important;
  page-break-inside:avoid !important;
  -webkit-column-break-inside:avoid !important;
  position:relative !important;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,107,157,.18), transparent 30%),
    radial-gradient(circle at 75% 30%, rgba(255,168,52,.12), transparent 32%),
    radial-gradient(circle at 50% 75%, rgba(192,132,252,.14), transparent 35%),
    #050505 !important;
  border:1px solid rgba(255,255,255,.08) !important;
  overflow:hidden !important;
  cursor:pointer !important;
  border-radius:12px !important;
  transition:border-color .25s ease, box-shadow .25s ease, transform .25s ease !important;
  contain:layout paint style !important;
}

.gallery-item:not(.wide-item),
.case-study-item:not(.wide-item){
  aspect-ratio:9 / 16 !important;
}

.gallery-item.wide-item,
.case-study-item.wide-item,
.case-study-item.wide-item .video-wrapper{
  aspect-ratio:16 / 9 !important;
}

.gallery-item:hover,
.case-study-item:hover{
  border-color:rgba(255,107,157,.5) !important;
  box-shadow:0 8px 30px rgba(255,107,157,.3) !important;
  transform:translateY(-3px) !important;
}

.video-wrapper{
  position:relative !important;
  width:100% !important;
  overflow:hidden !important;
  background:#000 !important;
  aspect-ratio:9 / 16 !important;
}

.thumb-img{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center top !important;
  background:#0a0a0a !important;
  transition:transform .3s ease, opacity .3s ease !important;
}

.thumb-video{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center top !important;
  background:#0a0a0a !important;
  z-index:1 !important;
}
.thumb-poster{z-index:2 !important;}
.gallery-item.video-ready .thumb-poster,
.case-study-item.video-ready .thumb-poster{opacity:0 !important;pointer-events:none !important;}

.gallery-item:hover .thumb-img,
.case-study-item:hover .thumb-img{
  transform:scale(1.035) !important;
}

.thumb-fallback{
  position:absolute !important;
  inset:0 !important;
  background:
    radial-gradient(circle at 25% 20%, rgba(255,107,157,.32), transparent 32%),
    radial-gradient(circle at 75% 30%, rgba(255,168,52,.22), transparent 34%),
    radial-gradient(circle at 50% 78%, rgba(192,132,252,.24), transparent 36%),
    linear-gradient(135deg,#070707,#111 48%,#050505) !important;
}

.play-btn-overlay{
  position:absolute !important;
  inset:0 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  z-index:3 !important;
  pointer-events:none !important;
  opacity:0 !important;
  transition:opacity .25s ease !important;
}

.gallery-item:hover .play-btn-overlay,
.case-study-item:hover .play-btn-overlay{
  opacity:1 !important;
}

.play-btn-circle{
  width:clamp(44px,6vw,60px) !important;
  height:clamp(44px,6vw,60px) !important;
  border-radius:50% !important;
  background:rgba(0,0,0,.58) !important;
  border:2px solid rgba(255,255,255,.74) !important;
  backdrop-filter:blur(6px) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  box-shadow:0 12px 34px rgba(0,0,0,.45) !important;
}

.play-btn-circle svg{
  width:clamp(16px,2.5vw,22px) !important;
  height:clamp(16px,2.5vw,22px) !important;
  margin-left:3px !important;
  fill:#fff !important;
}

.video-overlay{
  position:absolute !important;
  bottom:0 !important;
  left:0 !important;
  right:0 !important;
  padding:clamp(10px,2vw,15px) !important;
  background:linear-gradient(180deg,transparent,rgba(0,0,0,.95)) !important;
  z-index:2 !important;
  pointer-events:none !important;
}

.dgs-load-wrap{
  text-align:center !important;
  margin-top:clamp(30px,4vw,50px) !important;
}

#load-more-btn{
  font-size:clamp(.75rem,1.5vw,.85rem) !important;
  font-weight:700 !important;
  letter-spacing:clamp(2px,.5vw,3px) !important;
  color:#fff !important;
  text-transform:uppercase !important;
  border-bottom:1px solid rgba(255,255,255,.3) !important;
  padding-bottom:8px !important;
  display:inline-block !important;
  cursor:pointer !important;
}

.portfolio-lightbox{
  position:fixed !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  background:rgba(0,0,0,.96) !important;
  z-index:2147483647 !important;
  display:none;
  opacity:0;
  align-items:center !important;
  justify-content:center !important;
  padding:clamp(14px,3vw,34px) !important;
  transition:opacity .24s ease !important;
}

.portfolio-lightbox.is-open{
  display:flex !important;
  opacity:1 !important;
}

.portfolio-lightbox-content{
  width:min(92vw,1280px) !important;
  height:calc(100vh - clamp(90px,12vw,150px)) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  position:relative !important;
  margin:auto !important;
}

#lightbox-player{
  display:block !important;
  width:auto !important;
  height:auto !important;
  max-width:100% !important;
  max-height:100% !important;
  object-fit:contain !important;
  border-radius:12px !important;
  background:#000 !important;
  box-shadow:0 28px 80px rgba(0,0,0,.9) !important;
}

#lightbox-player.is-landscape{
  width:min(92vw,1280px) !important;
  height:auto !important;
  max-height:calc(100vh - 140px) !important;
}

#lightbox-player.is-portrait{
  width:auto !important;
  height:min(82vh,920px) !important;
  max-width:92vw !important;
}

.portfolio-lightbox-btn{
  position:absolute !important;
  z-index:2147483647 !important;
  border:1px solid rgba(255,255,255,.22) !important;
  background:rgba(18,18,18,.82) !important;
  color:#fff !important;
  cursor:pointer !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  line-height:1 !important;
  padding:0 !important;
  margin:0 !important;
  box-shadow:0 8px 24px rgba(0,0,0,.34) !important;
  backdrop-filter:blur(8px) !important;
}

.portfolio-lightbox-close{
  top:clamp(16px,4vw,32px) !important;
  right:clamp(16px,4vw,32px) !important;
  width:clamp(44px,9vw,56px) !important;
  height:clamp(44px,9vw,56px) !important;
  border-radius:999px !important;
  font-size:clamp(1.4rem,4vw,1.8rem) !important;
}

.portfolio-lightbox-arrow{
  top:50% !important;
  width:clamp(42px,5vw,56px) !important;
  height:clamp(42px,5vw,56px) !important;
  border-radius:999px !important;
  font-size:clamp(32px,5vw,42px) !important;
  transform:translateY(-50%) !important;
}

.portfolio-lightbox-prev{left:clamp(14px,3vw,34px) !important;}
.portfolio-lightbox-next{right:clamp(14px,3vw,34px) !important;}

.dgs-v1215-case-media{
  height:300px !important;
  overflow:hidden !important;
  border-bottom:1px solid rgba(255,255,255,.08) !important;
}

.dgs-v1215-case-media img{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  display:block !important;
}

.dgs-v1215-case-metrics{
  display:grid !important;
  grid-template-columns:repeat(3,1fr) !important;
  gap:10px !important;
  margin-top:22px !important;
  padding-top:18px !important;
  border-top:1px solid rgba(255,255,255,.10) !important;
}

.dgs-v1215-case-metrics strong{
  display:block !important;
  font-size:clamp(24px,2vw,34px) !important;
  line-height:1 !important;
  letter-spacing:-.05em !important;
}

.dgs-v1215-case-metrics small{
  display:block !important;
  color:rgba(255,255,255,.56) !important;
  font-size:11px !important;
  margin-top:6px !important;
}

.dgs-v1215-case-mini-grid{
  display:grid !important;
  grid-template-columns:repeat(6,minmax(0,1fr)) !important;
  gap:12px !important;
  margin-top:18px !important;
}

.dgs-v1215-case-mini{
  min-height:160px !important;
  border-radius:28px !important;
  padding:20px !important;
}

.dgs-v1215-gallery-frame{
  padding:clamp(16px,2vw,28px) !important;
  border-radius:34px !important;
}

.dgs-v1215-authority-grid,
.dgs-v1215-proof-strip{
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
  gap:14px !important;
}

.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article{
  min-height:250px !important;
  border-radius:30px !important;
  padding:clamp(22px,2.6vw,34px) !important;
}

.dgs-v1215-authority-grid{
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
}

.dgs-v1215-industry-pills{
  display:flex !important;
  flex-wrap:wrap !important;
  gap:12px !important;
}

.dgs-v1215-industry-pills span{
  display:inline-flex !important;
  align-items:center !important;
  min-height:44px !important;
  padding:10px 15px !important;
  border-radius:999px !important;
  font-size:13px !important;
  font-weight:800 !important;
  background:rgba(255,255,255,.055) !important;
  border:1px solid rgba(255,255,255,.14) !important;
  color:rgba(255,255,255,.84) !important;
}

.dgs-v1215-testimonial-grid{
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
}

.dgs-v1215-stars{
  color:#FD5C62 !important;
  font-weight:900 !important;
  margin-bottom:18px !important;
  letter-spacing:.08em !important;
}

.dgs-v1215-testimonial-card h3{
  margin-top:22px !important;
}

.dgs-v1215-faq-grid{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:14px !important;
}

.dgs-v1215-faq-grid details{
  border-radius:26px !important;
  padding:0 !important;
}

.dgs-v1215-faq-grid summary{
  cursor:pointer !important;
  list-style:none !important;
  padding:22px 54px 22px 24px !important;
  font-size:17px !important;
  line-height:1.35 !important;
  font-weight:800 !important;
}

.dgs-v1215-faq-grid summary::-webkit-details-marker{
  display:none !important;
}

.dgs-v1215-faq-grid summary::after{
  content:"+" !important;
  position:absolute !important;
  right:22px !important;
  top:20px !important;
  color:#FD5C62 !important;
  font-size:22px !important;
}

.dgs-v1215-faq-grid details[open] summary::after{
  content:"×" !important;
}

.dgs-v1215-faq-grid p{
  margin:0 !important;
  padding:0 24px 24px !important;
  color:rgba(255,255,255,.62) !important;
  font-size:15px !important;
  line-height:1.65 !important;
}

.dgs-v1215-final-card{
  display:flex !important;
  justify-content:space-between !important;
  align-items:flex-start !important;
  gap:24px !important;
  border-radius:40px !important;
  padding:clamp(28px,4vw,54px) !important;
}

.dgs-v1215-final-card h2{
  max-width:900px !important;
  font-size:clamp(2.2rem,4.2vw,5.2rem) !important;
  line-height:.98 !important;
}

.dgs-v1215-form-shortcode{
  margin-top:26px !important;
  max-width:720px !important;
}

.dgs-v1215-reveal{
  opacity:1;
  transform:none;
}

.dgs-v1215.motion-ready .dgs-v1215-reveal{
  opacity:0;
  transform:translateY(30px);
  transition:opacity .8s ease, transform .8s cubic-bezier(.16,1,.3,1);
}

.dgs-v1215.motion-ready .dgs-v1215-reveal.is-visible{
  opacity:1;
  transform:translateY(0);
}

.dgs-v1215.gsap-active .dgs-v1215-reveal{
  opacity:1 !important;
  transform:none !important;
  transition:none !important;
}

@media(max-width:1200px){
  #portfolio-gallery{columns:4 260px !important;}
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{columns:4 250px !important;}
  #tvc-gallery{columns:2 420px !important;}
}

@media(max-width:1180px){
  .dgs-v1215-hero-layout{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-logo-track{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }

  .dgs-v1215-awards-grid,
  .dgs-v1215-service-menu,
  .dgs-v1215-case-visual-grid,
  .dgs-v1215-testimonial-grid,
  .dgs-v1215-authority-grid,
  .dgs-v1215-proof-strip{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .dgs-v1215-case-mini-grid{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }

  .dgs-ai-service-grid{
    grid-template-columns:1fr !important;
  }

  .dgs-ai-process-strip{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }
}

@media(max-width:860px){
  .dgs-v1215-shell{
    width:min(100% - 28px, 1480px) !important;
  }

  .dgs-v1215-statline,
  .dgs-v1215-awards-grid,
  .dgs-v1215-service-menu,
  .dgs-v1215-case-visual-grid,
  .dgs-v1215-testimonial-grid,
  .dgs-v1215-authority-grid,
  .dgs-v1215-proof-strip,
  .dgs-v1215-faq-grid{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-logo-track{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .dgs-v1215-case-mini-grid,
  .dgs-ai-service-points{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{
    columns:3 220px !important;
  }

  #tvc-gallery{
    columns:2 340px !important;
  }

  .dgs-v1215-final-card{
    flex-direction:column !important;
  }
}

@media(max-width:767px){
  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    columns:2 150px !important;
    column-gap:8px !important;
  }

  .portfolio-lightbox{
    padding:72px 12px 68px !important;
  }

  .portfolio-lightbox-content{
    width:100% !important;
    height:calc(100vh - 140px) !important;
  }

  #lightbox-player.is-landscape,
  #lightbox-player.is-portrait,
  #lightbox-player{
    width:100% !important;
    height:auto !important;
    max-width:100% !important;
    max-height:100% !important;
  }

  .portfolio-lightbox-close{
    top:calc(env(safe-area-inset-top,0px) + 14px) !important;
    right:14px !important;
    width:40px !important;
    height:40px !important;
    font-size:28px !important;
  }

  .portfolio-lightbox-arrow{
    top:auto !important;
    bottom:calc(env(safe-area-inset-bottom,0px) + 14px) !important;
    width:44px !important;
    height:44px !important;
    font-size:34px !important;
    transform:none !important;
  }

  .portfolio-lightbox-prev{
    left:calc(50% - 58px) !important;
  }

  .portfolio-lightbox-next{
    right:calc(50% - 58px) !important;
  }
}

@media(max-width:560px){
  .dgs-v1215-copy h1,
  .dgs-v1215-section-head h2,
  .dgs-v1215-final-card h2{
    font-size:clamp(2.3rem,11.5vw,4.1rem) !important;
    line-height:1 !important;
  }

  .dgs-v1215-actions{
    flex-direction:column !important;
    align-items:stretch !important;
  }

  .dgs-v1215-btn{
    width:100% !important;
  }

  .dgs-v1215-floating-chip{
    display:none !important;
  }

  .dgs-v1215-logo-track,
  .dgs-v1215-case-mini-grid,
  .dgs-ai-service-points,
  .dgs-ai-process-strip{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-award-image{
    height:340px !important;
  }

  .dgs-v1215-case-metrics{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-rail-line{
    width:170vw !important;
    margin-left:-85vw !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    columns:1 !important;
  }

  #dgs-v1215-canvas{
    display:none !important;
  }
}

@media(prefers-reduced-motion:reduce){
  .dgs-v1215 *,
  .dgs-v1215 *::before,
  .dgs-v1215 *::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
  }

  .dgs-v1215-reveal{
    opacity:1 !important;
    transform:none !important;
  }

  #dgs-v1215-canvas{
    display:none !important;
  }
}


/* DGS V12.15 performance patch: no blank first paint, mouse-reactive background, better mobile hero */
.dgs-v1215-bg{
  transform:translate3d(var(--v1215-bg-x,0px), var(--v1215-bg-y,0px), 0) !important;
  will-change:transform !important;
}

#dgs-v1215-canvas,
.dgs-v1215-grid{
  transform:translate3d(var(--v1215-grid-x,0px), var(--v1215-grid-y,0px), 0) !important;
  will-change:transform !important;
}

.dgs-v1215-robot-wrap,
.dgs-v1215-robot-wrap img{
  will-change:transform !important;
}

@media(max-width:767px){
  .dgs-v1215-hero{
    min-height:auto !important;
    padding:64px 0 44px !important;
  }

  .dgs-v1215-visual{
    min-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-robot-wrap{
    width:min(360px,100%) !important;
    min-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-robot-wrap img{
    max-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:96px !important;
    padding:16px !important;
  }

  .dgs-v1215-proof-stack,
  .dgs-v1215-service-clarity,
  .dgs-v1215-ai-portfolio,
  .dgs-v1215-case-block,
  .dgs-v1215-portfolio,
  .dgs-v1215-testimonials,
  .dgs-v1215-search-authority,
  .dgs-v1215-industries,
  .dgs-v1215-why,
  .dgs-v1215-faq,
  .dgs-v1215-final{
    padding:64px 0 !important;
  }
}


/* =========================================================
   DGS FIX PATCH - PORTFOLIO GRID, TEXT CROPPING & LOGO TABLE
   Keeps existing UI/UX structure; only improves visibility/layout.
   ========================================================= */

/* Logo table visibility fix */
.dgs-v1215-logo-track{
  grid-template-columns:repeat(5, minmax(170px, 1fr)) !important;
  gap:1px !important;
}

.dgs-v1215-logo-tile{
  min-height:136px !important;
  padding:26px 24px !important;
  background:rgba(255,255,255,.075) !important;
}

.dgs-v1215-logo-tile img{
  width:100% !important;
  max-width:190px !important;
  max-height:82px !important;
  height:auto !important;
  object-fit:contain !important;
  object-position:center !important;
  display:block !important;
  opacity:1 !important;
  filter:none !important;
}

.dgs-v1215-logo-tile:hover img{
  opacity:1 !important;
  filter:none !important;
}

/* Fix cropped letters in AI Production text blocks */
.dgs-ai-service-clarity{
  overflow:visible !important;
}

.dgs-ai-service-copy{
  overflow:visible !important;
}

.dgs-ai-service-copy h3{
  line-height:1.08 !important;
  padding-bottom:12px !important;
  overflow:visible !important;
}

.dgs-ai-service-points h4,
.video-overlay h3,
.gallery-item h3,
.case-study-item h3{
  line-height:1.25 !important;
  padding-bottom:2px !important;
  overflow:visible !important;
}

/* Video portfolio layout like clean 4-column card grid */
#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery,
#tvc-gallery{
  columns:initial !important;
  column-count:initial !important;
  column-gap:0 !important;
  display:grid !important;
  gap:14px !important;
  width:100% !important;
}

#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery{
  grid-template-columns:repeat(4, minmax(0, 1fr)) !important;
}

#tvc-gallery{
  grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
}

.gallery-item,
.case-study-item{
  width:100% !important;
  margin:0 !important;
  break-inside:auto !important;
  page-break-inside:auto !important;
  -webkit-column-break-inside:auto !important;
  border-radius:14px !important;
}

.gallery-item:not(.wide-item),
.case-study-item:not(.wide-item){
  aspect-ratio:9 / 16 !important;
}

.gallery-item.wide-item,
.case-study-item.wide-item{
  grid-column:span 2 !important;
  aspect-ratio:16 / 9 !important;
}

.video-overlay{
  padding:18px 16px !important;
}

.video-overlay p{
  line-height:1.25 !important;
  margin-bottom:8px !important;
}

.video-overlay h3{
  font-size:15px !important;
  line-height:1.25 !important;
}

@media(max-width:1180px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(4, minmax(150px, 1fr)) !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{
    grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
  }
}

@media(max-width:860px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:118px !important;
    padding:20px 16px !important;
  }

  .dgs-v1215-logo-tile img{
    max-width:160px !important;
    max-height:70px !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
    gap:12px !important;
  }

  .gallery-item.wide-item,
  .case-study-item.wide-item{
    grid-column:span 2 !important;
  }
}

@media(max-width:560px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:104px !important;
    padding:18px 14px !important;
  }

  .dgs-v1215-logo-tile img{
    max-width:145px !important;
    max-height:62px !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    grid-template-columns:1fr !important;
    gap:12px !important;
  }

  .gallery-item.wide-item,
  .case-study-item.wide-item{
    grid-column:span 1 !important;
  }
}



/* ================================
   FINAL CTA RESPONSIVE FIX
   2K / 4K / Desktop / Mobile
================================ */
.dgs-v1215-final {
  position: relative !important;
  padding: clamp(70px, 7vw, 140px) 0 !important;
}

.dgs-v1215-final-card {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: auto !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: flex-start !important;
  gap: clamp(28px, 5vw, 80px) !important;
  border-radius: clamp(26px, 2vw, 42px) !important;
  padding: clamp(34px, 4.5vw, 72px) !important;
  background: linear-gradient(135deg, rgba(255,255,255,.072), rgba(255,255,255,.026)), rgba(2,2,2,.36) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
  backdrop-filter: blur(18px) !important;
  overflow: hidden !important;
}

.dgs-v1215-final-card > div {
  width: 100% !important;
  max-width: 1180px !important;
  min-width: 0 !important;
}

.dgs-v1215-final-card > div > span {
  display: block !important;
  margin-bottom: 12px !important;
  color: rgba(255,255,255,.88) !important;
  font-size: clamp(14px, .9vw, 18px) !important;
  line-height: 1.35 !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}

.dgs-v1215-final-card h2 {
  max-width: 1120px !important;
  margin: 0 !important;
  color: #fff !important;
  font-size: clamp(3rem, 4.7vw, 6.8rem) !important;
  line-height: .98 !important;
  letter-spacing: -0.075em !important;
  font-weight: 900 !important;
}

.dgs-v1215-final-card p {
  max-width: 1120px !important;
  margin: 14px 0 0 !important;
  color: rgba(255,255,255,.66) !important;
  font-size: clamp(15px, 1vw, 20px) !important;
  line-height: 1.62 !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn {
  align-self: start !important;
  justify-self: end !important;
  width: auto !important;
  min-width: 220px !important;
  max-width: 260px !important;
  min-height: 88px !important;
  padding: 22px 28px !important;
  border-radius: 999px !important;
  white-space: normal !important;
  text-align: left !important;
  line-height: 1.35 !important;
  display: inline-flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 20px !important;
  font-size: clamp(13px, .85vw, 16px) !important;
  font-weight: 900 !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn span {
  flex: 0 0 auto !important;
  margin-left: 6px !important;
}

.dgs-v1215-form-shortcode {
  width: 100% !important;
  max-width: 820px !important;
  margin-top: clamp(26px, 2.6vw, 42px) !important;
}

.dgs-v1215-form-shortcode input,
.dgs-v1215-form-shortcode textarea,
.dgs-v1215-form-shortcode select {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 46px !important;
  border-radius: 8px !important;
}

@media (min-width: 1920px) {
  .dgs-v1215-shell {
    width: min(1760px, calc(100% - 96px)) !important;
  }

  .dgs-v1215-final-card {
    padding: 76px 86px !important;
  }

  .dgs-v1215-final-card h2 {
    max-width: 1220px !important;
    font-size: clamp(5.4rem, 4.6vw, 7.2rem) !important;
  }

  .dgs-v1215-final-card p {
    max-width: 1200px !important;
    font-size: 20px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-width: 250px !important;
    max-width: 290px !important;
    min-height: 92px !important;
  }
}

@media (min-width: 2560px) {
  .dgs-v1215-shell {
    width: min(2200px, calc(100% - 160px)) !important;
  }

  .dgs-v1215-final-card {
    padding: 96px 110px !important;
    border-radius: 54px !important;
  }

  .dgs-v1215-final-card h2 {
    max-width: 1500px !important;
    font-size: clamp(6.6rem, 4vw, 9rem) !important;
  }

  .dgs-v1215-final-card p {
    max-width: 1450px !important;
    font-size: 24px !important;
    line-height: 1.65 !important;
  }

  .dgs-v1215-final-card > div > span {
    font-size: 22px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-width: 310px !important;
    max-width: 340px !important;
    min-height: 112px !important;
    padding: 28px 36px !important;
    font-size: 18px !important;
  }

  .dgs-v1215-form-shortcode {
    max-width: 980px !important;
  }
}

@media (max-width: 1280px) {
  .dgs-v1215-final-card {
    grid-template-columns: 1fr !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    justify-self: start !important;
    margin-top: 6px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(3rem, 6vw, 5.4rem) !important;
  }
}

@media (max-width: 860px) {
  .dgs-v1215-final {
    padding: 64px 0 !important;
  }

  .dgs-v1215-final-card {
    padding: 34px 24px !important;
    border-radius: 28px !important;
    gap: 24px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(2.8rem, 10vw, 4.7rem) !important;
    line-height: 1 !important;
    letter-spacing: -0.065em !important;
  }

  .dgs-v1215-final-card p {
    font-size: 15px !important;
    line-height: 1.62 !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 58px !important;
    padding: 16px 20px !important;
    justify-content: center !important;
    text-align: center !important;
  }
}

@media (max-width: 560px) {
  .dgs-v1215-shell {
    width: min(100% - 24px, 1480px) !important;
  }

  .dgs-v1215-final-card {
    padding: 28px 18px !important;
    border-radius: 24px !important;
  }

  .dgs-v1215-final-card > div > span {
    font-size: 14px !important;
    margin-bottom: 10px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(2.45rem, 12vw, 3.75rem) !important;
    line-height: 1.02 !important;
    letter-spacing: -0.06em !important;
  }

  .dgs-v1215-final-card p {
    margin-top: 14px !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-height: 54px !important;
    padding: 15px 18px !important;
    font-size: 13px !important;
    border-radius: 999px !important;
  }

  .dgs-v1215-form-shortcode {
    margin-top: 22px !important;
  }
}


/* =====================================================
   DGS HOMEPAGE FIX
   Testimonials spacing + AI Production Portfolio text crop
   Added responsive fixes for 2K, 4K, tablet and mobile
===================================================== */

.dgs-v1215-testimonials {
  padding-top: clamp(80px, 8vw, 140px) !important;
  padding-bottom: clamp(80px, 8vw, 140px) !important;
}

.dgs-v1215-testimonial-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: clamp(20px, 1.8vw, 32px) !important;
  align-items: stretch !important;
}

.dgs-v1215-testimonial-card {
  min-height: 400px !important;
  height: 100% !important;
  padding: clamp(28px, 2.4vw, 44px) !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  border-radius: 34px !important;
}

.dgs-v1215-testimonial-card p {
  margin: 18px 0 0 !important;
  color: rgba(255,255,255,.68) !important;
  font-size: clamp(14px, .9vw, 17px) !important;
  line-height: 1.72 !important;
}

.dgs-v1215-testimonial-card h3 {
  margin-top: auto !important;
  padding-top: 28px !important;
  font-size: clamp(25px, 1.8vw, 36px) !important;
  line-height: 1.05 !important;
  letter-spacing: -0.055em !important;
}

.dgs-v1215-testimonial-card span {
  width: fit-content !important;
  max-width: 100% !important;
  white-space: normal !important;
  line-height: 1.35 !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head {
  overflow: visible !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  margin-bottom: clamp(42px, 5vw, 76px) !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
  overflow: visible !important;
  padding-top: 10px !important;
  padding-bottom: 18px !important;
  line-height: 1.1 !important;
  letter-spacing: -0.07em !important;
  max-width: 100% !important;
  white-space: normal !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 span {
  display: inline-block !important;
  padding-right: 10px !important;
  padding-bottom: 8px !important;
  line-height: 1.1 !important;
  overflow: visible !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
  margin-top: 18px !important;
  max-width: 900px !important;
}

.dgs-v1215-ai-portfolio,
.dgs-v1215-ai-portfolio .dgs-ai-shell,
.dgs-v1215-ai-portfolio .dgs-v1215-shell {
  overflow: visible !important;
}

.dgs-ai-service-clarity {
  margin-top: clamp(20px, 2vw, 36px) !important;
}

@media (min-width: 1920px) {
  .dgs-v1215-testimonial-grid { gap: 34px !important; }
  .dgs-v1215-testimonial-card {
    min-height: 440px !important;
    padding: 46px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 18px !important;
    line-height: 1.75 !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 38px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(6rem, 4.8vw, 8rem) !important;
    line-height: 1.1 !important;
  }
}

@media (min-width: 2560px) {
  .dgs-v1215-testimonial-grid { gap: 42px !important; }
  .dgs-v1215-testimonial-card {
    min-height: 520px !important;
    padding: 58px !important;
    border-radius: 44px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 22px !important;
    line-height: 1.75 !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 48px !important; }
  .dgs-v1215-testimonial-card span { font-size: 13px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(8rem, 4.4vw, 10rem) !important;
    line-height: 1.12 !important;
    padding-bottom: 24px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
    font-size: 24px !important;
    max-width: 1200px !important;
  }
}

@media (max-width: 1180px) {
  .dgs-v1215-testimonial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .dgs-v1215-testimonial-card { min-height: 360px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(4rem, 8vw, 6.2rem) !important;
    line-height: 1.1 !important;
  }
}

@media (max-width: 767px) {
  .dgs-v1215-testimonials {
    padding-top: 64px !important;
    padding-bottom: 64px !important;
  }
  .dgs-v1215-testimonial-grid {
    grid-template-columns: 1fr !important;
    gap: 18px !important;
  }
  .dgs-v1215-testimonial-card {
    min-height: auto !important;
    padding: 28px 22px !important;
    border-radius: 26px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 14px !important;
    line-height: 1.65 !important;
  }
  .dgs-v1215-testimonial-card h3 {
    margin-top: 24px !important;
    padding-top: 0 !important;
    font-size: 28px !important;
    line-height: 1.08 !important;
  }
  .dgs-v1215-testimonial-card span {
    font-size: 10px !important;
    letter-spacing: .08em !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head {
    padding-top: 8px !important;
    padding-bottom: 10px !important;
    margin-bottom: 34px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(3.2rem, 14vw, 4.4rem) !important;
    line-height: 1.14 !important;
    letter-spacing: -0.06em !important;
    padding-bottom: 14px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 span {
    padding-right: 6px !important;
    padding-bottom: 10px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
    font-size: 15px !important;
    line-height: 1.65 !important;
    margin-top: 10px !important;
  }
}

@media (max-width: 480px) {
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(2.8rem, 13vw, 3.7rem) !important;
    line-height: 1.16 !important;
    letter-spacing: -0.055em !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 26px !important; }
}



/* =====================================================
   DGS FINAL FIX PATCH
   1) Fix gap between Industries and Why section
   2) Fix Growth Audit button responsiveness
   3) Add animated brand-color outline to "This Spot Awaits You"
   Brand colors: #72c1d8, #634dbc, #ea3f8b, #ffae33
===================================================== */

@property --dgs-spot-rotate {
  syntax: "<angle>";
  initial-value: 132deg;
  inherits: false;
}

/* Reduce the excessive blank space after Industries */
.dgs-v1215-industries{
  padding-top: clamp(72px, 7vw, 110px) !important;
  padding-bottom: clamp(32px, 3.2vw, 58px) !important;
}

.dgs-v1215-why{
  padding-top: clamp(42px, 4vw, 72px) !important;
}

.dgs-v1215-industries .dgs-v1215-section-head{
  margin-bottom: clamp(22px, 2.4vw, 34px) !important;
}

.dgs-v1215-industry-pills{
  margin-bottom: 0 !important;
}

/* Final CTA button: stable on desktop, 2K, 4K and mobile */
.dgs-v1215-final-card > .dgs-v1215-btn{
  min-width: 300px !important;
  max-width: 340px !important;
  min-height: 92px !important;
  padding: 24px 32px !important;
  white-space: normal !important;
  text-align: left !important;
  justify-content: space-between !important;
  align-items: center !important;
  line-height: 1.25 !important;
  border-radius: 999px !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn span{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 22px !important;
  line-height: 1 !important;
  margin-left: 16px !important;
}

/* This Spot Awaits You - animated outline using DGS brand colors */
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  position: relative !important;
  isolation: isolate !important;
  overflow: visible !important;
  min-height: 128px !important;
  background: rgba(255,255,255,.065) !important;
  border: 1px solid rgba(255,255,255,.10) !important;
  color: rgba(255,255,255,.88) !important;
  font-size: clamp(13px, .95vw, 17px) !important;
  letter-spacing: .11em !important;
  line-height: 1.35 !important;
  text-shadow: 0 0 18px rgba(255,255,255,.18) !important;
  transform: none !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text::before{
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  z-index: -1 !important;
  border-radius: inherit !important;
  background: linear-gradient(var(--dgs-spot-rotate), #72c1d8 0%, #634dbc 32%, #ea3f8b 66%, #ffae33 100%) !important;
  animation: dgsSpotBorderSpin 3.2s linear infinite !important;
  opacity: .95 !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text::after{
  content: "" !important;
  position: absolute !important;
  inset: 2px !important;
  z-index: -1 !important;
  border-radius: calc(inherit - 2px) !important;
  background: linear-gradient(135deg, rgba(30,24,42,.96), rgba(18,16,24,.94)) !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 0 36px rgba(234,63,139,.18) !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:hover{
  transform: translateY(-3px) !important;
  color: #fff !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:hover::before{
  opacity: 1 !important;
  filter: brightness(1.15) !important;
}

@keyframes dgsSpotBorderSpin{
  0%{ --dgs-spot-rotate: 0deg; }
  100%{ --dgs-spot-rotate: 360deg; }
}

/* Keep logo cells clean and make small logos readable */
.dgs-v1215-logo-tile{
  overflow: visible !important;
}

.dgs-v1215-logo-tile img{
  max-width: 175px !important;
  max-height: 72px !important;
  opacity: .96 !important;
  filter: none !important;
}

.dgs-v1215-logo-tile:hover img{
  opacity: 1 !important;
  filter: none !important;
}

@media (min-width: 1920px){
  .dgs-v1215-industries{
    padding-bottom: 54px !important;
  }

  .dgs-v1215-why{
    padding-top: 64px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    min-width: 340px !important;
    max-width: 380px !important;
    min-height: 106px !important;
    padding: 28px 38px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 146px !important;
    font-size: 18px !important;
  }
}

@media (min-width: 2560px){
  .dgs-v1215-industries{
    padding-bottom: 68px !important;
  }

  .dgs-v1215-why{
    padding-top: 76px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    min-width: 410px !important;
    max-width: 460px !important;
    min-height: 126px !important;
    padding: 34px 46px !important;
    font-size: 20px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 170px !important;
    font-size: 22px !important;
  }
}

@media (max-width: 1180px){
  .dgs-v1215-industries{
    padding-bottom: 36px !important;
  }

  .dgs-v1215-why{
    padding-top: 44px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    justify-self: start !important;
    min-width: 270px !important;
    max-width: 330px !important;
    min-height: 78px !important;
  }
}

@media (max-width: 767px){
  .dgs-v1215-industries{
    padding-top: 56px !important;
    padding-bottom: 28px !important;
  }

  .dgs-v1215-why{
    padding-top: 34px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 56px !important;
    padding: 16px 20px !important;
    text-align: center !important;
    justify-content: center !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn span{
    margin-left: 10px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 106px !important;
    font-size: 12px !important;
    letter-spacing: .08em !important;
  }

  .dgs-v1215-logo-tile img{
    max-width: 148px !important;
    max-height: 64px !important;
  }
}



/* =====================================================
   DGS FINAL ALIGNMENT PATCH
   1) Center section heading text correctly
   2) Make "This Spot Awaits You" behave like a CTA link
===================================================== */
.dgs-v1215 .dgs-v1215-section-head{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: auto !important;
  margin-right: auto !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215-industries .dgs-v1215-section-head,
.dgs-v1215-why .dgs-v1215-section-head,
.dgs-v1215-testimonials .dgs-v1215-section-head,
.dgs-v1215-ai-portfolio .dgs-v1215-section-head,
.dgs-v1215-faq .dgs-v1215-section-head,
.dgs-v1215-search-authority .dgs-v1215-section-head,
.dgs-v1215-service-clarity .dgs-v1215-section-head,
.dgs-v1215-case-block .dgs-v1215-section-head,
.dgs-v1215-portfolio .dgs-v1215-section-head,
.dgs-v1215-proof-stack .dgs-v1215-section-head{
  max-width: 1180px !important;
}

.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: center !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  cursor: pointer !important;
  text-decoration: none !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:focus-visible{
  outline: 3px solid #72c1d8 !important;
  outline-offset: 6px !important;
}

@media (max-width: 767px){
  .dgs-v1215 .dgs-v1215-section-head{
    text-align: center !important;
  }

  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p{
    text-align: center !important;
  }
}</style>
<style>/* =====================================================
   DGS PROPER WEBPAGE ALIGNMENT PATCH
   Fixes over-centered text from previous patch.
   Keeps cards/buttons intact and keeps This Spot link active.
===================================================== */

/* Default webpage content alignment: left, not center */
.dgs-v1215 .dgs-v1215-section-head{
  margin-left: 0 !important;
  margin-right: auto !important;
  text-align: left !important;
  max-width: 1120px !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: 0 !important;
  margin-right: 0 !important;
  text-align: left !important;
}

/* Hero content should stay left aligned */
.dgs-v1215-copy,
.dgs-v1215-copy h1,
.dgs-v1215-copy p{
  text-align: left !important;
}

/* Service/card/body content must stay naturally readable */
.dgs-v1215-service-menu article,
.dgs-v1215-award-body,
.dgs-v1215-case-content,
.dgs-v1215-case-mini,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-ai-service-copy,
.dgs-ai-service-points article,
.dgs-v1215-final-card,
.dgs-v1215-final-card h2,
.dgs-v1215-final-card p{
  text-align: left !important;
}

/* Industry chips should align with the section heading */
.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: flex-start !important;
}

/* Keep portfolio filter tabs left aligned, horizontal and natural */
.portfolio-filters{
  justify-content: flex-start !important;
  text-align: left !important;
}

/* Logo tiles can remain centered because logos should sit centered inside tiles */
.dgs-v1215-logo-tile{
  text-align: center !important;
}

/* This Spot Awaits You remains clickable and centered inside the logo tile */
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  cursor: pointer !important;
}

/* CTA button text should not be squeezed or weirdly centered */
.dgs-v1215-final-card > .dgs-v1215-btn{
  text-align: left !important;
}

@media (max-width: 767px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p,
  .dgs-v1215-copy,
  .dgs-v1215-copy h1,
  .dgs-v1215-copy p,
  .dgs-v1215-final-card,
  .dgs-v1215-final-card h2,
  .dgs-v1215-final-card p{
    text-align: left !important;
  }

  .dgs-v1215-industries .dgs-v1215-industry-pills{
    justify-content: flex-start !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    text-align: center !important;
    justify-content: center !important;
  }
}</style>
<style>/* =====================================================
   DGS FINAL CENTER-BALANCED HEADING ALIGNMENT
   Reference style: centered heading + centered paragraph
   Fixes the Trusted By 200+ Brands section and other headings
   Paste priority: placed at the very bottom to override old left patches
===================================================== */

/* Global section heading alignment like reference image */
.dgs-v1215 .dgs-v1215-section-head{
  width: min(100%, 1240px) !important;
  max-width: 1240px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: auto !important;
  margin-right: auto !important;
  justify-content: center !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

/* Trusted By 200+ Brands section: balanced center block */
.dgs-v1215-proof-stack .dgs-v1215-section-head{
  width: min(100%, 1280px) !important;
  max-width: 1280px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215-proof-stack .dgs-v1215-section-head h2{
  max-width: 1240px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
  font-size: clamp(3.2rem, 5vw, 6.1rem) !important;
  line-height: 1.04 !important;
  letter-spacing: -0.06em !important;
  text-wrap: balance !important;
}

.dgs-v1215-proof-stack .dgs-v1215-section-head p{
  max-width: 980px !important;
  margin: 24px auto 0 !important;
  text-align: center !important;
  text-wrap: pretty !important;
}

/* Keep logo table full-width and clean below centered heading */
.dgs-v1215-proof-stack .dgs-v1215-logo-marquee{
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Hero remains natural left layout because it is a two-column hero */
.dgs-v1215-copy,
.dgs-v1215-copy h1,
.dgs-v1215-copy p{
  text-align: left !important;
}

/* Card text remains readable */
.dgs-v1215-service-menu article,
.dgs-v1215-award-body,
.dgs-v1215-case-content,
.dgs-v1215-case-mini,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-ai-service-copy,
.dgs-ai-service-points article,
.dgs-v1215-final-card,
.dgs-v1215-final-card h2,
.dgs-v1215-final-card p{
  text-align: left !important;
}

/* Industry chips centered under centered heading */
.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: center !important;
}

/* Portfolio tabs remain natural horizontal navigation */
.portfolio-filters{
  justify-content: flex-start !important;
  text-align: left !important;
}

/* Logo tiles stay centered */
.dgs-v1215-logo-tile,
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  text-align: center !important;
  justify-content: center !important;
  align-items: center !important;
}

/* Tablet */
@media(max-width:1180px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215-proof-stack .dgs-v1215-section-head{
    width: min(100%, 1040px) !important;
    max-width: 1040px !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head h2{
    max-width: 980px !important;
    font-size: clamp(3rem, 7vw, 5.4rem) !important;
    line-height: 1.06 !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    max-width: 820px !important;
  }
}

/* Mobile */
@media(max-width:767px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p,
  .dgs-v1215-proof-stack .dgs-v1215-section-head,
  .dgs-v1215-proof-stack .dgs-v1215-section-head h2,
  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    width: 100% !important;
    max-width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head h2{
    font-size: clamp(2.6rem, 11vw, 4rem) !important;
    line-height: 1.08 !important;
    letter-spacing: -0.055em !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    font-size: 15px !important;
    line-height: 1.65 !important;
  }

  .dgs-v1215-industries .dgs-v1215-industry-pills{
    justify-content: center !important;
  }

  .dgs-v1215-final-card,
  .dgs-v1215-final-card h2,
  .dgs-v1215-final-card p{
    text-align: left !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    text-align: center !important;
    justify-content: center !important;
  }
}</style>
<style id="dgs-weavings-live-header-fix">/* =====================================================
   WEAVINGS CASE STUDY LIVE VIEW FIX
   Fixes live published view where the Weavings screenshot
   can get cropped/cached differently from Elementor preview.
   Only targets the Weavings case card.
===================================================== */
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
  height: clamp(300px, 18.5vw, 370px) !important;
  overflow: hidden !important;
  background: #050505 !important;
}

.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media img.dgs-weavings-live-img,
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media > img.dgs-weavings-live-img{
  width: 100% !important;
  height: 100% !important;
  min-width: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: top center !important;
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  filter: none !important;
}

.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media picture,
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media picture img{
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

@media(max-width:1180px){
  .dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
    height: 320px !important;
  }
}

@media(max-width:767px){
  .dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
    height: 250px !important;
  }
}</style>
<style id="dgs-video-thumbnail-frame-fix">.thumb-video{
  opacity:0 !important;
  visibility:visible !important;
}
.gallery-item.video-ready .thumb-video,
.case-study-item.video-ready .thumb-video{
  opacity:1 !important;
}
.gallery-item.video-ready .thumb-fallback,
.case-study-item.video-ready .thumb-fallback{
  opacity:0 !important;
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
<style>form.fluent_form_1 .ff-btn-submit:not(.ff_btn_no_style) { background-color: var(--fluentform-primary); color: #ffffff; }</style>
<style>form.fluent_form_1 .ff-btn-submit:not(.ff_btn_no_style) { background-color: var(--fluentform-primary); color: #ffffff; }</style>` }} />
      <div dangerouslySetInnerHTML={{ __html: `<main  id="main" class="cmsmasters-main site-main"><div  class="cmsmasters-main__outer"><div  class="cmsmasters-main__inner"><div class="cmsmasters-content-wrap"><div class="cmsmasters-content"><div data-elementor-type="wp-page" data-elementor-id="63505" class="elementor elementor-63505" data-elementor-post-type="page"><div class="elementor-element elementor-element-7f5ae55 e-con-full e-flex cmsmasters-block-default e-con e-parent" data-id="7f5ae55" data-element_type="container" data-e-type="container"><div class="elementor-element elementor-element-a492445 cmsmasters-block-default cmsmasters-sticky-default elementor-widget elementor-widget-html" data-id="a492445" data-element_type="widget" data-e-type="widget" data-widget_type="html.default"><main class="dgs-v1215" id="dgs-v1215"><div class="dgs-v1215-bg" aria-hidden="true"><canvas id="dgs-v1215-canvas"></canvas><div class="dgs-v1215-fallback"></div><div class="dgs-v1215-grid"></div><div class="dgs-v1215-vignette"></div></div><section class="dgs-v1215-hero" id="dgs-home-start"><div class="dgs-v1215-shell"><div class="dgs-v1215-hero-layout"><div class="dgs-v1215-copy dgs-v1215-reveal"><div class="dgs-v1215-kicker"><span></span>Mumbai Based Full Service Digital Marketing Agency</div><h1>
Full Service
<span>Digital Marketing</span>
Agency In Mumbai</h1><p>
D’Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through connected search, websites, social media, paid campaigns, branding and AI-led creative production.</p><div class="dgs-v1215-actions">
<a href="#contact-form" class="dgs-v1215-btn dgs-v1215-btn-primary">Get A Growth Audit <span>→</span></a>
<a href="#dgs-v1215-services" class="dgs-v1215-btn dgs-v1215-btn-secondary">View Services</a></div></div><div class="dgs-v1215-visual dgs-v1215-reveal"><div class="dgs-v1215-robot-wrap" id="dgs-v1215-robot-wrap"><div class="dgs-v1215-robot-aura"></div><img width="2000" height="2000"
id="dgs-v1215-robot"
src="https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp"
alt="Digital marketing, SEO, AEO, GEO, LLM SEO and AI production agency visual for D'Genius Solutions"
loading="eager"
decoding="async"
fetchpriority="high"
><div class="dgs-v1215-floating-chip dgs-v1215-chip-one">
<span>Search Visibility</span>
<strong>SEO AEO GEO</strong></div><div class="dgs-v1215-floating-chip dgs-v1215-chip-two">
<span>Digital Growth</span>
<strong>Social Ads Web</strong></div><div class="dgs-v1215-floating-chip dgs-v1215-chip-three">
<span>AI Production</span>
<strong>Video Creative Content</strong></div></div></div></div><div class="dgs-v1215-statline dgs-v1215-reveal"><div><strong>200+</strong><span>Brands Worked With</span></div><div><strong>20K+</strong><span>Customers Reached</span></div><div><strong>4.5</strong><span>Average User Rating</span></div><div><strong>Mumbai</strong><span>Based Full Service Team</span></div></div></div></section><section class="dgs-v1215-rail" aria-label="D'Genius Solutions capabilities"><div class="dgs-v1215-rail-line"><div class="dgs-v1215-rail-track">
<span>Digital Marketing Agency In Mumbai</span>
<span>Search Engine Optimisation</span>
<span>Answer Engine Optimisation</span>
<span>Generative Search Visibility</span>
<span>LLM Brand Visibility</span>
<span>Voice Search Readiness</span>
<span>Website Development</span>
<span>Performance Marketing</span>
<span>Social Media Marketing</span>
<span>AI-Led Creative Production</span></div><div class="dgs-v1215-rail-track" aria-hidden="true">
<span>Digital Marketing Agency In Mumbai</span>
<span>Search Engine Optimisation</span>
<span>Answer Engine Optimisation</span>
<span>Generative Search Visibility</span>
<span>LLM Brand Visibility</span>
<span>Voice Search Readiness</span>
<span>Website Development</span>
<span>Performance Marketing</span>
<span>Social Media Marketing</span>
<span>AI-Led Creative Production</span></div></div></section><section class="dgs-v1215-proof-stack" id="dgs-proof"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Trusted By 200+ Brands</div><h2>Trusted by brands across finance, retail, education, healthcare, consumer and technology categories.</h2><p>Real brand work across digital marketing, websites, SEO, creative design, social media, performance marketing and AI production.</p></div><div class="dgs-v1215-logo-marquee dgs-v1215-reveal" aria-label="Client logo wall"><div class="dgs-v1215-logo-track"><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Eureka-forbes_White.png" alt="Eureka Forbes client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABEA-1.png" alt="Aditya Birla Education Academy client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Saint-gobian.png" alt="Saint Gobain client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Pantaloons.png" alt="Pantaloons client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="300" height="95" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/output-onlinepngtools-300x95.png" alt="Jaipur Kurti client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 300px; --smush-placeholder-aspect-ratio: 300/95;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Nutriuits.png" alt="Nutriuits client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Raymond.png" alt="Raymond client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Plush-puppy.png" alt="Plush Puppy client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Candour-london.png" alt="Candour London client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Styleup.png" alt="Styleup client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Onida.png" alt="Onida client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Aram.png" alt="Aaram client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Traznact.png" alt="Trazact client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/M-power.png" alt="M Power Aditya Birla Education Trust client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Compuage.png" alt="Compuage client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Solco.png" alt="Solco client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Struetral.png" alt="Structural Specialties client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="300" height="109" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/logo-300x109.png" alt="MKA client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 300px; --smush-placeholder-aspect-ratio: 300/109;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/colored-logo-1.png" alt="Club Med client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Druva.png" alt="Druva client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Farm-classics.png" alt="Farm Classics client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Kreedo.png" alt="Kreedo client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/marigold-lane.png" alt="Marigold Lane client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="107" height="29" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/kmbl-logo.svg" alt="Kotak Mahindra Bank client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 107px; --smush-placeholder-aspect-ratio: 107/29;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Ujass.png" alt="Ujaas client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Abis.png" alt="Aditya Birla Integrated School client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABworld-acedemy.png" alt="Aditya Birla World Academy client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="230" height="140" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABET.png" alt="Aditya Birla Education Trust client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 230px; --smush-placeholder-aspect-ratio: 230/140;"></div><div class="dgs-v1215-logo-tile"><img width="300" height="86" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/logo_v2-300x86.png" alt="TheWorldGrad client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 300px; --smush-placeholder-aspect-ratio: 300/86;"></div><div class="dgs-v1215-logo-tile"><img width="300" height="300" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Humanxt-1-300x300.png" alt="Humanxt client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 300px; --smush-placeholder-aspect-ratio: 300/300;"></div><div class="dgs-v1215-logo-tile"><img width="243" height="62" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/cropped-ClearFX-Academy-White-Text.png" alt="ClearFX Academy client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 243px; --smush-placeholder-aspect-ratio: 243/62;"></div><div class="dgs-v1215-logo-tile"><img width="134" height="41" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ind.svg" alt="IND client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 134px; --smush-placeholder-aspect-ratio: 134/41;"></div><div class="dgs-v1215-logo-tile"><img width="170" height="60" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/12/Weavings.webp" alt="Weavings client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 170px; --smush-placeholder-aspect-ratio: 170/60;"></div><div class="dgs-v1215-logo-tile"><img width="600" height="600" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/sir-brandzalot-logo-png_seeklogo-194721.png" alt="Sir Brandzalot client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 600px; --smush-placeholder-aspect-ratio: 600/600;"></div><div class="dgs-v1215-logo-tile"><img width="1752" height="1129" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/PlanetSmartCity-logo.webp" alt="Planet Smart City client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 1752px; --smush-placeholder-aspect-ratio: 1752/1129;"></div><div class="dgs-v1215-logo-tile"><img width="2560" height="1006" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Novotel_logo_2016.svg-scaled.png.webp" alt="Novotel client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 2560px; --smush-placeholder-aspect-ratio: 2560/1006;"></div><div class="dgs-v1215-logo-tile"><img width="1920" height="1920" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/hEADER-Meryl.PNG.png.webp" alt="Meryl client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 1920px; --smush-placeholder-aspect-ratio: 1920/1920;"></div><div class="dgs-v1215-logo-tile"><img width="1600" height="1131" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/MedArtha-Logo-1-2048x1448-1.webp" alt="MedArtha client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 1600px; --smush-placeholder-aspect-ratio: 1600/1131;"></div><div class="dgs-v1215-logo-tile"><img width="800" height="280" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/LG_Grad_7PL5qt1J.png.webp" alt="LG client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 800px; --smush-placeholder-aspect-ratio: 800/280;"></div><div class="dgs-v1215-logo-tile"><img width="2560" height="1707" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Hanwha_Techwin-Logo.wine_-scaled.png.webp" alt="Hanwha Techwin client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 2560px; --smush-placeholder-aspect-ratio: 2560/1707;"></div><div class="dgs-v1215-logo-tile"><img width="1772" height="1772" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/f43e05c46553d32c6f3c2e40726b7070_1742972415.avif" alt="Client brand logo" loading="lazy" decoding="async"></div><div class="dgs-v1215-logo-tile"><img width="437" height="215" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Compuage_logo.png.webp" alt="Compuage client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 437px; --smush-placeholder-aspect-ratio: 437/215;"></div><div class="dgs-v1215-logo-tile"><img width="273" height="319" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/c7a0b6_7b153a1579c943279fffb93ca08b39b1mv2-1.avif" alt="Client brand logo" loading="lazy" decoding="async"></div><div class="dgs-v1215-logo-tile"><img width="1400" height="1000" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Blue_Text_White_Bkg-1.png.webp" alt="Client brand logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 1400px; --smush-placeholder-aspect-ratio: 1400/1000;"></div><div class="dgs-v1215-logo-tile"><img width="372" height="175" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/blanco-1.webp" alt="Blanco client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 372px; --smush-placeholder-aspect-ratio: 372/175;"></div><div class="dgs-v1215-logo-tile"><img width="1920" height="1080" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/AMAZONIA-LOGO-Ai.png.webp" alt="Amazonia client logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 1920px; --smush-placeholder-aspect-ratio: 1920/1080;"></div><div class="dgs-v1215-logo-tile"><img width="404" height="316" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/14919e226636115.Y3JvcCwyMzg4LDE4NjgsMjA2LDA.png.webp" alt="Client brand logo" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 404px; --smush-placeholder-aspect-ratio: 404/316;"></div>
<a href="#contact-form" class="dgs-v1215-logo-tile dgs-v1215-logo-text" aria-label="Go to the growth audit form">This Spot Awaits You</a></div></div><div class="dgs-v1215-awards-block" id="awards"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Awards & Recognition</div><h2>Recognized for <span>SEO, Content & Performance Marketing</span></h2><p>Recognition across workplace excellence, SEO execution, content quality and performance-led digital marketing.</p></div><div class="dgs-v1215-awards-grid dgs-v1215-reveal"><article class="dgs-v1215-award-card"><div class="dgs-v1215-award-image">
<img width="960" height="1280" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Prime-Insights1.png.webp" alt="Prime Insights Best Place to Work award for D'Genius Solutions Pvt. Ltd." decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 960px; --smush-placeholder-aspect-ratio: 960/1280;"></div><div class="dgs-v1215-award-body">
<span>Prime Insights · 2024</span><h3>Best Place to Work</h3><p>Recognition for D'Genius Solutions as a growth-focused and people-first digital marketing company.</p></div></article><article class="dgs-v1215-award-card"><div class="dgs-v1215-award-image">
<img width="960" height="1280" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Corporate-Connect1.png.webp" alt="Corporate Connect highly regarded digital marketing agency award for D'Genius Solutions Pvt. Ltd." decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 960px; --smush-placeholder-aspect-ratio: 960/1280;"></div><div class="dgs-v1215-award-body">
<span>Corporate Connect · 2024-25</span><h3>Highly Regarded Digital Marketing Agency to Watch Out</h3><p>Recognition for digital marketing impact, client-focused execution and scalable organic growth strategies.</p></div></article><article class="dgs-v1215-award-card"><div class="dgs-v1215-award-image">
<img width="960" height="1280" data-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/GLA1.png.webp" alt="GLA award for excellence in SEO content and performance marketing for D'Genius Solutions Pvt. Ltd." decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 960px; --smush-placeholder-aspect-ratio: 960/1280;"></div><div class="dgs-v1215-award-body">
<span>GLA · 2025</span><h3>Excellence in SEO, Content & Performance Marketing</h3><p>Awarded for consistent work across SEO execution, content strategy and performance-driven digital growth.</p></div></article></div></div></div></section><section class="dgs-v1215-service-clarity" id="dgs-v1215-services"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">What You Can Hire Us For</div><h2>One team for search, web, creative, performance and AI production.</h2><p>We are not only a content or design team. D’Genius Solutions works across the complete digital growth stack so your website, search, ads, social and creative output move in one direction.</p></div><div class="dgs-v1215-service-menu dgs-v1215-reveal"><article>
<span>01</span><h3>Search Visibility & AI Discovery</h3><p>Search strategy, technical foundations, content structure and AI-search readiness designed to improve how brands are discovered across Google and emerging answer platforms.</p><div>
<a href="https://www.dgeniussolutions.com/services/seo-services-in-mumbai/">SEO Services</a>
<a href="https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/">AEO Services</a>
<a href="https://www.dgeniussolutions.com/services/geo/">GEO Services</a>
<a href="https://www.dgeniussolutions.com/services/llm-seo-service/">LLM SEO</a></div></article><article>
<span>02</span><h3>Website Development & AMC</h3><p>Website design, development, maintenance, landing pages, UX improvements, conversion journeys and SEO-friendly page structures.</p><div>
<a href="https://www.dgeniussolutions.com/services/website-development-amc/">Website Development</a></div></article><article>
<span>03</span><h3>Social Media & Performance Marketing</h3><p>Social strategy, content calendars, creative design, Google Ads, Meta Ads, lead generation and campaign optimization.</p><div>
<a href="https://www.dgeniussolutions.com/services/social-media-marketing/">Social Media</a>
<a href="https://www.dgeniussolutions.com/services/performance-marketing/">Performance Marketing</a></div></article><article>
<span>04</span><h3>Branding, Content & AI Production</h3><p>Brand identity, campaign content, AI videos, product visuals, mascots, festival posts, TVC concepts and scalable creative output.</p><div>
<a href="https://www.dgeniussolutions.com/services/branding/">Branding</a>
<a href="https://www.dgeniussolutions.com/services/content-creation/">Content Creation</a>
<a href="https://www.dgeniussolutions.com/services/ai-video-production-agency/">AI Production</a></div></article></div></div></section><section id="portfolio"
class="dgs-v1215-ai-portfolio"
itemscope itemtype="https://schema.org/CollectionPage"><div class="dgs-v1215-shell dgs-ai-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Portfolio</div><h2 itemprop="name">AI-Led Creative <span>Portfolio</span></h2><p>Videos, product visuals, mascots, festival campaigns, TVC concepts and AI-led creative assets for brands that need faster content production.</p></div><div class="dgs-ai-service-clarity dgs-v1215-reveal" itemscope itemtype="https://schema.org/Service"><meta itemprop="serviceType" content="AI Production, AI Video Production, Generative AI Creative Production"><meta itemprop="areaServed" content="Mumbai"><div class="dgs-ai-service-grid"><div class="dgs-ai-service-copy"><p class="dgs-ai-service-kicker">AI-Led Creative Production</p><h3 itemprop="name">
Creative production for campaigns, product stories and social content.</h3><p itemprop="description">
This portfolio shows how strategy, AI-led workflows, editing and brand control can support faster creative output across campaigns, products and social content.</p></div><div class="dgs-ai-service-points" aria-label="AI production services offered by D'Genius Solutions"><article>
<span>01</span><h4>AI Video Production</h4><p>Short-form videos, reels, campaign films, product stories and TVC-style concepts for faster content output.</p></article><article>
<span>02</span><h4>AI Product Visuals</h4><p>Product-led imagery and motion for jewellery, FMCG, lifestyle, retail, ecommerce and campaign launches.</p></article><article>
<span>03</span><h4>Mascot & Character AI</h4><p>AI-generated mascots and character systems that help brands build recall, storytelling and social media consistency.</p></article><article>
<span>04</span><h4>Festival & Topical Content</h4><p>High-speed creative production for festive campaigns, topical posts, social calendars and moment-led brand communication.</p></article></div></div><div class="dgs-ai-process-strip" aria-label="AI production process"><div><strong>Brief</strong><span>Brand, product, audience and campaign goal.</span></div><div><strong>Concept</strong><span>Script, visual direction and production style.</span></div><div><strong>Generate</strong><span>AI visuals, videos, characters and creative assets.</span></div><div><strong>Refine</strong><span>Editing, motion, sound, copy and brand control.</span></div><div><strong>Deliver</strong><span>Campaign-ready assets for social, ads and web.</span></div></div></div><nav class="portfolio-filters"
role="navigation"
aria-label="Portfolio navigation"><a href="#all" class="portfolio-filter-tab active" data-target="portfolio-gallery-view">
ALL PORTFOLIO
<span aria-hidden="true"></span>
</a><a href="#mascot" class="portfolio-filter-tab" data-target="mascot-view">
MASCOT AI
<span aria-hidden="true"></span>
</a><a href="#festival" class="portfolio-filter-tab" data-target="festival-view">
FESTIVAL POSTS
<span aria-hidden="true"></span>
</a><a href="#mythological" class="portfolio-filter-tab" data-target="mythological-view">
MYTHOLOGICAL AI
<span aria-hidden="true"></span>
</a><a href="#product" class="portfolio-filter-tab" data-target="product-view">
PRODUCT AI
<span aria-hidden="true"></span>
</a><a href="#jewellery" class="portfolio-filter-tab" data-target="jewellery-view">
JEWELLERY AI
<span aria-hidden="true"></span>
</a><a href="#concept" class="portfolio-filter-tab" data-target="concept-view">
CONCEPT AI
<span aria-hidden="true"></span>
</a><a href="#tvc" class="portfolio-filter-tab" data-target="tvc-view">
TVC AI
<span aria-hidden="true"></span>
</a></nav><div id="content-container" class="dgs-ai-content-container"><div id="portfolio-gallery-view" class="content-view active-view"><div id="portfolio-gallery"></div><div class="dgs-load-wrap">
<a href="#load-more" id="load-more-btn">
VIEW MORE WORK
</a></div></div><div id="mascot-view" class="content-view"><div id="mascot-gallery"></div></div><div id="festival-view" class="content-view"><div id="festival-gallery"></div></div><div id="mythological-view" class="content-view"><div id="mythological-gallery"></div></div><div id="product-view" class="content-view"><div id="product-gallery"></div></div><div id="jewellery-view" class="content-view"><div id="jewellery-gallery"></div></div><div id="concept-view" class="content-view"><div id="concept-gallery"></div></div><div id="tvc-view" class="content-view"><div id="tvc-gallery"></div></div></div><div id="lightbox" class="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Portfolio video preview"><button id="lightbox-close" class="portfolio-lightbox-btn portfolio-lightbox-close dgs-plain-control" type="button" aria-label="Close video">
×
</button><button id="lightbox-prev" class="portfolio-lightbox-btn portfolio-lightbox-arrow portfolio-lightbox-prev dgs-plain-control" type="button" aria-label="Previous video">
‹
</button><div id="lightbox-content" class="portfolio-lightbox-content"><video id="lightbox-player"
controls
playsinline
preload="auto"
controlslist="nodownload"
disablepictureinpicture
oncontextmenu="return false;"></video></div><button id="lightbox-next" class="portfolio-lightbox-btn portfolio-lightbox-arrow portfolio-lightbox-next dgs-plain-control" type="button" aria-label="Next video">
›
</button></div></div></section><section class="dgs-v1215-case-block" id="case-studies"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Proven Results</div><h2>SEO, Website And Digital Growth Case Studies</h2><p>Real results from brands where search visibility, content structure, website experience and digital execution worked together.</p></div><div class="dgs-v1215-case-visual-grid dgs-v1215-reveal"><article class="dgs-v1215-case-visual-card"><div class="dgs-v1215-case-media">
<img width="2560" height="1022" data-src="https://www.dgeniussolutions.com/wp-content/uploads/2025/12/Theworldgrad-website-scaled.png.webp" alt="TheWorldGrad website SEO case study visual" decoding="async" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==" class="lazyload" style="--smush-placeholder-width: 2560px; --smush-placeholder-aspect-ratio: 2560/1022;"></div><div class="dgs-v1215-case-content">
<span>SEO Case Study · Education</span><h3>TheWorldGrad</h3><p>Overseas education platform helping Indian students study in Australia, UK and USA.</p><div class="dgs-v1215-case-metrics"><div><strong>95%</strong><small>Keyword Growth</small></div><div><strong>2.5x</strong><small>Backlinks</small></div><div><strong>6x</strong><small>Traffic</small></div></div></div></article><article class="dgs-v1215-case-visual-card dgs-weavings-case-card"><div class="dgs-v1215-case-media dgs-weavings-case-media">
<img fetchpriority="high"
class="dgs-weavings-live-img skip-lazy no-lazy"
src="https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Weavings-Home-page-.png?v=20260707-header-visible"
data-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/07/Weavings-Home-page-.png?v=20260707-header-visible"
data-no-lazy="1"
alt="Weavings website SEO and performance marketing case study visual"
loading="eager"
decoding="async"
fetchpriority="high"
width="1536"
height="864"
style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;"
></div><div class="dgs-v1215-case-content">
<span>SEO + Website + Performance · Staffing</span><h3>Weavings Manpower</h3><p>Staffing company offering contract staffing and payroll outsourcing across India.</p><div class="dgs-v1215-case-metrics"><div><strong>17.4K</strong><small>Clicks</small></div><div><strong>1.82M</strong><small>Impressions</small></div><div><strong>#1</strong><small>AI Ranking</small></div></div></div></article></div><div class="dgs-v1215-case-mini-grid dgs-v1215-reveal"><article class="dgs-v1215-case-mini"><span>Website Development & AMC</span><h3>Kotak Mahindra</h3></article><article class="dgs-v1215-case-mini"><span>Creative Designing</span><h3>Eureka Forbes</h3></article><article class="dgs-v1215-case-mini"><span>Website Development & AMC</span><h3>Onida</h3></article><article class="dgs-v1215-case-mini"><span>Social Media & Creative Designing</span><h3>Pantaloons</h3></article><article class="dgs-v1215-case-mini"><span>Creative Designing</span><h3>DSP Mutual Fund</h3></article><article class="dgs-v1215-case-mini"><span>AI Production Video</span><h3>Home Credit</h3></article></div></div></section><section class="dgs-v1215-portfolio" id="dgs-v1215-work"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Portfolio Gallery</div><h2>Brand Identity & Creative Excellence</h2><p>Campaigns, websites, creatives and AI production work across categories.</p></div><div class="dgs-v1215-gallery-frame dgs-v1215-reveal"><div id="envira-gallery-wrap-63155" class="envira-gallery-wrap envira-lazy-loading-enabled envira-layout-automatic" itemscope itemtype="https://schema.org/ImageGallery"><div class="envira-loader"><div></div><div></div><div></div><div></div></div><div id="envira-gallery-63155" class="envira-gallery-public envira-gallery-0-columns envira-clear envira-gallery-justified-public" data-envira-id="63155" data-gallery-config='{"type":"default","layout":"automatic","columns":"0","gallery_theme":"base","justified_margins":1,"justified_last_row":"nojustify","lazy_loading":1,"lazy_loading_delay":500,"gutter":10,"gutter_mobile":0,"margin":10,"image_size":"default","square_size":300,"crop_width":640,"crop_height":480,"crop":0,"crop_position":"c","show_more_text":"Click for more","additional_copy_0":0,"additional_copy_title":0,"additional_copy_caption":0,"additional_copy_title_caption":0,"additional_copy_0_mobile":0,"additional_copy_title_mobile":0,"additional_copy_caption_mobile":0,"additional_copy_title_caption_mobile":0,"gallery_column_title_caption":"0","gallery_column_title_caption_mobile":"0","additional_copy_automatic_0":0,"additional_copy_automatic_title":0,"additional_copy_automatic_caption":0,"additional_copy_automatic_title_caption":0,"additional_copy_automatic_0_mobile":0,"additional_copy_automatic_title_mobile":0,"additional_copy_automatic_caption_mobile":0,"additional_copy_automatic_title_caption_mobile":0,"gallery_automatic_title_caption":"0","gallery_automatic_title_caption_mobile":"0","justified_row_height":150,"description_position":"0","description":"","random":"0","sort_order":"0","sorting_direction":"ASC","image_sizes_random":[],"isotope":0,"lightbox_enabled":1,"gallery_link_enabled":1,"lightbox_theme":"base_dark","lightbox_image_size":"default","title_display":"float","lightbox_title_caption":"title","arrows":1,"arrows_position":"inside","toolbar":1,"toolbar_title":0,"toolbar_position":"top","loop":1,"lightbox_open_close_effect":"fade","effect":"fade","supersize":0,"thumbnails_toggle":0,"thumbnails_hide":0,"image_counter":0,"lightbox_html_caption":0,"thumbnails":1,"thumbnails_width":"auto","thumbnails_height":"auto","thumbnails_position":"bottom","thumbnails_custom_size":0,"mobile":1,"mobile_width":320,"mobile_height":240,"mobile_lightbox":1,"mobile_gallery_link_enabled":0,"mobile_arrows":1,"mobile_toolbar":1,"mobile_thumbnails":1,"mobile_touchwipe_close":0,"mobile_thumbnails_width":75,"mobile_thumbnails_height":50,"mobile_justified_row_height":80,"keyboard":true,"standalone_template":"","classes":[""],"rtl":0,"slug":"63155","gallery_id":"63155"}' data-gallery-images='[{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1.png.webp","title":"SS_01 (3)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_01-3-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_01-3-1.png.webp","index":0,"id":63158,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_01-3-1-75x50_c.png","title":"SS_01 (3)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3.png.webp","title":"SS_02 (3)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_02-3-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_02-3.png.webp","index":1,"id":63159,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_02-3-75x50_c.png","title":"SS_02 (3)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3.png.webp","title":"SS_03 (3)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_03-3-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_03-3.png.webp","index":2,"id":63160,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_03-3-75x50_c.png","title":"SS_03 (3)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3.png.webp","title":"SS_04 (3)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_04-3-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_04-3.png.webp","index":3,"id":63161,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_04-3-75x50_c.png","title":"SS_04 (3)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2.png.webp","title":"SS_05 (2)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_05-2-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_05-2.png.webp","index":4,"id":63162,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_05-2-75x50_c.png","title":"SS_05 (2)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3.png.webp","title":"SS_06 (3)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_06-3-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS_06-3.png.webp","index":5,"id":63163,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS_06-3-75x50_c.png","title":"SS_06 (3)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1.png.webp","title":"SS1 (1)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS1-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/SS1-1.png.webp","index":6,"id":63164,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/SS1-1-75x50_c.png","title":"SS1 (1)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-scaled.jpg.webp","title":"Standee_rays","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-scaled.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee_rays-1-scaled-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-138x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-768x1676.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-469x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-704x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-939x2048.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-138x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-600x1309.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee_rays-1-scaled.jpg.webp","index":7,"id":63151,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee_rays-1-scaled-75x50_c.jpg","title":"Standee_rays"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1.png.webp","title":"Women Option 1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Women-Option-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Women-Option-1.png.webp","index":8,"id":63149,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Women-Option-1-75x50_c.png","title":"Women Option 1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1.png.webp","title":"Men Option 1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Men-Option-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Men-Option-1.png.webp","index":9,"id":63148,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Men-Option-1-75x50_c.png","title":"Men Option 1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1.png.webp","title":"Artboard 1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Artboard-1-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-300x169.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-768x432.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-1024x576.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-1536x864.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-533x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-600x338.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-1.png.webp","index":10,"id":63147,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Artboard-1-1-75x50_c.png","title":"Artboard 1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-scaled.png.webp","title":"New Dandiya Grid","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-scaled.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/New-Dandiya-Grid-1-scaled-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-300x200.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-768x512.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-1024x683.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-1536x1024.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-2048x1365.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-450x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-600x400.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/New-Dandiya-Grid-1-scaled.png.webp","index":11,"id":63145,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/New-Dandiya-Grid-1-scaled-75x50_c.png","title":"New Dandiya Grid"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6.jpg.webp","title":"Wedding Story6","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story6-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story6.jpg.webp","index":12,"id":63143,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story6-75x50_c.jpg","title":"Wedding Story6"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3.jpg.webp","title":"Wedding Story3","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story3-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story3.jpg.webp","index":13,"id":63142,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story3-75x50_c.jpg","title":"Wedding Story3"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2.jpg.webp","title":"Wedding Story2","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story2-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Story2.jpg.webp","index":14,"id":63141,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Story2-75x50_c.jpg","title":"Wedding Story2"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage.jpg.webp","title":"Purple Collage","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Purple-Collage-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Purple-Collage.jpg.webp","index":15,"id":63140,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Purple-Collage-75x50_c.jpg","title":"Purple Collage"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage.jpg.webp","title":"Pink Collage","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Pink-Collage-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Pink-Collage.jpg.webp","index":16,"id":63139,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Pink-Collage-75x50_c.jpg","title":"Pink Collage"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_.jpg.webp","title":"Main_","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Main_-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Main_.jpg.webp","index":17,"id":63138,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Main_-75x50_c.jpg","title":"Main_"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1.jpg.webp","title":"Karva chauth Story saree_New","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree_New-1-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-1.jpg.webp","index":18,"id":63137,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree_New-1-75x50_c.jpg","title":"Karva chauth Story saree_New"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New.jpg.webp","title":"Karva chauth Story saree_New","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree_New-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree_New.jpg.webp","index":19,"id":63136,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree_New-75x50_c.jpg","title":"Karva chauth Story saree_New"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree.jpg.webp","title":"Karva chauth Story saree","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Karva-chauth-Story-saree.jpg.webp","index":20,"id":63135,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Karva-chauth-Story-saree-75x50_c.jpg","title":"Karva chauth Story saree"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1.png.webp","title":"Diwali Story1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Diwali-Story1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-Story1.png.webp","index":21,"id":63134,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Diwali-Story1-75x50_c.png","title":"Diwali Story1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2.png.webp","title":"Yellow Floral Print StoryOpt2","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Yellow-Floral-Print-StoryOpt2-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Yellow-Floral-Print-StoryOpt2.png.webp","index":22,"id":63133,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Yellow-Floral-Print-StoryOpt2-75x50_c.png","title":"Yellow Floral Print StoryOpt2"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story.png.webp","title":"Wine Ethenic Churidar Story","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wine-Ethenic-Churidar-Story-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wine-Ethenic-Churidar-Story.png.webp","index":23,"id":63132,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wine-Ethenic-Churidar-Story-75x50_c.png","title":"Wine Ethenic Churidar Story"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-scaled.png","title":"Wedding Grid_New","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-scaled.png","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-scaled-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Grid_New-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-300x300.png","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-768x768.png","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-1024x1024.png","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-1536x1536.png","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-2048x2048.png","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Grid_New-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Grid_New-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-300x300.png","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Grid_New-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-300x300.png","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-600x600.png","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Wedding-Grid_New-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-scaled.png","index":24,"id":63131,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Wedding-Grid_New-scaled-75x50_c.png","title":"Wedding Grid_New"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png.webp","title":"Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png.webp","index":25,"id":63130,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-75x50_c.png","title":"Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy.png.webp","title":"Sarree Story 1 copy","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy.png.webp","index":26,"id":63128,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-75x50_c.png","title":"Sarree Story 1 copy"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1.png.webp","title":"Sarree Story 1 copy 2","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-2-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-1.png.webp","index":27,"id":63127,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-2-1-75x50_c.png","title":"Sarree Story 1 copy 2"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2.png.webp","title":"Sarree Story 1 copy 2","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-2-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sarree-Story-1-copy-2.png.webp","index":28,"id":63126,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sarree-Story-1-copy-2-75x50_c.png","title":"Sarree Story 1 copy 2"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story.png.webp","title":"Sale Season sale story","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sale-Season-sale-story-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Sale-Season-sale-story.png.webp","index":29,"id":63125,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Sale-Season-sale-story-75x50_c.png","title":"Sale Season sale story"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png.webp","title":"Green Chanderi Straight Embroidered Kurta With Pants &amp; Dupatta Set","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png.webp","index":30,"id":63124,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-75x50_c.png","title":"Green Chanderi Straight Embroidered Kurta With Pants &amp; Dupatta Set"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-scaled.jpg.webp","title":"Diwali GridOpt1.1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-scaled.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Diwali-GridOpt1.1-1-scaled-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-300x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-768x768.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-1024x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-1536x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-2048x2048.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-300x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-600x600.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Diwali-GridOpt1.1-1-scaled.jpg.webp","index":31,"id":63123,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Diwali-GridOpt1.1-1-scaled-75x50_c.jpg","title":"Diwali GridOpt1.1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1.png.webp","title":"Artboard 1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Artboard-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-169x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-768x1365.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-576x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-864x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-169x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-600x1067.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Artboard-1.png.webp","index":32,"id":63121,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Artboard-1-75x50_c.png","title":"Artboard 1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-scaled.webp","title":"1x1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-scaled.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-scaled-75x50_c.webp","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-150x150.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-300x300.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-768x768.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-1024x1024.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-1536x1536.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-2048x2048.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-260x260.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-260x260.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-300x300.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-330x180.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-300x300.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-600x600.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-100x100.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-scaled.webp","index":33,"id":63120,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/1x1-scaled-75x50_c.webp","title":"1x1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1.png.webp","title":"WED1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/WED1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/WED1.png.webp","index":34,"id":63119,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/WED1-75x50_c.png","title":"WED1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams.jpg.webp","title":"Unlock Powerful dreams","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Unlock-Powerful-dreams-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-240x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-768x960.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-819x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-240x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-600x750.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Unlock-Powerful-dreams.jpg.webp","index":35,"id":63118,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Unlock-Powerful-dreams-75x50_c.jpg","title":"Unlock Powerful dreams"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11.jpg.webp","title":"11","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/11-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":"1","keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/11.jpg.webp","index":36,"id":63117,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/11-75x50_c.jpg","title":"11"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-scaled.jpg.webp","title":"Standee Option 5","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-scaled.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-5-scaled-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":"1","keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-150x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-768x1536.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-512x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-768x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-1024x2048.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-150x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-600x1200.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-5-scaled.jpg.webp","index":37,"id":63116,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-5-scaled-75x50_c.jpg","title":"Standee Option 5"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-scaled.jpg.webp","title":"Standee Option 4","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-scaled.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-4-scaled-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-150x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-768x1536.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-512x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-768x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-1024x2048.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-150x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-600x1200.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-4-scaled.jpg.webp","index":38,"id":63115,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-4-scaled-75x50_c.jpg","title":"Standee Option 4"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-scaled.jpg.webp","title":"Standee Option 6 (1)","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-scaled.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-6-1-scaled-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":"1","keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-150x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-768x1536.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-512x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-768x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-1024x2048.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-150x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-600x1200.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Standee-Option-6-1-scaled.jpg.webp","index":39,"id":63114,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Standee-Option-6-1-scaled-75x50_c.jpg","title":"Standee Option 6 (1)"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","title":"4","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/4-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-238x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-238x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/4.png.webp","index":40,"id":63113,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/4-75x50_c.png","title":"4"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day.png.webp","title":"international_yoga_day","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/international_yoga_day-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/international_yoga_day.png.webp","index":41,"id":63112,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/international_yoga_day-75x50_c.png","title":"international_yoga_day"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp","title":"IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp","index":42,"id":63111,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-75x50_c.png","title":"IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1.png.webp","title":"Chritmas Post1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Chritmas-Post1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Chritmas-Post1.png.webp","index":43,"id":63109,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Chritmas-Post1-75x50_c.png","title":"Chritmas Post1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277.png.webp","title":"277","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/277-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-300x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-768x768.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-1024x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-1536x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-300x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-600x600.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/277.png.webp","index":44,"id":63108,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/277-75x50_c.png","title":"277"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet.png.webp","title":"How to calm your pet","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/How-to-calm-your-pet-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-300x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-768x768.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-1024x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-300x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-600x600.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/How-to-calm-your-pet.png.webp","index":45,"id":63107,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/How-to-calm-your-pet-75x50_c.png","title":"How to calm your pet"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1.png.webp","title":"Lip Filler1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Lip-Filler1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Lip-Filler1.png.webp","index":46,"id":63106,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Lip-Filler1-75x50_c.png","title":"Lip Filler1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-scaled.png.webp","title":"DIY Face mask","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-scaled.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/DIY-Face-mask-scaled-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-300x63.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-768x160.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-1024x213.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-1536x320.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-2048x427.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-860x179.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-600x125.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/DIY-Face-mask-scaled.png.webp","index":47,"id":63104,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/DIY-Face-mask-scaled-75x50_c.png","title":"DIY Face mask"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final.png.webp","title":"Body Filler Treatment_Final","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Body-Filler-Treatment_Final-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Body-Filler-Treatment_Final.png.webp","index":48,"id":63102,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Body-Filler-Treatment_Final-75x50_c.png","title":"Body Filler Treatment_Final"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1.png.webp","title":"Audrey Thoery1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Audrey-Thoery1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Audrey-Thoery1.png.webp","index":49,"id":63101,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Audrey-Thoery1-75x50_c.png","title":"Audrey Thoery1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1.png.webp","title":"Under Eyes Fillers Treatment1","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Under-Eyes-Fillers-Treatment1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Under-Eyes-Fillers-Treatment1.png.webp","index":50,"id":63100,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Under-Eyes-Fillers-Treatment1-75x50_c.png","title":"Under Eyes Fillers Treatment1"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3.png.webp","title":"Profilo Body_3","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Profilo-Body_3-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body_3.png.webp","index":51,"id":63099,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Profilo-Body_3-75x50_c.png","title":"Profilo Body_3"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body.png.webp","title":"Profilo Body","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Profilo-Body-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Profilo-Body.png.webp","index":52,"id":63098,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Profilo-Body-75x50_c.png","title":"Profilo Body"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day.png.webp","title":"Mother_s Day","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Mother_s-Day-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Mother_s-Day.png.webp","index":53,"id":63097,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Mother_s-Day-75x50_c.png","title":"Mother_s Day"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera.jpg.webp","title":"Dusshera","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Dusshera-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-169x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-768x1365.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-576x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-864x1536.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-169x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-600x1067.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Dusshera.jpg.webp","index":54,"id":63096,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Dusshera-75x50_c.jpg","title":"Dusshera"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1.png.webp","title":"Eduprenuer Awareness","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Eduprenuer-Awareness-1-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-240x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-768x960.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-819x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-240x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-600x750.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Eduprenuer-Awareness-1.png.webp","index":55,"id":63095,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Eduprenuer-Awareness-1-75x50_c.png","title":"Eduprenuer Awareness"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2.png.webp","title":"cover2","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/cover2-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-300x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-768x768.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-1024x1024.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-1536x1536.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-300x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-600x600.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/cover2.png.webp","index":56,"id":63093,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/cover2-75x50_c.png","title":"cover2"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7.png.webp","title":"Amazonia grid7","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Amazonia-grid7-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-300x200.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-768x512.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-1024x683.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-450x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-600x400.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/Amazonia-grid7.png.webp","index":57,"id":63092,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/Amazonia-grid7-75x50_c.png","title":"Amazonia grid7"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","title":"420-720PX_SOS","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/420-720PX_SOS-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-175x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-175x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_SOS.png.webp","index":58,"id":63091,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/420-720PX_SOS-75x50_c.png","title":"420-720PX_SOS"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","title":"420-720PX_Clubmed","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/420-720PX_Clubmed-75x50_c.png","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-150x150.png.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-175x300.png.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-260x260.png.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-260x260.png.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-175x300.png.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-330x180.png.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-300x300.png.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed-100x100.png.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/420-720PX_Clubmed.png.webp","index":59,"id":63090,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/420-720PX_Clubmed-75x50_c.png","title":"420-720PX_Clubmed"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03.jpg.webp","title":"3-Grid_03","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/3-Grid_03-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-300x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-768x768.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-1024x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-300x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-600x600.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_03.jpg.webp","index":60,"id":63089,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/3-Grid_03-75x50_c.jpg","title":"3-Grid_03"},"gallery_id":"63155"},{"status":"active","src":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01.jpg.webp","title":"3-Grid_01","link":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01.jpg.webp","alt":"","caption":false,"thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/3-Grid_01-75x50_c.jpg","meta":{"aperture":null,"credit":null,"camera":null,"caption":"","created_timestamp":null,"copyright":null,"focal_length":null,"iso":null,"shutter_speed":null,"title":"","orientation":null,"keywords":null,"resized_images":null},"thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-150x150.jpg.webp","medium":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-300x300.jpg.webp","medium_large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-768x768.jpg.webp","large":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-1024x1024.jpg.webp","1536x1536":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01.jpg.webp","2048x2048":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01.jpg.webp","cmsmasters-thumb-archive":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-260x260.jpg.webp","cmsmasters-thumb-search":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-260x260.jpg.webp","cmsmasters-thumb-single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-300x300.jpg.webp","cmsmasters-thumb-more-posts":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-330x180.jpg.webp","woocommerce_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-300x300.jpg.webp","woocommerce_single":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-600x600.jpg.webp","woocommerce_gallery_thumbnail":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01-100x100.jpg.webp","full":"https:\/\/www.dgeniussolutions.com\/wp-content\/smush-webp\/2026\/04\/3-Grid_01.jpg.webp","index":61,"id":63088,"video":false,"opts":{"caption":"","thumb":"https:\/\/www.dgeniussolutions.com\/wp-content\/uploads\/2026\/04\/3-Grid_01-75x50_c.jpg","title":"3-Grid_01"},"gallery_id":"63155"}]' data-lightbox-theme='{&quot;arrows&quot;:true,&quot;margins&quot;:[120,0],&quot;gutter&quot;:&quot;100&quot;,&quot;thumbs_position&quot;:&quot;bottom&quot;,&quot;base_template&quot;:&quot;&lt;div id=\&quot;envirabox-63155\&quot; data-envirabox-id=\&quot;63155\&quot; class=\&quot;envirabox-container envirabox-theme-base_dark envirabox-wrap\&quot; role=\&quot;dialog\&quot;&gt;&lt;div class=\&quot;envirabox-bg\&quot;&gt;&lt;\/div&gt;&lt;div class=\&quot;envirabox-outer\&quot;&gt;&lt;div class=\&quot;envirabox-inner\&quot;&gt;&lt;div class=\&quot;envirabox-caption-wrap\&quot;&gt;&lt;div class=\&quot;envirabox-title\&quot;&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;div class=\&quot;envirabox-toolbar\&quot;&gt;&lt;div class=\&quot;envira-close-button\&quot;&gt;&lt;a data-envirabox-close class=\&quot;envirabox-item envirabox-close envirabox-button--close\&quot; title=\&quot;Close\&quot; href=\&quot;#\&quot;&gt;&lt;\/a&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;div class=\&quot;envirabox-navigation\&quot;&gt;&lt;a data-envirabox-prev title=\&quot;Prev\&quot; class=\&quot;envirabox-arrow envirabox-arrow--left envirabox-nav envirabox-prev\&quot; href=\&quot;#\&quot;&gt;&lt;span&gt;&lt;\/span&gt;&lt;\/a&gt;&lt;a data-envirabox-next title=\&quot;Next\&quot; class=\&quot;envirabox-arrow envirabox-arrow--right envirabox-nav envirabox-next\&quot; href=\&quot;#\&quot;&gt;&lt;span&gt;&lt;\/span&gt;&lt;\/a&gt;&lt;\/div&gt;&lt;div class=\&quot;envirabox-stage\&quot;&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;\/div&gt;&lt;\/div&gt;&quot;,&quot;load_all&quot;:false,&quot;error_template&quot;:&quot;&lt;div class=\&quot;envirabox-error\&quot;&gt;&lt;p&gt;{{ERROR}}&lt;p&gt;&lt;\/div&gt;&quot;,&quot;inner_caption&quot;:false,&quot;caption_position&quot;:false,&quot;arrow_position&quot;:false,&quot;toolbar&quot;:true,&quot;infobar&quot;:false,&quot;show_smallbtn&quot;:false,&quot;idle_time&quot;:false,&quot;click_content&quot;:false,&quot;click_slide&quot;:false,&quot;click_outside&quot;:false,&quot;animation_duration&quot;:false,&quot;transition_duration&quot;:false,&quot;small_btn_template&quot;:&quot;&lt;a data-envirabox-close class=\&quot;envirabox-item envirabox-close envirabox-button--close\&quot; title=\&quot;Close\&quot; href=\&quot;#\&quot;&gt;&lt;\/a&gt;&quot;}' data-parsed-attrs='{"id":"63155","cache":true}'><div id="envira-gallery-item-63158" class="envira-gallery-item envira-gallery-item-1 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_01-3-1.png.webp" title="SS_01 (3)" data-caption="" data-envira-item-id="63158" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_01-3-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_01-3-1-75x50_c.png" data-title="SS_01 (3)" data-envirabox='63155' itemprop="contentUrl"><img decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_01-3-1-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-1    envira-lazy" height="480" id="envira-gallery-image-63158" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_01 (3)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="0" data-envira-item-id="63158" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_01-3-1-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_01-3-1-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_01-3-1-1024x576.png.webp 2x" data-title="SS_01 (3)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63159" class="envira-gallery-item envira-gallery-item-2 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_02-3.png.webp" title="SS_02 (3)" data-caption="" data-envira-item-id="63159" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_02-3.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_02-3-75x50_c.png" data-title="SS_02 (3)" data-envirabox='63155' itemprop="contentUrl"><img decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_02-3-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-2    envira-lazy" height="480" id="envira-gallery-image-63159" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_02 (3)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="1" data-envira-item-id="63159" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_02-3-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_02-3-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_02-3-1024x576.png.webp 2x" data-title="SS_02 (3)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63160" class="envira-gallery-item envira-gallery-item-3 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_03-3.png.webp" title="SS_03 (3)" data-caption="" data-envira-item-id="63160" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_03-3.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_03-3-75x50_c.png" data-title="SS_03 (3)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_03-3-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-3    envira-lazy" height="480" id="envira-gallery-image-63160" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_03 (3)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="2" data-envira-item-id="63160" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_03-3-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_03-3-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_03-3-1024x576.png.webp 2x" data-title="SS_03 (3)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63161" class="envira-gallery-item envira-gallery-item-4 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_04-3.png.webp" title="SS_04 (3)" data-caption="" data-envira-item-id="63161" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_04-3.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_04-3-75x50_c.png" data-title="SS_04 (3)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_04-3-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-4    envira-lazy" height="480" id="envira-gallery-image-63161" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_04 (3)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="3" data-envira-item-id="63161" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_04-3-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_04-3-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_04-3-1024x576.png.webp 2x" data-title="SS_04 (3)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63162" class="envira-gallery-item envira-gallery-item-5 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_05-2.png.webp" title="SS_05 (2)" data-caption="" data-envira-item-id="63162" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_05-2.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_05-2-75x50_c.png" data-title="SS_05 (2)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_05-2-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-5    envira-lazy" height="480" id="envira-gallery-image-63162" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_05 (2)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="4" data-envira-item-id="63162" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_05-2-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_05-2-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_05-2-1024x576.png.webp 2x" data-title="SS_05 (2)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63163" class="envira-gallery-item envira-gallery-item-6 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_06-3.png.webp" title="SS_06 (3)" data-caption="" data-envira-item-id="63163" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_06-3.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_06-3-75x50_c.png" data-title="SS_06 (3)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_06-3-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-6    envira-lazy" height="480" id="envira-gallery-image-63163" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS_06 (3)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="5" data-envira-item-id="63163" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_06-3-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_06-3-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS_06-3-1024x576.png.webp 2x" data-title="SS_06 (3)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63164" class="envira-gallery-item envira-gallery-item-7 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS1-1.png.webp" title="SS1 (1)" data-caption="" data-envira-item-id="63164" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS1-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS1-1-75x50_c.png" data-title="SS1 (1)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS1-1-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-7    envira-lazy" height="480" id="envira-gallery-image-63164" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="SS1 (1)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="6" data-envira-item-id="63164" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS1-1-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS1-1-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/SS1-1-1024x576.png.webp 2x" data-title="SS1 (1)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63151" class="envira-gallery-item envira-gallery-item-8 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee_rays-1-scaled.jpg.webp" title="Standee_rays" data-caption="" data-envira-item-id="63151" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee_rays-1-scaled.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee_rays-1-scaled-75x50_c.jpg" data-title="Standee_rays" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee_rays-1-469x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-8    envira-lazy" height="480" id="envira-gallery-image-63151" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Standee_rays" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="7" data-envira-item-id="63151" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee_rays-1-469x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee_rays-1-469x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee_rays-1-469x1024.jpg.webp 2x" data-title="Standee_rays" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="138" /></a></div></div><div id="envira-gallery-item-63149" class="envira-gallery-item envira-gallery-item-9 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Women-Option-1.png.webp" title="Women Option 1" data-caption="" data-envira-item-id="63149" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Women-Option-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Women-Option-1-75x50_c.png" data-title="Women Option 1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Women-Option-1-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-9    envira-lazy" height="480" id="envira-gallery-image-63149" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Women Option 1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="8" data-envira-item-id="63149" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Women-Option-1-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Women-Option-1-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Women-Option-1-1024x576.png.webp 2x" data-title="Women Option 1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63148" class="envira-gallery-item envira-gallery-item-10 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Men-Option-1.png.webp" title="Men Option 1" data-caption="" data-envira-item-id="63148" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Men-Option-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Men-Option-1-75x50_c.png" data-title="Men Option 1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Men-Option-1-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-10    envira-lazy" height="480" id="envira-gallery-image-63148" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Men Option 1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="9" data-envira-item-id="63148" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Men-Option-1-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Men-Option-1-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Men-Option-1-1024x576.png.webp 2x" data-title="Men Option 1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63147" class="envira-gallery-item envira-gallery-item-11 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-1.png.webp" title="Artboard 1" data-caption="" data-envira-item-id="63147" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1-1-75x50_c.png" data-title="Artboard 1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-1-1024x576.png.webp" alt="" class="envira-gallery-image envira-gallery-image-11    envira-lazy" height="480" id="envira-gallery-image-63147" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Artboard 1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="10" data-envira-item-id="63147" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-1-1024x576.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-1-1024x576.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-1-1024x576.png.webp 2x" data-title="Artboard 1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="169" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63145" class="envira-gallery-item envira-gallery-item-12 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-scaled.png.webp" title="New Dandiya Grid" data-caption="" data-envira-item-id="63145" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/New-Dandiya-Grid-1-scaled.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/New-Dandiya-Grid-1-scaled-75x50_c.png" data-title="New Dandiya Grid" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-1024x683.png.webp" alt="" class="envira-gallery-image envira-gallery-image-12    envira-lazy" height="480" id="envira-gallery-image-63145" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="New Dandiya Grid" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="11" data-envira-item-id="63145" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-1024x683.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-1024x683.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-1024x683.png.webp 2x" data-title="New Dandiya Grid" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="200" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63143" class="envira-gallery-item envira-gallery-item-13 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6.jpg.webp" title="Wedding Story6" data-caption="" data-envira-item-id="63143" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story6.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story6-75x50_c.jpg" data-title="Wedding Story6" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-13    envira-lazy" height="480" id="envira-gallery-image-63143" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Wedding Story6" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="12" data-envira-item-id="63143" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6-576x1024.jpg.webp 2x" data-title="Wedding Story6" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63142" class="envira-gallery-item envira-gallery-item-14 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story3.jpg.webp" title="Wedding Story3" data-caption="" data-envira-item-id="63142" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story3.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story3-75x50_c.jpg" data-title="Wedding Story3" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story3-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-14    envira-lazy" height="480" id="envira-gallery-image-63142" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Wedding Story3" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="13" data-envira-item-id="63142" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story3-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story3-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story3-576x1024.jpg.webp 2x" data-title="Wedding Story3" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63141" class="envira-gallery-item envira-gallery-item-15 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story2.jpg.webp" title="Wedding Story2" data-caption="" data-envira-item-id="63141" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story2.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story2-75x50_c.jpg" data-title="Wedding Story2" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story2-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-15    envira-lazy" height="480" id="envira-gallery-image-63141" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Wedding Story2" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="14" data-envira-item-id="63141" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story2-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story2-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story2-576x1024.jpg.webp 2x" data-title="Wedding Story2" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63140" class="envira-gallery-item envira-gallery-item-16 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Purple-Collage.jpg.webp" title="Purple Collage" data-caption="" data-envira-item-id="63140" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Purple-Collage.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Purple-Collage-75x50_c.jpg" data-title="Purple Collage" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Purple-Collage-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-16    envira-lazy" height="480" id="envira-gallery-image-63140" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Purple Collage" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="15" data-envira-item-id="63140" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Purple-Collage-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Purple-Collage-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Purple-Collage-576x1024.jpg.webp 2x" data-title="Purple Collage" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63139" class="envira-gallery-item envira-gallery-item-17 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Pink-Collage.jpg.webp" title="Pink Collage" data-caption="" data-envira-item-id="63139" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Pink-Collage.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Pink-Collage-75x50_c.jpg" data-title="Pink Collage" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Pink-Collage-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-17    envira-lazy" height="480" id="envira-gallery-image-63139" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Pink Collage" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="16" data-envira-item-id="63139" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Pink-Collage-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Pink-Collage-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Pink-Collage-576x1024.jpg.webp 2x" data-title="Pink Collage" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63138" class="envira-gallery-item envira-gallery-item-18 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Main_.jpg.webp" title="Main_" data-caption="" data-envira-item-id="63138" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Main_.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Main_-75x50_c.jpg" data-title="Main_" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Main_-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-18    envira-lazy" height="480" id="envira-gallery-image-63138" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Main_" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="17" data-envira-item-id="63138" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Main_-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Main_-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Main_-576x1024.jpg.webp 2x" data-title="Main_" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63137" class="envira-gallery-item envira-gallery-item-19 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-1.jpg.webp" title="Karva chauth Story saree_New" data-caption="" data-envira-item-id="63137" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New-1.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New-1-75x50_c.jpg" data-title="Karva chauth Story saree_New" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-1-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-19    envira-lazy" height="480" id="envira-gallery-image-63137" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Karva chauth Story saree_New" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="18" data-envira-item-id="63137" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-1-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-1-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-1-576x1024.jpg.webp 2x" data-title="Karva chauth Story saree_New" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63136" class="envira-gallery-item envira-gallery-item-20 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New.jpg.webp" title="Karva chauth Story saree_New" data-caption="" data-envira-item-id="63136" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New-75x50_c.jpg" data-title="Karva chauth Story saree_New" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-20    envira-lazy" height="480" id="envira-gallery-image-63136" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Karva chauth Story saree_New" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="19" data-envira-item-id="63136" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree_New-576x1024.jpg.webp 2x" data-title="Karva chauth Story saree_New" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63135" class="envira-gallery-item envira-gallery-item-21 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree.jpg.webp" title="Karva chauth Story saree" data-caption="" data-envira-item-id="63135" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree-75x50_c.jpg" data-title="Karva chauth Story saree" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-21    envira-lazy" height="480" id="envira-gallery-image-63135" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Karva chauth Story saree" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="20" data-envira-item-id="63135" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Karva-chauth-Story-saree-576x1024.jpg.webp 2x" data-title="Karva chauth Story saree" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63134" class="envira-gallery-item envira-gallery-item-22 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-Story1.png.webp" title="Diwali Story1" data-caption="" data-envira-item-id="63134" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Story1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Story1-75x50_c.png" data-title="Diwali Story1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-Story1-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-22    envira-lazy" height="480" id="envira-gallery-image-63134" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Diwali Story1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="21" data-envira-item-id="63134" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-Story1-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-Story1-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-Story1-576x1024.png.webp 2x" data-title="Diwali Story1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63133" class="envira-gallery-item envira-gallery-item-23 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Yellow-Floral-Print-StoryOpt2.png.webp" title="Yellow Floral Print StoryOpt2" data-caption="" data-envira-item-id="63133" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Yellow-Floral-Print-StoryOpt2.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Yellow-Floral-Print-StoryOpt2-75x50_c.png" data-title="Yellow Floral Print StoryOpt2" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Yellow-Floral-Print-StoryOpt2-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-23    envira-lazy" height="480" id="envira-gallery-image-63133" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Yellow Floral Print StoryOpt2" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="22" data-envira-item-id="63133" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Yellow-Floral-Print-StoryOpt2-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Yellow-Floral-Print-StoryOpt2-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Yellow-Floral-Print-StoryOpt2-576x1024.png.webp 2x" data-title="Yellow Floral Print StoryOpt2" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63132" class="envira-gallery-item envira-gallery-item-24 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wine-Ethenic-Churidar-Story.png.webp" title="Wine Ethenic Churidar Story" data-caption="" data-envira-item-id="63132" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wine-Ethenic-Churidar-Story.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wine-Ethenic-Churidar-Story-75x50_c.png" data-title="Wine Ethenic Churidar Story" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wine-Ethenic-Churidar-Story-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-24    envira-lazy" height="480" id="envira-gallery-image-63132" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Wine Ethenic Churidar Story" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="23" data-envira-item-id="63132" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wine-Ethenic-Churidar-Story-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wine-Ethenic-Churidar-Story-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wine-Ethenic-Churidar-Story-576x1024.png.webp 2x" data-title="Wine Ethenic Churidar Story" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63131" class="envira-gallery-item envira-gallery-item-25 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-scaled.png" title="Wedding Grid_New" data-caption="" data-envira-item-id="63131" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-scaled.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-scaled-75x50_c.png" data-title="Wedding Grid_New" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-1024x1024.png" alt="" class="envira-gallery-image envira-gallery-image-25    envira-lazy" height="480" id="envira-gallery-image-63131" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Wedding Grid_New" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="24" data-envira-item-id="63131" data-envira-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-1024x1024.png" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-1024x1024.png 400w, https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-1024x1024.png 2x" data-title="Wedding Grid_New" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63130" class="envira-gallery-item envira-gallery-item-26 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png.webp" title="Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta" data-caption="" data-envira-item-id="63130" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-75x50_c.png" data-title="Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-26    envira-lazy" height="480" id="envira-gallery-image-63130" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="25" data-envira-item-id="63130" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp 2x" data-title="Tussar Silk Digital Printed Zari Embroidered Kurta With Palazzo And Dupatta" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63128" class="envira-gallery-item envira-gallery-item-27 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy.png.webp" title="Sarree Story 1 copy" data-caption="" data-envira-item-id="63128" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-75x50_c.png" data-title="Sarree Story 1 copy" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-27    envira-lazy" height="480" id="envira-gallery-image-63128" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Sarree Story 1 copy" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="26" data-envira-item-id="63128" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-576x1024.png.webp 2x" data-title="Sarree Story 1 copy" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63127" class="envira-gallery-item envira-gallery-item-28 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-1.png.webp" title="Sarree Story 1 copy 2" data-caption="" data-envira-item-id="63127" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2-1-75x50_c.png" data-title="Sarree Story 1 copy 2" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-1-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-28    envira-lazy" height="480" id="envira-gallery-image-63127" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Sarree Story 1 copy 2" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="27" data-envira-item-id="63127" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-1-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-1-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-1-576x1024.png.webp 2x" data-title="Sarree Story 1 copy 2" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63126" class="envira-gallery-item envira-gallery-item-29 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2.png.webp" title="Sarree Story 1 copy 2" data-caption="" data-envira-item-id="63126" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2-75x50_c.png" data-title="Sarree Story 1 copy 2" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-29    envira-lazy" height="480" id="envira-gallery-image-63126" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Sarree Story 1 copy 2" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="28" data-envira-item-id="63126" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sarree-Story-1-copy-2-576x1024.png.webp 2x" data-title="Sarree Story 1 copy 2" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63125" class="envira-gallery-item envira-gallery-item-30 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sale-Season-sale-story.png.webp" title="Sale Season sale story" data-caption="" data-envira-item-id="63125" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sale-Season-sale-story.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sale-Season-sale-story-75x50_c.png" data-title="Sale Season sale story" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sale-Season-sale-story-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-30    envira-lazy" height="480" id="envira-gallery-image-63125" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Sale Season sale story" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="29" data-envira-item-id="63125" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sale-Season-sale-story-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sale-Season-sale-story-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Sale-Season-sale-story-576x1024.png.webp 2x" data-title="Sale Season sale story" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63124" class="envira-gallery-item envira-gallery-item-31 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png.webp" title="Green Chanderi Straight Embroidered Kurta With Pants &amp; Dupatta Set" data-caption="" data-envira-item-id="63124" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-75x50_c.png" data-title="Green Chanderi Straight Embroidered Kurta With Pants &amp;amp; Dupatta Set" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-31    envira-lazy" height="480" id="envira-gallery-image-63124" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Green Chanderi Straight Embroidered Kurta With Pants &amp; Dupatta Set" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="30" data-envira-item-id="63124" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set-576x1024.png.webp 2x" data-title="Green Chanderi Straight Embroidered Kurta With Pants &amp;amp; Dupatta Set" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63123" class="envira-gallery-item envira-gallery-item-32 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-scaled.jpg.webp" title="Diwali GridOpt1.1" data-caption="" data-envira-item-id="63123" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-GridOpt1.1-1-scaled.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-GridOpt1.1-1-scaled-75x50_c.jpg" data-title="Diwali GridOpt1.1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-1024x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-32    envira-lazy" height="480" id="envira-gallery-image-63123" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Diwali GridOpt1.1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="31" data-envira-item-id="63123" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-1024x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-1024x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-1024x1024.jpg.webp 2x" data-title="Diwali GridOpt1.1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63121" class="envira-gallery-item envira-gallery-item-33 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1.png.webp" title="Artboard 1" data-caption="" data-envira-item-id="63121" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1-75x50_c.png" data-title="Artboard 1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-576x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-33    envira-lazy" height="480" id="envira-gallery-image-63121" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Artboard 1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="32" data-envira-item-id="63121" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-576x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-576x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Artboard-1-576x1024.png.webp 2x" data-title="Artboard 1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63120" class="envira-gallery-item envira-gallery-item-34 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-scaled.webp" title="1x1" data-caption="" data-envira-item-id="63120" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-scaled.webp" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-scaled-75x50_c.webp" data-title="1x1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-1024x1024.webp" alt="" class="envira-gallery-image envira-gallery-image-34    envira-lazy" height="480" id="envira-gallery-image-63120" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="1x1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="33" data-envira-item-id="63120" data-envira-src="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-1024x1024.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-1024x1024.webp 400w, https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-1024x1024.webp 2x" data-title="1x1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63119" class="envira-gallery-item envira-gallery-item-35 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/WED1.png.webp" title="WED1" data-caption="" data-envira-item-id="63119" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/WED1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/WED1-75x50_c.png" data-title="WED1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/WED1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-35    envira-lazy" height="480" id="envira-gallery-image-63119" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="WED1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="34" data-envira-item-id="63119" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/WED1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/WED1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/WED1-819x1024.png.webp 2x" data-title="WED1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63118" class="envira-gallery-item envira-gallery-item-36 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Unlock-Powerful-dreams.jpg.webp" title="Unlock Powerful dreams" data-caption="" data-envira-item-id="63118" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Unlock-Powerful-dreams.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Unlock-Powerful-dreams-75x50_c.jpg" data-title="Unlock Powerful dreams" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Unlock-Powerful-dreams-819x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-36    envira-lazy" height="480" id="envira-gallery-image-63118" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Unlock Powerful dreams" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="35" data-envira-item-id="63118" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Unlock-Powerful-dreams-819x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Unlock-Powerful-dreams-819x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Unlock-Powerful-dreams-819x1024.jpg.webp 2x" data-title="Unlock Powerful dreams" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63117" class="envira-gallery-item envira-gallery-item-37 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/11.jpg.webp" title="11" data-caption="" data-envira-item-id="63117" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/11.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/11-75x50_c.jpg" data-title="11" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/11-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-37    envira-lazy" height="480" id="envira-gallery-image-63117" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="11" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="36" data-envira-item-id="63117" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/11-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/11-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/11-576x1024.jpg.webp 2x" data-title="11" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63116" class="envira-gallery-item envira-gallery-item-38 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-scaled.jpg.webp" title="Standee Option 5" data-caption="" data-envira-item-id="63116" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-5-scaled.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-5-scaled-75x50_c.jpg" data-title="Standee Option 5" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-512x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-38    envira-lazy" height="480" id="envira-gallery-image-63116" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Standee Option 5" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="37" data-envira-item-id="63116" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-512x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-512x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-512x1024.jpg.webp 2x" data-title="Standee Option 5" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="150" /></a></div></div><div id="envira-gallery-item-63115" class="envira-gallery-item envira-gallery-item-39 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-4-scaled.jpg.webp" title="Standee Option 4" data-caption="" data-envira-item-id="63115" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-4-scaled.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-4-scaled-75x50_c.jpg" data-title="Standee Option 4" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-4-512x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-39    envira-lazy" height="480" id="envira-gallery-image-63115" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Standee Option 4" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="38" data-envira-item-id="63115" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-4-512x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-4-512x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-4-512x1024.jpg.webp 2x" data-title="Standee Option 4" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="150" /></a></div></div><div id="envira-gallery-item-63114" class="envira-gallery-item envira-gallery-item-40 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-6-1-scaled.jpg.webp" title="Standee Option 6 (1)" data-caption="" data-envira-item-id="63114" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-6-1-scaled.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-6-1-scaled-75x50_c.jpg" data-title="Standee Option 6 (1)" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-6-1-512x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-40    envira-lazy" height="480" id="envira-gallery-image-63114" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Standee Option 6 (1)" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="39" data-envira-item-id="63114" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-6-1-512x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-6-1-512x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-6-1-512x1024.jpg.webp 2x" data-title="Standee Option 6 (1)" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="150" /></a></div></div><div id="envira-gallery-item-63113" class="envira-gallery-item envira-gallery-item-41 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/4.png.webp" title="4" data-caption="" data-envira-item-id="63113" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/4.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/4-75x50_c.png" data-title="4" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/4.png.webp" alt="" class="envira-gallery-image envira-gallery-image-41    envira-lazy" height="480" id="envira-gallery-image-63113" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="4" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="40" data-envira-item-id="63113" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/4.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/4.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/4.png.webp 2x" data-title="4" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="238" /></a></div></div><div id="envira-gallery-item-63112" class="envira-gallery-item envira-gallery-item-42 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day.png.webp" title="international_yoga_day" data-caption="" data-envira-item-id="63112" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/international_yoga_day.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/international_yoga_day-75x50_c.png" data-title="international_yoga_day" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-42    envira-lazy" height="480" id="envira-gallery-image-63112" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="international_yoga_day" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="41" data-envira-item-id="63112" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day-819x1024.png.webp 2x" data-title="international_yoga_day" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63111" class="envira-gallery-item envira-gallery-item-43 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png.webp" title="IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1" data-caption="" data-envira-item-id="63111" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-75x50_c.png" data-title="IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-43    envira-lazy" height="480" id="envira-gallery-image-63111" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="42" data-envira-item-id="63111" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp 2x" data-title="IN PURSUIT OF SUPER PERFORMANCE (E-Learning)1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63109" class="envira-gallery-item envira-gallery-item-44 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Chritmas-Post1.png.webp" title="Chritmas Post1" data-caption="" data-envira-item-id="63109" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Chritmas-Post1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Chritmas-Post1-75x50_c.png" data-title="Chritmas Post1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Chritmas-Post1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-44    envira-lazy" height="480" id="envira-gallery-image-63109" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Chritmas Post1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="43" data-envira-item-id="63109" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Chritmas-Post1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Chritmas-Post1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Chritmas-Post1-819x1024.png.webp 2x" data-title="Chritmas Post1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63108" class="envira-gallery-item envira-gallery-item-45 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/277.png.webp" title="277" data-caption="" data-envira-item-id="63108" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/277.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/277-75x50_c.png" data-title="277" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/277-1024x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-45    envira-lazy" height="480" id="envira-gallery-image-63108" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="277" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="44" data-envira-item-id="63108" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/277-1024x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/277-1024x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/277-1024x1024.png.webp 2x" data-title="277" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63107" class="envira-gallery-item envira-gallery-item-46 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/How-to-calm-your-pet.png.webp" title="How to calm your pet" data-caption="" data-envira-item-id="63107" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/How-to-calm-your-pet.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/How-to-calm-your-pet-75x50_c.png" data-title="How to calm your pet" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/How-to-calm-your-pet-1024x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-46    envira-lazy" height="480" id="envira-gallery-image-63107" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="How to calm your pet" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="45" data-envira-item-id="63107" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/How-to-calm-your-pet-1024x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/How-to-calm-your-pet-1024x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/How-to-calm-your-pet-1024x1024.png.webp 2x" data-title="How to calm your pet" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63106" class="envira-gallery-item envira-gallery-item-47 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1.png.webp" title="Lip Filler1" data-caption="" data-envira-item-id="63106" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lip-Filler1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lip-Filler1-75x50_c.png" data-title="Lip Filler1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-47    envira-lazy" height="480" id="envira-gallery-image-63106" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Lip Filler1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="46" data-envira-item-id="63106" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1-819x1024.png.webp 2x" data-title="Lip Filler1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63104" class="envira-gallery-item envira-gallery-item-48 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/DIY-Face-mask-scaled.png.webp" title="DIY Face mask" data-caption="" data-envira-item-id="63104" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/DIY-Face-mask-scaled.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/DIY-Face-mask-scaled-75x50_c.png" data-title="DIY Face mask" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/DIY-Face-mask-1024x213.png.webp" alt="" class="envira-gallery-image envira-gallery-image-48    envira-lazy" height="480" id="envira-gallery-image-63104" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="DIY Face mask" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="47" data-envira-item-id="63104" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/DIY-Face-mask-1024x213.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/DIY-Face-mask-1024x213.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/DIY-Face-mask-1024x213.png.webp 2x" data-title="DIY Face mask" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="63" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63102" class="envira-gallery-item envira-gallery-item-49 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Body-Filler-Treatment_Final.png.webp" title="Body Filler Treatment_Final" data-caption="" data-envira-item-id="63102" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Body-Filler-Treatment_Final.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Body-Filler-Treatment_Final-75x50_c.png" data-title="Body Filler Treatment_Final" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Body-Filler-Treatment_Final-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-49    envira-lazy" height="480" id="envira-gallery-image-63102" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Body Filler Treatment_Final" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="48" data-envira-item-id="63102" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Body-Filler-Treatment_Final-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Body-Filler-Treatment_Final-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Body-Filler-Treatment_Final-819x1024.png.webp 2x" data-title="Body Filler Treatment_Final" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63101" class="envira-gallery-item envira-gallery-item-50 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Audrey-Thoery1.png.webp" title="Audrey Thoery1" data-caption="" data-envira-item-id="63101" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Audrey-Thoery1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Audrey-Thoery1-75x50_c.png" data-title="Audrey Thoery1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Audrey-Thoery1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-50    envira-lazy" height="480" id="envira-gallery-image-63101" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Audrey Thoery1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="49" data-envira-item-id="63101" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Audrey-Thoery1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Audrey-Thoery1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Audrey-Thoery1-819x1024.png.webp 2x" data-title="Audrey Thoery1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63100" class="envira-gallery-item envira-gallery-item-51 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Under-Eyes-Fillers-Treatment1.png.webp" title="Under Eyes Fillers Treatment1" data-caption="" data-envira-item-id="63100" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Under-Eyes-Fillers-Treatment1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Under-Eyes-Fillers-Treatment1-75x50_c.png" data-title="Under Eyes Fillers Treatment1" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Under-Eyes-Fillers-Treatment1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-51    envira-lazy" height="480" id="envira-gallery-image-63100" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Under Eyes Fillers Treatment1" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="50" data-envira-item-id="63100" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Under-Eyes-Fillers-Treatment1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Under-Eyes-Fillers-Treatment1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Under-Eyes-Fillers-Treatment1-819x1024.png.webp 2x" data-title="Under Eyes Fillers Treatment1" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63099" class="envira-gallery-item envira-gallery-item-52 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body_3.png.webp" title="Profilo Body_3" data-caption="" data-envira-item-id="63099" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body_3.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body_3-75x50_c.png" data-title="Profilo Body_3" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body_3-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-52    envira-lazy" height="480" id="envira-gallery-image-63099" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Profilo Body_3" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="51" data-envira-item-id="63099" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body_3-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body_3-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body_3-819x1024.png.webp 2x" data-title="Profilo Body_3" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63098" class="envira-gallery-item envira-gallery-item-53 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body.png.webp" title="Profilo Body" data-caption="" data-envira-item-id="63098" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body-75x50_c.png" data-title="Profilo Body" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-53    envira-lazy" height="480" id="envira-gallery-image-63098" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Profilo Body" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="52" data-envira-item-id="63098" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Profilo-Body-819x1024.png.webp 2x" data-title="Profilo Body" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63097" class="envira-gallery-item envira-gallery-item-54 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Mother_s-Day.png.webp" title="Mother_s Day" data-caption="" data-envira-item-id="63097" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mother_s-Day.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mother_s-Day-75x50_c.png" data-title="Mother_s Day" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Mother_s-Day-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-54    envira-lazy" height="480" id="envira-gallery-image-63097" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Mother_s Day" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="53" data-envira-item-id="63097" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Mother_s-Day-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Mother_s-Day-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Mother_s-Day-819x1024.png.webp 2x" data-title="Mother_s Day" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63096" class="envira-gallery-item envira-gallery-item-55 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Dusshera.jpg.webp" title="Dusshera" data-caption="" data-envira-item-id="63096" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dusshera.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dusshera-75x50_c.jpg" data-title="Dusshera" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Dusshera-576x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-55    envira-lazy" height="480" id="envira-gallery-image-63096" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Dusshera" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="54" data-envira-item-id="63096" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Dusshera-576x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Dusshera-576x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Dusshera-576x1024.jpg.webp 2x" data-title="Dusshera" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="169" /></a></div></div><div id="envira-gallery-item-63095" class="envira-gallery-item envira-gallery-item-56 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Eduprenuer-Awareness-1.png.webp" title="Eduprenuer Awareness" data-caption="" data-envira-item-id="63095" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Eduprenuer-Awareness-1.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Eduprenuer-Awareness-1-75x50_c.png" data-title="Eduprenuer Awareness" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Eduprenuer-Awareness-1-819x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-56    envira-lazy" height="480" id="envira-gallery-image-63095" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Eduprenuer Awareness" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="55" data-envira-item-id="63095" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Eduprenuer-Awareness-1-819x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Eduprenuer-Awareness-1-819x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Eduprenuer-Awareness-1-819x1024.png.webp 2x" data-title="Eduprenuer Awareness" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="240" /></a></div></div><div id="envira-gallery-item-63093" class="envira-gallery-item envira-gallery-item-57 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/cover2.png.webp" title="cover2" data-caption="" data-envira-item-id="63093" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/cover2.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/cover2-75x50_c.png" data-title="cover2" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/cover2-1024x1024.png.webp" alt="" class="envira-gallery-image envira-gallery-image-57    envira-lazy" height="480" id="envira-gallery-image-63093" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="cover2" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="56" data-envira-item-id="63093" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/cover2-1024x1024.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/cover2-1024x1024.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/cover2-1024x1024.png.webp 2x" data-title="cover2" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63092" class="envira-gallery-item envira-gallery-item-58 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7.png.webp" title="Amazonia grid7" data-caption="" data-envira-item-id="63092" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Amazonia-grid7.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Amazonia-grid7-75x50_c.png" data-title="Amazonia grid7" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7-1024x683.png.webp" alt="" class="envira-gallery-image envira-gallery-image-58    envira-lazy" height="480" id="envira-gallery-image-63092" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="Amazonia grid7" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="57" data-envira-item-id="63092" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7-1024x683.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7-1024x683.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7-1024x683.png.webp 2x" data-title="Amazonia grid7" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="200" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63091" class="envira-gallery-item envira-gallery-item-59 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_SOS.png.webp" title="420-720PX_SOS" data-caption="" data-envira-item-id="63091" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_SOS.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_SOS-75x50_c.png" data-title="420-720PX_SOS" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_SOS.png.webp" alt="" class="envira-gallery-image envira-gallery-image-59    envira-lazy" height="480" id="envira-gallery-image-63091" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="420-720PX_SOS" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="58" data-envira-item-id="63091" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_SOS.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_SOS.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_SOS.png.webp 2x" data-title="420-720PX_SOS" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="175" /></a></div></div><div id="envira-gallery-item-63090" class="envira-gallery-item envira-gallery-item-60 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_Clubmed.png.webp" title="420-720PX_Clubmed" data-caption="" data-envira-item-id="63090" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_Clubmed.png" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_Clubmed-75x50_c.png" data-title="420-720PX_Clubmed" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_Clubmed.png.webp" alt="" class="envira-gallery-image envira-gallery-image-60    envira-lazy" height="480" id="envira-gallery-image-63090" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="420-720PX_Clubmed" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="59" data-envira-item-id="63090" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_Clubmed.png.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_Clubmed.png.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/420-720PX_Clubmed.png.webp 2x" data-title="420-720PX_Clubmed" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="175" /></a></div></div><div id="envira-gallery-item-63089" class="envira-gallery-item envira-gallery-item-61 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_03.jpg.webp" title="3-Grid_03" data-caption="" data-envira-item-id="63089" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_03.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_03-75x50_c.jpg" data-title="3-Grid_03" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_03-1024x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-61    envira-lazy" height="480" id="envira-gallery-image-63089" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="3-Grid_03" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="60" data-envira-item-id="63089" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_03-1024x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_03-1024x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_03-1024x1024.jpg.webp 2x" data-title="3-Grid_03" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div><div id="envira-gallery-item-63088" class="envira-gallery-item envira-gallery-item-62 envira-lazy-load" style="padding-left: 5px; padding-bottom: 10px; padding-right: 5px;"  itemscope itemtype="https://schema.org/ImageObject"><div class="envira-gallery-item-inner"><div class="envira-gallery-position-overlay envira-gallery-top-left"></div><div class="envira-gallery-position-overlay envira-gallery-top-right"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-left"></div><div class="envira-gallery-position-overlay envira-gallery-bottom-right"></div><a class="envira-gallery-63155 envira-gallery-link" href="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_01.jpg.webp" title="3-Grid_01" data-caption="" data-envira-item-id="63088" data-envira-retina="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_01.jpg" data-thumb="https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_01-75x50_c.jpg" data-title="3-Grid_01" data-envirabox='63155' itemprop="contentUrl"><img loading="lazy" decoding="async" src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_01-1024x1024.jpg.webp" alt="" class="envira-gallery-image envira-gallery-image-62    envira-lazy" height="480" id="envira-gallery-image-63088" srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" tabindex="-1" title="3-Grid_01" width="640" data-caption="" data-envira-gallery-id="63155" data-envira-index="61" data-envira-item-id="63088" data-envira-src="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_01-1024x1024.jpg.webp" data-envira-srcset="https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_01-1024x1024.jpg.webp 400w, https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/3-Grid_01-1024x1024.jpg.webp 2x" data-title="3-Grid_01" itemprop="thumbnailUrl"  data-no-lazy="1"  data-envirabox="63155" data-automatic-caption="" data-envira-height="300" data-envira-width="300" /></a></div></div></div></div><noscript><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_01-3-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_02-3.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_03-3.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_04-3.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_05-2.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS_06-3.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/SS1-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee_rays-1-scaled.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Women-Option-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Men-Option-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/New-Dandiya-Grid-1-scaled.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story6.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story3.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Story2.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Purple-Collage.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Pink-Collage.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Main_.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New-1.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree_New.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Karva-chauth-Story-saree.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Story1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Yellow-Floral-Print-StoryOpt2.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wine-Ethenic-Churidar-Story.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wedding-Grid_New-scaled.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sarree-Story-1-copy-2.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Sale-Season-sale-story.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chanderi-Straight-Embroidered-Kurta-With-Pants-Dupatta-Set.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-GridOpt1.1-1-scaled.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Artboard-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/1x1-scaled.webp' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/WED1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Unlock-Powerful-dreams.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/11.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-5-scaled.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-4-scaled.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Standee-Option-6-1-scaled.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/4.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/international_yoga_day.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Chritmas-Post1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/277.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/How-to-calm-your-pet.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lip-Filler1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/DIY-Face-mask-scaled.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Body-Filler-Treatment_Final.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Audrey-Thoery1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Under-Eyes-Fillers-Treatment1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body_3.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Profilo-Body.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mother_s-Day.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dusshera.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Eduprenuer-Awareness-1.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/cover2.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Amazonia-grid7.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_SOS.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/420-720PX_Clubmed.png' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_03.jpg' alt='' class='envira_noscript_images ' /><img data-no-lazy="1"  src='https://www.dgeniussolutions.com/wp-content/uploads/2026/04/3-Grid_01.jpg' alt='' class='envira_noscript_images ' /></noscript></div></div></section><section class="dgs-v1215-testimonials" id="testimonials"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Testimonials</div><h2>Trusted By Brands Worldwide</h2><p>Client feedback across creative design, website development, social media, SEO and full-stack digital marketing execution.</p></div><div class="dgs-v1215-testimonial-grid dgs-v1215-reveal"><article class="dgs-v1215-testimonial-card"><div class="dgs-v1215-stars">5/5</div><p>D'Genius Solutions has been a game-changer for our retail marketing efforts. Their team understood our brand aesthetics instantly and delivered high-impact creatives that significantly improved in-store visibility and customer engagement.</p><h3>Aparna Singh</h3>
<span>Marketing Manager · Eureka Forbes</span></article><article class="dgs-v1215-testimonial-card"><div class="dgs-v1215-stars">5/5</div><p>Working with D'Genius Solutions on our website has been an exceptional experience. From UI/UX structuring to backend functionality, the team ensured seamless execution and timely updates throughout.</p><h3>Dujon Fernandes</h3>
<span>Digital Marketing Manager · Onida</span></article><article class="dgs-v1215-testimonial-card"><div class="dgs-v1215-stars">5/5</div><p>D'Genius Solutions has become an extended arm of our brand team. From daily creative requirements to high-stakes campaign rollouts, they handle everything with finesse, speed and deep brand understanding.</p><h3>Chaitali Nandi</h3>
<span>Brand Head · Pantaloons ABFRL</span></article><article class="dgs-v1215-testimonial-card"><div class="dgs-v1215-stars">5/5</div><p>Their 360° mandate covering social media, SEO, website updates, 2D animation and content creation has brought structure, creativity and measurable growth to our digital presence.</p><h3>Suneel Kadekar</h3>
<span>Marketing Manager · Kreedo Solutions</span></article></div></div></section><section class="dgs-v1215-search-authority" id="dgs-v1215-search-authority"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Search Authority</div><h2>Built For Google Search, AI Answers And Voice Discovery</h2><p>As a digital marketing agency in Mumbai, we structure websites, content and campaigns for how people search today across Google, AI answer engines, LLM platforms and voice-led discovery.</p></div><div class="dgs-v1215-authority-grid dgs-v1215-reveal"><article class="dgs-v1215-authority-card"><span>Search Engine Optimisation</span><h3>Rank-ready website and content foundations.</h3><p>Technical SEO, content structure, internal links and search intent mapping for stronger organic visibility.</p></article><article class="dgs-v1215-authority-card"><span>Answer Engine Optimisation</span><h3>Built for answer-first discovery.</h3><p>Content designed to answer real customer questions clearly across featured snippets, AI answers and search journeys.</p></article><article class="dgs-v1215-authority-card"><span>Generative Search Visibility</span><h3>Visibility for generative search experiences.</h3><p>Brand, service and topical signals structured for AI-led search environments and generative discovery.</p></article><article class="dgs-v1215-authority-card"><span>LLM Brand Visibility</span><h3>Clear entities, services and brand context.</h3><p>We make your website easier for search systems and large language models to understand, summarize and recommend.</p></article><article class="dgs-v1215-authority-card"><span>Voice Search Readiness</span><h3>Natural answers for spoken queries.</h3><p>Local, conversational and question-led content that supports mobile and voice-led customer discovery.</p></article><article class="dgs-v1215-authority-card"><span>AI-Led Creative Production</span><h3>Faster creative output with brand control.</h3><p>AI videos, campaign assets and creative production workflows built around strategy, not random automation.</p></article></div></div></section><section class="dgs-v1215-industries" id="dgs-v1215-industries"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Industries</div><h2>Industries We Help Grow</h2><p>Digital systems built for high-trust, high-consideration and growth-focused brands.</p></div><div class="dgs-v1215-industry-pills dgs-v1215-reveal">
<span>Healthcare</span>
<span>Finance</span>
<span>Retail</span>
<span>Real Estate</span>
<span>Education</span>
<span>Recruitment</span>
<span>Consumer Brands</span>
<span>Technology</span></div></div></section><section class="dgs-v1215-why" id="dgs-v1215-why"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Why D’Genius Solutions</div><h2>Why Brands Choose D’Genius Solutions</h2><p>One connected team for strategy, search, creative, websites, performance marketing and AI-led production.</p></div><div class="dgs-v1215-proof-strip dgs-v1215-reveal"><article><span>01</span><h3>Strategy</h3><p>We plan before execution.</p></article><article><span>02</span><h3>Search</h3><p>SEO, AEO, GEO and LLM SEO thinking built into content and websites.</p></article><article><span>03</span><h3>Creative</h3><p>Branding, content, social and AI production under one roof.</p></article><article><span>04</span><h3>Scale</h3><p>Performance campaigns, websites and reporting aligned for growth.</p></article></div></div></section><section class="dgs-v1215-faq" id="dgs-v1215-faq"><div class="dgs-v1215-shell"><div class="dgs-v1215-section-head dgs-v1215-reveal"><div class="dgs-v1215-section-kicker">Search Ready Answers</div><h2>Questions Brands Ask Before Choosing A Digital Marketing Agency</h2><p>Clear answers for businesses looking at SEO, AEO, GEO, LLM SEO, voice search optimization, website development, social media, performance marketing and AI production.</p></div><div class="dgs-v1215-faq-grid dgs-v1215-reveal">
<details open><summary>What does D’Genius Solutions do?</summary><p>D’Genius Solutions is a full service digital marketing agency in Mumbai that connects search, websites, social media, performance marketing, branding, content and AI-led creative production.</p></details>
<details><summary>Why choose a full service digital marketing agency?</summary><p>A full service agency helps strategy, creative, technology, media and measurement work together instead of operating as disconnected activities.</p></details>
<details><summary>How do your digital marketing services work together?</summary><p>We align your website, organic visibility, paid campaigns, social content and creative production around shared business goals, audience journeys and measurable outcomes.</p></details>
<details><summary>Can you support both organic and paid growth?</summary><p>Yes. We support long-term organic visibility through search and content while also building paid campaigns for lead generation, reach and conversion.</p></details>
<details><summary>Where is D’Genius Solutions located?</summary><p>D’Genius Solutions is based in Khar West, Mumbai and works with brands across India, Dubai and the UAE.</p></details>
<details><summary>Do you provide website, creative and AI-led production under one team?</summary><p>Yes. Our connected team supports website development, branding, content, social media, campaign creative and AI-led production as part of one digital growth system.</p></details></div></div></section><section class="dgs-v1215-final" id="contact-form"><div class="dgs-v1215-shell"><div class="dgs-v1215-final-card dgs-v1215-reveal"><div>
<span>Ready To Fix The Gaps?</span><h2>Let us audit your brand, website, search visibility and campaign flow.</h2><p>
Start with a focused growth audit from a Mumbai based digital marketing team across SEO, AEO, GEO, LLM SEO, website performance, content, social media, ads and creative output.</p><div class="dgs-v1215-form-shortcode"><div class='fluentform ff-default fluentform_wrapper_1 ffs_default_wrap'><form data-form_id="1" id="fluentform_1" class="frm-fluent-form fluent_form_1 ff-el-form-top ff_form_instance_1_2 ff-form-loading ffs_default" data-form_instance="ff_form_instance_1_2" method="POST" ><fieldset  style="border: none!important;margin: 0!important;padding: 0!important;background-color: transparent!important;box-shadow: none!important;outline: none!important; min-inline-size: 100%;"><legend class="ff_screen_reader_title" style="display: block; margin: 0!important;padding: 0!important;height: 0!important;text-indent: -999999px;width: 0!important;overflow:hidden;">Home Page Form</legend><input type='hidden' name='__fluent_form_embded_post_id' value='63505' /><input type="hidden" id="_fluentform_1_fluentformnonce" name="_fluentform_1_fluentformnonce" value="dfa1cac356" /><input type="hidden" name="_wp_http_referer" value="/?utm_source=openai" /><div data-type="name-element" data-name="names" class=" ff-field_container ff-name-field-wrapper" ><div class='ff-t-container'><div class='ff-t-cell '><div class='ff-el-group ff-el-form-top'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_names_first_name_' id='label_ff_1_2_names_first_name_' >Full Name</label></div><div class='ff-el-input--content'><input type="text" name="names[first_name]" id="ff_1_2_names_first_name_" class="ff-el-form-control" placeholder="Enter Your First Name" aria-invalid="false" aria-required=true></div></div></div></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_email' id='label_ff_1_2_email' aria-label="Email">Email</label></div><div class='ff-el-input--content'><input type="email" name="email" id="ff_1_2_email" class="ff-el-form-control" placeholder="Email Address" data-name="email"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_phone' id='label_ff_1_2_phone' aria-label="Phone/Mobile">Phone/Mobile</label></div><div class='ff-el-input--content'><input name="phone" class="ff-el-form-control ff-el-phone" type="tel" placeholder="Mobile Number" data-name="phone" id="ff_1_2_phone" inputmode="tel"  aria-invalid='false' aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_input_text' id='label_ff_1_2_input_text' aria-label="Company Name">Company Name</label></div><div class='ff-el-input--content'><input type="text" name="input_text" class="ff-el-form-control" data-name="input_text" id="ff_1_2_input_text"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_dropdown_1' id='label_ff_1_2_dropdown_1' aria-label="How did you hear about us ?">How did you hear about us ?</label></div><div class='ff-el-input--content'><select name="dropdown_1" id="ff_1_2_dropdown_1" class="ff-el-form-control" data-name="dropdown_1" data-calc_value="0"  aria-invalid="false" aria-required="true" aria-labelledby="label_ff_1_2_dropdown_1"><option value="">- Select -</option><option value="Google Ads"  >Google Ads</option><option value="Google Search"  >Google Search</option><option value="Friend / Colleague"  >Friend / Colleague</option><option value="Twitter"  >Twitter</option><option value="Youtube"  >Youtube</option><option value="Instagram"  >Instagram</option><option value="Facebook"  >Facebook</option><option value="LinkedIn"  >LinkedIn</option><option value="Podcast"  >Podcast</option><option value="Blog / Article"  >Blog / Article</option><option value="Other"  >Other</option></select></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_subject' id='label_ff_1_2_subject' aria-label="Subject">Subject</label></div><div class='ff-el-input--content'><input type="text" name="subject" class="ff-el-form-control" placeholder="Subject" data-name="subject" id="ff_1_2_subject"  aria-invalid="false" aria-required=true></div></div><div class='ff-el-group'><div class="ff-el-input--label ff-el-is-required asterisk-right"><label for='ff_1_2_dropdown' id='label_ff_1_2_dropdown' aria-label="Service">Service</label></div><div class='ff-el-input--content'><select name="dropdown" id="ff_1_2_dropdown" class="ff-el-form-control" data-name="dropdown" data-calc_value="0"  aria-invalid="false" aria-required="true" aria-labelledby="label_ff_1_2_dropdown"><option value="">- Select -</option><option value="Generative AI"  >Generative AI</option><option value="GEO"  >GEO</option><option value="Search Engine Optimization"  >Search Engine Optimization</option><option value="AEO "  >AEO</option><option value="Social Media Marketing"  >Social Media Marketing</option><option value="Website Design &amp; Development"  >Website Design & Development</option><option value="Content Writing"  >Content Writing</option><option value="Blog Writing"  >Blog Writing</option><option value="Graphic Designing"  >Graphic Designing</option><option value="Influencer Marketing"  >Influencer Marketing</option><option value="Branding"  >Branding</option><option value="Employer Branding"  >Employer Branding</option><option value="LinkedIn Marketing"  >LinkedIn Marketing</option><option value="Video Production"  >Video Production</option><option value="LLM"  >LLM</option></select></div></div><div class='ff-el-group'><div class="ff-el-input--label asterisk-right"><label for='ff_1_2_message' id='label_ff_1_2_message' aria-label="Your Message">Your Message</label></div><div class='ff-el-input--content'><textarea aria-required="false" aria-labelledby="label_ff_1_2_message" name="message" id="ff_1_2_message" class="ff-el-form-control" placeholder="Your Message" rows="4" cols="2" data-name="message" ></textarea></div></div><input type="hidden" name="Home_Page" data-name="Home_Page" ><div class='ff-el-group ' ><div class='ff-el-input--content'><div data-fluent_id='1' name='g-recaptcha-response'><div
data-sitekey='6LfK6VgsAAAAAFeLVFPu7qFDLc4phIeAPApUFy-k'
id='fluentform-recaptcha-1-2'
class='ff-el-recaptcha g-recaptcha'
data-callback='fluentFormrecaptchaSuccessCallback'></div></div></div></div><input type="hidden" name="Home_Page_form" data-name="Home_Page_form" ><div class='ff-el-group ff-text-left ff_submit_btn_wrapper'><button type="submit" class="ff-btn ff-btn-submit ff-btn-md ff_btn_style"  aria-label="Submit Form">Submit Form</button></div></fieldset></form><div id='fluentform_1_errors' class='ff-errors-in-stack ff_form_instance_1_2 ff-form-loading_errors ff_form_instance_1_2_errors'></div></div> <script type="text/javascript" src="data:text/javascript;base64,d2luZG93LmZsdWVudF9mb3JtX2ZmX2Zvcm1faW5zdGFuY2VfMV8yPXsiaWQiOiIxIiwiYWpheFVybCI6Imh0dHBzOlwvXC93d3cuZGdlbml1c3NvbHV0aW9ucy5jb21cL3dwLWFkbWluXC9hZG1pbi1hamF4LnBocCIsInNldHRpbmdzIjp7ImxheW91dCI6eyJsYWJlbFBsYWNlbWVudCI6InRvcCIsImhlbHBNZXNzYWdlUGxhY2VtZW50Ijoid2l0aF9sYWJlbCIsImVycm9yTWVzc2FnZVBsYWNlbWVudCI6ImlubGluZSIsImNzc0NsYXNzTmFtZSI6IiIsImFzdGVyaXNrUGxhY2VtZW50IjoiYXN0ZXJpc2stcmlnaHQifSwicmVzdHJpY3Rpb25zIjp7ImRlbnlFbXB0eVN1Ym1pc3Npb24iOnsiZW5hYmxlZCI6ITF9fX0sImZvcm1faW5zdGFuY2UiOiJmZl9mb3JtX2luc3RhbmNlXzFfMiIsImZvcm1faWRfc2VsZWN0b3IiOiJmbHVlbnRmb3JtXzEiLCJydWxlcyI6eyJuYW1lc1tmaXJzdF9uYW1lXSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJuYW1lc1ttaWRkbGVfbmFtZV0iOnsicmVxdWlyZWQiOnsidmFsdWUiOiExLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITB9fSwibmFtZXNbbGFzdF9uYW1lXSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITEsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJlbWFpbCI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMSwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIn0sImVtYWlsIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgbXVzdCBjb250YWluIGEgdmFsaWQgZW1haWwiLCJnbG9iYWwiOiExLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgbXVzdCBjb250YWluIGEgdmFsaWQgZW1haWwifX0sInBob25lIjp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwiZ2xvYmFsIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQifSwidmFsaWRfcGhvbmVfbnVtYmVyIjp7InZhbHVlIjohMSwiZ2xvYmFsIjohMCwibWVzc2FnZSI6IlBob25lIG51bWJlciBpcyBub3QgdmFsaWQiLCJnbG9iYWxfbWVzc2FnZSI6IlBob25lIG51bWJlciBpcyBub3QgdmFsaWQifX0sImlucHV0X3RleHQiOnsicmVxdWlyZWQiOnsidmFsdWUiOiEwLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITB9fSwiZHJvcGRvd25fMSI6eyJyZXF1aXJlZCI6eyJ2YWx1ZSI6ITAsIm1lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsX21lc3NhZ2UiOiJUaGlzIGZpZWxkIGlzIHJlcXVpcmVkIiwiZ2xvYmFsIjohMH19LCJzdWJqZWN0Ijp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWwiOiExLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQifX0sImRyb3Bkb3duIjp7InJlcXVpcmVkIjp7InZhbHVlIjohMCwibWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWxfbWVzc2FnZSI6IlRoaXMgZmllbGQgaXMgcmVxdWlyZWQiLCJnbG9iYWwiOiEwfX0sIm1lc3NhZ2UiOnsicmVxdWlyZWQiOnsidmFsdWUiOiExLCJtZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCIsImdsb2JhbCI6ITEsImdsb2JhbF9tZXNzYWdlIjoiVGhpcyBmaWVsZCBpcyByZXF1aXJlZCJ9fSwiZy1yZWNhcHRjaGEtcmVzcG9uc2UiOltdfSwiZGVib3VuY2VfdGltZSI6MzAwLCJmaWxlX3VwbG9hZF9zZXR0aW5ncyI6W119" defer></script> </div></div><a href="#contact-form" class="dgs-v1215-btn dgs-v1215-btn-primary">
Start With A Growth Audit
<span>→</span>
</a></div></div></section> <script type="application/ld+json">{
    "@context":"https://schema.org",
    "@type":"ItemList",
    "@id":"https://www.dgeniussolutions.com/#services",
    "name":"Digital Marketing Services",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Search Engine Optimisation","url":"https://www.dgeniussolutions.com/services/seo-services-in-mumbai/"},
      {"@type":"ListItem","position":2,"name":"Answer Engine Optimisation","url":"https://www.dgeniussolutions.com/services/aeo-services-in-mumbai/"},
      {"@type":"ListItem","position":3,"name":"Generative Engine Optimisation","url":"https://www.dgeniussolutions.com/services/geo/"},
      {"@type":"ListItem","position":4,"name":"LLM SEO Services","url":"https://www.dgeniussolutions.com/services/llm-seo-service/"},
      {"@type":"ListItem","position":5,"name":"Website Development and AMC","url":"https://www.dgeniussolutions.com/services/website-development-amc/"},
      {"@type":"ListItem","position":6,"name":"Social Media Marketing","url":"https://www.dgeniussolutions.com/services/social-media-marketing/"},
      {"@type":"ListItem","position":7,"name":"Performance Marketing","url":"https://www.dgeniussolutions.com/services/performance-marketing/"},
      {"@type":"ListItem","position":8,"name":"AI Video Production","url":"https://www.dgeniussolutions.com/services/ai-video-production-agency/"}
    ]
  }</script> </main><style>.dgs-v1215,
.dgs-v1215 *,
#portfolio,
#portfolio *{
  box-sizing:border-box !important;
  font-family:"Manrope", Inter, Arial, sans-serif !important;
}

.dgs-v1215{
  --v1215-scroll:0;
  --v1215-blue:#00d4ff;
  --v1215-coral:#FD5C62;
  --v1215-purple:#9d4edd;
  --v1215-yellow:#f7d757;
  --v1215-outline-gradient:linear-gradient(135deg, rgba(0,212,255,.95), rgba(106,76,255,.85), rgba(253,92,98,.95), rgba(247,215,87,.85));
  position:relative !important;
  isolation:isolate !important;
  overflow:clip !important;
  background:#020202 !important;
  color:#fff !important;
  font-family:"Manrope", Inter, Arial, sans-serif !important;
}

.dgs-v1215 a,
#portfolio a{
  color:inherit !important;
  text-decoration:none !important;
}

.dgs-v1215-shell{
  width:min(1480px, calc(100% - 36px)) !important;
  margin:0 auto !important;
  position:relative !important;
  z-index:4 !important;
}

.dgs-v1215-bg{
  position:fixed !important;
  inset:0 !important;
  z-index:-2 !important;
  pointer-events:none !important;
  overflow:hidden !important;
  background:#020202 !important;
}

#dgs-v1215-canvas{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  display:block;
}

.dgs-v1215-fallback{
  position:absolute !important;
  inset:-18% !important;
  background:
    radial-gradient(circle at 18% 18%, rgba(0,212,255,.36), transparent 25%),
    radial-gradient(circle at 86% 22%, rgba(253,92,98,.28), transparent 29%),
    radial-gradient(circle at 50% 86%, rgba(157,78,221,.32), transparent 32%),
    linear-gradient(135deg, #020202 0%, #08020f 48%, #020202 100%) !important;
  animation:dgsV1215FallbackDrift 18s ease-in-out infinite alternate !important;
}

@keyframes dgsV1215FallbackDrift{
  from{transform:translate3d(-1%, -1%, 0) scale(1.04);}
  to{transform:translate3d(1%, -4%, 0) scale(1.08);}
}

.dgs-v1215.v1215-webgl-ready .dgs-v1215-fallback{
  opacity:.64 !important;
}

.dgs-v1215-grid{
  position:absolute !important;
  inset:0 !important;
  opacity:.22 !important;
  background-image:linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px) !important;
  background-size:72px 72px !important;
  mask-image:radial-gradient(circle at center, black 0%, transparent 82%) !important;
}

.dgs-v1215-vignette{
  position:absolute !important;
  inset:0 !important;
  background:radial-gradient(circle at 52% 45%, transparent 0%, rgba(0,0,0,.06) 48%, rgba(0,0,0,.54) 100%) !important;
}

.dgs-v1215-hero{
  min-height:calc(100svh - 80px) !important;
  padding:clamp(82px, 8vw, 130px) 0 clamp(44px, 6vw, 82px) !important;
  display:flex !important;
  align-items:center !important;
}

.dgs-v1215-hero-layout{
  display:grid !important;
  grid-template-columns:minmax(0,.9fr) minmax(360px,.9fr) !important;
  gap:clamp(32px,5vw,80px) !important;
  align-items:center !important;
}

.dgs-v1215-copy{
  position:relative !important;
  z-index:5 !important;
}

.dgs-v1215-kicker,
.dgs-v1215-section-kicker{
  display:inline-flex !important;
  align-items:center !important;
  gap:10px !important;
  padding:9px 13px !important;
  border-radius:999px !important;
  border:1px solid rgba(255,255,255,.14) !important;
  background:rgba(255,255,255,.055) !important;
  color:rgba(255,255,255,.78) !important;
  font-size:clamp(10px,.8vw,12px) !important;
  line-height:1.25 !important;
  letter-spacing:.11em !important;
  text-transform:uppercase !important;
  backdrop-filter:blur(18px) !important;
  -webkit-backdrop-filter:blur(18px) !important;
  margin-bottom:clamp(20px,2.5vw,30px) !important;
}

.dgs-v1215-kicker span{
  width:7px !important;
  height:7px !important;
  border-radius:50% !important;
  background:#FD5C62 !important;
  box-shadow:0 0 18px rgba(253,92,98,.8) !important;
}

.dgs-v1215-copy h1,
.dgs-v1215-section-head h2,
.dgs-v1215-final-card h2{
  margin:0 !important;
  color:rgba(255,255,255,.96) !important;
  font-weight:800 !important;
  letter-spacing:-.06em !important;
}

.dgs-v1215-copy h1{
  max-width:820px !important;
  font-size:clamp(2.45rem,5.2vw,5.85rem) !important;
  line-height:1.04 !important;
}

.dgs-v1215-copy h1 span,
.dgs-v1215-section-head h2 span{
  background:linear-gradient(90deg,#69a7ff 0%,#12d6ff 28%,#e3d3ff 58%,#FD5C62 100%) !important;
  background-size:190% 100% !important;
  background-clip:text !important;
  -webkit-background-clip:text !important;
  color:transparent !important;
}

.dgs-v1215-copy p,
.dgs-v1215-section-head p,
.dgs-v1215-final-card p{
  color:rgba(255,255,255,.66) !important;
  font-size:clamp(15px,1.05vw,18px) !important;
  line-height:1.72 !important;
}

.dgs-v1215-copy p{
  width:min(670px,100%) !important;
  margin:clamp(24px,3vw,36px) 0 0 !important;
  color:rgba(255,255,255,.74) !important;
  font-size:clamp(16px,1.16vw,19px) !important;
}

.dgs-v1215-actions{
  display:flex !important;
  flex-wrap:wrap !important;
  align-items:center !important;
  gap:14px !important;
  margin-top:clamp(28px,3.5vw,42px) !important;
}

.dgs-v1215-btn{
  position:relative !important;
  isolation:isolate !important;
  overflow:hidden !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:11px !important;
  min-height:52px !important;
  padding:15px 22px !important;
  border-radius:999px !important;
  font-size:13px !important;
  font-weight:800 !important;
  letter-spacing:.035em !important;
  transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease !important;
}

.dgs-v1215-btn-primary{
  color:#fff !important;
  background:#FD5C62 !important;
  border:1px solid rgba(253,92,98,.65) !important;
  box-shadow:0 18px 50px rgba(253,92,98,.28) !important;
}

.dgs-v1215-btn-secondary{
  color:rgba(255,255,255,.9) !important;
  background:rgba(255,255,255,.055) !important;
  border:1px solid rgba(255,255,255,.18) !important;
}

.dgs-v1215-btn::after,
.dgs-v1215-award-card::after,
.dgs-v1215-service-menu article::after,
.dgs-ai-service-clarity::after,
.dgs-v1215-case-visual-card::after,
.dgs-v1215-case-mini::after,
.dgs-v1215-gallery-frame::after,
.dgs-v1215-testimonial-card::after,
.dgs-v1215-authority-card::after,
.dgs-v1215-proof-strip article::after,
.dgs-v1215-faq-grid details::after,
.dgs-v1215-final-card::after{
  content:"" !important;
  position:absolute !important;
  inset:0 !important;
  padding:1px !important;
  border-radius:inherit !important;
  background:var(--v1215-outline-gradient) !important;
  opacity:0 !important;
  pointer-events:none !important;
  z-index:1 !important;
  -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  -webkit-mask-composite:xor !important;
  mask-composite:exclude !important;
  transition:opacity .24s ease !important;
}

.dgs-v1215-btn:hover,
.dgs-v1215-award-card:hover,
.dgs-v1215-service-menu article:hover,
.dgs-v1215-case-visual-card:hover,
.dgs-v1215-case-mini:hover,
.dgs-v1215-gallery-frame:hover,
.dgs-v1215-testimonial-card:hover,
.dgs-v1215-authority-card:hover,
.dgs-v1215-proof-strip article:hover,
.dgs-v1215-faq-grid details:hover,
.dgs-v1215-final-card:hover{
  border-color:transparent !important;
  transform:translateY(-4px) !important;
  box-shadow:0 24px 70px rgba(0,0,0,.28), 0 0 18px rgba(253,92,98,.10) !important;
}

.dgs-v1215-btn:hover::after,
.dgs-v1215-award-card:hover::after,
.dgs-v1215-service-menu article:hover::after,
.dgs-ai-service-clarity:hover::after,
.dgs-v1215-case-visual-card:hover::after,
.dgs-v1215-case-mini:hover::after,
.dgs-v1215-gallery-frame:hover::after,
.dgs-v1215-testimonial-card:hover::after,
.dgs-v1215-authority-card:hover::after,
.dgs-v1215-proof-strip article:hover::after,
.dgs-v1215-faq-grid details:hover::after,
.dgs-v1215-final-card:hover::after{
  opacity:1 !important;
}

.dgs-v1215-visual{
  position:relative !important;
  min-height:clamp(460px,50vw,600px) !important;
}

.dgs-v1215-robot-wrap{
  position:relative !important;
  width:min(500px,100%) !important;
  margin:auto !important;
  min-height:clamp(460px,50vw,600px) !important;
}

.dgs-v1215-robot-aura{
  position:absolute !important;
  inset:14% 7% !important;
  border-radius:999px !important;
  background:radial-gradient(circle, rgba(255,255,255,.2), transparent 58%), linear-gradient(135deg, rgba(0,212,255,.34), rgba(253,92,98,.26), rgba(157,78,221,.28)) !important;
  filter:blur(38px) !important;
  opacity:.82 !important;
}

.dgs-v1215-robot-wrap img{
  position:relative !important;
  z-index:2 !important;
  width:100% !important;
  max-height:600px !important;
  object-fit:contain !important;
  display:block !important;
  filter:saturate(1.08) contrast(1.06) drop-shadow(0 44px 90px rgba(0,0,0,.78)) !important;
  mask-image:linear-gradient(180deg, black 0%, black 82%, transparent 99%) !important;
  -webkit-mask-image:linear-gradient(180deg, black 0%, black 82%, transparent 99%) !important;
}

.dgs-v1215-floating-chip{
  position:absolute !important;
  z-index:4 !important;
  min-width:150px !important;
  padding:13px 15px !important;
  border-radius:18px !important;
  background:rgba(2,2,2,.72) !important;
  border:1px solid rgba(255,255,255,.13) !important;
  backdrop-filter:blur(20px) !important;
  box-shadow:0 20px 60px rgba(0,0,0,.42) !important;
  animation:dgsV1215Float 7s ease-in-out infinite !important;
}

.dgs-v1215-floating-chip span{
  display:block !important;
  color:rgba(255,255,255,.52) !important;
  font-size:11px !important;
  letter-spacing:.1em !important;
  text-transform:uppercase !important;
  margin-bottom:6px !important;
}

.dgs-v1215-floating-chip strong{
  display:block !important;
  color:rgba(255,255,255,.92) !important;
  font-size:15px !important;
  line-height:1.2 !important;
  font-weight:700 !important;
}

.dgs-v1215-chip-one{top:16% !important; left:0 !important;}
.dgs-v1215-chip-two{top:46% !important; right:-2% !important; animation-delay:.5s !important;}
.dgs-v1215-chip-three{bottom:12% !important; left:8% !important; animation-delay:1s !important;}

@keyframes dgsV1215Float{
  0%,100%{transform:translate3d(0,0,0);}
  50%{transform:translate3d(0,-12px,0);}
}

.dgs-v1215-statline{
  margin-top:clamp(36px,4.5vw,64px) !important;
  display:grid !important;
  grid-template-columns:repeat(4,1fr) !important;
  border-top:1px solid rgba(255,255,255,.14) !important;
  border-bottom:1px solid rgba(255,255,255,.14) !important;
  background:linear-gradient(90deg, rgba(255,255,255,.025), rgba(255,255,255,.06), rgba(255,255,255,.025)) !important;
  backdrop-filter:blur(18px) !important;
}

.dgs-v1215-statline div{
  padding:clamp(19px,2.6vw,30px) !important;
  border-right:1px solid rgba(255,255,255,.08) !important;
}

.dgs-v1215-statline div:last-child{
  border-right:none !important;
}

.dgs-v1215-statline strong{
  display:block !important;
  font-size:clamp(28px,3.2vw,46px) !important;
  line-height:1 !important;
  font-weight:800 !important;
  margin-bottom:8px !important;
}

.dgs-v1215-statline span{
  display:block !important;
  color:rgba(255,255,255,.58) !important;
  font-size:13px !important;
  line-height:1.45 !important;
}

.dgs-v1215-rail{
  padding:clamp(36px,5vw,68px) 0 !important;
}

.dgs-v1215-rail-line{
  position:relative !important;
  left:50% !important;
  width:132vw !important;
  margin-left:-66vw !important;
  display:flex !important;
  align-items:center !important;
  overflow:hidden !important;
  border-top:1px solid rgba(255,255,255,.15) !important;
  border-bottom:1px solid rgba(255,255,255,.15) !important;
  background:rgba(255,255,255,.055) !important;
  backdrop-filter:blur(18px) !important;
  transform:rotate(-1deg) !important;
}

.dgs-v1215-rail-track{
  flex:0 0 auto !important;
  min-width:max-content !important;
  display:flex !important;
  align-items:center !important;
  animation:dgsV1215Rail 42s linear infinite !important;
}

.dgs-v1215-rail-track span{
  display:inline-flex !important;
  align-items:center !important;
  padding:16px 25px !important;
  font-size:clamp(15px,1.35vw,22px) !important;
  font-weight:800 !important;
  color:#fff !important;
  white-space:nowrap !important;
}

.dgs-v1215-rail-track span::after{
  content:"" !important;
  width:6px !important;
  height:6px !important;
  margin-left:25px !important;
  border-radius:999px !important;
  background:#FD5C62 !important;
}

@keyframes dgsV1215Rail{
  from{transform:translateX(0);}
  to{transform:translateX(-100%);}
}

.dgs-v1215-proof-stack,
.dgs-v1215-service-clarity,
.dgs-v1215-ai-portfolio,
.dgs-v1215-case-block,
.dgs-v1215-portfolio,
.dgs-v1215-testimonials,
.dgs-v1215-search-authority,
.dgs-v1215-industries,
.dgs-v1215-why,
.dgs-v1215-faq,
.dgs-v1215-final{
  position:relative !important;
  padding:clamp(82px,10vw,150px) 0 !important;
}

.dgs-v1215-section-head{
  max-width:1120px !important;
  margin:0 0 clamp(34px,4vw,58px) !important;
}

.dgs-v1215-section-head h2{
  font-size:clamp(2.65rem,5.6vw,6.25rem) !important;
  line-height:.98 !important;
}

.dgs-v1215-section-head p{
  max-width:860px !important;
  margin:26px 0 0 !important;
}

.dgs-v1215-logo-marquee{
  overflow:hidden !important;
  border-radius:34px !important;
  border:1px solid rgba(255,255,255,.12) !important;
  background:rgba(255,255,255,.08) !important;
  backdrop-filter:blur(18px) !important;
  margin-bottom:clamp(78px,9vw,130px) !important;
}

.dgs-v1215-logo-track{
  display:grid !important;
  grid-template-columns:repeat(5, minmax(150px,1fr)) !important;
  gap:1px !important;
}

.dgs-v1215-logo-tile{
  min-height:128px !important;
  padding:24px !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  background:rgba(2,2,2,.46) !important;
  transition:background .28s ease, transform .28s ease !important;
}

.dgs-v1215-logo-tile:hover{
  background:rgba(255,255,255,.07) !important;
  transform:translateY(-3px) !important;
}

.dgs-v1215-logo-tile img{
  max-width:160px !important;
  max-height:62px !important;
  width:auto !important;
  height:auto !important;
  object-fit:contain !important;
  display:block !important;
  filter:grayscale(1) brightness(1.35) contrast(1.05) !important;
  opacity:.78 !important;
}

.dgs-v1215-logo-tile:hover img{
  filter:grayscale(0) brightness(1.08) contrast(1.02) !important;
  opacity:1 !important;
}

.dgs-v1215-logo-text{
  color:rgba(255,255,255,.76) !important;
  font-weight:800 !important;
  text-transform:uppercase !important;
  letter-spacing:.08em !important;
  text-align:center !important;
}

.dgs-v1215-awards-block{
  margin-top:clamp(78px,9vw,130px) !important;
}

.dgs-v1215-awards-grid,
.dgs-v1215-service-menu,
.dgs-v1215-case-visual-grid,
.dgs-v1215-testimonial-grid{
  display:grid !important;
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  gap:18px !important;
}

.dgs-v1215-service-menu{
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
}

.dgs-v1215-case-visual-grid{
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
}

.dgs-v1215-award-card,
.dgs-v1215-service-menu article,
.dgs-ai-service-clarity,
.dgs-v1215-case-visual-card,
.dgs-v1215-case-mini,
.dgs-v1215-gallery-frame,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-v1215-final-card{
  position:relative !important;
  isolation:isolate !important;
  overflow:hidden !important;
  background:linear-gradient(135deg, rgba(255,255,255,.072), rgba(255,255,255,.026)), rgba(2,2,2,.36) !important;
  border:1px solid rgba(255,255,255,.12) !important;
  backdrop-filter:blur(18px) !important;
  transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease !important;
}

.dgs-v1215-award-card,
.dgs-v1215-service-menu article,
.dgs-ai-service-clarity,
.dgs-v1215-case-visual-card,
.dgs-v1215-gallery-frame,
.dgs-v1215-testimonial-card{
  border-radius:34px !important;
}

.dgs-v1215-award-image{
  height:390px !important;
  padding:12px 12px 0 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
}

.dgs-v1215-award-image img{
  width:100% !important;
  height:100% !important;
  object-fit:contain !important;
}

.dgs-v1215-award-body,
.dgs-v1215-service-menu article,
.dgs-v1215-case-content,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article{
  padding:clamp(22px,2.6vw,34px) !important;
}

.dgs-v1215-award-body span,
.dgs-v1215-service-menu article span,
.dgs-v1215-case-content span,
.dgs-v1215-case-mini span,
.dgs-v1215-authority-card span,
.dgs-v1215-testimonial-card span,
.dgs-v1215-proof-strip article span{
  display:inline-flex !important;
  padding:6px 11px !important;
  border-radius:999px !important;
  background:rgba(253,92,98,.09) !important;
  border:1px solid rgba(253,92,98,.22) !important;
  color:rgba(255,255,255,.78) !important;
  font-size:10px !important;
  font-weight:800 !important;
  letter-spacing:.12em !important;
  text-transform:uppercase !important;
  margin-bottom:14px !important;
}

.dgs-v1215-award-body h3,
.dgs-v1215-service-menu article h3,
.dgs-v1215-case-content h3,
.dgs-v1215-case-mini h3,
.dgs-v1215-authority-card h3,
.dgs-v1215-testimonial-card h3,
.dgs-v1215-proof-strip article h3{
  margin:0 !important;
  color:#fff !important;
  font-size:clamp(21px,1.8vw,34px) !important;
  line-height:1.08 !important;
  letter-spacing:-.045em !important;
  font-weight:800 !important;
}

.dgs-v1215-award-body p,
.dgs-v1215-service-menu article p,
.dgs-v1215-case-content p,
.dgs-v1215-authority-card p,
.dgs-v1215-testimonial-card p,
.dgs-v1215-proof-strip article p{
  margin:14px 0 0 !important;
  color:rgba(255,255,255,.62) !important;
  font-size:15px !important;
  line-height:1.62 !important;
}

.dgs-v1215-service-menu article div{
  display:flex !important;
  flex-wrap:wrap !important;
  gap:8px !important;
  margin-top:22px !important;
}

.dgs-v1215-service-menu article a{
  display:inline-flex !important;
  align-items:center !important;
  min-height:34px !important;
  padding:8px 11px !important;
  border-radius:999px !important;
  background:rgba(255,255,255,.07) !important;
  border:1px solid rgba(255,255,255,.12) !important;
  color:rgba(255,255,255,.82) !important;
  font-size:11px !important;
  font-weight:800 !important;
}

/* AI PORTFOLIO */
#portfolio{
  position:relative !important;
  background:transparent !important;
  isolation:isolate !important;
  z-index:10 !important;
}

.dgs-ai-shell{
  max-width:1800px !important;
}

.dgs-ai-service-clarity{
  z-index:18 !important;
  margin:0 0 clamp(34px,5vw,64px) !important;
  padding:clamp(22px,3.4vw,42px) !important;
}

.dgs-ai-service-grid{
  display:grid !important;
  grid-template-columns:minmax(280px,.88fr) minmax(0,1.12fr) !important;
  gap:clamp(24px,4vw,56px) !important;
  align-items:start !important;
}

.dgs-ai-service-kicker{
  display:inline-flex !important;
  width:fit-content !important;
  margin:0 0 18px !important;
  padding:8px 13px !important;
  border-radius:999px !important;
  border:1px solid rgba(255,255,255,.14) !important;
  background:rgba(255,255,255,.055) !important;
  color:rgba(255,255,255,.72) !important;
  font-size:11px !important;
  line-height:1.2 !important;
  letter-spacing:.14em !important;
  text-transform:uppercase !important;
  font-weight:800 !important;
}

.dgs-ai-service-copy h3{
  margin:0 !important;
  max-width:760px !important;
  color:#fff !important;
  font-size:clamp(1.9rem,3.5vw,4.4rem) !important;
  line-height:1 !important;
  letter-spacing:-.06em !important;
  font-weight:800 !important;
}

.dgs-ai-service-copy p:not(.dgs-ai-service-kicker){
  margin:22px 0 0 !important;
  max-width:720px !important;
  color:rgba(255,255,255,.68) !important;
  font-size:clamp(15px,1.05vw,18px) !important;
  line-height:1.7 !important;
  font-weight:400 !important;
}

.dgs-ai-service-points{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:12px !important;
}

.dgs-ai-service-points article{
  min-height:190px !important;
  padding:22px !important;
  border-radius:24px !important;
  background:rgba(255,255,255,.045) !important;
  border:1px solid rgba(255,255,255,.105) !important;
}

.dgs-ai-service-points span{
  display:block !important;
  margin-bottom:14px !important;
  color:rgba(255,255,255,.44) !important;
  font-size:11px !important;
  letter-spacing:.15em !important;
  text-transform:uppercase !important;
  font-weight:900 !important;
}

.dgs-ai-service-points h4{
  margin:0 !important;
  color:#fff !important;
  font-size:clamp(20px,1.5vw,28px) !important;
  line-height:1.08 !important;
  letter-spacing:-.04em !important;
  font-weight:800 !important;
}

.dgs-ai-service-points p{
  margin:12px 0 0 !important;
  color:rgba(255,255,255,.62) !important;
  font-size:14px !important;
  line-height:1.58 !important;
}

.dgs-ai-process-strip{
  display:grid !important;
  grid-template-columns:repeat(5,minmax(0,1fr)) !important;
  gap:1px !important;
  margin-top:clamp(22px,3vw,34px) !important;
  border:1px solid rgba(255,255,255,.11) !important;
  border-radius:24px !important;
  overflow:hidden !important;
  background:rgba(255,255,255,.08) !important;
}

.dgs-ai-process-strip div{
  min-height:118px !important;
  padding:18px !important;
  background:rgba(0,0,0,.34) !important;
}

.dgs-ai-process-strip strong{
  display:block !important;
  color:#fff !important;
  font-size:15px !important;
  line-height:1.2 !important;
  font-weight:900 !important;
  letter-spacing:-.02em !important;
  margin-bottom:8px !important;
}

.dgs-ai-process-strip span{
  display:block !important;
  color:rgba(255,255,255,.58) !important;
  font-size:13px !important;
  line-height:1.5 !important;
}

.portfolio-filters{
  display:flex !important;
  gap:clamp(15px,3vw,40px) !important;
  margin-bottom:clamp(26px,4vw,48px) !important;
  overflow-x:auto !important;
  scrollbar-width:thin !important;
  scrollbar-color:rgba(255,255,255,0.3) transparent !important;
  position:relative !important;
  z-index:20 !important;
  -webkit-overflow-scrolling:touch !important;
}

.portfolio-filters::-webkit-scrollbar{height:4px;}
.portfolio-filters::-webkit-scrollbar-track{background:transparent;}
.portfolio-filters::-webkit-scrollbar-thumb{background:rgba(255,255,255,.3);border-radius:10px;}

.portfolio-filter-tab{
  font-size:clamp(.7rem,1.5vw,.8rem) !important;
  font-weight:700 !important;
  letter-spacing:clamp(1.5px,.4vw,2.5px) !important;
  color:rgba(255,255,255,.5) !important;
  text-transform:uppercase !important;
  white-space:nowrap !important;
  padding-bottom:12px !important;
  position:relative !important;
  display:inline-block !important;
  cursor:pointer !important;
  transition:color .2s ease !important;
}

.portfolio-filter-tab span{
  position:absolute !important;
  bottom:0 !important;
  left:0 !important;
  width:100% !important;
  height:1px !important;
  background:linear-gradient(90deg,#ff6b9d,#ffa834) !important;
  opacity:0 !important;
}

.portfolio-filter-tab.active{
  color:#fff !important;
}

.portfolio-filter-tab.active span{
  opacity:1 !important;
}

.content-view{
  display:none !important;
  opacity:0 !important;
  transition:opacity .35s ease !important;
}

.content-view.active-view{
  display:block !important;
  opacity:1 !important;
}

#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery,
#tvc-gallery{
  display:block !important;
  width:100% !important;
  column-gap:clamp(8px,1vw,12px) !important;
  margin-bottom:0 !important;
}

#portfolio-gallery{
  columns:5 260px !important;
  padding:clamp(6px,1vw,10px) !important;
  background:rgba(0,0,0,.4) !important;
  min-height:400px !important;
}

#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery{
  columns:4 260px !important;
}

#tvc-gallery{
  columns:2 420px !important;
}

.gallery-item,
.case-study-item{
  display:block !important;
  width:100% !important;
  margin:0 0 clamp(8px,1vw,12px) 0 !important;
  break-inside:avoid !important;
  page-break-inside:avoid !important;
  -webkit-column-break-inside:avoid !important;
  position:relative !important;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,107,157,.18), transparent 30%),
    radial-gradient(circle at 75% 30%, rgba(255,168,52,.12), transparent 32%),
    radial-gradient(circle at 50% 75%, rgba(192,132,252,.14), transparent 35%),
    #050505 !important;
  border:1px solid rgba(255,255,255,.08) !important;
  overflow:hidden !important;
  cursor:pointer !important;
  border-radius:12px !important;
  transition:border-color .25s ease, box-shadow .25s ease, transform .25s ease !important;
  contain:layout paint style !important;
}

.gallery-item:not(.wide-item),
.case-study-item:not(.wide-item){
  aspect-ratio:9 / 16 !important;
}

.gallery-item.wide-item,
.case-study-item.wide-item,
.case-study-item.wide-item .video-wrapper{
  aspect-ratio:16 / 9 !important;
}

.gallery-item:hover,
.case-study-item:hover{
  border-color:rgba(255,107,157,.5) !important;
  box-shadow:0 8px 30px rgba(255,107,157,.3) !important;
  transform:translateY(-3px) !important;
}

.video-wrapper{
  position:relative !important;
  width:100% !important;
  overflow:hidden !important;
  background:#000 !important;
  aspect-ratio:9 / 16 !important;
}

.thumb-img{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center top !important;
  background:#0a0a0a !important;
  transition:transform .3s ease, opacity .3s ease !important;
}

.thumb-video{
  position:absolute !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center top !important;
  background:#0a0a0a !important;
  z-index:1 !important;
}
.thumb-poster{z-index:2 !important;}
.gallery-item.video-ready .thumb-poster,
.case-study-item.video-ready .thumb-poster{opacity:0 !important;pointer-events:none !important;}

.gallery-item:hover .thumb-img,
.case-study-item:hover .thumb-img{
  transform:scale(1.035) !important;
}

.thumb-fallback{
  position:absolute !important;
  inset:0 !important;
  background:
    radial-gradient(circle at 25% 20%, rgba(255,107,157,.32), transparent 32%),
    radial-gradient(circle at 75% 30%, rgba(255,168,52,.22), transparent 34%),
    radial-gradient(circle at 50% 78%, rgba(192,132,252,.24), transparent 36%),
    linear-gradient(135deg,#070707,#111 48%,#050505) !important;
}

.play-btn-overlay{
  position:absolute !important;
  inset:0 !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  z-index:3 !important;
  pointer-events:none !important;
  opacity:0 !important;
  transition:opacity .25s ease !important;
}

.gallery-item:hover .play-btn-overlay,
.case-study-item:hover .play-btn-overlay{
  opacity:1 !important;
}

.play-btn-circle{
  width:clamp(44px,6vw,60px) !important;
  height:clamp(44px,6vw,60px) !important;
  border-radius:50% !important;
  background:rgba(0,0,0,.58) !important;
  border:2px solid rgba(255,255,255,.74) !important;
  backdrop-filter:blur(6px) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  box-shadow:0 12px 34px rgba(0,0,0,.45) !important;
}

.play-btn-circle svg{
  width:clamp(16px,2.5vw,22px) !important;
  height:clamp(16px,2.5vw,22px) !important;
  margin-left:3px !important;
  fill:#fff !important;
}

.video-overlay{
  position:absolute !important;
  bottom:0 !important;
  left:0 !important;
  right:0 !important;
  padding:clamp(10px,2vw,15px) !important;
  background:linear-gradient(180deg,transparent,rgba(0,0,0,.95)) !important;
  z-index:2 !important;
  pointer-events:none !important;
}

.dgs-load-wrap{
  text-align:center !important;
  margin-top:clamp(30px,4vw,50px) !important;
}

#load-more-btn{
  font-size:clamp(.75rem,1.5vw,.85rem) !important;
  font-weight:700 !important;
  letter-spacing:clamp(2px,.5vw,3px) !important;
  color:#fff !important;
  text-transform:uppercase !important;
  border-bottom:1px solid rgba(255,255,255,.3) !important;
  padding-bottom:8px !important;
  display:inline-block !important;
  cursor:pointer !important;
}

.portfolio-lightbox{
  position:fixed !important;
  inset:0 !important;
  width:100% !important;
  height:100% !important;
  background:rgba(0,0,0,.96) !important;
  z-index:2147483647 !important;
  display:none;
  opacity:0;
  align-items:center !important;
  justify-content:center !important;
  padding:clamp(14px,3vw,34px) !important;
  transition:opacity .24s ease !important;
}

.portfolio-lightbox.is-open{
  display:flex !important;
  opacity:1 !important;
}

.portfolio-lightbox-content{
  width:min(92vw,1280px) !important;
  height:calc(100vh - clamp(90px,12vw,150px)) !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  position:relative !important;
  margin:auto !important;
}

#lightbox-player{
  display:block !important;
  width:auto !important;
  height:auto !important;
  max-width:100% !important;
  max-height:100% !important;
  object-fit:contain !important;
  border-radius:12px !important;
  background:#000 !important;
  box-shadow:0 28px 80px rgba(0,0,0,.9) !important;
}

#lightbox-player.is-landscape{
  width:min(92vw,1280px) !important;
  height:auto !important;
  max-height:calc(100vh - 140px) !important;
}

#lightbox-player.is-portrait{
  width:auto !important;
  height:min(82vh,920px) !important;
  max-width:92vw !important;
}

.portfolio-lightbox-btn{
  position:absolute !important;
  z-index:2147483647 !important;
  border:1px solid rgba(255,255,255,.22) !important;
  background:rgba(18,18,18,.82) !important;
  color:#fff !important;
  cursor:pointer !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  line-height:1 !important;
  padding:0 !important;
  margin:0 !important;
  box-shadow:0 8px 24px rgba(0,0,0,.34) !important;
  backdrop-filter:blur(8px) !important;
}

.portfolio-lightbox-close{
  top:clamp(16px,4vw,32px) !important;
  right:clamp(16px,4vw,32px) !important;
  width:clamp(44px,9vw,56px) !important;
  height:clamp(44px,9vw,56px) !important;
  border-radius:999px !important;
  font-size:clamp(1.4rem,4vw,1.8rem) !important;
}

.portfolio-lightbox-arrow{
  top:50% !important;
  width:clamp(42px,5vw,56px) !important;
  height:clamp(42px,5vw,56px) !important;
  border-radius:999px !important;
  font-size:clamp(32px,5vw,42px) !important;
  transform:translateY(-50%) !important;
}

.portfolio-lightbox-prev{left:clamp(14px,3vw,34px) !important;}
.portfolio-lightbox-next{right:clamp(14px,3vw,34px) !important;}

.dgs-v1215-case-media{
  height:300px !important;
  overflow:hidden !important;
  border-bottom:1px solid rgba(255,255,255,.08) !important;
}

.dgs-v1215-case-media img{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  display:block !important;
}

.dgs-v1215-case-metrics{
  display:grid !important;
  grid-template-columns:repeat(3,1fr) !important;
  gap:10px !important;
  margin-top:22px !important;
  padding-top:18px !important;
  border-top:1px solid rgba(255,255,255,.10) !important;
}

.dgs-v1215-case-metrics strong{
  display:block !important;
  font-size:clamp(24px,2vw,34px) !important;
  line-height:1 !important;
  letter-spacing:-.05em !important;
}

.dgs-v1215-case-metrics small{
  display:block !important;
  color:rgba(255,255,255,.56) !important;
  font-size:11px !important;
  margin-top:6px !important;
}

.dgs-v1215-case-mini-grid{
  display:grid !important;
  grid-template-columns:repeat(6,minmax(0,1fr)) !important;
  gap:12px !important;
  margin-top:18px !important;
}

.dgs-v1215-case-mini{
  min-height:160px !important;
  border-radius:28px !important;
  padding:20px !important;
}

.dgs-v1215-gallery-frame{
  padding:clamp(16px,2vw,28px) !important;
  border-radius:34px !important;
}

.dgs-v1215-authority-grid,
.dgs-v1215-proof-strip{
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
  gap:14px !important;
}

.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article{
  min-height:250px !important;
  border-radius:30px !important;
  padding:clamp(22px,2.6vw,34px) !important;
}

.dgs-v1215-authority-grid{
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
}

.dgs-v1215-industry-pills{
  display:flex !important;
  flex-wrap:wrap !important;
  gap:12px !important;
}

.dgs-v1215-industry-pills span{
  display:inline-flex !important;
  align-items:center !important;
  min-height:44px !important;
  padding:10px 15px !important;
  border-radius:999px !important;
  font-size:13px !important;
  font-weight:800 !important;
  background:rgba(255,255,255,.055) !important;
  border:1px solid rgba(255,255,255,.14) !important;
  color:rgba(255,255,255,.84) !important;
}

.dgs-v1215-testimonial-grid{
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
}

.dgs-v1215-stars{
  color:#FD5C62 !important;
  font-weight:900 !important;
  margin-bottom:18px !important;
  letter-spacing:.08em !important;
}

.dgs-v1215-testimonial-card h3{
  margin-top:22px !important;
}

.dgs-v1215-faq-grid{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:14px !important;
}

.dgs-v1215-faq-grid details{
  border-radius:26px !important;
  padding:0 !important;
}

.dgs-v1215-faq-grid summary{
  cursor:pointer !important;
  list-style:none !important;
  padding:22px 54px 22px 24px !important;
  font-size:17px !important;
  line-height:1.35 !important;
  font-weight:800 !important;
}

.dgs-v1215-faq-grid summary::-webkit-details-marker{
  display:none !important;
}

.dgs-v1215-faq-grid summary::after{
  content:"+" !important;
  position:absolute !important;
  right:22px !important;
  top:20px !important;
  color:#FD5C62 !important;
  font-size:22px !important;
}

.dgs-v1215-faq-grid details[open] summary::after{
  content:"×" !important;
}

.dgs-v1215-faq-grid p{
  margin:0 !important;
  padding:0 24px 24px !important;
  color:rgba(255,255,255,.62) !important;
  font-size:15px !important;
  line-height:1.65 !important;
}

.dgs-v1215-final-card{
  display:flex !important;
  justify-content:space-between !important;
  align-items:flex-start !important;
  gap:24px !important;
  border-radius:40px !important;
  padding:clamp(28px,4vw,54px) !important;
}

.dgs-v1215-final-card h2{
  max-width:900px !important;
  font-size:clamp(2.2rem,4.2vw,5.2rem) !important;
  line-height:.98 !important;
}

.dgs-v1215-form-shortcode{
  margin-top:26px !important;
  max-width:720px !important;
}

.dgs-v1215-reveal{
  opacity:1;
  transform:none;
}

.dgs-v1215.motion-ready .dgs-v1215-reveal{
  opacity:0;
  transform:translateY(30px);
  transition:opacity .8s ease, transform .8s cubic-bezier(.16,1,.3,1);
}

.dgs-v1215.motion-ready .dgs-v1215-reveal.is-visible{
  opacity:1;
  transform:translateY(0);
}

.dgs-v1215.gsap-active .dgs-v1215-reveal{
  opacity:1 !important;
  transform:none !important;
  transition:none !important;
}

@media(max-width:1200px){
  #portfolio-gallery{columns:4 260px !important;}
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{columns:4 250px !important;}
  #tvc-gallery{columns:2 420px !important;}
}

@media(max-width:1180px){
  .dgs-v1215-hero-layout{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-logo-track{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }

  .dgs-v1215-awards-grid,
  .dgs-v1215-service-menu,
  .dgs-v1215-case-visual-grid,
  .dgs-v1215-testimonial-grid,
  .dgs-v1215-authority-grid,
  .dgs-v1215-proof-strip{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .dgs-v1215-case-mini-grid{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }

  .dgs-ai-service-grid{
    grid-template-columns:1fr !important;
  }

  .dgs-ai-process-strip{
    grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  }
}

@media(max-width:860px){
  .dgs-v1215-shell{
    width:min(100% - 28px, 1480px) !important;
  }

  .dgs-v1215-statline,
  .dgs-v1215-awards-grid,
  .dgs-v1215-service-menu,
  .dgs-v1215-case-visual-grid,
  .dgs-v1215-testimonial-grid,
  .dgs-v1215-authority-grid,
  .dgs-v1215-proof-strip,
  .dgs-v1215-faq-grid{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-logo-track{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .dgs-v1215-case-mini-grid,
  .dgs-ai-service-points{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{
    columns:3 220px !important;
  }

  #tvc-gallery{
    columns:2 340px !important;
  }

  .dgs-v1215-final-card{
    flex-direction:column !important;
  }
}

@media(max-width:767px){
  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    columns:2 150px !important;
    column-gap:8px !important;
  }

  .portfolio-lightbox{
    padding:72px 12px 68px !important;
  }

  .portfolio-lightbox-content{
    width:100% !important;
    height:calc(100vh - 140px) !important;
  }

  #lightbox-player.is-landscape,
  #lightbox-player.is-portrait,
  #lightbox-player{
    width:100% !important;
    height:auto !important;
    max-width:100% !important;
    max-height:100% !important;
  }

  .portfolio-lightbox-close{
    top:calc(env(safe-area-inset-top,0px) + 14px) !important;
    right:14px !important;
    width:40px !important;
    height:40px !important;
    font-size:28px !important;
  }

  .portfolio-lightbox-arrow{
    top:auto !important;
    bottom:calc(env(safe-area-inset-bottom,0px) + 14px) !important;
    width:44px !important;
    height:44px !important;
    font-size:34px !important;
    transform:none !important;
  }

  .portfolio-lightbox-prev{
    left:calc(50% - 58px) !important;
  }

  .portfolio-lightbox-next{
    right:calc(50% - 58px) !important;
  }
}

@media(max-width:560px){
  .dgs-v1215-copy h1,
  .dgs-v1215-section-head h2,
  .dgs-v1215-final-card h2{
    font-size:clamp(2.3rem,11.5vw,4.1rem) !important;
    line-height:1 !important;
  }

  .dgs-v1215-actions{
    flex-direction:column !important;
    align-items:stretch !important;
  }

  .dgs-v1215-btn{
    width:100% !important;
  }

  .dgs-v1215-floating-chip{
    display:none !important;
  }

  .dgs-v1215-logo-track,
  .dgs-v1215-case-mini-grid,
  .dgs-ai-service-points,
  .dgs-ai-process-strip{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-award-image{
    height:340px !important;
  }

  .dgs-v1215-case-metrics{
    grid-template-columns:1fr !important;
  }

  .dgs-v1215-rail-line{
    width:170vw !important;
    margin-left:-85vw !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    columns:1 !important;
  }

  #dgs-v1215-canvas{
    display:none !important;
  }
}

@media(prefers-reduced-motion:reduce){
  .dgs-v1215 *,
  .dgs-v1215 *::before,
  .dgs-v1215 *::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
  }

  .dgs-v1215-reveal{
    opacity:1 !important;
    transform:none !important;
  }

  #dgs-v1215-canvas{
    display:none !important;
  }
}


/* DGS V12.15 performance patch: no blank first paint, mouse-reactive background, better mobile hero */
.dgs-v1215-bg{
  transform:translate3d(var(--v1215-bg-x,0px), var(--v1215-bg-y,0px), 0) !important;
  will-change:transform !important;
}

#dgs-v1215-canvas,
.dgs-v1215-grid{
  transform:translate3d(var(--v1215-grid-x,0px), var(--v1215-grid-y,0px), 0) !important;
  will-change:transform !important;
}

.dgs-v1215-robot-wrap,
.dgs-v1215-robot-wrap img{
  will-change:transform !important;
}

@media(max-width:767px){
  .dgs-v1215-hero{
    min-height:auto !important;
    padding:64px 0 44px !important;
  }

  .dgs-v1215-visual{
    min-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-robot-wrap{
    width:min(360px,100%) !important;
    min-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-robot-wrap img{
    max-height:clamp(310px,78vw,420px) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:96px !important;
    padding:16px !important;
  }

  .dgs-v1215-proof-stack,
  .dgs-v1215-service-clarity,
  .dgs-v1215-ai-portfolio,
  .dgs-v1215-case-block,
  .dgs-v1215-portfolio,
  .dgs-v1215-testimonials,
  .dgs-v1215-search-authority,
  .dgs-v1215-industries,
  .dgs-v1215-why,
  .dgs-v1215-faq,
  .dgs-v1215-final{
    padding:64px 0 !important;
  }
}


/* =========================================================
   DGS FIX PATCH - PORTFOLIO GRID, TEXT CROPPING & LOGO TABLE
   Keeps existing UI/UX structure; only improves visibility/layout.
   ========================================================= */

/* Logo table visibility fix */
.dgs-v1215-logo-track{
  grid-template-columns:repeat(5, minmax(170px, 1fr)) !important;
  gap:1px !important;
}

.dgs-v1215-logo-tile{
  min-height:136px !important;
  padding:26px 24px !important;
  background:rgba(255,255,255,.075) !important;
}

.dgs-v1215-logo-tile img{
  width:100% !important;
  max-width:190px !important;
  max-height:82px !important;
  height:auto !important;
  object-fit:contain !important;
  object-position:center !important;
  display:block !important;
  opacity:1 !important;
  filter:none !important;
}

.dgs-v1215-logo-tile:hover img{
  opacity:1 !important;
  filter:none !important;
}

/* Fix cropped letters in AI Production text blocks */
.dgs-ai-service-clarity{
  overflow:visible !important;
}

.dgs-ai-service-copy{
  overflow:visible !important;
}

.dgs-ai-service-copy h3{
  line-height:1.08 !important;
  padding-bottom:12px !important;
  overflow:visible !important;
}

.dgs-ai-service-points h4,
.video-overlay h3,
.gallery-item h3,
.case-study-item h3{
  line-height:1.25 !important;
  padding-bottom:2px !important;
  overflow:visible !important;
}

/* Video portfolio layout like clean 4-column card grid */
#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery,
#tvc-gallery{
  columns:initial !important;
  column-count:initial !important;
  column-gap:0 !important;
  display:grid !important;
  gap:14px !important;
  width:100% !important;
}

#portfolio-gallery,
#mascot-gallery,
#festival-gallery,
#mythological-gallery,
#product-gallery,
#jewellery-gallery,
#concept-gallery{
  grid-template-columns:repeat(4, minmax(0, 1fr)) !important;
}

#tvc-gallery{
  grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
}

.gallery-item,
.case-study-item{
  width:100% !important;
  margin:0 !important;
  break-inside:auto !important;
  page-break-inside:auto !important;
  -webkit-column-break-inside:auto !important;
  border-radius:14px !important;
}

.gallery-item:not(.wide-item),
.case-study-item:not(.wide-item){
  aspect-ratio:9 / 16 !important;
}

.gallery-item.wide-item,
.case-study-item.wide-item{
  grid-column:span 2 !important;
  aspect-ratio:16 / 9 !important;
}

.video-overlay{
  padding:18px 16px !important;
}

.video-overlay p{
  line-height:1.25 !important;
  margin-bottom:8px !important;
}

.video-overlay h3{
  font-size:15px !important;
  line-height:1.25 !important;
}

@media(max-width:1180px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(4, minmax(150px, 1fr)) !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery{
    grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
  }
}

@media(max-width:860px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:118px !important;
    padding:20px 16px !important;
  }

  .dgs-v1215-logo-tile img{
    max-width:160px !important;
    max-height:70px !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
    gap:12px !important;
  }

  .gallery-item.wide-item,
  .case-study-item.wide-item{
    grid-column:span 2 !important;
  }
}

@media(max-width:560px){
  .dgs-v1215-logo-track{
    grid-template-columns:repeat(2, minmax(0, 1fr)) !important;
  }

  .dgs-v1215-logo-tile{
    min-height:104px !important;
    padding:18px 14px !important;
  }

  .dgs-v1215-logo-tile img{
    max-width:145px !important;
    max-height:62px !important;
  }

  #portfolio-gallery,
  #mascot-gallery,
  #festival-gallery,
  #mythological-gallery,
  #product-gallery,
  #jewellery-gallery,
  #concept-gallery,
  #tvc-gallery{
    grid-template-columns:1fr !important;
    gap:12px !important;
  }

  .gallery-item.wide-item,
  .case-study-item.wide-item{
    grid-column:span 1 !important;
  }
}



/* ================================
   FINAL CTA RESPONSIVE FIX
   2K / 4K / Desktop / Mobile
================================ */
.dgs-v1215-final {
  position: relative !important;
  padding: clamp(70px, 7vw, 140px) 0 !important;
}

.dgs-v1215-final-card {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: auto !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: flex-start !important;
  gap: clamp(28px, 5vw, 80px) !important;
  border-radius: clamp(26px, 2vw, 42px) !important;
  padding: clamp(34px, 4.5vw, 72px) !important;
  background: linear-gradient(135deg, rgba(255,255,255,.072), rgba(255,255,255,.026)), rgba(2,2,2,.36) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
  backdrop-filter: blur(18px) !important;
  overflow: hidden !important;
}

.dgs-v1215-final-card > div {
  width: 100% !important;
  max-width: 1180px !important;
  min-width: 0 !important;
}

.dgs-v1215-final-card > div > span {
  display: block !important;
  margin-bottom: 12px !important;
  color: rgba(255,255,255,.88) !important;
  font-size: clamp(14px, .9vw, 18px) !important;
  line-height: 1.35 !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}

.dgs-v1215-final-card h2 {
  max-width: 1120px !important;
  margin: 0 !important;
  color: #fff !important;
  font-size: clamp(3rem, 4.7vw, 6.8rem) !important;
  line-height: .98 !important;
  letter-spacing: -0.075em !important;
  font-weight: 900 !important;
}

.dgs-v1215-final-card p {
  max-width: 1120px !important;
  margin: 14px 0 0 !important;
  color: rgba(255,255,255,.66) !important;
  font-size: clamp(15px, 1vw, 20px) !important;
  line-height: 1.62 !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn {
  align-self: start !important;
  justify-self: end !important;
  width: auto !important;
  min-width: 220px !important;
  max-width: 260px !important;
  min-height: 88px !important;
  padding: 22px 28px !important;
  border-radius: 999px !important;
  white-space: normal !important;
  text-align: left !important;
  line-height: 1.35 !important;
  display: inline-flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 20px !important;
  font-size: clamp(13px, .85vw, 16px) !important;
  font-weight: 900 !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn span {
  flex: 0 0 auto !important;
  margin-left: 6px !important;
}

.dgs-v1215-form-shortcode {
  width: 100% !important;
  max-width: 820px !important;
  margin-top: clamp(26px, 2.6vw, 42px) !important;
}

.dgs-v1215-form-shortcode input,
.dgs-v1215-form-shortcode textarea,
.dgs-v1215-form-shortcode select {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 46px !important;
  border-radius: 8px !important;
}

@media (min-width: 1920px) {
  .dgs-v1215-shell {
    width: min(1760px, calc(100% - 96px)) !important;
  }

  .dgs-v1215-final-card {
    padding: 76px 86px !important;
  }

  .dgs-v1215-final-card h2 {
    max-width: 1220px !important;
    font-size: clamp(5.4rem, 4.6vw, 7.2rem) !important;
  }

  .dgs-v1215-final-card p {
    max-width: 1200px !important;
    font-size: 20px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-width: 250px !important;
    max-width: 290px !important;
    min-height: 92px !important;
  }
}

@media (min-width: 2560px) {
  .dgs-v1215-shell {
    width: min(2200px, calc(100% - 160px)) !important;
  }

  .dgs-v1215-final-card {
    padding: 96px 110px !important;
    border-radius: 54px !important;
  }

  .dgs-v1215-final-card h2 {
    max-width: 1500px !important;
    font-size: clamp(6.6rem, 4vw, 9rem) !important;
  }

  .dgs-v1215-final-card p {
    max-width: 1450px !important;
    font-size: 24px !important;
    line-height: 1.65 !important;
  }

  .dgs-v1215-final-card > div > span {
    font-size: 22px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-width: 310px !important;
    max-width: 340px !important;
    min-height: 112px !important;
    padding: 28px 36px !important;
    font-size: 18px !important;
  }

  .dgs-v1215-form-shortcode {
    max-width: 980px !important;
  }
}

@media (max-width: 1280px) {
  .dgs-v1215-final-card {
    grid-template-columns: 1fr !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    justify-self: start !important;
    margin-top: 6px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(3rem, 6vw, 5.4rem) !important;
  }
}

@media (max-width: 860px) {
  .dgs-v1215-final {
    padding: 64px 0 !important;
  }

  .dgs-v1215-final-card {
    padding: 34px 24px !important;
    border-radius: 28px !important;
    gap: 24px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(2.8rem, 10vw, 4.7rem) !important;
    line-height: 1 !important;
    letter-spacing: -0.065em !important;
  }

  .dgs-v1215-final-card p {
    font-size: 15px !important;
    line-height: 1.62 !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    min-height: 58px !important;
    padding: 16px 20px !important;
    justify-content: center !important;
    text-align: center !important;
  }
}

@media (max-width: 560px) {
  .dgs-v1215-shell {
    width: min(100% - 24px, 1480px) !important;
  }

  .dgs-v1215-final-card {
    padding: 28px 18px !important;
    border-radius: 24px !important;
  }

  .dgs-v1215-final-card > div > span {
    font-size: 14px !important;
    margin-bottom: 10px !important;
  }

  .dgs-v1215-final-card h2 {
    font-size: clamp(2.45rem, 12vw, 3.75rem) !important;
    line-height: 1.02 !important;
    letter-spacing: -0.06em !important;
  }

  .dgs-v1215-final-card p {
    margin-top: 14px !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn {
    min-height: 54px !important;
    padding: 15px 18px !important;
    font-size: 13px !important;
    border-radius: 999px !important;
  }

  .dgs-v1215-form-shortcode {
    margin-top: 22px !important;
  }
}


/* =====================================================
   DGS HOMEPAGE FIX
   Testimonials spacing + AI Production Portfolio text crop
   Added responsive fixes for 2K, 4K, tablet and mobile
===================================================== */

.dgs-v1215-testimonials {
  padding-top: clamp(80px, 8vw, 140px) !important;
  padding-bottom: clamp(80px, 8vw, 140px) !important;
}

.dgs-v1215-testimonial-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: clamp(20px, 1.8vw, 32px) !important;
  align-items: stretch !important;
}

.dgs-v1215-testimonial-card {
  min-height: 400px !important;
  height: 100% !important;
  padding: clamp(28px, 2.4vw, 44px) !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  border-radius: 34px !important;
}

.dgs-v1215-testimonial-card p {
  margin: 18px 0 0 !important;
  color: rgba(255,255,255,.68) !important;
  font-size: clamp(14px, .9vw, 17px) !important;
  line-height: 1.72 !important;
}

.dgs-v1215-testimonial-card h3 {
  margin-top: auto !important;
  padding-top: 28px !important;
  font-size: clamp(25px, 1.8vw, 36px) !important;
  line-height: 1.05 !important;
  letter-spacing: -0.055em !important;
}

.dgs-v1215-testimonial-card span {
  width: fit-content !important;
  max-width: 100% !important;
  white-space: normal !important;
  line-height: 1.35 !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head {
  overflow: visible !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
  margin-bottom: clamp(42px, 5vw, 76px) !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
  overflow: visible !important;
  padding-top: 10px !important;
  padding-bottom: 18px !important;
  line-height: 1.1 !important;
  letter-spacing: -0.07em !important;
  max-width: 100% !important;
  white-space: normal !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 span {
  display: inline-block !important;
  padding-right: 10px !important;
  padding-bottom: 8px !important;
  line-height: 1.1 !important;
  overflow: visible !important;
}

.dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
  margin-top: 18px !important;
  max-width: 900px !important;
}

.dgs-v1215-ai-portfolio,
.dgs-v1215-ai-portfolio .dgs-ai-shell,
.dgs-v1215-ai-portfolio .dgs-v1215-shell {
  overflow: visible !important;
}

.dgs-ai-service-clarity {
  margin-top: clamp(20px, 2vw, 36px) !important;
}

@media (min-width: 1920px) {
  .dgs-v1215-testimonial-grid { gap: 34px !important; }
  .dgs-v1215-testimonial-card {
    min-height: 440px !important;
    padding: 46px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 18px !important;
    line-height: 1.75 !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 38px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(6rem, 4.8vw, 8rem) !important;
    line-height: 1.1 !important;
  }
}

@media (min-width: 2560px) {
  .dgs-v1215-testimonial-grid { gap: 42px !important; }
  .dgs-v1215-testimonial-card {
    min-height: 520px !important;
    padding: 58px !important;
    border-radius: 44px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 22px !important;
    line-height: 1.75 !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 48px !important; }
  .dgs-v1215-testimonial-card span { font-size: 13px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(8rem, 4.4vw, 10rem) !important;
    line-height: 1.12 !important;
    padding-bottom: 24px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
    font-size: 24px !important;
    max-width: 1200px !important;
  }
}

@media (max-width: 1180px) {
  .dgs-v1215-testimonial-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .dgs-v1215-testimonial-card { min-height: 360px !important; }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(4rem, 8vw, 6.2rem) !important;
    line-height: 1.1 !important;
  }
}

@media (max-width: 767px) {
  .dgs-v1215-testimonials {
    padding-top: 64px !important;
    padding-bottom: 64px !important;
  }
  .dgs-v1215-testimonial-grid {
    grid-template-columns: 1fr !important;
    gap: 18px !important;
  }
  .dgs-v1215-testimonial-card {
    min-height: auto !important;
    padding: 28px 22px !important;
    border-radius: 26px !important;
  }
  .dgs-v1215-testimonial-card p {
    font-size: 14px !important;
    line-height: 1.65 !important;
  }
  .dgs-v1215-testimonial-card h3 {
    margin-top: 24px !important;
    padding-top: 0 !important;
    font-size: 28px !important;
    line-height: 1.08 !important;
  }
  .dgs-v1215-testimonial-card span {
    font-size: 10px !important;
    letter-spacing: .08em !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head {
    padding-top: 8px !important;
    padding-bottom: 10px !important;
    margin-bottom: 34px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(3.2rem, 14vw, 4.4rem) !important;
    line-height: 1.14 !important;
    letter-spacing: -0.06em !important;
    padding-bottom: 14px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 span {
    padding-right: 6px !important;
    padding-bottom: 10px !important;
  }
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head p {
    font-size: 15px !important;
    line-height: 1.65 !important;
    margin-top: 10px !important;
  }
}

@media (max-width: 480px) {
  .dgs-v1215-ai-portfolio .dgs-v1215-section-head h2 {
    font-size: clamp(2.8rem, 13vw, 3.7rem) !important;
    line-height: 1.16 !important;
    letter-spacing: -0.055em !important;
  }
  .dgs-v1215-testimonial-card h3 { font-size: 26px !important; }
}



/* =====================================================
   DGS FINAL FIX PATCH
   1) Fix gap between Industries and Why section
   2) Fix Growth Audit button responsiveness
   3) Add animated brand-color outline to "This Spot Awaits You"
   Brand colors: #72c1d8, #634dbc, #ea3f8b, #ffae33
===================================================== */

@property --dgs-spot-rotate {
  syntax: "<angle>";
  initial-value: 132deg;
  inherits: false;
}

/* Reduce the excessive blank space after Industries */
.dgs-v1215-industries{
  padding-top: clamp(72px, 7vw, 110px) !important;
  padding-bottom: clamp(32px, 3.2vw, 58px) !important;
}

.dgs-v1215-why{
  padding-top: clamp(42px, 4vw, 72px) !important;
}

.dgs-v1215-industries .dgs-v1215-section-head{
  margin-bottom: clamp(22px, 2.4vw, 34px) !important;
}

.dgs-v1215-industry-pills{
  margin-bottom: 0 !important;
}

/* Final CTA button: stable on desktop, 2K, 4K and mobile */
.dgs-v1215-final-card > .dgs-v1215-btn{
  min-width: 300px !important;
  max-width: 340px !important;
  min-height: 92px !important;
  padding: 24px 32px !important;
  white-space: normal !important;
  text-align: left !important;
  justify-content: space-between !important;
  align-items: center !important;
  line-height: 1.25 !important;
  border-radius: 999px !important;
}

.dgs-v1215-final-card > .dgs-v1215-btn span{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 22px !important;
  line-height: 1 !important;
  margin-left: 16px !important;
}

/* This Spot Awaits You - animated outline using DGS brand colors */
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  position: relative !important;
  isolation: isolate !important;
  overflow: visible !important;
  min-height: 128px !important;
  background: rgba(255,255,255,.065) !important;
  border: 1px solid rgba(255,255,255,.10) !important;
  color: rgba(255,255,255,.88) !important;
  font-size: clamp(13px, .95vw, 17px) !important;
  letter-spacing: .11em !important;
  line-height: 1.35 !important;
  text-shadow: 0 0 18px rgba(255,255,255,.18) !important;
  transform: none !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text::before{
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  z-index: -1 !important;
  border-radius: inherit !important;
  background: linear-gradient(var(--dgs-spot-rotate), #72c1d8 0%, #634dbc 32%, #ea3f8b 66%, #ffae33 100%) !important;
  animation: dgsSpotBorderSpin 3.2s linear infinite !important;
  opacity: .95 !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text::after{
  content: "" !important;
  position: absolute !important;
  inset: 2px !important;
  z-index: -1 !important;
  border-radius: calc(inherit - 2px) !important;
  background: linear-gradient(135deg, rgba(30,24,42,.96), rgba(18,16,24,.94)) !important;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 0 36px rgba(234,63,139,.18) !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:hover{
  transform: translateY(-3px) !important;
  color: #fff !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:hover::before{
  opacity: 1 !important;
  filter: brightness(1.15) !important;
}

@keyframes dgsSpotBorderSpin{
  0%{ --dgs-spot-rotate: 0deg; }
  100%{ --dgs-spot-rotate: 360deg; }
}

/* Keep logo cells clean and make small logos readable */
.dgs-v1215-logo-tile{
  overflow: visible !important;
}

.dgs-v1215-logo-tile img{
  max-width: 175px !important;
  max-height: 72px !important;
  opacity: .96 !important;
  filter: none !important;
}

.dgs-v1215-logo-tile:hover img{
  opacity: 1 !important;
  filter: none !important;
}

@media (min-width: 1920px){
  .dgs-v1215-industries{
    padding-bottom: 54px !important;
  }

  .dgs-v1215-why{
    padding-top: 64px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    min-width: 340px !important;
    max-width: 380px !important;
    min-height: 106px !important;
    padding: 28px 38px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 146px !important;
    font-size: 18px !important;
  }
}

@media (min-width: 2560px){
  .dgs-v1215-industries{
    padding-bottom: 68px !important;
  }

  .dgs-v1215-why{
    padding-top: 76px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    min-width: 410px !important;
    max-width: 460px !important;
    min-height: 126px !important;
    padding: 34px 46px !important;
    font-size: 20px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 170px !important;
    font-size: 22px !important;
  }
}

@media (max-width: 1180px){
  .dgs-v1215-industries{
    padding-bottom: 36px !important;
  }

  .dgs-v1215-why{
    padding-top: 44px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    justify-self: start !important;
    min-width: 270px !important;
    max-width: 330px !important;
    min-height: 78px !important;
  }
}

@media (max-width: 767px){
  .dgs-v1215-industries{
    padding-top: 56px !important;
    padding-bottom: 28px !important;
  }

  .dgs-v1215-why{
    padding-top: 34px !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    min-height: 56px !important;
    padding: 16px 20px !important;
    text-align: center !important;
    justify-content: center !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn span{
    margin-left: 10px !important;
  }

  .dgs-v1215-logo-tile.dgs-v1215-logo-text{
    min-height: 106px !important;
    font-size: 12px !important;
    letter-spacing: .08em !important;
  }

  .dgs-v1215-logo-tile img{
    max-width: 148px !important;
    max-height: 64px !important;
  }
}



/* =====================================================
   DGS FINAL ALIGNMENT PATCH
   1) Center section heading text correctly
   2) Make "This Spot Awaits You" behave like a CTA link
===================================================== */
.dgs-v1215 .dgs-v1215-section-head{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: auto !important;
  margin-right: auto !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215-industries .dgs-v1215-section-head,
.dgs-v1215-why .dgs-v1215-section-head,
.dgs-v1215-testimonials .dgs-v1215-section-head,
.dgs-v1215-ai-portfolio .dgs-v1215-section-head,
.dgs-v1215-faq .dgs-v1215-section-head,
.dgs-v1215-search-authority .dgs-v1215-section-head,
.dgs-v1215-service-clarity .dgs-v1215-section-head,
.dgs-v1215-case-block .dgs-v1215-section-head,
.dgs-v1215-portfolio .dgs-v1215-section-head,
.dgs-v1215-proof-stack .dgs-v1215-section-head{
  max-width: 1180px !important;
}

.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: center !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  cursor: pointer !important;
  text-decoration: none !important;
}

.dgs-v1215-logo-tile.dgs-v1215-logo-text:focus-visible{
  outline: 3px solid #72c1d8 !important;
  outline-offset: 6px !important;
}

@media (max-width: 767px){
  .dgs-v1215 .dgs-v1215-section-head{
    text-align: center !important;
  }

  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p{
    text-align: center !important;
  }
}</style><style>/* =====================================================
   DGS PROPER WEBPAGE ALIGNMENT PATCH
   Fixes over-centered text from previous patch.
   Keeps cards/buttons intact and keeps This Spot link active.
===================================================== */

/* Default webpage content alignment: left, not center */
.dgs-v1215 .dgs-v1215-section-head{
  margin-left: 0 !important;
  margin-right: auto !important;
  text-align: left !important;
  max-width: 1120px !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: 0 !important;
  margin-right: 0 !important;
  text-align: left !important;
}

/* Hero content should stay left aligned */
.dgs-v1215-copy,
.dgs-v1215-copy h1,
.dgs-v1215-copy p{
  text-align: left !important;
}

/* Service/card/body content must stay naturally readable */
.dgs-v1215-service-menu article,
.dgs-v1215-award-body,
.dgs-v1215-case-content,
.dgs-v1215-case-mini,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-ai-service-copy,
.dgs-ai-service-points article,
.dgs-v1215-final-card,
.dgs-v1215-final-card h2,
.dgs-v1215-final-card p{
  text-align: left !important;
}

/* Industry chips should align with the section heading */
.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: flex-start !important;
}

/* Keep portfolio filter tabs left aligned, horizontal and natural */
.portfolio-filters{
  justify-content: flex-start !important;
  text-align: left !important;
}

/* Logo tiles can remain centered because logos should sit centered inside tiles */
.dgs-v1215-logo-tile{
  text-align: center !important;
}

/* This Spot Awaits You remains clickable and centered inside the logo tile */
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  cursor: pointer !important;
}

/* CTA button text should not be squeezed or weirdly centered */
.dgs-v1215-final-card > .dgs-v1215-btn{
  text-align: left !important;
}

@media (max-width: 767px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p,
  .dgs-v1215-copy,
  .dgs-v1215-copy h1,
  .dgs-v1215-copy p,
  .dgs-v1215-final-card,
  .dgs-v1215-final-card h2,
  .dgs-v1215-final-card p{
    text-align: left !important;
  }

  .dgs-v1215-industries .dgs-v1215-industry-pills{
    justify-content: flex-start !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    text-align: center !important;
    justify-content: center !important;
  }
}</style> <script src="data:text/javascript;base64,KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO3ZhciByb290PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIi5kZ3MtdjEyMTUiKTtpZighcm9vdHx8cm9vdC5kYXRhc2V0LmRnc1YxMjE1Qm9vdGVkPT09IjEiKXJldHVybjtyb290LmRhdGFzZXQuZGdzVjEyMTVCb290ZWQ9IjEiO3ZhciByYWY9d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8ZnVuY3Rpb24oY2Ipe3JldHVybiBzZXRUaW1lb3V0KGNiLDE2KX07dmFyIGlkbGU9d2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2t8fGZ1bmN0aW9uKGNiKXtyZXR1cm4gc2V0VGltZW91dChjYiwzNTApfTt2YXIgcmVkdWNlZE1vdGlvbj13aW5kb3cubWF0Y2hNZWRpYSYmd2luZG93Lm1hdGNoTWVkaWEoIihwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIikubWF0Y2hlczt2YXIgY29hcnNlUG9pbnRlcj13aW5kb3cubWF0Y2hNZWRpYSYmd2luZG93Lm1hdGNoTWVkaWEoIihwb2ludGVyOiBjb2Fyc2UpIikubWF0Y2hlczt2YXIgZGVza3RvcE1vdGlvbj13aW5kb3cubWF0Y2hNZWRpYSYmd2luZG93Lm1hdGNoTWVkaWEoIihtaW4td2lkdGg6IDkwMXB4KSIpLm1hdGNoZXM7dmFyIGNhblVzZVdlYkdMPSFyZWR1Y2VkTW90aW9uJiZkZXNrdG9wTW90aW9uJiYhY29hcnNlUG9pbnRlcjtmdW5jdGlvbiByZXZlYWxDb250ZW50KCl7dmFyIGl0ZW1zPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHJvb3QucXVlcnlTZWxlY3RvckFsbCgiLmRncy12MTIxNS1yZXZlYWwiKSk7aWYoIWl0ZW1zLmxlbmd0aClyZXR1cm47cm9vdC5jbGFzc0xpc3QuYWRkKCJtb3Rpb24tcmVhZHkiKTtmdW5jdGlvbiBzaG93KGl0ZW0pe2l0ZW0uY2xhc3NMaXN0LmFkZCgiaXMtdmlzaWJsZSIpfQppdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0saW5kZXgpe2lmKGluZGV4PDJ8fGl0ZW0uY2xvc2VzdCgiLmRncy12MTIxNS1oZXJvIikpc2hvdyhpdGVtKTt9KTtpZihyZWR1Y2VkTW90aW9ufHwhKCJJbnRlcnNlY3Rpb25PYnNlcnZlciIgaW4gd2luZG93KSl7aXRlbXMuZm9yRWFjaChzaG93KTtyZXR1cm59CnZhciBvYnNlcnZlcj1uZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oZW50cmllcyl7ZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5KXtpZihlbnRyeS5pc0ludGVyc2VjdGluZyl7c2hvdyhlbnRyeS50YXJnZXQpO29ic2VydmVyLnVub2JzZXJ2ZShlbnRyeS50YXJnZXQpfX0pfSx7dGhyZXNob2xkOjAuMDYscm9vdE1hcmdpbjoiMHB4IDBweCAtNCUgMHB4In0pO2l0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7aWYoIWl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCJpcy12aXNpYmxlIikpb2JzZXJ2ZXIub2JzZXJ2ZShpdGVtKTt9KTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aXRlbXMuZm9yRWFjaChzaG93KX0sMTIwMCl9CmZ1bmN0aW9uIHVwZGF0ZVNjcm9sbFZhcnMoKXt2YXIgdGlja2luZz0hMTtmdW5jdGlvbiB1cGRhdGUoKXt2YXIgcmVjdD1yb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO3ZhciBzdGFydD13aW5kb3cucGFnZVlPZmZzZXQrcmVjdC50b3A7dmFyIHRvdGFsPU1hdGgubWF4KHJvb3Qub2Zmc2V0SGVpZ2h0LXdpbmRvdy5pbm5lckhlaWdodCwxKTt2YXIgY3VycmVudD13aW5kb3cucGFnZVlPZmZzZXQtc3RhcnQ7dmFyIHByb2dyZXNzPU1hdGgubWluKE1hdGgubWF4KGN1cnJlbnQvdG90YWwsMCksMSk7cm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgiLS12MTIxNS1zY3JvbGwiLHByb2dyZXNzLnRvRml4ZWQoNCkpO3RpY2tpbmc9ITF9CmZ1bmN0aW9uIHJlcXVlc3RVcGRhdGUoKXtpZighdGlja2luZyl7dGlja2luZz0hMDtyYWYodXBkYXRlKX19CnVwZGF0ZSgpO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJzY3JvbGwiLHJlcXVlc3RVcGRhdGUse3Bhc3NpdmU6ITB9KTt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicmVzaXplIixyZXF1ZXN0VXBkYXRlLHtwYXNzaXZlOiEwfSl9CmZ1bmN0aW9uIGluaXRQb2ludGVyTW90aW9uKCl7aWYocmVkdWNlZE1vdGlvbilyZXR1cm47dmFyIHdyYXA9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImRncy12MTIxNS1yb2JvdC13cmFwIik7dmFyIGltZz1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgiZGdzLXYxMjE1LXJvYm90Iik7dmFyIGFjdGl2ZT0hMTt2YXIgbng9MDt2YXIgbnk9MDt2YXIgdGFyZ2V0WD0wO3ZhciB0YXJnZXRZPTA7ZnVuY3Rpb24gcmVuZGVyKCl7YWN0aXZlPSExO254Kz0odGFyZ2V0WC1ueCkqMC4xMjtueSs9KHRhcmdldFktbnkpKjAuMTI7cm9vdC5zdHlsZS5zZXRQcm9wZXJ0eSgiLS12MTIxNS1iZy14IiwobngqLTE4KS50b0ZpeGVkKDIpKyJweCIpO3Jvb3Quc3R5bGUuc2V0UHJvcGVydHkoIi0tdjEyMTUtYmcteSIsKG55Ki0xNCkudG9GaXhlZCgyKSsicHgiKTtyb290LnN0eWxlLnNldFByb3BlcnR5KCItLXYxMjE1LWdyaWQteCIsKG54KjEwKS50b0ZpeGVkKDIpKyJweCIpO3Jvb3Quc3R5bGUuc2V0UHJvcGVydHkoIi0tdjEyMTUtZ3JpZC15IiwobnkqOCkudG9GaXhlZCgyKSsicHgiKTtpZih3cmFwJiZpbWcmJndpbmRvdy5pbm5lcldpZHRoPj05MDApe3dyYXAuc3R5bGUudHJhbnNmb3JtPSJwZXJzcGVjdGl2ZSgxMzAwcHgpIHJvdGF0ZVkoIisobngqNCkudG9GaXhlZCgyKSsiZGVnKSByb3RhdGVYKCIrKC1ueSozKS50b0ZpeGVkKDIpKyJkZWcpIHRyYW5zbGF0ZTNkKCIrKG54KjgpLnRvRml4ZWQoMikrInB4LCIrKG55KjYpLnRvRml4ZWQoMikrInB4LDApIjtpbWcuc3R5bGUudHJhbnNmb3JtPSJzY2FsZSgxLjAyKSB0cmFuc2xhdGUzZCgiKyhueCotNykudG9GaXhlZCgyKSsicHgsIisobnkqLTUpLnRvRml4ZWQoMikrInB4LDApIn19CmZ1bmN0aW9uIHJlcXVlc3RSZW5kZXIoKXtpZighYWN0aXZlKXthY3RpdmU9ITA7cmFmKHJlbmRlcil9fQp3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicG9pbnRlcm1vdmUiLGZ1bmN0aW9uKGV2ZW50KXtpZihldmVudC5wb2ludGVyVHlwZSYmZXZlbnQucG9pbnRlclR5cGUhPT0ibW91c2UiKXJldHVybjt0YXJnZXRYPShldmVudC5jbGllbnRYL01hdGgubWF4KHdpbmRvdy5pbm5lcldpZHRoLDEpLTAuNSkqMjt0YXJnZXRZPShldmVudC5jbGllbnRZL01hdGgubWF4KHdpbmRvdy5pbm5lckhlaWdodCwxKS0wLjUpKjI7cmVxdWVzdFJlbmRlcigpfSx7cGFzc2l2ZTohMH0pO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJwb2ludGVybGVhdmUiLGZ1bmN0aW9uKCl7dGFyZ2V0WD0wO3RhcmdldFk9MDtpZih3cmFwKXdyYXAuc3R5bGUudHJhbnNmb3JtPSIiO2lmKGltZylpbWcuc3R5bGUudHJhbnNmb3JtPSIiO3JlcXVlc3RSZW5kZXIoKX0se3Bhc3NpdmU6ITB9KX0KZnVuY3Rpb24gbG9hZFNjcmlwdChzcmMpe3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7dmFyIGV4aXN0aW5nPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFtzcmM9Iicrc3JjKyciXScpO2lmKGV4aXN0aW5nKXtpZih3aW5kb3cuVEhSRUUmJnNyYy5pbmRleE9mKCJ0aHJlZSIpIT09LTEpe3Jlc29sdmUoKTtyZXR1cm59CmV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoImxvYWQiLHJlc29sdmUse29uY2U6ITB9KTtleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCJlcnJvciIscmVqZWN0LHtvbmNlOiEwfSk7cmV0dXJufQp2YXIgc2NyaXB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zcmM9c3JjO3NjcmlwdC5hc3luYz0hMDtzY3JpcHQuZGVmZXI9ITA7c2NyaXB0Lm9ubG9hZD1yZXNvbHZlO3NjcmlwdC5vbmVycm9yPXJlamVjdDtkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCl9KX0KZnVuY3Rpb24gaW5pdFRocmVlKCl7aWYocm9vdC5kYXRhc2V0LmRnc1YxMjE1VGhyZWU9PT0iMSJ8fCFjYW5Vc2VXZWJHTHx8IXdpbmRvdy5USFJFRSlyZXR1cm47cm9vdC5kYXRhc2V0LmRnc1YxMjE1VGhyZWU9IjEiO3ZhciBjYW52YXM9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImRncy12MTIxNS1jYW52YXMiKTtpZighY2FudmFzKXJldHVybjt2YXIgVEhSRUU9d2luZG93LlRIUkVFO3Jvb3QuY2xhc3NMaXN0LmFkZCgidjEyMTUtd2ViZ2wtcmVhZHkiKTt2YXIgcmVuZGVyZXI9bmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2NhbnZhczpjYW52YXMsYWxwaGE6ITAsYW50aWFsaWFzOiExLHBvd2VyUHJlZmVyZW5jZToiaGlnaC1wZXJmb3JtYW5jZSJ9KTt2YXIgd2lkdGg9d2luZG93LmlubmVyV2lkdGg7dmFyIGhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHQ7cmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyhNYXRoLm1pbih3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb3x8MSwxLjI1KSk7cmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCxoZWlnaHQsITEpO3ZhciBzY2VuZT1uZXcgVEhSRUUuU2NlbmUoKTt2YXIgY2FtZXJhPW5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg1OCx3aWR0aC9oZWlnaHQsMC4xLDEwMCk7Y2FtZXJhLnBvc2l0aW9uLnNldCgwLDAsOC41KTtmdW5jdGlvbiBjcmVhdGVDaXJjbGVUZXh0dXJlKCl7dmFyIHNpemU9NjQ7dmFyIGNhbnZhc1RleD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJjYW52YXMiKTtjYW52YXNUZXgud2lkdGg9c2l6ZTtjYW52YXNUZXguaGVpZ2h0PXNpemU7dmFyIGN0eD1jYW52YXNUZXguZ2V0Q29udGV4dCgiMmQiKTt2YXIgZ3JhZGllbnQ9Y3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KHNpemUvMixzaXplLzIsMCxzaXplLzIsc2l6ZS8yLHNpemUvMik7Z3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsInJnYmEoMjU1LDI1NSwyNTUsMSkiKTtncmFkaWVudC5hZGRDb2xvclN0b3AoMC4zNiwicmdiYSgyNTUsMjU1LDI1NSwuODIpIik7Z3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsInJnYmEoMjU1LDI1NSwyNTUsMCkiKTtjdHguZmlsbFN0eWxlPWdyYWRpZW50O2N0eC5iZWdpblBhdGgoKTtjdHguYXJjKHNpemUvMixzaXplLzIsc2l6ZS8yLDAsTWF0aC5QSSoyKTtjdHguZmlsbCgpO3JldHVybiBuZXcgVEhSRUUuQ2FudmFzVGV4dHVyZShjYW52YXNUZXgpfQp2YXIgcGFydGljbGVUZXh0dXJlPWNyZWF0ZUNpcmNsZVRleHR1cmUoKTt2YXIgcGFydGljbGVDb3VudD13aWR0aD4xNDAwPzU2MDozODA7dmFyIHBvc2l0aW9ucz1uZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlQ291bnQqMyk7dmFyIGNvbG9ycz1uZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlQ291bnQqMyk7dmFyIHBhbGV0dGU9W25ldyBUSFJFRS5Db2xvcigweDAwZDRmZiksbmV3IFRIUkVFLkNvbG9yKDB4ZmQ1YzYyKSxuZXcgVEhSRUUuQ29sb3IoMHg5ZDRlZGQpLG5ldyBUSFJFRS5Db2xvcigweGZmZmZmZildO2Zvcih2YXIgaT0wO2k8cGFydGljbGVDb3VudDtpKyspe3ZhciB0PWkvcGFydGljbGVDb3VudDt2YXIgYW5nbGU9dCpNYXRoLlBJKjgrTWF0aC5yYW5kb20oKTt2YXIgcmFkaXVzPTEuMitNYXRoLnJhbmRvbSgpKjY7cG9zaXRpb25zW2kqM109TWF0aC5jb3MoYW5nbGUpKnJhZGl1cysoTWF0aC5yYW5kb20oKS0uNSk7cG9zaXRpb25zW2kqMysxXT1NYXRoLnNpbihhbmdsZSkqcmFkaXVzKi40NSsoTWF0aC5yYW5kb20oKS0uNSkqMy4yO3Bvc2l0aW9uc1tpKjMrMl09KE1hdGgucmFuZG9tKCktLjUpKjk7dmFyIGM9cGFsZXR0ZVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcGFsZXR0ZS5sZW5ndGgpXTtjb2xvcnNbaSozXT1jLnI7Y29sb3JzW2kqMysxXT1jLmc7Y29sb3JzW2kqMysyXT1jLmJ9CnZhciBnZW9tZXRyeT1uZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoInBvc2l0aW9uIixuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywzKSk7Z2VvbWV0cnkuc2V0QXR0cmlidXRlKCJjb2xvciIsbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShjb2xvcnMsMykpO3ZhciBtYXRlcmlhbD1uZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe3NpemU6LjA3NCxtYXA6cGFydGljbGVUZXh0dXJlLGFscGhhTWFwOnBhcnRpY2xlVGV4dHVyZSx2ZXJ0ZXhDb2xvcnM6ITAsdHJhbnNwYXJlbnQ6ITAsb3BhY2l0eTouODYsZGVwdGhXcml0ZTohMSxibGVuZGluZzpUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nfSk7dmFyIHBvaW50cz1uZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LG1hdGVyaWFsKTtzY2VuZS5hZGQocG9pbnRzKTt2YXIgcnVubmluZz0hMTt2YXIgY2xvY2s9bmV3IFRIUkVFLkNsb2NrKCk7ZnVuY3Rpb24gYW5pbWF0ZSgpe3ZhciB0aW1lPWNsb2NrLmdldEVsYXBzZWRUaW1lKCk7cG9pbnRzLnJvdGF0aW9uLnk9dGltZSouMDIyO3BvaW50cy5yb3RhdGlvbi54PU1hdGguc2luKHRpbWUqLjIyKSouMDM1O3JlbmRlcmVyLnJlbmRlcihzY2VuZSxjYW1lcmEpfQpmdW5jdGlvbiBzdGFydCgpe2lmKCFydW5uaW5nKXtydW5uaW5nPSEwO3JlbmRlcmVyLnNldEFuaW1hdGlvbkxvb3AoYW5pbWF0ZSl9fQpmdW5jdGlvbiBzdG9wKCl7aWYocnVubmluZyl7cnVubmluZz0hMTtyZW5kZXJlci5zZXRBbmltYXRpb25Mb29wKG51bGwpfX0KZnVuY3Rpb24gcmVzaXplKCl7d2lkdGg9d2luZG93LmlubmVyV2lkdGg7aGVpZ2h0PXdpbmRvdy5pbm5lckhlaWdodDtpZih3aWR0aDw5MDEpe3N0b3AoKTtjYW52YXMuc3R5bGUuZGlzcGxheT0ibm9uZSI7cmV0dXJufQpjYW52YXMuc3R5bGUuZGlzcGxheT0iYmxvY2siO2NhbWVyYS5hc3BlY3Q9d2lkdGgvaGVpZ2h0O2NhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7cmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyhNYXRoLm1pbih3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb3x8MSwxLjI1KSk7cmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCxoZWlnaHQsITEpO3N0YXJ0KCl9CndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJyZXNpemUiLHJlc2l6ZSx7cGFzc2l2ZTohMH0pO3Jlc2l6ZSgpfQpmdW5jdGlvbiBib290TW90aW9uKCl7cmV2ZWFsQ29udGVudCgpO3VwZGF0ZVNjcm9sbFZhcnMoKTtpbml0UG9pbnRlck1vdGlvbigpO2lmKGNhblVzZVdlYkdMKXtpZGxlKGZ1bmN0aW9uKCl7aWYod2luZG93LlRIUkVFKXtpbml0VGhyZWUoKTtyZXR1cm59CmxvYWRTY3JpcHQoImh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vdGhyZWVAMC4xNjAuMC9idWlsZC90aHJlZS5taW4uanMiKS50aGVuKGluaXRUaHJlZSkuY2F0Y2goZnVuY3Rpb24oKXtyb290LmNsYXNzTGlzdC5yZW1vdmUoInYxMjE1LXdlYmdsLXJlYWR5Iil9KX0pfX0KaWYoZG9jdW1lbnQucmVhZHlTdGF0ZT09PSJsb2FkaW5nIil7ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigiRE9NQ29udGVudExvYWRlZCIsYm9vdE1vdGlvbix7b25jZTohMH0pfWVsc2V7Ym9vdE1vdGlvbigpfX0pKCk=" defer></script> <script src="data:text/javascript;base64,KGZ1bmN0aW9uKCl7J3VzZSBzdHJpY3QnO2lmKHdpbmRvdy5fX0RHU19QT1JURk9MSU9fVEhVTUJfTEFaWV9GSVhFRF9fKXJldHVybjt3aW5kb3cuX19ER1NfUE9SVEZPTElPX1RIVU1CX0xBWllfRklYRURfXz0hMDt2YXIgQVVUT19USFVNQlM9ITE7ZnVuY3Rpb24gbWFrZVRodW1iVXJsKHZpZGVvVXJsKXtyZXR1cm4gdmlkZW9VcmwucmVwbGFjZSgvXC5tcDQkL2ksJy10aHVtYi53ZWJwJyl9CnZhciBwb3J0Zm9saW9EYXRhPXsibWFzY290IjpbeyJ0aXRsZSI6Ik1ha2FyIFNhbmtyYW50aSAmIFBvbmdhbCIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L01ha2FyLVNhbmtyYW50aS1BbmQtUG9uZ2FsLUZpbmFsLTEubXA0IiwiY2F0IjoiTUFTQ09UIEFJIn0seyJ0aXRsZSI6IldvbmRlciBJbnRyb2R1Y3Rpb24iLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9Xb25kZXItSW50cm9kdWN0aW9uMTEubXA0IiwiY2F0IjoiTUFTQ09UIEFJIn1dLCJmZXN0aXZhbCI6W3sidGl0bGUiOiJCYWlzYWtoaSBDZWxlYnJhdGlvbiIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L0JhaXNha2hpVjEubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifSx7InRpdGxlIjoiSGFwcHkgSG9saSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L0hhcHB5LUhvbGlfTmV3Lm1wNCIsImNhdCI6IkZFU1RJVkFMIFBPU1RTIn0seyJ0aXRsZSI6IkZlc3RpdmFsIENhbXBhaWduIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDcvTm9uLUludHJvLTEubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifSx7InRpdGxlIjoiRmVzdGl2ZSBTdG9yeSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L2ZyZWVwaWtfX2NvbnRpbnVlLXRoaXMtdmlkZW8tc2hvd2luZy10aGUtb3RoZXItbGFkeS10YWtpbmctX181MDYyNi5tcDQiLCJjYXQiOiJGRVNUSVZBTCBQT1NUUyJ9LHsidGl0bGUiOiJIYXBweSBFYXN0ZXIiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9IYXBweS1FYXN0ZXIubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifSx7InRpdGxlIjoiSGFudW1hbiBKYXlhbnRpIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDQvSGFudW1hbi1KYXlhbnRpLUZpbmFsLm1wNCIsImNhdCI6IkZFU1RJVkFMIFBPU1RTIn0seyJ0aXRsZSI6Ik5hdnJhdHJpIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDQvTmF2cmF0cmkxMS5tcDQiLCJjYXQiOiJGRVNUSVZBTCBQT1NUUyJ9LHsidGl0bGUiOiJMb2hyaSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0xvaHJpMTEubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifSx7InRpdGxlIjoiSW5kZXBlbmRlbmNlIERheSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0luZGVwZW5kZW5jZS1EYXktRGdzMTEubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifSx7InRpdGxlIjoiRnJpZW5kc2hpcCBEYXkiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9IYXBweS1GcmllbmRzaGlwLURheTExLm1wNCIsImNhdCI6IkZFU1RJVkFMIFBPU1RTIn0seyJ0aXRsZSI6IkRpd2FsaSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0Rncy1EaXdhbGkxMS5tcDQiLCJjYXQiOiJGRVNUSVZBTCBQT1NUUyJ9LHsidGl0bGUiOiJDaGlsZHJlbidzIERheSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0NoaWxkcmVuLVMtRGF5MTEubXA0IiwiY2F0IjoiRkVTVElWQUwgUE9TVFMifV0sIm15dGhvbG9naWNhbCI6W3sidGl0bGUiOiJWYWNoYWFuIDUgVGVhc2VyIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDUvVmFjaGFhbi01LVRlYXNlci5tcDQiLCJjYXQiOiJNWVRIT0xPR0lDQUwgQUkifSx7InRpdGxlIjoiU2FpIEtpIFZhYW5pIC0gRGVyciIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA1L1NhaS1LaS1WYWFuaV9EZXJyLTEubXA0IiwiY2F0IjoiTVlUSE9MT0dJQ0FMIEFJIn0seyJ0aXRsZSI6IlNhaSBLaSBWYWFuaSAtIENob290aG5lIEthIERhcnIiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNS9TYWktS2ktVmFhbmlfQ2hvb3RobmUtS2EtRGFyci0xLm1wNCIsImNhdCI6Ik1ZVEhPTE9HSUNBTCBBSSJ9LHsidGl0bGUiOiJTdW5vIFNhaSBLbyAtIFZpc2h3YXMiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNS9JbnN0YWdyYW0tRXBzaXNvZGUtNy1TdW5vLVNhaS1Lby1WaXNod2FzLTIubXA0IiwiY2F0IjoiTVlUSE9MT0dJQ0FMIEFJIn0seyJ0aXRsZSI6IlN1bm8gU2FpIEtvIC0gUHJhcnRoYW5hIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDUvSW5zdGFncmFtLUVwaXNvZGUtMTItU3Vuby1TYWktS28tUHJhcnRoYW5hLTEubXA0IiwiY2F0IjoiTVlUSE9MT0dJQ0FMIEFJIn0seyJ0aXRsZSI6IlN1bm8gU2FpIEtvIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDUvSW5zdGFncmFtLUVwaXNvZGUtMy1TdW5vLVNhaS1Lby0xLm1wNCIsImNhdCI6Ik1ZVEhPTE9HSUNBTCBBSSJ9LHsidGl0bGUiOiJTYWkgRGhhbSBJbnRyb2R1Y3Rpb24iLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9TYWktRGhhbS1JbnRyb2R1Y3Rpb25maW5hbC1OZXcubXA0IiwiY2F0IjoiTVlUSE9MT0dJQ0FMIEFJIiwid2lkZSI6ITB9XSwicHJvZHVjdCI6W3sidGl0bGUiOiJNYW5nbyBGYXJtIFByZXZpZXciLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9NYW5nby1GYXJtLVByZXZpZXcxMS5tcDQiLCJjYXQiOiJQUk9EVUNUIEFJIn0seyJ0aXRsZSI6IkxhdmEgV29tZW4iLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9MYXZhLVdvbWVuMTEubXA0IiwiY2F0IjoiUFJPRFVDVCBBSSJ9LHsidGl0bGUiOiJJY2UgQ3JlYW0gQ29uZSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0ljZS1DcmVhbS1Db25lMTEubXA0IiwiY2F0IjoiUFJPRFVDVCBBSSJ9LHsidGl0bGUiOiJXSU5OIEdyZWVuIENoaWxsaSBTYXVjZSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L0dyZWVuLUNoaWxsaTExLm1wNCIsImNhdCI6IlBST0RVQ1QgQUkifSx7InRpdGxlIjoiV0lOTiBEYXJrIFNveWEgU2F1Y2UiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9EYXJrLVNveWExMS5tcDQiLCJjYXQiOiJQUk9EVUNUIEFJIn1dLCJqZXdlbGxlcnkiOlt7InRpdGxlIjoiSmV3ZWxsZXJ5IFBvbGlzaGluZyIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L1ZpZGVvX1BvbGlzaGluZ19SZXF1ZXN0X0Z1bGZpbGxlZC5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiTHV4dXJ5IEpld2VsbGVyeSBWaXN1YWwgMyIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L1YtMy5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiTHV4dXJ5IEpld2VsbGVyeSBWaXN1YWwgMiIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L1YtMi5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiTHV4dXJ5IEpld2VsbGVyeSBBZHZlcnRpc2VtZW50IiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDcvZnJlZXBpa19jaW5lbWF0aWMtbHV4dXJ5LWpld2VscnktYWR2ZXJ0aXNlbWVudC1zY2VuZS1hbi1lbF9rbGluZ183MjBwXzMtMl8yNGZwc182NDQ1My5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiTHV4dXJ5IEpld2VsbGVyeSBFdmVudCIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L2ZyZWVwaWtfY2luZW1hdGljLWx1eHVyeS1ldmVudC1zY2VuZS1lbGVnYW50LWluZGlhbi13b21hbi1fa2xpbmdfNzIwcF8xNi05XzI0ZnBzXzY0NDUwLm1wNCIsImNhdCI6IkpFV0VMTEVSWSBBSSIsIndpZGUiOiEwfSx7InRpdGxlIjoiVHJhZGl0aW9uYWwgR29sZCBOZWNrbGFjZSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA3L2ZyZWVwaWtfX2EtY2xvc2V1cC1vZi1hLXRyYWRpdGlvbmFsLWdvbGQtbmVja2xhY2Utd2l0aC1qaHVtX181MDYzMy5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiQ3VzaGlvbiBDdXQgSmV3ZWxsZXJ5IiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDcvQ3VzaGlvbi1DdXQubXA0IiwiY2F0IjoiSkVXRUxMRVJZIEFJIn0seyJ0aXRsZSI6IlByZW1pdW0gSmV3ZWxsZXJ5IiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDQvSmV3ZWxyeTExLm1wNCIsImNhdCI6IkpFV0VMTEVSWSBBSSJ9LHsidGl0bGUiOiJCYWFuZ2FuZ2EgTGF1bmNoIiwidXJsIjoiaHR0cHM6Ly93d3cuZGdlbml1c3NvbHV0aW9ucy5jb20vd3AtY29udGVudC91cGxvYWRzLzIwMjYvMDQvQmFhbmdhbmdhLVRlc3QyMTEubXA0IiwiY2F0IjoiSkVXRUxMRVJZIEFJIiwid2lkZSI6ITB9LHsidGl0bGUiOiJCYWFuZ2FuZ2EgQ3JlYXRpdmUiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9CYWFuZ2FuZ2EtVGVzdDExMS5tcDQiLCJjYXQiOiJKRVdFTExFUlkgQUkifSx7InRpdGxlIjoiQmFhbmdhbmdhIEdvbGQiLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9CYWFuZ2FuZ2EtR29sZC1FeGFtcGxlMTEubXA0IiwiY2F0IjoiSkVXRUxMRVJZIEFJIn1dLCJjb25jZXB0IjpbeyJ0aXRsZSI6IlNhdmFnZSBIb3JzZSIsInVybCI6Imh0dHBzOi8vd3d3LmRnZW5pdXNzb2x1dGlvbnMuY29tL3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDI2LzA0L1NhdmFnZS1Ib3JzZTExLm1wNCIsImNhdCI6IkNPTkNFUFQgQUkifSx7InRpdGxlIjoiQ2FyZCBNYWdpYyBNYW4iLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9DYXJkLU1hZ2ljLU1hbjExLm1wNCIsImNhdCI6IkNPTkNFUFQgQUkifV0sInR2YyI6W3sidGl0bGUiOiJIb21lIENyZWRpdCBEaXdhbGkgQ2FtcGFpZ24iLCJ1cmwiOiJodHRwczovL3d3dy5kZ2VuaXVzc29sdXRpb25zLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAyNi8wNC9EaXdhbGktQ2FtcGFpZ24tSG9tZS1DcmVkaXQxMS5tcDQiLCJjYXQiOiJUVkMgQUkiLCJ3aWRlIjohMH1dfTt2YXIgY2F0ZWdvcnlMYWJlbHM9eyJtYXNjb3QiOiJNQVNDT1QgQUkiLCJmZXN0aXZhbCI6IkZFU1RJVkFMIFBPU1RTIiwibXl0aG9sb2dpY2FsIjoiTVlUSE9MT0dJQ0FMIEFJIiwicHJvZHVjdCI6IlBST0RVQ1QgQUkiLCJqZXdlbGxlcnkiOiJKRVdFTExFUlkgQUkiLCJjb25jZXB0IjoiQ09OQ0VQVCBBSSIsInR2YyI6IlRWQyBBSSJ9O3ZhciBhbGxWaWRlb3M9W107T2JqZWN0LmtleXMocG9ydGZvbGlvRGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpe3BvcnRmb2xpb0RhdGFba2V5XS5mb3JFYWNoKGZ1bmN0aW9uKHZpZGVvKXthbGxWaWRlb3MucHVzaChPYmplY3QuYXNzaWduKHt9LHZpZGVvLHtjYXRlZ29yeTprZXksbGFiZWw6Y2F0ZWdvcnlMYWJlbHNba2V5XX0pKX0pfSk7dmFyIGN1cnJlbnRseURpc3BsYXllZD0wO3ZhciBpdGVtc1BlckxvYWQ9d2luZG93Lm1hdGNoTWVkaWEmJndpbmRvdy5tYXRjaE1lZGlhKCcobWF4LXdpZHRoOiA3NjdweCknKS5tYXRjaGVzPzQ6ODt2YXIgY3VycmVudEluZGV4PTA7dmFyIGxpZ2h0Ym94SGFzSGlzdG9yeVN0YXRlPSExO3ZhciBzY3JvbGxQb3NpdGlvbkJlZm9yZUxpZ2h0Ym94PTA7dmFyIFBMQVlfU1ZHPSc8c3ZnIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCA1djE0bDExLTd6Ii8+PC9zdmc+JztmdW5jdGlvbiBlc2NhcGVIVE1MKHZhbHVlKXtyZXR1cm4gU3RyaW5nKHZhbHVlfHwnJykucmVwbGFjZSgvWyY8PiInXS9nLGZ1bmN0aW9uKGNoYXIpe3JldHVybnsnJic6JyZhbXA7JywnPCc6JyZsdDsnLCc+JzonJmd0OycsJyInOicmcXVvdDsnLCInIjonJiMwMzk7J31bY2hhcl19KX0KZnVuY3Rpb24gZ2V0TWltZVR5cGUodXJsKXtyZXR1cm4vXC53ZWJtJC9pLnRlc3QodXJsKT8ndmlkZW8vd2VibSc6J3ZpZGVvL21wNCd9CmZ1bmN0aW9uIGdldFRodW1iKHZpZGVvKXtpZih2aWRlby50aHVtYilyZXR1cm4gdmlkZW8udGh1bWI7aWYoQVVUT19USFVNQlMpcmV0dXJuIG1ha2VUaHVtYlVybCh2aWRlby51cmwpO3JldHVybicnfQpmdW5jdGlvbiBpbWFnZUhUTUwodmlkZW8saXNXaWRlKXt2YXIgdGl0bGU9ZXNjYXBlSFRNTCh2aWRlby50aXRsZSk7dmFyIGxhYmVsPWVzY2FwZUhUTUwodmlkZW8ubGFiZWx8fHZpZGVvLmNhdHx8JycpO3ZhciB0aHVtYj1nZXRUaHVtYih2aWRlbyk7dmFyIHBvc3RlckF0dHJpYnV0ZT10aHVtYj8nIHBvc3Rlcj0iJytlc2NhcGVIVE1MKHRodW1iKSsnIic6Jyc7cmV0dXJuJzxkaXYgY2xhc3M9InRodW1iLWZhbGxiYWNrIj48L2Rpdj4nKyc8dmlkZW8gY2xhc3M9InRodW1iLXZpZGVvIiBtdXRlZCBwbGF5c2lubGluZSB3ZWJraXQtcGxheXNpbmxpbmUgcHJlbG9hZD0iYXV0byInK3Bvc3RlckF0dHJpYnV0ZSsnIGFyaWEtbGFiZWw9IicrdGl0bGUrJyAnK2xhYmVsKycgcHJldmlldyIgdGFiaW5kZXg9Ii0xIiBkaXNhYmxlcGljdHVyZWlucGljdHVyZSBjb250cm9sc2xpc3Q9Im5vZG93bmxvYWQiPicrJzxzb3VyY2Ugc3JjPSInK2VzY2FwZUhUTUwodmlkZW8udXJsKSsnI3Q9MC4wOCIgdHlwZT0iJytnZXRNaW1lVHlwZSh2aWRlby51cmwpKyciPicrJzwvdmlkZW8+J30KZnVuY3Rpb24gY3JlYXRlQ2FyZCh2aWRlbyxpbmRleCxpc0Nhc2VTdHVkeSl7dmFyIGlzV2lkZT0hIXZpZGVvLndpZGU7dmFyIGRpdj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtkaXYuY2xhc3NOYW1lPWlzQ2FzZVN0dWR5PydjYXNlLXN0dWR5LWl0ZW0nKyhpc1dpZGU/JyB3aWRlLWl0ZW0nOicnKTonZ2FsbGVyeS1pdGVtJysoaXNXaWRlPycgd2lkZS1pdGVtJzonJyk7ZGl2LnNldEF0dHJpYnV0ZSgncm9sZScsJ2J1dHRvbicpO2Rpdi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywnMCcpO2Rpdi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCdQbGF5ICcrdmlkZW8udGl0bGUpO3ZhciB0aXRsZT1lc2NhcGVIVE1MKHZpZGVvLnRpdGxlKTt2YXIgbGFiZWw9ZXNjYXBlSFRNTCh2aWRlby5sYWJlbHx8dmlkZW8uY2F0fHwnJyk7dmFyIHBsYXlPdmVybGF5PSc8ZGl2IGNsYXNzPSJwbGF5LWJ0bi1vdmVybGF5Ij4nKyc8ZGl2IGNsYXNzPSJwbGF5LWJ0bi1jaXJjbGUiPicrUExBWV9TVkcrJzwvZGl2PicrJzwvZGl2Pic7aWYoaXNDYXNlU3R1ZHkpe2Rpdi5pbm5lckhUTUw9JzxkaXYgY2xhc3M9InZpZGVvLXdyYXBwZXIiPicraW1hZ2VIVE1MKHZpZGVvLGlzV2lkZSkrcGxheU92ZXJsYXkrJzwvZGl2PicrJzxkaXYgc3R5bGU9InBhZGRpbmc6Y2xhbXAoMTJweCwydncsMTVweCk7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuOCkiPicrJzxwIHN0eWxlPSJmb250LXNpemU6Y2xhbXAoMC42cmVtLDEuMnZ3LDAuNjVyZW0pO2NvbG9yOnJnYmEoMjU1LDI1NSwyNTUsMC42KTttYXJnaW4tYm90dG9tOjVweDt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7bGV0dGVyLXNwYWNpbmc6Y2xhbXAoMS41cHgsMC4zdncsMnB4KTtmb250LWZhbWlseTpcJ01hbnJvcGVcJyxzYW5zLXNlcmlmIj4nK2xhYmVsKyc8L3A+JysnPHAgc3R5bGU9ImZvbnQtc2l6ZTpjbGFtcCgwLjg1cmVtLDEuOHZ3LDAuOTVyZW0pO2NvbG9yOiNmZmY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtZmFtaWx5OlwnTWFucm9wZVwnLHNhbnMtc2VyaWY7bWFyZ2luOjAiPicrdGl0bGUrJzwvcD4nKyc8L2Rpdj4nfWVsc2V7ZGl2LmlubmVySFRNTD1pbWFnZUhUTUwodmlkZW8saXNXaWRlKStwbGF5T3ZlcmxheSsnPGRpdiBjbGFzcz0idmlkZW8tb3ZlcmxheSI+JysnPHAgc3R5bGU9ImZvbnQtc2l6ZTpjbGFtcCgwLjU1cmVtLDEuMnZ3LDAuNnJlbSk7Zm9udC13ZWlnaHQ6NzAwO2xldHRlci1zcGFjaW5nOmNsYW1wKDEuNXB4LDAuM3Z3LDJweCk7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwwLjYpO21hcmdpbi1ib3R0b206NXB4O3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtmb250LWZhbWlseTpcJ01hbnJvcGVcJyxzYW5zLXNlcmlmIj4nK2xhYmVsKyc8L3A+JysnPGgzIHN0eWxlPSJmb250LXNpemU6Y2xhbXAoMC43NXJlbSwxLjV2dywwLjg1cmVtKTtmb250LXdlaWdodDo3MDA7Y29sb3I6I2ZmZjttYXJnaW46MDtmb250LWZhbWlseTpcJ01hbnJvcGVcJyxzYW5zLXNlcmlmIj4nK3RpdGxlKyc8L2gzPicrJzwvZGl2Pid9CmRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZnVuY3Rpb24oKXtvcGVuTGlnaHRib3goaW5kZXgpfSk7ZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLGZ1bmN0aW9uKGUpe2lmKGUua2V5PT09J0VudGVyJ3x8ZS5rZXk9PT0nICcpe2UucHJldmVudERlZmF1bHQoKTtvcGVuTGlnaHRib3goaW5kZXgpfX0pO3JldHVybiBkaXZ9CnZhciB0aHVtYm5haWxRdWV1ZT1bXTt2YXIgdGh1bWJuYWlsTG9hZHNBY3RpdmU9MDt2YXIgTUFYX1RIVU1CTkFJTF9MT0FEUz00O2Z1bmN0aW9uIHJ1blRodW1ibmFpbFF1ZXVlKCl7d2hpbGUodGh1bWJuYWlsTG9hZHNBY3RpdmU8TUFYX1RIVU1CTkFJTF9MT0FEUyYmdGh1bWJuYWlsUXVldWUubGVuZ3RoKXtsZXQgam9iPXRodW1ibmFpbFF1ZXVlLnNoaWZ0KCk7bGV0IGNhcmQ9am9iLmNhcmQ7bGV0IHByZXZpZXc9am9iLnByZXZpZXc7aWYoIWNhcmR8fCFwcmV2aWV3fHxjYXJkLmRhdGFzZXQudGh1bWJSZWFkeT09PScxJyljb250aW51ZTt0aHVtYm5haWxMb2Fkc0FjdGl2ZSsrO2NhcmQuZGF0YXNldC50aHVtYkxvYWRpbmc9JzEnO3ByZXZpZXcucHJlbG9hZD0nYXV0byc7cHJldmlldy5tdXRlZD0hMDtwcmV2aWV3LmRlZmF1bHRNdXRlZD0hMDtwcmV2aWV3LnBsYXlzSW5saW5lPSEwO3ByZXZpZXcuc2V0QXR0cmlidXRlKCdwbGF5c2lubGluZScsJycpO3ByZXZpZXcuc2V0QXR0cmlidXRlKCd3ZWJraXQtcGxheXNpbmxpbmUnLCcnKTtsZXQgZmluaXNoZWQ9ITE7ZnVuY3Rpb24gZmluaXNoKHN1Y2Nlc3Mpe2lmKGZpbmlzaGVkKXJldHVybjtmaW5pc2hlZD0hMDt0aHVtYm5haWxMb2Fkc0FjdGl2ZT1NYXRoLm1heCgwLHRodW1ibmFpbExvYWRzQWN0aXZlLTEpO2NhcmQuZGF0YXNldC50aHVtYkxvYWRpbmc9JzAnO2lmKHN1Y2Nlc3Mpe2NhcmQuZGF0YXNldC50aHVtYlJlYWR5PScxJztjYXJkLmNsYXNzTGlzdC5hZGQoJ3ZpZGVvLXJlYWR5Jyk7dHJ5e3ByZXZpZXcucGF1c2UoKX1jYXRjaChlKXt9fQpydW5UaHVtYm5haWxRdWV1ZSgpfQpmdW5jdGlvbiBzaG93RnJhbWUoKXtpZihwcmV2aWV3LnJlYWR5U3RhdGU+PTIpZmluaXNoKCEwKTt9CnByZXZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkZGF0YScsc2hvd0ZyYW1lLHtvbmNlOiEwfSk7cHJldmlldy5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5JyxzaG93RnJhbWUse29uY2U6ITB9KTtwcmV2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ3NlZWtlZCcsc2hvd0ZyYW1lLHtvbmNlOiEwfSk7cHJldmlldy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsZnVuY3Rpb24oKXtmaW5pc2goITEpfSx7b25jZTohMH0pO3ByZXZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkbWV0YWRhdGEnLGZ1bmN0aW9uKCl7dHJ5e3ZhciB0YXJnZXQ9TWF0aC5taW4oMC4wOCxNYXRoLm1heCgocHJldmlldy5kdXJhdGlvbnx8MCkvMjAsMC4wMSkpO2lmKGlzRmluaXRlKHRhcmdldCkpcHJldmlldy5jdXJyZW50VGltZT10YXJnZXR9Y2F0Y2goZSl7fX0se29uY2U6ITB9KTt0cnl7cHJldmlldy5sb2FkKCk7dmFyIHBsYXlQcm9taXNlPXByZXZpZXcucGxheSgpO2lmKHBsYXlQcm9taXNlJiZ0eXBlb2YgcGxheVByb21pc2UudGhlbj09PSdmdW5jdGlvbicpe3BsYXlQcm9taXNlLnRoZW4oZnVuY3Rpb24oKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dHJ5e3ByZXZpZXcucGF1c2UoKX1jYXRjaChlKXt9CnNob3dGcmFtZSgpfSw5MCl9KS5jYXRjaChmdW5jdGlvbigpe30pfX1jYXRjaChlKXtmaW5pc2goITEpfQpzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2hvd0ZyYW1lKCl9LDI1MDApfX0KZnVuY3Rpb24gcHJlcGFyZUNhcmRWaWRlbyhjYXJkLHByaW9yaXR5KXt2YXIgcHJldmlldz1jYXJkLnF1ZXJ5U2VsZWN0b3IoJy50aHVtYi12aWRlbycpO2lmKCFwcmV2aWV3fHxjYXJkLmRhdGFzZXQudGh1bWJRdWV1ZWQ9PT0nMSd8fGNhcmQuZGF0YXNldC50aHVtYlJlYWR5PT09JzEnKXJldHVybjtjYXJkLmRhdGFzZXQudGh1bWJRdWV1ZWQ9JzEnO3ZhciBqb2I9e2NhcmQ6Y2FyZCxwcmV2aWV3OnByZXZpZXd9O2lmKHByaW9yaXR5KXRodW1ibmFpbFF1ZXVlLnVuc2hpZnQoam9iKTtlbHNlIHRodW1ibmFpbFF1ZXVlLnB1c2goam9iKTtydW5UaHVtYm5haWxRdWV1ZSgpfQpmdW5jdGlvbiBwcmVsb2FkQWxsUG9ydGZvbGlvVmlkZW9zKCl7dmFyIGFjdGl2ZVZpZXc9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQtdmlldy5hY3RpdmUtdmlldycpO2lmKCFhY3RpdmVWaWV3KXJldHVybjthY3RpdmVWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYWxsZXJ5LWl0ZW0sIC5jYXNlLXN0dWR5LWl0ZW0nKS5mb3JFYWNoKGZ1bmN0aW9uKGNhcmQsaW5kZXgpe3ByZXBhcmVDYXJkVmlkZW8oY2FyZCxpbmRleDw4KX0pfQpmdW5jdGlvbiBsb2FkTW9yZUl0ZW1zKCl7dmFyIG1haW5HYWxsZXJ5PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3J0Zm9saW8tZ2FsbGVyeScpO3ZhciBsb2FkQnRuPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkLW1vcmUtYnRuJyk7aWYoIW1haW5HYWxsZXJ5fHwhbG9hZEJ0bilyZXR1cm47dmFyIGZyYWdtZW50PWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTt2YXIgc3RhcnQ9Y3VycmVudGx5RGlzcGxheWVkO3ZhciBlbmQ9TWF0aC5taW4oc3RhcnQraXRlbXNQZXJMb2FkLGFsbFZpZGVvcy5sZW5ndGgpO2Zvcih2YXIgaT1zdGFydDtpPGVuZDtpKyspe2ZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUNhcmQoYWxsVmlkZW9zW2ldLGksITEpKX0KbWFpbkdhbGxlcnkuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO21haW5HYWxsZXJ5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYWxsZXJ5LWl0ZW0nKS5mb3JFYWNoKHByZXBhcmVDYXJkVmlkZW8pO2N1cnJlbnRseURpc3BsYXllZD1lbmQ7aWYoY3VycmVudGx5RGlzcGxheWVkPj1hbGxWaWRlb3MubGVuZ3RoKXtsb2FkQnRuLnRleHRDb250ZW50PSdBTEwgTE9BREVEJztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bG9hZEJ0bi5zdHlsZS5kaXNwbGF5PSdub25lJ30sMTIwMCl9ZWxzZXtsb2FkQnRuLnRleHRDb250ZW50PSdMT0FEIE1PUkUgKCcrKGFsbFZpZGVvcy5sZW5ndGgtY3VycmVudGx5RGlzcGxheWVkKSsnIHJlbWFpbmluZyknfX0KZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcnkoY2F0ZWdvcnlLZXkpe2lmKGNhdGVnb3J5S2V5PT09J2FsbCcpcmV0dXJuO3ZhciBjb250YWluZXI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2F0ZWdvcnlLZXkrJy1nYWxsZXJ5Jyk7aWYoIWNvbnRhaW5lcnx8Y29udGFpbmVyLmNoaWxkcmVuLmxlbmd0aD4wfHwhcG9ydGZvbGlvRGF0YVtjYXRlZ29yeUtleV0pcmV0dXJuO3ZhciBmcmFnbWVudD1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7cG9ydGZvbGlvRGF0YVtjYXRlZ29yeUtleV0uZm9yRWFjaChmdW5jdGlvbih2aWRlbyl7dmFyIGluZGV4PWFsbFZpZGVvcy5maW5kSW5kZXgoZnVuY3Rpb24odil7cmV0dXJuIHYudXJsPT09dmlkZW8udXJsfSk7dmFyIGVucmljaGVkPU9iamVjdC5hc3NpZ24oe30sdmlkZW8se2xhYmVsOmNhdGVnb3J5TGFiZWxzW2NhdGVnb3J5S2V5XSxjYXRlZ29yeTpjYXRlZ29yeUtleX0pO2ZyYWdtZW50LmFwcGVuZENoaWxkKGNyZWF0ZUNhcmQoZW5yaWNoZWQsaW5kZXgsITApKX0pO2NvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7Y29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYXNlLXN0dWR5LWl0ZW0nKS5mb3JFYWNoKHByZXBhcmVDYXJkVmlkZW8pfQpmdW5jdGlvbiBzZXRMaWdodGJveFZpZGVvKGluZGV4KXtjdXJyZW50SW5kZXg9KGluZGV4K2FsbFZpZGVvcy5sZW5ndGgpJWFsbFZpZGVvcy5sZW5ndGg7dmFyIGl0ZW09YWxsVmlkZW9zW2N1cnJlbnRJbmRleF07dmFyIHBsYXllcj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlnaHRib3gtcGxheWVyJyk7aWYoIXBsYXllcnx8IWl0ZW0pcmV0dXJuO3BsYXllci5wYXVzZSgpO3BsYXllci5yZW1vdmVBdHRyaWJ1dGUoJ3NyYycpO3doaWxlKHBsYXllci5maXJzdENoaWxkKXtwbGF5ZXIucmVtb3ZlQ2hpbGQocGxheWVyLmZpcnN0Q2hpbGQpfQpwbGF5ZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtbGFuZHNjYXBlJywnaXMtcG9ydHJhaXQnKTtwbGF5ZXIucHJlbG9hZD0nYXV0byc7dmFyIHNvdXJjZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKTtzb3VyY2Uuc3JjPWl0ZW0udXJsO3NvdXJjZS50eXBlPWdldE1pbWVUeXBlKGl0ZW0udXJsKTtwbGF5ZXIuYXBwZW5kQ2hpbGQoc291cmNlKTtwbGF5ZXIub25sb2FkZWRtZXRhZGF0YT1mdW5jdGlvbigpe3ZhciByYXRpbz1wbGF5ZXIudmlkZW9XaWR0aCYmcGxheWVyLnZpZGVvSGVpZ2h0P3BsYXllci52aWRlb1dpZHRoL3BsYXllci52aWRlb0hlaWdodDooaXRlbS53aWRlPzE2Lzk6OS8xNik7cGxheWVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWxhbmRzY2FwZScscmF0aW8+PTEuMik7cGxheWVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLXBvcnRyYWl0JyxyYXRpbzwxLjIpfTtwbGF5ZXIubG9hZCgpO2Z1bmN0aW9uIHBsYXlOb3coKXtwbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheScscGxheU5vdyk7cGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRlZGRhdGEnLHBsYXlOb3cpO3BsYXllci5tdXRlZD0hMTtwbGF5ZXIudm9sdW1lPTE7cGxheWVyLnBsYXkoKS5jYXRjaChmdW5jdGlvbigpe30pfQpwbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScscGxheU5vdyk7cGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlZGRhdGEnLHBsYXlOb3cpfQpmdW5jdGlvbiBnb0xpZ2h0Ym94KGRpcmVjdGlvbil7c2V0TGlnaHRib3hWaWRlbyhjdXJyZW50SW5kZXgrZGlyZWN0aW9uKX0KZnVuY3Rpb24gaW50ZXJuYWxDbG9zZUxpZ2h0Ym94KCl7dmFyIGxpZ2h0Ym94PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaWdodGJveCcpO3ZhciBwbGF5ZXI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpZ2h0Ym94LXBsYXllcicpO2lmKCFsaWdodGJveHx8IXBsYXllcilyZXR1cm47cGxheWVyLnBhdXNlKCk7cGxheWVyLnJlbW92ZUF0dHJpYnV0ZSgnc3JjJyk7d2hpbGUocGxheWVyLmZpcnN0Q2hpbGQpe3BsYXllci5yZW1vdmVDaGlsZChwbGF5ZXIuZmlyc3RDaGlsZCl9CnRyeXtwbGF5ZXIubG9hZCgpfWNhdGNoKGUpe30KbGlnaHRib3guY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtsaWdodGJveC5zdHlsZS5kaXNwbGF5PScnO2RvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5vdmVyZmxvdz0nJztkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93PScnO2RvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbGlnaHRib3gtb3BlbicpO3dpbmRvdy5zY3JvbGxUbygwLHNjcm9sbFBvc2l0aW9uQmVmb3JlTGlnaHRib3gpfSwyNDApfQpmdW5jdGlvbiBvcGVuTGlnaHRib3goaW5kZXgpe3Njcm9sbFBvc2l0aW9uQmVmb3JlTGlnaHRib3g9d2luZG93LnBhZ2VZT2Zmc2V0fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO3ZhciBsaWdodGJveD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlnaHRib3gnKTtpZighbGlnaHRib3h8fCFhbGxWaWRlb3MubGVuZ3RoKXJldHVybjtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUub3ZlcmZsb3c9J2hpZGRlbic7ZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdz0naGlkZGVuJztkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2xpZ2h0Ym94LW9wZW4nKTtpZignc2Nyb2xsUmVzdG9yYXRpb24nIGluIGhpc3Rvcnkpe2hpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb249J21hbnVhbCd9CmlmKCFsaWdodGJveEhhc0hpc3RvcnlTdGF0ZSl7aGlzdG9yeS5wdXNoU3RhdGUoe2xpZ2h0Ym94OiEwfSwnJyx3aW5kb3cubG9jYXRpb24uaHJlZik7bGlnaHRib3hIYXNIaXN0b3J5U3RhdGU9ITB9CmxpZ2h0Ym94LnN0eWxlLmRpc3BsYXk9J2ZsZXgnO3JlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe2xpZ2h0Ym94LmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKX0pO3NldExpZ2h0Ym94VmlkZW8oaW5kZXgpfQpmdW5jdGlvbiBjbG9zZUxpZ2h0Ym94KCl7aWYobGlnaHRib3hIYXNIaXN0b3J5U3RhdGUpe2hpc3RvcnkuYmFjaygpfWVsc2V7aW50ZXJuYWxDbG9zZUxpZ2h0Ym94KCl9fQp3aW5kb3cub3BlbkxpZ2h0Ym94PW9wZW5MaWdodGJveDt2YXIgcG9ydGZvbGlvSW5pdGlhbGl6ZWQ9ITE7ZnVuY3Rpb24gaW5pdFBvcnRmb2xpbygpe2lmKHBvcnRmb2xpb0luaXRpYWxpemVkKXJldHVybjtwb3J0Zm9saW9Jbml0aWFsaXplZD0hMDtsb2FkTW9yZUl0ZW1zKCk7cHJlbG9hZEFsbFBvcnRmb2xpb1ZpZGVvcygpO3ZhciBsb2FkQnRuPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkLW1vcmUtYnRuJyk7aWYobG9hZEJ0bil7bG9hZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO2xvYWRNb3JlSXRlbXMoKX0pfQpkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucG9ydGZvbGlvLWZpbHRlci10YWInKS5mb3JFYWNoKGZ1bmN0aW9uKHRhYil7dGFiLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jdGlvbihlKXtlLnByZXZlbnREZWZhdWx0KCk7dmFyIGNhdGVnb3J5S2V5PXRhYi5nZXRBdHRyaWJ1dGUoJ2hyZWYnKS5yZXBsYWNlKCcjJywnJyk7dmFyIHRhcmdldElkPXRhYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFyZ2V0Jyk7ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBvcnRmb2xpby1maWx0ZXItdGFiJykuZm9yRWFjaChmdW5jdGlvbih0KXt0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO3Quc3R5bGUuY29sb3I9J3JnYmEoMjU1LDI1NSwyNTUsMC41KSc7dmFyIHNwYW49dC5xdWVyeVNlbGVjdG9yKCdzcGFuJyk7aWYoc3BhbilzcGFuLnN0eWxlLm9wYWNpdHk9JzAnfSk7dGFiLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO3RhYi5zdHlsZS5jb2xvcj0nI2ZmZmZmZic7dmFyIGFjdGl2ZVNwYW49dGFiLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKTtpZihhY3RpdmVTcGFuKWFjdGl2ZVNwYW4uc3R5bGUub3BhY2l0eT0nMSc7ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvbnRlbnQtdmlldycpLmZvckVhY2goZnVuY3Rpb24odmlldyl7dmlldy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtdmlldycpfSk7dmFyIHRhcmdldD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRJZCk7aWYodGFyZ2V0KXt0YXJnZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlLXZpZXcnKTtyZW5kZXJDYXRlZ29yeShjYXRlZ29yeUtleSl9fSl9KTt2YXIgY2xvc2VCdG49ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpZ2h0Ym94LWNsb3NlJyk7dmFyIHByZXZCdG49ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpZ2h0Ym94LXByZXYnKTt2YXIgbmV4dEJ0bj1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlnaHRib3gtbmV4dCcpO3ZhciBsaWdodGJveD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlnaHRib3gnKTtpZihjbG9zZUJ0bil7Y2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGNsb3NlTGlnaHRib3gpfQppZihwcmV2QnRuKXtwcmV2QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJyxmdW5jdGlvbihlKXtlLnN0b3BQcm9wYWdhdGlvbigpO2dvTGlnaHRib3goLTEpfSl9CmlmKG5leHRCdG4pe25leHRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7Z29MaWdodGJveCgxKX0pfQppZihsaWdodGJveCl7bGlnaHRib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLGZ1bmN0aW9uKGUpe2lmKGUudGFyZ2V0PT09bGlnaHRib3gpe2Nsb3NlTGlnaHRib3goKX19KX0KZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsZnVuY3Rpb24oZSl7dmFyIGxiPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaWdodGJveCcpO2lmKGxiJiZsYi5zdHlsZS5kaXNwbGF5PT09J2ZsZXgnKXtpZihlLmtleT09PSdFc2NhcGUnKWNsb3NlTGlnaHRib3goKTtpZihlLmtleT09PSdBcnJvd0xlZnQnKWdvTGlnaHRib3goLTEpO2lmKGUua2V5PT09J0Fycm93UmlnaHQnKWdvTGlnaHRib3goMSk7fX0pO3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsZnVuY3Rpb24oKXt2YXIgbGI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpZ2h0Ym94Jyk7aWYobGImJmxiLnN0eWxlLmRpc3BsYXk9PT0nZmxleCcpe2ludGVybmFsQ2xvc2VMaWdodGJveCgpO2xpZ2h0Ym94SGFzSGlzdG9yeVN0YXRlPSExfX0pfQppZihkb2N1bWVudC5yZWFkeVN0YXRlPT09J2xvYWRpbmcnKXtkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJyxpbml0UG9ydGZvbGlvKX1lbHNle2luaXRQb3J0Zm9saW8oKX19KSgp" defer></script> <style>/* =====================================================
   DGS FINAL CENTER-BALANCED HEADING ALIGNMENT
   Reference style: centered heading + centered paragraph
   Fixes the Trusted By 200+ Brands section and other headings
   Paste priority: placed at the very bottom to override old left patches
===================================================== */

/* Global section heading alignment like reference image */
.dgs-v1215 .dgs-v1215-section-head{
  width: min(100%, 1240px) !important;
  max-width: 1240px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215 .dgs-v1215-section-head .dgs-v1215-section-kicker{
  margin-left: auto !important;
  margin-right: auto !important;
  justify-content: center !important;
}

.dgs-v1215 .dgs-v1215-section-head h2,
.dgs-v1215 .dgs-v1215-section-head p{
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

/* Trusted By 200+ Brands section: balanced center block */
.dgs-v1215-proof-stack .dgs-v1215-section-head{
  width: min(100%, 1280px) !important;
  max-width: 1280px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}

.dgs-v1215-proof-stack .dgs-v1215-section-head h2{
  max-width: 1240px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
  font-size: clamp(3.2rem, 5vw, 6.1rem) !important;
  line-height: 1.04 !important;
  letter-spacing: -0.06em !important;
  text-wrap: balance !important;
}

.dgs-v1215-proof-stack .dgs-v1215-section-head p{
  max-width: 980px !important;
  margin: 24px auto 0 !important;
  text-align: center !important;
  text-wrap: pretty !important;
}

/* Keep logo table full-width and clean below centered heading */
.dgs-v1215-proof-stack .dgs-v1215-logo-marquee{
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Hero remains natural left layout because it is a two-column hero */
.dgs-v1215-copy,
.dgs-v1215-copy h1,
.dgs-v1215-copy p{
  text-align: left !important;
}

/* Card text remains readable */
.dgs-v1215-service-menu article,
.dgs-v1215-award-body,
.dgs-v1215-case-content,
.dgs-v1215-case-mini,
.dgs-v1215-testimonial-card,
.dgs-v1215-authority-card,
.dgs-v1215-proof-strip article,
.dgs-v1215-faq-grid details,
.dgs-ai-service-copy,
.dgs-ai-service-points article,
.dgs-v1215-final-card,
.dgs-v1215-final-card h2,
.dgs-v1215-final-card p{
  text-align: left !important;
}

/* Industry chips centered under centered heading */
.dgs-v1215-industries .dgs-v1215-industry-pills{
  justify-content: center !important;
}

/* Portfolio tabs remain natural horizontal navigation */
.portfolio-filters{
  justify-content: flex-start !important;
  text-align: left !important;
}

/* Logo tiles stay centered */
.dgs-v1215-logo-tile,
.dgs-v1215-logo-tile.dgs-v1215-logo-text{
  text-align: center !important;
  justify-content: center !important;
  align-items: center !important;
}

/* Tablet */
@media(max-width:1180px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215-proof-stack .dgs-v1215-section-head{
    width: min(100%, 1040px) !important;
    max-width: 1040px !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head h2{
    max-width: 980px !important;
    font-size: clamp(3rem, 7vw, 5.4rem) !important;
    line-height: 1.06 !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    max-width: 820px !important;
  }
}

/* Mobile */
@media(max-width:767px){
  .dgs-v1215 .dgs-v1215-section-head,
  .dgs-v1215 .dgs-v1215-section-head h2,
  .dgs-v1215 .dgs-v1215-section-head p,
  .dgs-v1215-proof-stack .dgs-v1215-section-head,
  .dgs-v1215-proof-stack .dgs-v1215-section-head h2,
  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    width: 100% !important;
    max-width: 100% !important;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head h2{
    font-size: clamp(2.6rem, 11vw, 4rem) !important;
    line-height: 1.08 !important;
    letter-spacing: -0.055em !important;
  }

  .dgs-v1215-proof-stack .dgs-v1215-section-head p{
    font-size: 15px !important;
    line-height: 1.65 !important;
  }

  .dgs-v1215-industries .dgs-v1215-industry-pills{
    justify-content: center !important;
  }

  .dgs-v1215-final-card,
  .dgs-v1215-final-card h2,
  .dgs-v1215-final-card p{
    text-align: left !important;
  }

  .dgs-v1215-final-card > .dgs-v1215-btn{
    text-align: center !important;
    justify-content: center !important;
  }
}</style><style id="dgs-weavings-live-header-fix">/* =====================================================
   WEAVINGS CASE STUDY LIVE VIEW FIX
   Fixes live published view where the Weavings screenshot
   can get cropped/cached differently from Elementor preview.
   Only targets the Weavings case card.
===================================================== */
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
  height: clamp(300px, 18.5vw, 370px) !important;
  overflow: hidden !important;
  background: #050505 !important;
}

.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media img.dgs-weavings-live-img,
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media > img.dgs-weavings-live-img{
  width: 100% !important;
  height: 100% !important;
  min-width: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: top center !important;
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
  filter: none !important;
}

.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media picture,
.dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media picture img{
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}

@media(max-width:1180px){
  .dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
    height: 320px !important;
  }
}

@media(max-width:767px){
  .dgs-v1215 .dgs-weavings-case-card .dgs-weavings-case-media{
    height: 250px !important;
  }
}</style><style id="dgs-video-thumbnail-frame-fix">.thumb-video{
  opacity:0 !important;
  visibility:visible !important;
}
.gallery-item.video-ready .thumb-video,
.case-study-item.video-ready .thumb-video{
  opacity:1 !important;
}
.gallery-item.video-ready .thumb-fallback,
.case-study-item.video-ready .thumb-fallback{
  opacity:0 !important;
}</style></div></div></div><div class="xs_social_share_widget xs_share_url after_content 		main_content  wslu-style-1 wslu-share-box-shaped wslu-fill-colored wslu-none wslu-share-horizontal wslu-theme-font-no wslu-main_content"><ul></ul></div><div class="cmsmasters-single-comments cmsmasters-section-container"></div></div></div></div></div></main>` }} />
      <Footer />
    </>
  );
}
