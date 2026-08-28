"use client";

import Link from "next/link";
import Image from "next/image";
import { useChrome } from "@/components/layout/ChromeProvider";
import { useBodyScrollLock, useFocusTrap } from "@/components/layout/useFocusTrap";
import {
  LEGAL_LINKS,
  REACH_US,
  SERVICE_NAV,
  SOCIAL_LINKS,
  TOP_LEVEL_NAV,
} from "@/lib/site/navigation";
import { DGS_LOGO } from "@/lib/site/brand";
import styles from "./SiteMenu.module.css";

export function SiteMenu() {
  const { menuOpen, closeMenu } = useChrome();
  const trapRef = useFocusTrap(menuOpen, closeMenu);
  useBodyScrollLock(menuOpen);

  if (!menuOpen) return null;

  return (
    <div className={styles.overlay} role="presentation">
      <div
        ref={trapRef}
        id="site-menu-panel"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation menu"
      >
        <div className={styles.topBar}>
          <Link href="/" className={styles.logoLink} onClick={closeMenu}>
            <Image src={DGS_LOGO.src} alt={DGS_LOGO.alt} width={DGS_LOGO.width} height={DGS_LOGO.height} />
          </Link>
          <button type="button" className={styles.closeBtn} onClick={closeMenu} aria-label="Close menu">
            Close
          </button>
        </div>

        <div className={styles.grid}>
          <nav className={styles.primaryNav} aria-label="Main">
            <ul>
              {TOP_LEVEL_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={closeMenu} className={styles.navLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.servicesBlock}>
            <h2 className={styles.sectionTitle}>Our Services</h2>
            <ul className={styles.serviceList}>
              {SERVICE_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.reachBlock}>
            <h2 className={styles.sectionTitle}>Reach Us</h2>
            <p>
              <a href={`tel:${REACH_US.phones[0].replace(/\s/g, "")}`}>{REACH_US.phones[0]}</a>
            </p>
            <p>
              <a href={`tel:${REACH_US.phones[1].replace(/\s/g, "")}`}>{REACH_US.phones[1]}</a>
            </p>
            <p>
              <a href={`mailto:${REACH_US.email}`}>{REACH_US.email}</a>
            </p>
            <address className={styles.address}>
              {REACH_US.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            <h3 className={styles.sectionTitle}>Follow Us</h3>
            <ul className={styles.socialList}>
              {SOCIAL_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link href="/contact-us/" className={styles.ctaBtn} onClick={closeMenu}>
              Start a Project
            </Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 D&apos;Genius Solutions. All Rights Reserved.</p>
          <div className={styles.legal}>
            {LEGAL_LINKS.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
