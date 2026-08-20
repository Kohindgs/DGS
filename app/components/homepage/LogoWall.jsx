'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';

const allLogos = [
  { name: 'Eureka Forbes', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Eureka-forbes_White.png', cat: 'enterprise' },
  { name: 'Kotak Mahindra Bank', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/kmbl-logo.svg', cat: 'finance' },
  { name: 'Aditya Birla Education Academy', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABEA-1.png', cat: 'education' },
  { name: 'Saint Gobain', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Saint-gobian.png', cat: 'enterprise' },
  { name: 'Pantaloons', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Pantaloons.png', cat: 'retail' },
  { name: 'Raymond', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Raymond.png', cat: 'retail' },
  { name: 'Onida', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Onida.png', cat: 'enterprise' },
  { name: 'TheWorldGrad', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/logo_v2-300x86.png', cat: 'education' },
  { name: 'Weavings Manpower', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/12/Weavings.webp', cat: 'enterprise' },
  { name: 'Plush Puppy', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Plush-puppy.png', cat: 'retail' },
  { name: 'Candour London', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Candour-london.png', cat: 'retail' },
  { name: 'Druva', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/Druva.png', cat: 'enterprise' },
  { name: 'Club Med', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/colored-logo-1.png', cat: 'retail' },
  { name: 'Aditya Birla World Academy', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/ABworld-acedemy.png', cat: 'education' },
  { name: 'M-Power Aditya Birla', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/11/M-power.png', cat: 'education' },
  { name: 'Novotel', src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Novotel_logo_2016.svg-scaled.png.webp', cat: 'retail' },
  { name: 'Hanwha Techwin', src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Hanwha_Techwin-Logo.wine_-scaled.png.webp', cat: 'enterprise' },
  { name: 'Planet Smart City', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/06/PlanetSmartCity-logo.webp', cat: 'enterprise' },
  { name: 'Compuage', src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/Compuage_logo.png.webp', cat: 'enterprise' },
  { name: 'MedArtha', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/06/MedArtha-Logo-1-2048x1448-1.webp', cat: 'education' },
  { name: 'Blanco', src: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/06/blanco-1.webp', cat: 'retail' },
  { name: 'Amazonia', src: 'https://www.dgeniussolutions.com/wp-content/smush-webp/2026/06/AMAZONIA-LOGO-Ai.png.webp', cat: 'retail' }
];

export default function LogoWall() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredLogos = activeTab === 'all' 
    ? allLogos 
    : allLogos.filter(l => l.cat === activeTab);

  return (
    <section className={`${styles.logoWallSection} dgs-section`} id="clients">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Proof of Execution</span>
          </div>
          <h2 className={styles.titleMain}>
            Trusted By <span className={styles.titleGradient}>200+ Leading Brands</span>
          </h2>
          <p className={styles.subtitle}>
            From Fortune 500 enterprises to high-growth market leaders across finance, retail, healthcare, consumer tech and education.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={styles.logoFilterTabs}>
          <button 
            className={`${styles.logoFilterBtn} ${activeTab === 'all' ? styles.logoFilterBtnActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Brands ({allLogos.length})
          </button>
          <button 
            className={`${styles.logoFilterBtn} ${activeTab === 'enterprise' ? styles.logoFilterBtnActive : ''}`}
            onClick={() => setActiveTab('enterprise')}
          >
            Enterprise & Tech
          </button>
          <button 
            className={`${styles.logoFilterBtn} ${activeTab === 'retail' ? styles.logoFilterBtnActive : ''}`}
            onClick={() => setActiveTab('retail')}
          >
            Retail & Consumer
          </button>
          <button 
            className={`${styles.logoFilterBtn} ${activeTab === 'finance' ? styles.logoFilterBtnActive : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            Finance & Banking
          </button>
          <button 
            className={`${styles.logoFilterBtn} ${activeTab === 'education' ? styles.logoFilterBtnActive : ''}`}
            onClick={() => setActiveTab('education')}
          >
            Education & Trust
          </button>
        </div>

        {/* Logo Grid */}
        <div className={styles.logoGrid}>
          {filteredLogos.map((logo, idx) => (
            <div key={idx} className={styles.logoCard} title={logo.name}>
              <img 
                src={logo.src} 
                alt={`${logo.name} client logo`} 
                className={styles.logoImg}
                loading="lazy"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
