'use client';

import React, { useState, useEffect } from 'react';
import styles from './homepage.module.css';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations
  const parallaxOffset = Math.min(scrollY * 0.15, 60);

  return (
    <section className={styles.heroSection} id="home-hero">
      <div className="dgs-container-wide">
        <div className={styles.heroGrid}>
          
          {/* Left Content */}
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot}></span>
              <span>AI-Powered Digital Growth Studio • Est. 2021</span>
            </div>

            <h1 className={styles.heroHeadline}>
              Full Service <br />
              <span className={styles.titleGradient}>Digital Marketing</span> <br />
              Agency In Mumbai
            </h1>

            <p className={styles.heroSubtext}>
              D’Genius Solutions connects search visibility, website architectures, social media, performance marketing, high-impact branding and AI-led creative production into one cohesive revenue engine.
            </p>

            <div className={styles.heroCtas}>
              <a href="#audit-form" className={styles.btnPrimary}>
                <span>Get A Growth Audit</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>

              <a href="#services" className={styles.btnSecondary}>
                <span>Explore Ecosystem</span>
              </a>
            </div>

            <div className={styles.heroChips}>
              <span className={`${styles.heroChip} ${styles.heroChipActive}`}>SEO • AEO • GEO</span>
              <span className={styles.heroChip}>Generative AI Studio</span>
              <span className={styles.heroChip}>Web Development</span>
              <span className={styles.heroChip}>Performance Media</span>
            </div>
          </div>

          {/* Right Visual Stage (Layered Depth Frame) */}
          <div className={styles.heroMediaStage} style={{ transform: `translateY(-${parallaxOffset}px)` }}>
            <div className={styles.heroMediaGlow}></div>
            
            <div className={styles.heroMediaCard}>
              <img 
                src="https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp" 
                alt="D'Genius Solutions AI-Led Creative & Digital Marketing Visual"
                className={styles.heroMediaImg}
                loading="eager"
              />
            </div>

            {/* Floating Badge 1 */}
            <div className={styles.floatingBadge1}>
              <div className={styles.badgeIconWrap}>#1</div>
              <div>
                <div className={styles.badgeCopyTitle}>AI Ranking</div>
                <div className={styles.badgeCopySub}>Google & Perplexity AEO</div>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div className={styles.floatingBadge2}>
              <div className={styles.badgeIconWrap}>✦</div>
              <div>
                <div className={styles.badgeCopyTitle}>200+ Global Brands</div>
                <div className={styles.badgeCopySub}>Mumbai • Dubai • Global</div>
              </div>
            </div>

          </div>

        </div>

        {/* Proof Ribbon */}
        <div className={styles.heroProofRibbon}>
          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>200<span className={styles.proofNumberHighlight}>+</span></div>
            <div className={styles.proofLabel}>Brands Scaled Worldwide</div>
          </div>

          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>20M<span className={styles.proofNumberHighlight}>+</span></div>
            <div className={styles.proofLabel}>Audience Reach Generated</div>
          </div>

          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>4.9<span className={styles.proofNumberHighlight}>/5</span></div>
            <div className={styles.proofLabel}>Clutch & Google Verified Rating</div>
          </div>

          <div className={styles.proofItem}>
            <div className={styles.proofNumber}>100<span className={styles.proofNumberHighlight}>%</span></div>
            <div className={styles.proofLabel}>Connected Search & Creative Stack</div>
          </div>
        </div>

      </div>
    </section>
  );
}
