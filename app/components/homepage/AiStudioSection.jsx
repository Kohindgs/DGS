import React from 'react';
import styles from './homepage.module.css';

const aiPillars = [
  {
    num: '01',
    title: 'AI Video Production',
    desc: 'Short-form videos, cinematic reels, dynamic campaign films, and TVC-style concepts produced at 5x conventional agency velocity.'
  },
  {
    num: '02',
    title: 'AI Product Visuals',
    desc: 'Flawless product-led imagery and 3D motion for jewellery, FMCG, luxury retail, lifestyle, and ecommerce product launches.'
  },
  {
    num: '03',
    title: 'Mascot & Character AI',
    desc: 'Proprietary AI-generated mascot systems and distinct character models designed for long-term brand recall and narrative continuity.'
  },
  {
    num: '04',
    title: 'Festival & Topical Content',
    desc: 'Rapid turnarounds for festival campaigns, moment marketing, and social calendars without sacrificing brand integrity.'
  }
];

const pipelineSteps = [
  { step: '01', title: 'Brief', desc: 'Brand essence, audience psychographics, and target conversion objective.' },
  { step: '02', title: 'Concept', desc: 'Prompt architecture, cinematic script, visual direction, and moodboard.' },
  { step: '03', title: 'Generate', desc: 'High-definition neural generation of visuals, animations, and voice synthesis.' },
  { step: '04', title: 'Refine', desc: 'Human-led art direction, sound engineering, color grade, and typography.' },
  { step: '05', title: 'Deliver', desc: 'Multi-aspect exports formatted for omnichannel social, paid ads, and web.' }
];

export default function AiStudioSection() {
  return (
    <section className={`${styles.aiStudioSection} dgs-section`} id="ai-studio">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Generative AI Production Lab</span>
          </div>
          <h2 className={styles.titleMain}>
            AI-Led Creative <span className={styles.titleGradient}>Velocity & Scale</span>
          </h2>
          <p className={styles.subtitle}>
            We combine strategic brand stewardship with generative AI workflows to create campaign assets, TVC concepts, and product narratives in days, not months.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className={styles.aiPillarsGrid}>
          {aiPillars.map((p, idx) => (
            <div key={idx} className={styles.aiPillarCard}>
              <div className={styles.aiPillarNum}>{p.num}</div>
              <h3 className={styles.aiPillarTitle}>{p.title}</h3>
              <p className={styles.aiPillarDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 5-Step Pipeline */}
        <div className={styles.pipelineWrapper}>
          <div className={styles.pipelineHeader}>
            <h3 className={styles.pipelineTitle}>The DGS AI Production Protocol</h3>
            <p className={styles.subtitle}>How we turn strategic creative briefs into campaign-ready assets</p>
          </div>

          <div className={styles.pipelineStepsGrid}>
            {pipelineSteps.map((s, idx) => (
              <div key={idx} className={styles.pipelineStep}>
                <div className={styles.stepNumberCircle}>{s.step}</div>
                <h4 className={styles.stepName}>{s.title}</h4>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
