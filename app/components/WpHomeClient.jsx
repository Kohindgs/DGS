'use client';

import { useEffect, useRef } from 'react';

/**
 * Applies WordPress body classes and loads WP frontend scripts so Elementor /
 * GSAP / theme behaviours match the live CMS homepage.
 */
export default function WpHomeClient({ bodyId, bodyClass, scripts = [] }) {
  const loaded = useRef(false);

  useEffect(() => {
    const prevId = document.body.id;
    const prevClass = document.body.className;
    document.body.id = bodyId || 'cmsmasters_body';
    document.body.className = bodyClass || '';

    if (loaded.current) {
      return () => {
        document.body.id = prevId;
        document.body.className = prevClass;
      };
    }
    loaded.current = true;

    const nodes = [];
    let cancelled = false;

    async function loadScripts() {
      for (const src of scripts) {
        if (cancelled) break;
        if (document.querySelector(`script[data-dgs-mirror="${src}"]`)) continue;
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.dataset.dgsMirror = src;
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.body.appendChild(s);
          nodes.push(s);
        });
      }
      // Nudge Elementor / theme init if present
      try {
        window.dispatchEvent(new Event('DOMContentLoaded'));
        window.dispatchEvent(new Event('load'));
        if (window.jQuery) {
          window.jQuery(window).trigger('elementor/frontend/init');
        }
      } catch {
        /* ignore */
      }
    }

    loadScripts();

    return () => {
      cancelled = true;
      document.body.id = prevId;
      document.body.className = prevClass;
    };
  }, [bodyId, bodyClass, scripts]);

  return null;
}
