'use client';

import React from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';
import { servicesData } from '../../data/homepageData';

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection + ' dgs-section'} id="services">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Comprehensive Capabilities</span>
          </div>
          <h2 className={styles.titleMain}>
            One Team for <span className={styles.titleGradient}>Search, Web &amp; AI Production</span>
          </h2>
          <p className={styles.subtitle}>
            A connected growth system engineered to eliminate vendor friction and compound brand equity across traditional search, autonomous AI engines, and high-conversion funnels.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className={styles.servicesPillarsGrid}>
          {servicesData.map((svc) => (
            <div key={svc.id} className={styles.servicePillarCard}>
              <div className={styles.servicePillarTop}>
                <span className={styles.serviceNum}>{svc.number}</span>
                <span className={styles.serviceBadgeTag}>{svc.badge}</span>
              </div>

              <h3 className={styles.serviceTitle}>{svc.title}</h3>
              <div className={styles.serviceSubtitle}>{svc.subtitle}</div>
              <p className={styles.serviceDesc}>{svc.description}</p>

              <div className={styles.serviceCapListWrap}>
                <div className={styles.serviceCapHeader}>CORE DELIVERABLES:</div>
                <ul className={styles.serviceCapUl}>
                  {svc.capabilities.map((cap, cIdx) => (
                    <li key={cIdx} className={styles.serviceCapLi}>
                      <span className={styles.serviceCheck}>✦</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.servicePillarFooter}>
                <Link href={svc.link} className={styles.servicePillarLink}>
                  <span>Explore Discipline</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
