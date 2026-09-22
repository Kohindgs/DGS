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
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  active: boolean;
  creativeRequirements?: CreativeRequirementConfig;
};

export const CAREER_JOBS: CareerJob[] = [
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
  const { listCmsCareerJobs } = await import("@/lib/cms/careers");
  const rows = await listCmsCareerJobs(true);
  if (!rows.length) return getActiveCareerJobs();
  return rows.map((row) => ({
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
    education: row.slug === "generative-ai-artist" ? "12th Pass" : undefined,
    overview: row.overview,
    responsibilities: parseList(row.responsibilities),
    requirements: parseList(row.requirements),
    benefits: parseList(row.benefits),
    datePosted: row.date_posted,
    active: Boolean(row.active),
    creativeRequirements:
      parseCreativeRequirements(row.creative_requirements) ||
      CAREER_JOBS.find((j) => j.slug === row.slug)?.creativeRequirements,
  }));
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
