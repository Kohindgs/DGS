'use client';

import { useEffect, useState } from 'react';

/**
 * Load WpHomeClient soon after first paint.
 * Nav/talk scripts also boot via ImmediateMirrorScripts — keep this snappy
 * so FluentForm/Envira still arrive without a multi-second black wait.
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

    // Short defer only — long idle timeouts left menu/fonts feeling "broken".
    const delay = props.mirrorRootId === 'dgs-wp-service-mirror' ? 50 : 120;
    timer = setTimeout(load, delay);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [props.mirrorRootId]);

  if (!Client) return null;
  return <Client {...props} />;
}
