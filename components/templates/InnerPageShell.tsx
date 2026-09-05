/**
 * Invented Phase 3B inner-page chrome. Not used on live routes.
 * Inner pages render WordPress markup via InnerWpMirrorPage instead.
 * Retained only as a reference for the rejected shared Next.js shell.
 */
import type { ReactNode } from "react";
import type { ContentBlock } from "@/lib/content/types";
import type { RouteRecord } from "@/lib/nextjs/routes";
import type { BreadcrumbItem } from "@/lib/schema/builders";
import { SemanticContent } from "@/components/content/SemanticContent";
import { ListingAwareContent } from "@/components/content/ListingAwareContent";
import { FluentLeadForm } from "@/components/forms/FluentLeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatDisplayDate, type RelatedPost } from "@/lib/content/related-posts";
import type { FormDefinition } from "@/lib/forms/types";
import type { InnerPageVariant } from "@/lib/navigation/page-breadcrumbs";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { PageCtaBand } from "./PageCtaBand";
import { RelatedPosts } from "./RelatedPosts";

type InnerPageShellProps = {
  route: RouteRecord;
  path: string;
  pageH1: string;
  variant: InnerPageVariant;
  breadcrumbs: BreadcrumbItem[];
  contentBlocks: ContentBlock[];
  schemaBlocks: Record<string, unknown>[];
  relatedPosts?: RelatedPost[];
  contactFormDefinition?: FormDefinition | null;
  afterContent?: ReactNode;
  hrefByTitle?: Record<string, string>;
};

function variantClass(variant: InnerPageVariant) {
  if (variant === "blog-archive" || variant === "listing") return "inner-page--listing";
  return `inner-page--${variant}`;
}

export function InnerPageShell({
  route,
  path,
  pageH1,
  variant,
  breadcrumbs,
  contentBlocks,
  schemaBlocks,
  relatedPosts = [],
  contactFormDefinition = null,
  afterContent,
  hrefByTitle = {},
}: InnerPageShellProps) {
  const published = formatDisplayDate(route.date);
  const updated = formatDisplayDate(route.modified);
  const showBlogMeta = variant === "blog" && (published || updated);
  const showCta = variant !== "contact";
  const useListingLayout = variant === "blog-archive" || variant === "listing";

  return (
    <main className={`page-main inner-page ${variantClass(variant)}`} id="main-content">
      <PageBreadcrumbs items={breadcrumbs} />

      <article data-migration-content data-wordpress-id={route.wordpressId}>
        <header className="inner-hero">
          <div className="container readable-copy">
            {variant === "service" ? <p className="inner-hero__eyebrow">Services</p> : null}
            {variant === "blog" ? <p className="inner-hero__eyebrow">Insights</p> : null}
            {variant === "career" ? <p className="inner-hero__eyebrow">Careers</p> : null}
            <h1>{pageH1}</h1>
            {showBlogMeta ? (
              <p className="inner-hero__meta">
                {published ? <time dateTime={route.date || undefined}>Published {published}</time> : null}
                {published && updated && updated !== published ? <span aria-hidden="true"> · </span> : null}
                {updated && updated !== published ? (
                  <time dateTime={route.modified || undefined}>Updated {updated}</time>
                ) : null}
                <span aria-hidden="true"> · </span>
                <span>D&apos;Genius Solutions</span>
              </p>
            ) : null}
          </div>
        </header>

        <div className="container semantic-content-wrap">
          {useListingLayout ? (
            <ListingAwareContent blocks={contentBlocks} route={path} hrefByTitle={hrefByTitle} />
          ) : (
            <SemanticContent blocks={contentBlocks} demoteSecondaryHeadings route={path} />
          )}
        </div>

        {variant === "contact" && contactFormDefinition ? (
          <section className="container contact-form-section" aria-labelledby="contact-form-heading">
            <h2 id="contact-form-heading" className="visually-hidden">
              Contact form
            </h2>
            <FluentLeadForm id="dgContact" route="/contact-us/" definition={contactFormDefinition} />
          </section>
        ) : null}

        {afterContent}
      </article>

      {variant === "blog" ? <RelatedPosts posts={relatedPosts} /> : null}
      {showCta ? <PageCtaBand /> : null}

      <JsonLd id="page-jsonld" value={schemaBlocks} />
    </main>
  );
}
