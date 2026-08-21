'use client';

import { useRef } from 'react';
import { CASES } from '@/lib/content';

export default function SpinGallery() {
  const scroller = useRef(null);

  return (
    <section id="work" className="relative py-24">
      <div className="mx-auto mb-10 flex max-w-[1400px] items-end justify-between px-5 md:px-10">
        <div>
          <p className="text-[11px] tracking-[0.4em] text-[#9ec5ff] uppercase">03 — Work</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl tracking-[-0.04em] md:text-6xl">
            Gallery spin. Custom. Not Envira.
          </h2>
        </div>
        <p className="hidden max-w-xs text-sm text-white/45 md:block">Drag sideways. Structure of ranking case studies stays; the interaction is ours.</p>
      </div>
      <div
        ref={scroller}
        className="dgs-spin flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 md:px-10"
      >
        {CASES.map((item, i) => (
          <article
            key={item.id}
            data-cursor="View"
            className="dgs-spin-card relative w-[86vw] max-w-[720px] shrink-0 snap-center overflow-hidden rounded-[2rem]"
            style={{ '--i': i }}
          >
            <img src={item.image} alt={item.title} className="h-[62vw] max-h-[520px] w-full object-cover md:h-[460px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7">
              <p className="text-[11px] tracking-[0.28em] text-white/60 uppercase">{item.brand}</p>
              <h3 className="mt-2 font-display text-3xl">{item.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
