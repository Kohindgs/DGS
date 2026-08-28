import Image from "next/image";
import Link from "next/link";
import styles from "./HomeHero.module.css";

const HERO_IMAGE = {
  src: "https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp",
  alt: "Digital marketing, SEO, AEO, GEO, LLM SEO and AI production agency visual for D'Genius Solutions",
  width: 1200,
  height: 800,
};

type HomeHeroProps = {
  h1: string;
};

export function HomeHero({ h1 }: HomeHeroProps) {
  return (
    <section className={`${styles.hero} wide-container`}>
      <div className={`${styles.copy} readable-copy`}>
        <p className={styles.eyebrow}>Mumbai Based Full Service Digital Marketing Agency</p>
        <h1>{h1}</h1>
        <p className={styles.lead}>
          D&apos;Genius Solutions is a full service digital marketing agency in Mumbai helping brands grow through
          connected search, websites, social media, paid campaigns, branding and AI-led creative production.
        </p>
        <div className={styles.ctas}>
          <Link href="/contact-us/" className={styles.primaryCta}>
            Get A Growth Audit →
          </Link>
          <Link href="/services/" className={styles.secondaryCta}>
            View Services
          </Link>
        </div>
      </div>
      <div className={styles.visual}>
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          preload
          sizes="(max-width: 768px) 100vw, (max-width: 1920px) 60vw, 960px"
          className={styles.image}
        />
      </div>
    </section>
  );
}
