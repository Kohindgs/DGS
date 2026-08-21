import PageHero from '@/app/components/site/PageHero';
import { AI_VIDEO_PAGE } from '@/lib/content';

export const metadata = {
  title: AI_VIDEO_PAGE.title,
  description: AI_VIDEO_PAGE.description,
  alternates: { canonical: '/services/ai-video-production-agency' },
};

export default function AiVideoPage() {
  return (
    <>
      <PageHero
        kicker="AI production"
        title={AI_VIDEO_PAGE.h1}
        lede="Generative film, anthems and campaign worlds — produced in-house. Custom motion tiles replace plugin galleries."
      />
      <div className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 md:grid-cols-3 md:px-10">
        {['World-building', 'Brand anthems', 'Always-on cuts'].map((item) => (
          <article key={item} className="min-h-48 rounded-[2rem] border border-white/10 bg-white/[0.03] p-7">
            <h2 className="font-display text-2xl">{item}</h2>
            <p className="mt-3 text-sm text-white/60">
              Same DGS production offer, new spatial composition. No Elementor. No Envira.
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
