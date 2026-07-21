'use client';

import { useState } from 'react';

const PORTFOLIO_ITEMS = [
  { id: 1, category: 'ai-video', title: 'AI Avatar Brand Campaign', client: 'NextGen Finance', tag: 'AI Video Production', gradient: 'linear-gradient(135deg, #7c5cfc 0%, #3ecfb4 100%)', metric: '+450%', metricLabel: 'Engagement Rate' },
  { id: 2, category: 'seo-aeo', title: 'Google AI Overview Takeover', client: 'D2C Unicorn Brand', tag: 'SEO · AEO · GEO', gradient: 'linear-gradient(135deg, #f0734f 0%, #7c5cfc 100%)', metric: '#1', metricLabel: 'AI Overview Rank' },
  { id: 3, category: 'web-dev', title: 'Interactive 3D Web Experience', client: 'Luxury Retail Group', tag: 'Website Development', gradient: 'linear-gradient(135deg, #3ecfb4 0%, #5b6abf 100%)', metric: '100/100', metricLabel: 'Core Web Vitals' },
  { id: 4, category: 'performance', title: 'Multi-Channel Paid Funnel', client: 'E-Commerce Brand', tag: 'Performance Marketing', gradient: 'linear-gradient(135deg, #f0734f 0%, #e8c547 100%)', metric: '8.4×', metricLabel: 'Verified ROAS' },
  { id: 5, category: 'social', title: 'Viral Social Campaign', client: 'FMCG India', tag: 'Social Media Marketing', gradient: 'linear-gradient(135deg, #5b6abf 0%, #3ecfb4 100%)', metric: '12M+', metricLabel: 'Organic Views' },
  { id: 6, category: 'branding', title: 'Complete Brand Identity System', client: 'FinTech SaaS', tag: 'Branding & Content', gradient: 'linear-gradient(135deg, #7c5cfc 0%, #f0734f 100%)', metric: 'Global', metricLabel: 'Brand Launch' },
];

const FILTERS = [
  { id: 'all', label: 'All Work' },
  { id: 'ai-video', label: 'AI Video' },
  { id: 'seo-aeo', label: 'SEO / AEO / GEO' },
  { id: 'web-dev', label: 'Web Dev' },
  { id: 'performance', label: 'Paid Media' },
  { id: 'social', label: 'Social' },
  { id: 'branding', label: 'Branding' },
];

export default function PortfolioGallery() {
  const [filter, setFilter] = useState('all');

  const items = filter === 'all'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter((p) => p.category === filter);

  return (
    <>
      <div className="dgs-portfolio-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`dgs-filter-btn ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="dgs-portfolio-grid">
        {items.map((item) => (
          <article key={item.id} className="dgs-portfolio-card dgs-tilt dgs-reveal">
            {/* Gradient visual background */}
            <div
              className="dgs-portfolio-media"
              style={{ background: item.gradient, width: '100%', height: '100%' }}
            />

            {/* Overlay content */}
            <div className="dgs-portfolio-overlay">
              <span className="dgs-portfolio-category">{item.tag}</span>
              <h3 className="dgs-portfolio-card-title">{item.title}</h3>
            </div>

            {/* Metric badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(8,9,10,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              zIndex: 5,
            }}>
              <strong style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8e8e6' }}>{item.metric}</strong>
              <span style={{ fontSize: '0.65rem', color: '#8a8f98', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.metricLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
