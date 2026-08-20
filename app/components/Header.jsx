'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header({ onOpenAudit }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Capabilities', href: '#services' },
    { name: 'Case Studies', href: '#case-studies' },
    { name: 'AI Studio', href: '#ai-portfolio' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Approach', href: '#approach' },
    { name: 'Why DGS', href: '#why-dgs' },
    { name: 'FAQ', href: '#faq' },
  ];

  const serviceItems = [
    { title: 'Search Engine Optimization (SEO)', desc: 'Enterprise semantic & programmatic SEO', href: '/services/seo-services-in-mumbai' },
    { title: 'Generative Engine Optimization (GEO/AEO)', desc: 'Dominate Perplexity, ChatGPT & AI Overviews', href: '/services/seo-services-in-mumbai' },
    { title: 'Next.js Web Application Engineering', desc: 'Sub-second digital platforms & custom UI/UX', href: '/services/ai-video-production-agency' },
    { title: 'AI-Led Creative & Video Production', desc: 'Cinematic commercials & 3D product staging', href: '/services/ai-video-production-agency' },
    { title: 'Performance Marketing & Paid Media', desc: 'ROAS-engineered Google & Meta funnels', href: '/services/seo-services-in-mumbai' },
    { title: 'Brand Strategy & Social Systems', desc: 'Distinctive visual identities & content engines', href: '/about-us' },
  ];

  return (
    <>
      <header
        className={`dgs-header ${scrolled ? 'dgs-header-scrolled' : ''}`}
        role="banner"
      >
        <div className="dgs-header-container">
          {/* Brand Logo */}
          <Link href="/" className="dgs-brand" aria-label="D'Genius Solutions Home">
            <img
              src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO-1.webp"
              alt="D'Genius Solutions"
              width="140"
              height="38"
              className="dgs-logo-img"
              priority="true"
            />
            <span className="dgs-brand-pill">STUDIO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="dgs-desktop-nav" aria-label="Main Navigation">
            {/* Services Mega Dropdown Trigger */}
            <div
              className="dgs-nav-item-dropdown"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                className="dgs-nav-link dgs-dropdown-btn"
                aria-expanded={servicesDropdownOpen}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              >
                Services
                <svg className={`dgs-chevron ${servicesDropdownOpen ? 'rotate-180' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {servicesDropdownOpen && (
                <div className="dgs-dropdown-menu">
                  <div className="dgs-dropdown-grid">
                    {serviceItems.map((s, idx) => (
                      <Link
                        key={idx}
                        href={s.href}
                        className="dgs-dropdown-card"
                        onClick={() => setServicesDropdownOpen(false)}
                      >
                        <div className="dgs-dropdown-card-title">{s.title}</div>
                        <div className="dgs-dropdown-card-desc">{s.desc}</div>
                      </Link>
                    ))}
                  </div>
                  <div className="dgs-dropdown-footer">
                    <span>Looking for a tailored growth ecosystem?</span>
                    <button
                      type="button"
                      className="dgs-dropdown-cta"
                      onClick={() => {
                        setServicesDropdownOpen(false);
                        if (onOpenAudit) onOpenAudit();
                      }}
                    >
                      Request Audit →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link, idx) => (
              <a key={idx} href={link.href} className="dgs-nav-link">
                {link.name}
              </a>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="dgs-header-actions">
            <a href="tel:+919987922901" className="dgs-phone-link" aria-label="Call DGS Direct">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+91 99879 22901</span>
            </a>

            <button
              type="button"
              className="btn-primary dgs-audit-btn"
              onClick={onOpenAudit}
            >
              <span>Book Growth Audit</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="dgs-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className={`dgs-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`dgs-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="dgs-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="dgs-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="dgs-mobile-drawer-header">
              <img
                src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO-1.webp"
                alt="DGS"
                width="120"
                height="32"
              />
              <button
                type="button"
                className="dgs-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="dgs-mobile-drawer-body">
              <div className="dgs-drawer-section-title">SERVICES</div>
              <div className="dgs-drawer-services-list">
                {serviceItems.map((s, idx) => (
                  <Link
                    key={idx}
                    href={s.href}
                    className="dgs-drawer-service-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="dgs-drawer-svc-name">{s.title}</span>
                  </Link>
                ))}
              </div>

              <div className="dgs-drawer-section-title" style={{ marginTop: '20px' }}>NAVIGATION</div>
              <div className="dgs-drawer-nav-list">
                {navLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className="dgs-drawer-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="dgs-drawer-cta-wrapper">
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAudit) onOpenAudit();
                  }}
                >
                  Book 360° Growth Audit
                </button>
                <div className="dgs-drawer-contact-info">
                  <a href="tel:+919987922901">📞 +91 99879 22901</a>
                  <a href="mailto:business@dgeniussolutions.com">✉️ business@dgeniussolutions.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dgs-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
        }

        .dgs-header-scrolled {
          padding: 12px 0;
          background: rgba(6, 7, 9, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .dgs-header-container {
          max-width: var(--container-wide);
          margin: 0 auto;
          padding: 0 var(--gutter);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dgs-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .dgs-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .dgs-brand-pill {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent);
          background: rgba(253, 92, 98, 0.12);
          border: 1px solid rgba(253, 92, 98, 0.3);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .dgs-desktop-nav {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 28px);
        }

        .dgs-nav-link {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          padding: 6px 4px;
          position: relative;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .dgs-nav-link:hover {
          color: #FFFFFF;
        }

        .dgs-dropdown-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .dgs-chevron {
          transition: transform 0.2s ease;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .dgs-nav-item-dropdown {
          position: relative;
        }

        .dgs-dropdown-menu {
          position: absolute;
          top: 100%;
          left: -40px;
          width: 580px;
          background: rgba(14, 18, 26, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 20px;
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          margin-top: 12px;
          animation: dgsFadeIn 0.25s ease-out;
        }

        .dgs-dropdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .dgs-dropdown-card {
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
          display: block;
        }

        .dgs-dropdown-card:hover {
          background: rgba(253, 92, 98, 0.08);
          border-color: rgba(253, 92, 98, 0.3);
          transform: translateY(-2px);
        }

        .dgs-dropdown-card-title {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 4px;
        }

        .dgs-dropdown-card-desc {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
        }

        .dgs-dropdown-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .dgs-dropdown-cta {
          color: var(--accent);
          font-weight: 600;
          font-size: 0.82rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .dgs-header-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .dgs-phone-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.75);
          padding: 8px 14px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
        }

        .dgs-phone-link:hover {
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }

        .dgs-mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .dgs-bar {
          width: 24px;
          height: 2px;
          background-color: #FFFFFF;
          transition: all 0.3s ease;
        }

        .dgs-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          z-index: 1050;
          display: flex;
          justify-content: flex-end;
          animation: dgsFadeIn 0.25s ease-out;
        }

        .dgs-mobile-drawer {
          width: 88vw;
          max-width: 420px;
          height: 100vh;
          background: #0A0D14;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 24px;
        }

        .dgs-mobile-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .dgs-drawer-close {
          color: #FFFFFF;
          font-size: 1.4rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .dgs-mobile-drawer-body {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
        }

        .dgs-drawer-section-title {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 12px;
        }

        .dgs-drawer-services-list, .dgs-drawer-nav-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dgs-drawer-service-link, .dgs-drawer-link {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          padding: 6px 0;
        }

        .dgs-drawer-cta-wrapper {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dgs-drawer-contact-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.6);
        }

        @keyframes dgsFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1080px) {
          .dgs-desktop-nav {
            display: none;
          }
          .dgs-phone-link {
            display: none;
          }
          .dgs-mobile-toggle {
            display: flex;
          }
        }

        @media (max-width: 540px) {
          .dgs-audit-btn {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
