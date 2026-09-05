import { rewriteWpUrls } from "@/lib/wp-exact/rewrite-wp-urls";
import { applyApprovedLinkCorrectionsToHtml } from "./apply-mirror-link-corrections";
import {
  markElementorBackgroundsReady,
  replaceEnviraWrapWithNativeMount,
  stripCapturedFooters,
  unwrapMirrorLazyMedia,
} from "./native-inner-fixes";
import type { InnerPageMirrorContent } from "./inner-mirror-types";

export type PreparedInnerPageMirror = InnerPageMirrorContent & {
  articleHtml: string;
  combinedStyles: string;
};

function stripLeadingCloseTags(html: string): string {
  return html.replace(/^(?:\s*<\/(?:div|header|section|main|span|nav|aside)>)+/i, "").trim();
}

function lazyBelowFold(html: string): string {
  let count = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    count += 1;
    if (count <= 2) {
      return tag
        .replace(/\bloading=["']lazy["']/i, 'loading="eager"')
        .replace(/<img/i, count === 1 ? '<img fetchpriority="high"' : "<img");
    }
    if (!/\bloading=/i.test(tag)) {
      return tag.replace(/<img/i, '<img loading="lazy"');
    }
    return tag;
  });
}

const SHIRDI_CASE_STUDY_PATH = "/services/shirdi-se-sai-tak-case-study/";

const SHIRDI_GALLERY_HTML = [
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Vachaan 5 Teaser AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Vachaan 5 Teaser AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SHIRDI SE SAI TAK</small><h3>Vachaan 5 Teaser AI Avatar Video</h3></div></div></div>',
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Sai Ki Vaani - Derr AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Sai Ki Vaani - Derr AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SAI KI VAANI</small><h3>Sai Ki Vaani - Derr AI Avatar Video</h3></div></div></div>',
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Sai Ki Vaani - Choothne Ka Darr AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Sai Ki Vaani - Choothne Ka Darr AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SAI KI VAANI</small><h3>Sai Ki Vaani - Choothne Ka Darr AI Avatar Video</h3></div></div></div>',
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Suno Sai Ko Vishwas Episode 7 AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Suno Sai Ko Vishwas Episode 7 AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SUNO SAI KO</small><h3>Suno Sai Ko Vishwas Episode 7 AI Avatar Video</h3></div></div></div>',
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Suno Sai Ko Prarthana Episode 12 AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Suno Sai Ko Prarthana Episode 12 AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SUNO SAI KO</small><h3>Suno Sai Ko Prarthana Episode 12 AI Avatar Video</h3></div></div></div>',
  '<div class="case-study-item" role="button" tabindex="0" aria-label="Play Suno Sai Ko Episode 3 AI Avatar Video" data-video-src="/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4"><div class="video-wrapper"><div class="thumb-fallback"></div><video class="thumb-video first-frame-thumb is-ready" width="480" height="853" muted playsinline preload="auto" aria-label="Suno Sai Ko Episode 3 AI Avatar Video preview" data-first-frame-init="1"><source src="/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4#t=0.1" type="video/mp4"></video><div class="play-btn-overlay"><div class="play-btn-circle"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg></div></div><div class="video-overlay"><small>SUNO SAI KO</small><h3>Suno Sai Ko Episode 3 AI Avatar Video</h3></div></div></div>',
].join("");

export function prepareInnerPageMirror(
  content: InnerPageMirrorContent,
  wordpressId: number,
): PreparedInnerPageMirror {
  let body = markElementorBackgroundsReady(
    unwrapMirrorLazyMedia(stripCapturedFooters(stripLeadingCloseTags(content.body || ""))),
  );
  if (content.path === "/portfolio/") {
    body = replaceEnviraWrapWithNativeMount(body);
  }
  if (content.path === SHIRDI_CASE_STUDY_PATH) {
    body = body.replace(
      /<div id="ai-avatar-gallery" class="ai-avatar-gallery">\s*<\/div>/,
      `<div id="ai-avatar-gallery" class="ai-avatar-gallery">${SHIRDI_GALLERY_HTML}</div>`,
    );
  }
  body = body.replace(
    /(?:https:\/\/(?:www\.)?dgeniussolutions\.com)?\/wp-content\/uploads\/2026\/07\/Weavings-Home-page-\.png(?:\?[^"'\s>]*)?/g,
    "/images/case-studies/weavings-home-page-64820.png",
  );
  body = applyApprovedLinkCorrectionsToHtml(
    content.path,
    lazyBelowFold(rewriteWpUrls(body)),
  );
  const styles = rewriteWpUrls(content.styles || "");
  const fontLinks = content.fontLinks?.map((tag) => rewriteWpUrls(tag));
  const articleHtml = `<article data-migration-content data-wordpress-id="${wordpressId}">${body}</article>`;
  return {
    ...content,
    articleHtml,
    combinedStyles: styles,
    fontLinks,
  };
}
