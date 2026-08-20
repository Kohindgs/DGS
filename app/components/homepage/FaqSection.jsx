'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';

const faqs = [
  {
    q: "What does D'Genius Solutions do?",
    a: "D'Genius Solutions is a full service digital marketing agency in Mumbai that connects search visibility, website development, social media, performance marketing, branding, content, and AI-led creative production into one revenue-driven ecosystem."
  },
  {
    q: "Why choose a full service digital marketing agency?",
    a: "A full service agency ensures strategy, creative design, technical engineering, media buying, and analytics work together synchronously instead of operating as fragmented, conflicting activities."
  },
  {
    q: "How do your digital marketing services work together?",
    a: "We align your website architecture, organic search visibility (SEO/AEO/GEO), paid advertising campaigns, social content, and AI video production around shared business objectives, seamless user journeys, and measurable ROAS."
  },
  {
    q: "Can you support both organic and paid growth?",
    a: "Yes. We engineer sustainable organic search authority through technical SEO, AEO, and content architecture while simultaneously executing high-performance paid campaigns on Google, Meta, and LinkedIn for immediate conversion."
  },
  {
    q: "Where is D'Genius Solutions located?",
    a: "D'Genius Solutions is headquartered at Unit 202, Amore Edge, Swami Vivekanand Road, Khar West, Mumbai 400052, and serves brands across India, Dubai, the UAE, and global markets."
  },
  {
    q: "Do you provide website, creative and AI-led production under one team?",
    a: "Yes. Our in-house connected team handles full-stack web development (Next.js), brand identity systems, social media, performance marketing, and generative AI production under a unified mandate."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={`${styles.faqSection} dgs-section`} id="faq">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Search Ready Answers</span>
          </div>
          <h2 className={styles.titleMain}>
            Frequently Asked <span className={styles.titleGradient}>Questions</span>
          </h2>
          <p className={styles.subtitle}>
            Clear, transparent answers to help you evaluate how D'Genius Solutions can accelerate your brand growth.
          </p>
        </div>

        <div className={styles.faqWrapper}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={styles.faqItem}>
                <button 
                  className={styles.faqQuestionBtn}
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.a}</p>
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
