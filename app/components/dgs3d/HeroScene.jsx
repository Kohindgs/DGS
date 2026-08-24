"use client";

import { Component, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene3D from "./Scene3D";
import { canUseWebGL, prefersReducedMotion } from "../../lib/webgl";
import { sceneState } from "../../lib/sceneState";

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — fall back to static scene */
  }
  render() {
    if (this.state.failed) return this.props.fallback || null;
    return this.props.children;
  }
}

function StaticScene() {
  return <div className="dgs-hero-fallback" aria-hidden="true" />;
}

export default function HeroScene() {
  const [ok] = useState(() => canUseWebGL());

  useEffect(() => {
    sceneState.staticMode = prefersReducedMotion();
  }, []);

  if (!ok) {
    return (
      <SceneErrorBoundary fallback={<StaticScene />}>
        <StaticScene />
      </SceneErrorBoundary>
    );
  }

  return (
    <SceneErrorBoundary fallback={<StaticScene />}>
      <Canvas
        className="dgs-canvas"
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 120 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene3D />
      </Canvas>
    </SceneErrorBoundary>
  );
}
