'use client';

import React from 'react';
import styles from './homepage.module.css';
import Header from './Header';
import Footer from './Footer';
import HeroSection from './HeroSection';
import MarqueeRail from './MarqueeRail';
import LogoWall from './LogoWall';
import AwardsSection from './AwardsSection';
import AiStudioSection from './AiStudioSection';
import CreativePortfolio from './CreativePortfolio';
import CaseStudiesSection from './CaseStudiesSection';
import TestimonialsSection from './TestimonialsSection';
import ServicesSection from './ServicesSection';
import StrategySection from './StrategySection';
import SearchAuthoritySection from './SearchAuthoritySection';
import IndustriesSection from './IndustriesSection';
import WhyDgsSection from './WhyDgsSection';
import FaqSection from './FaqSection';
import AuditCtaSection from './AuditCtaSection';

export default function HomepageClient() {
  return (
    <div className={styles.pageWrapper}>
      {/* Ambient background glows */}
      <div className={styles.ambientGlowTop}></div>
      <div className={styles.ambientGlowMid}></div>
      <div className={styles.ambientGlowBottom}></div>

      {/* Global Navigation Header */}
      <Header />

      <main id="main-content">
        {/* 1. Signature Hero Section */}
        <HeroSection />

        {/* 2. Kinetic Marquee Rail */}
        <MarqueeRail />

        {/* 3. Client Logo Proof Wall */}
        <LogoWall />

        {/* 4. Awards & Industry Recognition */}
        <AwardsSection />

        {/* 5. Generative AI Studio & Production Protocol */}
        <AiStudioSection />

        {/* 6. Brand & Creative Portfolio with Lightbox */}
        <CreativePortfolio />

        {/* 7. SEO, Website & Digital Growth Case Studies */}
        <CaseStudiesSection />

        {/* 8. Verified Client Testimonials */}
        <TestimonialsSection />

        {/* 9. Core Services Ecosystem */}
        <ServicesSection />

        {/* 10. Operating Approach & Growth Protocol */}
        <StrategySection />

        {/* 11. Search Authority (SEO + AEO + GEO + LLM SEO) */}
        <SearchAuthoritySection />

        {/* 12. Industries We Scale */}
        <IndustriesSection />

        {/* 13. Why Brands Choose DGS & Founders Story */}
        <WhyDgsSection />

        {/* 14. Accessible Interactive FAQ */}
        <FaqSection />

        {/* 15. Growth Audit & Consultation CTA */}
        <AuditCtaSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
