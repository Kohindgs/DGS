'use client';

import React from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';
import ThreeDgsCanvas from './ThreeDgsCanvas';

export default function HeroSection() {
  return (
    <section className={styles.heroSection} id="home-hero">
      {/* 1. Signature 3D Growth Prism Layer */}
      <ThreeDgsCanvas />

      {/* 2. Architectural Watermark */}
      <div className={styles.heroWatermark} aria-hidden="true">
        D&apos;GENIUS
      </div>

      {/* 3. Controlled Background Gradient Backdrop (Ensures WCAG AAA Readability) */}
      <div className={styles.heroBackdropGradient} aria-hidden="true"></div>

      {/* 4. Foreground Content Container */}
      <div className="dgs-container-wide" style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        
        {/* Top Studio Identification Bar */}
        <div className={styles.heroTopBar}>
          <div className={styles.heroStudioPill}>
            <span className={styles.studioStatusDot}></span>
            <span>MUMBAI (KHAR WEST) • DUBAI • EST. 2021</span>
          </div>
          <div className={styles.heroTrustBadge}>
            <span>200+ BRANDS SCALED ON REFERRALS</span>
          </div>
        </div>

        {/* Main Editorial Hero Layout */}
        <div className={styles.heroMainGrid}>
          <div className={styles.heroContentCol}>
            
            {/* Kicker */}
            <div className={styles.heroKicker}>
              <span className={styles.kickerIcon}>✦</span>
              <span>PREMIUM DIGITAL GROWTH STUDIO</span>
            </div>

            {/* Main H1 Headline */}
            <h1 className={styles.heroMainTitle}>
              Full-Service <br />
              <span className={styles.heroTitleGradient}>Digital Marketing</span> <br />
              Agency in Mumbai
            </h1>

            {/* Approved Brand Value Proposition */}
            <p className={styles.heroDescription}>
              One connected team uniting <strong>Search Authority (SEO / AEO / GEO)</strong>, high-performance <strong>Next.js web engineering</strong>, cinema-grade <strong>AI creative production</strong>, and <strong>performance marketing</strong> into one compounding growth engine.
            </p>

            {/* Action Buttons */}
            <div className={styles.heroActionsRow}>
              <a href="#audit-form" className={styles.btnPrimary}>
                <span>REQUEST GROWTH AUDIT</span>
                <span className={styles.btnArrow}>→</span>
              </a>

              <a href="#services" className={styles.btnSecondary}>
                <span>EXPLORE CAPABILITIES</span>
                <span className={styles.btnArrowDown}>↓</span>
              </a>
            </div>

            {/* Quick Capability Anchors */}
            <div className={styles.heroCapPills}>
              <a href="#services" className={styles.capPill}>
                <span className={styles.capPillDot}></span>
                <span>SEO &amp; AI Discovery</span>
              </a>
              <a href="#ai-studio" className={styles.capPill}>
                <span className={styles.capPillDot}></span>
                <span>Generative AI Studio</span>
              </a>
              <a href="#portfolio" className={styles.capPill}>
                <span className={styles.capPillDot}></span>
                <span>Creative Portfolio</span>
              </a>
              <a href="#case-studies" className={styles.capPill}>
                <span className={styles.capPillDot}></span>
                <span>Case Studies</span>
              </a>
            </div>

          </div>

          {/* Right Column: Executive Summary & Trust Anchor */}
          <div className={styles.heroSummaryCol}>
            <div className={styles.heroSummaryCard}>
              <div className={styles.summaryCardHeader}>
                <span className={styles.summaryCardTag}>STUDIO PILLARS</span>
                <span className={styles.summaryCardClutch}>★★★★★ 5.0 Clutch</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>FOUNDING LEADERSHIP</div>
                <div className={styles.summaryValue}>Sneha &amp; Kohin Bellara (34+ Combined Yrs)</div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>OPERATING MODEL</div>
                <div className={styles.summaryValue}>100% Transparency • Senior Strategic Pods</div>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>SEARCH &amp; AI MASTERY</div>
                <div className={styles.summaryValue}>Traditional SEO + Perplexity / ChatGPT AEO</div>
              </div>

              <div className={styles.summaryCardFooter}>
                <a href="#clients" className={styles.summaryLink}>
                  <span>Trusted by Kotak, Eureka Forbes, Novotel &amp; 200+ brands</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
