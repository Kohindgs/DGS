import Image from "next/image";
import Link from "next/link";
import type { ContentBlock } from "@/lib/content/types";
import { RichText } from "./RichText";
import { RouteFormBlock } from "@/components/forms/RouteFormBlock";

type SemanticContentProps = {
  blocks: ContentBlock[];
  demoteSecondaryHeadings?: boolean;
  route?: string;
};

export function SemanticContent({
  blocks,
  demoteSecondaryHeadings = false,
  route,
}: SemanticContentProps) {
  return (
    <div className="semantic-content">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "paragraph":
            return (
              <p key={key}>
                <RichText content={block.content} />
              </p>
            );
          case "heading": {
            const level = demoteSecondaryHeadings && block.level === 1 ? 2 : block.level;
            if (level === 1) return null;
            const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
            return (
              <Tag key={key} id={block.id}>
                {block.href ? <Link href={block.href}>{block.text}</Link> : block.text}
              </Tag>
            );
          }
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    <RichText content={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "image":
            return (
              <figure key={key}>
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={block.width ?? 16}
                  height={block.height ?? 9}
                  preload={block.preload === true}
                  loading={block.preload ? undefined : "lazy"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1920px) 50vw, 960px"
                />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={key}>
                <p>{block.text}</p>
                {block.cite ? <cite>{block.cite}</cite> : null}
              </blockquote>
            );
          case "faq":
            return (
              <section key={key} aria-label="Frequently asked questions">
                {block.items.map((item, itemIndex) => (
                  <details key={`${key}-${itemIndex}`}>
                    <summary>{item.question}</summary>
                    <p>
                      <RichText content={item.answer} />
                    </p>
                  </details>
                ))}
              </section>
            );
          case "video":
            return (
              <figure key={key}>
                <video
                  controls
                  preload="metadata"
                  poster={block.poster}
                  width={block.width}
                  height={block.height}
                  aria-label={block.title}
                >
                  <source src={block.src} />
                </video>
              </figure>
            );
          case "embed":
            return (
              <figure key={key}>
                <iframe
                  src={block.src}
                  title={block.title}
                  width={block.width}
                  height={block.height}
                  allowFullScreen
                />
              </figure>
            );
          case "form":
            return (
              <div key={key} data-migration-form data-wordpress-form={block.wordpressForm}>
                {route ? (
                  <RouteFormBlock route={route} />
                ) : (
                  block.inputs.map((input, i) => (
                    <div
                      key={i}
                      data-migration-field={input.name || input.type || `field-${i}`}
                      data-required={input.required ? "true" : "false"}
                    />
                  ))
                )}
              </div>
            );
          case "table":
            return (
              <figure key={key} className="semantic-table">
                <table>
                  {block.headers.length > 0 && (
                    <thead>
                      <tr>
                        {block.headers.map((header, i) => (
                          <th key={i}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {block.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            );
          default: {
            const exhaustive: never = block;
            return exhaustive;
          }
        }
      })}
    </div>
  );
}
