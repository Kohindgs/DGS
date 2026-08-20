'use client';

import React from 'react';
import { whyDgsPillars } from '../data/homepageData';

export default function WhyDgsSection({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-why-section" id="why-dgs" aria-label="Why Brands Choose DGS">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>THE UNFAIR ADVANTAGE</span>
          </div>
          <h2 className="section-title">
            Why Market Leaders Choose D'Genius Solutions
          </h2>
          <p className="section-desc">
            Four structural competitive advantages that differentiate our studio from conventional, slow-moving agencies.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="why-grid">
          {whyDgsPillars.map((p) => (
            <div key={p.number} className="why-card glass-card">
              <div className="why-number">{p.number}</div>
              <h3 className="why-title">{p.title}</h3>
              <div className="why-tagline">{p.tagline}</div>
              <p className="why-desc">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dgs-why-section {
          background: #060709;
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

        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: clamp(24px, 3vw, 36px);
        }

        .why-card {
          padding: clamp(28px, 3.5vw, 40px);
          border-radius: var(--radius-xl);
          background: rgba(14, 18, 26, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }

        .why-card:hover {
          transform: translateY(-6px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(253, 92, 98, 0.12);
        }

        .why-number {
          font-family: var(--font-mono);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .why-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .why-tagline {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--teal);
          margin-bottom: 16px;
        }

        .why-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.65;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
