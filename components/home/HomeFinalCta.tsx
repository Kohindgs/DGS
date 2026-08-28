import Link from "next/link";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";
import styles from "./HomeFinalCta.module.css";

export function HomeFinalCta() {
  return (
    <section className={`${styles.section} container`} aria-labelledby="home-final-cta-heading">
      <p className={styles.eyebrow}>Ready To Fix The Gaps?</p>
      <h2 id="home-final-cta-heading">Let us audit your brand, website, search visibility and campaign flow.</h2>
      <p className={styles.lead}>
        Start with a focused growth audit from a Mumbai based digital marketing team across SEO, AEO, GEO, LLM SEO,
        website performance, content, social media, ads and creative output.
      </p>
      <PublicLeadForm id="home-growth-audit-form" route="/" />
      <Link href="/contact-us/" className={styles.cta}>
        Start With A Growth Audit →
      </Link>
    </section>
  );
}
