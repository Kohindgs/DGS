'use client';

import { useEffect } from 'react';

/**
 * Run critical mirror scripts on mount (nav / talk popup / AI portfolio+FAQ)
 * without waiting on DeferredHomeClient idle gates.
 */
export default function ImmediateMirrorScripts({ scripts = [], idPrefix = 'dgs-imm' }) {
  useEffect(() => {
    if (!Array.isArray(scripts) || !scripts.length) return;

    const run = (code, id) => {
      if (!code) return;
      if (document.getElementById(id)) return;
      // Nav already booted from the HTML stream script.
      if (/dgsToggle\s*=/.test(code) && typeof window.dgsToggle === 'function') return;
      if (/__DGS_AI_VIDEO_PORTFOLIO__/.test(code) && window.__DGS_AI_VIDEO_PORTFOLIO__) return;
      try {
        const s = document.createElement('script');
        s.id = id;
        s.text = code;
        document.body.appendChild(s);
      } catch (err) {
        console.warn('DGS immediate script failed', id, err);
      }
    };

    scripts.forEach((code, i) => run(code, `${idPrefix}-${i}`));

    // AI Production: retry portfolio boot if gallery stayed empty.
    const gallery = document.getElementById('portfolio-gallery');
    const empty = gallery && !gallery.querySelector('.gallery-item');
    if (empty && typeof window.__dgsAiVideoBoot === 'function') {
      try {
        window.__dgsAiVideoBoot();
      } catch (_) {
        /* ignore */
      }
    } else if (empty && window.__DGS_AI_VIDEO_PORTFOLIO__) {
      try {
        delete window.__DGS_AI_VIDEO_PORTFOLIO__;
        scripts.forEach((code, i) => {
          if (/__DGS_AI_VIDEO_PORTFOLIO__/i.test(code)) {
            run(code, `${idPrefix}-retry-${i}`);
          }
        });
      } catch (_) {
        /* ignore */
      }
    }
  }, [scripts, idPrefix]);

  return null;
}
