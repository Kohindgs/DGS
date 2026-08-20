'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { operatingApproachSteps } from '../../data/homepageData';

export default function StrategySection() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const activeStep = operatingApproachSteps[activeStepIdx] || operatingApproachSteps[0];

  return (
    <section className={styles.strategySection + ' dgs-section'} id="strategy">
      <div className="dgs-container-wide">
        
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Operating Methodology</span>
          </div>
          <h2 className={styles.titleMain}>
            The Connected <span className={styles.titleGradient}>Growth Protocol</span>
          </h2>
          <p className={styles.subtitle}>
            A rigorous 4-phase operating framework that aligns technical search architecture, full-stack web engineering, and AI creative velocity toward measurable brand equity.
          </p>
        </div>

        {/* Narrative Flow Grid */}
        <div className={styles.strategyFlowGrid}>
          
          {/* Left: Active Phase Detailed Focus */}
          <div className={styles.strategyDetailCol}>
            <div className={styles.strategyFocusCard}>
              <div className={styles.strategyFocusTag}>{activeStep.phase} // STRATEGIC FOCUS</div>
              <h3 className={styles.strategyFocusTitle}>{activeStep.title}</h3>
              <div className={styles.strategyFocusSub}>{activeStep.subtitle}</div>
              <p className={styles.strategyFocusDesc}>{activeStep.description}</p>

              <div className={styles.strategyDeliverablesBox}>
                <div className={styles.strategyDelivLabel}>PHASE DELIVERABLES:</div>
                <div className={styles.strategyDelivList}>
                  {activeStep.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className={styles.strategyDelivItem}>
                      <span className={styles.strategyDelivDot}>✓</span>
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.strategyCardAction}>
                <a href="#audit-form" className={styles.btnPrimary}>
                  <span>DISCUSS YOUR PHASES</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Step Selector Track */}
          <div className={styles.strategyStepsCol}>
            {operatingApproachSteps.map((step, idx) => {
              const isActive = activeStepIdx === idx;
              return (
                <div
                  key={step.phase}
                  className={styles.strategyStepItem + (isActive ? ' ' + styles.strategyStepItemActive : '')}
                  onClick={() => setActiveStepIdx(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStepIdx(idx); }}
                >
                  <div className={styles.stepItemNumber}>0{idx + 1}</div>
                  <div className={styles.stepItemContent}>
                    <div className={styles.stepItemPhase}>{step.phase}</div>
                    <h4 className={styles.stepItemTitle}>{step.title}</h4>
                    <p className={styles.stepItemSub}>{step.subtitle}</p>
                  </div>
                  <div className={styles.stepItemIndicator}>{isActive ? '●' : '→'}</div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
