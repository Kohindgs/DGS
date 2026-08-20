import React from 'react';
import styles from './homepage.module.css';

const pillars = [
  {
    num: '01',
    title: 'Strategy First',
    desc: 'No random tactics or vanity metrics. Every campaign, line of code, and creative asset is anchored in measurable revenue growth.'
  },
  {
    num: '02',
    title: 'Search Authority',
    desc: 'Deep mastery of traditional SEO combined with cutting-edge AEO, GEO, and LLM entity positioning to future-proof your discovery.'
  },
  {
    num: '03',
    title: 'Creative Velocity',
    desc: 'Generative AI workflows paired with human art direction to produce cinematic videos, 3D assets, and festive posts at unmatched speed.'
  },
  {
    num: '04',
    title: 'Full-Stack Synergy',
    desc: 'Strategy, design, code, search, and paid media housed under one roof — eliminating vendor friction and conflicting agendas.'
  }
];

export default function WhyDgsSection() {
  return (
    <section className={`${styles.whySection} dgs-section`} id="why-dgs">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Why Choose DGS</span>
          </div>
          <h2 className={styles.titleMain}>
            Built For Growth. <br />
            <span className={styles.titleGradient}>Engineered For Velocity.</span>
          </h2>
          <p className={styles.subtitle}>
            Why forward-thinking enterprises and fast-growing brands partner with D'Genius Solutions.
          </p>
        </div>

        <div className={styles.whyGrid}>
          {pillars.map((p, idx) => (
            <div key={idx} className={styles.whyCard}>
              <div className={styles.whyNum}>{p.num}</div>
              <h3 className={styles.whyTitle}>{p.title}</h3>
              <p className={styles.whyDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Founder & Tribe Story */}
        <div className={styles.founderBox}>
          <div className={styles.founderInfo}>
            <h3 className={styles.founderTitle}>Founded by Sneha & Kohin Bellara in 2021</h3>
            <p className={styles.founderText}>
              D'Genius Solutions was founded with a singular conviction: that modern digital growth demands an integrated tribe of creators, tech engineers, and search strategists moving together. Based in Khar West, Mumbai, our team delivers high-impact marketing across India, Dubai, and global markets.
            </p>
          </div>
          <a href="#audit-form" className={styles.btnPrimary}>
            <span>Work With Our Tribe</span>
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
