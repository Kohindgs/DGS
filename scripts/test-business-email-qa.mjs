import assert from "node:assert/strict";

console.log("--- Testing Business Lead Email Experience ---");

const { renderDgsEmailHtml } = await import("../lib/notifications/email-template.ts");

// Test B1: Business Lead Template Rendering
const sampleLeadHtml = renderDgsEmailHtml({
  kicker: "NEW BUSINESS LEAD",
  title: "SEO Audit Request",
  subtitle: "Rahul Mehta · ABC Pvt Ltd · /services/seo-services-in-mumbai/",
  statusBadge: {
    text: "NEW LEAD",
    color: "#ffffff",
    bg: "#10b981",
  },
  sections: [
    {
      title: "Lead Overview",
      fields: [
        { label: "Form Title", value: "SEO Audit Request", isBadge: true, badgeColor: "#4f46e5" },
        { label: "Submitted From Page", value: "/services/seo-services-in-mumbai/", isLink: true, href: "https://www.dgeniussolutions.com/services/seo-services-in-mumbai/" },
        { label: "Contact Name", value: "Rahul Mehta" },
        { label: "Email Address", value: "rahul@abcpvtltd.com", isLink: true, href: "mailto:rahul@abcpvtltd.com" },
        { label: "Phone Number", value: "+91 98200 12345", isLink: true, href: "tel:+919820012345" },
        { label: "Company / Website", value: "ABC Pvt Ltd" },
      ],
    },
    {
      title: "Submitted Form Data",
      fields: [
        { label: "Target Website", value: "https://abcpvtltd.com" },
        { label: "Current Monthly Traffic", value: "10,000 - 50,000" },
        { label: "Primary Objective", value: "Lead generation & organic growth" },
      ],
    },
  ],
  ctaText: "View Lead in DGS CMS",
  ctaUrl: "https://www.dgeniussolutions.com/admin/leads/",
  note: "Submitted through native DGS form submission system. Stored in MySQL CMS Leads table.",
});

assert.ok(sampleLeadHtml.includes("D'GENIUS SOLUTIONS"), "Must contain DGS branding");
assert.ok(sampleLeadHtml.includes("NEW BUSINESS LEAD"), "Must contain kicker");
assert.ok(sampleLeadHtml.includes("SEO Audit Request"), "Must contain form title");
assert.ok(sampleLeadHtml.includes("Rahul Mehta"), "Must contain contact name");
assert.ok(sampleLeadHtml.includes("ABC Pvt Ltd"), "Must contain company name");
assert.ok(sampleLeadHtml.includes("View Lead in DGS CMS"), "Must contain CTA");
console.log("✓ Business lead notification HTML template verified");

// Test B2: Dynamic Subject formatting
function buildLeadSubject(formTitle, submitterName, company) {
  const companySnippet = company ? ` — ${company}` : "";
  const nameSnippet = submitterName && submitterName !== "New Lead" ? ` — ${submitterName}` : "";
  return `[DGS Lead] ${formTitle}${nameSnippet}${companySnippet}`;
}

const subjectWithCompany = buildLeadSubject("SEO Audit", "Rahul Mehta", "ABC Pvt Ltd");
assert.equal(subjectWithCompany, "[DGS Lead] SEO Audit — Rahul Mehta — ABC Pvt Ltd");
console.log(`✓ Subject with company: "${subjectWithCompany}"`);

const subjectWithoutCompany = buildLeadSubject("Quick Consultation", "Priya Nair", "");
assert.equal(subjectWithoutCompany, "[DGS Lead] Quick Consultation — Priya Nair");
console.log(`✓ Subject without company: "${subjectWithoutCompany}"`);

console.log("\n=== ALL BUSINESS EMAIL TESTS PASSED SUCCESSFULLY ===");
