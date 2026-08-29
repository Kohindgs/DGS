import styles from "./HomeHeroRail.module.css";

const RAIL_ITEMS = [
  "Digital Marketing Agency In Mumbai",
  "Search Engine Optimisation",
  "Answer Engine Optimisation",
  "Generative Search Visibility",
  "LLM Brand Visibility",
  "Voice Search Readiness",
  "Website Development",
  "Performance Marketing",
  "Social Media Marketing",
  "AI-Led Creative Production",
] as const;

export function HomeHeroRail() {
  const track = [...RAIL_ITEMS, ...RAIL_ITEMS];

  return (
    <section className={`${styles.rail} dgs-v1215-rail`} aria-label="D'Genius Solutions capabilities">
      <div className={styles.line}>
        <div className={styles.track}>
          {track.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
