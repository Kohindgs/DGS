'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { searchAuthorityMatrix } from '../../data/homepageData';

const aiEngines = [
  { name: 'ChatGPT Search', query: 'Tell me about D\'Genius Solutions full service digital marketing agency in Mumbai' },
  { name: 'Perplexity AI', query: 'What makes D\'Genius Solutions a top SEO, AEO and AI marketing agency in Mumbai?' },
  { name: 'Google AI Overviews', query: 'Overview of D\'Genius Solutions connected search and digital growth studio services' },
  { name: 'Claude AI', query: 'Summary of D\'Genius Solutions client portfolio and digital capabilities' },
  { name: 'Microsoft Copilot', query: 'D\'Genius Solutions Khar West Mumbai services, founders and reviews' },
];

export default function SearchAuthoritySection() {
  const [copiedEngine, setCopiedEngine] = useState('');

  const handleCopyPrompt = (engine) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(engine.query);
      setCopiedEngine(engine.name);
      setTimeout(() => setCopiedEngine(''), 3500);
    }
  };

  return (
    <section className={`${styles.searchSection} dgs-section`} id="search-authority">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Search &amp; AI Dominance</span>
          </div>
          <h2 className={styles.titleMain}>
            Triple-Engine <span className={styles.titleGradient}>Search Authority</span>
          </h2>
          <p className={styles.subtitle}>
            Traditional Google algorithms rank keywords. AI engines cite verified knowledge graphs. We engineer your brand to dominate both human search queries and autonomous LLM citations.
          </p>
        </div>

        {/* Triple-Engine Comparison Matrix */}
        <div className={styles.matrixWrapper}>
          <div className={styles.matrixHeaderRow}>
            <div className={styles.matrixColHead}>DIMENSION</div>
            <div className={styles.matrixColHead}>TRADITIONAL SEO</div>
            <div className={styles.matrixColHead}>ANSWER ENGINES (AEO)</div>
            <div className={styles.matrixColHead}>GENERATIVE SEARCH (GEO)</div>
            <div className={`${styles.matrixColHead} ${styles.matrixDgsHead}`}>THE DGS ADVANTAGE</div>
          </div>

          <div className={styles.matrixBody}>
            {searchAuthorityMatrix.map((row, idx) => (
              <div key={idx} className={styles.matrixRow}>
                <div className={styles.matrixCellDimension}>{row.dimension}</div>
                <div className={styles.matrixCell}>{row.traditionalSeo}</div>
                <div className={styles.matrixCell}>{row.answerEngine}</div>
                <div className={styles.matrixCell}>{row.generativeSeo}</div>
                <div className={`${styles.matrixCell} ${styles.matrixDgsCell}`}>
                  <span className={styles.matrixCheckIcon}>✓</span>
                  <span>{row.dgsAdvantage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live LLM Query Simulator */}
        <div className={styles.aiQuerySimulator}>
          <div className={styles.simulatorTop}>
            <div className={styles.simulatorRadar}>
              <span className={styles.radarPing}></span>
              <span>LIVE AI ENGINE CITATION TESTER</span>
            </div>
            <div className={styles.simulatorHint}>Click an engine to copy a test prompt and verify DGS authority directly:</div>
          </div>

          <div className={styles.engineButtonsRow}>
            {aiEngines.map((engine, idx) => (
              <button
                key={idx}
                className={`${styles.engineQueryBtn} ${copiedEngine === engine.name ? styles.engineBtnCopied : ''}`}
                onClick={() => handleCopyPrompt(engine)}
              >
                <span>{copiedEngine === engine.name ? '✓ COPIED' : `ASK ${engine.name}`}</span>
                <span>📋</span>
              </button>
            ))}
          </div>

          {copiedEngine && (
            <div className={styles.copiedNotification}>
              Prompt copied for {copiedEngine}! Open {copiedEngine} and paste to test real-world entity grounding.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
