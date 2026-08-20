import React from 'react';
import styles from './homepage.module.css';

const featuredCases = [
  {
    client: 'TheWorldGrad',
    category: 'SEO • Higher Education',
    summary: 'Overseas education platform helping thousands of students study in Australia, the UK, and the USA. DGS re-architected their organic discovery framework from ground up.',
    metrics: [
      { val: '+95%', label: 'Keyword Growth' },
      { val: '2.5x', label: 'Domain Authority' },
      { val: '6x', label: 'Organic Traffic' }
    ]
  },
  {
    client: 'Weavings Manpower',
    category: 'SEO + Web Architecture + Performance',
    summary: 'National staffing powerhouse providing contract staffing and payroll outsourcing across 100+ cities in India. Dominating generic and answer-engine search queries.',
    metrics: [
      { val: '17.4K', label: 'Organic Clicks' },
      { val: '1.82M', label: 'Impressions' },
      { val: '#1', label: 'AI Answer Ranking' }
    ]
  }
];

const miniCases = [
  { brand: 'Kotak Mahindra Bank', service: 'Web Architecture & AMC' },
  { brand: 'Eureka Forbes', service: 'Retail Creative Strategy' },
  { brand: 'Onida', service: 'Full UI/UX Web Platform' },
  { brand: 'Pantaloons ABFRL', service: '360° Creative & Social Media' },
  { brand: 'DSP Mutual Fund', service: 'AI Production & Video' },
  { brand: 'Home Credit', service: 'Integrated Campaign Rollouts' },
  { brand: 'Saint Gobain', service: 'Digital Engagement' },
  { brand: 'Aditya Birla Education', service: 'Search & Lead Growth' }
];

export default function CaseStudiesSection() {
  return (
    <section className={`${styles.caseStudiesSection} dgs-section`} id="case-studies">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Proven Business Impact</span>
          </div>
          <h2 className={styles.titleMain}>
            SEO, Website & <span className={styles.titleGradient}>Growth Case Studies</span>
          </h2>
          <p className={styles.subtitle}>
            Real verified data from enterprise and challenger brands where search visibility, technical architecture, and creative execution worked in unison.
          </p>
        </div>

        {/* Featured Case Cards */}
        <div className={styles.caseStudiesGrid}>
          {featuredCases.map((c, idx) => (
            <div key={idx} className={styles.caseStudyCard}>
              <div className={styles.caseStudyHeader}>
                <span className={styles.caseStudyTag}>{c.category}</span>
              </div>
              <h3 className={styles.caseStudyClient}>{c.client}</h3>
              <p className={styles.caseStudySummary}>{c.summary}</p>
              
              <div className={styles.metricsGrid}>
                {c.metrics.map((m, mIdx) => (
                  <div key={mIdx} className={styles.metricBox}>
                    <div className={styles.metricValue}>{m.val}</div>
                    <div className={styles.metricLabel}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Case Grid */}
        <div className={styles.miniCaseGrid}>
          {miniCases.map((item, idx) => (
            <div key={idx} className={styles.miniCaseCard}>
              <span className={styles.miniCaseService}>{item.service}</span>
              <span className={styles.miniCaseBrand}>{item.brand}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
