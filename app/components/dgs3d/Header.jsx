"use client";

import { useEffect, useState } from "react";
import { DGS_ASSETS, HOME_CONTENT } from "../../lib/dgs-content";

const NAV = [
  { label: "Services", href: "#dgs-v1215-services" },
  { label: "Work", href: "#dgs-v1215-work" },
  { label: "About", href: "/about-us" },
  { label: "Blog", href: "/blogs" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`dgs-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="/" className="dgs-header__logo" aria-label="D’Genius Solutions — home">
        {/* Real DGS logo (verified WP asset). Text fallback in case it hasn't loaded yet. */}
        <img
          src={DGS_ASSETS.logo}
          alt={DGS_ASSETS.logoAlt}
          width={42}
          height={42}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="dgs-header__logo-text">D'Genius&nbsp;Solutions</span>
      </a>

      <nav className="dgs-header__nav" aria-label="Primary">
        {NAV.map((n) => (
          <a key={n.label} href={n.href} className="dgs-header__link">
            {n.label}
          </a>
        ))}
      </nav>

      <a href={HOME_CONTENT.hero.ctaPrimaryHref} className="dgs-header__cta">
        {HOME_CONTENT.hero.ctaPrimary}
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </header>
  );
}
