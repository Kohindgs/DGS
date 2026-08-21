'use client';

import { motion } from 'motion/react';

export default function PageHero({ kicker, title, lede }) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pt-44">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[40vh] w-[40vh] rounded-full bg-[#7c3aed]/20 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-[30vh] w-[30vh] rounded-full bg-[#f97316]/15 blur-[80px]" />
      </div>
      <div className="relative mx-auto max-w-5xl">
        {kicker && (
          <p className="text-xs tracking-[0.28em] text-white/45 uppercase">{kicker}</p>
        )}
        <motion.h1
          className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {title}
        </motion.h1>
        {lede && <p className="mt-6 max-w-2xl text-lg text-white/65">{lede}</p>}
      </div>
    </section>
  );
}
