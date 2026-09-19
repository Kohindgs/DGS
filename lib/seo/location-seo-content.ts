type LocationSeoCopy = {
  overview: string;
  visibility: string;
  localFramework: string;
  serviceContent: string;
  complexServices: string;
  aiSearch: string;
  whyAudit: string;
  whyLocal: string;
  chooseAgency: string;
  closing: string;
  faqScope: string;
  faqLocal: string;
  faqWhy: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceParagraphStarting(html: string, start: string, replacement: string): string {
  const pattern = new RegExp(`(<p\\b[^>]*>)${escapeRegExp(start)}[\\s\\S]*?(<\\/p>)`, "i");
  return html.replace(pattern, `$1${replacement}$2`);
}

const LOCATION_COPY: Record<string, LocationSeoCopy> = {  "/services/seo-service-pune/": {
    overview: "Pune search demand is unusually mixed: technology and business services compete alongside engineering and automotive companies, education brands, real estate businesses and neighbourhood-led services. That means a useful Pune SEO strategy cannot rely on one city keyword. We map commercial searches by service, buyer stage and the areas a business can genuinely serve, then decide whether the right asset is a core service page, an industry page, a location page or supporting content. For businesses operating around Hinjawadi, Kharadi, Baner, Wakad, Viman Nagar and Pimpri-Chinchwad, the goal is to build enough relevance for local discovery without creating repetitive doorway-style pages.",
    visibility: "For Pune businesses, valuable visibility often spans more than one search pattern: a B2B buyer comparing specialist providers, a local customer looking for a nearby service, or a decision-maker researching a complex solution before making contact. We prioritise the query groups that can realistically lead to enquiries, not vanity positions with little commercial value.",
    localFramework: "Our Pune local SEO work connects Google Business Profile signals with accurate business information, review quality, locally relevant service content and strong conversion paths. We use area references only where they help a real customer understand coverage; we do not manufacture dozens of thin pages simply to repeat Hinjawadi, Baner, Kharadi, Wakad or Pimpri-Chinchwad keywords.",
    serviceContent: "Pune buyers often need different levels of information depending on the category. A manufacturing or engineering prospect may need capabilities, specifications and proof; a SaaS or IT buyer may compare use cases and integrations; an education or real-estate prospect may search by course, project, locality or decision stage. We build service and supporting content around those journeys rather than publishing generic blogs for volume.",
    complexServices: "For B2B, engineering, technology and professional-service companies in Pune, organic demand is rarely created by one landing page. We structure solution, industry, use-case and comparison content so technical evaluators and commercial decision-makers can find the right information at different stages of a longer sales cycle.",
    aiSearch: "Pune companies increasingly need their expertise to be understandable beyond conventional blue-link results. We organise direct answers, entity information, evidence, internal links and source-worthy service content so the same strong SEO foundation can support Google AI Overviews and other AI-assisted discovery without treating AI visibility as a replacement for search fundamentals.",
    whyAudit: "We begin with evidence. For a Pune site that may mean fixing JavaScript rendering, crawl waste, duplicate location pages, slow templates, weak service architecture or pages that target the wrong buyer intent. We prioritise the issues most likely to affect discovery and enquiries before recommending more content or authority work.",
    whyLocal: "Local strategy is matched to the business model. A Baner clinic, a Kharadi B2B firm and a Pimpri-Chinchwad industrial supplier should not receive the same local SEO plan. We align profiles, reviews, citations, service areas, location content and internal links with the places and services the business can genuinely fulfil.",
    chooseAgency: "When evaluating an SEO company for Pune, look for a team that can explain how it will compete in your specific market rather than presenting a standard city template. Ask how technical fixes will be implemented, how service and location intent will be separated, what evidence will be reported and how organic enquiries will be distinguished from raw traffic growth.",
    closing: "A strong Pune search presence should make it easier for the right customer to understand what you do, where you operate and why your business is credible. We connect technical health, locally relevant content, authority, internal linking and conversion measurement so growth is built around useful discovery rather than city-name repetition.",
    faqScope: "Professional SEO services in Pune should cover technical SEO, search-intent mapping, important service pages, local visibility, useful supporting content, authority development and conversion tracking. The mix should change for an IT company, industrial supplier, education brand, real-estate business or local service provider rather than following one fixed package.",
    faqLocal: "Yes. For businesses that depend on Pune-area demand, DGS can improve Google Business Profile quality, local landing-page relevance, citations, review signals and conversion tracking. We only recommend additional area pages when each page serves a real audience and contains genuinely useful information.",
    faqWhy: "DGS combines SEO strategy with implementation capability across common web stacks, plus AEO, GEO and LLM SEO expertise. For Pune businesses, the emphasis is on technical depth, commercially useful content, honest local targeting and measurable enquiry paths while preserving the same evidence-led standards used in our published client work.",
  },  "/services/seo-service-in-banglore/": {
    overview: "Bengaluru has a dense mix of SaaS, software, startups, enterprise technology, biotechnology, aerospace, electronics, manufacturing and consumer businesses. Search competition therefore extends well beyond local-map visibility. A company may be competing with Bengaluru firms, national specialists and global product brands for the same buyer. DGS structures SEO around that reality: clear solution architecture, technical performance, product and use-case intent, credible expertise and strong internal relationships between service, industry and educational content. We use both Bengaluru and Bangalore language naturally where it reflects how customers actually search, without creating duplicate pages for spelling variants.",
    visibility: "High-value Bengaluru searches frequently involve knowledgeable buyers comparing several credible options. We focus on queries where expertise, product fit, technical capability or commercial intent can be demonstrated on the landing page, rather than relying on broad traffic terms that attract researchers with no realistic path to conversion.",
    localFramework: "Local SEO in Bengaluru needs to reflect how the business actually operates. A company serving Whitefield, Electronic City, Koramangala, Indiranagar, the Outer Ring Road corridor or Peenya may have very different customer journeys. We connect genuine location relevance, Google Business Profile quality, reviews and service coverage without creating thin micro-location pages that compete with each other.",
    serviceContent: "For SaaS and technology companies, we build search journeys around solutions, features, integrations, use cases, alternatives and comparison intent. For biotechnology, aerospace, electronics, manufacturing and professional services, content must communicate technical capability and trust clearly enough for a specialist buyer. This makes the page architecture useful to people first while giving search engines stronger topical context.",
    complexServices: "Bengaluru B2B search often supports a multi-touch sales process. We map early research, problem-aware searches, solution evaluation and vendor-comparison intent to distinct pages, then connect those pages with internal links and proof. The objective is not simply more sessions; it is a discoverable information system that helps qualified prospects move toward a demo, consultation or sales conversation.",
    aiSearch: "Technology-led buyers are also using AI-assisted research to compare vendors and understand complex categories. We strengthen machine-readable context through concise answers, consistent entities, evidence, structured page relationships and source-worthy explanations, while keeping technical SEO and crawlable content as the foundation for both conventional and AI search.",
    whyAudit: "Bengaluru websites often grow quickly as products, features, industries and campaigns expand. That can create duplicate pages, orphaned content, JavaScript rendering issues, weak canonical signals or overlapping keyword targets. Our first step is to identify which structural problems are suppressing valuable pages before increasing publishing volume.",
    whyLocal: "We distinguish between companies that need Bengaluru local discovery and companies headquartered in the city but selling nationally or globally. A local service business may need Maps, reviews and neighbourhood relevance; a SaaS company may need international solution visibility. The strategy follows the revenue model rather than forcing every Bengaluru company into the same local SEO template.",
    chooseAgency: "A Bengaluru SEO partner should be able to work with sophisticated products and competitive search categories without reducing the strategy to backlinks and blog counts. Ask how they handle JavaScript sites, product or solution architecture, cannibalisation, conversion attribution and AI-search visibility, and whether the team can implement recommendations instead of only delivering audits.",
    closing: "For Bengaluru businesses, sustainable organic growth comes from making complex expertise easy to discover and evaluate. DGS connects technical SEO, solution architecture, useful content, authority signals and measurement so qualified buyers can find the right page whether they begin with Google, Maps or an AI-assisted research journey.",
    faqScope: "SEO services in Bangalore should be designed around the company's sales model. SaaS and technology brands may need solution, integration, comparison and international search architecture; local businesses may need stronger Maps and area relevance; manufacturers and specialist B2B firms may need technical service and industry content. Technical SEO and conversion measurement support all of these layers.",
    faqLocal: "Yes. DGS can run local SEO for Bengaluru businesses that depend on city or neighbourhood demand, including profile optimisation, reviews, citations and useful location content. We can also separate that local strategy from national or international SEO when a Bengaluru-based company sells beyond the city.",
    faqWhy: "DGS combines technical implementation, search strategy and AI-search capabilities rather than treating SEO as a publishing checklist. For Bengaluru companies, that is useful when websites include modern JavaScript frameworks, complex service architectures, multiple audiences or long B2B decision journeys. Existing client proof remains the evidence base; we do not manufacture local client claims.",
  },  "/services/seo-service-in-gurugram/": {
    overview: "Gurugram sits inside the NCR business market, with strong enterprise, IT and ITeS, BPO, automotive, professional-services, real-estate and corporate demand. Search behaviour reflects that mix: some buyers want a nearby provider, while others are procurement teams or senior decision-makers comparing specialist partners across Delhi NCR and India. DGS builds the page architecture around those different journeys and uses both Gurugram and Gurgaon terminology naturally where users still search with the older city name. The aim is to earn relevance without creating duplicate Gurgaon/Gurugram doorway pages.",
    visibility: "Commercial visibility in Gurugram often depends on being credible for high-intent service searches and detailed B2B evaluation at the same time. We prioritise searches that can lead to consultations, enterprise enquiries and qualified local demand instead of optimising for broad volumes that do not match the sales process.",
    localFramework: "For businesses serving Cyber City, Udyog Vihar, Golf Course Road, Sohna Road, Manesar and the wider NCR, local signals need to match real coverage. We improve profile quality, reviews, citations, service and location relevance, then connect those signals to landing pages that explain the offer clearly. We avoid cloning area pages simply to capture every neighbourhood name.",
    serviceContent: "Enterprise and B2B buyers in Gurugram usually expect more than a short service description. We develop content around capabilities, industries, use cases, decision criteria, implementation questions and proof so procurement teams and business leaders can evaluate fit. Local-service and real-estate journeys are handled differently, with stronger emphasis on location, availability and enquiry intent.",
    complexServices: "Gurugram's concentration of corporate offices, IT/ITeS companies and industrial businesses creates longer consideration cycles for many categories. We connect solution pages, industry pages, case evidence and comparison content so search can support research before a buyer is ready to speak with sales, while maintaining clear conversion routes for high-intent visitors.",
    aiSearch: "Enterprise research increasingly happens across search engines and AI assistants. We make important service information easy to parse through direct answers, consistent entities, structured headings, credible evidence and strong internal linking. This improves machine understanding while preserving the technical and authority signals required for sustainable organic search performance.",
    whyAudit: "Our Gurugram campaigns start by separating structural problems from competitive gaps. We check crawl and indexing, overlapping Gurgaon/Gurugram targeting, service architecture, JavaScript rendering, internal links, conversion tracking and content depth before prescribing new pages. That prevents activity from being spent on symptoms while higher-impact issues remain unresolved.",
    whyLocal: "A Gurugram local business, an NCR-wide service provider and an enterprise vendor headquartered in Cyber City need different search strategies. We decide where Maps visibility, city relevance, Delhi NCR coverage or national B2B content should lead, then keep those intents clearly separated so pages reinforce rather than cannibalise each other.",
    chooseAgency: "When choosing an SEO company for Gurugram, ask how the agency will handle NCR competition, Gurgaon/Gurugram query variants and the difference between local leads and enterprise research. A useful proposal should identify technical priorities, commercial page gaps, authority needs and measurement methods instead of offering the same backlink-and-blog package to every company.",
    closing: "A stronger Gurugram search presence should help local customers and enterprise buyers reach the right information without confusion. DGS connects technical health, commercial page architecture, local and NCR relevance, authority and enquiry measurement so organic visibility supports the way the business actually sells.",
    faqScope: "SEO services in Gurugram should reflect whether a company sells locally, across Delhi NCR or nationally. A complete scope can include technical SEO, service and industry architecture, Gurgaon/Gurugram keyword mapping, local SEO, authority work, supporting content and conversion tracking, with priorities based on the website and sales cycle.",
    faqLocal: "Yes. DGS can improve Gurugram local discovery through Google Business Profile optimisation, reviews, citations, location relevance and useful service-area content. We also account for Gurgaon search terminology where it is genuinely used, without creating duplicate versions of the same page.",
    faqWhy: "DGS combines SEO, website implementation and AI-search expertise with evidence from existing client campaigns. For Gurugram businesses, we focus on clear commercial intent, NCR competition, technical execution and lead quality. We keep the approved client proof unchanged and do not imply that those clients are Gurugram-based unless that is independently true.",
  },  "/services/seo-services-in-hyderabad/": {
    overview: "Hyderabad combines a major IT and software economy with life sciences, pharmaceuticals, biotechnology, healthcare, real estate, education and fast-growing professional services. Search strategy therefore has to support very different trust and decision patterns. A SaaS buyer may compare features and implementation depth, a life-sciences prospect may need technically accurate evidence, while a local service customer may care most about proximity and reviews. DGS maps those journeys separately and builds service, industry and location relevance around the real commercial model instead of relying on one generic Hyderabad keyword set.",
    visibility: "Useful Hyderabad visibility means appearing for the searches that match real expertise and buying intent. We separate local-service demand from B2B, technology and specialist-industry research, then strengthen the pages that can genuinely answer those needs and lead to a qualified enquiry.",
    localFramework: "For businesses serving HITEC City, Gachibowli, Madhapur, Kondapur, Banjara Hills, Jubilee Hills and Secunderabad, local SEO should connect accurate profile information, reviews, citations, service coverage and useful landing pages. We use locality signals where they help customers make a decision, not as an excuse to duplicate the same page across dozens of neighbourhoods.",
    serviceContent: "Hyderabad's technology and life-sciences sectors reward content that is specific, technically credible and easy to verify. We build service and industry pages around buyer questions, capabilities, use cases and decision criteria. For real estate, education and local services, the architecture shifts toward project, course, locality and high-intent enquiry searches while maintaining clear internal relationships between pages.",
    complexServices: "For SaaS, IT, pharma, life-sciences and other specialist B2B companies, a search visit may be only one step in a longer evaluation. We connect solution pages, industry expertise, evidence, technical explanations and comparison content so organic search can support research as well as direct lead generation.",
    aiSearch: "Clear entity information and evidence are especially important in technical and regulated categories. We structure concise answers, service facts, proof, internal links and machine-readable context so search engines and AI systems can understand what the business does without replacing careful SEO with speculative AI-only tactics.",
    whyAudit: "We start Hyderabad campaigns by finding the structural issue that matters most: crawl and indexing problems, weak service architecture, overlapping pages, slow or JavaScript-heavy templates, poor internal linking, thin technical explanations or missing conversion measurement. The roadmap is prioritised by likely impact rather than by the number of tasks an audit can list.",
    whyLocal: "A Gachibowli technology company selling globally needs a different plan from a Jubilee Hills local service business or a Secunderabad multi-location brand. We decide whether local Maps visibility, city-wide commercial searches, national topic authority or international service pages should carry the campaign, then make those layers work together without cannibalisation.",
    chooseAgency: "When comparing SEO companies in Hyderabad, look for technical depth and evidence that matches your sector. Ask how the agency handles complex websites, regulated or specialist content, local versus national intent, conversion attribution and AI-search visibility. The strategy should explain which pages need work and why, not simply promise a fixed number of keywords, links or articles.",
    closing: "A strong Hyderabad SEO programme should make expertise easier to discover, understand and trust. DGS combines technical improvements, locally relevant signals, specialist service content, internal linking, authority and enquiry tracking so the search strategy can support both immediate local demand and longer B2B research journeys.",
    faqScope: "SEO services in Hyderabad should be matched to the sector and buying journey. Technology and SaaS companies may need solution and use-case architecture; pharma and life-sciences brands may need technically precise, trust-led content; real-estate, education and local-service businesses may need stronger locality and enquiry intent. Technical SEO, authority and measurement support each model.",
    faqLocal: "Yes. DGS can strengthen local visibility in Hyderabad through Google Business Profile optimisation, reviews, citations, service-area clarity and useful location content. We recommend additional locality pages only when each one represents a genuine service area or customer need and can offer distinct information.",
    faqWhy: "DGS combines technical SEO, content architecture, website implementation and AEO/GEO/LLM SEO capabilities. For Hyderabad businesses, we adapt that framework to the city's mix of technology, specialist B2B and local search demand while keeping existing client case studies exactly as approved rather than creating unsupported local associations.",
  },
};export function applyLocationSeoContent(path: string, html: string): string {
  const copy = LOCATION_COPY[path];
  if (!copy) return html;
  let out = html;
  const replacements: Array<[string, string]> = [
    ["D'Genius Solutions serves businesses across", copy.overview],
    ["We focus on terms that connect to real services", copy.visibility],
    ["Our local SEO services in", copy.localFramework],
    ["We improve service pages, FAQs, comparison content", copy.serviceContent],
    ["We map solutions, industries, use cases", copy.complexServices],
    ["We create clear answer structures", copy.aiSearch],
    ["Slow pages, poor structure, crawl errors", copy.whyAudit],
    ["Our local SEO services in", copy.whyLocal],
    ["The best SEO company for your business should explain", copy.chooseAgency],
    ["Your website should help people understand your services", copy.closing],
    ["Professional SEO services in", copy.faqScope],
    ["Yes. DGS creates practical local SEO plans", copy.faqLocal],
    ["DGS focuses on clear strategy", copy.faqWhy],
  ];
  let localSeen = false;
  for (const [start, replacement] of replacements) {
    if (start === "Our local SEO services in") {
      if (!localSeen) { out = replaceParagraphStarting(out, start, copy.localFramework); localSeen = true; }
      else out = replaceParagraphStarting(out, start, copy.whyLocal);
    } else {
      out = replaceParagraphStarting(out, start, replacement);
    }
  }
  return applyProcessCopy(path, applyIndustryRows(path, out));
}
type IndustryRow = { title: string; description: string; metric: string };

const GENERIC_INDUSTRY_ROWS: IndustryRow[] = [
  { title: "E-commerce SEO", description: "Category &amp; product pages, filters, schema, internal links and buyer-focused content — including Shopify SEO services.", metric: "Organic revenue" },
  { title: "Real Estate SEO", description: "Location pages, project pages, configuration searches, and enquiry paths for developers, brokers, and real estate brands.", metric: "Project enquiries" },
  { title: "Education SEO", description: "Course pages, admission pages, comparison content, and student research journeys that attract better enquiries.", metric: "Counselling leads" },
  { title: "Finance SEO", description: "Clear and trustworthy content for users who compare services carefully before speaking to a finance brand.", metric: "Consultation leads" },
  { title: "Hospitality SEO", description: "Discovery for hotels, restaurants, venues, events, and location-based hospitality searches.", metric: "Bookings &amp; calls" },
  { title: "SaaS SEO", description: "Visibility across feature pages, use cases, integrations, and comparison searches that support demo or trial intent.", metric: "Demo requests" },
];

const LOCATION_INDUSTRIES: Record<string, { heading: string; rows: IndustryRow[] }> = {  "/services/seo-service-pune/": { heading: "SEO for Pune's technology, industrial and high-intent local markets", rows: [
    { title: "IT &amp; SaaS SEO", description: "Solution, feature, integration and comparison pages for Pune technology businesses competing for informed B2B buyers.", metric: "Demos &amp; qualified leads" },
    { title: "Engineering &amp; Manufacturing SEO", description: "Capability, process, application and industry pages that help technical buyers discover suppliers and specialist manufacturers.", metric: "RFQs &amp; sales enquiries" },
    { title: "Automotive &amp; Component SEO", description: "Search architecture for component manufacturers, service providers and automotive businesses across Pune's industrial ecosystem.", metric: "Commercial enquiries" },
    { title: "Education SEO", description: "Course, admission, programme and comparison journeys for institutes competing for students across Pune and beyond.", metric: "Counselling leads" },
    { title: "Real Estate SEO", description: "Project, configuration and locality-led discovery for developers and property businesses where location materially changes buyer intent.", metric: "Project enquiries" },
    { title: "Local Service SEO", description: "Maps, reviews, service-area relevance and conversion-ready pages for businesses whose customers search within Pune neighbourhoods.", metric: "Calls &amp; bookings" },
  ] },
  "/services/seo-service-in-banglore/": { heading: "SEO for Bengaluru's product, technology and innovation economy", rows: [
    { title: "SaaS &amp; Product SEO", description: "Feature, integration, use-case, alternative and comparison architecture for software companies selling to sophisticated buyers.", metric: "Trials &amp; demos" },
    { title: "Enterprise Technology SEO", description: "Solution and industry content for IT, cloud, data, cybersecurity and transformation providers with longer B2B sales cycles.", metric: "Qualified pipeline" },
    { title: "Biotech &amp; Healthtech SEO", description: "Clear technical pages, evidence and topic architecture for specialised businesses where accuracy and trust influence discovery.", metric: "Relevant enquiries" },
    { title: "Aerospace &amp; Deep-Tech SEO", description: "Capability-led search content for complex engineering, aerospace, electronics and R&amp;D businesses serving specialist markets.", metric: "B2B opportunities" },
    { title: "D2C &amp; E-commerce SEO", description: "Category, product, merchant and content optimisation for Bengaluru brands competing for high-intent consumer demand.", metric: "Organic revenue" },
    { title: "Bengaluru Local SEO", description: "Profile, review and location relevance for businesses that genuinely depend on neighbourhood and city-level customer discovery.", metric: "Calls &amp; visits" },
  ] },  "/services/seo-service-in-gurugram/": { heading: "SEO for Gurugram's enterprise, NCR and industrial demand", rows: [
    { title: "Enterprise B2B SEO", description: "Service, industry, use-case and decision-stage content for corporate buyers comparing specialist vendors across Gurugram, NCR and India.", metric: "Qualified opportunities" },
    { title: "IT, ITeS &amp; BPO SEO", description: "Commercial search architecture for technology, outsourcing and business-process providers competing for complex service demand.", metric: "Sales enquiries" },
    { title: "Automotive &amp; Industrial SEO", description: "Capability and application pages for manufacturers, component companies and industrial suppliers across the Gurugram-Manesar ecosystem.", metric: "RFQs &amp; leads" },
    { title: "Real Estate SEO", description: "Project, configuration, developer and location intent mapped to enquiry-ready pages for a highly competitive NCR property market.", metric: "Project enquiries" },
    { title: "Professional Services SEO", description: "Trust-led service and expertise content for consulting, finance, legal, HR and other firms selling to corporate decision-makers.", metric: "Consultations" },
    { title: "D2C &amp; Retail SEO", description: "Category, product and local-discovery optimisation for consumer brands serving Gurugram and wider NCR audiences.", metric: "Revenue &amp; store actions" },
  ] },
  "/services/seo-services-in-hyderabad/": { heading: "SEO for Hyderabad's technology, life-sciences and local growth markets", rows: [
    { title: "IT &amp; SaaS SEO", description: "Solution, feature, integration and comparison content for Hyderabad technology companies competing for B2B and global demand.", metric: "Demos &amp; pipeline" },
    { title: "Pharma &amp; Life Sciences SEO", description: "Technically precise service, capability and topic pages where accuracy, evidence and trust are essential to discovery.", metric: "Relevant B2B enquiries" },
    { title: "Healthcare SEO", description: "Service, speciality and local-intent optimisation that helps patients and decision-makers find clear, trustworthy information.", metric: "Appointments &amp; enquiries" },
    { title: "Real Estate SEO", description: "Project, configuration and locality-driven search journeys for developers and property businesses across Hyderabad's growth corridors.", metric: "Project leads" },
    { title: "Education SEO", description: "Programme, admission, comparison and student-research content for institutions competing across Hyderabad and national searches.", metric: "Applications &amp; counselling" },
    { title: "Hyderabad Local SEO", description: "Maps, reviews, citations and genuine locality relevance for businesses whose customers search by area, proximity and availability.", metric: "Calls &amp; visits" },
  ] },
};function applyIndustryRows(path: string, html: string): string {
  const local = LOCATION_INDUSTRIES[path];
  if (!local) return html;
  let out = html.replace(
    /Industry-focused SEO for\s*<span\b[^>]*class=["']gt["'][^>]*>competitive markets<\/span>/i,
    local.heading,
  );
  for (let i = 0; i < GENERIC_INDUSTRY_ROWS.length; i += 1) {
    const from = GENERIC_INDUSTRY_ROWS[i];
    const to = local.rows[i];
    out = out.replace(from.title, to.title);
    out = out.replace(from.description, to.description);
    out = out.replace(from.metric, to.metric);
  }
  return out;
}
type LocationProcessCopy = { discovery: string; leads: string; steps: string[] };
const GENERIC_STEP_TEXT = [
  "We understand your services, sales goals, target locations, pages, and current search performance.",
  "We group searches by intent: information, provider comparison, nearby services, or ready-to-contact buyers.",
  "We fix crawl, indexing, speed, internal linking, duplicate page, sitemap, and schema issues that hold rankings back.",
  "We rewrite weak sections, deepen service pages, add useful FAQs, and connect pages with natural internal links.",
  "We track calls, forms, WhatsApp clicks, local actions, organic sessions, and keyword movement to measure real progress.",
];
const LOCATION_PROCESS: Record<string, LocationProcessCopy> = {  "/services/seo-service-pune/": {
    discovery: "For Pune businesses, local discovery should reflect genuine service coverage across the city's technology, residential and industrial zones. We strengthen Maps and local organic signals around the areas that matter to customers, while keeping the main service architecture strong enough to compete for city-wide and non-local commercial searches.",
    leads: "A useful Pune campaign distinguishes a student counselling enquiry, a manufacturing RFQ, a SaaS demo request, a property enquiry and a neighbourhood service call. We configure measurement around the actions that matter to the business so organic growth can be judged by lead quality as well as rankings and sessions.",
    steps: [
      "We review the business model, priority services, target areas and whether demand comes from local customers, B2B buyers or a wider Indian market.",
      "We separate Pune city intent from locality, industry and solution intent so one page is not forced to rank for every type of search.",
      "We resolve crawl, indexing, performance, schema, redirect and internal-link issues before scaling content across additional service or location themes.",
      "We strengthen the pages buyers need to evaluate the business, then add supporting content for questions, comparisons and sector-specific research where it has a clear purpose.",
      "We connect Search Console and analytics data with calls, forms, WhatsApp activity, counselling enquiries, RFQs or other conversion actions relevant to the campaign.",
    ],
  },
  "/services/seo-service-in-banglore/": {
    discovery: "Bengaluru companies may need local discovery, but many are really competing for national or global product and B2B searches. We decide whether Maps, city relevance, solution authority or international demand should lead the strategy and prevent local optimisation from diluting higher-value product or enterprise pages.",
    leads: "For Bengaluru campaigns, the meaningful conversion may be a product trial, demo request, enterprise consultation, technical enquiry, ecommerce purchase or local appointment. We build attribution around those outcomes so high traffic from broad technology topics does not hide whether search is contributing to pipeline or revenue.",
    steps: [
      "We map the product, service and revenue model first, including whether the company sells locally, across India or into international markets.",
      "We organise searches into product, feature, integration, problem, alternative, industry and vendor-comparison journeys rather than treating every keyword as a blog topic.",
      "We audit JavaScript rendering, crawl paths, canonicalisation, performance, indexation and internal architecture that can become complex on fast-growing technology sites.",
      "We improve solution and product pages before expanding into comparison, use-case and educational content that supports sophisticated buyer research.",
      "We measure demos, trials, sales enquiries, ecommerce revenue or local actions alongside organic visibility so reporting reflects the actual business model.",
    ],
  },  "/services/seo-service-in-gurugram/": {
    discovery: "Gurugram search demand crosses local, NCR and enterprise intent. We separate Maps and city-level discovery from wider Delhi NCR service searches and national B2B research so a local landing page is not expected to carry every commercial query. Gurgaon variants are handled naturally where buyers still use the older name, without duplicating the same page.",
    leads: "For Gurugram businesses, the conversion may be an enterprise consultation, corporate service enquiry, manufacturing RFQ, property lead, recruitment or professional-services meeting. Reporting is built around those actions so strong rankings are evaluated against actual pipeline quality rather than traffic volume alone.",
    steps: [
      "We identify whether the priority market is Gurugram itself, the wider Delhi NCR region, national enterprise buyers or a combination of those audiences.",
      "We separate local-service, Gurgaon/Gurugram variant, industry, solution and enterprise decision-stage searches so pages have clear commercial roles.",
      "We audit crawlability, indexation, duplicate city targeting, JavaScript rendering, canonical signals, redirects, performance and internal architecture before adding new content.",
      "We strengthen capability, industry, use-case, proof and comparison pages that procurement teams and business leaders need during a longer evaluation cycle.",
      "We connect organic visibility to consultations, RFQs, sales forms, calls, WhatsApp actions and qualified-lead feedback so NCR growth is measured by business outcomes.",
    ],
  },
  "/services/seo-services-in-hyderabad/": {
    discovery: "Hyderabad search strategy needs to distinguish neighbourhood demand from city-wide commercial searches and specialist B2B research. We decide whether Maps, service-area relevance, technology authority, life-sciences expertise or national visibility should lead, then keep those intents separated so locality pages do not compete with core service and industry content.",
    leads: "Hyderabad campaigns may generate very different outcomes: SaaS demos, technical B2B enquiries, healthcare appointments, property leads, admissions enquiries or local service calls. We map conversion tracking to the business model so performance is judged by the value of the resulting actions, not simply by increases in sessions.",
    steps: [
      "We establish whether demand comes from Hyderabad local customers, specialist B2B buyers, national prospects or international technology and life-sciences audiences.",
      "We map searches into locality, service, solution, industry, problem and decision-stage groups so technical buyers and local customers reach different pages when they should.",
      "We fix crawl, indexation, page-speed, JavaScript, schema, canonical and internal-link issues before expanding specialist or locality content.",
      "We improve technically important service and industry pages first, then add supporting explanations, comparisons and FAQs where they help users verify expertise.",
      "We measure demos, appointments, forms, calls, WhatsApp actions, property or admissions enquiries and other qualified outcomes relevant to the organisation.",
    ],
  },
};
function applyProcessCopy(path: string, html: string): string {
  const process = LOCATION_PROCESS[path];
  if (!process) return html;
  let out = html;
  out = replaceParagraphStarting(out, "We improve signals that help customers find you", process.discovery);
  out = replaceParagraphStarting(out, "The aim is not just traffic", process.leads);
  for (let i = 0; i < GENERIC_STEP_TEXT.length; i += 1) {
    out = out.replace(GENERIC_STEP_TEXT[i], process.steps[i]);
  }
  return out;
}
