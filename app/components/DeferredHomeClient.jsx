'use client';

import { useEffect, useState } from 'react';

/**
 * Load WpHomeClient only after the hero LCP image has a chance to paint.
 * Keeps the heavy client chunk + jQuery/Envira boot off the Lighthouse TBT window.
 * On About (no robot), waits briefly then idle-loads — same deferral spirit.
 */
export default function DeferredHomeClient(props) {
  const [Client, setClient] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const load = () => {
      if (cancelled) return;
      import('./WpHomeClient')
        .then((mod) => {
          if (!cancelled) setClient(() => mod.default);
        })
        .catch(() => {});
    };

    const afterQuiet = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(load, { timeout: 3500 });
      } else {
        timer = setTimeout(load, 1800);
      }
    };

    const isServiceMirror = props.mirrorRootId === 'dgs-wp-service-mirror';
    // Service ranking pages need menu/FluentForm soon; skip long idle deferral.
    if (isServiceMirror) {
      timer = setTimeout(load, 50);
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }

    const robot = document.getElementById('dgs-v1215-robot');
    const lcpImg =
      robot ||
      document.querySelector(
        '#dgs-wp-about-mirror img[fetchpriority="high"], #dgs-wp-service-mirror img[fetchpriority="high"]'
      );
    if (lcpImg && !lcpImg.complete) {
      const onDone = () => {
        // One frame after decode so LCP can commit before we fetch JS.
        requestAnimationFrame(() => requestAnimationFrame(afterQuiet));
      };
      lcpImg.addEventListener('load', onDone, { once: true });
      lcpImg.addEventListener('error', onDone, { once: true });
      timer = setTimeout(afterQuiet, 2500);
    } else {
      afterQuiet();
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!Client) return null;
  return <Client {...props} />;
}
