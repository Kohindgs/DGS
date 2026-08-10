'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Syne, Manrope, DM_Sans } from 'next/font/google';
import styles from './home.module.css';

// Font initialization
const syne = Syne({ subsets: ['latin'], weight: ['700', '800'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500'] });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

const logos = [
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Eureka-forbes_White.png', alt: 'Eureka Forbes' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/ABEA-1.png', alt: 'Aditya Birla Education Academy' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Saint-gobian.png', alt: 'Saint Gobain' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Pantaloons.png', alt: 'Pantaloons' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/output-onlinepngtools-300x95.png', alt: 'Jaipur Kurti' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Nutriuits.png', alt: 'Nutriuits' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Raymond.png', alt: 'Raymond' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Plush-puppy.png', alt: 'Plush Puppy' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Candour-london.png', alt: 'Candour London' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Styleup.png', alt: 'Styleup' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Onida.png', alt: 'Onida' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Aram.png', alt: 'Aaram' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Traznact.png', alt: 'Trazact' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/M-power.png', alt: 'M Power Aditya Birla' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Compuage.png', alt: 'Compuage' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Solco.png', alt: 'Solco' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Struetral.png', alt: 'Structural Specialties' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/logo-300x109.png', alt: 'MKA' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/colored-logo-1.png', alt: 'Club Med' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Druva.png', alt: 'Druva' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Farm-classics.png', alt: 'Farm Classics' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Kreedo.png', alt: 'Kreedo' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/marigold-lane.png', alt: 'Marigold Lane' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/kmbl-logo.svg', alt: 'Kotak Mahindra Bank' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2022/06/Ujass.png', alt: 'Ujaas' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/Abis.png', alt: 'Aditya Birla Integrated School' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/ABworld-acedemy.png', alt: 'Aditya Birla World Academy' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/ABET.png', alt: 'Aditya Birla Education Trust' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2023/01/logo_v2-300x86.png', alt: 'TheWorldGrad' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/Humanxt-1-300x300.png', alt: 'Humanxt' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/05/cropped-ClearFX-Academy-White-Text.png', alt: 'ClearFX Academy' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/01/ind.svg', alt: 'IND' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/09/Weavings.webp', alt: 'Weavings' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/09/Planet-Smart-City.webp', alt: 'Planet Smart City' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/11/Novotel_logo_2016.svg-scaled.png.webp', alt: 'Novotel' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/11/hEADER-Meryl.PNG.png.webp', alt: 'Meryl' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/11/MedArtha-Logo-1-2048x1448-1.webp', alt: 'MedArtha' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/11/LG_Grad_7PL5qt1J.png.webp', alt: 'LG' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/11/Hanwha_Techwin-Logo.wine_-scaled.png.webp', alt: 'Hanwha Techwin' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/01/blanco-1.webp', alt: 'Blanco' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/01/AMAZONIA-LOGO-Ai.png.webp', alt: 'Amazonia' },
];

const services = [
  { num: '01', title: 'Search Visibility & AI Discovery', desc: 'SEO, AEO, GEO, Local SEO, Schema Markup, Technical SEO and LLM visibility for brands that want to rank on Google and be found in AI answers.', tags: ['SEO', 'AEO', 'GEO', 'Local SEO', 'Schema Markup'], href: 'https://www.dgeniussolutions.com/services/seo-agency-mumbai/' },
  { num: '02', title: 'Website Development & AMC', desc: 'Custom Next.js, Shopify and WordPress websites built for speed, SEO and conversion. Ongoing AMC for performance, security and updates.', tags: ['Next.js', 'Shopify', 'WordPress', 'AMC', 'UI/UX'], href: 'https://www.dgeniussolutions.com/services/website-development-company-mumbai/' },
  { num: '03', title: 'Social Media & Performance Marketing', desc: 'Scroll-stopping social content, community management and high-performance Meta, Google and YouTube ad campaigns that convert.', tags: ['Social Media', 'Meta Ads', 'Google Ads', 'YouTube Ads'], href: 'https://www.dgeniussolutions.com/services/social-media-marketing-agency-mumbai/' },
  { num: '04', title: 'Branding, Content & AI Production', desc: 'Brand identity, AI video production, product films, UGC content, reels and brand storytelling that drives awareness and trust.', tags: ['Branding', 'AI Video', 'Content', 'Reels'], href: 'https://www.dgeniussolutions.com/services/ai-video-production-agency/' },
];

const portfolioItems = [
  // AI Video
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_01-3-1-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_02-3-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_03-3-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_04-3-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_05-2-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS_06-3-1024x576.png.webp', alt: 'AI Video Production', category: 'AI Video' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/SS1-1-1024x576.png.webp', alt: 'AI Production Still', category: 'AI Video' },
  // Branding
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Standee_rays-1-469x1024.jpg.webp', alt: 'Brand Standee Design', category: 'Branding' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Standee-Option-5-512x1024.jpg.webp', alt: 'Brand Standee Design', category: 'Branding' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Standee-Option-4-512x1024.jpg.webp', alt: 'Brand Standee Design', category: 'Branding' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Standee-Option-6-1-512x1024.jpg.webp', alt: 'Brand Standee Design', category: 'Branding' },
  // Social
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Women-Option-1-1024x576.png.webp', alt: 'Social Media Content', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Men-Option-1-1024x576.png.webp', alt: 'Social Media Content', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Artboard-1-1-1024x576.png.webp', alt: 'Social Campaign Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/New-Dandiya-Grid-1-1024x683.png.webp', alt: 'Festive Social Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/1x1-1024x1024.webp', alt: 'Social Media Post', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/277-1024x1024.png.webp', alt: 'Pet Care Social Content', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/How-to-calm-your-pet-1024x1024.png.webp', alt: 'Pet Care Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/international_yoga_day-819x1024.png.webp', alt: 'Yoga Day Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/DIY-Face-mask-1024x213.png.webp', alt: 'Beauty Social Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Amazonia-grid7-1024x683.png.webp', alt: 'Amazonia Campaign', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/420-720PX_Clubmed.png.webp', alt: 'Club Med Campaign', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/3-Grid_03-1024x1024.jpg.webp', alt: 'Grid Creative', category: 'Social' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/3-Grid_01-1024x1024.jpg.webp', alt: 'Grid Creative', category: 'Social' },
  // Fashion
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Wedding-Story6-576x1024.jpg.webp', alt: 'Fashion Story', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Wedding-Story3-576x1024.jpg.webp', alt: 'Fashion Story', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Purple-Collage-576x1024.jpg.webp', alt: 'Fashion Collage', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Pink-Collage-576x1024.jpg.webp', alt: 'Fashion Collage', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Diwali-Story1-576x1024.png.webp', alt: 'Festive Fashion Story', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Wedding-Grid_New-1024x1024.png', alt: 'Wedding Grid', category: 'Fashion' },
  { src: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/10/Diwali-GridOpt1.1-1-1024x1024.jpg.webp', alt: 'Diwali Grid', category: 'Fashion' },
];

