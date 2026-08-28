"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DgsOglParticleBackground } from "@/components/background/DgsOglParticleBackground";
import styles from "./HomeV1215Shell.module.css";

type Props = {
  children: ReactNode;
};

function initHeroPointerMotion() {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const wrap = document.getElementById("dgs-v1215-robot-wrap");
  const img = document.getElementById("dgs-v1215-robot");
  if (!wrap || !img) return () => {};

  let active = false;
  let nx = 0;
  let ny = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = 0;

  const render = () => {
    active = false;
    nx += (targetX - nx) * 0.12;
    ny += (targetY - ny) * 0.12;

    if (window.innerWidth >= 900) {
      wrap.style.transform = `perspective(1300px) rotateY(${(nx * 4).toFixed(2)}deg) rotateX(${(-ny * 3).toFixed(2)}deg) translate3d(${(nx * 8).toFixed(2)}px, ${(ny * 6).toFixed(2)}px, 0)`;
      img.style.transform = `scale(1.02) translate3d(${(nx * -7).toFixed(2)}px, ${(ny * -5).toFixed(2)}px, 0)`;
    }
  };

  const requestRender = () => {
    if (!active) {
      active = true;
      rafId = requestAnimationFrame(render);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    targetY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    requestRender();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    wrap.style.transform = "";
    img.style.transform = "";
    requestRender();
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    wrap.style.transform = "";
    img.style.transform = "";
  };
}

export function HomeV1215Shell({ children }: Props) {
  const mainRef = useRef<HTMLElement>(null);
  const [webglReady, setWebglReady] = useState(false);

  const handleWebglReady = useCallback(() => {
    setWebglReady(true);
    mainRef.current?.classList.add("v1215-webgl-ready");
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    let ticking = false;

    const update = () => {
      const rect = root.getBoundingClientRect();
      const start = window.pageYOffset + rect.top;
      const total = Math.max(root.offsetHeight - window.innerHeight, 1);
      const current = window.pageYOffset - start;
      const progress = Math.min(Math.max(current / total, 0), 1);
      root.style.setProperty("--v1215-scroll", progress.toFixed(4));
      ticking = false;
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    const cleanupPointer = initHeroPointerMotion();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      cleanupPointer();
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className={`${styles.main} dgs-v1215 page-main home-page${webglReady ? ` ${styles.webglReady}` : ""}`}
      id="main-content"
    >
      <div className={`${styles.bg} dgs-v1215-bg`} aria-hidden="true">
        <DgsOglParticleBackground onReady={handleWebglReady} />
        <div className={`${styles.fallback} dgs-v1215-fallback`} />
        <div className={`${styles.grid} dgs-v1215-grid`} />
        <div className={`${styles.vignette} dgs-v1215-vignette`} />
      </div>
      {children}
    </main>
  );
}
