"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import styles from "./TrustedBy.module.css";

gsap.registerPlugin(ScrollTrigger);

type Logo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type TrustedByProps = {
  logos: Logo[];
};

export function TrustedBy({ logos }: TrustedByProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".trusted-logo",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container.current,
              start: "top 85%",
              once: true,
            },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".trusted-logo", { opacity: 1, y: 0 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.section}>
      <p className={styles.label}>Trusted By 200+ Brands</p>
      <div className={styles.grid}>
        {logos.map((logo, i) => (
          <div key={i} className="trusted-logo">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={styles.logo}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
