'use client';

import React from 'react';
import styles from './homepage.module.css';
import { clientReferences } from '../../data/homepageData';

export default function TestimonialsSection() {
  return (
    <section className={`${styles.testimonialsSection} dgs-section`} id="testimonials">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Verified Client Endorsements</span>
          </div>
          <h2 className={styles.titleMain}>
            Built On Trust, <span className={styles.titleGradient}>Grown By References</span>
          </h2>
          <p className={styles.subtitle}>
            Every project is a partnership. Since 2021, D’Genius Solutions has grown organically through direct client recommendations and enduring multi-year mandates.
          </p>
        </div>

        {/* References Grid */}
        <div className={styles.referencesGrid}>
          {clientReferences.map((ref) => (
            <div key={ref.id} className={styles.referenceCard}>
              <div className={styles.referenceTop}>
                <span className={styles.referenceBadge}>LONG-TERM MANDATE</span>
                <div className={styles.referenceDomain}>{ref.domain}</div>
              </div>

              <h3 className={styles.referenceClientName}>{ref.client}</h3>
              <div className={styles.referenceFocus}>{ref.focus}</div>
              <p className={styles.referenceHighlight}>&ldquo;{ref.highlight}&rdquo;</p>

              <div className={styles.referenceFooter}>
                <span className={styles.referenceFootDot}></span>
                <span>Verified Strategic Partner</span>
              </div>
            </div>
          ))}
        </div>

        {/* Clutch Score Proof Anchor */}
        <div className={styles.clutchProofAnchor}>
          <div className={styles.clutchBadgeBox}>
            <span className={styles.clutchStars}>★★★★★</span>
            <span className={styles.clutchScoreText}>5.0 / 5.0 Rating</span>
          </div>
          <div className={styles.clutchDescText}>
            Verified Client Satisfaction &amp; Agency Culture on Clutch &amp; Google Reviews
          </div>
        </div>

      </div>
    </section>
  );
}
