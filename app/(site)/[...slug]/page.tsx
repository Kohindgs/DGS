import { notFound } from "next/navigation";
import { Metadata } from "next";
import { loadRouteRegistry, getRouteByPath } from "@/lib/nextjs/routes";
import { loadContentBlocks } from "@/lib/nextjs/content-blocks";
import type { ContentBlock, HeadingBlock } from "@/lib/content/types";
import { slugToPath } from "@/lib/nextjs/path";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { SemanticContent } from "@/components/content/SemanticContent";
import { assertProtectedRouteSearchPolicy } from "@/lib/migration/search-policy";
import { buildRouteSchemas } from "@/lib/schema/page-schemas";
import { resolvePageH1 } from "@/lib/migration/page-h1";
import { getRetiredRoute } from "@/lib/migration/retired-routes";
import { getRouteDecision, shouldExcludeFromStaticGeneration } from "@/lib/migration/route-decisions";
import { PublicLeadForm } from "@/components/forms/PublicLeadForm";
import Link from "next/link";
import { applyRankingLinkRestorations } from "@/lib/migration/ranking-link-restorations";
import { applyTechnicalLinkCorrections } from "@/lib/migration/technical-link-corrections";

export async function generateStaticParams() {
  const { routes } = await loadRouteRegistry();
  return routes
    .filter((r) => r.proposedAction === "KEEP_SAME_URL" || r.proposedAction === "PROTECTED")
    .filter((r) => r.path !== "/")
    .filter((r) => !getRetiredRoute(r.path))
    .filter((r) => !shouldExcludeFromStaticGeneration(r.path))
    .map((r) => ({ slug: r.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = slugToPath(slug || []);
  const route = await getRouteByPath(path);

  if (!route) {
    return { title: "Not Found" };
  }

  const decision = getRouteDecision(path);
  const title = route.title || "Page";
  const description = route.description || "";
  const canonicalFromRoute = route.desiredCanonicalPath || route.canonical || path;
  const canonicalPath = decision?.canonicalPath || canonicalFromRoute;

  return buildPageMetadata({
    title,
    description,
    path,
    canonicalPath: canonicalPath.startsWith("http")
      ? new URL(canonicalPath).pathname
      : canonicalPath,
    indexable: decision?.indexable ?? route.indexable,
    metadataReview: !description,
  });
}

export default async function DynamicPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const path = slugToPath(slug || []);
  const route = await getRouteByPath(path);

  if (!route) {
    notFound();
  }

  if (!route) {
    notFound();
  }

  if (route.protected) {
    assertProtectedRouteSearchPolicy({
      path: route.path,
      canonicalPath: route.desiredCanonicalPath || route.canonical || route.path,
      indexable: route.indexable,
      includeInSitemap: route.includeInSitemap,
    });
  }

  const blocks = (await loadContentBlocks())[path]?.blocks || [];
  const restoredBlocks = applyTechnicalLinkCorrections(
    path,
    applyRankingLinkRestorations(path, blocks),
  );
  const breadcrumbs = buildBreadcrumbs(path, route);
  const schemaBlocks = buildRouteSchemas({ route, path, blocks: restoredBlocks, breadcrumbs });

  const pageH1 = resolvePageH1(route, restoredBlocks);
  const isH1 = (b: ContentBlock): b is HeadingBlock => b.type === "heading" && b.level === 1;
  const isDuplicateHeading = (b: ContentBlock): b is HeadingBlock =>
    b.type === "heading" && b.text.trim() === pageH1.trim();
  const contentBlocks = restoredBlocks.filter((b) => !isH1(b) && !isDuplicateHeading(b));
  const showContactForm = path === "/contact-us/";

  return (
    <main className="page-main" id="main-content">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="page-breadcrumbs">
          <ol>
            {breadcrumbs.map((item, i) => (
              <li key={item.path}>
                {i > 0 && <span className="page-breadcrumbs__sep">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.path}>{item.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <article data-migration-content data-wordpress-id={route.wordpressId}>
        <div className="container readable-copy">
          <h1>{pageH1}</h1>
        </div>
        <div className="container semantic-content-wrap">
          <SemanticContent blocks={contentBlocks} demoteSecondaryHeadings />
        </div>
        {showContactForm ? (
          <section className="container contact-form-section" aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="visually-hidden">
              Contact form
            </h2>
            <PublicLeadForm id="dgContact" route="/contact-us/" />
          </section>
        ) : null}
      </article>

      <JsonLd id="page-jsonld" value={schemaBlocks} />
    </main>
  );
}

function buildBreadcrumbs(path: string, route: { path: string; wordpressType: string; title: string | null }) {
  const segments = path.split("/").filter(Boolean);
  const crumbs = [{ name: "Home", path: "/" }];

  if (route.wordpressType === "service" && segments[0] === "services") {
    crumbs.push({ name: "Services", path: "/our-services/" });
    crumbs.push({ name: route.title || "Service", path });
  } else if (route.wordpressType === "post" && segments[0] === "blogs") {
    crumbs.push({ name: "Blogs", path: "/blogs/" });
    crumbs.push({ name: route.title || "Post", path });
  } else if (path === "/") {
    return [];
  } else {
    let built = "";
    for (let i = 0; i < segments.length; i++) {
      built += "/" + segments[i];
      const name = segments[i].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ name, path: built + "/" });
    }
  }

  return crumbs;
}
