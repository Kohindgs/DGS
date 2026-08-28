"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import styles from "./ServicesOverview.module.css";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  title: string;
  description: string;
  href: string;
  accent?: "cyan" | "purple" | "coral" | "yellow";
};

type ServicesOverviewProps = {
  services: Service[];
};

const accentMap = {
  cyan: "var(--color-cyan)",
  purple: "var(--color-purple)",
  coral: "var(--color-coral)",
  yellow: "var(--color-yellow)",
};

export function ServicesOverview({ services }: ServicesOverviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".service-card",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container.current,
              start: "top 80%",
              once: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".service-card", { opacity: 1, y: 0 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>What You Can Hire Us For</h2>
        <p className={styles.subtitle}>
          One team for search, web, creative, performance and AI production.
        </p>
      </div>
      <div className={styles.grid}>
        {services.map((service, i) => (
            <Link
              key={service.href}
              href={service.href}
              className="service-card"
            >
            <article
              className={styles.card}
              style={
                {
                  "--accent": accentMap[service.accent || "cyan"],
                } as React.CSSProperties
              }
            >
              <span className={styles.index}>{(i + 1).toString().padStart(2, "0")}</span>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDesc}>{service.description}</p>
              <span className={styles.cardLink}>Explore →</span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
