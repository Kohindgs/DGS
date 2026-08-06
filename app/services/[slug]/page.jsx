import { notFound } from 'next/navigation';
import PageHero from '../../components/PageHero';
import WpContent from '../../components/WpContent';
import {
  getServiceBySlug,
  getServices,
  getTitle,
  getExcerpt,
  prepareWpHtml,
  wpMetadata,
} from '../../../lib/wordpress';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const services = await getServices({ embed: false });
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const service = await getServiceBySlug(slug);
    if (!service) return { title: 'Service not found' };
    return wpMetadata(service, { path: `/services/${slug}` });
  } catch {
    return { title: 'Service' };
  }
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  let service;
  try {
    service = await getServiceBySlug(slug);
  } catch {
    notFound();
  }
  if (!service) notFound();

  const title = getTitle(service);
  const subtitle = getExcerpt(service, 200);
  const html = prepareWpHtml(service.content?.rendered || '');

  return (
    <main>
      <PageHero
        eyebrow="Service"
        title={title}
        subtitle={subtitle}
        actions={
          <>
            <a href="/contact-us" className="dgs-btn-primary">
              Get a proposal
            </a>
            <a href="/our-services" className="dgs-btn-ghost">
              All services
            </a>
          </>
        }
      />
      <section className="dgs-content-section">
        <div className="dgs-container dgs-content-container">
          <WpContent html={html} />
        </div>
      </section>
      <section className="dgs-cta">
        <div className="dgs-container">
          <div className="dgs-cta-card">
            <span className="dgs-section-label">Engage</span>
            <h2 className="dgs-cta-title">
              Want this service for <span className="dgs-gradient-text">your brand?</span>
            </h2>
            <a href="/contact-us" className="dgs-btn-primary dgs-btn-lg">
              Talk to our team
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
