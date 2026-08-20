'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
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
          height: 'var(--header-height, 80px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(16px, 4vw, 48px)',
          backgroundColor: scrolled || mobileMenuOpen ? 'rgba(6, 9, 15, 0.95)' : 'transparent',
          backdropFilter: scrolled || mobileMenuOpen ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled || mobileMenuOpen ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Brand Logo & Studio Sub-label */}
        <Link 
          href="/" 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10001, textDecoration: 'none' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/DGS-LOGO-3.webp"
            alt="D'Genius Solutions Digital Growth Studio Logo"
            style={{ height: 'clamp(36px, 3.5vw, 46px)', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} className="dgs-logo-sub">
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#00f5d4', fontWeight: 600 }}>
              DIGITAL GROWTH STUDIO
            </span>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.04em' }}>
              MUMBAI · DUBAI
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
          <Link href="#services" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            Services
          </Link>
          <Link href="#ai-studio" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            AI Studio
          </Link>
          <Link href="#portfolio" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            Portfolio
          </Link>
          <Link href="#case-studies" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            Case Studies
          </Link>
          <Link href="#strategy" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            Approach
          </Link>
          <Link href="#search-authority" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            Search &amp; AEO
          </Link>
          <Link href="/about-us" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none' }}>
            About
          </Link>
        </nav>

        {/* Action Header Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="#audit-form"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#00f5d4',
              color: '#04060a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <span>REQUEST AUDIT</span>
            <span style={{ fontSize: '1rem' }}>→</span>
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '8px',
            }}
            className="dgs-mobile-hamburger"
            aria-label="Toggle navigation menu"
          >
            <span style={{ display: 'block', width: '100%', height: '2px', backgroundColor: '#fff', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'transform 0.2s' }}></span>
            <span style={{ display: 'block', width: '100%', height: '2px', backgroundColor: '#fff', opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 0.2s' }}></span>
            <span style={{ display: 'block', width: '100%', height: '2px', backgroundColor: '#fff', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'transform 0.2s' }}></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height, 80px)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#06090f',
            zIndex: 9998,
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          <Link 
            href="#services" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            Core Services
          </Link>
          <Link 
            href="#ai-studio" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            AI Creative Studio
          </Link>
          <Link 
            href="#portfolio" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            Portfolio Gallery
          </Link>
          <Link 
            href="#case-studies" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            Case Studies
          </Link>
          <Link 
            href="#strategy" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            Operating Approach
          </Link>
          <Link 
            href="#search-authority" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            Search Authority &amp; AEO
          </Link>
          <Link 
            href="/about-us" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            About Founders &amp; Heritage
          </Link>

          <a
            href="#audit-form"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              marginTop: '16px',
              backgroundColor: '#00f5d4',
              color: '#04060a',
              textAlign: 'center',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            Initiate Growth Audit →
          </a>
        </div>
      )}
    </>
  );
}
