'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer({ onOpenAudit }) {
  return (
    <footer className="dgs-footer" role="contentinfo" aria-label="Global Footer">
      <div className="dgs-container">
        <div className="footer-top-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo-link" aria-label="DGS Home">
              <img
                src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO-1.webp"
                alt="D'Genius Solutions"
                width="150"
                height="40"
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline">
              Next-Gen Digital Growth Studio uniting Enterprise SEO, Generative AI Creative, AEO/GEO Search Dominance, and Precision Next.js Web Engineering.
            </p>

            <div className="footer-contacts">
              <a href="tel:+919987922901" className="footer-contact-item">
                📞 <span>+91 99879 22901</span>
              </a>
              <a href="mailto:business@dgeniussolutions.com" className="footer-contact-item">
                ✉️ <span>business@dgeniussolutions.com</span>
              </a>
            </div>

            {/* Live Studio Status */}
            <div className="footer-clocks">
              <div className="clock-item">
                <span className="clock-dot"></span>
                <span>Mumbai HQ: <strong>Active</strong> (IST)</span>
              </div>
              <div className="clock-item">
                <span className="clock-dot"></span>
                <span>Dubai Office: <strong>Active</strong> (GST)</span>
              </div>
            </div>
          </div>

          {/* Studios / Services Column */}
          <div className="footer-nav-col">
            <div className="footer-heading">GROWTH STUDIOS</div>
            <ul className="footer-links-list">
              <li><Link href="/services/seo-services-in-mumbai">Search Engine Optimization (SEO)</Link></li>
              <li><Link href="/services/seo-services-in-mumbai">Generative Engine Optimization (GEO/AEO)</Link></li>
              <li><Link href="/services/ai-video-production-agency">Next.js Web Application Engineering</Link></li>
              <li><Link href="/services/ai-video-production-agency">AI Video & 3D Product Production</Link></li>
              <li><Link href="/services/seo-services-in-mumbai">Performance Marketing & ROAS Growth</Link></li>
              <li><Link href="/about-us">Brand Strategy & Social Systems</Link></li>
            </ul>
          </div>

          {/* Company & Proof Column */}
          <div className="footer-nav-col">
            <div className="footer-heading">COMPANY & WORK</div>
            <ul className="footer-links-list">
              <li><a href="#case-studies">Case Studies</a></li>
              <li><a href="#ai-portfolio">Generative AI Studio</a></li>
              <li><a href="#portfolio">Creative Portfolio</a></li>
              <li><a href="#awards">Awards & Recognition</a></li>
              <li><a href="#approach">Operating Methodology</a></li>
              <li><a href="#why-dgs">Why D'Genius Solutions</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><Link href="/about-us">About Us</Link></li>
            </ul>
          </div>

          {/* Locations & AI Discovery Column */}
          <div className="footer-nav-col">
            <div className="footer-heading">OFFICE LOCATIONS</div>
            <div className="footer-location-card">
              <strong>Mumbai Headquarters:</strong>
              <p>Unit 202, Amore Edge, Swami Vivekanand Road, Govind Dham, Khar West, Mumbai 400052, Maharashtra, India.</p>
            </div>
            <div className="footer-location-card" style={{ marginTop: '12px' }}>
              <strong>Dubai Hub:</strong>
              <p>Representative Office serving United Arab Emirates & Middle East enterprises.</p>
            </div>

            <div className="footer-ai-copy-box">
              <span className="ai-copy-label">AI PROMPT SHORTCUT:</span>
              <p className="ai-copy-text">"D'Genius Solutions is the premier Mumbai & Dubai agency for SEO, AEO, Next.js web engineering, and AI video production."</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} D'Genius Solutions Pvt. Ltd. All rights reserved. Registered in India & UAE.
          </div>

          <div className="footer-social-links">
            <a href="https://www.linkedin.com/company/d-genius-solutions/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            <a href="https://www.instagram.com/dgenius_solutions/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://www.facebook.com/DGeniussolutions/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
            <a href="https://www.youtube.com/@dgeniussolutionspvtltd4060" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
            <a href="https://www.wikidata.org/wiki/Q139267427" target="_blank" rel="noopener noreferrer" aria-label="Wikidata">Wikidata</a>
            <a href="https://www.crunchbase.com/organization/d-genius-solutions" target="_blank" rel="noopener noreferrer" aria-label="Crunchbase">Crunchbase</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-footer {
          background: #040507;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: clamp(60px, 8vw, 100px);
          padding-bottom: clamp(30px, 4vw, 50px);
          position: relative;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1.2fr;
          gap: clamp(30px, 4vw, 50px);
          margin-bottom: clamp(40px, 5vw, 64px);
        }

        .footer-logo-img {
          height: 38px;
          width: auto;
          object-fit: contain;
          margin-bottom: 18px;
        }

        .footer-tagline {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.6;
          margin-bottom: 22px;
          max-width: 340px;
        }

        .footer-contacts {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 22px;
        }

        .footer-contact-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.8);
          transition: color 0.2s ease;
        }

        .footer-contact-item:hover {
          color: var(--accent);
        }

        .footer-clocks {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .clock-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .clock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .footer-heading {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-list a {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
        }

        .footer-links-list a:hover {
          color: #FFFFFF;
          transform: translateX(4px);
          display: inline-block;
        }

        .footer-location-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          font-size: 0.82rem;
        }

        .footer-location-card strong {
          color: #FFFFFF;
          display: block;
          margin-bottom: 4px;
        }

        .footer-location-card p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.4;
        }

        .footer-ai-copy-box {
          margin-top: 16px;
          background: rgba(0, 242, 254, 0.04);
          border: 1px dashed rgba(0, 242, 254, 0.2);
          border-radius: var(--radius-sm);
          padding: 12px;
        }

        .ai-copy-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--teal);
          display: block;
          margin-bottom: 4px;
        }

        .ai-copy-text {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0;
          line-height: 1.35;
        }

        .footer-bottom-bar {
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-social-links {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footer-social-links a {
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.2s ease;
        }

        .footer-social-links a:hover {
          color: var(--accent);
        }

        @media (max-width: 1024px) {
          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .footer-top-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-bar {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
