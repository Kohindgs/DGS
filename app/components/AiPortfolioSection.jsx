'use client';

import React, { useState } from 'react';
import { aiPortfolioData } from '../data/homepageData';

export default function AiPortfolioSection({ onOpenAudit }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const categories = ['All', 'AI Video Production', 'AI Product Visuals', 'Mascot & Character AI', 'Topical & Cultural Content'];

  const filteredItems = selectedCategory === 'All'
    ? aiPortfolioData
    : aiPortfolioData.filter(item => item.category === selectedCategory);

  return (
    <section className="dgs-section dgs-ai-section" id="ai-portfolio" aria-label="Generative AI Studio Showcase">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>PROPRIETARY GENERATIVE AI STUDIO</span>
          </div>
          <h2 className="section-title">
            Where Cinematic Visuals Meet Unprecedented Production Speed
          </h2>
          <p className="section-desc">
            We eliminate production bottlenecks by combining proprietary GenAI models with rigorous human art direction. Photorealistic commercial stills, cinematic video sequences, and consistent brand avatars produced in days, not quarters.
          </p>

          {/* Filter Tabs */}
          <div className="filter-pill-container" role="tablist">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Grid */}
        <div className="ai-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="ai-card glass-card"
              onClick={() => setActiveModalItem(item)}
            >
              <div className="ai-media-wrapper">
                <img
                  src={item.image}
                  alt={item.title}
                  className="ai-card-img"
                  loading="lazy"
                />
                <div className="ai-tag-badge">{item.tag}</div>
                <div className="ai-hover-overlay">
                  <span className="ai-view-btn">Inspect Pipeline ↗</span>
                </div>
              </div>

              <div className="ai-card-body">
                <div className="ai-metrics-chip">{item.metrics}</div>
                <h3 className="ai-card-title">{item.title}</h3>
                <p className="ai-card-desc">{item.description}</p>
                <div className="ai-prompt-box">
                  <span className="prompt-label">AI Engine Prompt Insight:</span>
                  <p className="prompt-text">"{item.promptInsight}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Studio Callout */}
        <div className="ai-cta-card glass-card">
          <div className="ai-cta-content">
            <h3 className="ai-cta-title">Want Custom AI Models Trained on Your Brand?</h3>
            <p className="ai-cta-desc">
              We build dedicated private LoRA checkpoints, brand-consistent avatars, and automated product render engines tailored exclusively for your visual identity.
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={onOpenAudit}>
            Deploy AI Studio for Your Brand →
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeModalItem && (
        <div className="lightbox-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="lightbox-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close Preview"
            >
              ✕
            </button>
            <img
              src={activeModalItem.image}
              alt={activeModalItem.title}
              className="lightbox-img"
            />
            <div className="lightbox-body">
              <span className="lightbox-tag">{activeModalItem.tag}</span>
              <h3 className="lightbox-title">{activeModalItem.title}</h3>
              <p className="lightbox-desc">{activeModalItem.description}</p>
              <div className="lightbox-prompt">
                <strong>Pipeline Prompt:</strong> {activeModalItem.promptInsight}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dgs-ai-section {
          background: #060709;
          position: relative;
        }

        .text-center {
          text-align: center;
        }

        .section-head {
          max-width: 920px;
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

        .ai-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: clamp(24px, 3vw, 36px);
          margin-bottom: clamp(48px, 6vw, 72px);
        }

        .ai-card {
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: rgba(14, 18, 26, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.35s ease;
          display: flex;
          flex-direction: column;
        }

        .ai-card:hover {
          transform: translateY(-6px);
          border-color: rgba(0, 242, 254, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.15);
        }

        .ai-media-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #090B0F;
        }

        .ai-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .ai-card:hover .ai-card-img {
          transform: scale(1.06);
        }

        .ai-tag-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(6, 7, 9, 0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--teal);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }

        .ai-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 7, 9, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ai-card:hover .ai-hover-overlay {
          opacity: 1;
        }

        .ai-view-btn {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: #FFFFFF;
          background: rgba(253, 92, 98, 0.9);
          padding: 8px 18px;
          border-radius: 9999px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .ai-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ai-metrics-chip {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 10px;
        }

        .ai-card-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 10px;
          line-height: 1.25;
        }

        .ai-card-desc {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.55;
          margin-bottom: 18px;
          flex: 1;
        }

        .ai-prompt-box {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          padding: 12px;
          font-size: 0.78rem;
        }

        .prompt-label {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--teal);
          display: block;
          margin-bottom: 4px;
        }

        .prompt-text {
          color: rgba(255, 255, 255, 0.55);
          font-style: italic;
          margin: 0;
          line-height: 1.4;
        }

        .ai-cta-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: clamp(28px, 3.5vw, 44px);
          border-radius: var(--radius-xl);
          background: radial-gradient(circle at 10% 50%, rgba(253, 92, 98, 0.12) 0%, rgba(14, 18, 26, 0.85) 60%);
          border: 1px solid rgba(253, 92, 98, 0.3);
          gap: 24px;
        }

        .ai-cta-content {
          max-width: 680px;
        }

        .ai-cta-title {
          font-size: clamp(1.3rem, 1.8vw, 1.7rem);
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .ai-cta-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          line-height: 1.6;
        }

        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: dgsFadeIn 0.25s ease-out;
        }

        .lightbox-content {
          max-width: 860px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          border-radius: var(--radius-xl);
          background: #0A0D14;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .lightbox-close {
          position: absolute;
          top: 18px;
          right: 18px;
          color: #FFFFFF;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          z-index: 10;
        }

        .lightbox-img {
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          display: block;
        }

        .lightbox-body {
          padding: 28px;
        }

        .lightbox-tag {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--teal);
          font-weight: 700;
          text-transform: uppercase;
        }

        .lightbox-title {
          font-size: 1.5rem;
          color: #FFFFFF;
          margin: 6px 0 12px;
        }

        .lightbox-desc {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .lightbox-prompt {
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
        }

        @media (max-width: 860px) {
          .ai-cta-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
