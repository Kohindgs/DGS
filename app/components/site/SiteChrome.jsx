'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BRAND, NAV } from '@/lib/content';
import { Button } from '@/app/components/ui/button';
import CursorGlow from '@/app/components/site/CursorGlow';

export default function SiteChrome({ children }) {
  const [open, setOpen] = useState(false);
  const [talk, setTalk] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#05060a] text-[#f4f1ea]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 dgs-spectrum opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent,rgba(5,6,10,0.92)_58%)]" />
        <div className="absolute inset-0 dgs-noise opacity-40" />
      </div>
      <CursorGlow />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
        <div className="dgs-glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 pl-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={BRAND.logo} alt={BRAND.name} width={36} height={36} className="size-9 rounded-full object-cover" />
            <span className="font-display text-sm tracking-[0.18em] uppercase">{BRAND.short}</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="spectrum" onClick={() => setTalk(true)}>
              Talk to DGS
            </Button>
            <button
              className="grid size-10 place-items-center rounded-full border border-white/10 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="dgs-glass mx-auto mt-2 max-w-6xl rounded-3xl p-6 md:hidden">
            <div className="flex flex-col gap-4 text-lg">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="relative mx-auto mt-24 max-w-6xl px-6 pb-12 md:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <p className="font-display text-4xl leading-[0.95] md:text-6xl">
            Search, sites, social,
            <span className="dgs-spectrum bg-clip-text text-transparent"> cinema.</span>
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-white/40 uppercase">Studio</p>
              <p className="mt-3 text-white/70">{BRAND.city}</p>
              <a className="mt-2 block text-white/70 hover:text-white" href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
              <a className="mt-1 block text-white/70 hover:text-white" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>
                {BRAND.phone}
              </a>
            </div>
            <div className="flex flex-col gap-2 text-white/70">
              <Link href="/about-us">About</Link>
              <Link href="/services/seo-services-in-mumbai">SEO Services in Mumbai</Link>
              <Link href="/services/ai-video-production-agency">AI Video Production</Link>
            </div>
            <div>
              <Button asChild variant="outline">
                <a href={BRAND.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp <ArrowUpRight size={16} />
                </a>
              </Button>
            </div>
          </div>
          <p className="mt-10 text-xs text-white/35">© {new Date().getFullYear()} {BRAND.name}. New UI on Dimgrey. Content unchanged.</p>
        </div>
      </footer>

      {talk && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4" onClick={() => setTalk(false)}>
          <div
            className="dgs-glass w-full max-w-md rounded-3xl p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="talk-title"
          >
            <h2 id="talk-title" className="font-display text-3xl">
              Talk to DGS
            </h2>
            <p className="mt-3 text-sm text-white/65">
              Same Mumbai team. New surface. Email or WhatsApp — no plugin form.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="spectrum">
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </Button>
              <Button asChild variant="outline">
                <a href={BRAND.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </Button>
              <Button variant="ghost" onClick={() => setTalk(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