const caseStudies = [
  { name: 'TheWorldGrad', tags: ['SEO', 'Web Development'], img: 'https://www.dgeniussolutions.com/wp-content/uploads/2024/06/Theworldgrad-website-scaled.png.webp', href: 'https://www.dgeniussolutions.com/case-study/theworldgrad/' },
  { name: 'Weavings Manpower', tags: ['SEO', 'Performance Marketing'], img: 'https://www.dgeniussolutions.com/wp-content/uploads/2025/07/Weavings-Home-page-.png', href: 'https://www.dgeniussolutions.com/case-study/weavings-manpower/' },
  { name: 'Kotak Mahindra', tags: ['Social Media', 'Performance'], img: '', href: 'https://www.dgeniussolutions.com/case-study/kotak-mahindra/' },
  { name: 'Eureka Forbes', tags: ['SEO', 'Social Media'], img: '', href: 'https://www.dgeniussolutions.com/case-study/eureka-forbes/' },
  { name: 'Onida', tags: ['Performance Marketing'], img: '', href: 'https://www.dgeniussolutions.com/case-study/onida/' },
  { name: 'Pantaloons', tags: ['Social Media'], img: '', href: 'https://www.dgeniussolutions.com/case-study/pantaloons/' },
];

const testimonials = [
  { name: 'Suneel Kadekar', role: 'Search Authority', text: "Their 360° mandate covering social media, SEO, website updates, 2D animation and content creation has brought structure, creativity and measurable growth to our digital presence." },
  { name: 'Aparna Singh', role: 'Client', text: "D'Genius Solutions has been a game-changer for our retail marketing efforts. Their team understood our brand aesthetics instantly and delivered high-impact creatives that significantly improved in-store visibility and customer engagement." },
  { name: 'Dujon Fernandes', role: 'Client', text: "Working with D'Genius Solutions on our website has been an exceptional experience. From UI/UX structuring to backend functionality, the team ensured seamless execution and timely updates throughout." },
  { name: 'Chaitali Nandi', role: 'Client', text: "D'Genius Solutions has become an extended arm of our brand team. From daily creative requirements to high-stakes campaign rollouts, they handle everything with finesse, speed and deep brand understanding." },
];

