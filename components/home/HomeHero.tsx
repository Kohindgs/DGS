import Image from "next/image";
import Link from "next/link";
import type { ImageBlock } from "@/lib/content/types";
import { WP_HERO_TOKENS } from "@/lib/home/wp-visual-tokens";
import styles from "./HomeHero.module.css";

type HomeHeroProps = {
  eyebrow: string;
  h1: string;
  lead: string;
  image?: ImageBlock;
};

export function HomeHero({ eyebrow, h1, lead, image }: HomeHeroProps) {
  const heroImage = image || {
    src: "https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp",
    alt: "Digital marketing, SEO, AEO, GEO, LLM SEO and AI production agency visual for D'Genius Solutions",
    width: WP_HERO_TOKENS.image.width,
    height: WP_HERO_TOKENS.image.height,
  };

  return (
    <section className={styles.hero} id="dgs-home-start">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{h1}</h1>
          <p className={styles.lead}>{lead}</p>
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
            src={heroImage.src}
            alt={heroImage.alt || ""}
            width={heroImage.width || WP_HERO_TOKENS.image.width}
            height={heroImage.height || WP_HERO_TOKENS.image.height}
            preload
            sizes="(max-width: 900px) 100vw, 500px"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
