'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';
import { operatingApproachSteps } from '../../data/homepageData';

export default function StrategySection() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const activeStep = operatingApproachSteps[activeStepIdx] || operatingApproachSteps[0];

  return (
    <section className={`${styles.strategySection} dgs-section`} id="strategy">
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
            A rigorous 4-phase operating framework that aligns technical search architecture, full-stack web development, and AI creative velocity toward measurable brand equity.
          </p>
        </div>

        {/* Sticky Narrative Dual-Stage System */}
        <div className={styles.stickyNarrativeGrid}>
          
          {/* Left: Sticky Holographic Diagnostic Terminal */}
          <div className={styles.stickyStageCol}>
            <div className={styles.diagnosticTerminal}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalWindowDots}>
                  <span></span><span></span><span></span>
                </div>
                <div className={styles.terminalTitle}>PROTOCOL DIAGNOSTIC // {activeStep.phase}</div>
                <div className={styles.terminalLivePill}>ACTIVE</div>
              </div>

              <div className={styles.terminalBody}>
                <div className={styles.terminalPhaseNum}>STAGE 0{activeStepIdx + 1}</div>
                <h3 className={styles.terminalPhaseTitle}>{activeStep.title}</h3>
                <div className={styles.terminalSub}>{activeStep.subtitle}</div>

                <div className={styles.terminalDeliverables}>
                  <div className={styles.terminalSectionHeader}>ACTIVE DELIVERABLES:</div>
                  {activeStep.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className={styles.terminalDelItem}>
                      <span className={styles.terminalDelDot}>❯</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.terminalTelemetryGrid}>
                  <div className={styles.telemetryBox}>
                    <div className={styles.telemetryBoxLabel}>NODE VELOCITY</div>
                    <div className={styles.telemetryBoxVal}>{activeStep.telemetry.nodesFound}</div>
                  </div>
                  <div className={styles.telemetryBox}>
                    <div className={styles.telemetryBoxLabel}>SYSTEM HEALTH</div>
                    <div className={styles.telemetryBoxVal}>{activeStep.telemetry.healthScore}</div>
                  </div>
                </div>

                <div className={styles.terminalFootStatus}>
                  STATUS: <span>{activeStep.telemetry.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Scrollable Step Cards Track */}
          <div className={styles.stepsTrackCol}>
            {operatingApproachSteps.map((step, idx) => {
              const isActive = activeStepIdx === idx;
              return (
                <div
                  key={step.phase}
                  className={`${styles.narrativeStepCard} ${isActive ? styles.narrativeStepCardActive : ''}`}
                  onClick={() => setActiveStepIdx(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveStepIdx(idx); }}
                >
                  <div className={styles.stepCardHeader}>
                    <span className={styles.stepCardPhaseTag}>{step.phase}</span>
                    <span className={styles.stepCardIndicator}>{isActive ? '● ACTIVE' : 'CLICK TO VIEW'}</span>
                  </div>

                  <h3 className={styles.stepCardTitle}>{step.title}</h3>
                  <div className={styles.stepCardSub}>{step.subtitle}</div>
                  <p className={styles.stepCardDesc}>{step.description}</p>

                  <div className={styles.stepCardDeliverables}>
                    {step.deliverables.map((del, dIdx) => (
                      <span key={dIdx} className={styles.stepMiniTag}>✓ {del}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
