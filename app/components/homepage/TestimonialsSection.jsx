import React from 'react';
import styles from './homepage.module.css';

const testimonialsData = [
  {
    stars: 5,
    quote: "D'Genius Solutions has been a game-changer for our retail marketing efforts. Their team understood our brand aesthetics instantly and delivered high-impact creatives that significantly improved in-store visibility and customer engagement.",
    author: "Aparna Singh",
    role: "Marketing Manager · Eureka Forbes",
    initials: "AS"
  },
  {
    stars: 5,
    quote: "Working with D'Genius Solutions on our website has been an exceptional experience. From UI/UX structuring to backend functionality, the team ensured seamless execution and timely updates throughout.",
    author: "Dujon Fernandes",
    role: "Digital Marketing Manager · Onida",
    initials: "DF"
  },
  {
    stars: 5,
    quote: "D'Genius Solutions has become an extended arm of our brand team. From daily creative requirements to high-stakes campaign rollouts, they handle everything with finesse, speed and deep brand understanding.",
    author: "Chaitali Nandi",
    role: "Brand Head · Pantaloons ABFRL",
    initials: "CN"
  },
  {
    stars: 5,
    quote: "Their 360° mandate covering social media, SEO, website updates, 2D animation and content creation has brought structure, creativity and measurable growth to our digital presence across all channels.",
    author: "Suneel Kadekar",
    role: "Marketing Manager · Kreedo Solutions",
    initials: "SK"
  }
];

export default function TestimonialsSection() {
  return (
    <section className={`${styles.testimonialsSection} dgs-section`} id="testimonials">
      <div className="dgs-container">
        
        <div className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot}></span>
            <span>Client Endorsements</span>
          </div>
          <h2 className={styles.titleMain}>
            Trusted By <span className={styles.titleGradient}>Category Leaders</span>
          </h2>
          <p className={styles.subtitle}>
            Direct feedback from brand leaders across consumer goods, electronics, retail, and education.
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonialsData.map((t, idx) => (
            <div key={idx} className={styles.testimonialCard}>
              <div>
                <div className={styles.starsRow}>
                  {'★'.repeat(t.stars)}
                </div>
                <p className={styles.quoteText}>"{t.quote}"</p>
              </div>

              <div className={styles.authorRow}>
                <div className={styles.authorAvatar}>{t.initials}</div>
                <div>
                  <h4 className={styles.authorName}>{t.author}</h4>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
