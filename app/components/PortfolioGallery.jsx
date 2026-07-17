'use client';

import { useState } from 'react';

// Sample mock data for DGS AI portfolio.
// The user has categories: mascot, festival, mythological, product, jewellery, concept, tvc
const initialPortfolio = [
  {
    id: 1,
    title: 'AI Mascot Concept - Raymond',
    category: 'mascot',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 2,
    title: 'Topical Festival Campaign - Raymond',
    category: 'festival',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 3,
    title: 'Mythological AI Art - Saint Gobain',
    category: 'mythological',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 4,
    title: 'Jewellery AI Rendering - Eureka Forbes',
    category: 'jewellery',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 5,
    title: 'AI Concept Showcase - Onida',
    category: 'concept',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 6,
    title: 'TVC Style Promo Film - Pantaloons',
    category: 'tvc',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
  {
    id: 7,
    title: 'AI Product Showcase - Saint Gobain',
    category: 'product',
    image: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
    videoUrl: '',
  },
];

export default function PortfolioGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxVideo, setLightboxVideo] = useState(null);

  const categories = [
    { id: 'all', label: 'ALL PORTFOLIO' },
    { id: 'mascot', label: 'MASCOT AI' },
    { id: 'festival', label: 'FESTIVAL POSTS' },
    { id: 'mythological', label: 'MYTHOLOGICAL AI' },
    { id: 'product', label: 'PRODUCT AI' },
    { id: 'jewellery', label: 'JEWELLERY AI' },
    { id: 'concept', label: 'CONCEPT AI' },
    { id: 'tvc', label: 'TVC AI' },
  ];

  const filteredItems = activeCategory === 'all'
    ? initialPortfolio
    : initialPortfolio.filter(item => item.category === activeCategory);

  const handleTileClick = (item) => {
    if (item.videoUrl) {
      setLightboxVideo(item.videoUrl);
    } else {
      alert(`Viewing details for ${item.title}`);
    }
  };

  return (
    <div className="portfolio-wrapper">
      <nav className="portfolio-filters" role="navigation" aria-label="Portfolio navigation">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`portfolio-filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </nav>

      <div className="dgs-ai-content-container">
        <div className="portfolio-gallery-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          {filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => handleTileClick(item)}
              style={{
                background: 'var(--v1215-card-bg)',
                border: '1px solid var(--v1215-card-border)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              className="portfolio-item-card"
            >
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--v1215-coral)', fontWeight: '800' }}>
                  {item.category}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '0.5rem' }}>{item.title}</h4>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            No portfolio items in this category yet.
          </div>
        )}
      </div>

      {lightboxVideo && (
        <div className="portfolio-lightbox active" role="dialog" aria-modal="true" aria-label="Portfolio video preview">
          <button
            onClick={() => setLightboxVideo(null)}
            className="portfolio-lightbox-close portfolio-lightbox-btn"
            type="button"
          >
            ×
          </button>
          <div className="portfolio-lightbox-content">
            <video src={lightboxVideo} controls autoPlay playsInline />
          </div>
        </div>
      )}
    </div>
  );
}
