'use client';

import { useEffect } from 'react';

const DEMO_ORIGIN = 'https://dimgrey-goat-473970.hostingersite.com';

function loadScript(src, timeoutMs = 12000) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-dgs-src="${src}"]`)) {
      resolve(true);
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.dgsSrc = src;
    const timer = setTimeout(() => resolve(false), timeoutMs);
    s.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    s.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    document.body.appendChild(s);
  });
}

function runInline(code, id) {
  if (!code) return;
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.text = code;
  document.body.appendChild(s);
}

/**
 * Restores WP homepage interactivity (menu, services dropdown, case lightbox,
 * WebGL background) without loading the full LiteSpeed script storm.
 */
export default function WpHomeClient({
  bodyId,
  bodyClass,
  externalScripts = [],
  inlineScripts = [],
  demoOrigin = DEMO_ORIGIN,
}) {
  useEffect(() => {
    let cancelled = false;

    // Clear stale byheart SW/cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    if (window.caches?.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }

    const prevId = document.body.id;
    const prevClass = document.body.className;
    const prevHtmlClass = document.documentElement.className;

    document.body.id = bodyId || 'cmsmasters_body';
    // Ensure popup/nav lock classes are not stuck from a partial prior load
    const cleaned = (bodyClass || '')
      .replace(/\bdgs-talk-popup-active\b/g, '')
      .replace(/\bnav-open\b/g, '');
    document.body.className = cleaned;
    document.documentElement.className = prevHtmlClass
      .replace(/\bno-js\b/g, 'js')
      .replace(/\bdgs-talk-popup-active\b/g, '');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    // Force logo → demo host
    const logo = document.getElementById('dgsLogo');
    if (logo) logo.setAttribute('href', `${demoOrigin.replace(/\/$/, '')}/`);

    // Hydrate any remaining lazy media
    document.querySelectorAll('img[data-src], img[data-lazy-src], source[data-src], video[data-src]').forEach((el) => {
      const src = el.getAttribute('data-src') || el.getAttribute('data-lazy-src');
      if (src && !src.startsWith('data:image/svg')) {
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

    async function boot() {
      // Load CDN libs first (three/gsap), with timeouts so we never hang
      for (const src of externalScripts) {
        if (cancelled) return;
        await loadScript(src);
      }

      // Run critical inline WP scripts (menu, motion, portfolio lightbox)
      inlineScripts.forEach((code, i) => {
        if (cancelled) return;
        try {
          runInline(code, `dgs-inline-${i}`);
        } catch (err) {
          console.warn('DGS inline script failed', i, err);
        }
      });

      // If motion script did not boot, keep content visible
      const root = document.querySelector('#dgs-v1215, .dgs-v1215');
      if (root && !root.dataset.dgsV1215Booted) {
        root.classList.remove('motion-ready');
        root.classList.add('gsap-active');
        document.querySelectorAll('.dgs-v1215-reveal').forEach((el) => {
          el.classList.add('is-visible');
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }

      // Always unlock scroll after boot (nav lock may have fired during init)
      if (typeof window.dgsUnlockScroll === 'function') {
        window.dgsUnlockScroll();
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
      }
      document.getElementById('dgsNav')?.classList.remove('nav-open');
      document.body.classList.remove('dgs-talk-popup-active');
      document.documentElement.classList.remove('dgs-talk-popup-active');
    }

    boot();

    return () => {
      cancelled = true;
      document.body.id = prevId;
      document.body.className = prevClass;
      document.documentElement.className = prevHtmlClass;
      if (typeof window.dgsUnlockScroll === 'function') window.dgsUnlockScroll();
    };
  }, [bodyId, bodyClass, externalScripts, inlineScripts, demoOrigin]);

  return null;
}
