'use client';

import { useEffect } from 'react';

/**
 * Boot AI Production portfolio/FAQ scripts immediately on mount.
 * Do not wait on DeferredHomeClient idle + Envira viewport gates — those
 * left #portfolio-gallery empty and FAQ toggles unbound on the service page.
 */
export default function ImmediateServiceScripts({ scripts = [] }) {
  useEffect(() => {
    if (!Array.isArray(scripts) || !scripts.length) return;

    const run = (code, id) => {
      if (!code) return;
      if (document.getElementById(id)) return;
      try {
        const s = document.createElement('script');
        s.id = id;
        s.text = code;
        document.body.appendChild(s);
      } catch (err) {
        console.warn('DGS immediate service script failed', id, err);
      }
    };

    scripts.forEach((code, i) => run(code, `dgs-ai-svc-boot-${i}`));

    // If a prior partial boot set the guard without binding, clear and retry once.
    const gallery = document.getElementById('portfolio-gallery');
    const empty = gallery && !gallery.querySelector('.gallery-item');
    if (empty && window.__DGS_AI_VIDEO_PORTFOLIO__ && typeof window.__dgsAiVideoBoot === 'function') {
      try {
        window.__dgsAiVideoBoot();
      } catch (_) {
        /* ignore */
      }
    } else if (empty && window.__DGS_AI_VIDEO_PORTFOLIO__ && !document.getElementById('dgs-ai-svc-boot-0')) {
      try {
        delete window.__DGS_AI_VIDEO_PORTFOLIO__;
        scripts.forEach((code, i) => run(code, `dgs-ai-svc-boot-retry-${i}`));
      } catch (_) {
        /* ignore */
      }
    }
  }, [scripts]);

  return null;
}
