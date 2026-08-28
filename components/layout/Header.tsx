"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about-us/" },
  { name: "Services", href: "/services/" },
  { name: "Portfolio", href: "/portfolio/" },
  { name: "Blogs", href: "/blogs/" },
  { name: "Contact", href: "/contact-us/" },
];

const SERVICE_ITEMS = [
  { name: "SEO", href: "/services/seo-services-in-mumbai/" },
  { name: "AEO", href: "/services/aeo-services-in-mumbai/" },
  { name: "GEO", href: "/services/geo/" },
  { name: "LLM SEO", href: "/services/llm-seo-service/" },
  { name: "AI Video", href: "/services/ai-video-production-agency/" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoAccent}>D&apos;</span>
          <span className={styles.logoText}>Genius</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.name}
            </Link>
          ))}
        </nav>

        <nav className={styles.services} aria-label="Services">
          {SERVICE_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.serviceLink}>
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="site-mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <nav className={styles.mobileNav} aria-label="Mobile" id="site-mobile-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          {SERVICE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileServiceLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
