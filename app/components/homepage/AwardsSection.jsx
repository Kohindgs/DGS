import React from 'react';
import styles from './homepage.module.css';

const awardsData = [
  {
    year: '2024',
    org: 'Prime Insights',
    title: 'Best Place to Work',
    desc: 'Recognition for D\'Genius Solutions as a high-growth, culture-forward and people-first digital marketing company with relentless creative standards.'
  },
  {
    year: '2024-25',
    org: 'Corporate Connect',
    title: 'Digital Marketing Agency to Watch Out',
    desc: 'Awarded for breakthrough multi-channel impact, client-focused execution and scalable generative search & organic visibility frameworks.'
  },
  {
    year: '2025',
    org: 'GLA Awards',
    title: 'Excellence in SEO, Content & Performance Marketing',
    desc: 'Awarded for consistent, measurable ROI delivered across enterprise SEO technical audits, answer engine optimization and performance media.'
  }
];

export default function AwardsSection() {
  return (
    <section className={`${styles.awardsSection} dgs-section`} id="awards">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Industry Recognition</span>
          </div>
          <h2 className={styles.titleMain}>
            Recognized for <span className={styles.titleGradient}>Excellence & Growth</span>
          </h2>
          <p className={styles.subtitle}>
            Industry recognition spanning workplace culture, technical search mastery, and full-stack creative execution.
          </p>
        </div>

        <div className={styles.awardsGrid}>
          {awardsData.map((award, idx) => (
            <div key={idx} className={styles.awardCard}>
              <div className={styles.awardBadgeRow}>
                <span className={styles.awardYearTag}>{award.year}</span>
                <span className={styles.awardOrg}>{award.org}</span>
              </div>
              <h3 className={styles.awardTitle}>{award.title}</h3>
              <p className={styles.awardDesc}>{award.desc}</p>
            </div>
          ))}
        </div>

        {/* Clutch Ribbon */}
        <div className={styles.clutchRibbon}>
          <img 
            src="https://www.dgeniussolutions.com/wp-content/uploads/2026/06/t_clutch-5-star3208.logowik.com_.webp" 
            alt="Clutch 5-star rating verified badge" 
            className={styles.clutchBadgeImg}
            loading="lazy"
          />
          <span className={styles.clutchText}>
            5.0 ★★★★★ Verified Client Satisfaction Score on Clutch
          </span>
        </div>

      </div>
    </section>
  );
}
