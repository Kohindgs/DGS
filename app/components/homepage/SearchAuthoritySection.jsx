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
    <section className={styles.searchSection + ' dgs-section'} id="search-authority">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Search Authority</span>
          </div>
          <h2 className={styles.titleMain}>
            Built for Google Search, <span className={styles.titleGradient}>AI Answers &amp; LLM Citations</span>
          </h2>
          <p className={styles.subtitle}>
            Traditional Google algorithms rank keywords. Modern AI answer engines cite structured knowledge. We engineer your brand to dominate both human search queries and autonomous LLM citations.
          </p>
        </div>

        {/* Triple-Engine Comparison Matrix */}
        <div className={styles.matrixContainer}>
          <div className={styles.matrixHeader}>
            <div className={styles.matrixColTitle}>DIMENSION</div>
            <div className={styles.matrixColTitle}>TRADITIONAL SEO</div>
            <div className={styles.matrixColTitle}>ANSWER ENGINES (AEO)</div>
            <div className={styles.matrixColTitle}>GENERATIVE SEARCH (GEO)</div>
            <div className={styles.matrixColTitle + ' ' + styles.matrixDgsColTitle}>THE DGS ADVANTAGE</div>
          </div>

          <div className={styles.matrixRowsList}>
            {searchAuthorityMatrix.map((row, idx) => (
              <div key={idx} className={styles.matrixRowItem}>
                <div className={styles.matrixDimensionName}>{row.dimension}</div>
                <div className={styles.matrixCellText}>{row.traditionalSeo}</div>
                <div className={styles.matrixCellText}>{row.answerEngine}</div>
                <div className={styles.matrixCellText}>{row.generativeSeo}</div>
                <div className={styles.matrixCellText + ' ' + styles.matrixDgsCellText}>
                  <span className={styles.matrixCheckIcon}>✓</span>
                  <span>{row.dgsAdvantage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine Grounding Citation Tester */}
        <div className={styles.aiCitationTester}>
          <div className={styles.testerHead}>
            <div className={styles.testerIcon}>✦</div>
            <div>
              <h3 className={styles.testerTitle}>Verify DGS Brand Authority Across AI Answer Engines</h3>
              <p className={styles.testerSub}>Click an engine button to copy a test prompt and verify real-world entity grounding directly:</p>
            </div>
          </div>

          <div className={styles.testerButtonsRow}>
            {aiEngines.map((engine, idx) => (
              <button
                key={idx}
                className={styles.testerEngineBtn + (copiedEngine === engine.name ? ' ' + styles.testerEngineBtnCopied : '')}
                onClick={() => handleCopyPrompt(engine)}
              >
                <span>{copiedEngine === engine.name ? '✓ COPIED' : 'TEST ON ' + engine.name.toUpperCase()}</span>
                <span>📋</span>
              </button>
            ))}
          </div>

          {copiedEngine && (
            <div className={styles.copiedAlert}>
              Prompt copied for {copiedEngine}! Paste into {copiedEngine} to verify DGS entity citations.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
