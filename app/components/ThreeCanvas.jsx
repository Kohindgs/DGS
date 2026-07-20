'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#020202', 0.018);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Central 3D Cyber Core (TorusKnot Geometry + Wireframe + Inner Core)
    const knotGeometry = new THREE.TorusKnotGeometry(6, 1.8, 128, 32);
    
    // Outer glowing wireframe material
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00d4ff'),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const torusKnot = new THREE.Mesh(knotGeometry, wireframeMaterial);
    scene.add(torusKnot);

    // Inner glowing sphere core
    const coreGeometry = new THREE.IcosahedronGeometry(4, 3);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#9d4edd'),
      emissive: new THREE.Color('#3c096c'),
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // 3. Floating 3D Orbs / Geometry Elements
    const orbGroup = new THREE.Group();
    const orbGeometries = [
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1.4, 0),
    ];
    const orbColors = ['#00d4ff', '#fd5c62', '#f7d757', '#9d4edd', '#6366f1'];

    const orbData = [];
    for (let i = 0; i < 15; i++) {
      const geom = orbGeometries[i % orbGeometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(orbColors[i % orbColors.length]),
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Random positions around scene
      const radius = 18 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      orbGroup.add(mesh);
      orbData.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }
    scene.add(orbGroup);

    // 4. Background Particle Galaxy System
    const particleCount = 1800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color('#00d4ff'),
      new THREE.Color('#9d4edd'),
      new THREE.Color('#fd5c62'),
      new THREE.Color('#6366f1'),
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i3 + 2] = r * Math.cos(phi);

      const col = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle Texture Gradient
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      map: particleTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight('#00d4ff', 3, 50);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight('#fd5c62', 3, 50);
    pointLight2.position.set(-15, -15, -15);
    scene.add(pointLight2);

    // 6. Interactive Mouse & Scroll Effects
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

    // 7. Render Animation Loop
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth Mouse Intertia
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Torus & Core Rotations
      torusKnot.rotation.x = elapsed * 0.15 + targetY * 0.5;
      torusKnot.rotation.y = elapsed * 0.2 + targetX * 0.5;

      coreMesh.rotation.x = -elapsed * 0.2;
      coreMesh.rotation.y = -elapsed * 0.25;

      // Scale pulse effect on the core
      const pulseScale = 1 + Math.sin(elapsed * 2) * 0.06;
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Rotate Particles
      particles.rotation.y = elapsed * 0.02 + targetX * 0.1;
      particles.rotation.x = elapsed * 0.01 + targetY * 0.1;

      // Animate floating orbs
      orbData.forEach((item) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.position.y += Math.sin(elapsed * 1.5 + item.floatOffset) * 0.02;
      });

      // Scroll-driven camera depth offset
      const scrollFactor = scrollY * 0.008;
      camera.position.z = 28 + Math.sin(scrollFactor) * 4;
      camera.position.y = -targetY * 2 - scrollY * 0.003;
      camera.position.x = targetX * 2;
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
