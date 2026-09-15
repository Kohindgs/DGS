"use client";

import dynamic from "next/dynamic";

const WpThreeParticleBackground = dynamic(
  () =>
    import("@/components/background/WpThreeParticleBackground").then(
      (mod) => mod.WpThreeParticleBackground,
    ),
  { ssr: false },
);

export function DynamicThreeBackground() {
  return <WpThreeParticleBackground />;
}
