import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
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
  if (slug === "junior-hr-generalist") {
    permanentRedirect("/career/");
  }
  const job = await loadCareerJob(slug);
  if (!job) return {};

  const path = careerJobPath(job);
  const title = `${job.title} Job in Mumbai | D'Genius Solutions`;
  const rawDesc = `${job.summary} Apply online for this ${job.workplaceType.toLowerCase()} role in Mumbai.`;
  const description = rawDesc.length > 158 ? `${rawDesc.slice(0, 155).trim()}...` : rawDesc;
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

function buildEducationRequirements(
  education?: string,
):
  | "no requirements"
  | {
      "@type": "EducationalOccupationalCredential";
      credentialCategory:
        | "high school"
        | "associate degree"
        | "bachelor degree"
        | "postgraduate degree"
        | "professional certificate";
    } {
  if (!education) return "no requirements";
  const text = education.trim().toLowerCase();
  if (!text || /no requirement|none|any/.test(text)) {
    return "no requirements";
  }
  if (/postgraduate|master|mba|m\.tech|m\.sc|m\.a\b|pg\b/.test(text)) {
    return {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "postgraduate degree",
    };
  }
  if (/bachelor|graduate|degree|b\.tech|b\.e\b|b\.sc|b\.com|b\.a\b|bba|bmm|bca/.test(text)) {
    return {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "bachelor degree",
    };
  }
  if (/associate|diploma/.test(text)) {
    return {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "associate degree",
    };
  }
  if (/certificate|certification/.test(text)) {
    return {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "professional certificate",
    };
  }
  if (/12th|10th|high school|hsc|ssc|secondary|school/.test(text)) {
    return {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "high school",
    };
  }
  return "no requirements";
}

function buildExperienceRequirements(
  experience?: string,
):
  | "no requirements"
  | {
      "@type": "OccupationalExperienceRequirements";
      monthsOfExperience: number;
    } {
  if (!experience) return "no requirements";
  const text = experience.trim().toLowerCase();
  if (!text || /fresher|no experience|no requirement|entry[- ]level|^0\b/.test(text)) {
    return "no requirements";
  }
  const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:[–\-to]+\s*\d+(?:\.\d+)?)?\s*\+?\s*month/);
  if (monthMatch) {
    const months = Math.round(Number(monthMatch[1]));
    return months > 0
      ? {
          "@type": "OccupationalExperienceRequirements",
          monthsOfExperience: months,
        }
      : "no requirements";
  }
  const yearMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (yearMatch) {
    const years = Number(yearMatch[1]);
    const months = Math.round(years * 12);
    return months > 0
      ? {
          "@type": "OccupationalExperienceRequirements",
          monthsOfExperience: months,
        }
      : "no requirements";
  }
  return "no requirements";
}

function buildJobSchema(job: CareerJob) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.overview,
    datePosted: job.datePosted,
    validThrough: "2027-03-31T23:59:59+05:30",
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
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
    educationRequirements: buildEducationRequirements(job.education),
    experienceRequirements: buildExperienceRequirements(job.experience),
  };

  if (job.compensation && job.compensation.includes("10,000") && job.compensation.includes("15,000")) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: 10000,
        maxValue: 15000,
        unitText: "MONTH",
      },
    };
  } else {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: 15000,
        maxValue: 30000,
        unitText: "MONTH",
      },
    };
  }

  return schema;
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
  if (slug === "junior-hr-generalist") {
    permanentRedirect("/career/");
  }
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
                ...(job.education ? [["Education", job.education]] : []),
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
              {(job.overviewParagraphs && job.overviewParagraphs.length > 0
                ? job.overviewParagraphs
                : String(job.overview || "").split(/\n\n+/)
              ).map((para, idx) => (
                <p key={idx} style={idx > 0 ? { marginTop: "14px" } : undefined}>
                  {para}
                </p>
              ))}
            </section>

            {job.sections && job.sections.length > 0 ? (
              job.sections.map((sec) => (
                <section className={styles.section} key={sec.heading}>
                  <h2>{sec.heading}</h2>
                  {sec.intro ? <p style={{ marginBottom: "12px" }}>{sec.intro}</p> : null}
                  <ul>
                    {sec.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {sec.outro
                    ? sec.outro.split(/\n\n+/).map((p, i) => (
                        <p key={i} style={{ marginTop: "14px", fontWeight: i === 1 ? 600 : 400 }}>
                          {p}
                        </p>
                      ))
                    : null}
                </section>
              ))
            ) : (
              <>
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
              </>
            )}
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
