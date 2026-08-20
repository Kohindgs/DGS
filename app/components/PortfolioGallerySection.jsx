'use client';

import React, { useState } from 'react';
import { portfolioGalleryData } from '../data/homepageData';

export default function PortfolioGallerySection() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filters = ['All', 'Brand Identity', 'Packaging & Print', 'Social Campaigns'];

  const filteredItems = selectedFilter === 'All'
    ? portfolioGalleryData
    : portfolioGalleryData.filter(i => i.category === selectedFilter);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  return (
    <section className="dgs-section dgs-gallery-section" id="portfolio" aria-label="Brand and Creative Portfolio">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>CREATIVE PORTFOLIO</span>
          </div>
          <h2 className="section-title">
            Brand Identities, Luxury Packaging & High-Converting Social Sets
          </h2>
          <p className="section-desc">
            Explore authentic design systems, packaging rollouts, and social creative engines built for prominent retail, aesthetics, and enterprise brands.
          </p>

          {/* Filter Buttons */}
          <div className="filter-pill-container">
            {filters.map((f, idx) => (
              <button
                key={idx}
                type="button"
                className={`filter-pill ${selectedFilter === f ? 'active' : ''}`}
                onClick={() => setSelectedFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid */}
        <div className="gallery-grid">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="gallery-item glass-card"
              onClick={() => openLightbox(idx)}
            >
              <div className="gallery-image-box">
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-img"
                  loading="lazy"
                />
                <div className="gallery-tag">{item.tag}</div>
                <div className="gallery-hover-card">
                  <span className="gallery-zoom-icon">⊕</span>
                  <div className="gallery-hover-title">{item.title}</div>
                  <div className="gallery-hover-cat">{item.category}</div>
                </div>
              </div>
              <div className="gallery-caption">
                <h3 className="caption-title">{item.title}</h3>
                <p className="caption-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="gallery-lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-nav-btn prev-btn" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>‹</div>
          <div className="lightbox-nav-btn next-btn" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>›</div>

          <div className="gallery-lightbox-card glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-lightbox-close" onClick={closeLightbox}>✕</button>
            <div className="lightbox-media-container">
              <img
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].title}
                className="gallery-lightbox-img"
              />
            </div>
            <div className="gallery-lightbox-info">
              <span className="lightbox-badge">{filteredItems[lightboxIndex].tag}</span>
              <h3 className="lightbox-heading">{filteredItems[lightboxIndex].title}</h3>
              <p className="lightbox-text">{filteredItems[lightboxIndex].description}</p>
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {filteredItems.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dgs-gallery-section {
          background: #090B0F;
          position: relative;
        }

        .text-center {
          text-align: center;
        }

        .section-head {
          max-width: 900px;
          margin: 0 auto clamp(40px, 5vw, 64px);
        }

        .section-title {
          font-size: clamp(2rem, 3.5vw, 3.2rem);
          margin-bottom: 16px;
          color: #FFFFFF;
        }

        .section-desc {
          font-size: clamp(0.95rem, 1.2vw, 1.12rem);
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .filter-pill-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .filter-pill {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-family: var(--font-sans);
          font-size: 0.86rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s ease;
        }

        .filter-pill:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-pill.active {
          color: #FFFFFF;
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 4px 16px rgba(253, 92, 98, 0.4);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: clamp(20px, 2.5vw, 32px);
        }

        .gallery-item {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(18, 22, 32, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.35s ease;
          display: flex;
          flex-direction: column;
        }

        .gallery-item:hover {
          transform: translateY(-5px);
          border-color: rgba(253, 92, 98, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .gallery-image-box {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #060709;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.08);
        }

        .gallery-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(6, 7, 9, 0.8);
          backdrop-filter: blur(8px);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid rgba(253, 92, 98, 0.3);
          z-index: 2;
        }

        .gallery-hover-card {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(6, 7, 9, 0.9) 0%, rgba(6, 7, 9, 0.3) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          padding: 20px;
          text-align: center;
        }

        .gallery-item:hover .gallery-hover-card {
          opacity: 1;
        }

        .gallery-zoom-icon {
          font-size: 2rem;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .gallery-hover-title {
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .gallery-hover-cat {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .gallery-caption {
          padding: 18px 20px;
          flex: 1;
        }

        .caption-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 6px;
        }

        .caption-desc {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.45;
          margin: 0;
        }

        .gallery-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          z-index: 2100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .gallery-lightbox-card {
          max-width: 960px;
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          position: relative;
          background: #0A0D14;
          border-radius: var(--radius-xl);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .gallery-lightbox-close {
          position: absolute;
          top: 18px;
          right: 18px;
          color: #FFFFFF;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          font-size: 1rem;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          cursor: pointer;
          z-index: 2150;
          transition: all 0.2s ease;
        }

        .lightbox-nav-btn:hover {
          background: var(--accent);
        }

        .prev-btn { left: 24px; }
        .next-btn { right: 24px; }

        .lightbox-media-container {
          width: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          max-height: 560px;
          overflow: hidden;
        }

        .gallery-lightbox-img {
          max-width: 100%;
          max-height: 560px;
          object-fit: contain;
        }

        .gallery-lightbox-info {
          padding: 24px 32px;
          position: relative;
        }

        .lightbox-badge {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          color: var(--accent);
          font-weight: 700;
          text-transform: uppercase;
        }

        .lightbox-heading {
          font-size: 1.45rem;
          color: #FFFFFF;
          margin: 6px 0 10px;
        }

        .lightbox-text {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .lightbox-counter {
          position: absolute;
          bottom: 24px;
          right: 32px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.45);
        }

        @media (max-width: 768px) {
          .lightbox-nav-btn { display: none; }
        }
      `}</style>
    </section>
  );
}
