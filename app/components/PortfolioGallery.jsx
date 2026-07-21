'use client';

import { useState } from 'react';

const PORTFOLIO_ITEMS = [
  {
    id: 1,
    category: 'ai-video',
    title: 'AI Avatar Brand Campaign — NextGen Finance',
    tag: 'AI Video Production',
    accentColor: 'linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(157, 78, 221, 0.2))',
    icon: '🎬',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: '+450% Engagement Rate',
  },
  {
    id: 2,
    category: 'seo-aeo',
    title: 'Perplexity & Google AI Overview Takeover — D2C Unicorn',
    tag: 'SEO, AEO, GEO & LLM',
    accentColor: 'linear-gradient(135deg, rgba(253, 92, 98, 0.4), rgba(157, 78, 221, 0.2))',
    icon: '🧠',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: '#1 Rank in AI Overview',
  },
  {
    id: 3,
    category: 'web-dev',
    title: 'Ultra-Performance 3D Web App — Luxury Retail',
    tag: 'Website Development',
    accentColor: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(0, 212, 255, 0.2))',
    icon: '💻',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: '99/100 Core Web Vitals',
  },
  {
    id: 4,
    category: 'performance',
    title: 'High-ROAS Meta & Paid Search Funnel — E-Commerce Brand',
    tag: 'Performance Marketing',
    accentColor: 'linear-gradient(135deg, rgba(247, 215, 87, 0.3), rgba(253, 92, 98, 0.2))',
    icon: '📈',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: '8.4x Verified ROAS',
  },
  {
    id: 5,
    category: 'social',
    title: 'Viral Social Media Campaign — FMCG India',
    tag: 'Social Media Marketing',
    accentColor: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(99, 102, 241, 0.3))',
    icon: '📱',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: '12M+ Organic Views',
  },
  {
    id: 6,
    category: 'branding',
    title: 'Complete Brand Identity & Visual Asset System — FinTech SaaS',
    tag: 'Branding & Content Creation',
    accentColor: 'linear-gradient(135deg, rgba(157, 78, 221, 0.4), rgba(253, 92, 98, 0.2))',
    icon: '🎨',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metrics: 'Global Brand Launch',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Showcase' },
  { id: 'ai-video', label: 'AI Video Production' },
  { id: 'seo-aeo', label: 'SEO, AEO, GEO & LLM' },
  { id: 'web-dev', label: 'Website Development' },
  { id: 'performance', label: 'Performance Marketing' },
  { id: 'social', label: 'Social Media' },
  { id: 'branding', label: 'Branding & Content' },
];

export default function PortfolioGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredItems =
    activeCategory === 'all'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <>
      <div className="portfolio-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`portfolio-filter-tab ${
              activeCategory === cat.id ? 'active' : ''
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="dgs-v1215-case-visual-grid dgs-ai-content-container">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="dgs-v1215-case-visual-card portfolio-item-card dgs-v1215-reveal"
          >
            <div
              className="dgs-v1215-case-media"
              style={{
                background: item.accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '4rem', opacity: 0.85 }}>{item.icon}</div>
              
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, transparent 40%, rgba(5,5,8,0.95) 100%)',
                }}
              />

              <button
                onClick={() => setActiveVideo(item)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 212, 255, 0.95)',
                  border: 'none',
                  color: '#050508',
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 35px rgba(0, 212, 255, 0.7)',
                  transition: 'transform 0.3s ease',
                  zIndex: 5,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
                aria-label={`Play preview for ${item.title}`}
              >
                ▶
              </button>
            </div>

            <div className="dgs-v1215-case-content">
              <span>{item.tag}</span>
              <h3>{item.title}</h3>
              <div className="dgs-v1215-case-metrics" style={{ marginTop: '1rem' }}>
                <div>
                  <strong>{item.metrics}</strong>
                  <small>Verified Client Result</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Lightbox Modal */}
      {activeVideo && (
        <div
          onClick={() => setActiveVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(5, 5, 8, 0.94)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(900px, 95vw)',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 212, 255, 0.3)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            <button
              onClick={() => setActiveVideo(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.2rem',
              }}
            >
              ✕
            </button>
            <iframe
              src={`${activeVideo.videoUrl}?autoplay=1`}
              title={activeVideo.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
