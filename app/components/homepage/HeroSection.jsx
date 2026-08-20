'use client';

import React, { useState, useEffect } from 'react';
import styles from './homepage.module.css';
import ThreeDgsCanvas from './ThreeDgsCanvas';

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={styles.heroSection} id="home-hero">
      {/* 1. Interactive 3D WebGL Centerpiece Layer */}
      <ThreeDgsCanvas />

      {/* 2. Giant Architectural Background Typography Watermark */}
      <div 
        className={styles.heroWatermark}
        style={{
          transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0)`,
        }}
        aria-hidden="true"
      >
        D&apos;GENIUS
      </div>

      {/* 3. Ambient Atmospheric Grid & Depth Grain */}
      <div className={styles.heroGridOverlay} aria-hidden="true"></div>

      {/* 4. Foreground Content Container */}
      <div className="dgs-container-wide" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Spatial HUD Topline */}
        <div className={styles.heroHudTop}>
          <div className={styles.hudCoord}>
            <span className={styles.hudRadarDot}></span>
            <span>19.0728° N, 72.8359° E • MUMBAI • KHAR WEST</span>
          </div>
          <div className={styles.hudBadge}>
            <span>DIGITAL GROWTH & AI STUDIO • EST. 2021</span>
          </div>
          <div className={styles.hudStatus}>
            <span className={styles.hudStatusTag}>200+ BRANDS SCALED</span>
          </div>
        </div>

        {/* Asymmetric Editorial Hero Core */}
        <div className={styles.heroMainLayout}>
          <div className={styles.heroCopyCol}>
            
            <div className={styles.heroKicker}>
              <span className={styles.heroKickerNumber}>01 //</span>
              <span className={styles.heroKickerText}>THE NEW FRONTIER OF DIGITAL ACCELERATION</span>
            </div>

            <h1 className={styles.heroSpatialTitle}>
              <span className={styles.titleLine1}>COGNITIVE AI</span>
              <span className={styles.titleLine2}>MEETS SPATIAL</span>
              <span className={styles.titleLine3}>
                <span className={styles.titleGradientText}>GROWTH.</span>
              </span>
            </h1>

            <p className={styles.heroEditorialPara}>
              D’Genius Solutions is a Next-Gen Digital Marketing &amp; AI Studio in Mumbai. We unite Enterprise SEO, Generative Engine Optimization (GEO/AEO), high-performance Next.js engineering, Hollywood-grade AI creative production, and precision performance media into one compounding growth engine.
            </p>

            {/* Magnetic Interactive CTA Deck */}
            <div className={styles.heroCtaDeck}>
              <a href="#audit-form" className={styles.btnSpatialPrimary}>
                <span className={styles.btnGlowSweep}></span>
                <span className={styles.btnLabel}>INITIATE GROWTH AUDIT</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>

              <a href="#services" className={styles.btnSpatialGhost}>
                <span>EXPLORE CAPABILITIES</span>
                <span className={styles.btnGhostBorder}></span>
              </a>
            </div>

            {/* Spatial Capability Rail Anchors */}
            <div className={styles.heroCapabilityAnchors}>
              <a href="#services" className={styles.heroCapItem}>
                <span className={styles.capDot}></span>
                <span>SEO &amp; AEO Authority</span>
              </a>
              <a href="#ai-studio" className={styles.heroCapItem}>
                <span className={styles.capDot}></span>
                <span>Generative AI Studio</span>
              </a>
              <a href="#portfolio" className={styles.heroCapItem}>
                <span className={styles.capDot}></span>
                <span>Spatial Brand Identity</span>
              </a>
              <a href="#strategy" className={styles.heroCapItem}>
                <span className={styles.capDot}></span>
                <span>Connected Growth</span>
              </a>
            </div>

          </div>

          {/* Right Spatial Depth Anchor with Live Diagnostic Telemetry */}
          <div className={styles.heroTelemetryCol}>
            <div className={styles.telemetryCard}>
              <div className={styles.telemetryHeader}>
                <span className={styles.telemetryTag}>SYSTEM DIAGNOSTIC</span>
                <span className={styles.telemetryPulse}>LIVE</span>
              </div>
              <div className={styles.telemetryDivider}></div>
              
              <div className={styles.telemetryMetric}>
                <div className={styles.telemetryLabel}>CAPABILITY CORE</div>
                <div className={styles.telemetryValue}>Search + AI + Web + Performance</div>
              </div>

              <div className={styles.telemetryMetric}>
                <div className={styles.telemetryLabel}>FOUNDING LEADERSHIP</div>
                <div className={styles.telemetryValue}>34+ Combined Yrs · Kohin &amp; Sneha Bellara</div>
              </div>

              <div className={styles.telemetryMetric}>
                <div className={styles.telemetryLabel}>GROWTH PHILOSOPHY</div>
                <div className={styles.telemetryValue}>100% Transparency · Pure Word-of-Mouth</div>
              </div>

              <div className={styles.telemetryFooter}>
                <span className={styles.telemetryFootCoord}>KHAR W, MUMBAI // DUBAI UAE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spatial Navigation Cue */}
        <div className={styles.heroBottomBar}>
          <a href="#clients" className={styles.heroScrollCue}>
            <span className={styles.scrollCueLine}></span>
            <span className={styles.scrollCueText}>SCROLL TO EXPLORE SPATIAL SYSTEM</span>
            <span className={styles.scrollCueIcon}>↓</span>
          </a>
        </div>

      </div>
    </section>
  );
}
