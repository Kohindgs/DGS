'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { faqData } from '../../data/homepageData';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={styles.faqSection + ' dgs-section'} id="faq">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Search &amp; Discovery Ready</span>
          </div>
          <h2 className={styles.titleMain}>
            Questions Brands Ask <span className={styles.titleGradient}>Before Choosing Us</span>
          </h2>
          <p className={styles.subtitle}>
            Clear answers for businesses evaluating SEO, AEO, GEO, LLM SEO, website development, social media, performance marketing and AI production.
          </p>
        </div>

        {/* Accessible Accordion FAQ */}
        <div className={styles.faqAccordionWrap}>
          {faqData.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={styles.faqAccordionItem + (isOpen ? ' ' + styles.faqItemOpen : '')}>
                <button
                  className={styles.faqQuestionTrigger}
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  aria-controls={'faq-answer-' + idx}
                  id={'faq-question-' + idx}
                >
                  <span className={styles.faqNum}>0{idx + 1}</span>
                  <span className={styles.faqQuestionText}>{faq.question}</span>
                  <span className={styles.faqToggleIcon}>{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div
                    className={styles.faqAnswerPanel}
                    id={'faq-answer-' + idx}
                    role="region"
                    aria-labelledby={'faq-question-' + idx}
                  >
                    <p className={styles.faqAnswerText}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
