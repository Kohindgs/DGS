'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BRAND, NAV } from '@/lib/content';
import CinematicCursor from '@/app/components/site/CinematicCursor';
import { TalkProvider, useTalk } from '@/app/components/site/TalkContext';

function ChromeInner({ children }) {
  const [open, setOpen] = useState(false);
  const { open: talk, setOpen: setTalk, openTalk } = useTalk();

  return (
    <div className="dgs-root relative min-h-screen text-[#f3efe6]" data-dgs-ui="cinematic-v2">
      <CinematicCursor />

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-10">
          <Link href="/" data-cursor="Home" className="flex items-center gap-3">
            <img src={BRAND.logo} alt="" width={34} height={34} className="size-8 rounded-full object-cover" />
            <span className="font-display text-sm tracking-[0.28em] uppercase">{BRAND.short}</span>
          </Link>
          <div className="flex items-center gap-6">
            <button type="button" data-cursor="Talk" className="hidden text-xs tracking-[0.28em] uppercase md:block" onClick={openTalk}>
              Talk
            </button>
            <button type="button" data-cursor="Menu" className="text-xs tracking-[0.32em] uppercase" onClick={() => setOpen(true)}>
              Index
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] overflow-auto bg-[#05060a] p-6 md:p-12">
          <div className="mx-auto flex max-w-[1400px] items-start justify-between">
            <p className="text-[11px] tracking-[0.4em] text-white/40 uppercase">Index</p>
            <button type="button" className="text-xs tracking-[0.32em] uppercase" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav className="mx-auto mt-16 flex max-w-[1400px] flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="Go"
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-white/10 py-5"
              >
                <span className="font-display text-5xl tracking-[-0.05em] md:text-8xl">{item.label}</span>
                <span className="text-sm text-white/35">{item.index}</span>
              </Link>
            ))}
          </nav>
          <button type="button" className="dgs-pill dgs-pill-hot mt-10" onClick={() => { setOpen(false); openTalk(); }}>
            Talk to DGS
          </button>
        </div>
      )}

      <main>{children}</main>

      <footer className="mx-auto max-w-[1400px] px-5 pb-12 pt-24 md:px-10">
        <p className="font-display text-[12vw] leading-[0.8] tracking-[-0.07em] md:text-9xl">
          Search into
          <br />
          <span className="dgs-spectrum bg-clip-text text-transparent">cinema.</span>
        </p>
        <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-3">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-white/35 uppercase">Studio</p>
            <p className="mt-3">{BRAND.city}</p>
            <a className="mt-2 block" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <a className="mt-1 block" href="tel:+919987922901">{BRAND.phone}</a>
          </div>
          <div className="flex flex-col gap-2 text-white/70">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </div>
          <a data-cursor="WhatsApp" href={BRAND.whatsapp} target="_blank" rel="noreferrer" className="dgs-pill w-fit">
            WhatsApp <ArrowUpRight size={16} />
          </a>
        </div>
      </footer>

      {talk && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4" onClick={() => setTalk(false)}>
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b0c12] p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-4xl">Talk to DGS</h2>
            <p className="mt-3 text-white/60">Hardcoded contact. No Fluent Forms.</p>
            <div className="mt-6 flex flex-col gap-3">
              <a className="dgs-pill dgs-pill-hot justify-center" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a className="dgs-pill justify-center" href={BRAND.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
              <button type="button" className="text-sm text-white/40" onClick={() => setTalk(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteChrome({ children }) {
  return (
    <TalkProvider>
      <ChromeInner>{children}</ChromeInner>
    </TalkProvider>
  );
}
