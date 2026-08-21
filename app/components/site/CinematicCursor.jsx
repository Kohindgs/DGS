'use client';

import { useEffect, useRef } from 'react';

export default function CinematicCursor() {
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const d = dot.current;
    const l = label.current;
    if (!d || !l) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      const hit = e.target.closest('[data-cursor]');
      const text = hit?.getAttribute('data-cursor') || '';
      l.textContent = text;
      l.style.opacity = text ? '1' : '0';
      d.classList.toggle('is-hot', Boolean(text));
    };

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      d.style.transform = `translate3d(${x - 18}px, ${y - 18}px, 0)`;
      l.style.transform = `translate3d(${x + 22}px, ${y - 12}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="dgs-cursor hidden md:block" aria-hidden />
      <div ref={label} className="dgs-cursor-label hidden md:block" aria-hidden />
    </>
  );
}
