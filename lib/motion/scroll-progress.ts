/** Shared scroll progress for decorative WebGL — no React state updates per frame. */
export const scrollProgress = {
  target: 0,
  current: 0,
  velocity: 0,
};

export function resetScrollProgress() {
  scrollProgress.target = 0;
  scrollProgress.current = 0;
  scrollProgress.velocity = 0;
}

export function interpolateScrollProgress(smoothing = 0.08) {
  const previous = scrollProgress.current;
  scrollProgress.current += (scrollProgress.target - scrollProgress.current) * smoothing;
  scrollProgress.velocity = scrollProgress.current - previous;
  return scrollProgress.current;
}
