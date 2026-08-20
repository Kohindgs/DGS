'use client';

import React, { useState } from 'react';
import styles from './homepage.module.css';

export default function AuditCtaSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Search Engine Optimization',
    source: 'Google Search',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <section className={`${styles.auditSection} dgs-section`} id="audit-form">
      <div className="dgs-container">
        
        <div className={styles.auditCard}>
          <div className={styles.auditGrid}>
            
            {/* Left Copy */}
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot}></span>
                <span>Complimentary Consultation</span>
              </div>
              <h2 className={styles.auditFormTitle}>
                Ready To Scale <br />
                <span className={styles.titleGradient}>Your Brand?</span>
              </h2>
              <p className={styles.auditFormDesc}>
                Let our senior growth strategists audit your website performance, search visibility, entity authority, and paid acquisition funnel.
              </p>

              <div className={styles.auditContactItem}>
                <span className={styles.auditContactIcon}>📍</span>
                <span>Unit 202, Amore Edge, SV Road, Khar West, Mumbai 400052</span>
              </div>
              <div className={styles.auditContactItem}>
                <span className={styles.auditContactIcon}>📞</span>
                <span>+91 99879 22901 / +91 85919 50238</span>
              </div>
              <div className={styles.auditContactItem}>
                <span className={styles.auditContactIcon}>✉️</span>
                <span>business@dgeniussolutions.com</span>
              </div>
            </div>

            {/* Right Form */}
            <div>
              {submitted ? (
                <div className={styles.formSuccessBox}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>
                    Growth Audit Request Received!
                  </h3>
                  <p style={{ color: 'var(--dgs-text-secondary)', lineHeight: 1.6 }}>
                    Thank you, <strong>{formData.name}</strong>. A senior strategist from our Mumbai team will review your brand assets and reach out at <strong>{formData.email}</strong> within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.formInputsGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        placeholder="John Doe" 
                        className={styles.formInput}
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Work Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        placeholder="john@company.com" 
                        className={styles.formInput}
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        placeholder="+91 99879 22901" 
                        className={styles.formInput}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Company Name</label>
                      <input 
                        type="text" 
                        name="company" 
                        placeholder="Company Pvt Ltd" 
                        className={styles.formInput}
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Service Needed</label>
                      <select 
                        name="service" 
                        className={styles.formSelect}
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="Search Engine Optimization">Search Engine Optimization (SEO)</option>
                        <option value="AEO & Generative Engine Optimization">AEO & GEO Search Visibility</option>
                        <option value="AI Video Production">AI Video Production</option>
                        <option value="Website Development & AMC">Website Development & AMC</option>
                        <option value="Performance Marketing & Ads">Performance Marketing & Ads</option>
                        <option value="Brand Identity & Social Media">Brand Identity & Social Media</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>How Did You Hear About Us?</label>
                      <select 
                        name="source" 
                        className={styles.formSelect}
                        value={formData.source}
                        onChange={handleChange}
                      >
                        <option value="Google Search">Google Search</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Client Referral">Client Referral</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Clutch / Reviews">Clutch / Reviews</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>Your Growth Goals or Message</label>
                      <textarea 
                        name="message" 
                        placeholder="Tell us what you want to build, improve, or scale..."
                        className={styles.formTextarea}
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className={styles.btnPrimary} style={{ width: '100%' }}>
                    <span>Request Growth Audit Now</span>
                    <span>→</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
