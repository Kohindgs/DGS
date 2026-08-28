"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type RevealProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function Reveal({ children, className, y = 30 }: RevealProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            container.current,
            { y, opacity: 0 },
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
          gsap.set(container.current, { opacity: 1, y: 0 });
        });
      }, container);

      return () => ctx.revert();
    },
    { scope: container },
  );

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
