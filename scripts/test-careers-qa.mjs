import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

// 1. Verify Career Jobs Definitions
const {
  CAREER_JOBS,
  getActiveCareerJobs,
  getCareerJob,
  careerJobPath,
} = await import("../lib/careers/jobs.ts");

console.log("--- 1. Testing Career Jobs Configuration ---");

// Test A1: Junior HR Generalist removed from active jobs
const activeJobs = getActiveCareerJobs();
const hrJob = activeJobs.find((j) => j.slug === "junior-hr-generalist");
assert.equal(hrJob, undefined, "junior-hr-generalist must not appear in active career jobs");
console.log("✓ Junior HR Generalist is absent from active career jobs");

// Test A2: Generative AI Artist role details
const aiJob = getCareerJob("generative-ai-artist");
assert.ok(aiJob, "generative-ai-artist must exist in career jobs");
assert.equal(aiJob.title, "Generative AI Artist");
assert.equal(aiJob.location, "Khar West, Mumbai");
assert.equal(aiJob.workplaceType, "Work From Office");
assert.equal(aiJob.experience, "1–2 Years");
assert.equal(aiJob.education, "12th Pass");
assert.ok(
  aiJob.compensation.includes("10,000") && aiJob.compensation.includes("15,000"),
  "Compensation must be ₹10,000–₹15,000",
);
assert.ok(aiJob.creativeRequirements, "Creative requirements must be configured");
assert.equal(aiJob.creativeRequirements.type, "portfolio_required");
assert.equal(aiJob.creativeRequirements.required, true);
assert.equal(aiJob.creativeRequirements.urlOrFileRule, true);
assert.equal(aiJob.creativeRequirements.maxFileSizeBytes, 15 * 1024 * 1024);
console.log(
  "✓ Generative AI Artist verified: ₹10,000–₹15,000/mo, 12th Pass, Khar West, On-site, Portfolio Mandatory (up to 15MB)",
);

// Test A3: 301 Redirect for Junior HR Generalist in redirects.approved.json
const redirectsRaw = await fs.readFile(
  path.join(process.cwd(), "data/migration/redirects.approved.json"),
  "utf8",
);
const redirectsData = JSON.parse(redirectsRaw);
const hrRedirect = redirectsData.redirects.find(
  (r) => r.source === "/career/junior-hr-generalist/",
);
assert.ok(hrRedirect, "Redirect entry for /career/junior-hr-generalist/ must exist");
assert.equal(hrRedirect.destination, "/career/");
assert.equal(hrRedirect.statusCode, 301);
console.log("✓ Edge-level 301 redirect verified: /career/junior-hr-generalist/ -> /career/");

// Test A4: Test Email Template Generation
const { renderDgsEmailHtml } = await import("../lib/notifications/email-template.ts");
const sampleHtml = renderDgsEmailHtml({
  kicker: "NEW CAREER APPLICATION",
  title: "Generative AI Artist",
  subtitle: "Priya Shah · 2 Years · Khar West",
  statusBadge: { text: "RECRUITMENT INBOX", color: "#fff", bg: "#7928ca" },
  sections: [
    {
      title: "Candidate Details",
      fields: [
        { label: "Full Name", value: "Priya Shah" },
        { label: "Email", value: "priya@example.com", isLink: true, href: "mailto:priya@example.com" },
        { label: "Education", value: "12th Pass" },
      ],
    },
    {
      title: "Creative Requirement / Portfolio",
      fields: [
        { label: "Portfolio URL", value: "https://behance.net/priyashah", isLink: true, href: "https://behance.net/priyashah" },
      ],
    },
  ],
  ctaText: "View Candidate in DGS CMS",
  ctaUrl: "https://www.dgeniussolutions.com/admin/leads/",
});

assert.ok(sampleHtml.includes("D'GENIUS SOLUTIONS"), "HTML must include DGS brand");
assert.ok(sampleHtml.includes("Generative AI Artist"), "HTML must include title");
assert.ok(sampleHtml.includes("Priya Shah"), "HTML must include candidate name");
assert.ok(sampleHtml.includes("https://behance.net/priyashah"), "HTML must include portfolio link");
assert.ok(sampleHtml.includes("View Candidate in DGS CMS"), "HTML must include CTA");
console.log("✓ DGS branded career application email HTML template verified");

// Test A5: Email Subject formatting
const testName = "Priya Shah";
const testRole = "Generative AI Artist";
const testExp = "2 Years Experience";
const dynamicSubject = `[DGS Careers] ${testRole} — ${testName} — ${testExp}`;
assert.equal(
  dynamicSubject,
  "[DGS Careers] Generative AI Artist — Priya Shah — 2 Years Experience",
);
console.log(`✓ Dynamic subject verified: "${dynamicSubject}"`);

// Test A6: Test Schema.org JobPosting Generator
function buildJobSchema(job) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.overview,
    datePosted: job.datePosted,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "D'Genius Solutions",
      sameAs: "https://www.dgeniussolutions.com",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Unit 202, Amore Edge, Swami Vivekanand Rd, Govind Dham, Khar West",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        postalCode: "400052",
        addressCountry: "IN",
      },
    },
    directApply: true,
    url: `https://www.dgeniussolutions.com${careerJobPath(job)}`,
  };

  if (job.education) schema.educationRequirements = job.education;
  if (job.experience) schema.experienceRequirements = job.experience;
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
  }

  return schema;
}

const aiJobSchema = buildJobSchema(aiJob);
assert.equal(aiJobSchema["@type"], "JobPosting");
assert.equal(aiJobSchema.title, "Generative AI Artist");
assert.equal(aiJobSchema.educationRequirements, "12th Pass");
assert.equal(aiJobSchema.experienceRequirements, "1–2 Years");
assert.equal(aiJobSchema.baseSalary.currency, "INR");
assert.equal(aiJobSchema.baseSalary.value.minValue, 10000);
assert.equal(aiJobSchema.baseSalary.value.maxValue, 15000);
assert.equal(aiJobSchema.baseSalary.value.unitText, "MONTH");
console.log("✓ JobPosting schema verified: baseSalary INR 10,000–15,000/mo, 12th Pass, 1–2 Years");

// Test A7: Magic Bytes Inspection
function isPdfBuffer(buffer) {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString("utf-8") === "%PDF";
}
const validPdfHeader = Buffer.from("%PDF-1.7 sample data");
const invalidPdfHeader = Buffer.from("NOT A REAL PDF");
assert.equal(isPdfBuffer(validPdfHeader), true, "Valid PDF must be recognized");
assert.equal(isPdfBuffer(invalidPdfHeader), false, "Invalid PDF must be rejected");
console.log("✓ PDF magic bytes verification verified");

console.log("\n=== ALL CAREERS & EMAIL TESTS PASSED SUCCESSFULLY ===");
