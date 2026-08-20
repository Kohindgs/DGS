'use client';

import React from 'react';

export default function CapabilityRail() {
  const capabilities = [
    'SEARCH ENGINE DOMINANCE',
    'GENERATIVE ENGINE OPTIMIZATION (GEO)',
    'AI VIDEO & 3D PRODUCTION',
    'ENTERPRISE NEXT.JS WEB DEVELOPMENT',
    'CONVERSATIONAL & ANSWER ENGINE OPTIMIZATION (AEO)',
    'HIGH-ROAS PERFORMANCE MARKETING',
    'BRAND IDENTITY & PACKAGING',
    'REVENUE OPERATIONS & AMC',
  ];

  return (
    <div className="dgs-capability-rail" aria-label="Capabilities Ticker">
      <div className="ticker-track">
        <div className="ticker-content">
          {capabilities.map((c, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-star">✦</span>
              <span className="ticker-text">{c}</span>
            </span>
          ))}
        </div>
        <div className="ticker-content" aria-hidden="true">
          {capabilities.map((c, i) => (
            <span key={'repeat-' + i} className="ticker-item">
              <span className="ticker-star">✦</span>
              <span className="ticker-text">{c}</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dgs-capability-rail {
          width: 100%;
          background: #060709;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 18px 0;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 35s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 0 28px;
        }

        .ticker-star {
          color: var(--accent);
          font-size: 1.1rem;
        }

        .ticker-text {
          font-family: var(--font-mono);
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
        }

        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
