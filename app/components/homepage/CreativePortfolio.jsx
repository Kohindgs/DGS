'use client';

import React, { useState, useEffect } from 'react';
import styles from './homepage.module.css';

const portfolioItems = [
  {
    id: 1,
    title: 'Luxury Ethnic Fashion & Wedding Narrative',
    category: 'fashion',
    catLabel: 'Fashion & Retail',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Wedding-Story6-576x1024.jpg.webp'
  },
  {
    id: 2,
    title: 'Festive Dandiya Grid Campaign',
    category: 'festive',
    catLabel: 'Festive & Topical',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/New-Dandiya-Grid-1-1024x683.png.webp'
  },
  {
    id: 3,
    title: 'Diwali Festive Brand Story',
    category: 'festive',
    catLabel: 'Festive & Topical',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Diwali-GridOpt1.1-1-1024x1024.jpg.webp'
  },
  {
    id: 4,
    title: 'Tussar Silk Handcrafted Collection',
    category: 'fashion',
    catLabel: 'Fashion & Retail',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Tussar-Silk-Digital-Printed-Zari-Embroidered-Kurta-With-Palazzo-And-Dupatta-1-576x1024.png.webp'
  },
  {
    id: 5,
    title: 'Retail Visual Merchandising Standee',
    category: 'retail',
    catLabel: 'Retail & POS',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Standee-Option-5-512x1024.jpg.webp'
  },
  {
    id: 6,
    title: 'Aesthetic Healthcare Clinical Series',
    category: 'healthcare',
    catLabel: 'Healthcare & Aesthetics',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Lip-Filler1-819x1024.png.webp'
  },
  {
    id: 7,
    title: 'Wellness & Mindful Movement Concept',
    category: 'lifestyle',
    catLabel: 'Lifestyle & Wellness',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/international_yoga_day-819x1024.png.webp'
  },
  {
    id: 8,
    title: 'Amazonia High-Energy Social Editorial',
    category: 'lifestyle',
    catLabel: 'Lifestyle & Hospitality',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/Amazonia-grid7-1024x683.png.webp'
  },
  {
    id: 9,
    title: 'Pursuit of Performance Enterprise E-Learning',
    category: 'corporate',
    catLabel: 'Corporate & Learning',
    src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/04/IN-PURSUIT-OF-SUPER-PERFORMANCE-E-Learning1-1-819x1024.png.webp'
  }
];

export default function CreativePortfolio() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filtered.length]);

  return (
    <section className={`${styles.portfolioSection} dgs-section`} id="portfolio">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Creative Showcase</span>
          </div>
          <h2 className={styles.titleMain}>
            Brand Identity & <span className={styles.titleGradient}>Creative Excellence</span>
          </h2>
          <p className={styles.subtitle}>
            A curated view of campaigns, visual identities, festive moment marketing, retail standees, and AI-led productions.
          </p>
        </div>

        {/* Category Tabs */}
        <div className={styles.portfolioTabs}>
          <button 
            className={`${styles.portfolioTabBtn} ${activeFilter === 'all' ? styles.portfolioTabBtnActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Work ({portfolioItems.length})
          </button>
          <button 
            className={`${styles.portfolioTabBtn} ${activeFilter === 'fashion' ? styles.portfolioTabBtnActive : ''}`}
            onClick={() => setActiveFilter('fashion')}
          >
            Fashion & Retail
          </button>
          <button 
            className={`${styles.portfolioTabBtn} ${activeFilter === 'festive' ? styles.portfolioTabBtnActive : ''}`}
            onClick={() => setActiveFilter('festive')}
          >
            Festive Campaigns
          </button>
          <button 
            className={`${styles.portfolioTabBtn} ${activeFilter === 'lifestyle' ? styles.portfolioTabBtnActive : ''}`}
            onClick={() => setActiveFilter('lifestyle')}
          >
            Lifestyle & Hospitality
          </button>
          <button 
            className={`${styles.portfolioTabBtn} ${activeFilter === 'corporate' ? styles.portfolioTabBtnActive : ''}`}
            onClick={() => setActiveFilter('corporate')}
          >
            Corporate & B2B
          </button>
        </div>

        {/* Grid */}
        <div className={styles.portfolioGrid}>
          {filtered.map((item, idx) => (
            <div 
              key={item.id} 
              className={styles.portfolioItem}
              onClick={() => setLightboxIndex(idx)}
            >
              <img 
                src={item.src} 
                alt={item.title} 
                className={styles.portfolioImg}
                loading="lazy"
              />
              <div className={styles.portfolioOverlay}>
                <span className={styles.portfolioCategory}>{item.catLabel}</span>
                <h3 className={styles.portfolioItemTitle}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className={styles.lightboxBackdrop}
          onClick={() => setLightboxIndex(null)}
        >
          <button 
            className={styles.lightboxCloseBtn}
            onClick={() => setLightboxIndex(null)}
            aria-label="Close Lightbox"
          >
            &times;
          </button>

          <button 
            className={`${styles.lightboxNavBtn} ${styles.lightboxPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
            }}
            aria-label="Previous Image"
          >
            &#8249;
          </button>

          <div 
            className={styles.lightboxImgContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={filtered[lightboxIndex].src} 
              alt={filtered[lightboxIndex].title} 
              className={styles.lightboxMainImg}
            />
            <div className={styles.lightboxCounter}>
              {filtered[lightboxIndex].title} — ({lightboxIndex + 1} of {filtered.length})
            </div>
          </div>

          <button 
            className={`${styles.lightboxNavBtn} ${styles.lightboxNext}`}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev + 1) % filtered.length);
            }}
            aria-label="Next Image"
          >
            &#8250;
          </button>
        </div>
      )}
    </section>
  );
}
