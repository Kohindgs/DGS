'use client';

import { useEffect } from 'react';

/**
 * Lightweight homepage bootstrap — no WordPress script storm.
 * Sets body classes and hydrates lazy media so the mirrored page
 * paints immediately instead of hanging on 40+ remote JS files.
 */
export default function WpHomeClient({ bodyId, bodyClass }) {
  useEffect(() => {
    const prevId = document.body.id;
    const prevClass = document.body.className;
    const prevHtmlClass = document.documentElement.className;

    document.body.id = bodyId || 'cmsmasters_body';
    document.body.className = bodyClass || '';
    document.documentElement.className = prevHtmlClass.replace(/\bno-js\b/g, 'js');

    // Activate LiteSpeed/Smush lazy images left as data-src / lazyload
    document.querySelectorAll('img[data-src], img[data-lazy-src], source[data-src]').forEach((el) => {
      const src = el.getAttribute('data-src') || el.getAttribute('data-lazy-src');
      if (src) {
        el.setAttribute('src', src);
        el.removeAttribute('data-src');
        el.removeAttribute('data-lazy-src');
      }
      el.classList.remove('lazyload', 'lazyloading');
      el.classList.add('lazyloaded');
    });

    document.querySelectorAll('[data-bg], [data-background]').forEach((el) => {
      const bg = el.getAttribute('data-bg') || el.getAttribute('data-background');
      if (bg) el.style.backgroundImage = `url(${bg})`;
    });

    // Ensure reveal content stays visible without WP motion JS
    const root = document.querySelector('#dgs-v1215, .dgs-v1215');
    if (root) {
      root.classList.remove('motion-ready');
      root.classList.add('gsap-active');
    }
    document.querySelectorAll('.dgs-v1215-reveal').forEach((el) => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    return () => {
      document.body.id = prevId;
      document.body.className = prevClass;
      document.documentElement.className = prevHtmlClass;
    };
  }, [bodyId, bodyClass]);

  return null;
}
