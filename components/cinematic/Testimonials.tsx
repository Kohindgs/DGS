"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Testimonials.module.css";

gsap.registerPlugin(ScrollTrigger);

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type TestimonialsProps = {
  items: Testimonial[];
};

export function Testimonials({ items }: TestimonialsProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".testimonial-item",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
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
        gsap.set(".testimonial-item", { opacity: 1, y: 0 });
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.section}>
      <h2 className={styles.title}>Trusted By Brands Worldwide</h2>
      <div className={styles.grid}>
        {items.map((item, i) => (
          <blockquote key={i} className="testimonial-item">
            <div className={styles.card}>
              <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
              <footer className={styles.author}>
                <span className={styles.name}>{item.author}</span>
                <span className={styles.role}>{item.role}</span>
              </footer>
            </div>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
