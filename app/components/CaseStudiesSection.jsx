'use client';

import React from 'react';
import { caseStudiesData } from '../data/homepageData';

export default function CaseStudiesSection({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-case-studies-section" id="case-studies" aria-label="Growth Case Studies">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>VERIFIED REVENUE IMPACT</span>
          </div>
          <h2 className="section-title">
            Case Studies: Measurable Market Dominance
          </h2>
          <p className="section-desc">
            Real enterprise data. Verifiable organic acquisition surges. Zero fabricated vanity metrics. Here is how we engineer competitive separation for our brand partners.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="case-studies-grid">
          {caseStudiesData.map((cs) => (
            <div key={cs.id} className="case-card glass-card">
              <div className="case-card-header">
                <div className="case-client-box">
                  <img
                    src={cs.logo}
                    alt={cs.client}
                    className="case-client-logo"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="case-client-name">{cs.client}</h3>
                    <span className="case-industry-tag">{cs.industry}</span>
                  </div>
                </div>

                <div className="case-services-tags">
                  {cs.services.map((svc, sIdx) => (
                    <span key={sIdx} className="case-svc-pill">{svc}</span>
                  ))}
                </div>
              </div>

              <div className="case-headline-box">
                <div className="case-headline">{cs.headline}</div>
              </div>

              <p className="case-summary">{cs.summary}</p>

              {/* Metrics Row */}
              <div className="case-metrics-row">
                {cs.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="case-metric-box">
                    <div className="metric-val">{m.value}</div>
                    <div className="metric-lbl">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Case Studies Footer CTA */}
        <div className="case-footer-box text-center">
          <p className="case-footer-text">
            Want to see how these exact frameworks apply to your industry and brand?
          </p>
          <button type="button" className="btn-primary" onClick={onOpenAudit}>
            Get a Customized Growth Teardown →
          </button>
        </div>
      </div>

      <style jsx>{`
        .dgs-case-studies-section {
          background: #060709;
          position: relative;
        }

        .text-center {
          text-align: center;
        }

        .section-head {
          max-width: 900px;
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

        .case-studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: clamp(24px, 3vw, 36px);
          margin-bottom: clamp(48px, 6vw, 64px);
        }

        .case-card {
          padding: clamp(24px, 3vw, 36px);
          border-radius: var(--radius-xl);
          background: rgba(14, 18, 26, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }

        .case-card:hover {
          transform: translateY(-6px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(253, 92, 98, 0.12);
        }

        .case-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .case-client-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .case-client-logo {
          max-height: 38px;
          max-width: 100px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
        }

        .case-client-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 2px 0;
        }

        .case-industry-tag {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .case-services-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .case-svc-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--teal);
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .case-headline-box {
          margin-bottom: 14px;
        }

        .case-headline {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.3;
        }

        .case-summary {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
          flex: 1;
        }

        .case-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          padding: 16px 12px;
          text-align: center;
        }

        .metric-val {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--accent);
          margin-bottom: 4px;
        }

        .metric-lbl {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.3;
        }

        .case-footer-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 760px;
          margin: 0 auto;
        }

        .case-footer-text {
          font-size: 1.05rem;
          color: #FFFFFF;
          margin-bottom: 18px;
        }

        @media (max-width: 540px) {
          .case-metrics-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}
