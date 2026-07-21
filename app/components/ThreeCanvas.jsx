'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#050508', 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 32);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Organic Fluid Wave Mesh (Plane Geometry with Dynamic Vertex Displacement)
    const cols = 90;
    const rows = 90;
    const waveGeo = new THREE.PlaneGeometry(80, 80, cols, rows);
    waveGeo.rotateX(-Math.PI / 2.5); // Tilt to create dramatic horizon perspective

    const count = waveGeo.attributes.position.count;
    const initialZ = new Float32Array(count);
    const posAttr = waveGeo.attributes.position;

    // Save initial coordinates
    for (let i = 0; i < count; i++) {
      initialZ[i] = posAttr.getZ(i);
    }

    // High-end Shader Material for Fluid Grid Waves
    const waveMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00d4ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.y = -8;
    scene.add(waveMesh);

    // 3. Luminous Organic Particle Galaxy Field
    const particleCount = 2800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color('#00d4ff'), // Cyan
      new THREE.Color('#9d4edd'), // Violet
      new THREE.Color('#fd5c62'), // Coral
      new THREE.Color('#6366f1'), // Indigo
      new THREE.Color('#ffffff'), // Pure White Glow
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Organic distribution along a flowing curve
      const u = Math.random();
      const v = Math.random();
      const radius = 25 + Math.random() * 35;
      const theta = u * Math.PI * 2;
      const phi = (v - 0.5) * Math.PI * 0.8;

      particlePositions[i3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePositions[i3 + 1] = radius * Math.sin(phi) + Math.sin(u * 10) * 4;
      particlePositions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;

      particleScales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Glow Texture Canvas
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const ctx = glowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 212, 255, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTex = new THREE.CanvasTexture(glowCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      map: particleTex,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Volumetric Ambient Glow Lights
    const light1 = new THREE.PointLight('#00d4ff', 4, 60);
    light1.position.set(20, 20, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight('#9d4edd', 4, 60);
    light2.position.set(-20, -10, -10);
    scene.add(light2);

    // 5. Mouse & Scroll Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Smooth Animation Loop
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth inertia mouse tracking
      targetX += (mouseX - targetX) * 0.03;
      targetY += (mouseY - targetY) * 0.03;

      // Animate Fluid Wave Vertices
      const pos = waveGeo.attributes.position;
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const z = Math.sin(x * 0.2 + time * 1.5) * 1.8 + Math.cos(y * 0.2 + time * 1.2) * 1.8 + Math.sin(dist * 0.1 - time) * 1.2;
        pos.setZ(i, z);
      }
      waveGeo.attributes.position.needsUpdate = true;

      // Rotate particle galaxy gently
      particles.rotation.y = time * 0.03 + targetX * 0.15;
      particles.rotation.x = Math.sin(time * 0.02) * 0.05 + targetY * 0.1;

      // Dynamic light movements
      light1.position.x = Math.sin(time * 0.8) * 25 + targetX * 10;
      light1.position.z = Math.cos(time * 0.8) * 25;

      light2.position.x = -Math.sin(time * 0.6) * 25;
      light2.position.z = -Math.cos(time * 0.6) * 25 + targetY * 10;

      // Camera depth parallax based on scroll
      camera.position.y = 12 - scrollY * 0.004 + targetY * 3;
      camera.position.x = targetX * 4;
      camera.position.z = 32 + Math.sin(scrollY * 0.002) * 3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      id="dgs-v1215-canvas"
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
