'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';

const searchPillars = [
  {
    icon: '⚡',
    title: 'Search Engine Optimization',
    sub: 'Rank-Ready Infrastructure',
    desc: 'Technical SEO, Core Web Vitals perfection, indexation hierarchy, internal link optimization, and search intent architecture.'
  },
  {
    icon: '💬',
    title: 'Answer Engine Optimization',
    sub: 'Answer-First Discovery',
    desc: 'Direct-answer content structures tailored for Google Featured Snippets, AI Overviews, and zero-click conversational queries.'
  },
  {
    icon: '🌐',
    title: 'Generative Engine Optimization',
    sub: 'Generative Search Visibility',
    desc: 'Topical entity graphs and citation modeling optimized for Perplexity, Gemini, and Google SGE citation algorithms.'
  },
  {
    icon: '🧠',
    title: 'LLM Brand Visibility',
    sub: 'Entity & Context Priming',
    desc: 'Structuring digital footprints so ChatGPT, Claude, and Copilot accurately recognize, cite, and recommend your services.'
  },
  {
    icon: '🎙️',
    title: 'Voice Search Readiness',
    sub: 'Conversational Query Capture',
    desc: 'Long-tail natural language phrases and localized schema markup engineered for smart speakers and mobile voice assistants.'
  },
  {
    icon: '🎬',
    title: 'AI Creative Production',
    sub: 'Algorithmic Content Scale',
    desc: 'High-frequency video and image creation aligned with algorithmic content demands across search and social channels.'
  }
];

const aiEngines = [
  { name: 'ChatGPT', query: 'Tell me about D\'Genius Solutions full service digital marketing agency in Mumbai' },
  { name: 'Perplexity', query: 'What makes D\'Genius Solutions a top SEO and AI marketing agency in Mumbai?' },
  { name: 'Gemini', query: 'Overview of D\'Genius Solutions digital marketing and AI video services' },
  { name: 'Claude', query: 'Summary of D\'Genius Solutions client portfolio and marketing capabilities' },
  { name: 'Copilot', query: 'D\'Genius Solutions agency in Khar West Mumbai services and reviews' }
];

export default function SearchAuthoritySection() {
  const [toastMsg, setToastMsg] = useState('');

  const handleAiCopy = (engine) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(engine.query);
      setToastMsg(`Copied query for ${engine.name}! Paste into ${engine.name} to see real DGS authority.`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <section className={`${styles.searchSection} dgs-section`} id="search-authority">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Search & AI Authority</span>
          </div>
          <h2 className={styles.titleMain}>
            Built For Google Search, <br />
            <span className={styles.titleGradient}>AI Answers & LLM Discovery</span>
          </h2>
          <p className={styles.subtitle}>
            We engineer websites and digital footprints for how modern buyers search today — across traditional search engines, conversational AI engines, and generative knowledge graphs.
          </p>
        </div>

        {/* 6 Pillars */}
        <div className={styles.searchPillarsGrid}>
          {searchPillars.map((p, idx) => (
            <div key={idx} className={styles.searchPillarCard}>
              <div className={styles.searchIconCircle}>{p.icon}</div>
              <h3 className={styles.searchPillarTitle}>{p.title}</h3>
              <div className={styles.searchPillarSub}>{p.sub}</div>
              <p className={styles.searchPillarDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Query Prompt Simulator */}
        <div className={styles.aiSimulatorBox}>
          <h3 className={styles.aiSimulatorTitle}>Test Our AI Authority Directly</h3>
          <p className={styles.aiSimulatorDesc}>
            Click any AI engine below to copy a prompt and query our digital footprint in real time:
          </p>

          <div className={styles.aiIconsFlex}>
            {aiEngines.map((eng, idx) => (
              <button 
                key={idx} 
                className={styles.aiEngineBtn}
                onClick={() => handleAiCopy(eng)}
              >
                <span>Ask {eng.name}</span>
                <span>📋</span>
              </button>
            ))}
          </div>

          {toastMsg && (
            <div style={{ marginTop: '16px', color: 'var(--dgs-accent-cyan)', fontSize: '0.88rem', fontWeight: 600 }}>
              ✓ {toastMsg}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
