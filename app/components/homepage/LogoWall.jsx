'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { clientLogos } from '../../data/homepageData';

const categories = [
  { id: 'all', label: 'All Brands', count: clientLogos.length },
  { id: 'enterprise', label: 'Enterprise & Tech', count: clientLogos.filter(l => l.category === 'enterprise').length },
  { id: 'retail', label: 'Retail & Consumer', count: clientLogos.filter(l => l.category === 'retail').length },
  { id: 'finance', label: 'Finance & Banking', count: clientLogos.filter(l => l.category === 'finance').length },
  { id: 'education', label: 'Education & Trust', count: clientLogos.filter(l => l.category === 'education').length },
  { id: 'healthcare', label: 'Healthcare & Living', count: clientLogos.filter(l => l.category === 'healthcare').length },
];

export default function LogoWall() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredLogos = activeCategory === 'all'
    ? clientLogos
    : clientLogos.filter(l => l.category === activeCategory);

  return (
    <section className={styles.logoWallSection + ' dgs-section'} id="clients">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Proof of Execution</span>
          </div>
          <h2 className={styles.titleMain}>
            Trusted by <span className={styles.titleGradient}>200+ Category Leaders</span>
          </h2>
          <p className={styles.subtitle}>
            From Fortune 500 enterprises to high-growth market leaders across finance, retail, healthcare, consumer technology and education.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className={styles.logoFilterDeck}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={styles.logoFilterBtn + (activeCategory === cat.id ? ' ' + styles.logoFilterBtnActive : '')}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label} ({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Complete Responsive Logo Grid */}
        <div className={styles.logoGridFull}>
          {filteredLogos.map((logo, idx) => (
            <div key={idx} className={styles.logoCardBox} title={logo.name}>
              <img
                src={logo.src}
                alt={logo.alt || logo.name + ' client logo'}
                className={styles.logoImgElement}
                loading="lazy"
              />
              <span className={styles.logoNameHover}>{logo.name}</span>
            </div>
          ))}
        </div>

        {/* Summary Counter */}
        <div className={styles.logoFooterNotice}>
          <span>✦ Complete verified client roster preserved from official DGS brand records.</span>
        </div>

      </div>
    </section>
  );
}
