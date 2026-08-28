"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useChrome } from "@/components/layout/ChromeProvider";
import { DGS_NAV_LOGO } from "@/lib/site/brand";
import styles from "./Header.module.css";

export function SiteHeader() {
  const { toggleMenu, openLetsTalk, menuOpen } = useChrome();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="dgsNav" className={`${styles.header} ${scrolled || menuOpen ? styles.scrolled : ""}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logoLink} aria-label="D'Genius Solutions home">
          <Image
            src={DGS_NAV_LOGO.src}
            alt={DGS_NAV_LOGO.alt}
            width={DGS_NAV_LOGO.width}
            height={DGS_NAV_LOGO.height}
            priority
          />
        </Link>

        <div className={styles.actions}>
          <button type="button" className={styles.letsTalkBtn} onClick={openLetsTalk}>
            <svg viewBox="0 0 14 14" aria-hidden="true" className={styles.talkIcon}>
              <path d="M1 13L13 1M13 1H5M13 1v8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Let&apos;s Talk
          </button>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="site-menu-panel"
            aria-label="Open site menu"
            id="site-menu-trigger"
          >
            <span className={styles.menuLines} aria-hidden="true">
              <em />
              <em />
              <em />
            </span>
            MENU
          </button>
        </div>
      </div>
    </header>
  );
}
