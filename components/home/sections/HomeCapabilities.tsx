import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import { WP_CAPABILITY_GROUPS } from "@/lib/wp-exact/capability-groups";
import styles from "./HomeCapabilities.module.css";

type Props = { blocks: ContentBlock[] };

function blockText(block: ContentBlock): string {
  if (block.type === "heading") return block.text;
  if (block.type === "paragraph") return block.content.map((s) => s.text).join("");
  return "";
}

export function HomeCapabilities({ blocks }: Props) {
  const heading = blocks.find((b) => b.type === "heading" && b.level === 2);
  const lead = blocks.find((b) => b.type === "paragraph" && blockText(b).length > 40);

  return (
    <section className={`${styles.section} dgs-v1215-service-clarity`} id="dgs-v1215-services">
      <div className={styles.shell}>
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>Capabilities</span>
          <h2>{heading?.type === "heading" ? heading.text : ""}</h2>
          {lead?.type === "paragraph" ? <p>{blockText(lead)}</p> : null}
        </div>
        <div className={`${styles.menu} dgs-v1215-service-menu`}>
          {WP_CAPABILITY_GROUPS.map((group) => (
            <article key={group.number} className={styles.card}>
              <span className={styles.number}>{group.number}</span>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <div className={styles.links}>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
