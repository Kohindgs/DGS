"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import { interpolateScrollProgress } from "@/lib/motion/scroll-progress";
import { getParticleCount, getParticleDpr, canUseHomeWebGL } from "@/lib/motion/ogl-particle-tuning";
import styles from "./DgsOglParticleBackground.module.css";

const PALETTE: [number, number, number][] = [
  [0, 212 / 255, 1],
  [253 / 255, 92 / 255, 98 / 255],
  [157 / 255, 78 / 255, 221 / 255],
  [1, 1, 1],
];

function buildParticleData(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    const angle = t * Math.PI * 8 + Math.random();
    const radius = 1.2 + Math.random() * 6;
    positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5);
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.45 + (Math.random() - 0.5) * 3.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9;

    const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  return { positions, colors };
}

const vertex = `
  attribute vec3 position;
  attribute vec3 color;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 7.4 * (300.0 / max(-mvPosition.z, 0.1));
  }
`;

const fragment = `
  precision highp float;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float alpha = smoothstep(0.5, 0.18, dist) * 0.86;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

type Props = {
  onReady?: () => void;
};

export function DgsOglParticleBackground({ onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (!canUseHomeWebGL(window.innerWidth, { reducedMotion, coarsePointer })) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let currentDpr = getParticleDpr(width, window.devicePixelRatio || 1);
    let particleCount = getParticleCount(width);

    const renderer = new Renderer({
      canvas,
      dpr: currentDpr,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });

    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const rebuildParticles = (count: number) => {
      const { positions, colors } = buildParticleData(count);
      return new Geometry(gl, {
        position: { size: 3, data: positions },
        color: { size: 3, data: colors },
      });
    };

    let geometry = rebuildParticles(particleCount);

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const points = new Mesh(gl, {
      mode: gl.POINTS,
      geometry,
      program,
    });

    const camera = new Camera(gl, { fov: 58, near: 0.1, far: 100 });
    camera.position.set(0, 0, 8.5);

    let rafId = 0;
    let start = performance.now();
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };

    const shouldAnimate = () =>
      document.visibilityState === "visible" &&
      canUseHomeWebGL(window.innerWidth, {
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        coarsePointer: window.matchMedia("(pointer: coarse)").matches,
      });

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const scheduleFrame = () => {
      if (!shouldAnimate() || rafId) return;
      rafId = requestAnimationFrame(render);
    };

    const applySize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      if (!canUseHomeWebGL(width, { reducedMotion, coarsePointer })) {
        canvas.style.display = "none";
        stopLoop();
        return;
      }

      canvas.style.display = "block";

      const nextCount = getParticleCount(width);
      if (nextCount !== particleCount) {
        particleCount = nextCount;
        geometry = rebuildParticles(particleCount);
        points.geometry = geometry;
      }

      const nextDpr = getParticleDpr(width, window.devicePixelRatio || 1);
      if (Math.abs(nextDpr - currentDpr) > 0.01) {
        currentDpr = nextDpr;
        renderer.dpr = nextDpr;
      }

      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    const onResize = () => {
      applySize();
      if (shouldAnimate()) scheduleFrame();
    };

    const onVisibility = () => {
      if (shouldAnimate()) {
        start = performance.now();
        scheduleFrame();
      } else {
        stopLoop();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      pointerTarget.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      pointerTarget.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    const render = (now: number) => {
      rafId = 0;
      if (!shouldAnimate()) return;

      const progress = interpolateScrollProgress();
      const time = (now - start) * 0.001;

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.08;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.08;

      points.rotation.y = time * 0.022 + progress * 0.12 + pointerCurrent.x * 0.022;
      points.rotation.x = Math.sin(time * 0.22) * 0.035 + progress * 0.035 + pointerCurrent.y * -0.018;
      points.position.x = pointerCurrent.x * 0.12;
      points.position.y = progress * 0.28 + pointerCurrent.y * 0.08;
      points.position.z = -progress * 0.22;
      camera.position.z = 8.5 - progress * 0.35;

      renderer.render({ scene: points, camera });
      rafId = requestAnimationFrame(render);
    };

    applySize();
    onReady?.();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    scheduleFrame();

    return () => {
      stopLoop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [onReady]);

  return (
    <canvas
      ref={canvasRef}
      id="dgs-v1215-canvas"
      className={styles.canvas}
      aria-hidden="true"
    />
  );
}