const seoPillars = [
  { title: 'Rank-ready website and content foundations.', desc: 'Technical SEO, schema markup, Core Web Vitals and crawlability foundations that Google rewards.' },
  { title: 'Built for answer-first discovery.', desc: 'AEO content structures optimised for featured snippets, People Also Ask and AI overview placement.' },
  { title: 'Visibility for generative search experiences.', desc: 'GEO and LLM-ready content so your brand appears in ChatGPT, Gemini, Perplexity and AI Overviews.' },
  { title: 'Clear entities, services and brand context.', desc: 'Entity-rich content that signals brand authority, service clarity and topical expertise to search engines.' },
  { title: 'Natural answers for spoken queries.', desc: 'Voice-search-optimised pages structured for conversational queries and local intent discovery.' },
  { title: 'Faster creative output with brand control.', desc: 'AI-assisted production pipeline for videos, visuals and copy that stays on-brand at scale.' },
];

const industries = ["Education", "Finance & Banking", "Retail & Fashion", "Healthcare", "Real Estate", "Hospitality & Travel", "Technology & SaaS", "Consumer Goods", "FMCG", "Professional Services", "Non-Profit", "Manufacturing"];

const whyUs = [
  { title: 'Strategy', desc: "Every campaign starts with a data-backed strategy aligned to your business goals, audience and competitive landscape." },
  { title: 'Search', desc: "We build search visibility across Google, Bing, AI Overviews, voice and generative engines — not just rankings." },
  { title: 'Creative', desc: "From AI video to social content, our creative output is on-brand, scroll-stopping and platform-optimised." },
  { title: 'Scale', desc: "Systems and processes that scale your marketing output without scaling your team or budget proportionally." },
];

