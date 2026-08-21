'use client';

import { useEffect } from 'react';

export default function CursorGlow() {
  useEffect(() => {
    const el = document.getElementById('dgs-cursor');
    if (!el) return;
    const move = (e) => {
      el.style.transform = `translate3d(${e.clientX - 140}px, ${e.clientY - 140}px, 0)`;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <div
      id="dgs-cursor"
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-20 hidden h-[280px] w-[280px] rounded-full opacity-50 mix-blend-screen blur-3xl md:block"
      style={{
        background:
          'radial-gradient(circle, rgba(124,58,237,0.45) 0%, rgba(37,99,235,0.22) 42%, rgba(249,115,22,0.12) 68%, transparent 74%)',
      }}
    />
  );
}
