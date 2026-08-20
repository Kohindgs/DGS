'use client';

import React from 'react';
import { testimonialsData } from '../data/homepageData';

export default function TestimonialsSection() {
  return (
    <section className="dgs-section dgs-testimonials-section" id="testimonials" aria-label="Client Endorsements">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>VERIFIED CLIENT PRAISE</span>
          </div>
          <h2 className="section-title">
            Trusted by Enterprise Leaders & Brand Visionaries
          </h2>
          <p className="section-desc">
            Direct feedback from marketing managers and brand leaders who partner with DGS to drive quantifiable growth.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {testimonialsData.map((t) => (
            <div key={t.id} className="testimonial-card glass-card">
              <div className="testimonial-header">
                <div className="star-rating">
                  {'★'.repeat(t.rating)}
                </div>
                <span className="verified-pill">✓ Verified Client</span>
              </div>

              <p className="testimonial-quote">"{t.quote}"</p>

              <div className="testimonial-author-box">
                <div className="author-avatar">{t.avatarBadge}</div>
                <div>
                  <div className="author-name">{t.author}</div>
                  <div className="author-role">{t.role} · <span className="author-company">{t.company}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dgs-testimonials-section {
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

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: clamp(20px, 3vw, 32px);
        }

        .testimonial-card {
          padding: clamp(24px, 3vw, 36px);
          border-radius: var(--radius-xl);
          background: rgba(18, 22, 32, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 183, 3, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .testimonial-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .star-rating {
          color: #FFB703;
          font-size: 1.1rem;
          letter-spacing: 2px;
        }

        .verified-pill {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #10B981;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .testimonial-quote {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.65;
          font-style: italic;
          margin-bottom: 28px;
          flex: 1;
        }

        .testimonial-author-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, #FF8F94 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .author-name {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .author-role {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .author-company {
          color: var(--accent);
          font-weight: 600;
        }
      `}</style>
    </section>
  );
}
