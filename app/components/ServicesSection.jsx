'use client';

import React from 'react';
import Link from 'next/link';
import { servicesData } from '../data/homepageData';

export default function ServicesSection({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-services-section" id="services" aria-label="Core Capabilities and Services">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>CONNECTED GROWTH SYSTEM</span>
          </div>
          <h2 className="section-title">
            Six Specialized Studios. One Integrated Growth Engine.
          </h2>
          <p className="section-desc">
            We eliminate fragmented agency silos. Our engineering, search science, AI creative, and performance teams work in synchrony to capture demand and scale revenue.
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {servicesData.map((svc) => (
            <div key={svc.id} className="service-card glass-card">
              <div className="service-card-top">
                <span className="service-number">{svc.number}</span>
                <span className="service-badge">{svc.badge}</span>
              </div>

              <h3 className="service-title">{svc.title}</h3>
              <div className="service-subtitle">{svc.subtitle}</div>
              <p className="service-desc">{svc.description}</p>

              <div className="service-capabilities-box">
                <div className="capabilities-label">Core Deliverables:</div>
                <ul className="capabilities-list">
                  {svc.capabilities.map((cap, cIdx) => (
                    <li key={cIdx} className="capability-item">
                      <span className="cap-check">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-card-bottom">
                <Link href={svc.link} className="service-link-btn">
                  <span>Explore Studio</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global Strategy Consultation Box */}
        <div className="services-consultation-bar glass-card">
          <div>
            <h3 className="consult-title">Need a Cross-Channel Strategy Architecture?</h3>
            <p className="consult-desc">Our studio heads will conduct a forensic teardown of your current search visibility, website speed, and creative performance.</p>
          </div>
          <button type="button" className="btn-primary" onClick={onOpenAudit}>
            Schedule Architecture Briefing →
          </button>
        </div>
      </div>

      <style jsx>{`
        .dgs-services-section {
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

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: clamp(24px, 3vw, 36px);
          margin-bottom: clamp(48px, 6vw, 64px);
        }

        .service-card {
          padding: clamp(28px, 3vw, 40px);
          border-radius: var(--radius-xl);
          background: rgba(14, 18, 26, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
        }

        .service-card:hover {
          transform: translateY(-6px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(253, 92, 98, 0.12);
        }

        .service-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .service-number {
          font-family: var(--font-mono);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--accent);
        }

        .service-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--teal);
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 3px 10px;
          border-radius: 9999px;
        }

        .service-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 8px;
          line-height: 1.25;
        }

        .service-subtitle {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 14px;
        }

        .service-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .service-capabilities-box {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          padding: 18px;
          margin-bottom: 28px;
          flex: 1;
        }

        .capabilities-label {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .capabilities-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .capability-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }

        .cap-check {
          color: var(--teal);
          font-weight: bold;
        }

        .service-card-bottom {
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .service-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          font-weight: 600;
          color: #FFFFFF;
          transition: all 0.2s ease;
        }

        .service-link-btn:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .services-consultation-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: clamp(28px, 3.5vw, 40px);
          border-radius: var(--radius-xl);
          background: rgba(18, 22, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 24px;
        }

        .consult-title {
          font-size: clamp(1.2rem, 1.8vw, 1.6rem);
          color: #FFFFFF;
          margin-bottom: 6px;
        }

        .consult-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        @media (max-width: 860px) {
          .services-consultation-bar {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
