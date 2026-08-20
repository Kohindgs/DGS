'use client';

import React from 'react';

export default function CtaBanner({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-cta-banner-section" aria-label="Final Growth Consultation Call to Action">
      <div className="dgs-container">
        <div className="cta-banner-card glass-card">
          <div className="cta-banner-glow"></div>
          
          <div className="cta-banner-content text-center">
            <div className="dgs-eyebrow">
              <span className="dgs-eyebrow-dot"></span>
              <span>CONFIDENTIAL GROWTH CONSULTATION</span>
            </div>

            <h2 className="cta-title">
              Ready to Outrank, Outshine, and Outconvert Your Competition?
            </h2>

            <p className="cta-desc">
              Claim your complimentary 360° Digital Growth Audit. Our senior strategists will perform a forensic analysis of your organic search footprint, LLM entity presence, web performance, and paid acquisition funnels.
            </p>

            <div className="cta-actions">
              <button
                type="button"
                className="btn-primary cta-main-btn"
                onClick={onOpenAudit}
              >
                <span>Claim Your 360° Growth Audit</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <a href="tel:+919987922901" className="btn-secondary cta-phone-btn">
                <span>Call Hotline: +91 99879 22901</span>
              </a>
            </div>

            {/* Studio Markers */}
            <div className="cta-locations">
              <span className="loc-item">📍 <strong>Mumbai Studio:</strong> Khar West, Mumbai 400052</span>
              <span className="loc-sep">·</span>
              <span className="loc-item">📍 <strong>Dubai Office:</strong> UAE Representative Hub</span>
              <span className="loc-sep">·</span>
              <span className="loc-item">✉️ <strong>Email:</strong> business@dgeniussolutions.com</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-cta-banner-section {
          background: #060709;
          position: relative;
          padding-bottom: clamp(80px, 10vw, 140px);
        }

        .cta-banner-card {
          position: relative;
          border-radius: var(--radius-xl);
          padding: clamp(48px, 6vw, 84px) clamp(24px, 4vw, 56px);
          background: radial-gradient(circle at 50% 0%, rgba(253, 92, 98, 0.16) 0%, rgba(14, 18, 26, 0.95) 75%);
          border: 1px solid rgba(253, 92, 98, 0.35);
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(253, 92, 98, 0.15);
        }

        .cta-banner-glow {
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(circle, rgba(253, 92, 98, 0.3) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .cta-banner-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        .text-center {
          text-align: center;
        }

        .cta-title {
          font-size: clamp(2.2rem, 4.2vw, 3.8rem);
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 20px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .cta-desc {
          font-size: clamp(1rem, 1.3vw, 1.2rem);
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.65;
          margin: 0 auto clamp(32px, 4vw, 48px);
          max-width: 780px;
        }

        .cta-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: clamp(36px, 4vw, 48px);
        }

        .cta-main-btn {
          font-size: 1.05rem;
          padding: 16px 36px;
        }

        .cta-phone-btn {
          font-size: 1.05rem;
          padding: 16px 32px;
        }

        .cta-locations {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.6);
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .loc-sep {
          color: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 600px) {
          .cta-actions {
            flex-direction: column;
            width: 100%;
          }
          .cta-main-btn, .cta-phone-btn {
            width: 100%;
          }
          .loc-sep {
            display: none;
          }
          .cta-locations {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </section>
  );
}
