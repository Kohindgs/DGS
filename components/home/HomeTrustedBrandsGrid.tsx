import Image from "next/image";
import type { ClientLogo } from "@/components/home/ClientLogoMarquee";
import styles from "./HomeTrustedBrandsGrid.module.css";

type Props = {
  logos: ClientLogo[];
};

export function HomeTrustedBrandsGrid({ logos }: Props) {
  return (
    <div className={`${styles.marquee} dgs-v1215-logo-marquee`}>
      <div className={`${styles.track} dgs-v1215-logo-track`}>
        {logos.map((logo, index) => (
          <div key={`${logo.alt}-${index}`} className={`${styles.tile} dgs-v1215-logo-tile`}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 175}
              height={logo.height ?? 72}
              sizes="175px"
              className={styles.logo}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
