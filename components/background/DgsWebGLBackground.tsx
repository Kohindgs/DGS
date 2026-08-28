"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";
import { interpolateScrollProgress } from "@/lib/motion/scroll-progress";
import styles from "./DgsWebGLBackground.module.css";

function getDpr() {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth;
  const base = window.devicePixelRatio || 1;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 1;
  if (width >= 3000) return Math.min(base, 1.25);
  if (width >= 1920) return Math.min(base, 1.5);
  return Math.min(base, 1);
}

const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform float uDistortion;

  void main() {
    vec2 uv = vUv;
    float wave = sin((uv.x + uv.y) * 8.0 + uTime * 0.35) * 0.02;
    uv += wave * uDistortion;
    float depth = smoothstep(0.0, 1.0, 1.0 - distance(uv, vec2(0.5, 0.45 + uProgress * 0.05)));
    vec3 color = mix(vec3(0.02, 0.02, 0.03), vec3(0.08, 0.03, 0.12), depth);
    color += vec3(0.03, 0.0, 0.06) * sin(uTime * 0.2 + uv.x * 6.0) * 0.15;
    color += vec3(0.02) * (1.0 - distance(uv, uPointer)) * 0.2;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function DgsWebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let currentDpr = getDpr();
    const renderer = new Renderer({
      canvas,
      dpr: currentDpr,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: new Vec2(0.5, 0.5) },
      uDistortion: { value: 0.35 },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry, program });

    let rafId = 0;
    let running = document.visibilityState === "visible";
    let lastTime = performance.now();

    const resize = () => {
      const nextDpr = getDpr();
      if (Math.abs(nextDpr - currentDpr) > 0.05) {
        currentDpr = nextDpr;
        renderer.dpr = nextDpr;
      }
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onPointerMove = (event: PointerEvent) => {
      uniforms.uPointer.value.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight,
      );
    };

    const scheduleFrame = () => {
      if (!running || rafId) return;
      rafId = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      running = visible;
      if (visible) {
        lastTime = performance.now();
        scheduleFrame();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const render = (now: number) => {
      rafId = 0;
      if (!running) return;

      const delta = now - lastTime;
      if (delta >= 32) {
        uniforms.uTime.value += delta * 0.001;
        uniforms.uProgress.value = interpolateScrollProgress();
        renderer.render({ scene: mesh });
        lastTime = now;
      }

      scheduleFrame();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    scheduleFrame();

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
