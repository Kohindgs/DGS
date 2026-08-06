'use client';

import { useEffect } from 'react';

/**
 * Lightweight homepage bootstrap — no WordPress script storm.
 * Also clears leftover byheart service workers / caches from prior deploys.
 */
export default function WpHomeClient({ bodyId, bodyClass }) {
  useEffect(() => {
    // Nuke any old service workers / Cache Storage from the byheart deploy
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations?.().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if (window.caches?.keys) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    }

    const prevId = document.body.id;
    const prevClass = document.body.className;
    const prevHtmlClass = document.documentElement.className;

    document.body.id = bodyId || 'cmsmasters_body';
    document.body.className = bodyClass || '';
    document.documentElement.className = prevHtmlClass.replace(/\bno-js\b/g, 'js');

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
