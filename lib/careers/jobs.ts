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
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  datePosted: string;
  active: boolean;
};

export const CAREER_JOBS: CareerJob[] = [
  {
    slug: "junior-hr-generalist",
    title: "Junior HR Generalist",
    summary:
      "Manage HR operations, recruitment, and employee engagement at D'Genius Solutions in Khar West, Mumbai.",
    employmentType: "FULL_TIME",
    employmentLabel: "Full-time",
    location: "Khar West, Mumbai",
    workplaceType: "On-site",
    schedule: "Monday - Friday",
    experience: "0-6 years",
    compensation: "Negotiable",
    overview:
      "As a Junior HR Executive, you'll support daily HR functions including attendance, onboarding, documentation, recruitment coordination, employee queries, and engagement activities.",
    responsibilities: [
      "Maintain and update employee attendance, leaves, and timesheets.",
      "Address employee queries, grievances, and support requests.",
      "Manage HR documentation including offer letters, ID cards, and relieving letters.",
      "Conduct background verifications and validate candidate documents.",
      "Assist with recruitment through sourcing, scheduling, and follow-ups.",
      "Oversee smooth onboarding of new employees.",
      "Plan and execute monthly employee engagement activities.",
      "Keep HR records compliant and well-organized in digital and physical formats.",
    ],
    requirements: [
      "0-6 years of experience in HR Generalist or HR Operations.",
      "Graduate or postgraduate qualification in HR, BBA, MBA, or a relevant field.",
      "Excellent verbal and written communication skills.",
      "Proficiency in MS Excel, Word, and Google Workspace.",
      "Well-organized, proactive, approachable, and people-friendly working style.",
    ],
    benefits: [
      "Collaborative culture.",
      "Career growth opportunities.",
      "Team activities and employee engagement.",
      "Prime Khar West location.",
    ],
    datePosted: "2026-09-18",
    active: true,
  },
];

export function getActiveCareerJobs() {
  return CAREER_JOBS.filter((job) => job.active);
}

export function getCareerJob(slug: string) {
  return CAREER_JOBS.find((job) => job.slug === slug && job.active);
}

export function careerJobPath(job: CareerJob) {
  return `/career/${job.slug}/`;
}

export function careerApplyPath(job: CareerJob) {
  return `/career/?position=${encodeURIComponent(job.title)}#career-form`;
}
