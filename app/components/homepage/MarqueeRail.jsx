import React from 'react';
import styles from './homepage.module.css';

const capabilitiesRow1 = [
  'Search Engine Optimisation',
  'Answer Engine Optimisation',
  'Generative Search Visibility (GEO)',
  'LLM Brand Visibility',
  'Voice Search Readiness',
  'AI-Led Creative Production'
];

const capabilitiesRow2 = [
  'Full-Stack Web Development',
  'Performance Marketing & Meta Ads',
  'Google Ads & Shopping ROI',
  '360° Social Media Strategy',
  'Brand Identity & Creative Systems',
  'Conversion Rate Optimization'
];

export default function MarqueeRail() {
  return (
    <div className={styles.marqueeSection} aria-hidden="true">
      <div className={styles.marqueeEdgeLeft}></div>
      <div className={styles.marqueeEdgeRight}></div>

      {/* Row 1: Left */}
      <div className={`${styles.marqueeTrack} ${styles.marqueeRowLeft}`}>
        {[...capabilitiesRow1, ...capabilitiesRow1, ...capabilitiesRow1].map((item, idx) => (
          <span key={idx} className={styles.marqueeItem}>
            <span>{item}</span>
            <span className={styles.marqueeDivider}>✦</span>
          </span>
        ))}
      </div>

      {/* Row 2: Right */}
      <div className={`${styles.marqueeTrack} ${styles.marqueeRowRight}`}>
        {[...capabilitiesRow2, ...capabilitiesRow2, ...capabilitiesRow2].map((item, idx) => (
          <span key={idx} className={styles.marqueeItem}>
            <span>{item}</span>
            <span className={styles.marqueeDivider}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
