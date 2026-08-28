"use client";

import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import styles from "./DgsOglParticleBackground.module.css";

const PALETTE: [number, number, number][] = [
  [0, 212 / 255, 1],
  [253 / 255, 92 / 255, 98 / 255],
  [157 / 255, 78 / 255, 221 / 255],
  [1, 1, 1],
];

function getDpr() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, 1.25);
}

function canUseWebGL() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.innerWidth < 901) return false;
  return true;
}

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

  return { positions, colors, count };
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
    if (!canvas || !canUseWebGL()) return;

    const renderer = new Renderer({
      canvas,
      dpr: getDpr(),
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });

    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const particleCount = window.innerWidth > 1400 ? 560 : 380;
    const { positions, colors, count } = buildParticleData(particleCount);

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      color: { size: 3, data: colors },
    });

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

    points.position.z = 0;

    const camera = new Camera(gl, { fov: 58, near: 0.1, far: 100 });
    camera.position.set(0, 0, 8.5);

    let rafId = 0;
    let running = document.visibilityState === "visible";
    let start = performance.now();
    let currentDpr = getDpr();

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (width < 901) {
        running = false;
        canvas.style.display = "none";
        return;
      }

      canvas.style.display = "block";
      const nextDpr = getDpr();
      if (Math.abs(nextDpr - currentDpr) > 0.05) {
        currentDpr = nextDpr;
        renderer.dpr = nextDpr;
      }

      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      running = true;
      scheduleFrame();
    };

    const scheduleFrame = () => {
      if (!running || rafId) return;
      rafId = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      running = visible && window.innerWidth >= 901;
      if (running) {
        start = performance.now();
        scheduleFrame();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const render = (now: number) => {
      rafId = 0;
      if (!running) return;

      const time = (now - start) * 0.001;
      points.rotation.y = time * 0.022;
      points.rotation.x = Math.sin(time * 0.22) * 0.035;

      renderer.render({ scene: points, camera });
      scheduleFrame();
    };

    resize();
    onReady?.();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    scheduleFrame();

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
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
