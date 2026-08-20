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
  const [tiltMap, setTiltMap] = useState({});
  const railRef = useRef(null);

  const filteredItems = activeCategory === 'all'
    ? portfolioGalleryData
    : portfolioGalleryData.filter(item => item.category === activeCategory);

  // Handle 3D card tilt based on pointer position within each card
  const handleCardMouseMove = (e, id) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltMap((prev) => ({
      ...prev,
      [id]: {
        rotateX: -y * 18,
        rotateY: x * 18,
        translateZ: 25,
      },
    }));
  };

  const handleCardMouseLeave = (id) => {
    setTiltMap((prev) => ({
      ...prev,
      [id]: { rotateX: 0, rotateY: 0, translateZ: 0 },
    }));
  };

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
    <section className={`${styles.spatialPortfolioSection} dgs-section`} id="portfolio">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Spatial Creative Gallery</span>
          </div>
          <h2 className={styles.titleMain}>
            Brand Architecture &amp; <span className={styles.titleGradient}>Creative Mastery</span>
          </h2>
          <p className={styles.subtitle}>
            Explore our spatial archive of brand identities, festive drops, medical aesthetics, retail POS systems, and commercial art direction.
          </p>
        </div>

        {/* Filter Navigation Deck */}
        <div className={styles.portfolioFilterDeck}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterDeckBtn} ${activeCategory === cat.id ? styles.filterDeckBtnActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              {activeCategory === cat.id && <span className={styles.filterActivePill}></span>}
            </button>
          ))}
        </div>

        {/* Spatial 3D Perspective Rail / Stage */}
        <div className={styles.spatialStageWrapper}>
          <div className={styles.spatialRail} ref={railRef}>
            {filteredItems.map((item, idx) => {
              const tilt = tiltMap[item.id] || { rotateX: 0, rotateY: 0, translateZ: 0 };
              return (
                <div
                  key={item.id}
                  className={styles.spatialCard}
                  onMouseMove={(e) => handleCardMouseMove(e, item.id)}
                  onMouseLeave={() => handleCardMouseLeave(item.id)}
                  onClick={() => setLightboxItem(item)}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.translateZ}px)`,
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setLightboxItem(item); }}
                >
                  <div className={styles.spatialCardInner}>
                    {/* Media Frame */}
                    <div className={styles.spatialMediaFrame}>
                      <img
                        src={item.src}
                        alt={item.title}
                        className={styles.spatialCardImg}
                        loading="lazy"
                      />
                      <div className={styles.spatialCardGloss}></div>
                    </div>

                    {/* Meta Overlay */}
                    <div className={styles.spatialCardMeta}>
                      <div className={styles.spatialCardCategory}>
                        <span className={styles.spatialCategoryDot}></span>
                        <span>{item.tag || item.category}</span>
                      </div>
                      <h3 className={styles.spatialCardTitle}>{item.title}</h3>
                      <p className={styles.spatialCardDesc}>{item.description}</p>
                      <div className={styles.spatialCardAction}>
                        <span>INSPECT ARTIFACT</span>
                        <span>↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cinematic High-Res Lightbox Modal */}
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

                <a href="#audit-form" onClick={() => setLightboxItem(null)} className={styles.btnSpatialPrimary} style={{ width: '100%', marginTop: '24px' }}>
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
