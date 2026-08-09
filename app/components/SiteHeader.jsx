'use client';

import { useEffect, useState } from 'react';

const NAV = [
  { href: '/about-us', label: 'About' },
  { href: '/our-services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/case_studies', label: 'Case Studies' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/career', label: 'Careers' },
  { href: '/contact-us', label: 'Contact' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`dgs-nav${scrolled ? ' dgs-nav--scrolled' : ''}`} id="dgs-nav">
      <div className="dgs-container">
        <div className="dgs-nav-container">
          <a href="/" className="dgs-nav-logo">
            <span className="dgs-nav-logo-icon" aria-hidden="true" />
            D&apos;Genius Solutions
          </a>

          <nav className={`dgs-nav-links${open ? ' dgs-nav-links--open' : ''}`} aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="dgs-nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="dgs-nav-actions">
            <a href="/contact-us" className="dgs-btn-primary dgs-nav-cta">
              Growth Audit
            </a>
            <button
              className={`dgs-nav-toggle${open ? ' dgs-nav-toggle--active' : ''}`}
              aria-label="Toggle menu"
              type="button"
              onClick={() => setOpen((v) => !v)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
