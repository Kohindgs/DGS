import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";
import styles from "./HomeFinalCta.module.css";

type HomeFinalCtaProps = {
  blocks: ContentBlock[];
};

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeFinalCta({ blocks }: HomeFinalCtaProps) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const lead = blocks.find((b) => b.type === "paragraph");

  return (
    <section className={`${styles.section} dgs-v1215-final`} id="contact-form" aria-labelledby="home-final-cta-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="home-final-cta-heading">
            {heading?.type === "heading" ? heading.text : "Let us audit your brand, website, search visibility and campaign flow."}
          </h2>
          {lead?.type === "paragraph" ? <p className={styles.lead}>{blockText(lead)}</p> : null}
        </div>
        <div className={styles.formWrap}>
          <PublicLeadForm id="home-growth-audit-form" route="/" />
          <Link href="/contact-us/" className={styles.cta}>
            Start With A Growth Audit →
          </Link>
        </div>
      </div>
    </section>
  );
}
