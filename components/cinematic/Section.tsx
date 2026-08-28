"use client";

import { type ReactNode } from "react";
import { Reveal } from "@/components/motion/ScrollReveal";
import styles from "./Section.module.css";

type SectionProps = {
  children: ReactNode;
  className?: string;
  padTop?: boolean;
  padBottom?: boolean;
};

export function Section({ children, className, padTop = true, padBottom = true }: SectionProps) {
  return (
    <section
      className={`${styles.section} ${padTop ? styles.padTop : ""} ${padBottom ? styles.padBottom : ""} ${className || ""}`}
    >
      <div className={styles.inner}>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
