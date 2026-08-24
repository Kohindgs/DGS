"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneState } from "../../lib/sceneState";

/* ---------- small geometry builders (procedural, no textures) ---------- */

function usePositions(seedCount, radius, spread, seedOffset) {
  return useMemo(() => {
    const pos = new Float32Array(seedCount * 3);
    let s = seedOffset || 0;
    for (let i = 0; i < seedCount; i++) {
      const r = radius * (0.4 + 0.6 * Math.abs(Math.sin(s * 12.9898)));
      const theta = (s % 360) * 0.01745;
      const phi = Math.cos(s * 78.233) * Math.PI;
      pos[i * 3] = Math.cos(theta) * Math.sin(phi) * r * spread;
      pos[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * r * spread;
      pos[i * 3 + 2] = Math.cos(phi) * r * spread;
      s += 0.6180339887;
    }
    return pos;
  }, [seedCount, radius, spread, seedOffset]);
}

function buildLineGeometry(points) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    arr[i * 3] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
  });
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  return geo;
}

/* ---------- Core central structure: light + geometry + particle core ------- */

function CoreStructure({ color = "#00d4ff" }) {
  const coreRef = useRef();
  const ringRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.12;
      coreRef.current.rotation.x = Math.sin(t * 0.1) * 0.25;
      const s = 1 + Math.sin(t * 0.9) * 0.05;
      coreRef.current.scale.setScalar(s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.08;
      ringRef.current.rotation.x = 0.4 + Math.sin(t * 0.16) * 0.2;
    }
  });
  return (
    <group position={[1.7, 0.3, 0]}>
      {/* inner glowing sphere */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh scale={0.82}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* orbital ring */}
      <mesh ref={ringRef} rotation={[0.6, 0, 0]}>
        <torusGeometry args={[1.95, 0.015, 8, 90]} />
        <meshBasicMaterial color="#fd5c62" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[1.2, 0.6, 0]}>
        <torusGeometry args={[2.35, 0.01, 8, 90]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- SEARCH: structured network of nodes + connecting lines --------- */

function SearchSystem({ pos = [6.4, 1.3, -2.6], color = "#00d4ff" }) {
  const grp = useRef();
  const nodeCount = 130;
  const positions = usePositions(nodeCount, 2.4, 1, 3.1);
  const linePositions = useMemo(() => {
    // connect each node to a few near neighbours (deterministic-ish)
    const pts = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let k = 1; k <= 3; k++) {
        const j = (i + k * 7) % nodeCount;
        pts.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return geo;
  }, [positions]);
  useFrame(({ clock }) => {
    if (sceneState.staticMode) return;
    const t = clock.elapsedTime;
    grp.current.rotation.y = Math.sin(t * 0.12) * 0.35;
    grp.current.rotation.x = Math.sin(t * 0.09) * 0.2;
  });
  return (
    <group ref={grp} position={pos}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={linePositions}>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

/* ---------- CREATIVE: dimensional colour surfaces / media planes ---------- */

const CREATIVE = ["#fd5c62", "#00d4ff", "#9d4edd", "#f7d757"];
function CreativeSystem({ pos = [2.6, 3.9, -1.4] }) {
  const grp = useRef();
  useFrame(({ clock }) => {
    if (sceneState.staticMode) return;
    const t = clock.elapsedTime;
    grp.current.rotation.y = t * 0.18;
    grp.current.rotation.z = Math.sin(t * 0.14) * 0.25;
  });
  return (
    <group ref={grp} position={pos}>
      {CREATIVE.map((c, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / CREATIVE.length) * Math.PI * 2) * 1.5,
            Math.sin((i / CREATIVE.length) * Math.PI * 2) * 1.5,
            i * 0.3,
          ]}
          rotation={[i * 0.6, i * 0.4, 0]}
        >
          <boxGeometry args={[1.1, 1.6, 0.04]} />
          <meshBasicMaterial color={c} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- TECHNOLOGY: geometric grid / spatial architecture ---------- */

function TechSystem({ pos = [3.0, -3.4, -2.2], color = "#9d4edd" }) {
  const grp = useRef();
  const boxes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const r = 1.9;
        const a = (i / 12) * Math.PI * 2;
        return {
          p: [Math.cos(a) * r, (i % 4) * 0.5 - 0.75, Math.sin(a) * r],
          s: [0.5 + (i % 3) * 0.22, 0.4 + (i % 2) * 0.3, 0.5 + (i % 2) * 0.22],
          ry: i * 0.4,
        };
      }),
    []
  );
  useFrame(({ clock }) => {
    if (sceneState.staticMode) return;
    const t = clock.elapsedTime;
    grp.current.rotation.y = Math.sin(t * 0.1) * 0.4;
  });
  return (
    <group ref={grp} position={pos}>
      <gridHelper args={[6, 12, color, color]} position={[0, -1.2, 0]} />
      <mesh>
        <boxGeometry args={[4.4, 0.06, 4.4]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {boxes.map((b, i) => (
        <mesh key={i} position={b.p} rotation={[0, b.ry, 0]}>
          <boxGeometry args={b.s} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- AI: generative, evolving particle field ------------------------ */

function AiSystem({ pos = [6.8, -1.5, -3.4], color = "#f7d757" }) {
  const grp = useRef();
  const cloudRef = useRef();
  const count = 420;
  const positions = usePositions(count, 2.6, 1.25, 9.7);
  const base = useMemo(() => Array.from(positions), [positions]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (sceneState.staticMode) return;
    grp.current.rotation.y = t * 0.22;
    // evolving form: gently displace each particle along y
    if (cloudRef.current) {
      const attr = cloudRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        attr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.7 + i * 0.5) * 0.25;
        attr.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.5 + i * 0.3) * 0.2;
      }
      attr.needsUpdate = true;
    }
  });
  return (
    <group ref={grp} position={pos}>
      <points ref={cloudRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.16}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/* ---------- Connectors: paths binding the four systems to the core --------- */

function Connectors() {
  const lines = useMemo(() => {
    const links = [
      [1.7, 0.3, 0, 6.4, 1.3, -2.6], // -> search
      [1.7, 0.3, 0, 2.6, 3.9, -1.4], // -> creative
      [1.7, 0.3, 0, 3.0, -3.4, -2.2], // -> tech
      [1.7, 0.3, 0, 6.8, -1.5, -3.4], // -> ai
    ];
    return links.map((l) => buildLineGeometry([[l[0], l[1], l[2]], [l[3], l[4], l[5]]]));
  }, []);
  return (
    <group>
      {lines.map((g, i) => (
        <lineSegments key={i} geometry={g}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.18} />
        </lineSegments>
      ))}
    </group>
  );
}

/* ---------- Ambient starfield --------------------------------------------- */

function Starfield() {
  const ref = useRef();
  const positions = usePositions(1100, 26, 1, 42);
  useFrame((_, delta) => {
    if (sceneState.staticMode) return;
    if (ref.current) ref.current.rotation.y += delta * 0.008;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- Root: camera approach + system separation on scroll ------------ */

export default function Scene3D() {
  const universe = useRef();

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    const s = sceneState;
    // camera approach driven by scroll progress
    const targetZ = 14 - s.progress * 8.5; // 14 -> ~5.5
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.position.x = 0;
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      s.progress * 0.6,
      0.05
    );
    camera.lookAt(0, 0, 0);

    if (universe.current) {
      // whole-universe slow rotation
      if (!s.staticMode) universe.current.rotation.y += 0.0009;
      // scroll adds extra rotation
      const extraRot = s.rotY;
      universe.current.rotation.y = (universe.current.rotation.y % (Math.PI * 2)) + extraRot * 0.01;
      // separation of systems
      const sep = s.separation;
      const scale = 1 + (sep - 1) * 0.8;
      universe.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[6, 4, 2]} intensity={2.4} color="#00d4ff" />
      <pointLight position={[-4, -2, 3]} intensity={2} color="#fd5c62" />
      <pointLight position={[0, 5, -3]} intensity={1.8} color="#9d4edd" />
      <pointLight position={[5, -4, -2]} intensity={1.6} color="#f7d757" />

      <group ref={universe}>
        <CoreStructure />
        <SearchSystem />
        <CreativeSystem />
        <TechSystem />
        <AiSystem />
        <Connectors />
        <Starfield />
      </group>
    </>
  );
}
