'use client';

import React from 'react';
import { industriesData } from '../data/homepageData';

export default function IndustriesSection({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-industries-section" id="industries" aria-label="Industries We Transform">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>DOMAIN EXPERTISE</span>
          </div>
          <h2 className="section-title">
            Deep Domain Playbooks for High-Growth Sectors
          </h2>
          <p className="section-desc">
            We understand the exact buyer journeys, compliance mandates, and conversion dynamics across these high-value industry verticals.
          </p>
        </div>

        {/* Industries Grid */}
        <div className="industries-grid">
          {industriesData.map((ind) => (
            <div key={ind.id} className="industry-card glass-card">
              <h3 className="industry-title">{ind.title}</h3>
              <p className="industry-desc">{ind.description}</p>

              <div className="industry-footer">
                <div className="industry-clients-box">
                  <span className="ind-label">Client Partners:</span>
                  <span className="ind-clients">{ind.clients}</span>
                </div>
                <div className="industry-impact-box">
                  <span className="ind-impact">✦ {ind.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dgs-industries-section {
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

        .industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: clamp(20px, 3vw, 32px);
        }

        .industry-card {
          padding: clamp(24px, 3vw, 36px);
          border-radius: var(--radius-xl);
          background: rgba(18, 22, 32, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }

        .industry-card:hover {
          transform: translateY(-5px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .industry-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 10px;
        }

        .industry-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
          flex: 1;
        }

        .industry-footer {
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .industry-clients-box {
          font-size: 0.82rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ind-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
        }

        .ind-clients {
          color: #FFFFFF;
          font-weight: 600;
        }

        .industry-impact-box {
          background: rgba(253, 92, 98, 0.08);
          border: 1px solid rgba(253, 92, 98, 0.2);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
        }

        .ind-impact {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--accent);
        }
      `}</style>
    </section>
  );
}
