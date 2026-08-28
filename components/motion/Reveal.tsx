import type { ReactNode } from "react";
import type { MotionVariant } from "@/lib/motion/variants";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: MotionVariant;
  parallaxAmount?: number;
  motionFrom?: "left" | "right";
};

export function Reveal({
  children,
  className,
  variant = "reveal-up",
  parallaxAmount,
  motionFrom,
}: RevealProps) {
  return (
    <div
      data-motion={variant}
      {...(variant === "reveal-up" ? { "data-reveal": true } : {})}
      data-parallax-amount={parallaxAmount}
      data-motion-from={motionFrom}
      className={className}
    >
      {children}
    </div>
  );
}

export function StaggerChild({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-stagger-child className={className}>
      {children}
    </div>
  );
}
