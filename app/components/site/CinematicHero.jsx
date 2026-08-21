'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { BRAND } from '@/lib/content';

export default function CinematicHero({ onTalk }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="dgs-aurora" />
        <div className="dgs-scan" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-start justify-between">
        <p className="text-[11px] tracking-[0.42em] text-white/45 uppercase">Mumbai · Dubai · UAE</p>
        <p className="hidden text-[11px] tracking-[0.32em] text-white/35 uppercase md:block">Est. 2021 · 200+ brands</p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <motion.p
          className="mb-6 text-[11px] tracking-[0.4em] text-[#9ec5ff] uppercase"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          01 — Studio
        </motion.p>
        <h1 className="dgs-hero-title font-display font-semibold tracking-[-0.06em]">
          <span className="block overflow-hidden">
            <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              Digital marketing
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="dgs-spectrum block bg-clip-text text-transparent"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              agency in Mumbai
            </motion.span>
          </span>
        </h1>
        <div className="mt-8 flex max-w-3xl flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-base leading-relaxed text-white/62 md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {BRAND.name} connects search, websites, social, performance and AI production as one growth system — not a
            stack of plugins.
          </motion.p>
          <div className="flex flex-wrap gap-3">
            <Link href="#services" data-cursor="Explore" className="dgs-pill">
              Enter the stack
            </Link>
            <button type="button" data-cursor="Talk" className="dgs-pill dgs-pill-hot" onClick={onTalk}>
              Talk to DGS
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-3 pt-12 md:grid-cols-4">
        {['SEO', 'AEO', 'GEO', 'LLM'].map((item, i) => (
          <motion.div
            key={item}
            className="dgs-chip"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.07 }}
          >
            <span>0{i + 1}</span>
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
