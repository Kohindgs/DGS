import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="dgs-page-hero">
        <div className="dgs-container">
          <div className="dgs-page-hero-content">
            <span className="dgs-section-label">404</span>
            <h1 className="dgs-page-hero-title">Page not found</h1>
            <p className="dgs-page-hero-subtitle">
              That URL is not in the WordPress page or service catalog we synced.
            </p>
            <div className="dgs-hero-actions">
              <Link href="/" className="dgs-btn-primary">
                Back home
              </Link>
              <Link href="/contact-us" className="dgs-btn-ghost">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
