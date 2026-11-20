export type CreativeRequirementType =
  | "none"
  | "portfolio_required"
  | "showreel_required"
  | "work_samples_required"
  | "portfolio_or_showreel_required"
  | "custom";

export type CreativeRequirementConfig = {
  type: CreativeRequirementType;
  label: string;
  helperText: string;
  required: boolean;
  allowUrl: boolean;
  allowFileUpload: boolean;
  allowedFileTypes: string[];
  maxFileSizeBytes: number;
  urlOrFileRule: boolean;
};

export type CareerJobSection = {
  heading: string;
  intro?: string;
  items: string[];
  outro?: string;
};

export type CareerJob = {
  slug: string;
  title: string;
  summary: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
  employmentLabel: string;
  location: string;
  workplaceType: string;
  schedule: string;
  experience: string;
  compensation: string;
  education?: string;
  overview: string;
  overviewParagraphs?: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  sections?: CareerJobSection[];
  datePosted: string;
  active: boolean;
  creativeRequirements?: CreativeRequirementConfig;
};

export const CAREER_JOBS: CareerJob[] = [
  {
    slug: "junior-seo-executive",
    title: "Junior SEO Executive (SEO & AI Tools)",
    summary:
      "D’Genius Solutions is hiring a Junior SEO Executive with knowledge of On-Page SEO, Off-Page SEO, Keyword Research, Technical SEO, Content SEO and Link Building, along with AI tools (ChatGPT, Gemini, Claude) and emerging areas such as AEO, GEO and LLM SEO.",
    employmentType: "FULL_TIME",
    employmentLabel: "Full-time, Permanent",
    location: "Khar West, Mumbai",
    workplaceType: "Work From Office",
    schedule: "Monday - Saturday",
    experience: "0–2 Years (Freshers Welcome)",
    compensation: "As per industry standards",
    overview:
      "D’Genius Solutions is hiring a Junior SEO Executive with knowledge of SEO and AI tools.\n\nWe are looking for someone with a strong understanding of On-Page SEO, Off-Page SEO, Keyword Research, Technical SEO, Content SEO and Link Building, along with an interest in emerging areas such as AEO, GEO and LLM SEO.\n\nThe ideal candidate should be comfortable using AI tools such as ChatGPT, Gemini or Claude for research, content optimisation, keyword analysis and SEO workflows.\n\nFreshers with strong practical SEO knowledge, relevant internships or hands-on project experience may also apply.",
    overviewParagraphs: [
      "D’Genius Solutions is hiring a Junior SEO Executive with knowledge of SEO and AI tools.",
      "We are looking for someone with a strong understanding of On-Page SEO, Off-Page SEO, Keyword Research, Technical SEO, Content SEO and Link Building, along with an interest in emerging areas such as AEO, GEO and LLM SEO.",
      "The ideal candidate should be comfortable using AI tools such as ChatGPT, Gemini or Claude for research, content optimisation, keyword analysis and SEO workflows.",
      "Freshers with strong practical SEO knowledge, relevant internships or hands-on project experience may also apply.",
    ],
    responsibilities: [
      "Perform keyword research and search intent analysis.",
      "Work on On-Page SEO for websites and landing pages.",
      "Optimise meta titles, meta descriptions, headings, URLs and internal links.",
      "Assist with Technical SEO audits.",
      "Identify crawling, indexing, duplicate content, broken link and site-speed issues.",
      "Work on Off-Page SEO and link-building activities.",
      "Conduct competitor and keyword gap analysis.",
      "Optimise website content and blogs for SEO.",
      "Coordinate with content writers for SEO-friendly content.",
      "Monitor website performance using Google Search Console and GA4.",
      "Track keyword rankings, traffic, impressions, clicks and CTR.",
      "Assist with Local SEO activities.",
      "Prepare regular SEO reports and recommendations.",
      "Stay updated with Google algorithm changes and SEO trends.",
      "Use AI tools (ChatGPT, Gemini, Claude or similar) for keyword research, keyword clustering, search intent analysis, content ideas, content briefs, competitor research, FAQ generation and content optimisation.",
      "Review and improve AI-generated content instead of using raw AI output, and fact-check AI-generated information before publishing.",
      "Assist in optimising content for traditional search as well as AI-powered search (AEO, GEO and LLM SEO / AI Search Optimisation).",
      "Help improve content for semantic search, topical authority and entity relevance.",
    ],
    requirements: [
      "0–2 years of SEO experience (Freshers with relevant SEO internship or project experience can apply).",
      "Good understanding of basic SEO concepts: On-Page SEO, Off-Page SEO, Keyword Research, Link Building, Technical SEO, Content SEO and Search Intent Analysis.",
      "Proficiency with Google Search Console, Google Analytics 4 and basic SEO reporting.",
      "Strong research and analytical skills with a basic understanding of website structure.",
      "Good written English and content evaluation skills with strong attention to detail.",
      "Comfortable using AI tools (ChatGPT, Gemini, Claude) for research, AI-assisted content research and blog/website content optimisation.",
      "Ability to identify poor-quality or inaccurate AI-generated content.",
      "Preferred tools knowledge: SEMrush, Ahrefs, Screaming Frog, Google Keyword Planner, Google Trends, WordPress, PageSpeed Insights, ChatGPT, Gemini and Claude.",
      "Good to have: Experience on live SEO projects, basic WordPress & HTML knowledge, schema markup, familiarity with AEO/GEO/LLM SEO, and prompt workflows for SEO research.",
      "Willingness to learn new SEO and AI-search techniques.",
      "Ability to work from our Khar West, Mumbai office.",
    ],
    benefits: [
      "Hands-on exposure to On-Page and Off-Page SEO, Technical SEO, Content SEO and SEO Analytics.",
      "Direct experience with AI-assisted SEO workflows, AEO (Answer Engine Optimisation), GEO (Generative Engine Optimisation), LLM SEO and AI Search Optimisation.",
      "Work on multi-industry SEO strategy for leading brands from our Khar West, Mumbai office.",
      "Build a career not only in traditional SEO, but also in the rapidly evolving world of AI-powered search and digital discovery.",
    ],
    sections: [
      {
        heading: "Key Responsibilities",
        items: [
          "Perform keyword research and search intent analysis.",
          "Work on On-Page SEO for websites and landing pages.",
          "Optimise meta titles, meta descriptions, headings, URLs and internal links.",
          "Assist with Technical SEO audits.",
          "Identify crawling, indexing, duplicate content, broken link and site-speed issues.",
          "Work on Off-Page SEO and link-building activities.",
          "Conduct competitor and keyword gap analysis.",
          "Optimise website content and blogs for SEO.",
          "Coordinate with content writers for SEO-friendly content.",
          "Monitor website performance using Google Search Console and GA4.",
          "Track keyword rankings, traffic, impressions, clicks and CTR.",
          "Assist with Local SEO activities.",
          "Prepare regular SEO reports and recommendations.",
          "Stay updated with Google algorithm changes and SEO trends.",
        ],
      },
      {
        heading: "AI & Modern Search Responsibilities",
        items: [
          "Use AI tools for SEO research and productivity.",
          "Use ChatGPT, Gemini, Claude or similar tools for: Keyword research, Keyword clustering, Search intent analysis, Content ideas, Content briefs, Competitor research, FAQ generation, and Content optimisation.",
          "Review and improve AI-generated content instead of using raw AI output.",
          "Fact-check AI-generated information before publishing.",
          "Assist in optimising content for traditional search as well as AI-powered search.",
          "Learn and work on AEO – Answer Engine Optimisation.",
          "Learn and work on GEO – Generative Engine Optimisation.",
          "Understand the basics of LLM SEO / AI Search Optimisation.",
          "Help improve content for semantic search, topical authority and entity relevance.",
        ],
      },
      {
        heading: "Required Skills",
        items: [
          "On-Page SEO",
          "Off-Page SEO",
          "Keyword Research",
          "Link Building",
          "Technical SEO",
          "Content SEO",
          "Search Intent Analysis",
          "Google Search Console",
          "Google Analytics 4",
          "Basic SEO Reporting",
          "AI-assisted Content Research",
          "Blog and Website Content Optimisation",
        ],
      },
      {
        heading: "Preferred Tools",
        intro: "Knowledge of some of the following tools is preferred:",
        items: [
          "Google Search Console",
          "Google Analytics 4",
          "SEMrush",
          "Ahrefs",
          "Screaming Frog",
          "Google Keyword Planner",
          "Google Trends",
          "WordPress",
          "PageSpeed Insights",
          "ChatGPT",
          "Gemini",
          "Claude",
        ],
      },
      {
        heading: "Candidate Requirements",
        items: [
          "0–2 years of SEO experience.",
          "Freshers with relevant SEO internship or project experience can apply.",
          "Good understanding of basic SEO concepts.",
          "Strong research and analytical skills.",
          "Basic understanding of website structure.",
          "Good written English and content evaluation skills.",
          "Comfortable using AI tools for research and SEO tasks.",
          "Ability to identify poor-quality or inaccurate AI-generated content.",
          "Strong attention to detail.",
          "Willingness to learn new SEO and AI-search techniques.",
          "Ability to work from our Khar West, Mumbai office.",
        ],
      },
      {
        heading: "Good To Have",
        items: [
          "Experience working on live SEO projects.",
          "Experience optimising blogs or website content.",
          "Basic WordPress knowledge.",
          "Basic understanding of HTML.",
          "Knowledge of schema markup.",
          "Familiarity with AEO, GEO or LLM SEO.",
          "Experience using prompts for SEO research and content workflows.",
        ],
      },
      {
        heading: "Why Join D’Genius Solutions?",
        intro: "You will get hands-on exposure to:",
        items: [
          "On-Page and Off-Page SEO",
          "Technical SEO",
          "Content SEO",
          "SEO Analytics",
          "AI-assisted SEO workflows",
          "AEO (Answer Engine Optimisation)",
          "GEO (Generative Engine Optimisation)",
          "LLM SEO",
          "AI Search Optimisation",
          "SEO strategy across multiple industries",
        ],
        outro:
          "We are looking for someone who wants to build a career not only in traditional SEO, but also in the rapidly evolving world of AI-powered search and digital discovery.\n\nApply with your updated resume and details of any SEO projects, internships, websites, blogs or AI tools you have worked with.",
      },
    ],
    datePosted: "2026-11-11",
    active: true,
  },
  {
    slug: "generative-ai-artist",
    title: "Generative AI Artist",
    summary:
      "Generate high-impact AI images, concept art, storyboards, and AI-powered video sequences for social campaigns, advertisements, and client brand productions at D'Genius Solutions in Khar West, Mumbai.",
    employmentType: "FULL_TIME",
    employmentLabel: "Full-time, Permanent",
    location: "Khar West, Mumbai",
    workplaceType: "Work From Office",
    schedule: "Monday - Saturday",
    experience: "1–2 Years",
    compensation: "₹10,000 – ₹15,000 per month",
    education: "12th Pass",
    overview:
      "D’Genius Solutions is looking for a creative Generative AI Artist with hands-on experience using AI-powered image and video-generation platforms. The candidate will work with the creative, social media, video, and marketing teams to generate high-quality images and AI-generated videos for social media, advertisements, websites, blogs, thumbnails, campaigns, storyboards, reels, and AI video production projects. The role requires strong prompt-writing skills, visual understanding, attention to detail, and the ability to generate consistent images and videos based on scripts, references, storyboards, and creative briefs.",
    responsibilities: [
      "Generate high-quality images using multiple AI image-generation platforms.",
      "Create AI-generated videos using AI video-generation platforms.",
      "Write, test and improve AI prompts for image and video generation.",
      "Convert scripts and storyboards into scene-wise AI visuals and videos.",
      "Generate realistic people, AI avatars, products, environments, backgrounds and campaign visuals.",
      "Create AI video sequences with suitable camera movement, framing, lighting, expressions and visual continuity.",
      "Maintain consistency in characters, clothing, facial features, locations, lighting and visual style.",
      "Use Google Flow and other AI video-generation tools.",
      "Generate content for: 1:1, 4:5, 9:16, 16:9, 2:3 aspect ratios.",
      "Create visuals/videos for reels, advertisements, social campaigns, explainers, websites and presentations.",
      "Regenerate and modify content according to client/internal feedback.",
      "Experiment with prompts, styles, camera angles, compositions and motion.",
      "Research new AI image/video platforms.",
      "Maintain organised project folders, prompts, references, images and video assets.",
      "Coordinate with designers, editors, content writers and marketing teams.",
      "Ensure brand guideline compliance.",
    ],
    requirements: [
      "1–2 years relevant experience.",
      "Minimum education: 12th Pass.",
      "Prompt engineering for image and video generation.",
      "Experience with tools such as ChatGPT Image Generation, Midjourney, Adobe Firefly, Leonardo AI, Ideogram, Gemini, Google Flow, or equivalent platforms.",
      "Hands-on AI video-generation experience.",
      "Ability to convert scripts and concepts into visual sequences.",
      "Realistic and brand-relevant generation.",
      "Understanding of composition, lighting, perspective, colour, camera angles, and visual storytelling.",
      "Character and scene consistency across scenes and angles.",
      "Social-media formats and aspect ratios (1:1, 4:5, 9:16, 16:9, 2:3).",
      "Reference-image following and strong attention to visual errors.",
      "Ability to manage multiple projects simultaneously.",
      "Portfolio of AI-generated images and/or videos is MANDATORY.",
      "Candidate must be comfortable completing a practical AI image/video generation test.",
      "Work From Office — Khar West, Mumbai.",
    ],
    benefits: [
      "Collaborative creative agency culture working on leading Mumbai and international brands.",
      "Direct hands-on experience on state-of-the-art AI video production projects.",
      "Rapid career progression and portfolio-building opportunities.",
      "Prime Khar West, Mumbai office location.",
    ],
    datePosted: "2026-09-22",
    active: true,
    creativeRequirements: {
      type: "portfolio_required",
      label: "PORTFOLIO",
      helperText: "Please provide examples of your AI-generated image and/or AI-generated video work.",
      required: true,
      allowUrl: true,
      allowFileUpload: true,
      allowedFileTypes: [".pdf"],
      maxFileSizeBytes: 15 * 1024 * 1024,
      urlOrFileRule: true,
    },
  },
];

