import type { Metadata } from "next";
import Link from "next/link";
import { CareerApplicationForm } from "@/components/careers/CareerApplicationForm";
import { careerApplyPath, careerJobPath, getActiveCareerJobs } from "@/lib/careers/jobs";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "./career.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Careers at D'Genius Solutions | Jobs in Khar West, Mumbai";
  const description =
    "Explore current career opportunities at D'Genius Solutions in Khar West, Mumbai across digital marketing, SEO, design, technology, content and AI-led creative work.";
  const indexable = isPublicIndexingEnabled();

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/career/") },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      url: absoluteUrl("/career/"),
      title,
      description,
      siteName: siteConfig.name,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function CareerPage() {
  const [assets, jobs] = await Promise.all([
    loadWpExtractedAssets(),
    Promise.resolve(getActiveCareerJobs()),
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Current openings at D'Genius Solutions",
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: job.title,
      url: absoluteUrl(careerJobPath(job)),
    })),
  };

  return (
    <>
      <link rel="stylesheet" href="/vendor/fluentforms/fluent-forms-public.css" />
      <link rel="stylesheet" href="/vendor/fluentforms/fluentform-public-default.css" />
      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <JsonLd id="career-list-jsonld" value={itemList} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <p className={styles.eyebrow}>Careers at D’Genius Solutions</p>
          <h1>
            Build work that <span>moves brands forward.</span>
          </h1>
          <p className={styles.intro}>
            Join our Mumbai team across digital marketing, SEO, design, technology,
            content and AI-led creative work.
          </p>
          <div className={styles.heroMeta}>
            <span>Khar West, Mumbai</span>
            <span>On-site roles</span>
            <span>{jobs.length} current opening{jobs.length === 1 ? "" : "s"}</span>
          </div>
        </section>

        <section className={styles.openings} aria-labelledby="current-openings">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Open positions</p>
              <h2 id="current-openings">Current opportunities</h2>
            </div>
            <p>
              Every active role is managed from the native DGS careers data model,
              so new openings can be published without WordPress.
            </p>
          </div>

          <div className={styles.jobGrid}>
            {jobs.map((job) => (
              <article className={styles.jobCard} key={job.slug}>
                <div className={styles.jobTop}>
                  <div>
                    <p className={styles.jobType}>
                      {job.employmentLabel} · {job.workplaceType}
                    </p>
                    <h3>{job.title}</h3>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </div>

                <p className={styles.jobSummary}>{job.summary}</p>

                <dl className={styles.jobMeta}>
                  <div>
                    <dt>Location</dt>
                    <dd>{job.location}</dd>
                  </div>
                  <div>
                    <dt>Experience</dt>
                    <dd>{job.experience}</dd>
                  </div>
                  <div>
                    <dt>Schedule</dt>
                    <dd>{job.schedule}</dd>
                  </div>
                  <div>
                    <dt>Compensation</dt>
                    <dd>{job.compensation}</dd>
                  </div>
                </dl>

                <div className={styles.cardActions}>
                  <Link href={careerJobPath(job)} className={styles.primaryLink}>
                    View job details
                  </Link>
                  <Link href={careerApplyPath(job)} className={styles.secondaryLink}>
                    Apply now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.formSection} id="career-form" aria-labelledby="apply-heading">
          <div className={styles.formIntro}>
            <p className={styles.kicker}>Apply to DGS</p>
            <h2 id="apply-heading">Send us your application</h2>
            <p>
              Choose the role, add your details and upload your CV. Applications are
              routed through our existing recruitment form backend.
            </p>
          </div>
          <div className={styles.formCard}>
            <CareerApplicationForm />
          </div>
        </section>
      </main>

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
