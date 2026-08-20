'use client';

import React from 'react';
import styles from './homepage.module.css';
import { awardsData } from '../../data/homepageData';

export default function AwardsSection() {
  return (
    <section className={styles.awardsSection + ' dgs-section'} id="awards">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Industry Recognition</span>
          </div>
          <h2 className={styles.titleMain}>
            Recognized for <span className={styles.titleGradient}>Excellence &amp; Impact</span>
          </h2>
          <p className={styles.subtitle}>
            Honored across workplace culture, technical search mastery, and full-stack creative execution.
          </p>
        </div>

        {/* Awards Trophy Grid */}
        <div className={styles.awardsTrophyGrid}>
          {awardsData.map((award) => (
            <div key={award.id} className={styles.awardTrophyCard}>
              <div className={styles.awardImageWrap}>
                <img
                  src={award.image}
                  alt={award.issuer + ' ' + award.title + ' award'}
                  className={styles.awardTrophyImg}
                  loading="lazy"
                />
              </div>

              <div className={styles.awardContentWrap}>
                <div className={styles.awardBadgeLine}>
                  <span className={styles.awardYearPill}>{award.year}</span>
                  <span className={styles.awardIssuerName}>{award.issuer}</span>
                </div>

                <h3 className={styles.awardTrophyTitle}>{award.title}</h3>
                <div className={styles.awardCategorySub}>{award.category}</div>
                <p className={styles.awardTrophyDesc}>{award.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Clutch Proof Ribbon */}
        <div className={styles.clutchRibbonContainer}>
          <div className={styles.clutchRibbonLeft}>
            <img
              src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/t_clutch-5-star3208.logowik.com_.webp"
              alt="Clutch 5-star verified review badge"
              className={styles.clutchBadgeLogo}
              loading="lazy"
            />
            <div className={styles.clutchStarsText}>★★★★★</div>
          </div>
          <div className={styles.clutchRibbonText}>
            <strong>5.0 / 5.0 Rating on Clutch</strong> — Verified Independent Client Review Score for Strategic Execution &amp; Agency Culture.
          </div>
        </div>

      </div>
    </section>
  );
}
