'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';
import { servicesData } from '../../data/homepageData';

export default function ServicesSection() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section className={`${styles.servicesSection} dgs-section`} id="services">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Comprehensive Growth Capabilities</span>
          </div>
          <h2 className={styles.titleMain}>
            Connected Growth <span className={styles.titleGradient}>Ecosystem</span>
          </h2>
          <p className={styles.subtitle}>
            A unified suite of digital capabilities engineered to eliminate vendor friction and compound brand equity across traditional search, autonomous AI engines, and high-conversion funnels.
          </p>
        </div>

        {/* 6-Pillar Interactive Service Grid */}
        <div className={styles.servicesGrid6}>
          {servicesData.map((svc, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div 
                key={svc.id} 
                className={`${styles.serviceModularCard} ${isHovered ? styles.serviceCardActive : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className={styles.serviceCardTop}>
                  <span className={styles.serviceModularNum}>{svc.number}</span>
                  <span className={styles.serviceModularBadge}>{svc.badge}</span>
                </div>

                <h3 className={styles.serviceModularTitle}>{svc.title}</h3>
                <div className={styles.serviceModularSub}>{svc.subtitle}</div>
                <p className={styles.serviceModularDesc}>{svc.description}</p>

                <div className={styles.serviceCapList}>
                  <div className={styles.serviceCapLabel}>KEY CAPABILITIES:</div>
                  {svc.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className={styles.serviceCapItem}>
                      <span className={styles.serviceCapDot}>✦</span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                <Link href={svc.link} className={styles.serviceActionBtn}>
                  <span>EXPLORE DISCIPLINE</span>
                  <span className={styles.serviceActionArrow}>→</span>
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
