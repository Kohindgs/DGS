import Link from "next/link";
import type { RichTextSpan } from "@/lib/content/types";

export function RichText({ content }: { content: RichTextSpan[] }) {
  return content.map((span, index) => {
    let node: React.ReactNode = span.text;
    if (span.strong) node = <strong>{node}</strong>;
    if (span.emphasis) node = <em>{node}</em>;

    if (span.href) {
      const internal = span.href.startsWith("/") && !span.href.startsWith("//");
      node = internal ? (
        <Link href={span.href}>{node}</Link>
      ) : (
        <a href={span.href}>{node}</a>
      );
    }

    return <span key={`${index}-${span.text.slice(0, 20)}`}>{node}</span>;
  });
}
