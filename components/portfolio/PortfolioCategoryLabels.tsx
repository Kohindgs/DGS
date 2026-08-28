import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/portfolio/category-labels";
import styles from "./PortfolioCategoryLabels.module.css";

/** Visual-only category labels from WordPress portfolio page. Not interactive filters. */
export function PortfolioCategoryLabels() {
  return (
    <p className={styles.labels} aria-label="Portfolio industry categories">
      {PORTFOLIO_CATEGORY_LABELS.map((label, index) => (
        <span key={label}>
          {index > 0 ? <span className={styles.sep} aria-hidden="true">•</span> : null}
          <span>{label}</span>
        </span>
      ))}
    </p>
  );
}
