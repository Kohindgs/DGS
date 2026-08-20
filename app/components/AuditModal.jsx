'use client';

import React, { useState, useEffect } from 'react';

export default function AuditModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    services: ['Search Engine Optimization (SEO)', 'AEO & GEO (AI Search)'],
    budget: '$5,000 - $15,000 / mo',
    message: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSubmitted(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const serviceOptions = [
    'Search Engine Optimization (SEO)',
    'AEO & GEO (AI Search Discovery)',
    'LLM Brand Knowledge Graphs',
    'Custom Next.js Web Application',
    'AI Video Production & CGI',
    'Performance Marketing (Google & Meta Ads)',
    'Brand Identity & Design Systems',
    'Annual Web Maintenance (AMC)'
  ];

  const budgetOptions = [
    'Under $3,000 / mo',
    '$3,000 - $5,000 / mo',
    '$5,000 - $15,000 / mo',
    '$15,000+ / mo',
    'One-Time Project Mandate'
  ];

  const handleServiceToggle = (service) => {
    setFormData(prev => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists 
          ? prev.services.filter(s => s !== service)
          : [...prev.services, service]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Book Free Studio Growth Audit"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(4, 6, 10, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 3vw, 2.5rem)',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#0a0f18',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.75rem, 4vw, 3rem)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 245, 212, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {submitted ? (
          /* Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 212, 0.15)',
              border: '2px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.5rem auto'
            }}>
              ✓
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
              Audit Request Received!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Thank you, <strong>{formData.fullName || 'Partner'}</strong>. Our senior growth strategists will analyze <strong>{formData.company || 'your brand'}</strong> and dispatch your customized 360° Diagnostic Report within 24 hours.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              fontFamily: 'var(--font-mono)'
            }}>
              📞 Urgent Priority? Direct line: <a href="tel:+919987922901" style={{ color: 'var(--accent-cyan)' }}>+91 99879 22901</a>
            </div>
            <button onClick={onClose} className="btn btn-cyan" style={{ padding: '0.75rem 2rem' }}>
              Back To Website
            </button>
          </div>
        ) : (
          /* Form Content */
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div className="badge-tag badge-cyan" style={{ marginBottom: '0.75rem' }}>
                <span>✦ STEP {step} OF 2</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.35rem' }}>
                Request Free 360° Studio Growth Audit
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                Directly reviewed by senior digital marketing, search &amp; AI strategists.
              </p>
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        YOUR FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        BUSINESS EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rahul@company.com"
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        PHONE / WHATSAPP *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        COMPANY / WEBSITE URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value, website: e.target.value })}
                        placeholder="Company or website.com"
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          color: '#ffffff',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-cyan" style={{ marginTop: '1rem', width: '100%' }}>
                    Continue to Mandate Focus →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      SELECT FOCUS SERVICES (SELECT ALL THAT APPLY)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {serviceOptions.map((svc) => {
                        const isSelected = formData.services.includes(svc);
                        return (
                          <div
                            key={svc}
                            onClick={() => handleServiceToggle(svc)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                              background: isSelected ? 'rgba(0, 245, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                              color: isSelected ? '#ffffff' : 'var(--text-muted)',
                              fontSize: '0.82rem',
                              fontFamily: 'var(--font-body)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-dim)' }}>
                              {isSelected ? '☑' : '☐'}
                            </span>
                            <span>{svc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      ESTIMATED MONTHLY BUDGET
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: '#0d131d',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      {budgetOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-outline"
                      style={{ width: '35%' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-cyan"
                      style={{ width: '65%' }}
                    >
                      Submit Audit Request →
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
