import logos from "@/data/migration/homepage-client-logos.generated.json";
import type { ClientLogo } from "@/components/home/ClientLogoMarquee";

type LogoRecord = {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
};

export function loadHomepageClientLogos(): ClientLogo[] {
  const records = logos.logos as LogoRecord[];
  return records.map((logo) => ({
    src: logo.src,
    alt: logo.alt,
    width: logo.width ? Number(logo.width) : undefined,
    height: logo.height ? Number(logo.height) : undefined,
  }));
}