export function getActiveCareerJobs() {
  return CAREER_JOBS.filter((job) => job.active);
}

export function getCareerJob(slug: string) {
  return CAREER_JOBS.find((job) => job.slug === slug && job.active);
}

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseCreativeRequirements(value: unknown): CreativeRequirementConfig | undefined {
  if (!value) return undefined;
  if (typeof value === "object") return value as CreativeRequirementConfig;
  try {
    const parsed = JSON.parse(String(value));
    return typeof parsed === "object" && parsed !== null ? (parsed as CreativeRequirementConfig) : undefined;
  } catch {
    return undefined;
  }
}

export async function loadActiveCareerJobs(): Promise<CareerJob[]> {
  try {
    const { listCmsCareerJobs } = await import("@/lib/cms/careers");
    const rows = await listCmsCareerJobs(true);
    if (!rows.length) return getActiveCareerJobs();
    return rows.map((row) => {
      const staticMatch = CAREER_JOBS.find((j) => j.slug === row.slug);
      return {
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        employmentType: row.employment_type as CareerJob["employmentType"],
        employmentLabel: row.employment_label,
        location: row.location,
        workplaceType: row.workplace_type,
        schedule: row.schedule,
        experience: row.experience,
        compensation: row.compensation,
        education: row.slug === "generative-ai-artist" ? "12th Pass" : staticMatch?.education,
        overview: row.overview,
        overviewParagraphs: staticMatch?.overviewParagraphs,
        responsibilities: parseList(row.responsibilities),
        requirements: parseList(row.requirements),
        benefits: parseList(row.benefits),
        sections: staticMatch?.sections,
        datePosted: row.date_posted,
        active: Boolean(row.active),
        creativeRequirements:
          parseCreativeRequirements(row.creative_requirements) ||
          staticMatch?.creativeRequirements,
      };
    });
  } catch (err) {
    return getActiveCareerJobs();
  }
}

export async function loadCareerJob(slug: string): Promise<CareerJob | undefined> {
  return (await loadActiveCareerJobs()).find((job) => job.slug === slug);
}

export function careerJobPath(job: CareerJob) {
  return `/career/${job.slug}/`;
}

export function careerApplyPath(job: CareerJob) {
  return `/career/?position=${encodeURIComponent(job.title)}#career-form`;
}
