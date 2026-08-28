import Link from "next/link";
import styles from "./Footer.module.css";

const SERVICE_ITEMS = [
  { name: "SEO Services", href: "/services/seo-services-in-mumbai/" },
  { name: "AEO Services", href: "/services/aeo-services-in-mumbai/" },
  { name: "GEO Services", href: "/services/geo/" },
  { name: "LLM SEO", href: "/services/llm-seo-service/" },
  { name: "AI Video Production", href: "/services/ai-video-production-agency/" },
  { name: "Performance Marketing", href: "/services/performance-marketing/" },
  { name: "Social Media", href: "/services/social-media-marketing/" },
  { name: "Branding", href: "/services/branding/" },
  { name: "Content Creation", href: "/services/content-creation/" },
  { name: "Website Development", href: "/services/website-development-amc/" },
];

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us/" },
  { name: "Services", href: "/services/" },
  { name: "Portfolio", href: "/portfolio/" },
  { name: "Blogs", href: "/blogs/" },
  { name: "Contact", href: "/contact-us/" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoAccent}>D&apos;</span>
            <span className={styles.logoText}>Genius</span>
          </Link>
          <p className={styles.tagline}>
            Full-service digital marketing agency in Mumbai.
          </p>
        </div>

        <div className={styles.grid}>
          <nav className={styles.col} aria-label="Footer services">
            <h3 className={styles.colTitle}>Services</h3>
            <ul className={styles.colList}>
              {SERVICE_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.colLink}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Footer company">
            <h3 className={styles.colTitle}>Company</h3>
            <ul className={styles.colList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.colLink}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact</h3>
            <ul className={styles.colList}>
              <li>
                <Link href="tel:+919987922901" className={styles.colLink}>
                  +91 99879 22901
                </Link>
              </li>
              <li>
                <Link href="mailto:business@dgeniussolutions.com" className={styles.colLink}>
                  business@dgeniussolutions.com
                </Link>
              </li>
              <li>
                <span className={styles.colLink}>Mumbai, Maharashtra</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} D&apos;Genius Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