const faqs = [
  { q: "What does D'Genius Solutions do?", a: "D'Genius Solutions is a full-service digital marketing agency in Mumbai offering SEO, AEO, GEO, website development, social media management, performance marketing (Meta & Google Ads), branding, content creation and AI-led video production." },
  { q: "Why choose a full service digital marketing agency?", a: "A full-service agency aligns search, creative, web and paid strategies under one team, ensuring consistent brand messaging, faster execution and better attribution across the full marketing funnel." },
  { q: "How do your digital marketing services work together?", a: "Our SEO builds organic visibility, web development supports conversion, social drives awareness, performance marketing captures demand, and AI creative production scales your content output — all connected under one unified strategy." },
  { q: "Can you support both organic and paid growth?", a: "Yes. We manage both SEO/AEO/GEO for long-term organic growth and Meta, Google and YouTube paid campaigns for immediate demand generation, with shared audience and creative insights across both." },
  { q: "Where is D'Genius Solutions located?", a: "D'Genius Solutions is headquartered in Khar West, Mumbai, and works with brands across India and internationally." },
  { q: "Do you provide website, creative and AI-led production under one team?", a: "Yes. Our integrated team handles website design and development, brand identity, AI video production, content creation, social media and performance marketing under one mandate — no handoff friction." },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [visiblePortfolioCount, setVisiblePortfolioCount] = useState(6);

  const filteredPortfolio = portfolioItems.filter(item => activeFilter === 'All' || item.category === activeFilter);
  const displayedPortfolio = filteredPortfolio.slice(0, visiblePortfolioCount);

  const handleLoadMore = () => {
    setVisiblePortfolioCount(prev => prev + 6);
  };

  const halfLogos = Math.ceil(logos.length / 2);
  const row1Logos = logos.slice(0, halfLogos);
  const row2Logos = logos.slice(halfLogos);

  return (
    <main className={`${styles.container} ${manrope.className}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} ${syne.className}`}>
            Full Service Digital Marketing Agency In Mumbai
          </h1>
          <p className={styles.heroSubtext}>
            D'Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through connected search, websites, social media, paid campaigns, branding and AI-led creative production.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#contact-form" className={`${styles.btnPrimary} ${dmSans.className}`}>
              Get A Growth Audit
            </Link>
            <Link href="#dgs-v1215-services" className={`${styles.btnSecondary} ${dmSans.className}`}>
              View Services
            </Link>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <Image
            src="https://www.dgeniussolutions.com/wp-content/uploads/2024/09/thoughtful-logo-concept-featuring-ai-meaningful-way.webp"
            alt="AI Meaningful Logo Concept"
            width={1000}
            height={500}
            priority
            sizes="(max-width: 768px) 100vw, 1000px"
          />
        </div>
      </section>

      {/* Logo Marquee Section */}
      <section className={styles.marqueeSection}>
        <div className={`${styles.marqueeTrack} ${styles.marqueeRow1}`}>
          {row1Logos.map((logo, idx) => (
             <div key={idx} className={styles.marqueeItem}>
                <Image src={logo.src} alt={logo.alt} width={150} height={60} sizes="150px" />
             </div>
          ))}
          {/* Duplicate for infinite loop effect */}
          {row1Logos.map((logo, idx) => (
             <div key={`dup-${idx}`} className={styles.marqueeItem}>
                <Image src={logo.src} alt={logo.alt} width={150} height={60} sizes="150px" />
             </div>
          ))}
        </div>
        <div className={`${styles.marqueeTrack} ${styles.marqueeRow2}`}>
          {row2Logos.map((logo, idx) => (
             <div key={idx} className={styles.marqueeItem}>
                <Image src={logo.src} alt={logo.alt} width={150} height={60} sizes="150px" />
             </div>
          ))}
          {row2Logos.map((logo, idx) => (
             <div key={`dup-${idx}`} className={styles.marqueeItem}>
                <Image src={logo.src} alt={logo.alt} width={150} height={60} sizes="150px" />
             </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Awards Section */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Recognized for SEO, Content & Performance Marketing</h2>
        <div className={styles.awardsGrid}>
            <div className={styles.awardCard}>
                <div className={styles.awardImage}>
                  <Image src="https://www.dgeniussolutions.com/wp-content/uploads/2024/03/Prime-Insights1.png.webp" alt="Best Place to Work" width={200} height={100} sizes="(max-width: 768px) 100vw, 200px" />
                </div>
                <h3 className={syne.className}>Prime Insights</h3>
                <p>Best Place to Work</p>
            </div>
            <div className={styles.awardCard}>
                <div className={styles.awardImage}>
                  <Image src="https://www.dgeniussolutions.com/wp-content/uploads/2024/03/Corporate-Connect1.png.webp" alt="Highly Regarded Digital Marketing Agency to Watch Out" width={200} height={100} sizes="(max-width: 768px) 100vw, 200px" />
                </div>
                <h3 className={syne.className}>Corporate Connect</h3>
                <p>Highly Regarded Digital Marketing Agency to Watch Out</p>
            </div>
            <div className={styles.awardCard}>
                <div className={styles.awardImage}>
                  <Image src="https://www.dgeniussolutions.com/wp-content/uploads/2024/03/GLA1.png.webp" alt="Excellence in SEO, Content & Performance Marketing" width={200} height={100} sizes="(max-width: 768px) 100vw, 200px" />
                </div>
                <h3 className={syne.className}>GLA</h3>
                <p>Excellence in SEO, Content & Performance Marketing</p>
            </div>
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Services Section */}
      <section id="dgs-v1215-services" className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>One team for search, web, creative, performance and AI production.</h2>
        <div className={styles.servicesGrid}>
          {services.map((service, idx) => (
             <Link key={idx} href={service.href} className={styles.serviceCard}>
                <div className={`${styles.serviceNum} ${syne.className}`}>{service.num}</div>
                <h3 className={`${styles.serviceTitle} ${syne.className}`}>{service.title}</h3>
                <p className={styles.serviceDesc}>{service.desc}</p>
                <div className={styles.tagsContainer}>
                  {service.tags.map(tag => (
                    <span key={tag} className={`${styles.tag} ${dmSans.className}`}>{tag}</span>
                  ))}
                </div>
             </Link>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Portfolio Section */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>AI-Led Creative Portfolio</h2>
        <p style={{textAlign: 'center', marginBottom: '40px', color: '#a0a0a0'}}>Creative production for campaigns, product stories and social content.</p>
        
        <div className={`${styles.portfolioFilters} ${dmSans.className}`}>
           {['All', 'AI Video', 'Social', 'Branding', 'Fashion'].map(filter => (
             <button 
               key={filter} 
               className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
               onClick={() => { setActiveFilter(filter); setVisiblePortfolioCount(6); }}
             >
               {filter}
             </button>
           ))}
        </div>

        <div className={styles.portfolioGrid}>
           {displayedPortfolio.map((item, idx) => (
             <div key={idx} className={styles.portfolioItem}>
               <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 33vw" />
             </div>
           ))}
        </div>
        
        {visiblePortfolioCount < filteredPortfolio.length && (
          <div className={styles.loadMoreContainer}>
            <button onClick={handleLoadMore} className={`${styles.btnSecondary} ${dmSans.className}`}>Load More</button>
          </div>
        )}
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Case Studies */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>SEO, Website And Digital Growth Case Studies</h2>
        <div className={styles.portfolioGrid}>
          {caseStudies.map((study, idx) => (
             <Link key={idx} href={study.href} className={styles.caseStudyCard}>
               {study.img ? (
                 <Image src={study.img} alt={study.name} fill className={styles.caseStudyImage} sizes="(max-width: 768px) 100vw, 33vw" />
               ) : (
                 <div style={{width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)'}}></div>
               )}
               <div className={styles.caseStudyOverlay}>
                 <h3 className={`${styles.caseStudyTitle} ${syne.className}`}>{study.name}</h3>
                 <div className={styles.tagsContainer}>
                   {study.tags.map(tag => (
                     <span key={tag} className={`${styles.tag} ${dmSans.className}`}>{tag}</span>
                   ))}
                 </div>
               </div>
             </Link>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Testimonials */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Trusted By Brands Worldwide</h2>
        <div className={styles.testimonialGrid}>
          {testimonials.map((test, idx) => (
             <div key={idx} className={styles.testimonialCard}>
               <p className={styles.testimonialText}>"{test.text}"</p>
               <div>
                 <div className={`${styles.testimonialAuthor} ${dmSans.className}`}>{test.name}</div>
                 <div className={`${styles.testimonialRole} ${dmSans.className}`}>{test.role}</div>
               </div>
             </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* SEO Pillars */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Built For Google Search, AI Answers And Voice Discovery</h2>
        <div className={styles.pillarsGrid}>
          {seoPillars.map((pillar, idx) => (
             <div key={idx} className={styles.pillarCard}>
               <h3 className={`${styles.pillarTitle} ${syne.className}`}>{pillar.title}</h3>
               <p className={styles.pillarDesc}>{pillar.desc}</p>
             </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Industries */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Industries We Help Grow</h2>
        <div className={`${styles.industriesCloud} ${dmSans.className}`}>
           {industries.map(industry => (
              <span key={industry} className={styles.industryPill}>{industry}</span>
           ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* Why Us */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Why Brands Choose D'Genius Solutions</h2>
        <div className={styles.pillarsGrid}>
          {whyUs.map((reason, idx) => (
             <div key={idx} className={styles.pillarCard}>
               <h3 className={`${styles.pillarTitle} ${syne.className}`}>{reason.title}</h3>
               <p className={styles.pillarDesc}>{reason.desc}</p>
             </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* FAQ */}
      <section className={styles.section}>
        <h2 className={`${styles.heading} ${syne.className}`}>Questions Brands Ask Before Choosing A Digital Marketing Agency</h2>
        <div className={styles.faqContainer}>
          {faqs.map((faq, idx) => (
             <details key={idx} className={styles.faqItem}>
               <summary className={`${styles.faqSummary} ${dmSans.className}`}>{faq.q}</summary>
               <div className={styles.faqAnswer}>{faq.a}</div>
             </details>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider}></div>

      {/* CTA Section */}
      <section id="contact-form" className={styles.ctaSection}>
        <h2 className={`${styles.ctaTitle} ${syne.className}`}>Let us audit your brand, website, search visibility and campaign flow.</h2>
        <button className={`${styles.btnPrimary} ${dmSans.className}`} style={{fontSize: '1.25rem', padding: '16px 32px'}}>
          Get A Free Audit
        </button>
      </section>
    </main>
  );
}
