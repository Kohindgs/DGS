"use client";

import Image from "next/image";
import styles from "./ClientLogoMarquee.module.css";

export type ClientLogo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type ClientLogoMarqueeProps = {
  logos: ClientLogo[];
};

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 64;

export function ClientLogoMarquee({ logos }: ClientLogoMarqueeProps) {
  if (!logos.length) return null;

  const track = [...logos, ...logos];

  return (
    <section className={styles.section} aria-labelledby="client-logo-marquee-heading">
      <div className="container">
        <h2 id="client-logo-marquee-heading" className={styles.heading}>
          Trusted by brands across finance, retail, education, healthcare, consumer and technology categories.
        </h2>
      </div>

      <div className={styles.viewport} aria-hidden={false}>
        <div className={styles.track}>
          {track.map((logo, index) => (
            <div key={`${logo.alt}-${index}`} className={styles.item}>
              <Image
                src={logo.src}
                alt={index < logos.length ? logo.alt : ""}
                width={logo.width ?? DEFAULT_WIDTH}
                height={logo.height ?? DEFAULT_HEIGHT}
                loading={index < 8 ? "eager" : "lazy"}
                sizes="(max-width: 768px) 120px, 160px"
                className={styles.logo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
