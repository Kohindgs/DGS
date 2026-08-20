'use client';

import React from 'react';
import styles from './homepage.module.css';
import { whyDgsPillars } from '../../data/homepageData';

export default function WhyDgsSection() {
  return (
    <section className={`${styles.whySection} dgs-section`} id="why-dgs">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Why Brands Choose DGS</span>
          </div>
          <h2 className={styles.titleMain}>
            Built On Transparency. <br />
            <span className={styles.titleGradient}>Engineered For Compounding ROI.</span>
          </h2>
          <p className={styles.subtitle}>
            We operate as an extended marketing and engineering pod, eliminating conflicting agency incentives and building enduring digital equity.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className={styles.whyPillarsGrid}>
          {whyDgsPillars.map((p) => (
            <div key={p.number} className={styles.whyPillarCard}>
              <div className={styles.whyPillarNum}>{p.number}</div>
              <h3 className={styles.whyPillarTitle}>{p.title}</h3>
              <div className={styles.whyPillarTagline}>{p.tagline}</div>
              <p className={styles.whyPillarDesc}>{p.description}</p>
            </div>
          ))}
        </div>

        {/* Authentic Founder & Studio Heritage Spotlight */}
        <div className={styles.founderHeritageBox}>
          <div className={styles.founderHeritageContent}>
            <div className={styles.heritageEyebrow}>STUDIO HERITAGE • EST. 2021</div>
            <h3 className={styles.heritageTitle}>Founded by Sneha &amp; Kohin Bellara</h3>
            <p className={styles.heritageText}>
              After witnessing years of broken promises and fragmented vendor silos in traditional agencies, Sneha and Kohin founded D&apos;Genius Solutions on a radical principle: <strong>100% operational transparency and partnership</strong>. With 34+ years of combined executive experience across animation production, brand strategy, search architecture, and performance engineering, they have scaled 200+ brands entirely through client references and word-of-mouth.
            </p>

            <div className={styles.heritageStatsRow}>
              <div className={styles.heritageStat}>
                <div className={styles.heritageStatNum}>34+</div>
                <div className={styles.heritageStatLabel}>Combined Yrs Experience</div>
              </div>
              <div className={styles.heritageStatDivider}></div>
              <div className={styles.heritageStat}>
                <div className={styles.heritageStatNum}>200+</div>
                <div className={styles.heritageStatLabel}>Brands Grown on Referrals</div>
              </div>
              <div className={styles.heritageStatDivider}></div>
              <div className={styles.heritageStat}>
                <div className={styles.heritageStatNum}>100%</div>
                <div className={styles.heritageStatLabel}>Operational Transparency</div>
              </div>
            </div>
          </div>

          <div className={styles.heritageCtaWrap}>
            <a href="#audit-form" className={styles.btnSpatialPrimary}>
              <span>PARTNER WITH OUR STUDIO</span>
              <span>→</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
