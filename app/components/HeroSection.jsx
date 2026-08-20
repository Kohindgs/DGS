'use client';

import React from 'react';

export default function HeroSection({ onOpenAudit }) {
  return (
    <section className="dgs-hero-section" id="hero" aria-label="Hero Introduction">
      {/* Dynamic Ambient Mesh Glows */}
      <div className="hero-glow-coral"></div>
      <div className="hero-glow-teal"></div>
      <div className="hero-grid-pattern"></div>

      <div className="dgs-container hero-container">
        <div className="hero-content">
          {/* Eyebrow badge */}
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>MUMBAI · DUBAI — NEXT-GEN DIGITAL GROWTH STUDIO</span>
          </div>

          {/* Main Typographic Headline */}
          <h1 className="hero-title">
            Architecting Market Dominance for Brands That Refuse to Be Ignored.
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            We converge Enterprise SEO, Generative AI Creative, AEO/GEO Search Authority, and Precision Performance into an unstoppable growth engine for forward-thinking market leaders.
          </p>

          {/* CTA Cluster */}
          <div className="hero-cta-cluster">
            <button
              type="button"
              className="btn-primary hero-btn-main"
              onClick={onOpenAudit}
            >
              <span>Claim Custom Growth Blueprint</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <a href="#services" className="btn-secondary hero-btn-sub">
              <span>Explore Capabilities</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>
          </div>

          {/* Growth Telemetry Bar */}
          <div className="hero-telemetry-bar">
            <div className="telemetry-item">
              <div className="telemetry-value">1.82M+</div>
              <div className="telemetry-label">Monthly Organic Clicks</div>
            </div>
            <div className="telemetry-sep"></div>
            <div className="telemetry-item">
              <div className="telemetry-value">450+</div>
              <div className="telemetry-label">Enterprise Campaigns</div>
            </div>
            <div className="telemetry-sep"></div>
            <div className="telemetry-item">
              <div className="telemetry-value">99.4%</div>
              <div className="telemetry-label">Client Retention</div>
            </div>
            <div className="telemetry-sep"></div>
            <div className="telemetry-item">
              <div className="telemetry-value">#1 Cited</div>
              <div className="telemetry-label">AI / Perplexity Brand Authority</div>
            </div>
          </div>
        </div>

        {/* Layered Visual Hero Stage */}
        <div className="hero-visual-stage">
          <div className="hero-media-frame">
            <img
              src="https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp"
              alt="D'Genius Solutions AI-Led Strategic Growth Engine"
              width="800"
              height="600"
              className="hero-main-visual"
              loading="eager"
            />
            <div className="hero-visual-overlay"></div>

            {/* Spatial Floating Badge 1 */}
            <div className="floating-badge badge-top-left glass-card">
              <div className="badge-icon-box coral">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div>
                <div className="badge-title">AI Overviews Grounded</div>
                <div className="badge-sub">#1 Citation in Perplexity & ChatGPT</div>
              </div>
            </div>

            {/* Spatial Floating Badge 2 */}
            <div className="floating-badge badge-bottom-right glass-card">
              <div className="badge-icon-box teal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div>
                <div className="badge-title">Compounding Growth</div>
                <div className="badge-sub">Sub-Second Next.js Core Vitals</div>
              </div>
            </div>

            {/* Spatial Floating Badge 3 */}
            <div className="floating-badge badge-bottom-left glass-card">
              <div className="badge-icon-box gold">
                ★
              </div>
              <div>
                <div className="badge-title">Clutch 5.0 Rated</div>
                <div className="badge-sub">Top 1% Digital Growth Studio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-hero-section {
          position: relative;
          min-height: 100vh;
          padding-top: clamp(120px, 14vw, 180px);
          padding-bottom: clamp(60px, 8vw, 100px);
          overflow: hidden;
          background: radial-gradient(circle at 50% 10%, #101522 0%, #060709 75%);
        }

        .hero-glow-coral {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 500px;
          background: radial-gradient(circle, rgba(253, 92, 98, 0.16) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .hero-glow-teal {
          position: absolute;
          top: 30%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, transparent 70%);
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }

        .hero-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.4;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .hero-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-content {
          max-width: 1080px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: clamp(2.4rem, 5.2vw, 4.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.08;
          color: #FFFFFF;
          margin-bottom: clamp(16px, 2.5vw, 26px);
          text-wrap: balance;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 1.35vw, 1.25rem);
          color: rgba(255, 255, 255, 0.75);
          max-width: 820px;
          margin: 0 auto clamp(28px, 3.5vw, 44px);
          line-height: 1.65;
          font-weight: 400;
        }

        .hero-cta-cluster {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: clamp(40px, 5vw, 64px);
        }

        .hero-btn-main {
          font-size: 1.05rem;
          padding: 16px 36px;
        }

        .hero-btn-sub {
          font-size: 1.05rem;
          padding: 16px 32px;
        }

        .hero-telemetry-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(18, 22, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          padding: clamp(16px, 2vw, 24px) clamp(20px, 3vw, 40px);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        }

        .telemetry-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .telemetry-value {
          font-family: var(--font-display);
          font-size: clamp(1.4rem, 2vw, 2rem);
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #FFFFFF 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .telemetry-label {
          font-family: var(--font-sans);
          font-size: clamp(0.72rem, 0.85vw, 0.82rem);
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
        }

        .telemetry-sep {
          width: 1px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
        }

        .hero-visual-stage {
          position: relative;
          width: 100%;
          max-width: 1100px;
          margin-top: clamp(48px, 6vw, 72px);
        }

        .hero-media-frame {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(253, 92, 98, 0.12);
          background: #090C12;
        }

        .hero-main-visual {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          display: block;
          transform: scale(1.01);
          transition: transform 0.8s ease;
        }

        .hero-media-frame:hover .hero-main-visual {
          transform: scale(1.03);
        }

        .hero-visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6, 7, 9, 0.6) 0%, transparent 50%, rgba(6, 7, 9, 0.2) 100%);
          pointer-events: none;
        }

        .floating-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          z-index: 2;
          text-align: left;
          animation: float-slow 4s infinite ease-in-out;
        }

        .badge-top-left {
          top: 24px;
          left: 24px;
        }

        .badge-bottom-right {
          bottom: 24px;
          right: 24px;
          animation-delay: 1.5s;
        }

        .badge-bottom-left {
          bottom: 24px;
          left: 24px;
          animation-delay: 2.5s;
        }

        .badge-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .badge-icon-box.coral {
          background: rgba(253, 92, 98, 0.2);
          color: var(--accent);
          border: 1px solid rgba(253, 92, 98, 0.4);
        }

        .badge-icon-box.teal {
          background: rgba(0, 242, 254, 0.2);
          color: var(--teal);
          border: 1px solid rgba(0, 242, 254, 0.4);
        }

        .badge-icon-box.gold {
          background: rgba(255, 183, 3, 0.2);
          color: var(--amber);
          border: 1px solid rgba(255, 183, 3, 0.4);
          font-size: 1.1rem;
        }

        .badge-title {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .badge-sub {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 860px) {
          .hero-telemetry-bar {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .telemetry-sep {
            display: none;
          }
          .floating-badge {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .hero-telemetry-bar {
            grid-template-columns: 1fr;
          }
          .hero-cta-cluster {
            flex-direction: column;
            width: 100%;
          }
          .hero-btn-main, .hero-btn-sub {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
