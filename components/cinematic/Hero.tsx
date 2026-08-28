"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

type HeroProps = {
  title: string;
  subtitle: string;
  stats: Array<{ label: string; value: string }>;
  imageSrc: string;
  imageAlt: string;
};

export function Hero({ title, subtitle, stats, imageSrc, imageAlt }: HeroProps) {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

          tl.fromTo(
            titleRef.current,
            { y: 60, opacity: 0, rotateX: 15 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1.4 },
          )
          .fromTo(
            ".hero__subtitle",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: -0.6 },
          )
          .fromTo(
            ".hero__image",
            { scale: 1.15, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.8, delay: -0.8 },
            "-=0.4",
          )
          .fromTo(
            ".hero__stat",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.8 },
            "-=1",
          );

          gsap.to(container.current, {
            scrollTrigger: {
              trigger: container.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
            opacity: 0.3,
            y: -80,
            scale: 0.98,
          });
        });

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(titleRef.current, { opacity: 1, y: 0, rotateX: 0 });
          gsap.set(".hero__subtitle", { opacity: 1, y: 0 });
          gsap.set(".hero__image", { opacity: 1, scale: 1 });
          gsap.set(".hero__stat", { opacity: 1, y: 0 });
        });
      }, container);

      return () => ctx.revert();
    },
    { scope: container },
  );

  return (
    <section ref={container} className={styles.hero}>
      <div className={styles.bg} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 ref={titleRef} className={styles.title}>
            {title}
          </h1>
          <p className="hero__subtitle">{subtitle}</p>
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={`hero__stat ${styles.stat}`}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`hero__image ${styles.imageWrap}`}>
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={600}
              height={600}
              className={styles.image}
              priority
            />
          )}
        </div>
      </div>
    </section>
  );
}
