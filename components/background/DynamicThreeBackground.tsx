"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WpThreeParticleBackground = dynamic(
  () =>
    import("@/components/background/WpThreeParticleBackground").then(
      (mod) => mod.WpThreeParticleBackground,
    ),
  { ssr: false },
);

export function DynamicThreeBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const enable = () => {
      if (disposed) return;
      setEnabled(true);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
    };

    const schedule = () => {
      timer = setTimeout(enable, 3500);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    window.addEventListener("pointerdown", enable, { passive: true, once: true });
    window.addEventListener("touchstart", enable, { passive: true, once: true });
    window.addEventListener("keydown", enable, { once: true });

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("load", schedule);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  return enabled ? <WpThreeParticleBackground /> : null;
}
