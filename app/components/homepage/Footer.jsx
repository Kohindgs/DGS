'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [mapOpen, setMapOpen] = useState(false);
  const [aiToast, setAiToast] = useState('');

  const copyAiPrompt = (modelName, promptText) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(promptText);
      setAiToast(`Copied prompt for ${modelName}! Paste it into ${modelName}.`);
      setTimeout(() => setAiToast(''), 4000);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#04060a',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: 'clamp(60px, 8vw, 90px) clamp(16px, 4vw, 48px) 36px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="dgs-container-wide">
        
        {/* Top AI Summary Shortcuts Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px 24px',
            marginBottom: 'clamp(48px, 6vw, 64px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#00f5d4', fontSize: '1rem' }}>✦</span>
            <span style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600 }}>
              TEST DGS ENTITY RETRIEVAL ON AI ENGINES:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => copyAiPrompt('ChatGPT', 'Summarize D\'Genius Solutions digital marketing agency in Mumbai, their client results, and SEO/AI capabilities.')}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ChatGPT 📋
            </button>
            <button
              onClick={() => copyAiPrompt('Perplexity', 'What are the core strengths and client reviews for D\'Genius Solutions Mumbai?')}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Perplexity 📋
            </button>
            <button
              onClick={() => copyAiPrompt('Gemini', 'Give an overview of D\'Genius Solutions digital growth studio services.')}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Gemini 📋
            </button>
            <button
              onClick={() => copyAiPrompt('Claude', 'Detailed evaluation of D\'Genius Solutions SEO and AI marketing agency.')}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Claude 📋
            </button>
          </div>
        </div>

        {aiToast && (
          <div style={{ textAlign: 'center', color: '#00f5d4', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>
            ✓ {aiToast}
          </div>
        )}

        {/* 4-Column Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(32px, 4vw, 48px)',
            marginBottom: 'clamp(48px, 6vw, 64px)',
          }}
        >
          {/* Column 1: Brand Info */}
          <div>
            <img
              src="https://www.dgeniussolutions.com/wp-content/uploads/2025/11/DGS-LOGO-3.webp"
              alt="D'Genius Solutions Digital Growth Studio"
              style={{ height: '42px', width: 'auto', marginBottom: '18px', objectFit: 'contain' }}
            />
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Premier Digital Growth Studio in Mumbai. Uniting search architecture, Next.js engineering, AI creative production, and performance media into one compounding growth engine.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '8px 14px' }}>
              <span style={{ color: '#FFB800', fontSize: '0.9rem' }}>★★★★★</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>5.0 Rating on Clutch</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '18px' }}>
              Studio Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Home Overview</Link></li>
              <li><Link href="/about-us" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>About Our Founders</Link></li>
              <li><Link href="#portfolio" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Portfolio Gallery</Link></li>
              <li><Link href="#case-studies" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Enterprise Case Studies</Link></li>
              <li><Link href="#strategy" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Operating Approach</Link></li>
              <li><Link href="#awards" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Awards &amp; Recognition</Link></li>
              <li><Link href="#audit-form" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Request Growth Audit</Link></li>
            </ul>
          </div>

          {/* Column 3: Core Disciplines */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '18px' }}>
              Core Disciplines
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/services/seo-services-in-mumbai" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>SEO Services Mumbai</Link></li>
              <li><Link href="#search-authority" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Answer Engine Optimization (AEO)</Link></li>
              <li><Link href="#search-authority" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Generative Engine Optimization (GEO)</Link></li>
              <li><Link href="/services/ai-video-production-agency" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>AI-Led Video Production</Link></li>
              <li><Link href="#services" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Next.js Web Engineering</Link></li>
              <li><Link href="#services" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textDecoration: 'none' }}>Performance Paid Media</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '18px' }}>
              Mumbai Studio (HQ)
            </h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              Unit 202, Amore Edge, SV Road, Khar West, Mumbai 400052
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', marginBottom: '6px' }}>
              📞 +91 99879 22901 / +91 85919 50238
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', marginBottom: '16px' }}>
              ✉️ business@dgeniussolutions.com
            </p>

            <button
              onClick={() => setMapOpen(!mapOpen)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(0, 245, 212, 0.4)',
                color: '#00f5d4',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {mapOpen ? 'Hide Studio Map' : 'View Mumbai Studio Map ↗'}
            </button>
          </div>
        </div>

        {/* Map Drawer */}
        {mapOpen && (
          <div style={{ marginBottom: '40px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8267232230055!2d72.83332137596542!3d19.072834382131976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c96dc03cf8cb%3A0x7d287bb2e683f2a1!2sD\'Genius%20Solutions!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DGS Mumbai Office Location"
            ></iframe>
          </div>
        )}

        {/* Copyright & Legal Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.84rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <div>
            © 2026 D&apos;Genius Solutions Pvt. Ltd. All Rights Reserved. Mumbai • Dubai • Global.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>Privacy Policy</Link>
            <span>•</span>
            <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>Sitemap</Link>
            <span>•</span>
            <button
              onClick={scrollToTop}
              style={{ background: 'none', border: 'none', color: '#00f5d4', cursor: 'pointer', fontWeight: 600 }}
            >
              Back to Top ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
