'use client';

import React from 'react';
import styles from './homepage.module.css';
import { caseStudiesData, enterpriseDeliverables } from '../../data/homepageData';

export default function CaseStudiesSection() {
  return (
    <section className={styles.caseStudiesSection + ' dgs-section'} id="case-studies">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Measurable Growth</span>
          </div>
          <h2 className={styles.titleMain}>
            SEO, Website &amp; <span className={styles.titleGradient}>Digital Growth Case Studies</span>
          </h2>
          <p className={styles.subtitle}>
            Real results from brands where search visibility, content structure, website experience and digital execution worked together.
          </p>
        </div>

        {/* Featured Case Studies */}
        <div className={styles.caseFeaturedGrid}>
          {caseStudiesData.map((study) => (
            <div key={study.id} className={styles.caseStudyMainCard}>
              <div className={styles.caseMediaContainer}>
                <img
                  src={study.image}
                  alt={study.client + ' case study visual'}
                  className={styles.caseHeroImage}
                  loading="lazy"
                />
              </div>

              <div className={styles.caseInfoContainer}>
                <div className={styles.caseCategoryTag}>{study.category}</div>
                <h3 className={styles.caseClientTitle}>{study.client}</h3>
                <p className={styles.caseSummaryPara}>{study.summary}</p>

                {/* Metrics */}
                <div className={styles.caseMetricsDeck}>
                  {study.metrics.map((m, mIdx) => (
                    <div key={mIdx} className={styles.caseMetricBox}>
                      <div className={styles.caseMetricNumber}>{m.value}</div>
                      <div className={styles.caseMetricLabel}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Deliverables */}
                <div className={styles.caseDeliverablesRow}>
                  {study.deliverables.map((del, dIdx) => (
                    <span key={dIdx} className={styles.caseDelivTag}>✓ {del}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Mandates Mini Strip */}
        <div className={styles.enterpriseMandatesBox}>
          <div className={styles.enterpriseMandatesHead}>
            <span>EXTENDED ENTERPRISE MANDATES</span>
          </div>
          <div className={styles.enterpriseMandatesGrid}>
            {enterpriseDeliverables.map((item, idx) => (
              <div key={idx} className={styles.mandateItem}>
                <div className={styles.mandateClient}>{item.client}</div>
                <div className={styles.mandateService}>{item.service}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
