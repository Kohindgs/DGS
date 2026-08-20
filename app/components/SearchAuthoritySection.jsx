'use client';

import React from 'react';
import { searchAuthorityMatrix } from '../data/homepageData';

export default function SearchAuthoritySection({ onOpenAudit }) {
  return (
    <section className="dgs-section dgs-search-section" id="search-authority" aria-label="Search Authority in the AI Era">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>NEXT-GENERATION SEARCH SCIENCE</span>
          </div>
          <h2 className="section-title">
            Search Authority in the AI Era: Beyond Traditional Keywords
          </h2>
          <p className="section-desc">
            Search is no longer just ten blue links on Google. Autonomous LLMs like Perplexity, ChatGPT Search, and Google AI Overviews answer user questions directly. We position your brand to be cited and recommended first.
          </p>
        </div>

        {/* Matrix Comparison Table */}
        <div className="matrix-table-card glass-card">
          <div className="matrix-table-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>DIMENSION</th>
                  <th>TRADITIONAL SEO</th>
                  <th>ANSWER ENGINE (AEO)</th>
                  <th>GENERATIVE SEO (GEO)</th>
                  <th className="highlight-col">DGS CONNECTED ADVANTAGE</th>
                </tr>
              </thead>
              <tbody>
                {searchAuthorityMatrix.map((row, idx) => (
                  <tr key={idx}>
                    <td className="dim-label">{row.dimension}</td>
                    <td>{row.traditionalSeo}</td>
                    <td>{row.answerEngine}</td>
                    <td>{row.generativeSeo}</td>
                    <td className="highlight-cell">
                      <span className="cell-badge">✦ {row.dgsAdvantage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Pillar Technical Visual */}
        <div className="search-pillars-grid">
          <div className="search-pillar-card glass-card">
            <div className="pillar-num">01</div>
            <h3 className="pillar-title">Structured Entity Knowledge Graph</h3>
            <p className="pillar-desc">
              We encode your brand's services, founders, locations, and citations into dense Schema.org JSON-LD networks, making your authoritative identity undeniable to search crawlers and LLMs.
            </p>
          </div>

          <div className="search-pillar-card glass-card">
            <div className="pillar-num">02</div>
            <h3 className="pillar-title">LLM Grounding & Reference Seeding</h3>
            <p className="pillar-desc">
              We architect digital PR, research whitepapers, and high-trust citations that train AI foundation models (OpenAI, Anthropic, Perplexity) to recommend your solution for conversational queries.
            </p>
          </div>

          <div className="search-pillar-card glass-card">
            <div className="pillar-num">03</div>
            <h3 className="pillar-title">Programmatic Topical Clustering</h3>
            <p className="pillar-desc">
              We deploy full-coverage content silos covering every high-intent permutation of your category, securing top rankings for both broad industry head terms and profitable long-tail keywords.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-search-section {
          background: #060709;
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
        }

        .matrix-table-card {
          padding: clamp(20px, 3vw, 36px);
          border-radius: var(--radius-xl);
          background: rgba(14, 18, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: clamp(40px, 5vw, 60px);
          overflow: hidden;
        }

        .matrix-table-wrapper {
          overflow-x: auto;
        }

        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 720px;
        }

        .matrix-table th {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.6);
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .matrix-table th.highlight-col {
          color: var(--accent);
          background: rgba(253, 92, 98, 0.08);
        }

        .matrix-table td {
          padding: 20px;
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.75);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          line-height: 1.5;
        }

        .dim-label {
          font-family: var(--font-sans);
          font-weight: 700;
          color: #FFFFFF;
        }

        .highlight-cell {
          background: rgba(253, 92, 98, 0.04);
        }

        .cell-badge {
          font-family: var(--font-sans);
          font-weight: 700;
          color: var(--accent);
        }

        .search-pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: clamp(20px, 3vw, 32px);
        }

        .search-pillar-card {
          padding: clamp(28px, 3vw, 36px);
          border-radius: var(--radius-xl);
          background: rgba(18, 22, 32, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }

        .search-pillar-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 242, 254, 0.4);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .pillar-num {
          font-family: var(--font-mono);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--teal);
          margin-bottom: 14px;
        }

        .pillar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 10px;
        }

        .pillar-desc {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
