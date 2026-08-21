'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/lib/content';

export default function ServiceOrbit() {
  const [active, setActive] = useState(0);
  const current = SERVICES[active];

  return (
    <section id="services" className="relative mx-auto max-w-[1400px] px-5 py-28 md:px-10">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] tracking-[0.4em] text-[#9ec5ff] uppercase">02 — Stack</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl">
            Circular selection.
            <span className="text-white/40"> One surface for ten disciplines.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-white/50">
          Hover or tap a ring item. X-ray the offer. No Elementor cards. No plugin accordions.
        </p>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="absolute inset-[12%] rounded-full border border-white/10" />
          <div className="absolute inset-[24%] rounded-full border border-white/10" />
          <div className="absolute inset-0">
            {SERVICES.map((service, i) => {
              const angle = (i / SERVICES.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 42;
              const y = 50 + Math.sin(angle) * 42;
              const on = i === active;
              return (
                <button
                  key={service.id}
                  type="button"
                  data-cursor="Select"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-[11px] tracking-[0.18em] uppercase transition ${
                    on ? 'border-white bg-white text-black' : 'border-white/15 bg-black/40 text-white/70'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {service.title}
                </button>
              );
            })}
          </div>
          <div className="absolute inset-[34%] grid place-items-center rounded-full bg-white/[0.04] text-center">
            <div>
              <p className="font-display text-5xl">{current.kicker}</p>
              <p className="mt-2 text-[11px] tracking-[0.3em] text-white/40 uppercase">DGS</p>
            </div>
          </div>
        </div>

        <Link href={current.href} data-cursor="Open" className="dgs-xray group block overflow-hidden rounded-[2rem]">
          <div className="relative min-h-[420px] p-8 md:p-12">
            <p className="text-[11px] tracking-[0.32em] text-white/40 uppercase">{current.kicker} / {SERVICES.length}</p>
            <h3 className="mt-6 font-display text-5xl md:text-7xl">{current.title}</h3>
            <p className="mt-6 max-w-md text-lg text-white/65">{current.body}</p>
            <p className="mt-10 text-sm tracking-[0.2em] uppercase">Continue →</p>
            <div className="dgs-xray-scan" />
          </div>
        </Link>
      </div>
    </section>
  );
}
