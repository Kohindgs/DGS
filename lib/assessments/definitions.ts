import "server-only";

export type AssessmentQuestion =
  | { id:string; type:"mcq"; prompt:string; options:string[]; correctIndex:number }
  | { id:string; type:"short"; prompt:string; minWords?:number }
  | { id:string; type:"long"; prompt:string; minWords?:number };

export type AssessmentDefinition = {
  key:"seo-executive"|"seo-manager";
  slug:string;
  title:string;
  summary:string;
  durationMinutes:number;
  questions:AssessmentQuestion[];
};

const executiveQuestions: AssessmentQuestion[] = [
  { id:"mcq1", type:"mcq", prompt:"Which is primarily an on-page SEO factor?", options:["Optimizing meta descriptions","Building backlinks","Directory submissions","Social sharing"], correctIndex:0 },
  { id:"mcq2", type:"mcq", prompt:"Which is an off-page SEO activity?", options:["Improving page speed","Creating XML sitemap","Guest posting on a relevant site","Optimizing image alt text"], correctIndex:2 },
  { id:"mcq3", type:"mcq", prompt:"What is the primary purpose of keyword research?", options:["Choose social post topics","Identify search terms people use","Plan ad creatives","Choose website colours"], correctIndex:1 },
  { id:"mcq4", type:"mcq", prompt:"Which Google tool reports search performance, indexing and crawl issues?", options:["Google Ads","Google Analytics","Google Search Console","Google Business Profile"], correctIndex:2 },
  { id:"mcq5", type:"mcq", prompt:"What does HTTP 404 usually mean?", options:["Temporary outage","Permanent redirect","Server overload","Requested page not found"], correctIndex:3 },

  { id:"mcq6", type:"mcq", prompt:"Which tool is well known for backlink analysis?", options:["Ahrefs","Excel","PageSpeed Insights","Google Trends"], correctIndex:0 },
  { id:"mcq7", type:"mcq", prompt:"Why is image alt text useful?", options:["It compresses images","It improves accessibility and image understanding","It creates backlinks","It removes duplicate content"], correctIndex:1 },
  { id:"mcq8", type:"mcq", prompt:"Which file gives crawl directives to search engine bots?", options:["sitemap.xml","robots.txt","manifest.json","ads.txt"], correctIndex:1 },
  { id:"mcq9", type:"mcq", prompt:"What is a canonical tag used for?", options:["Block JavaScript","Indicate a preferred URL version","Measure Core Web Vitals","Add schema automatically"], correctIndex:1 },
  { id:"mcq10", type:"mcq", prompt:"Which is a Core Web Vital?", options:["CTR","LCP","Domain Rating","CPC"], correctIndex:1 },
  { id:"short1", type:"short", prompt:"Explain the difference between on-page and off-page SEO, with one example of each.", minWords:40 },
  { id:"short2", type:"short", prompt:"How would you use AI tools to improve an SEO content workflow without blindly publishing AI output?", minWords:50 },
  { id:"short3", type:"short", prompt:"What are Core Web Vitals and why do they matter?", minWords:50 },
  { id:"long1", type:"long", prompt:"Outline an SEO plan for a new e-commerce site, covering keyword research, on-page, technical SEO, content, AEO/GEO and measurement.", minWords:150 },
];

const managerQuestions: AssessmentQuestion[] = [
  { id:"mcq1", type:"mcq", prompt:"A large site loses indexed pages after a template release. What should you check first?", options:["Social engagement","Indexability, canonicals, robots and rendering","Brand colours","Email open rates"], correctIndex:1 },
  { id:"mcq2", type:"mcq", prompt:"Which metric best helps diagnose organic landing-page visibility changes?", options:["Search impressions and clicks by page/query","Newsletter subscribers","Paid CPC","Follower growth"], correctIndex:0 },
  { id:"mcq3", type:"mcq", prompt:"For a migration, the strongest SEO safeguard is:", options:["Changing all URLs","Mapping redirects and validating canonicals/internal links","Removing old sitemaps immediately","Blocking crawlers during launch"], correctIndex:1 },
  { id:"mcq4", type:"mcq", prompt:"What is the best approach to duplicate pages targeting the same intent?", options:["Create more duplicates","Consolidate intent and canonical/internal-link signals","Noindex every page","Add more keywords"], correctIndex:1 },

  { id:"mcq5", type:"mcq", prompt:"A page ranks for many queries but CTR drops sharply. What should you inspect first?", options:["Title/snippet changes and SERP intent","Employee attendance","Invoice volume","Instagram followers"], correctIndex:0 },
  { id:"mcq6", type:"mcq", prompt:"Which is the safest way to handle faceted navigation at scale?", options:["Index every URL","Use a deliberate crawl/indexation strategy based on search value","Block the entire site","Delete all filters"], correctIndex:1 },
  { id:"mcq7", type:"mcq", prompt:"What is the main purpose of structured data?", options:["Guarantee rankings","Help machines understand eligible page entities/content","Replace HTML","Increase ad bids"], correctIndex:1 },
  { id:"mcq8", type:"mcq", prompt:"For AEO/GEO, the strongest foundation is:", options:["Unverifiable AI copy","Clear factual answers, entity consistency and authoritative evidence","Hidden keywords","Only social posts"], correctIndex:1 },
  { id:"mcq9", type:"mcq", prompt:"Which action best supports SEO prioritisation?", options:["Fix everything equally","Prioritise by impact, confidence and effort with measurement","Only chase traffic volume","Avoid baselines"], correctIndex:1 },
  { id:"mcq10", type:"mcq", prompt:"A canonical points from page A to page B. What does it communicate?", options:["A is preferred","B is the preferred representative URL","Both are blocked","A is redirected"], correctIndex:1 },
  { id:"short1", type:"short", prompt:"A client's organic traffic drops 35% week-on-week. Describe your first diagnostic sequence.", minWords:80 },
  { id:"short2", type:"short", prompt:"How would you build an SEO, AEO, GEO and LLM-search measurement framework for a client?", minWords:100 },
  { id:"short3", type:"short", prompt:"How would you review and improve the work of a junior SEO executive?", minWords:80 },
  { id:"long1", type:"long", prompt:"Create a 90-day recovery and growth plan for an established website affected by a major search visibility decline. Include technical, content, authority, AI-search visibility, reporting and team execution.", minWords:220 },
];

export const ASSESSMENTS: AssessmentDefinition[] = [
  {
    key:"seo-executive",
    slug:"seo-executive-assessment",
    title:"SEO Executive Assessment",
    summary:"Job-relevant SEO knowledge and practical reasoning assessment for SEO Executive candidates.",
    durationMinutes:60,
    questions:executiveQuestions,
  },
  {
    key:"seo-manager",
    slug:"seo-manager-assessment",
    title:"SEO Manager Assessment",
    summary:"Advanced SEO strategy, diagnosis, leadership and search visibility assessment for SEO Manager candidates.",
    durationMinutes:75,
    questions:managerQuestions,
  },
];

export function getAssessmentBySlug(slug:string) {
  return ASSESSMENTS.find((item)=>item.slug===slug);
}

export function getAssessmentByKey(key:string) {
  return ASSESSMENTS.find((item)=>item.key===key);
}

export function getPublicQuestions(definition:AssessmentDefinition) {
  return definition.questions.map((question)=>{
    if (question.type !== "mcq") return question;
    const { correctIndex: _correctIndex, ...publicQuestion } = question;
    return publicQuestion;
  });
}
