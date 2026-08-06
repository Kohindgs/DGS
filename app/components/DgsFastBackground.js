'use client';

/**
 * Lightweight stand-in for the WP Three.js particle field.
 * Same feel: cyan / coral / purple / white soft dots, slow orbital drift,
 * additive glow — without loading ~150KB Three.js or running WebGL.
 */
export function startDgsFastBackground(root = document.querySelector('.dgs-v1215')) {
  if (!root || root.dataset.dgsFastBg === '1') return () => {};
  root.dataset.dgsFastBg = '1';

  const canvas = document.getElementById('dgs-v1215-canvas');
  if (!canvas) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const desktop = window.matchMedia('(min-width: 901px)').matches;

  // Match WP: particles only on desktop, fine pointer, motion OK
  if (reducedMotion || coarsePointer || !desktop) {
    canvas.style.display = 'none';
    return () => {};
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  root.classList.add('v1215-webgl-ready'); // keeps fallback dimmed like WP
  canvas.style.display = 'block';

  const PALETTE = [
    [0, 212, 255], // cyan — matches THREE 0x00d4ff
    [253, 92, 98], // coral — 0xfd5c62
    [157, 78, 221], // purple — 0x9d4edd
    [255, 255, 255], // white
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let sprites = [];
  let running = false;
  let rafId = 0;
  let startTs = 0;

  function makeSprite(r, g, b) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const gctx = c.getContext('2d');
    const grad = gctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.36, `rgba(${r},${g},${b},0.82)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    gctx.fillStyle = grad;
    gctx.beginPath();
    gctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    gctx.fill();
    return c;
  }

  function seedParticles() {
    // Slightly fewer than WP (380–560) for speed; feel stays dense enough
    const count = width > 1400 ? 400 : width > 1100 ? 300 : 240;
    const next = [];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 8 + Math.random();
      const radius = 1.2 + Math.random() * 6;
      const colorIndex = Math.floor(Math.random() * PALETTE.length);
      next.push({
        x: Math.cos(angle) * radius + (Math.random() - 0.5),
        y: Math.sin(angle) * radius * 0.45 + (Math.random() - 0.5) * 3.2,
        z: (Math.random() - 0.5) * 9,
        colorIndex,
        size: 0.074, // PointsMaterial size
      });
    }
    particles = next;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (width < 901) {
      stop();
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = 'block';
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
    start();
  }

  // Perspective similar to THREE PerspectiveCamera(58, aspect, ...) at z=8.5
  // FOV is vertical in Three — use height for both axes' focal length.
  const FOV = 58 * (Math.PI / 180);
  const CAM_Z = 8.5;

  function project(p, rotY, rotX) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    let x = p.x * cosY - p.z * sinY;
    let z = p.x * sinY + p.z * cosY;
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;

    const depth = z + CAM_Z;
    if (depth <= 0.25) return null;
    const focal = height / (2 * Math.tan(FOV / 2));
    const scale = focal / depth;
    return {
      sx: width / 2 + x * scale,
      sy: height / 2 - y * scale,
      // PointsMaterial size 0.074 world units → ~px at this depth
      size: Math.max(2.2, 0.074 * scale * 1.15),
      alpha: Math.min(0.95, 0.4 + 2.8 / depth),
    };
  }

  function frame(ts) {
    if (!running) return;
    if (!startTs) startTs = ts;
    const time = (ts - startTs) / 1000;

    // Match Three: rotation.y = time*0.022, rotation.x = sin(time*0.22)*0.035
    const rotY = time * 0.022;
    const rotX = Math.sin(time * 0.22) * 0.035;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const proj = project(p, rotY, rotX);
      if (!proj) continue;
      const s = proj.size;
      ctx.globalAlpha = proj.alpha * 0.86;
      ctx.drawImage(sprites[p.colorIndex], proj.sx - s / 2, proj.sy - s / 2, s, s);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    startTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else if (width >= 901) start();
  }

  sprites = PALETTE.map(([r, g, b]) => makeSprite(r, g, b));
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stop();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    delete root.dataset.dgsFastBg;
  };
}
