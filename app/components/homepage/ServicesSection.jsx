import React from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';

const servicesData = [
  {
    num: '01',
    title: 'Search Visibility & AI Discovery',
    desc: 'Search strategy, technical foundations, entity structuring, schema modeling, and AI-answer readiness designed to ensure discovery across Google, ChatGPT, Perplexity, and AI Overviews.',
    tags: ['Technical SEO', 'Answer Engine Optimization (AEO)', 'Generative Engine Optimization (GEO)', 'LLM SEO', 'Voice Search'],
    link: '/services/seo-services-in-mumbai',
    cta: 'Explore SEO & Search Services'
  },
  {
    num: '02',
    title: 'Website Development & AMC',
    desc: 'Custom Next.js web applications, headless architectures, UX/UI design systems, conversion rate optimization, and ongoing enterprise AMC to keep digital platforms blisteringly fast and secure.',
    tags: ['Next.js App Router', 'Headless CMS', 'UI/UX Design Systems', 'Speed Optimization', 'Enterprise AMC'],
    link: '#audit-form',
    cta: 'Request Web Architecture Proposal'
  },
  {
    num: '03',
    title: 'Social Media & Performance Marketing',
    desc: 'Hyper-targeted Meta Ads, Google Ads ROI pipelines, LinkedIn B2B acquisition engines, high-cadence creative testing, and multi-touch conversion attribution.',
    tags: ['Meta Ads Scaling', 'Google Search & Shopping', 'LinkedIn B2B', 'Creative Strategy', 'ROAS Optimization'],
    link: '#audit-form',
    cta: 'Scale Paid Performance'
  },
  {
    num: '04',
    title: 'Branding, Content & AI Production',
    desc: 'Complete brand identity systems, AI video production, 3D product motion, mascot design, festive campaign storytelling, and scalable creative output for agile marketing teams.',
    tags: ['Brand Identity', 'AI Video Production', '3D Mascot Systems', 'Product Motion', 'Campaign Concepts'],
    link: '/services/ai-video-production-agency',
    cta: 'Explore AI Video & Creative Lab'
  }
];

export default function ServicesSection() {
  return (
    <section className={`${styles.servicesSection} dgs-section`} id="services">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Capabilities Ecosystem</span>
          </div>
          <h2 className={styles.titleMain}>
            What You Can <span className={styles.titleGradient}>Hire Us For</span>
          </h2>
          <p className={styles.subtitle}>
            One unified team across search, web architecture, creative design, performance media, and AI-led production so every dollar pulls in the same direction.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {servicesData.map((svc, idx) => (
            <div key={idx} className={styles.serviceCard}>
              <div className={styles.serviceNum}>{svc.num}</div>
              <h3 className={styles.serviceTitle}>{svc.title}</h3>
              <p className={styles.serviceDescription}>{svc.desc}</p>
              
              <div className={styles.serviceTagsWrap}>
                {svc.tags.map((t, tIdx) => (
                  <span key={tIdx} className={styles.serviceTag}>{t}</span>
                ))}
              </div>

              <Link href={svc.link} className={styles.serviceLink}>
                <span>{svc.cta}</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
