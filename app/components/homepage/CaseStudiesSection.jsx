'use client';

import React from 'react';
import styles from './homepage.module.css';
import { caseStudiesData } from '../../data/homepageData';

export default function CaseStudiesSection() {
  return (
    <section className={`${styles.caseStudiesSection} dgs-section`} id="case-studies">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Enterprise Case Studies</span>
          </div>
          <h2 className={styles.titleMain}>
            Architected For <span className={styles.titleGradient}>Category Leadership</span>
          </h2>
          <p className={styles.subtitle}>
            A deep-dive into how our connected search architectures, web engineering, and high-velocity creative engines scale enterprise brands.
          </p>
        </div>

        {/* Case Studies Editorial Grid */}
        <div className={styles.casesGrid}>
          {caseStudiesData.map((study) => (
            <div key={study.id} className={styles.caseEditorialCard}>
              <div className={styles.caseCardHeader}>
                <div className={styles.caseLogoWrap}>
                  <img 
                    src={study.logo} 
                    alt={`${study.client} logo`} 
                    className={styles.caseLogoImg}
                    loading="lazy"
                  />
                </div>
                <div className={styles.caseIndustryBadge}>{study.industry}</div>
              </div>

              <h3 className={styles.caseHeadline}>{study.headline}</h3>
              <p className={styles.caseSummary}>{study.summary}</p>

              <div className={styles.caseDeliverablesBox}>
                <div className={styles.deliverablesTitle}>CORE SYSTEMS DEPLOYED:</div>
                <ul className={styles.deliverablesList}>
                  {study.deliverables.map((del, dIdx) => (
                    <li key={dIdx} className={styles.deliverableItem}>
                      <span className={styles.deliverableCheck}>✓</span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.caseServicesWrap}>
                {study.services.map((svc, sIdx) => (
                  <span key={sIdx} className={styles.caseServiceTag}>{svc}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Enterprise Proof Strip */}
        <div className={styles.enterpriseStrip}>
          <div className={styles.enterpriseStripLabel}>
            <span>EXTENDED CLIENT PARTNERSHIPS</span>
          </div>
          <div className={styles.enterpriseStripClients}>
            <span>Saint Gobain</span> • <span>LG Electronics</span> • <span>Novotel</span> • <span>Club Med</span> • <span>Druva</span> • <span>Raymond</span> • <span>Aditya Birla Education</span> • <span>Hanwha Techwin</span> • <span>Planet Smart City</span>
          </div>
        </div>

      </div>
    </section>
  );
}
