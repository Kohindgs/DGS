'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 30);

    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // --- Organic Nebula Particle Cloud ---
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
      new THREE.Color('#7c5cfc'), // Violet
      new THREE.Color('#3ecfb4'), // Teal
      new THREE.Color('#f0734f'), // Coral
      new THREE.Color('#5b6abf'), // Slate indigo
      new THREE.Color('#ffffff'), // White
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Nebula-like distribution using gaussian-ish spread
      const r = 15 + Math.pow(Math.random(), 0.6) * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.55;

      positions[i3] = r * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] = r * Math.sin(phi) * 0.5 + (Math.random() - 0.5) * 6;
      positions[i3 + 2] = r * Math.sin(theta) * Math.cos(phi) - 10;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 1.2 + 0.3;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Soft glow texture
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 64;
    canvas2d.height = 64;
    const ctx = canvas2d.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas2d);

    const particleMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      map: tex,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Floating Orbital Rings ---
    const ringGeo1 = new THREE.TorusGeometry(18, 0.04, 16, 200);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: '#7c5cfc',
      transparent: true,
      opacity: 0.12,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.8;
    ring1.rotation.z = 0.3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(24, 0.03, 16, 200);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#3ecfb4',
      transparent: true,
      opacity: 0.08,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3.5;
    ring2.rotation.z = -0.5;
    scene.add(ring2);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.015;
      targetY += (mouseY - targetY) * 0.015;

      // Gentle particle cloud rotation
      particles.rotation.y = t * 0.015 + targetX * 0.08;
      particles.rotation.x = Math.sin(t * 0.01) * 0.03 + targetY * 0.04;

      // Ring orbits
      ring1.rotation.z = 0.3 + t * 0.02;
      ring1.rotation.y = t * 0.008;
      ring2.rotation.z = -0.5 + t * 0.015;
      ring2.rotation.y = -t * 0.006;

      // Subtle camera drift
      camera.position.x = targetX * 1.5;
      camera.position.y = 2 + targetY * 1;
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
