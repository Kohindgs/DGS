'use client';

import { useEffect, useState } from 'react';

/**
 * Load WpHomeClient only after the hero LCP image has a chance to paint.
 * Keeps the heavy client chunk + jQuery/Envira boot off the Lighthouse TBT window.
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

    const robot = document.getElementById('dgs-v1215-robot');
    if (robot && !robot.complete) {
      const onDone = () => {
        // One frame after decode so LCP can commit before we fetch JS.
        requestAnimationFrame(() => requestAnimationFrame(afterQuiet));
      };
      robot.addEventListener('load', onDone, { once: true });
      robot.addEventListener('error', onDone, { once: true });
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
