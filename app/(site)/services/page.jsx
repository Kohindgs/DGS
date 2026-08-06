import PageHero from '../../components/PageHero';
import { getServices, getTitle, getExcerpt, SERVICE_LINKS } from '../../../lib/wordpress';

export const revalidate = 300;

export const metadata = {
  title: 'Services Catalog',
  description:
    "Browse SEO, AEO, GEO, LLM SEO, AI video, websites, social, performance marketing, and branding services from D'Genius Solutions.",
  alternates: { canonical: '/services' },
};

export default async function ServicesIndexPage() {
  let services = [];
  try {
    services = await getServices({ embed: false });
  } catch {
    services = [];
  }

  const list =
    services.length > 0
      ? services.map((s) => ({
          href: `/services/${s.slug}`,
          title: getTitle(s),
          excerpt: getExcerpt(s, 140),
        }))
      : SERVICE_LINKS.map((s) => ({ href: s.href, title: s.label, excerpt: '' }));

  return (
    <main>
      <PageHero
        eyebrow="Services"
        title="Service catalog"
        subtitle="Every service page below is pulled live from the WordPress services custom post type."
      />
      <section className="dgs-content-section">
        <div className="dgs-container">
          <div className="dgs-services-grid">
            {list.map((s) => (
              <a key={s.href} href={s.href} className="dgs-service-card">
                <h3 className="dgs-service-title">{s.title}</h3>
                {s.excerpt ? <p className="dgs-service-desc">{s.excerpt}</p> : null}
                <span className="dgs-service-link">View service →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
