'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Marquee } from '@/app/components/ui/marquee';
import { BRAND, CASES, CLIENTS, HOME_FAQS, SERVICES } from '@/lib/content';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeView() {
  return (
    <>
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-6 pb-16 pt-32 md:px-10 md:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] h-[70vh] w-[70vh] rounded-full bg-[#7c3aed]/25 blur-[90px]" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[55vh] w-[55vh] rounded-full bg-[#2563eb]/20 blur-[90px]" />
          <div className="absolute right-[18%] bottom-[18%] h-[32vh] w-[32vh] rounded-full bg-[#f97316]/20 blur-[70px]" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl">
          <motion.p
            className="text-xs tracking-[0.32em] text-white/50 uppercase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Mumbai · Dubai · UAE
          </motion.p>
          <h1 className="mt-5 max-w-5xl font-display text-[12vw] leading-[0.86] tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-9xl">
            Digital marketing
            <br />
            <span className="dgs-spectrum bg-clip-text text-transparent">agency in Mumbai</span>
          </h1>
          <motion.p
            className="mt-8 max-w-xl text-lg text-white/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            One team for search, websites, social, performance and AI production. Content stays DGS.
            The surface is new — cinematic, glass, bento, no WordPress plugins.
          </motion.p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="spectrum" size="lg">
              <Link href="#services">
                Explore services <ArrowUpRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#work">See selected work</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <Marquee pauseOnHover speed="slow" className="rounded-full border border-white/10 bg-white/[0.03] py-4">
          {['SEO', 'AEO', 'GEO', 'LLM SEO', 'Voice', 'Websites', 'Performance', 'Social', 'Branding', 'AI film'].map(
            (item) => (
              <span
                key={item}
                className="mx-6 font-display text-sm tracking-[0.22em] text-white/50 uppercase"
              >
                {item}
              </span>
            )
          )}
        </Marquee>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <motion.div {...fade}>
          <p className="text-xs tracking-[0.28em] text-white/40 uppercase">Connected stack</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            Search, answers, generative engines — then the site that converts.
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              {...fade}
              transition={{ ...fade.transition, delay: i * 0.04 }}
              className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}
            >
              <Link href={service.href} className="block h-full">
                <Card className="group h-full min-h-[240px] justify-between overflow-hidden p-0 transition duration-500 hover:border-white/25">
                  <CardHeader className="pt-7">
                    <p className="text-[11px] tracking-[0.28em] text-white/35">{service.kicker}</p>
                    <CardTitle className="mt-4 text-3xl">{service.title}</CardTitle>
                    <CardDescription className="mt-3 max-w-sm">{service.body}</CardDescription>
                  </CardHeader>
                  <div className="px-6 pb-6 text-sm text-white/40 transition group-hover:text-white">
                    Open <ArrowUpRight className="inline" size={14} />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="clients" className="py-16">
        <p className="mb-8 text-center text-xs tracking-[0.28em] text-white/40 uppercase">Selected clients</p>
        <Marquee pauseOnHover speed="slow">
          {[...CLIENTS, ...CLIENTS].map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className="mx-3 grid h-28 w-52 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <img src={client.src} alt={client.name} className="max-h-12 max-w-[70%] object-contain" />
            </div>
          ))}
        </Marquee>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <motion.div {...fade} className="flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl md:text-6xl">Work that already ranks — restyled, not reshuffled.</h2>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {CASES.map((item) => (
            <motion.article
              key={item.id}
              {...fade}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10"
            >
              <div className="aspect-[16/11] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs tracking-[0.2em] text-white/60 uppercase">{item.brand}</p>
                <h3 className="mt-2 font-display text-2xl">{item.title}</h3>
              </div>
              <span className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-white text-black opacity-0 transition group-hover:opacity-100">
                <ArrowUpRight size={16} />
              </span>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <h2 className="font-display text-4xl md:text-5xl">Questions brands actually ask</h2>
        <Accordion type="single" collapsible className="mt-8">
          {HOME_FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 md:px-10">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 p-8 md:p-16">
          <p className="text-xs tracking-[0.28em] text-white/40 uppercase">{BRAND.city}</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] md:text-7xl">
            Start with a growth audit across SEO, AEO, GEO and AI production.
          </h2>
          <div className="mt-8">
            <Button asChild variant="spectrum" size="lg">
              <a href={`mailto:${BRAND.email}`}>
                {BRAND.email} <ArrowUpRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
