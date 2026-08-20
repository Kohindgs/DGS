'use client';

import React from 'react';
import styles from './homepage.module.css';

const marqueeItems = [
  'Enterprise SEO & AEO Dominance',
  'Next.js High-Performance Engineering',
  'Cinema-Grade Generative AI Video',
  'Brand Architecture & Visual Systems',
  'Multi-Channel Performance Paid Media',
  '200+ Brands Scaled on Word-of-Mouth',
  '100% Operational Transparency',
  'Khar West Mumbai • Dubai • Global',
];

export default function MarqueeRail() {
  return (
    <div className={styles.marqueeContainer} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {[...marqueeItems, ...marqueeItems].map((item, idx) => (
          <div key={idx} className={styles.marqueeItem}>
            <span className={styles.marqueeBullet}>✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
