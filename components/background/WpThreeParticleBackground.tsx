"use client";

import { useEffect } from "react";
import * as THREE from "three";

/**
 * Restores original WordPress Three.js particle sphere background
 * on proven AI production and case-study routes inside #global-webgl-background.
 * Optimizes mobile execution: caps DPR, scales particle density, disables MSAA,
 * pauses RAF on background tabs, and defers initialization post-critical-render.
 */
export function WpThreeParticleBackground() {
  useEffect(() => {
    const container = document.getElementById("global-webgl-background");
    if (!container) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const init = () => {
      if (disposed) return;

      // Strict single canvas guarantee
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const isMobile = window.innerWidth < 768;
      const maxDpr = isMobile ? 1.25 : 2;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, maxDpr);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      camera.position.z = 50;

      const particleCount = isMobile ? 2600 : 5200;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const palette = [
        new THREE.Color(0xea3f8b),
        new THREE.Color(0xffae33),
        new THREE.Color(0x72c1d8),
        new THREE.Color(0x634dbc),
      ];
      const radius = 25;

      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: isMobile ? 0.2 : 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.58,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const sphere = new THREE.Points(particles, material);
      scene.add(sphere);

      let targetX = 0;
      let targetY = 0;
      let scrollProgress = 0;
      let animationId: number | null = null;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const onMouseMove = (e: MouseEvent) => {
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = -(e.clientY / window.innerHeight) * 2 + 1;
        targetY = mx * 0.28;
        targetX = my * 0.28;
      };

      const onScroll = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = maxScroll > 0 ? (window.scrollY ?? window.pageYOffset) / maxScroll : 0;
      };

      const onResize = () => {
        const currentIsMobile = window.innerWidth < 768;
        const currentMaxDpr = currentIsMobile ? 1.25 : 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, currentMaxDpr));
        if (prefersReducedMotion) {
          renderer.render(scene, camera);
        }
      };

      const animate = () => {
        if (document.hidden) {
          animationId = null;
          return;
        }
        animationId = requestAnimationFrame(animate);
        sphere.rotation.y += (targetY - sphere.rotation.y) * 0.05;
        sphere.rotation.x += (targetX - sphere.rotation.x) * 0.05;
        sphere.rotation.y += 0.0005;
        sphere.rotation.x += 0.0002;
        sphere.position.y = scrollProgress * 5;
        sphere.position.z = scrollProgress * -10;
        const t = Date.now() * 0.0003;
        sphere.scale.setScalar(1 + Math.sin(t) * 0.035);
        renderer.render(scene, camera);
      };

      const onVisibilityChange = () => {
        if (document.hidden) {
          if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else if (!prefersReducedMotion && animationId === null) {
          animate();
        }
      };

      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      } else {
        if (!isMobile) {
          document.addEventListener("mousemove", onMouseMove, { passive: true });
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
        animate();
      }

      window.addEventListener("resize", onResize, { passive: true });

      cleanup = () => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        renderer.dispose();
        particles.dispose();
        material.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    // Defer initialization so critical DOM paint and hydration finish first
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(init, { timeout: 1200 });
    } else {
      timerId = setTimeout(init, 60);
    }

    return () => {
      disposed = true;
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return null;
}
