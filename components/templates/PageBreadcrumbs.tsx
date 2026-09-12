import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/schema/builders";

export function PageBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="page-breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={`${item.path}-${item.name}`}>
            {i > 0 && <span className="page-breadcrumbs__sep">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.path}>{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
