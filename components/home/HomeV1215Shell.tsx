"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DgsOglParticleBackground } from "@/components/background/DgsOglParticleBackground";
import styles from "./HomeV1215Shell.module.css";

type Props = {
  children: ReactNode;
};

const SETTLE_EPSILON = 0.001;

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

  const isSettled = () =>
    Math.abs(nx - targetX) < SETTLE_EPSILON && Math.abs(ny - targetY) < SETTLE_EPSILON;

  const applyTransform = () => {
    if (window.innerWidth < 900) {
      wrap.style.transform = "";
      img.style.transform = "";
      return;
    }

    wrap.style.transform = `perspective(1300px) rotateY(${(nx * 4).toFixed(2)}deg) rotateX(${(-ny * 3).toFixed(2)}deg) translate3d(${(nx * 8).toFixed(2)}px, ${(ny * 6).toFixed(2)}px, 0)`;
    img.style.transform = `scale(1.02) translate3d(${(nx * -7).toFixed(2)}px, ${(ny * -5).toFixed(2)}px, 0)`;
  };

  const render = () => {
    rafId = 0;
    active = false;
    nx += (targetX - nx) * 0.12;
    ny += (targetY - ny) * 0.12;
    applyTransform();

    if (!isSettled()) {
      requestRender();
    } else if (targetX === 0 && targetY === 0) {
      wrap.style.transform = "";
      img.style.transform = "";
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
    const cleanupPointer = initHeroPointerMotion();
    return cleanupPointer;
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
