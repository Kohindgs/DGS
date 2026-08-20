'use client';

import React, { useState } from 'react';
import { operatingApproachSteps } from '../data/homepageData';

export default function OperatingApproach() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = operatingApproachSteps[activeStepIndex];

  return (
    <section className="dgs-section dgs-approach-section" id="approach" aria-label="Our Operating Methodology">
      <div className="dgs-container">
        <div className="section-head text-center">
          <div className="dgs-eyebrow">
            <span className="dgs-eyebrow-dot"></span>
            <span>SYSTEMATIC METHODOLOGY</span>
          </div>
          <h2 className="section-title">
            The DGS Growth Engine: Our 4-Phase Operating System
          </h2>
          <p className="section-desc">
            A battle-tested blueprint that transforms fragmented digital activities into a unified, compounding revenue machine.
          </p>
        </div>

        {/* Interactive Sticky Visual Stage Layout */}
        <div className="approach-interactive-grid">
          {/* Step Selector Column */}
          <div className="steps-column">
            {operatingApproachSteps.map((step, idx) => (
              <div
                key={idx}
                className={`step-nav-card glass-card ${activeStepIndex === idx ? 'active-step' : ''}`}
                onClick={() => setActiveStepIndex(idx)}
              >
                <div className="step-nav-header">
                  <span className="step-nav-phase">{step.phase}</span>
                  <span className="step-nav-indicator">
                    {activeStepIndex === idx ? '● ACTIVE' : 'SELECT'}
                  </span>
                </div>
                <h3 className="step-nav-title">{step.title}</h3>
                <p className="step-nav-sub">{step.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Dynamic Visual Stage Column */}
          <div className="stage-column">
            <div className="stage-card glass-card">
              <div className="stage-header">
                <div className="stage-telemetry-badge">
                  <span className="stage-dot"></span>
                  <span>{activeStep.telemetry.status}</span>
                </div>
                <span className="stage-step-num">{activeStep.telemetry.stepNumber} / 04</span>
              </div>

              <div className="stage-body">
                <span className="stage-phase-tag">{activeStep.phase}</span>
                <h3 className="stage-title">{activeStep.title}</h3>
                <p className="stage-desc">{activeStep.description}</p>

                <div className="stage-deliverables">
                  <div className="deliverables-heading">CORE SYSTEM MILESTONES:</div>
                  <div className="deliverables-grid">
                    {activeStep.deliverables.map((d, dIdx) => (
                      <div key={dIdx} className="deliverable-chip">
                        <span className="deliv-icon">❖</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="stage-telemetry-footer">
                  <div className="telemetry-box">
                    <div className="t-label">Active Node Clusters</div>
                    <div className="t-val">{activeStep.telemetry.nodesFound}</div>
                  </div>
                  <div className="telemetry-box">
                    <div className="t-label">System Health Score</div>
                    <div className="t-val teal">{activeStep.telemetry.healthScore}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dgs-approach-section {
          background: #090B0F;
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

        .approach-interactive-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: clamp(24px, 3vw, 40px);
          align-items: start;
        }

        .steps-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step-nav-card {
          padding: 22px 24px;
          border-radius: var(--radius-lg);
          background: rgba(18, 22, 32, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .step-nav-card:hover {
          background: rgba(26, 32, 46, 0.7);
          transform: translateX(4px);
        }

        .step-nav-card.active-step {
          background: rgba(28, 36, 52, 0.9);
          border-color: var(--accent);
          box-shadow: 0 10px 30px rgba(253, 92, 98, 0.15);
        }

        .step-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .step-nav-phase {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
        }

        .step-nav-indicator {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
        }

        .active-step .step-nav-indicator {
          color: var(--accent);
        }

        .step-nav-title {
          font-size: 1.12rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 4px;
        }

        .step-nav-sub {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.4;
        }

        .stage-card {
          padding: clamp(28px, 3.5vw, 44px);
          border-radius: var(--radius-xl);
          background: radial-gradient(circle at 80% 20%, rgba(253, 92, 98, 0.08) 0%, rgba(14, 18, 26, 0.85) 60%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          position: sticky;
          top: 120px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .stage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stage-telemetry-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--teal);
          background: rgba(0, 242, 254, 0.08);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 4px 10px;
          border-radius: 9999px;
        }

        .stage-dot {
          width: 6px;
          height: 6px;
          background: var(--teal);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--teal);
        }

        .stage-step-num {
          font-family: var(--font-mono);
          font-size: 0.88rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
        }

        .stage-phase-tag {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
        }

        .stage-title {
          font-size: clamp(1.4rem, 2vw, 1.85rem);
          color: #FFFFFF;
          margin: 6px 0 14px;
          line-height: 1.25;
        }

        .stage-desc {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.65;
          margin-bottom: 28px;
        }

        .stage-deliverables {
          margin-bottom: 28px;
        }

        .deliverables-heading {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }

        .deliverables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .deliverable-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .deliv-icon {
          color: var(--accent);
        }

        .stage-telemetry-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .telemetry-box {
          background: rgba(0, 0, 0, 0.4);
          padding: 14px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .t-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 4px;
        }

        .t-val {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .t-val.teal {
          color: var(--teal);
        }

        @media (max-width: 900px) {
          .approach-interactive-grid {
            grid-template-columns: 1fr;
          }
          .deliverables-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
