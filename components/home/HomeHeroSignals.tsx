import styles from "./HomeHeroSignals.module.css";
import { Reveal, StaggerChild } from "@/components/motion/Reveal";

const SIGNALS = [
  {
    title: "Search Visibility",
    subtitle: "SEO AEO GEO",
  },
  {
    title: "Digital Growth",
    subtitle: "Social Ads Web",
  },
  {
    title: "AI Production",
    subtitle: "Video Creative Content",
  },
] as const;

const STATS = [
  { value: "200+", label: "Brands Worked With" },
  { value: "20K+", label: "Customers Reached" },
  { value: "4.5", label: "Average User Rating" },
  { value: "Mumbai Based", label: "Full Service Team" },
] as const;

export function HomeHeroSignals() {
  return (
    <Reveal variant="stagger">
      <section className={`${styles.section} container`} aria-label="Agency capability signals">
        <div className={styles.signalGrid}>
          {SIGNALS.map((signal) => (
            <StaggerChild key={signal.title}>
              <article className={styles.signalCard}>
                <h2 className={styles.signalTitle}>{signal.title}</h2>
                <p>{signal.subtitle}</p>
              </article>
            </StaggerChild>
          ))}
        </div>
        <div className={styles.statsGrid}>
          {STATS.map((stat) => (
            <StaggerChild key={stat.label}>
              <article className={styles.statCard}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </article>
            </StaggerChild>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
