'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { aiPortfolioData } from '../../data/homepageData';

const productionProtocol = [
  { step: '01', title: 'Strategic Brief', desc: 'Brand essence, audience psychographics, and target commercial conversion objectives.' },
  { step: '02', title: 'Prompt Architecture', desc: 'Custom LoRA weights, cinematic camera scripts, lighting maps, and style direction.' },
  { step: '03', title: 'Neural Generation', desc: 'Ultra-high-definition synthesis of photorealistic visuals, motion sequences, and acoustic layers.' },
  { step: '04', title: 'Human Art Direction', desc: 'Rigorous color grading, typographic curation, sound design, and brand compliance.' },
  { step: '05', title: 'Omnichannel Delivery', desc: 'Multi-aspect ratio exports optimized for programmatic paid media, social, and web.' },
];

export default function AiStudioSection() {
  const [activeVisualIdx, setActiveVisualIdx] = useState(0);
  const activeItem = aiPortfolioData[activeVisualIdx] || aiPortfolioData[0];

  return (
    <section className={styles.aiStudioSection + ' dgs-section'} id="ai-studio">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Generative AI Studio</span>
          </div>
          <h2 className={styles.titleMain}>
            AI-Led Creative <span className={styles.titleGradient}>Velocity &amp; Precision</span>
          </h2>
          <p className={styles.subtitle}>
            We combine rigorous human art direction with cutting-edge neural pipelines to produce cinema-grade video, 3D product stills, and high-velocity cultural campaigns.
          </p>
        </div>

        {/* Interactive Cinematic Stage */}
        <div className={styles.aiCinematicStage}>
          
          {/* Left: Visual Viewport */}
          <div className={styles.aiVisualViewport}>
            <div className={styles.aiViewportBadge}>
              <span className={styles.aiBadgeDot}></span>
              <span>{activeItem.tag}</span>
            </div>

            <div className={styles.aiImageWrapper}>
              <img 
                src={activeItem.image} 
                alt={activeItem.title} 
                className={styles.aiHeroImg}
                loading="lazy"
              />
            </div>

            {/* Prompt & Technical Blueprint Bar */}
            <div className={styles.aiPromptBar}>
              <div className={styles.aiPromptLabel}>CREATIVE PROMPT DIRECTION:</div>
              <div className={styles.aiPromptText}>&ldquo;{activeItem.promptInsight}&rdquo;</div>
              <div className={styles.aiPromptMetric}>{activeItem.metrics}</div>
            </div>
          </div>

          {/* Right: Dynamic Selection Track */}
          <div className={styles.aiSelectionTrack}>
            <div className={styles.aiTrackKicker}>SELECT AI PRODUCTION DISCIPLINE:</div>
            
            {aiPortfolioData.map((item, idx) => {
              const isActive = activeVisualIdx === idx;
              return (
                <div 
                  key={item.id}
                  className={styles.aiTrackItem + (isActive ? ' ' + styles.aiTrackItemActive : '')}
                  onClick={() => setActiveVisualIdx(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveVisualIdx(idx); }}
                >
                  <div className={styles.aiTrackItemNum}>0{idx + 1}</div>
                  <div className={styles.aiTrackItemBody}>
                    <div className={styles.aiTrackItemCat}>{item.category}</div>
                    <h3 className={styles.aiTrackItemTitle}>{item.title}</h3>
                    <p className={styles.aiTrackItemDesc}>{item.description}</p>
                  </div>
                  <div className={styles.aiTrackItemArrow}>{isActive ? '●' : '→'}</div>
                </div>
              );
            })}
          </div>

        </div>

        {/* The 5-Step AI Production Protocol */}
        <div className={styles.protocolContainer}>
          <div className={styles.protocolHeader}>
            <span className={styles.protocolEyebrow}>SYSTEMATIC PRODUCTION</span>
            <h3 className={styles.protocolMainTitle}>The DGS AI Production Protocol</h3>
            <p className={styles.protocolSub}>From strategic brief to multichannel campaign readiness in days, not months.</p>
          </div>

          <div className={styles.protocolGrid}>
            {productionProtocol.map((p, idx) => (
              <div key={idx} className={styles.protocolCard}>
                <div className={styles.protocolStepNum}>{p.step}</div>
                <h4 className={styles.protocolStepTitle}>{p.title}</h4>
                <p className={styles.protocolStepDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
