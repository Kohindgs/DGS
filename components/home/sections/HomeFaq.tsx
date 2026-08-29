import type { FaqBlock, RichTextSpan } from "@/lib/content/types";
import styles from "./HomeFaq.module.css";

type Props = { blocks: FaqBlock[] };

function renderAnswer(answer: RichTextSpan[]) {
  return answer.map((span) => span.text).join("");
}

export function HomeFaq({ blocks }: Props) {
  const faq = blocks[0];
  if (!faq) return null;

  return (
    <section className={styles.section} id="dgs-v1215-faq" data-reveal>
      <div className={styles.inner}>
        <h2>Questions Brands Ask Before Choosing A Digital Marketing Agency</h2>
        <div className={styles.list}>
          {faq.items.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary>{item.question}</summary>
              <div className={styles.answer}>
                <p>{renderAnswer(item.answer)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
