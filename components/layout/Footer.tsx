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

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logoLink}>
            <Image src={DGS_LOGO.src} alt={DGS_LOGO.alt} width={DGS_LOGO.width} height={DGS_LOGO.height} />
          </Link>
          <p className={styles.description}>
            Your growth-focused digital partner for SEO, AI search, branding, content, social media, websites, and
            performance-led marketing.
          </p>
          <p className={styles.clutch}>Clutch Rated ★★★★★</p>
          <p className={styles.clutchSub}>Trusted client reviews</p>
        </div>

        <nav className={styles.col} aria-label="Quick links">
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.colList}>
            {FOOTER_QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label="Footer services">
          <h3 className={styles.colTitle}>Services</h3>
          <ul className={styles.colList}>
            {FOOTER_SERVICES.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
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
          <h3 className={styles.colTitle}>Stalk us below</h3>
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
      </div>

      <div className={styles.bottom}>
        <p>© 2026 D&apos;Genius Solutions. All Rights Reserved.</p>
        <div className={styles.legal}>
          {LEGAL_LINKS.map((item, index) => (
            <span key={item.href}>
              {index > 0 ? <span className={styles.sep}>•</span> : null}
              <Link href={item.href}>{item.label}</Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
