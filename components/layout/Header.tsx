"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useChrome } from "@/components/layout/ChromeProvider";
import { DGS_LOGO } from "@/lib/site/brand";
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
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="D'Genius Solutions home">
          <Image
            src={DGS_LOGO.src}
            alt={DGS_LOGO.alt}
            width={DGS_LOGO.width}
            height={DGS_LOGO.height}
          />
        </Link>

        <div className={styles.actions}>
          <button type="button" className={styles.letsTalkBtn} onClick={openLetsTalk}>
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
            MENU
          </button>
        </div>
      </div>
    </header>
  );
}
