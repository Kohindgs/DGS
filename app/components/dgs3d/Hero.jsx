"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroScene from "./HeroScene";
import { HOME_CONTENT, DGS_ASSETS } from "../../lib/dgs-content";
import { sceneState } from "../../lib/sceneState";
import { prefersReducedMotion } from "../../lib/webgl";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const titleRef = useRef(null);
  const badgeRef = useRef(null);
  const supportRef = useRef(null);
  const ctaRef = useRef(null);
  const statRef = useRef(null);
  const cueRef = useRef(null);
  const mediaA = useRef(null);
  const mediaB = useRef(null);
  const mediaC = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    // ---- first-scroll transition: drive the 3D scene + move hero content out
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".dgs-hero",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          sceneState.progress = p;
          sceneState.separation = 1 + p * 1.0;
          sceneState.searchDominant = p;
          sceneState.rotY = p * 1.3;
        },
      },
    });

    tl.to(titleRef.current, { yPercent: -60, opacity: 0, ease: "power1.in" }, 0)
      .to(badgeRef.current, { opacity: 0, ease: "power1.in" }, 0)
      .to(supportRef.current, { yPercent: -50, opacity: 0, ease: "power1.in" }, 0.05)
      .to(ctaRef.current, { yPercent: -40, opacity: 0, ease: "power1.in" }, 0.1)
      .to(statRef.current, { yPercent: -30, opacity: 0, ease: "power1.in" }, 0.15)
      .to(cueRef.current, { opacity: 0, ease: "power1.in" }, 0)
      .to(mediaA.current, { x: 120, y: -40, rotation: 14, opacity: 0, ease: "power1.in" }, 0.1)
      .to(mediaB.current, { x: -100, y: 60, rotation: -16, opacity: 0, ease: "power1.in" }, 0.16)
      .to(mediaC.current, { x: 60, y: -80, rotation: 10, opacity: 0, ease: "power1.in" }, 0.2);

    return () => {
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  const work = DGS_ASSETS.work;

  return (
    <section className="dgs-hero" aria-label="D’Genius Solutions">
      <div className="dgs-hero-sticky">
        {/* 3D universe (or static fallback) */}
        <div className="dgs-hero-scene">
          <HeroScene />
        </div>

        {/* floating real-work glimpses (DOM over the canvas). Hidden via CSS
            under prefers-reduced-motion to avoid a hydration mismatch. */}
        <div className="dgs-hero-media dgs-hero-media--a" ref={mediaA} aria-hidden="true">
          <img src={work[0].url} alt={work[0].alt} loading="lazy" decoding="async" />
          <span className="dgs-media-cap">{work[0].label}</span>
        </div>
        <div className="dgs-hero-media dgs-hero-media--b" ref={mediaB} aria-hidden="true">
          <img src={work[1].url} alt={work[1].alt} loading="lazy" decoding="async" />
          <span className="dgs-media-cap">{work[1].label}</span>
        </div>
        <div className="dgs-hero-media dgs-hero-media--c" ref={mediaC} aria-hidden="true">
          <img src={work[2].url} alt={work[2].alt} loading="lazy" decoding="async" />
          <span className="dgs-media-cap">{work[2].label}</span>
        </div>

        {/* foreground content — exact WordPress copy */}
        <div className="dgs-hero-content">
          <div className="dgs-hero-badge" ref={badgeRef}>
            D'Genius Solutions · Mumbai
          </div>

          <h1 className="dgs-hero-title" ref={titleRef}>
            {HOME_CONTENT.hero.h1Lead}{" "}
            <span className="hl">{HOME_CONTENT.hero.h1Highlight}</span>{" "}
            {HOME_CONTENT.hero.h1Tail}
          </h1>

          <p className="dgs-hero-support" ref={supportRef}>
            {HOME_CONTENT.hero.support}
          </p>

          <div className="dgs-hero-cta-row" ref={ctaRef}>
            <a className="dgs-btn-primary" href={HOME_CONTENT.hero.ctaPrimaryHref}>
              {HOME_CONTENT.hero.ctaPrimary}
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a className="dgs-btn-secondary" href={HOME_CONTENT.hero.ctaSecondaryHref}>
              {HOME_CONTENT.hero.ctaSecondary}
            </a>
          </div>

          <div className="dgs-hero-statline" ref={statRef}>
            {HOME_CONTENT.hero.statline.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dgs-scroll-cue" ref={cueRef}>
          Scroll
        </div>
      </div>
    </section>
  );
}
