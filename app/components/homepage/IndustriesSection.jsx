import React from 'react';
import styles from './homepage.module.css';

const industriesData = [
  { icon: '🏥', name: 'Healthcare & Wellness', desc: 'Patient acquisition, aesthetic clinical marketing, and HIPAA-compliant search ecosystems.' },
  { icon: '🏦', name: 'Banking & Fintech', desc: 'High-trust UX, regulatory-aligned digital compliance, and customer lifecycle funnels.' },
  { icon: '🛍️', name: 'Retail & Ecommerce', desc: 'Omnichannel creative rollouts, in-store POS digital synergy, and ROAS-focused media.' },
  { icon: '🏢', name: 'Real Estate & Living', desc: 'High-intent lead engines, luxury project branding, and immersive architectural visuals.' },
  { icon: '🎓', name: 'Higher Education', desc: 'Overseas student enrollment campaigns, institutional authority, and global program SEO.' },
  { icon: '👔', name: 'Staffing & HR Tech', desc: 'National enterprise recruitment portals, B2B lead generation, and payroll solutions.' },
  { icon: '📺', name: 'Consumer Electronics', desc: 'Product launch campaigns, multi-device landing pages, and interactive brand stores.' },
  { icon: '💻', name: 'Enterprise Technology', desc: 'B2B demand generation, pipeline acceleration, and technical thought leadership.' }
];

export default function IndustriesSection() {
  return (
    <section className={`${styles.industriesSection} dgs-section`} id="industries">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Domain Expertise</span>
          </div>
          <h2 className={styles.titleMain}>
            Industries We <span className={styles.titleGradient}>Help Scale</span>
          </h2>
          <p className={styles.subtitle}>
            Bespoke growth architectures designed for high-consideration, high-trust, and category-defining brands.
          </p>
        </div>

        <div className={styles.industriesGrid}>
          {industriesData.map((ind, idx) => (
            <div key={idx} className={styles.industryCard}>
              <div className={styles.industryIcon}>{ind.icon}</div>
              <h3 className={styles.industryName}>{ind.name}</h3>
              <p className={styles.industryTagline}>{ind.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
