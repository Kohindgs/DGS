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
    service: 'Search Engine Optimization (SEO)',
    source: 'Google Search',
    message: '',
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
    <section className={styles.auditSection + ' dgs-section'} id="audit-form">
      <div className="dgs-container-wide">
        
        <div className={styles.auditSpatialCard}>
          <div className={styles.auditGrid}>
            
            {/* Left: Strategic Consultation Overview */}
            <div className={styles.auditLeftCol}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot}></span>
                <span>Direct Executive Consultation</span>
              </div>

              <h2 className={styles.auditMainTitle}>
                Let Us Audit Your Brand, <br />
                <span className={styles.titleGradient}>Search &amp; Campaign Flow</span>
              </h2>

              <p className={styles.auditParagraph}>
                Partner directly with our senior strategy and engineering leadership. We perform an exhaustive forensic analysis of your organic search graph, AI entity citations, website speed, and paid media funnels.
              </p>

              <div className={styles.auditHqCard}>
                <div className={styles.auditHqTitle}>MUMBAI HEADQUARTERS // STUDIO</div>
                <div className={styles.auditHqAddr}>
                  Unit 202, Amore Edge, Swami Vivekanand Road, Govind Dham, Khar West, Mumbai 400052
                </div>
                <div className={styles.auditHqContacts}>
                  <span>📞 +91 99879 22901 / +91 85919 50238</span>
                  <span>✉️ business@dgeniussolutions.com</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Consultation Form */}
            <div className={styles.auditRightCol}>
              {submitted ? (
                <div className={styles.auditSuccessBox}>
                  <div className={styles.auditSuccessIcon}>✓</div>
                  <h3 className={styles.auditSuccessTitle}>Diagnostic Request Confirmed</h3>
                  <p className={styles.auditSuccessText}>
                    Thank you, <strong>{formData.name}</strong>. Our Mumbai strategy leadership has received your brief for <strong>{formData.company || 'your brand'}</strong>. We will review your digital footprint and reach out at <strong>{formData.email}</strong> within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.auditFormElement}>
                  <div className={styles.formInputsGrid}>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>FULL NAME *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Kohin Bellara"
                        className={styles.formInput}
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>WORK EMAIL *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="leadership@brand.com"
                        className={styles.formInput}
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>PHONE / WHATSAPP *</label>
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
                      <label className={styles.formLabel}>BRAND / COMPANY NAME</label>
                      <input
                        type="text"
                        name="company"
                        placeholder="Acme Enterprises"
                        className={styles.formInput}
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>CORE CAPABILITY NEEDED</label>
                      <select
                        name="service"
                        className={styles.formSelect}
                        value={formData.service}
                        onChange={handleChange}
                      >
                        <option value="Search Engine Optimization (SEO)">Search Engine Optimization (SEO)</option>
                        <option value="AEO & Generative Engine Optimization">AEO &amp; Generative Engine Optimization (GEO)</option>
                        <option value="AI-Led Creative & Video Production">AI-Led Creative &amp; Video Production</option>
                        <option value="Next.js Web & Application Engineering">Next.js Web &amp; Application Engineering</option>
                        <option value="Performance Marketing & Paid Ads">Performance Marketing &amp; Paid Ads</option>
                        <option value="Brand Strategy & Social Systems">Brand Strategy &amp; Social Systems</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>HOW DID YOU HEAR ABOUT US?</label>
                      <select
                        name="source"
                        className={styles.formSelect}
                        value={formData.source}
                        onChange={handleChange}
                      >
                        <option value="Client Referral / Reference">Client Referral / Word-of-Mouth</option>
                        <option value="Google Search">Google Organic Search</option>
                        <option value="AI Engine (Perplexity/ChatGPT)">AI Engine (Perplexity / ChatGPT)</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Clutch / Ratings">Clutch Verified Reviews</option>
                        <option value="Other">Other Strategic Channel</option>
                      </select>
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.formLabel}>GROWTH GOALS / PROJECT BRIEF</label>
                      <textarea
                        name="message"
                        rows={3}
                        placeholder="Tell us what challenges you're experiencing, your target markets, and timelines..."
                        className={styles.formTextarea}
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                  </div>

                  <button type="submit" className={styles.btnPrimary} style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>
                    <span>SUBMIT DIAGNOSTIC BRIEF</span>
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
