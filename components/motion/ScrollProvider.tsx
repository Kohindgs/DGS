"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { resetScrollProgress, scrollProgress } from "@/lib/motion/scroll-progress";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function revealSelector() {
  return '[data-motion="reveal-up"], [data-reveal]';
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureGsapPlugins();
  }, []);

  useGSAP(
    () => {
      ensureGsapPlugins();
      resetScrollProgress();

      const reduced = prefersReducedMotion();
      const scope = scopeRef.current || document.body;

      const ctx = gsap.context(() => {
        if (reduced) {
          gsap.set("[data-motion], [data-reveal], [data-stagger-child]", {
            autoAlpha: 1,
            x: 0,
            y: 0,
            clearProps: "transform,opacity,visibility",
          });
          return;
        }

        ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: "max",
          onUpdate: (self) => {
            scrollProgress.target = self.progress;
          },
        });

        gsap.utils.toArray<HTMLElement>(revealSelector(), scope).forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-motion="reveal-side"]', scope).forEach((element) => {
          const fromX = element.dataset.motionFrom === "right" ? 48 : -48;
          gsap.fromTo(
            element,
            { autoAlpha: 0, x: fromX },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-motion="stagger"]', scope).forEach((parent) => {
          const children = parent.querySelectorAll<HTMLElement>("[data-stagger-child]");
          if (!children.length) return;
          gsap.fromTo(
            children,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: parent,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-motion="parallax"]', scope).forEach((element) => {
          const amount = Number(element.dataset.parallaxAmount || 36);
          gsap.to(element, {
            y: amount,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      }, scope);

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        ctx.revert();
        resetScrollProgress();
      };
    },
    { dependencies: [pathname], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}

export function getScrollTriggerCount() {
  if (typeof window === "undefined") return 0;
  ensureGsapPlugins();
  return ScrollTrigger.getAll().length;
}
