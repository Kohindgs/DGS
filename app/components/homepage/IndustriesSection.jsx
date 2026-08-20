'use client';

import React from 'react';
import styles from './homepage.module.css';
import { industriesData } from '../../data/homepageData';

export default function IndustriesSection() {
  return (
    <section className={`${styles.industriesSection} dgs-section`} id="industries">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Industry Specializations</span>
          </div>
          <h2 className={styles.titleMain}>
            Industries We <span className={styles.titleGradient}>Accelerate</span>
          </h2>
          <p className={styles.subtitle}>
            Bespoke digital growth systems tailored for high-consideration, highly-regulated, and category-defining enterprises.
          </p>
        </div>

        {/* 6 Industry Pillars Grid */}
        <div className={styles.industriesGrid6}>
          {industriesData.map((ind) => (
            <div key={ind.id} className={styles.industryModularCard}>
              <div className={styles.industryCardTop}>
                <span className={styles.industryBadge}>DOMAIN EXPERTISE</span>
                <span className={styles.industryIconGlyph}>✦</span>
              </div>

              <h3 className={styles.industryTitle}>{ind.title}</h3>
              <p className={styles.industryDesc}>{ind.description}</p>

              <div className={styles.industryClientsBox}>
                <div className={styles.industryClientsLabel}>NOTABLE CLIENTS:</div>
                <div className={styles.industryClientsVal}>{ind.clients}</div>
              </div>

              <div className={styles.industryFocusBox}>
                <div className={styles.industryFocusLabel}>STRATEGIC FOCUS:</div>
                <div className={styles.industryFocusVal}>{ind.focus}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
