import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  careerApplyPath,
  careerJobPath,
  getActiveCareerJobs,
  loadCareerJob,
  type CareerJob,
} from "@/lib/careers/jobs";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { JsonLd } from "@/components/seo/JsonLd";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";
import styles from "./job.module.css";

type CareerJobPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getActiveCareerJobs().map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: CareerJobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await loadCareerJob(slug);
  if (!job) return {};

  const path = careerJobPath(job);
  const title = `${job.title} Job in Mumbai | Careers at D'Genius Solutions`;
  const description = `${job.summary} View responsibilities, requirements, workplace details and apply online.`;
  const publicIndexing = isPublicIndexingEnabled();

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: publicIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      url: absoluteUrl(path),
      title,
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function buildJobSchema(job: CareerJob) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.overview,
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url,
      logo: absoluteUrl(
        "/wp-content/uploads/2025/11/cropped-DGS-LOGO-192x192.png",
      ),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "Unit 202, Amore Edge, Swami Vivekanand Rd, Govind Dham, Khar West",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        postalCode: "400052",
        addressCountry: "IN",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "India",
    },
    directApply: true,
    url: absoluteUrl(careerJobPath(job)),
  };
}

function buildBreadcrumbSchema(job: CareerJob) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Careers",
        item: absoluteUrl("/career/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: absoluteUrl(careerJobPath(job)),
      },
    ],
  };
}

export default async function CareerJobPage({
  params,
}: CareerJobPageProps) {
  const { slug } = await params;
  const job = await loadCareerJob(slug);
  if (!job) notFound();

  const assets = await loadWpExtractedAssets();
  const applyHref = careerApplyPath(job);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <JsonLd
        id="career-job-jsonld"
        value={[buildJobSchema(job), buildBreadcrumbSchema(job)]}
      />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <div className={styles.page}>
        <main className={styles.main}>
          <Link href="/career/" className={styles.backLink}>
            ← Back to Careers
          </Link>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>
              {job.employmentLabel} · {job.workplaceType}
            </p>
            <h1 className={styles.title}>{job.title}</h1>
            <p className={styles.summary}>{job.summary}</p>

            <div className={styles.metaGrid}>
              {[
                ["Location", job.location],
                ["Experience", job.experience],
                ["Schedule", job.schedule],
                ["Compensation", job.compensation],
              ].map(([label, value]) => (
                <div className={styles.metaItem} key={label}>
                  <span className={styles.metaLabel}>{label}</span>
                  <span className={styles.metaValue}>{value}</span>
                </div>
              ))}
            </div>

            <div className={styles.applyRow}>
              <Link href={applyHref} className={styles.primaryCta}>
                Apply for this position
              </Link>
              <Link href="/career/" className={styles.secondaryCta}>
                View all openings
              </Link>
            </div>
          </section>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Overview</h2>
              <p>{job.overview}</p>
            </section>
            <section className={styles.section}>
              <h2>Key responsibilities</h2>
              <ul>
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className={styles.section}>
              <h2>Requirements</h2>
              <ul>
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className={styles.section}>
              <h2>What we offer</h2>
              <ul>
                {job.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      </div>

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />
      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215=""
        bootPortfolio=""
        bootFooter={assets.bootFooter}
        runV1215={false}
        runPortfolio={false}
      />
    </>
  );
}
