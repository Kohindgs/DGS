// Shared mutable state bridging the GSAP scroll timeline (Hero) and the WebGL
// scene (Scene3D). Updated imperatively by ScrollTrigger onUpdate; read each
// frame inside useFrame. Values are plain numbers so there is no React re-render.
export const sceneState = {
  // 0 = hero resting, 1 = fully travelled through the universe
  progress: 0,
  // applied to camera (moves toward/through the structure)
  cameraZ: 14,
  // systems separate as progress grows
  separation: 1,
  // Search region dominates the foreground at end of transition
  searchDominant: 0,
  // whole-universe rotation offset added by scroll
  rotY: 0,
  // muted idle (reduced motion)
  staticMode: false,
};
