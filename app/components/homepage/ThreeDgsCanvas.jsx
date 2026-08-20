'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ThreeDgsCanvas() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setIsReducedMotion(true);
    }
    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // Dynamic import of Three.js to ensure SSR safety
    let isMounted = true;
    let renderer, scene, camera, animationFrameId;
    let coreGroup, torusMesh, icosaMesh, wireframeMesh, ringsGroup, particlesMesh;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let scrollY = 0;
    let clock;

    const initThree = async () => {
      try {
        const THREE = await import('three');

        if (!containerRef.current || !isMounted) return;

        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setWebglSupported(false);
          return;
        }

        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;

        // 1. Scene setup
        scene = new THREE.Scene();
        clock = new THREE.Clock();

        // 2. Camera setup
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 18);

        // 3. Renderer setup
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        // 4. Lighting Architecture
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Key Light - Cyan/Teal
        const keyLight = new THREE.PointLight(0x00f5d4, 45, 50);
        keyLight.position.set(12, 12, 14);
        scene.add(keyLight);

        // Fill Light - Violet/Purple
        const fillLight = new THREE.PointLight(0x8b5cf6, 40, 50);
        fillLight.position.set(-14, -10, 12);
        scene.add(fillLight);

        // Rim Light - Hot Coral/Pink
        const rimLight = new THREE.PointLight(0xf72585, 35, 45);
        rimLight.position.set(0, 15, -10);
        scene.add(rimLight);

        // 5. Build DGS Sculptural Quantum Core
        coreGroup = new THREE.Group();
        scene.add(coreGroup);

        // A. Inner Metallic Faceted Core (Icosahedron)
        const icosaGeo = new THREE.IcosahedronGeometry(3.2, 2);
        const icosaMat = new THREE.MeshPhysicalMaterial({
          color: 0x070b14,
          emissive: 0x00172e,
          roughness: 0.15,
          metalness: 0.95,
          reflectivity: 0.9,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          wireframe: false,
        });
        icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
        coreGroup.add(icosaMesh);

        // B. Outer Crystal Luminous Wireframe Cage
        const wireGeo = new THREE.IcosahedronGeometry(3.28, 2);
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x00f5d4,
          wireframe: true,
          transparent: true,
          opacity: 0.45,
        });
        wireframeMesh = new THREE.Mesh(wireGeo, wireMat);
        coreGroup.add(wireframeMesh);

        // C. Intertwined Torus Knot Ribbon (Growth Vector)
        const torusGeo = new THREE.TorusKnotGeometry(4.4, 0.28, 128, 32, 2, 3);
        const torusMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0x6366f1,
          emissiveIntensity: 0.35,
          roughness: 0.2,
          metalness: 0.85,
        });
        torusMesh = new THREE.Mesh(torusGeo, torusMat);
        coreGroup.add(torusMesh);

        // D. Concentric Spatial Orbital Rings (Strategy, AI, Design, Growth)
        ringsGroup = new THREE.Group();
        coreGroup.add(ringsGroup);

        const ringGeometries = [
          { radius: 5.6, tube: 0.035, color: 0x00f5d4, rot: [Math.PI / 3, 0, 0] },
          { radius: 6.8, tube: 0.03, color: 0x6366f1, rot: [0, Math.PI / 4, Math.PI / 6] },
          { radius: 8.0, tube: 0.025, color: 0xf72585, rot: [-Math.PI / 4, Math.PI / 3, 0] },
        ];

        ringGeometries.forEach((r) => {
          const ringGeo = new THREE.TorusGeometry(r.radius, r.tube, 16, 100);
          const ringMat = new THREE.MeshBasicMaterial({
            color: r.color,
            transparent: true,
            opacity: 0.6,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.set(...r.rot);
          ringsGroup.add(ringMesh);
        });

        // E. Ambient Depth Particle Nebula
        const particleCount = 450;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const c1 = new THREE.Color(0x00f5d4);
        const c2 = new THREE.Color(0x6366f1);
        const c3 = new THREE.Color(0xf72585);

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const radius = 6 + Math.random() * 18;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);

          const mixedColor = Math.random() > 0.5 ? c1 : Math.random() > 0.5 ? c2 : c3;
          colors[i3] = mixedColor.r;
          colors[i3 + 1] = mixedColor.g;
          colors[i3 + 2] = mixedColor.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
          size: 0.12,
          vertexColors: true,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        });

        particlesMesh = new THREE.Points(particleGeo, particleMat);
        scene.add(particlesMesh);

        // 6. Interactive Event Handlers
        const handleMouseMove = (e) => {
          const normX = (e.clientX / window.innerWidth) * 2 - 1;
          const normY = -(e.clientY / window.innerHeight) * 2 + 1;
          targetX = normX * 0.8;
          targetY = normY * 0.6;
        };

        const handleScroll = () => {
          scrollY = window.scrollY || window.pageYOffset;
        };

        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera) return;
          const newW = containerRef.current.clientWidth || window.innerWidth;
          const newH = containerRef.current.clientHeight || window.innerHeight;
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // 7. Animation Loop
        const animate = () => {
          if (!isMounted) return;
          animationFrameId = requestAnimationFrame(animate);

          const elapsedTime = clock.getElapsedTime();

          // Smooth lerp mouse tracking
          mouseX += (targetX - mouseX) * 0.05;
          mouseY += (targetY - mouseY) * 0.05;

          // Scroll progress calculation (0 to 1 across initial 1200px)
          const scrollProgress = Math.min(scrollY / 1200, 1.5);

          if (coreGroup) {
            // Base continuous rotation
            coreGroup.rotation.y = elapsedTime * 0.25 + mouseX * 0.9;
            coreGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 + mouseY * 0.7;
            coreGroup.rotation.z = Math.cos(elapsedTime * 0.15) * 0.1;

            // Scroll-linked transformations
            // Object tilts and drifts slightly left/down as page scrolls
            coreGroup.position.x = 2.8 - scrollProgress * 4.2 + mouseX * 0.5;
            coreGroup.position.y = -scrollProgress * 2.5 + mouseY * 0.5;
            coreGroup.position.z = -scrollProgress * 5.0;

            const scale = Math.max(0.7, 1 - scrollProgress * 0.2);
            coreGroup.scale.set(scale, scale, scale);
          }

          if (torusMesh) {
            torusMesh.rotation.x = elapsedTime * 0.35;
            torusMesh.rotation.y = elapsedTime * 0.45;
          }

          if (wireframeMesh) {
            wireframeMesh.rotation.y = -elapsedTime * 0.18;
          }

          if (ringsGroup) {
            ringsGroup.rotation.z = elapsedTime * 0.12;
            ringsGroup.rotation.y = Math.sin(elapsedTime * 0.2) * 0.3;
          }

          if (particlesMesh) {
            particlesMesh.rotation.y = elapsedTime * 0.04 + mouseX * 0.1;
            particlesMesh.rotation.x = mouseY * 0.08;
          }

          // Dynamic light drift
          keyLight.position.x = 12 + Math.sin(elapsedTime * 0.8) * 3;
          fillLight.position.y = -10 + Math.cos(elapsedTime * 0.7) * 3;

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Three.js initialization error:', err);
        setWebglSupported(false);
      }
    };

    const cleanupPromise = initThree();

    return () => {
      isMounted = false;
      motionQuery.removeEventListener('change', handleMotionChange);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (cleanupPromise && typeof cleanupPromise.then === 'function') {
        cleanupPromise.then((cleanup) => cleanup && cleanup());
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  if (!webglSupported) {
    // Graceful CSS 3D Fallback
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translateY(-50%)',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,245,212,0.2) 0%, rgba(99,102,241,0.15) 50%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'pulse 6s ease-in-out infinite alternate',
          }} 
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
