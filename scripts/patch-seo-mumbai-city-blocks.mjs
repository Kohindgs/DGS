#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const ROUTE = "/services/seo-services-in-mumbai/";
const FILE = "data/wordpress/blocks/content-blocks.generated.json";

const cities = [
  {
    label: "01 / Pune↗",
    href: "/services/seo-service-pune/",
    title: "SEO Services in Pune",
    id: "seo-services-in-pune",
    description:
      "Organic visibility, local discovery, technical fixes, and content improvements for Pune businesses targeting ready-to-contact customers.",
    tag: "Pune SearchLocal Leads",
  },
  {
    label: "02 / Bangalore↗",
    href: "/services/seo-service-in-banglore/",
    title: "SEO Services in Bangalore",
    id: "seo-services-in-bangalore",
    description:
      "Search strategy for Bangalore companies, startups, and service brands that need better visibility and stronger website enquiries.",
    tag: "Bangalore GrowthOrganic Leads",
  },
  {
    label: "03 / Hyderabad↗",
    href: "/services/seo-services-in-hyderabad/",
    title: "SEO Services in Hyderabad",
    id: "seo-services-in-hyderabad",
    description:
      "Website optimization, local search improvements, and ranking support for Hyderabad businesses competing online.",
    tag: "Hyderabad SearchLead Quality",
  },
  {
    label: "04 / Gurugram↗",
    href: "/services/seo-service-in-gurugram/",
    title: "SEO Services in Gurugram",
    id: "seo-services-in-gurugram",
    description:
      "Search growth campaigns for Gurugram businesses focused on visibility, trust, traffic quality, and better enquiries.",
    tag: "Gurugram GrowthSearch Leads",
  },
];

function cityBlocks(city) {
  return [
    {
      type: "paragraph",
      content: [{ text: city.label, href: city.href }],
    },
    {
      type: "heading",
      level: 3,
      text: city.title,
      id: city.id,
      href: city.href,
    },
    {
      type: "paragraph",
      content: [{ text: city.description }],
    },
    {
      type: "paragraph",
      content: [{ text: city.tag, href: city.href }],
    },
  ];
}

const raw = JSON.parse(await readFile(FILE, "utf8"));
const blocks = raw.blocks[ROUTE].blocks;
const start = blocks.findIndex((b) => b.type === "heading" && b.id === "seo-services-across-major-indian-cities");
if (start < 0) throw new Error("city section heading not found");
const introIndex = start + 1;
let end = introIndex + 1;
while (end < blocks.length && !(blocks[end].type === "heading" && blocks[end].level === 2)) {
  end++;
}
const replacement = cities.flatMap((city) => cityBlocks(city));
raw.blocks[ROUTE].blocks = [...blocks.slice(0, introIndex + 1), ...replacement, ...blocks.slice(end)];
await writeFile(FILE, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
console.log(`Patched ${ROUTE} city blocks (${replacement.length} blocks inserted)`);
