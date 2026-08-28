import Link from "next/link";
import type { JsonLdValue } from "@/lib/schema/jsonld";
import type { MigratedPageRecord } from "@/lib/content/types";
import { assertProtectedRouteSearchPolicy } from "@/lib/migration/search-policy";
import { JsonLd } from "@/components/seo/JsonLd";
import { SemanticContent } from "./SemanticContent";

export function MigratedPage({
  record,
  jsonLd,
}: {
  record: MigratedPageRecord;
  jsonLd?: JsonLdValue;
}) {
  assertProtectedRouteSearchPolicy({
    path: record.path,
    canonicalPath: record.canonicalPath,
    indexable: record.indexable,
    includeInSitemap: record.includeInSitemap,
  });

  return (
    <main>
      {record.breadcrumbs.length ? (
        <nav aria-label="Breadcrumb">
          <ol>
            {record.breadcrumbs.map((item) => (
              <li key={`${item.path}-${item.name}`}>
                <Link href={item.path}>{item.name}</Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <article data-migration-content data-wordpress-id={record.wordpressId}>
        <h1>{record.h1}</h1>
        <SemanticContent blocks={record.blocks} />
      </article>

      {jsonLd ? <JsonLd id="page-jsonld" value={jsonLd} /> : null}
    </main>
  );
}
