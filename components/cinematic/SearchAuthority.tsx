"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import styles from "./SearchAuthority.module.css";

gsap.registerPlugin(ScrollTrigger);

type Pillar = {
  title: string;
  description: string;
  href: string;
};

type SearchAuthorityProps = {
  heading: string;
  description: string;
  pillars: Pillar[];
};

export function SearchAuthority({ heading, description, pillars }: SearchAuthorityProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".authority-pillar",
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container.current,
              start: "top 80%",
              once: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".authority-pillar", { opacity: 1, x: 0 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>{heading}</h2>
          <p className={styles.subtitle}>{description}</p>
        </div>
        <div className={styles.grid}>
          {pillars.map((pillar) => (
            <Link key={pillar.href} href={pillar.href} className="authority-pillar">
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
                <p className={styles.cardDesc}>{pillar.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
