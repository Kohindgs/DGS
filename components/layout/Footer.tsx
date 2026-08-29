import Link from "next/link";
import Image from "next/image";
import {
  FOOTER_CONTACT_LINES,
  FOOTER_QUICK_LINKS,
  FOOTER_SERVICES,
  LEGAL_LINKS,
  SOCIAL_LINKS,
} from "@/lib/site/navigation";
import { DGS_LOGO } from "@/lib/site/brand";
import styles from "./Footer.module.css";

const AI_ICONS = [
  { label: "ChatGPT", href: "https://chat.openai.com/" },
  { label: "Gemini", href: "https://gemini.google.com/" },
  { label: "Perplexity", href: "https://www.perplexity.ai/" },
  { label: "Copilot", href: "https://copilot.microsoft.com/" },
  { label: "Claude", href: "https://claude.ai/" },
] as const;

export function SiteFooter() {
  return (
    <footer className={`${styles.wrapper} dgs-footer-wrapper`}>
      <div className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.aiSummary}>
            <p className={styles.aiHeading}>Built for search, AI answers and modern discovery</p>
            <div className={styles.aiIcons}>
              {AI_ICONS.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.aiLink} aria-label={item.label}>
                  {item.label.slice(0, 1)}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.grid}>
            <div className={`${styles.column} ${styles.logoColumn}`}>
              <Link href="/" className={styles.logoLink}>
                <Image src={DGS_LOGO.src} alt={DGS_LOGO.alt} width={160} height={80} className={styles.logo} />
              </Link>
              <p className={styles.tagline}>
                Your growth-focused digital partner for SEO, AI search, branding, content, social media, websites, and
                performance-led marketing.
              </p>
              <p className={styles.trustBadges}>Clutch Rated ★★★★★</p>
              <ul className={styles.socialList}>
                {SOCIAL_LINKS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav className={styles.column} aria-label="Quick links">
              <h3 className={styles.colTitle}>Quick Links</h3>
              <ul className={styles.colList}>
                {FOOTER_QUICK_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className={styles.column} aria-label="Footer services">
              <h3 className={styles.colTitle}>Services</h3>
              <ul className={styles.colList}>
                {FOOTER_SERVICES.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={`${styles.column} ${styles.contactColumn}`}>
              <h3 className={styles.colTitle}>Contact Us</h3>
              <address className={styles.address}>
                {FOOTER_CONTACT_LINES.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <ul className={styles.colList}>
                <li>
                  <a href="tel:+919987922901">+91 99879 22901</a>
                </li>
                <li>
                  <a href="tel:+918591950238">+91 85919 50238</a>
                </li>
                <li>
                  <a href="mailto:business@dgeniussolutions.com">business@dgeniussolutions.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.bottom}>
            <p className={styles.copyright}>© 2026 D&apos;Genius Solutions. All Rights Reserved.</p>
            <div className={styles.legal}>
              {LEGAL_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
