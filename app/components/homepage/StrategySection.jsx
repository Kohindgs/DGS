import React from 'react';
import styles from './homepage.module.css';

const growthPhases = [
  {
    phase: 'Phase 01',
    title: 'Diagnostic Audit & Entity Mapping',
    body: 'We dissect your technical web infrastructure, brand entity signals in knowledge graphs, search rankings, organic share-of-voice, and creative bottlenecks to pinpoint high-leverage growth opportunities.'
  },
  {
    phase: 'Phase 02',
    title: 'Architectural Modeling & Content Blueprints',
    body: 'We architect modern Next.js experiences, structured JSON-LD schemas, search intent clusters, and conversion funnels tailored to how both algorithms and humans evaluate authority.'
  },
  {
    phase: 'Phase 03',
    title: 'Omnichannel Activation & AI Production',
    body: 'We launch high-velocity search campaigns, generative AI video assets, festive moments, and paid performance funnels, continuously measuring click-through and cost-per-acquisition.'
  },
  {
    phase: 'Phase 04',
    title: 'Algorithmic Calibration & Scale',
    body: 'We continuously calibrate content for Google AI Overviews, Perplexity answers, and LLM citations while scaling profitable performance media channels.'
  }
];

export default function StrategySection() {
  return (
    <section className={`${styles.strategySection} dgs-section`} id="strategy">
      <div className="dgs-container">
        
        <div className={styles.strategyGrid}>
          
          {/* Left Sticky Column */}
          <div className={styles.strategyStickyCol}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot}></span>
              <span>Our Operating Approach</span>
            </div>
            <h2 className={styles.titleMain}>
              The DGS Connected <br />
              <span className={styles.titleGradient}>Growth Protocol</span>
            </h2>
            <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
              We eliminate the fragmentation between creative agencies, tech developers, and search specialists by executing through a unified 4-phase operating framework.
            </p>
            <a href="#audit-form" className={styles.btnPrimary}>
              <span>Start Growth Diagnosis</span>
              <span>→</span>
            </a>
          </div>

          {/* Right Steps Column */}
          <div className={styles.strategyStepsCol}>
            {growthPhases.map((phase, idx) => (
              <div key={idx} className={styles.strategyStepCard}>
                <div className={styles.stepHeaderRow}>
                  <span className={styles.phaseTag}>{phase.phase}</span>
                </div>
                <h3 className={styles.stepTitle}>{phase.title}</h3>
                <p className={styles.stepBody}>{phase.body}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
