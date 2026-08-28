"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import styles from "./CTA.module.css";

gsap.registerPlugin(ScrollTrigger);

type CTAProps = {
  heading: string;
  description: string;
  ctaText: string;
  ctaHref: string;
};

export function CTA({ heading, description, ctaText, ctaHref }: CTAProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-content",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container.current,
              start: "top 85%",
              once: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".cta-content", { opacity: 1, y: 0 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.section}>
      <div className={styles.bg} />
      <div className={`cta-content ${styles.inner}`}>
        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.subtitle}>{description}</p>
        <Link href={ctaHref} className={styles.button}>
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
