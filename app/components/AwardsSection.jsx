'use client';

import React from 'react';
import { awardsData } from '../data/homepageData';

export default function AwardsSection() {
  return (
    <section className="dgs-section dgs-awards-section" id="awards" aria-label="Awards and Recognition">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>INDUSTRY RECOGNITION & AUTHORITY</span>
          </div>
          <h2 className="section-title">
            Celebrated by Leading Industry Authorities
          </h2>
          <p className="section-desc">
            Independent accolades honoring our breakthroughs in AI-accelerated creative workflows, high-performance SEO architectures, and elite agency workplace culture.
          </p>
        </div>

        {/* Awards Grid */}
        <div className="awards-grid">
          {awardsData.map((award) => (
            <div key={award.id} className="award-card glass-card">
              <div className="award-badge-ribbon">{award.badge}</div>

              <div className="award-trophy-box">
                <img
                  src={award.image}
                  alt={award.title}
                  className="award-trophy-img"
                  loading="lazy"
                />
                <div className="award-trophy-glow"></div>
              </div>

              <div className="award-meta">
                <span className="award-issuer">{award.issuer}</span>
                <span className="award-year">· {award.year}</span>
              </div>

              <h3 className="award-title">{award.title}</h3>
              <p className="award-desc">{award.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar */}
        <div className="trust-badges-bar glass-card">
          <div className="trust-item">
            <div className="trust-stars">★★★★★</div>
            <div className="trust-label">Clutch Top 1% Agency</div>
            <div className="trust-sub">5.0 Verified Client Reviews</div>
          </div>
          <div className="trust-sep"></div>
          <div className="trust-item">
            <div className="trust-stars">★★★★★</div>
            <div className="trust-label">Google Verified Partner</div>
            <div className="trust-sub">4.9 / 5 Rating from 120+ Brands</div>
          </div>
          <div className="trust-sep"></div>
          <div className="trust-item">
            <div className="trust-stat">100%</div>
            <div className="trust-label">IP & Code Ownership</div>
            <div className="trust-sub">Zero Vendor Lock-in</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-awards-section {
          background: #090B0F;
          position: relative;
        }

        .text-center {
          text-align: center;
        }

        .section-head {
          max-width: 860px;
          margin: 0 auto clamp(40px, 5vw, 64px);
        }

        .section-title {
          font-size: clamp(2rem, 3.5vw, 3.2rem);
          margin-bottom: 16px;
          color: #FFFFFF;
        }

        .section-desc {
          font-size: clamp(0.95rem, 1.2vw, 1.12rem);
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .awards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: clamp(20px, 3vw, 32px);
          margin-bottom: clamp(40px, 5vw, 60px);
        }

        .award-card {
          position: relative;
          padding: clamp(28px, 3vw, 40px) clamp(20px, 2.5vw, 32px);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(18, 22, 32, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .award-card:hover {
          transform: translateY(-6px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(253, 92, 98, 0.15);
        }

        .award-badge-ribbon {
          position: absolute;
          top: 18px;
          right: 18px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent);
          background: rgba(253, 92, 98, 0.1);
          border: 1px solid rgba(253, 92, 98, 0.3);
          padding: 4px 10px;
          border-radius: 9999px;
        }

        .award-trophy-box {
          position: relative;
          width: 140px;
          height: 140px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .award-trophy-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6));
          transition: transform 0.4s ease;
        }

        .award-card:hover .award-trophy-img {
          transform: scale(1.08);
        }

        .award-trophy-glow {
          position: absolute;
          inset: 10px;
          background: radial-gradient(circle, rgba(255, 183, 3, 0.25) 0%, transparent 70%);
          filter: blur(20px);
          z-index: 0;
        }

        .award-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .award-title {
          font-size: clamp(1.2rem, 1.6vw, 1.45rem);
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 12px;
          line-height: 1.25;
        }

        .award-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.6;
        }

        .trust-badges-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: clamp(20px, 3vw, 32px);
          border-radius: var(--radius-xl);
          background: rgba(14, 18, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
        }

        .trust-stars {
          color: #FFB703;
          font-size: 1.2rem;
          letter-spacing: 2px;
        }

        .trust-stat {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--teal);
        }

        .trust-label {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .trust-sub {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.55);
        }

        .trust-sep {
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 768px) {
          .trust-badges-bar {
            flex-direction: column;
            gap: 24px;
          }
          .trust-sep {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
