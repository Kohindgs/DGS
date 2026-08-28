import Image from "next/image";
import Link from "next/link";
import type { ImageBlock } from "@/lib/content/types";
import { formatHomeHeroH1 } from "@/lib/home/format-home-hero-h1";
import { WP_HERO_TOKENS } from "@/lib/home/wp-visual-tokens";
import styles from "./HomeHero.module.css";

const HERO_CHIPS = [
  { title: "Search Visibility", subtitle: "SEO AEO GEO", className: styles.chipOne },
  { title: "Digital Growth", subtitle: "Social Ads Web", className: styles.chipTwo },
  { title: "AI Production", subtitle: "Video Creative Content", className: styles.chipThree },
] as const;

const HERO_STATS = [
  { value: "200+", label: "Brands Worked With" },
  { value: "20K+", label: "Customers Reached" },
  { value: "4.5", label: "Average User Rating" },
  { value: "Mumbai", label: "Based Full Service Team" },
] as const;

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

  const h1Lines = formatHomeHeroH1(h1).split("\n");

  return (
    <section className={`${styles.hero} dgs-v1215-hero`} id="dgs-home-start">
      <div className={styles.shell}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <div className={styles.kicker}>
              <span className={styles.kickerMark} aria-hidden="true" />
              {eyebrow}
            </div>
            <h1>
              {h1Lines[0]}
              {h1Lines[1] ? (
                <>
                  <br />
                  <span>{h1Lines[1]}</span>
                </>
              ) : null}
              {h1Lines[2] ? (
                <>
                  <br />
                  {h1Lines[2]}
                </>
              ) : null}
            </h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.ctas}>
              <Link href="/contact-us/" className={styles.primaryCta}>
                Get A Growth Audit <span aria-hidden="true">→</span>
              </Link>
              <Link href="/services/" className={styles.secondaryCta}>
                View Services
              </Link>
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.robotWrap}>
              <div className={styles.robotAura} aria-hidden="true" />
              <Image
                src={heroImage.src}
                alt={heroImage.alt || ""}
                width={heroImage.width || WP_HERO_TOKENS.image.width}
                height={heroImage.height || WP_HERO_TOKENS.image.height}
                preload
                sizes="(max-width: 900px) 100vw, 666px"
                className={styles.image}
              />
              {HERO_CHIPS.map((chip) => (
                <div key={chip.title} className={`${styles.chip} ${chip.className}`}>
                  <span>{chip.title}</span>
                  <strong>{chip.subtitle}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.statline} aria-label="Agency performance highlights">
          {HERO_STATS.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
