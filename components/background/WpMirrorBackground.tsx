import styles from "./WpMirrorBackground.module.css";

/**
 * WordPress-visible background layer (CSS reproduction).
 * Live WP uses Three.js on #dgs-v1215-canvas — custom OGL shader is disabled.
 */
export function WpMirrorBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.grid} />
      <div className={styles.vignette} />
    </div>
  );
}
