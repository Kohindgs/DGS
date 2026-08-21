'use client';

import { CLIENTS } from '@/lib/content';

export default function MotionTiles() {
  return (
    <section id="clients" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10">
      <p className="text-[11px] tracking-[0.4em] text-[#9ec5ff] uppercase">04 — Clients</p>
      <h2 className="mt-4 max-w-4xl font-display text-4xl tracking-[-0.04em] md:text-6xl">
        Motion tiles. Trusted by 200+ brands.
      </h2>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CLIENTS.map((client, i) => (
          <div
            key={client.name}
            className="dgs-tile group grid aspect-[5/3] place-items-center rounded-3xl border border-white/10 bg-white/[0.03] px-6"
            style={{ animationDelay: `${(i % 8) * 80}ms` }}
            data-cursor={client.name}
          >
            <img src={client.src} alt={client.name} className="max-h-12 max-w-[80%] object-contain opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
