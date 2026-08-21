import PageHero from '@/app/components/site/PageHero';
import { ABOUT_PAGE } from '@/lib/content';

export const metadata = {
  title: ABOUT_PAGE.title,
  description: ABOUT_PAGE.description,
  alternates: { canonical: '/about-us' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About DGS"
        title={ABOUT_PAGE.h1}
        lede="Sneha and Kohin Bellara founded D’Genius Solutions in 2021 as an extended marketing arm — not another vendor. The copy stays. The frame is new."
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-2 md:px-10">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-2xl">Kohin Bellara</h2>
          <p className="mt-4 text-white/65">
            Drives business strategy and technology across SEO, website design and development, performance marketing,
            and growth systems.
          </p>
        </article>
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-2xl">Sneha Bellara</h2>
          <p className="mt-4 text-white/65">
            Leads brand, creative and partnership culture — the reason DGS still grows on references rather than ads.
          </p>
        </article>
        <article className="md:col-span-2 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-display text-2xl">Mumbai, with work across India, Dubai and the UAE</h2>
          <p className="mt-4 max-w-3xl text-white/65">
            Unit 202, Amore Edge, Swami Vivekanand Road, Govind Dham, Khar West. 20+ people. 200+ brands. Same facts as
            the live site — presented as editorial cinema instead of a WordPress template.
          </p>
        </article>
      </div>
    </>
  );
}
