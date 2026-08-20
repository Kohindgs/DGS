'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [talkModalOpen, setTalkModalOpen] = useState(false);
  const [talkFormSubmitted, setTalkFormSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setTalkModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openTalkModal = (e) => {
    if (e) e.preventDefault();
    setTalkModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--header-height, 88px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 48px)',
          backgroundColor: scrolled || mobileMenuOpen ? 'rgba(6, 7, 9, 0.94)' : 'transparent',
          backdropFilter: scrolled || mobileMenuOpen ? 'blur(18px)' : 'none',
          WebkitBackdropFilter: scrolled || mobileMenuOpen ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          transition: 'all 0.35s ease',
        }}
      >
        {/* Brand Logo */}
        <Link 
          href="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10001 }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO-1.webp"
            alt="D'Genius Solutions Digital Growth Studio Logo"
            style={{ height: 'clamp(38px, 4.5vw, 52px)', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'clamp(18px, 2vw, 32px)',
          }}
          className="dgs-desktop-nav"
        >
          <Link href="#services" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Services
          </Link>
          <Link href="#clients" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Clients
          </Link>
          <Link href="#awards" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Awards
          </Link>
          <Link href="#ai-studio" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            AI Studio
          </Link>
          <Link href="#portfolio" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Portfolio
          </Link>
          <Link href="#case-studies" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Results
          </Link>
          <Link href="#testimonials" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            Reviews
          </Link>
          <Link href="#faq" style={{ fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.85)' }}>
            FAQ
          </Link>
        </nav>

        {/* Right Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10001 }}>
          <button
            onClick={openTalkModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--dgs-primary, #FD5C62)',
              color: '#ffffff',
              fontFamily: 'var(--font-heading, Space Grotesk, sans-serif)',
              fontSize: 'clamp(0.78rem, 1vw, 0.88rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: 'clamp(8px, 1.2vw, 12px) clamp(16px, 2vw, 24px)',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(253, 92, 98, 0.35)',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
            }}
          >
            <span>Let's Talk</span>
            <span>→</span>
          </button>

          {/* Mobile Menu Trigger Button */}
          <button
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            className="dgs-mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '20px', lineHeight: 1 }}>✕</span>
            ) : (
              <span style={{ fontSize: '20px', lineHeight: 1 }}>☰</span>
            )}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 7, 9, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'calc(var(--header-height, 88px) + 24px) clamp(20px, 6vw, 48px) 36px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Link 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Services & Capabilities
            </Link>
            <Link 
              href="#clients" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              200+ Client Logos
            </Link>
            <Link 
              href="#awards" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Awards & Recognition
            </Link>
            <Link 
              href="#ai-studio" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Generative AI Studio
            </Link>
            <Link 
              href="#portfolio" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Creative Portfolio
            </Link>
            <Link 
              href="#case-studies" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Growth Case Studies
            </Link>
            <Link 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Client Endorsements
            </Link>
            <Link 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Frequently Asked Questions
            </Link>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', marginTop: '32px' }}>
            <div style={{ color: 'var(--dgs-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '8px' }}>
              Mumbai HQ
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Unit 202, Amore Edge, SV Road, Khar West, Mumbai 400052 <br />
              +91 99879 22901 / business@dgeniussolutions.com
            </div>
          </div>
        </div>
      )}

      {/* Talk / Consultation Modal */}
      {talkModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setTalkModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#0d0f14',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: 'clamp(24px, 5vw, 40px)',
              position: 'relative',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setTalkModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff', marginBottom: '8px' }}>
              Start A Conversation
            </h3>
            <p style={{ color: 'var(--dgs-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Tell us about your brand goals and we'll connect you directly with a senior growth strategist.
            </p>

            {talkFormSubmitted ? (
              <div style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', border: '1px solid var(--dgs-accent-cyan)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#ffffff' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Message Sent!</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--dgs-text-secondary)' }}>We will contact you shortly.</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setTalkFormSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem' }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Work Email"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem' }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone / Mobile"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem' }}
                  />
                  <textarea
                    placeholder="Tell us what you want to scale or build..."
                    rows={3}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 16px', color: '#ffffff', fontSize: '0.95rem', resize: 'none' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--dgs-primary, #FD5C62)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '14px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(253, 92, 98, 0.4)',
                  }}
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Media query styling for desktop vs mobile nav */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .dgs-desktop-nav {
            display: flex !important;
          }
          .dgs-mobile-menu-btn {
            display: none !important;
          }
        }
      ` }} />
    </>
  );
}
