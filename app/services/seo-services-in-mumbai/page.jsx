import PageHero from '@/app/components/site/PageHero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { SEO_PAGE } from '@/lib/content';

export const metadata = {
  title: SEO_PAGE.title,
  description: SEO_PAGE.description,
  alternates: { canonical: '/services/seo-services-in-mumbai' },
};

const faqs = [
  {
    id: 'what',
    q: "What SEO services does D'Genius Solutions offer in Mumbai?",
    a: "D'Genius Solutions offers SEO services in Mumbai for businesses that want stronger Google rankings, local visibility, website traffic, and qualified leads. The agency also supports AI search readiness through AEO, GEO, LLM SEO, structured content, and voice-search-friendly FAQ optimization.",
  },
  {
    id: 'local',
    q: 'Is D’Genius Solutions an SEO agency in Mumbai?',
    a: 'Yes. D’Genius Solutions is located in Khar West, Mumbai and offers SEO services for businesses across Mumbai, India, and international markets.',
  },
];

export default function SeoServicesPage() {
  return (
    <>
      <PageHero
        kicker="SEO Services in Mumbai"
        title={SEO_PAGE.h1}
        lede="Technical audits, local SEO, content strategy, AEO, GEO and LLM SEO — hardcoded into this route so ranking structure can stay while the UI changes."
      />
      <div className="mx-auto max-w-3xl px-6 pb-24 md:px-10">
        <h2 className="font-display text-3xl">Local SEO in Mumbai</h2>
        <p className="mt-4 text-white/65">
          D&apos;Genius Solutions offers SEO services in Mumbai for businesses that want stronger visibility on Google
          Search, Google AI Overviews, featured snippets, voice search, and AI-led discovery platforms.
        </p>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
