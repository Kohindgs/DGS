'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [talkModalOpen, setTalkModalOpen] = useState(false);
  const [talkSubmitted, setTalkSubmitted] = useState(false);

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

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'var(--header-height, 84px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 48px)',
          backgroundColor: scrolled || mobileMenuOpen ? 'rgba(4, 6, 10, 0.92)' : 'transparent',
          backdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand Logo & Studio HUD Dot */}
        <Link 
          href="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10001, textDecoration: 'none' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="https://www.dgeniussolutions.com/wp-content/uploads/2026/02/cropped-DGS-LOGO-1.webp"
            alt="D'Genius Solutions Digital Growth Studio Logo"
            style={{ height: 'clamp(36px, 4vw, 48px)', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ display: 'none', flexDirection: 'column', gap: '2px' }} className="dgs-logo-hud">
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.68rem', letterSpacing: '0.12em', color: '#00f5d4', fontWeight: 600 }}>
              ● LIVE STUDIO
            </span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em' }}>
              MUMBAI // DUBAI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 'clamp(16px, 1.8vw, 28px)',
          }}
          className="dgs-desktop-nav"
        >
          <Link href="#services" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Services
          </Link>
          <Link href="#ai-studio" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            AI Studio
          </Link>
          <Link href="#portfolio" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Portfolio
          </Link>
          <Link href="#case-studies" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Case Studies
          </Link>
          <Link href="#strategy" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Protocol
          </Link>
          <Link href="#search-authority" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Search &amp; AEO
          </Link>
          <Link href="#clients" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            Clients
          </Link>
          <Link href="#faq" style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.8)' }}>
            FAQ
          </Link>
        </nav>

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10001 }}>
          <button
            onClick={() => setTalkModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#00f5d4',
              color: '#04060a',
              fontFamily: 'var(--font-display, Syne, sans-serif)',
              fontSize: 'clamp(0.78rem, 0.95vw, 0.86rem)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '10px 22px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 245, 212, 0.3)',
              transition: 'all 0.25s ease',
            }}
          >
            <span>GET AUDIT</span>
            <span>→</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            className="dgs-mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '18px', lineHeight: 1 }}>✕</span>
            ) : (
              <span style={{ fontSize: '18px', lineHeight: 1 }}>☰</span>
            )}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 10, 0.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'calc(var(--header-height, 84px) + 20px) clamp(20px, 6vw, 40px) 36px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Services &amp; Capabilities
            </Link>
            <Link 
              href="#ai-studio" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Generative AI Studio
            </Link>
            <Link 
              href="#portfolio" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Creative Portfolio
            </Link>
            <Link 
              href="#case-studies" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Enterprise Case Studies
            </Link>
            <Link 
              href="#strategy" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Operating Protocol
            </Link>
            <Link 
              href="#search-authority" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Search &amp; AEO Authority
            </Link>
            <Link 
              href="#clients" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              200+ Client Logos
            </Link>
            <Link 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}
            >
              Frequently Asked Questions
            </Link>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginTop: '28px' }}>
            <div style={{ color: '#00f5d4', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
              MUMBAI HEADQUARTERS
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Unit 202, Amore Edge, SV Road, Khar West, Mumbai 400052 <br />
              +91 99879 22901 / business@dgeniussolutions.com
            </div>
          </div>
        </div>
      )}

      {/* Quick Consultation Modal */}
      {talkModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
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
              backgroundColor: '#0a0e16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: 'clamp(24px, 5vw, 36px)',
              position: 'relative',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setTalkModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '22px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', marginBottom: '6px' }}>
              Initiate Consultation
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Direct dialogue with DGS strategy leadership. Response within 24 hours.
            </p>

            {talkSubmitted ? (
              <div style={{ backgroundColor: 'rgba(0, 245, 212, 0.08)', border: '1px solid #00f5d4', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#ffffff' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Message Dispatched!</div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.7)' }}>A senior strategist will contact you directly.</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setTalkSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 14px', color: '#ffffff', fontSize: '0.92rem', outline: 'none' }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 14px', color: '#ffffff', fontSize: '0.92rem', outline: 'none' }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone / WhatsApp"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 14px', color: '#ffffff', fontSize: '0.92rem', outline: 'none' }}
                  />
                  <textarea
                    placeholder="Brief description of brand objectives..."
                    rows={3}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 14px', color: '#ffffff', fontSize: '0.92rem', resize: 'none', outline: 'none' }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#00f5d4',
                    color: '#04060a',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '13px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 245, 212, 0.35)',
                  }}
                >
                  Send Brief →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Media query styling for header */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1100px) {
          .dgs-desktop-nav {
            display: flex !important;
          }
          .dgs-logo-hud {
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
