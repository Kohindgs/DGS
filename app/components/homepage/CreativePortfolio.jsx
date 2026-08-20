'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './homepage.module.css';
import { portfolioGalleryData } from '../../data/homepageData';

const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'Brand Identity', label: 'Brand Identity' },
  { id: 'Social Campaigns', label: 'Social Campaigns' },
  { id: 'Packaging & Print', label: 'Packaging & POS' },
];

export default function CreativePortfolio() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);
  const railRef = useRef(null);

  const filteredItems = activeCategory === 'all'
    ? portfolioGalleryData
    : portfolioGalleryData.filter(item => item.category === activeCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxItem) return;
      if (e.key === 'Escape') setLightboxItem(null);
      const curIdx = filteredItems.findIndex(item => item.id === lightboxItem.id);
      if (curIdx === -1) return;
      if (e.key === 'ArrowRight') {
        const nextIdx = (curIdx + 1) % filteredItems.length;
        setLightboxItem(filteredItems[nextIdx]);
      }
      if (e.key === 'ArrowLeft') {
        const prevIdx = (curIdx - 1 + filteredItems.length) % filteredItems.length;
        setLightboxItem(filteredItems[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem, filteredItems]);

  return (
    <section className={styles.spatialPortfolioSection + ' dgs-section'} id="portfolio">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Creative Portfolio</span>
          </div>
          <h2 className={styles.titleMain}>
            Brand Identity &amp; <span className={styles.titleGradient}>Creative Excellence</span>
          </h2>
          <p className={styles.subtitle}>
            Explore our curated gallery of brand identities, festive drops, medical aesthetics, retail POS systems, and commercial art direction.
          </p>
        </div>

        {/* Filter Navigation Deck */}
        <div className={styles.portfolioFilterDeck}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={styles.filterDeckBtn + (activeCategory === cat.id ? ' ' + styles.filterDeckBtnActive : '')}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Curated Grid */}
        <div className={styles.portfolioGridDisplay}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={styles.portfolioCardMain}
              onClick={() => setLightboxItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxItem(item); }}
            >
              <div className={styles.portfolioImageFrame}>
                <img
                  src={item.src}
                  alt={item.title}
                  className={styles.portfolioImageTag}
                  loading="lazy"
                />
              </div>

              <div className={styles.portfolioCardOverlay}>
                <div className={styles.portfolioTagPill}>{item.tag || item.category}</div>
                <h3 className={styles.portfolioItemTitle}>{item.title}</h3>
                <p className={styles.portfolioItemDesc}>{item.description}</p>
                <div className={styles.portfolioViewAction}>
                  <span>View High-Res Project</span>
                  <span>↗</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* High-Res Lightbox Modal */}
      {lightboxItem && (
        <div
          className={styles.spatialLightboxBackdrop}
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio item details"
        >
          <div
            className={styles.spatialLightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.spatialLightboxClose}
              onClick={() => setLightboxItem(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>

            <div className={styles.lightboxSplitGrid}>
              <div className={styles.lightboxVisualSide}>
                <img
                  src={lightboxItem.src}
                  alt={lightboxItem.title}
                  className={styles.lightboxLargeImg}
                />
              </div>

              <div className={styles.lightboxInfoSide}>
                <div className={styles.lightboxTag}>{lightboxItem.category} // {lightboxItem.tag}</div>
                <h3 className={styles.lightboxTitle}>{lightboxItem.title}</h3>
                <p className={styles.lightboxDesc}>{lightboxItem.description}</p>

                <div className={styles.lightboxDetailsBox}>
                  <div className={styles.lightboxDetailRow}>
                    <span className={styles.lightboxDetailKey}>DISCIPLINE:</span>
                    <span className={styles.lightboxDetailVal}>{lightboxItem.category}</span>
                  </div>
                  <div className={styles.lightboxDetailRow}>
                    <span className={styles.lightboxDetailKey}>STUDIO POD:</span>
                    <span className={styles.lightboxDetailVal}>Brand Architecture &amp; Creative</span>
                  </div>
                  <div className={styles.lightboxDetailRow}>
                    <span className={styles.lightboxDetailKey}>STANDARDS:</span>
                    <span className={styles.lightboxDetailVal}>100% Bespoke Art Direction</span>
                  </div>
                </div>

                <a href="#audit-form" onClick={() => setLightboxItem(null)} className={styles.btnPrimary} style={{ width: '100%', marginTop: '24px', textAlign: 'center' }}>
                  <span>COMMISSION SIMILAR CAMPAIGN</span>
                  <span>→</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
