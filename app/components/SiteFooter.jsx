import { PRIMARY_NAV, SERVICE_LINKS, SITE } from '../../lib/wordpress';

export default function SiteFooter() {
  return (
    <footer className="dgs-footer">
      <div className="dgs-container">
        <div className="dgs-footer-grid">
          <div className="dgs-footer-brand">
            <a href="/" className="dgs-nav-logo">
              <span className="dgs-nav-logo-icon" aria-hidden="true" />
              {SITE.name}
            </a>
            <p className="dgs-footer-brand-desc">
              Mumbai-based full-service digital marketing agency connecting search, websites,
              social, performance marketing, branding and AI-led creative production.
            </p>
          </div>

          <div>
            <h4 className="dgs-footer-heading">Company</h4>
            <div className="dgs-footer-links">
              {PRIMARY_NAV.map((item) => (
                <a key={item.href} href={item.href} className="dgs-footer-link">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="dgs-footer-heading">Services</h4>
            <div className="dgs-footer-links">
              {SERVICE_LINKS.map((item) => (
                <a key={item.href} href={item.href} className="dgs-footer-link">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="dgs-footer-heading">Connect</h4>
            <div className="dgs-footer-links">
              <a href={`mailto:${SITE.email}`} className="dgs-footer-link">{SITE.email}</a>
              <a href={`tel:${SITE.phone}`} className="dgs-footer-link">{SITE.phone}</a>
              <a href="https://www.linkedin.com/company/dgeniussolutions/" target="_blank" rel="noopener noreferrer" className="dgs-footer-link">LinkedIn</a>
              <a href="https://www.instagram.com/dgeniussolutions/" target="_blank" rel="noopener noreferrer" className="dgs-footer-link">Instagram</a>
              <span className="dgs-footer-link">{SITE.address}</span>
            </div>
          </div>
        </div>

        <div className="dgs-footer-bottom">
          <span className="dgs-footer-copyright">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <a href="/privacy-policy" className="dgs-footer-copyright">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
