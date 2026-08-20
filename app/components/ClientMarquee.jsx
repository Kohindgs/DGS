'use client';

import React from 'react';
import { clientLogos } from '../data/homepageData';

export default function ClientMarquee() {
  const row1 = clientLogos.slice(0, 10);
  const row2 = clientLogos.slice(10);

  return (
    <section className="dgs-section dgs-client-marquee-section" aria-label="Enterprise Clients">
      <div className="dgs-container text-center">
        <div className="dgs-eyebrow">
          <span className="dgs-eyebrow-dot"></span>
          <span>PROVEN ENTERPRISE IMPACT</span>
        </div>
        <h2 className="section-title">
          Trusted by Industry Titans Across Banking, Retail, Education & Tech
        </h2>
      </div>

      {/* Marquee Row 1 (Left) */}
      <div className="marquee-wrapper">
        <div className="marquee-fade-left"></div>
        <div className="marquee-fade-right"></div>

        <div className="marquee-row marquee-left">
          <div className="marquee-track">
            {row1.map((logo, idx) => (
              <div key={idx} className="logo-card">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.name}
                  className="client-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {row1.map((logo, idx) => (
              <div key={'r1-' + idx} className="logo-card">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.name}
                  className="client-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Right) */}
        <div className="marquee-row marquee-right">
          <div className="marquee-track">
            {row2.map((logo, idx) => (
              <div key={idx} className="logo-card">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.name}
                  className="client-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {row2.map((logo, idx) => (
              <div key={'r2-' + idx} className="logo-card">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.name}
                  className="client-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-client-marquee-section {
          padding-top: clamp(60px, 8vw, 100px);
          padding-bottom: clamp(60px, 8vw, 100px);
          background: #080A0E;
        }

        .text-center {
          text-align: center;
          margin-bottom: clamp(36px, 4vw, 56px);
        }

        .section-title {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          max-width: 860px;
          margin: 0 auto;
          color: #FFFFFF;
        }

        .marquee-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .marquee-fade-left, .marquee-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: clamp(60px, 12vw, 200px);
          z-index: 2;
          pointer-events: none;
        }

        .marquee-fade-left {
          left: 0;
          background: linear-gradient(to right, #080A0E 0%, transparent 100%);
        }

        .marquee-fade-right {
          right: 0;
          background: linear-gradient(to left, #080A0E 0%, transparent 100%);
        }

        .marquee-row {
          display: flex;
          width: max-content;
          margin-bottom: 20px;
        }

        .marquee-row:hover .marquee-track {
          animation-play-state: paused;
        }

        .marquee-left .marquee-track {
          animation: marqueeScrollLeft 38s linear infinite;
        }

        .marquee-right .marquee-track {
          animation: marqueeScrollRight 38s linear infinite;
        }

        .marquee-track {
          display: flex;
          gap: 20px;
          padding-right: 20px;
        }

        .logo-card {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(160px, 18vw, 220px);
          height: 80px;
          background: rgba(18, 22, 32, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          padding: 12px 24px;
          transition: all 0.3s ease;
        }

        .logo-card:hover {
          background: rgba(28, 34, 48, 0.8);
          border-color: rgba(253, 92, 98, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .client-logo-img {
          max-width: 100%;
          max-height: 48px;
          object-fit: contain;
          opacity: 0.7;
          filter: grayscale(40%) brightness(1.2);
          transition: all 0.3s ease;
        }

        .logo-card:hover .client-logo-img {
          opacity: 1;
          filter: grayscale(0%) brightness(1.4);
        }

        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
