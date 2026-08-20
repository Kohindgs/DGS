'use client';

import React, { useState } from 'react';

export default function GrowthAuditModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    primaryGoal: '360° Digital Growth Engine (SEO + GEO + Paid + AI Creative)',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>

        {!submitted ? (
          <div>
            <div className="modal-header">
              <div className="modal-badge">● CONFIDENTIAL DISCOVERY</div>
              <h2 className="modal-title">Request a 360° Growth Audit</h2>
              <p className="modal-sub">
                Receive an authoritative diagnosis of your search entity graph, Core Web Vitals, and competitor gaps within 7 business days.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Enterprises"
                    className="form-input"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  className="form-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Growth Focus</label>
                <select
                  className="form-select"
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                >
                  <option value="360° Digital Growth Engine (SEO + GEO + Paid + AI Creative)">360° Connected Growth Engine</option>
                  <option value="Search Engine Optimization (SEO) & AEO Dominance">SEO & AEO / Perplexity Authority</option>
                  <option value="Full-Stack Next.js Web Re-architecture">Next.js Web Re-architecture</option>
                  <option value="Generative AI Creative & Video Production">AI Creative & Video Studio</option>
                  <option value="High-ROAS Performance Marketing">Paid Performance & ROAS Scaling</option>
                </select>
              </div>

              <button type="submit" className="btn-primary form-submit-btn">
                Submit Growth Audit Request →
              </button>
            </form>
          </div>
        ) : (
          <div className="submitted-box text-center">
            <div className="success-icon">✓</div>
            <h2 className="modal-title">Audit Request Received!</h2>
            <p className="modal-sub">
              Thank you, <strong>{formData.name}</strong>. Our senior growth architects have received your briefing for <strong>{formData.company || 'your brand'}</strong>. We will review your digital footprint and contact you shortly.
            </p>
            <div className="direct-contact-help">
              <span>Need immediate assistance?</span>
              <a href="tel:+919987922901" className="direct-phone">Call +91 99879 22901</a>
            </div>
            <button type="button" className="btn-primary" onClick={handleReset} style={{ marginTop: '24px' }}>
              Done
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(18px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: dgsFadeIn 0.25s ease-out;
        }

        .modal-card {
          max-width: 640px;
          width: 100%;
          background: #0A0D14;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-xl);
          padding: clamp(28px, 4vw, 44px);
          position: relative;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(253, 92, 98, 0.15);
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .modal-title {
          font-size: clamp(1.5rem, 2.2vw, 2rem);
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .modal-sub {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.55;
          margin-bottom: 24px;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-submit-btn {
          width: 100%;
          padding: 16px;
          margin-top: 10px;
          justify-content: center;
        }

        .submitted-box {
          padding: 20px 0;
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.2);
          border: 2px solid #10B981;
          color: #10B981;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .direct-contact-help {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.86rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 18px;
        }

        .direct-phone {
          color: var(--accent);
          font-weight: 700;
        }

        @media (max-width: 540px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
