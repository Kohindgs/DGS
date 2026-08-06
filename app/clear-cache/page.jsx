'use client';

import { useEffect, useState } from 'react';

const DEMO = 'https://dimgrey-goat-473970.hostingersite.com/?fresh=' + Date.now();

export default function ClearCachePage() {
  const [status, setStatus] = useState('Clearing old byheart cache…');

  useEffect(() => {
    async function wipe() {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
        if (window.caches?.keys) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        // Clear storage that may hold old routes
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          /* ignore */
        }
        setStatus('Cache cleared. Opening D’Genius Solutions homepage…');
      } catch (e) {
        setStatus('Partial clear done. Opening homepage…');
      }
      setTimeout(() => {
        window.location.replace(DEMO);
      }, 600);
    }
    wipe();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#080808',
        color: '#fff',
        fontFamily: 'Manrope, system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ opacity: 0.6, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12 }}>
          Cache reset
        </p>
        <h1 style={{ fontSize: 28, margin: '12px 0' }}>Removing byheart cache</h1>
        <p style={{ color: '#aaa' }}>{status}</p>
        <p style={{ marginTop: 24 }}>
          <a href={DEMO} style={{ color: '#FD5C62' }}>
            Continue to D’Genius Solutions demo →
          </a>
        </p>
      </div>
    </main>
  );
}
