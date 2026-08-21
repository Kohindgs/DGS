'use client';

import CinematicHero from '@/app/components/site/CinematicHero';
import ServiceOrbit from '@/app/components/site/ServiceOrbit';
import SpinGallery from '@/app/components/site/SpinGallery';
import MotionTiles from '@/app/components/site/MotionTiles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { BRAND, HOME_FAQS, PROOF } from '@/lib/content';
import { useTalk } from '@/app/components/site/TalkContext';

export default function HomeView() {
  const { openTalk } = useTalk();

  return (
    <>
      <CinematicHero onTalk={openTalk} />

      <section className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px border-y border-white/10 md:grid-cols-4">
        {PROOF.map((item) => (
          <div key={item.v} className="px-6 py-10">
            <p className="font-display text-4xl md:text-5xl">{item.k}</p>
            <p className="mt-2 text-sm text-white/45">{item.v}</p>
          </div>
        ))}
      </section>

      <ServiceOrbit />
      <SpinGallery />
      <MotionTiles />

      <section className="mx-auto max-w-3xl px-5 py-24 md:px-10">
        <p className="text-[11px] tracking-[0.4em] text-[#9ec5ff] uppercase">05 — FAQ</p>
        <h2 className="mt-4 font-display text-4xl md:text-6xl">Questions brands actually ask</h2>
        <Accordion type="single" collapsible className="mt-10">
          {HOME_FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-8 md:px-10">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(124,58,237,0.16),rgba(249,115,22,0.16))] p-8 md:p-16">
          <p className="text-[11px] tracking-[0.32em] uppercase text-white/50">{BRAND.city}</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] md:text-7xl">
            Start with a growth audit across SEO, AEO, GEO and AI production.
          </h2>
          <button type="button" data-cursor="Mail" className="dgs-pill dgs-pill-hot mt-8" onClick={openTalk}>
            {BRAND.email}
          </button>
        </div>
      </section>
    </>
  );
}
