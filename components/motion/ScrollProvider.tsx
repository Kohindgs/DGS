"use client";

import { useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { ensureGsapPlugins, gsap, ScrollTrigger } from "@/lib/motion/gsap";

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureGsapPlugins();
  }, []);

  useGSAP(() => {
    ensureGsapPlugins();
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }, []);

  return <>{children}</>;
}

export function getScrollTriggerCount() {
  if (typeof window === "undefined") return 0;
  ensureGsapPlugins();
  return ScrollTrigger.getAll().length;
}
