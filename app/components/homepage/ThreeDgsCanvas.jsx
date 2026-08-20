'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ThreeDgsCanvas() {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setIsReducedMotion(true);
    }
    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    let isMounted = true;
    let renderer, scene, camera, animationFrameId;
    let mainSculptureGroup, innerCore, outerPrism, orbitalBandsGroup, subtleSparkles;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let scrollY = 0;
    let clock;

    const initThree = async () => {
      try {
        const THREE = await import('three');

        if (!containerRef.current || !isMounted) return;

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setWebglSupported(false);
          return;
        }

        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;

        scene = new THREE.Scene();
        clock = new THREE.Clock();

        camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
        keyLight.position.set(15, 18, 15);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
        fillLight.position.set(-15, -10, 10);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0x00d2b4, 30, 40);
        rimLight.position.set(0, -12, -8);
        scene.add(rimLight);

        mainSculptureGroup = new THREE.Group();
        scene.add(mainSculptureGroup);

        const coreGeo = new THREE.OctahedronGeometry(2.8, 0);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          emissive: 0x0284c7,
          emissiveIntensity: 0.25,
          roughness: 0.15,
          metalness: 0.95,
        });
        innerCore = new THREE.Mesh(coreGeo, coreMat);
        mainSculptureGroup.add(innerCore);

        const prismGeo = new THREE.IcosahedronGeometry(4.2, 1);
        const prismMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.85,
          opacity: 1,
          transparent: true,
          roughness: 0.08,
          metalness: 0.05,
          ior: 1.45,
          thickness: 1.5,
          specularIntensity: 1.0,
          specularColor: 0xffffff,
          wireframe: false,
        });
        outerPrism = new THREE.Mesh(prismGeo, prismMat);
        mainSculptureGroup.add(outerPrism);

        const wireGeo = new THREE.IcosahedronGeometry(4.24, 1);
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.18,
        });
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        mainSculptureGroup.add(wireMesh);

        orbitalBandsGroup = new THREE.Group();
        mainSculptureGroup.add(orbitalBandsGroup);

        const bandData = [
          { r: 5.6, tube: 0.03, color: 0x00d2b4, rot: [Math.PI / 4, 0, Math.PI / 6] },
          { r: 6.8, tube: 0.025, color: 0x38bdf8, rot: [-Math.PI / 3, Math.PI / 5, 0] },
          { r: 8.0, tube: 0.02, color: 0xf59e0b, rot: [Math.PI / 6, -Math.PI / 4, Math.PI / 3] },
        ];

        bandData.forEach((b) => {
          const bandGeo = new THREE.TorusGeometry(b.r, b.tube, 16, 120);
          const bandMat = new THREE.MeshBasicMaterial({
            color: b.color,
            transparent: true,
            opacity: 0.5,
          });
          const bandMesh = new THREE.Mesh(bandGeo, bandMat);
          bandMesh.rotation.set(...b.rot);
          orbitalBandsGroup.add(bandMesh);
        });

        const particleCount = 180;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorGold = new THREE.Color(0xf59e0b);
        const colorTeal = new THREE.Color(0x00d2b4);
        const colorBlue = new THREE.Color(0x38bdf8);

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          const radius = 7 + Math.random() * 16;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);

          const mixed = Math.random() > 0.6 ? colorGold : Math.random() > 0.3 ? colorTeal : colorBlue;
          colors[i3] = mixed.r;
          colors[i3 + 1] = mixed.g;
          colors[i3 + 2] = mixed.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });

        subtleSparkles = new THREE.Points(particleGeo, particleMat);
        scene.add(subtleSparkles);

        const handleMouseMove = (e) => {
          const normX = (e.clientX / window.innerWidth) * 2 - 1;
          const normY = -(e.clientY / window.innerHeight) * 2 + 1;
          targetX = normX * 0.5;
          targetY = normY * 0.4;
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

        const animate = () => {
          if (!isMounted) return;
          animationFrameId = requestAnimationFrame(animate);

          const elapsedTime = clock.getElapsedTime();

          mouseX += (targetX - mouseX) * 0.04;
          mouseY += (targetY - mouseY) * 0.04;

          const scrollProgress = Math.min(scrollY / 1400, 1.4);

          if (mainSculptureGroup) {
            mainSculptureGroup.rotation.y = elapsedTime * 0.15 + mouseX * 0.5;
            mainSculptureGroup.rotation.x = Math.sin(elapsedTime * 0.12) * 0.1 + mouseY * 0.4;
            mainSculptureGroup.rotation.z = Math.cos(elapsedTime * 0.1) * 0.08;

            const isDesktop = window.innerWidth >= 1024;
            const baseX = isDesktop ? 3.5 : 0;
            const baseY = isDesktop ? 0.2 : -2.0;

            mainSculptureGroup.position.x = baseX - scrollProgress * 3.0 + mouseX * 0.3;
            mainSculptureGroup.position.y = baseY - scrollProgress * 2.0 + mouseY * 0.3;
            mainSculptureGroup.position.z = -scrollProgress * 4.0;

            const scale = isDesktop ? Math.max(0.75, 1 - scrollProgress * 0.15) : 0.65;
            mainSculptureGroup.scale.set(scale, scale, scale);
          }

          if (innerCore) {
            innerCore.rotation.x = -elapsedTime * 0.2;
            innerCore.rotation.y = -elapsedTime * 0.25;
          }

          if (orbitalBandsGroup) {
            orbitalBandsGroup.rotation.z = elapsedTime * 0.08;
            orbitalBandsGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.2;
          }

          if (subtleSparkles) {
            subtleSparkles.rotation.y = elapsedTime * 0.02 + mouseX * 0.05;
          }

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
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div 
          style={{
            position: 'absolute',
            top: '40%',
            right: '12%',
            transform: 'translateY(-50%)',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,210,180,0.15) 0%, rgba(56,189,248,0.1) 50%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'pulse 8s ease-in-out infinite alternate',
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
