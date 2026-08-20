'use client';

import React, { useState } from 'react';
import { faqData } from '../data/homepageData';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = searchQuery.trim() === ''
    ? faqData
    : faqData.filter(
        f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
             f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="dgs-section dgs-faq-section" id="faq" aria-label="Frequently Asked Questions">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>CLEAR ANSWERS</span>
          </div>
          <h2 className="section-title">
            Frequently Asked Questions
          </h2>
          <p className="section-desc">
            Everything you need to know about our capabilities, engagement structure, and modern growth systems.
          </p>

          {/* Search Input */}
          <div className="faq-search-box">
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
              aria-label="Search FAQs"
            />
          </div>
        </div>

        {/* Accordion List */}
        <div className="faq-accordion-list">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-item glass-card ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.question}</span>
                  <span className="faq-icon-indicator">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="faq-answer-container">
                    <p className="faq-answer-text">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .dgs-faq-section {
          background: #090B0F;
          position: relative;
        }

        .text-center {
          text-align: center;
        }

        .section-head {
          max-width: 860px;
          margin: 0 auto clamp(40px, 5vw, 56px);
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
          margin-bottom: 24px;
        }

        .faq-search-box {
          max-width: 540px;
          margin: 0 auto;
        }

        .faq-search-input {
          width: 100%;
          padding: 14px 22px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s ease;
        }

        .faq-search-input:focus {
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 20px rgba(253, 92, 98, 0.2);
        }

        .faq-accordion-list {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .faq-item {
          border-radius: var(--radius-lg);
          background: rgba(18, 22, 32, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item.is-open {
          border-color: rgba(253, 92, 98, 0.35);
          background: rgba(24, 30, 44, 0.75);
        }

        .faq-question-btn {
          width: 100%;
          padding: 22px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          gap: 16px;
        }

        .faq-q-text {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.4;
        }

        .faq-icon-indicator {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent);
          flex-shrink: 0;
        }

        .faq-answer-container {
          padding: 0 28px 24px;
          animation: dgsFadeIn 0.2s ease-out;
        }

        .faq-answer-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.65;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
