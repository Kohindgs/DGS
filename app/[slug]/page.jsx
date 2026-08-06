import { notFound, redirect } from 'next/navigation';
import PageHero from '../components/PageHero';
import WpContent from '../components/WpContent';
import {
  getAllPages,
  getPageBySlug,
  getTitle,
  getExcerpt,
  prepareWpHtml,
  wpMetadata,
  RESERVED_SLUGS,
  SITE,
} from '../../lib/wordpress';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const pages = await getAllPages();
    return pages
      .filter((p) => p.slug && p.slug !== SITE.homeSlug && !RESERVED_SLUGS.has(p.slug))
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug === SITE.homeSlug) {
    return { alternates: { canonical: '/' } };
  }
  try {
    const page = await getPageBySlug(slug);
    if (!page) return { title: 'Page not found' };
    return wpMetadata(page, { path: `/${slug}` });
  } catch {
    return { title: 'Page' };
  }
}

export default async function WpPage({ params }) {
  const { slug } = await params;

  if (slug === SITE.homeSlug) {
    redirect('/');
  }
  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  let page;
  try {
    page = await getPageBySlug(slug);
  } catch {
    notFound();
  }
  if (!page) notFound();

  const title = getTitle(page);
  const subtitle = getExcerpt(page, 200);
  const html = prepareWpHtml(page.content?.rendered || '');

  return (
    <main>
      <PageHero eyebrow="D'Genius Solutions" title={title} subtitle={subtitle} />
      <section className="dgs-content-section">
        <div className="dgs-container dgs-content-container">
          <WpContent html={html} />
        </div>
      </section>
      <section className="dgs-cta">
        <div className="dgs-container">
          <div className="dgs-cta-card">
            <span className="dgs-section-label">Next step</span>
            <h2 className="dgs-cta-title">
              Ready to talk <span className="dgs-gradient-text">growth?</span>
            </h2>
            <a href="/contact-us" className="dgs-btn-primary dgs-btn-lg">
              Contact us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
