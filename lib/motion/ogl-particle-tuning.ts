/** Adaptive particle count and DPR caps for homepage OGL background. */

export function getParticleCount(width: number): number {
  if (width < 901) return 0;
  if (width < 1400) {
    return Math.round(350 + ((width - 901) / (1400 - 901)) * 50);
  }
  if (width < 1920) {
    return Math.round(450 + ((width - 1400) / (1920 - 1400)) * 100);
  }
  if (width < 2560) {
    return Math.round(550 + ((width - 1920) / (2560 - 1920)) * 100);
  }
  if (width < 3200) {
    return Math.round(600 + ((width - 2560) / (3200 - 2560)) * 100);
  }
  return Math.round(650 + Math.min((width - 3200) / 800, 1) * 100);
}

export function getDprCap(width: number): number {
  if (width < 1920) return 1.25;
  if (width < 2560) return 1.2;
  if (width < 3200) return 1.15;
  return 1.1;
}

export function getParticleDpr(width: number, devicePixelRatio = 1): number {
  return Math.min(devicePixelRatio, getDprCap(width));
}

export function canUseHomeWebGL(width: number, options?: { reducedMotion?: boolean; coarsePointer?: boolean }) {
  if (width < 901) return false;
  if (options?.reducedMotion) return false;
  if (options?.coarsePointer) return false;
  return true;
}
