type LocationSeoCopy = {
  heroDesc: string;
  directAnswer1: string;
  directAnswer2: string;
  fillLead: string;
  overview: string;
  visibility: string;
  localFramework: string;
  serviceContent: string;
  techCard: string;
  onPageCard: string;
  localCard: string;
  prCard: string;
  ecomCard: string;
  complexServices: string;
  migrationCard: string;
  aiSearch: string;
  whyAudit: string;
  whyLocal: string;
  chooseAgency: string;
  closing: string;
  faqScope: string;
  faqLocal: string;
  faqAi: string;
  faqPricing: string;
  faqTimeline: string;
  faqCrawl: string;
  faqMaps: string;
  faqTraffic: string;
  faqWhy: string;
  faqGuarantee: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceParagraphStarting(html: string, start: string, replacement: string): string {
  const flexibleStart = escapeRegExp(start).replace(/['’]/g, "(?:'|’|&#8217;)");
  const pattern = new RegExp(
    `(<p\\b[^>]*>)\\s*(?:<(?:strong|b|span|em)\\b[^>]*>\\s*)*${flexibleStart}[\\s\\S]*?(<\\/p>)`,
    "i",
  );
  return html.replace(pattern, `$1${replacement}$2`);
}

const LOCATION_COPY: Record<string, LocationSeoCopy> = {
  "/services/seo-service-pune/": {
    heroDesc:
      "<strong>D'Genius Solutions is a results-driven SEO agency in Pune</strong> helping IT &amp; SaaS companies, automotive and engineering manufacturers, real estate developers, education brands and local businesses win Page 1 Google rankings, Google Maps visibility, AI Overviews citations and qualified enquiries across Pune and Pimpri-Chinchwad.",
    directAnswer1:
      "An SEO agency in Pune improves how your website is crawled, indexed, ranked and selected across Google Search, Google Maps and AI search platforms. D'Genius Solutions pairs technical SEO diagnostics with commercial intent mapping for Pune's IT corridors, industrial belts and high-growth residential hubs.",
    directAnswer2:
      'Because DGS also engineers and maintains production websites, technical fixes are implemented directly across WordPress, Next.js, React, PHP and custom stacks. This connects our <a class="dgs-inline" href="/services/website-development-pune-page/">web development agency in Pune and AMC team</a> with specialist <a class="dgs-inline" href="/services/aeo-services-in-mumbai/">AEO</a>, <a class="dgs-inline" href="/services/geo/">GEO</a> and <a class="dgs-inline" href="/services/llm-seo-service/">LLM SEO</a> execution.',
    fillLead:
      "Commercial SEO services in Pune engineered for B2B software firms, industrial suppliers and local service leaders seeking measurable pipeline growth across Google Search, Maps and AI Overviews.",
    overview:
      "Pune search demand is unusually mixed: technology and business services compete alongside engineering and automotive companies, education brands, real estate businesses and neighbourhood-led services. That means a useful Pune SEO strategy cannot rely on one city keyword. We map commercial searches by service, buyer stage and the areas a business can genuinely serve, then decide whether the right asset is a core service page, an industry page, a location page or supporting content. For businesses operating around Hinjawadi, Kharadi, Baner, Wakad, Viman Nagar and Pimpri-Chinchwad, the goal is to build enough relevance for local discovery without creating repetitive doorway-style pages.",
    visibility:
      "For Pune businesses, valuable visibility often spans more than one search pattern: a B2B buyer comparing specialist providers, a local customer looking for a nearby service, or a decision-maker researching a complex solution before making contact. We prioritise the query groups that can realistically lead to enquiries, not vanity positions with little commercial value.",
    localFramework:
      "Our Pune local SEO work connects Google Business Profile signals with accurate business information, review quality, locally relevant service content and strong conversion paths. We use area references only where they help a real customer understand coverage; we do not manufacture dozens of thin pages simply to repeat Hinjawadi, Baner, Kharadi, Wakad or Pimpri-Chinchwad keywords.",
    serviceContent:
      "Pune buyers often need different levels of information depending on the category. A manufacturing or engineering prospect may need capabilities, specifications and proof; a SaaS or IT buyer may compare use cases and integrations; an education or real-estate prospect may search by course, project, locality or decision stage. We build service and supporting content around those journeys rather than publishing generic blogs for volume.",
    techCard:
      "We resolve crawl bottlenecks, Core Web Vitals, JavaScript rendering, canonical conflicts and indexation waste on Pune SaaS platforms, manufacturing portals and multi-project real estate websites.",
    onPageCard:
      "We structure commercial service pages, industrial capability sheets, course pages and locality hubs so Pune buyers and search engines immediately understand topical relevance and conversion value.",
    localCard:
      "We optimise Google Business Profiles, local citations, review velocity and hyperlocal landing pages across Hinjawadi, Kharadi, Baner, Wakad, Viman Nagar, Magarpatta and Pimpri-Chinchwad.",
    prCard:
      "We build topical authority and credible backlink profiles through industry publications, technical case studies, supplier directories and digital PR tailored to Pune B2B and consumer brands.",
    ecomCard:
      "We optimise category hierarchies, product schema, filtered navigation and high-intent shopping queries for Pune D2C brands, retail chains and B2B industrial catalog websites.",
    complexServices:
      "For B2B, engineering, technology and professional-service companies in Pune, organic demand is rarely created by one landing page. We structure solution, industry, use-case and comparison content so technical evaluators and commercial decision-makers can find the right information at different stages of a longer sales cycle.",
    migrationCard:
      "We protect organic rankings and enquiry flow when Pune companies redesign legacy websites, migrate to Next.js or WordPress, consolidate domains or recover from algorithm drops.",
    aiSearch:
      "Pune companies increasingly need their expertise to be understandable beyond conventional blue-link results. We organise direct answers, entity information, evidence, internal links and source-worthy service content so the same strong SEO foundation can support Google AI Overviews and other AI-assisted discovery without treating AI visibility as a replacement for search fundamentals.",
    whyAudit:
      "We begin with evidence. For a Pune site that may mean fixing JavaScript rendering, crawl waste, duplicate location pages, slow templates, weak service architecture or pages that target the wrong buyer intent. We prioritise the issues most likely to affect discovery and enquiries before recommending more content or authority work.",
    whyLocal:
      "Local strategy is matched to the business model. A Baner clinic, a Kharadi B2B firm and a Pimpri-Chinchwad industrial supplier should not receive the same local SEO plan. We align profiles, reviews, citations, service areas, location content and internal links with the places and services the business can genuinely fulfil.",
    chooseAgency:
      "When evaluating an SEO company for Pune, look for a team that can explain how it will compete in your specific market rather than presenting a standard city template. Ask how technical fixes will be implemented, how service and location intent will be separated, what evidence will be reported and how organic enquiries will be distinguished from raw traffic growth.",
    closing:
      "A strong Pune search presence should make it easier for the right customer to understand what you do, where you operate and why your business is credible. We connect technical health, locally relevant content, authority, internal linking and conversion measurement so growth is built around useful discovery rather than city-name repetition.",
    faqScope:
      "Professional SEO services in Pune should cover technical SEO, search-intent mapping, important service pages, local visibility, useful supporting content, authority development and conversion tracking. The mix should change for an IT company, industrial supplier, education brand, real-estate business or local service provider rather than following one fixed package.",
    faqLocal:
      "Yes. For businesses that depend on Pune-area demand, DGS can improve Google Business Profile quality, local landing-page relevance, citations, review signals and conversion tracking. We only recommend additional area pages when each page serves a real audience and contains genuinely useful information.",
    faqAi:
      "Yes. Our Pune SEO programmes integrate Answer Engine Optimization (AEO), Generative Engine Optimization (GEO) and LLM SEO so Pune IT, manufacturing, education and service brands appear in Google AI Overviews, ChatGPT, Gemini and Perplexity alongside traditional SERPs.",
    faqPricing:
      "SEO pricing in Pune depends on whether you need hyperlocal Maps discovery in areas like Baner or Viman Nagar, multi-project real estate or education campaigns, or national/global B2B SaaS and industrial SEO. We scope retainers after auditing your technical health and competitor landscape.",
    faqTimeline:
      "Technical fixes and Google Business Profile improvements for Pune local queries often show initial movement within 4 to 8 weeks, while competitive Pune B2B, SaaS, real estate and industrial keywords typically build compounding Page 1 authority over 3 to 6 months.",
    faqCrawl:
      "Yes. Many Pune engineering, SaaS and real estate sites suffer from unindexed pages, duplicate parameter URLs, slow scripts or broken canonical tags. We diagnose and fix Search Console coverage and crawl budget issues directly in your codebase.",
    faqMaps:
      "Yes. We optimise Google Business Profiles, local schema, NAP consistency, review generation and locality-specific service signals for Pune businesses targeting Hinjawadi, Kharadi, Wakad, Baner, Koregaon Park and Pimpri-Chinchwad.",
    faqTraffic:
      "When a Pune website gets traffic without enquiries, it usually ranks for broad informational terms instead of commercial buyer intent, or suffers from unclear positioning and weak conversion paths. We realign keyword targeting and landing-page UX around qualified RFQs, demos and calls.",
    faqWhy:
      "DGS combines SEO strategy with implementation capability across common web stacks, plus AEO, GEO and LLM SEO expertise. For Pune businesses, the emphasis is on technical depth, commercially useful content, honest local targeting and measurable enquiry paths while preserving the same evidence-led standards used in our published client work.",
    faqGuarantee:
      "No ethical SEO agency in Pune can guarantee fixed rank positions because Google's algorithms and competitor activity evolve continuously. Instead, we guarantee transparent technical deliverables, verifiable Search Console progress and reporting tied directly to Pune enquiries and pipeline.",
  },
  "/services/seo-service-in-banglore/": {
    heroDesc:
      "<strong>D'Genius Solutions is a specialist SEO agency in Bangalore (Bengaluru)</strong> built for SaaS companies, enterprise technology firms, deep-tech and biotech innovators, D2C brands and high-growth local businesses competing for rankings, AI search citations and qualified pipeline.",
    directAnswer1:
      "An SEO agency in Bangalore (Bengaluru) helps technology companies, startups and local enterprises capture high-intent search demand across Google Search, Google Maps and AI answer engines. D'Genius Solutions combines technical JavaScript SEO with product-led content architecture and conversion attribution.",
    directAnswer2:
      'Because our engineering team works natively across Next.js, React, WordPress and headless CMS stacks, technical SEO recommendations are shipped cleanly into production. This bridges our <a class="dgs-inline" href="/services/website-development-amc/">website development and AMC capability</a> with advanced <a class="dgs-inline" href="/services/aeo-services-in-mumbai/">AEO</a>, <a class="dgs-inline" href="/services/geo/">GEO</a> and <a class="dgs-inline" href="/services/llm-seo-service/">LLM SEO</a> systems.',
    fillLead:
      "SEO services in Bangalore and Bengaluru designed to turn complex product, SaaS, enterprise B2B and local search journeys into measurable demos, trials and sales conversations.",
    overview:
      "Bengaluru has a dense mix of SaaS, software, startups, enterprise technology, biotechnology, aerospace, electronics, manufacturing and consumer businesses. Search competition therefore extends well beyond local-map visibility. A company may be competing with Bengaluru firms, national specialists and global product brands for the same buyer. DGS structures SEO around that reality: clear solution architecture, technical performance, product and use-case intent, credible expertise and strong internal relationships between service, industry and educational content. We use both Bengaluru and Bangalore language naturally where it reflects how customers actually search, without creating duplicate pages for spelling variants.",
    visibility:
      "High-value Bengaluru searches frequently involve knowledgeable buyers comparing several credible options. We focus on queries where expertise, product fit, technical capability or commercial intent can be demonstrated on the landing page, rather than relying on broad traffic terms that attract researchers with no realistic path to conversion.",
    localFramework:
      "Local SEO in Bengaluru needs to reflect how the business actually operates. A company serving Whitefield, Electronic City, Koramangala, Indiranagar, the Outer Ring Road corridor or Peenya may have very different customer journeys. We connect genuine location relevance, Google Business Profile quality, reviews and service coverage without creating thin micro-location pages that compete with each other.",
    serviceContent:
      "For SaaS and technology companies, we build search journeys around solutions, features, integrations, use cases, alternatives and comparison intent. For biotechnology, aerospace, electronics, manufacturing and professional services, content must communicate technical capability and trust clearly enough for a specialist buyer. This makes the page architecture useful to people first while giving search engines stronger topical context.",
    techCard:
      "We audit and fix React/Next.js hydration, client-side rendering gaps, crawl budget waste, Core Web Vitals, schema graphs and canonical architecture on fast-scaling Bengaluru tech websites.",
    onPageCard:
      "We build high-converting solution pages, feature matrices, integration hubs, competitor comparison pages and technical documentation that match how Bengaluru B2B and SaaS buyers evaluate vendors.",
    localCard:
      "We strengthen Google Business Profile visibility, local entity signals and neighbourhood discovery across Koramangala, Indiranagar, Whitefield, Electronic City, HSR Layout, Bellandur and Peenya.",
    prCard:
      "We earn authoritative citations, digital PR mentions, founder thought-leadership placements and contextual backlinks that build domain rating in competitive technology and consumer verticals.",
    ecomCard:
      "We scale organic revenue for Bengaluru D2C and e-commerce brands through collection architecture, faceted search controls, Merchant Center schema and buyer-intent content.",
    complexServices:
      "Bengaluru B2B search often supports a multi-touch sales process. We map early research, problem-aware searches, solution evaluation and vendor-comparison intent to distinct pages, then connect those pages with internal links and proof. The objective is not simply more sessions; it is a discoverable information system that helps qualified prospects move toward a demo, consultation or sales conversation.",
    migrationCard:
      "We manage zero-loss domain migrations, Webflow/Next.js replatforming, URL restructures and traffic recovery audits when Bengaluru startups rebrand or expand product lines.",
    aiSearch:
      "Technology-led buyers are also using AI-assisted research to compare vendors and understand complex categories. We strengthen machine-readable context through concise answers, consistent entities, evidence, structured page relationships and source-worthy explanations, while keeping technical SEO and crawlable content as the foundation for both conventional and AI search.",
    whyAudit:
      "Bengaluru websites often grow quickly as products, features, industries and campaigns expand. That can create duplicate pages, orphaned content, JavaScript rendering issues, weak canonical signals or overlapping keyword targets. Our first step is to identify which structural problems are suppressing valuable pages before increasing publishing volume.",
    whyLocal:
      "We distinguish between companies that need Bengaluru local discovery and companies headquartered in the city but selling nationally or globally. A local service business may need Maps, reviews and neighbourhood relevance; a SaaS company may need international solution visibility. The strategy follows the revenue model rather than forcing every Bengaluru company into the same local SEO template.",
    chooseAgency:
      "A Bengaluru SEO partner should be able to work with sophisticated products and competitive search categories without reducing the strategy to backlinks and blog counts. Ask how they handle JavaScript sites, product or solution architecture, cannibalisation, conversion attribution and AI-search visibility, and whether the team can implement recommendations instead of only delivering audits.",
    closing:
      "For Bengaluru businesses, sustainable organic growth comes from making complex expertise easy to discover and evaluate. DGS connects technical SEO, solution architecture, useful content, authority signals and measurement so qualified buyers can find the right page whether they begin with Google, Maps or an AI-assisted research journey.",
    faqScope:
      "SEO services in Bangalore should be designed around the company's sales model. SaaS and technology brands may need solution, integration, comparison and international search architecture; local businesses may need stronger Maps and area relevance; manufacturers and specialist B2B firms may need technical service and industry content. Technical SEO and conversion measurement support all of these layers.",
    faqLocal:
      "Yes. DGS can run local SEO for Bengaluru businesses that depend on city or neighbourhood demand, including profile optimisation, reviews, citations and useful location content. We can also separate that local strategy from national or international SEO when a Bengaluru-based company sells beyond the city.",
    faqAi:
      "Yes. Tech-savvy buyers in Bengaluru rely heavily on ChatGPT, Perplexity, Gemini and Google AI Overviews for vendor shortlisting. We structure entity schemas, comparison tables and citation-ready documentation so your brand is recommended in AI-generated answers.",
    faqPricing:
      "SEO investment in Bangalore depends on whether you are targeting local Bengaluru service queries, national D2C e-commerce categories, or global SaaS and enterprise software keywords. Every proposal is scoped after auditing your technical stack and growth targets.",
    faqTimeline:
      "JavaScript rendering fixes, indexing cleanup and local Maps optimisation in Bengaluru can produce measurable movement within 4 to 8 weeks, while competitive SaaS, enterprise tech and D2C category terms build compounding pipeline over 3 to 6 months.",
    faqCrawl:
      "Yes. We frequently resolve SPA/JavaScript rendering blocks, orphaned product pages, duplicate staging indexes, sitemap mismatches and Core Web Vitals regressions on modern Bengaluru tech stacks.",
    faqMaps:
      "Yes. For clinics, hospitality, retail, real estate and B2B offices across HSR Layout, Koramangala, Indiranagar, Whitefield and Electronic City, we align Google Business Profiles, local schema and review signals to win Maps pack visibility.",
    faqTraffic:
      "High blog traffic with low demo or lead conversion is a classic Bengaluru SaaS issue caused by ranking for top-of-funnel definitions instead of commercial solution, integration and alternative queries. We restructure content around bottom-of-funnel buyer intent.",
    faqWhy:
      "DGS combines technical implementation, search strategy and AI-search capabilities rather than treating SEO as a publishing checklist. For Bengaluru companies, that is useful when websites include modern JavaScript frameworks, complex service architectures, multiple audiences or long B2B decision journeys. Existing client proof remains the evidence base; we do not manufacture local client claims.",
    faqGuarantee:
      "No credible SEO agency in Bangalore guarantees #1 rankings because search algorithms and competitor investments shift constantly. We commit to transparent engineering execution, qualified pipeline attribution and verifiable visibility gains across Google and AI search.",
  },
  "/services/seo-service-in-gurugram/": {
    heroDesc:
      "<strong>D'Genius Solutions is a premier SEO agency in Gurugram (Gurgaon)</strong> helping Delhi NCR enterprises, IT &amp; ITeS leaders, corporate B2B firms, luxury real estate developers and D2C brands capture Page 1 Google rankings, AI Overviews visibility and high-value commercial enquiries.",
    directAnswer1:
      "An SEO agency in Gurugram (Gurgaon) strengthens how corporate, B2B and local service brands are discovered across Google Search, Google Maps and AI answer platforms across Delhi NCR. D'Genius Solutions aligns technical site architecture with procurement-grade content and lead tracking.",
    directAnswer2:
      'Because DGS combines search strategy with full-stack engineering across WordPress, Next.js, React and PHP, technical SEO fixes move directly from audit to deployment. This integrates our <a class="dgs-inline" href="/services/website-development-amc/">website development and AMC capability</a> with enterprise <a class="dgs-inline" href="/services/aeo-services-in-mumbai/">AEO</a>, <a class="dgs-inline" href="/services/geo/">GEO</a> and <a class="dgs-inline" href="/services/llm-seo-service/">LLM SEO</a> execution.',
    fillLead:
      "SEO services in Gurugram and Gurgaon built for corporate decision-makers, NCR service providers and high-growth brands that measure success by qualified pipeline and revenue.",
    overview:
      "Gurugram sits inside the NCR business market, with strong enterprise, IT and ITeS, BPO, automotive, professional-services, real-estate and corporate demand. Search behaviour reflects that mix: some buyers want a nearby provider, while others are procurement teams or senior decision-makers comparing specialist partners across Delhi NCR and India. DGS builds the page architecture around those different journeys and uses both Gurugram and Gurgaon terminology naturally where users still search with the older city name. The aim is to earn relevance without creating duplicate Gurgaon/Gurugram doorway pages.",
    visibility:
      "Commercial visibility in Gurugram often depends on being credible for high-intent service searches and detailed B2B evaluation at the same time. We prioritise searches that can lead to consultations, enterprise enquiries and qualified local demand instead of optimising for broad volumes that do not match the sales process.",
    localFramework:
      "For businesses serving Cyber City, Udyog Vihar, Golf Course Road, Sohna Road, Manesar and the wider NCR, local signals need to match real coverage. We improve profile quality, reviews, citations, service and location relevance, then connect those signals to landing pages that explain the offer clearly. We avoid cloning area pages simply to capture every neighbourhood name.",
    serviceContent:
      "Enterprise and B2B buyers in Gurugram usually expect more than a short service description. We develop content around capabilities, industries, use cases, decision criteria, implementation questions and proof so procurement teams and business leaders can evaluate fit. Local-service and real-estate journeys are handled differently, with stronger emphasis on location, availability and enquiry intent.",
    techCard:
      "We resolve crawlability bottlenecks, duplicate Gurgaon/Gurugram URL targeting, Core Web Vitals, JavaScript rendering and schema validation across corporate, real estate and enterprise websites.",
    onPageCard:
      "We architect capability pages, NCR location hubs, project microsites and B2B comparison assets that satisfy both procurement committees and high-intent local searchers.",
    localCard:
      "We optimise Google Business Profiles, NCR regional citations, review authority and hyperlocal discovery across DLF Cyber City, Udyog Vihar, Golf Course Road, Sohna Road and Manesar.",
    prCard:
      "We build executive authority and domain trust through corporate digital PR, industry research assets, partner mentions and verified Indian business citations.",
    ecomCard:
      "We optimise category taxonomy, product structured data, faceted navigation and transactional search journeys for Gurugram D2C brands and omnichannel retailers.",
    complexServices:
      "Gurugram's concentration of corporate offices, IT/ITeS companies and industrial businesses creates longer consideration cycles for many categories. We connect solution pages, industry pages, case evidence and comparison content so search can support research before a buyer is ready to speak with sales, while maintaining clear conversion routes for high-intent visitors.",
    migrationCard:
      "We safeguard rankings, backlinks and lead generation during corporate website revamps, CMS migrations, domain consolidations and post-update ranking recoveries.",
    aiSearch:
      "Enterprise research increasingly happens across search engines and AI assistants. We make important service information easy to parse through direct answers, consistent entities, structured headings, credible evidence and strong internal linking. This improves machine understanding while preserving the technical and authority signals required for sustainable organic search performance.",
    whyAudit:
      "Our Gurugram campaigns start by separating structural problems from competitive gaps. We check crawl and indexing, overlapping Gurgaon/Gurugram targeting, service architecture, JavaScript rendering, internal links, conversion tracking and content depth before prescribing new pages. That prevents activity from being spent on symptoms while higher-impact issues remain unresolved.",
    whyLocal:
      "A Gurugram local business, an NCR-wide service provider and an enterprise vendor headquartered in Cyber City need different search strategies. We decide where Maps visibility, city relevance, Delhi NCR coverage or national B2B content should lead, then keep those intents clearly separated so pages reinforce rather than cannibalise each other.",
    chooseAgency:
      "When choosing an SEO company for Gurugram, ask how the agency will handle NCR competition, Gurgaon/Gurugram query variants and the difference between local leads and enterprise research. A useful proposal should identify technical priorities, commercial page gaps, authority needs and measurement methods instead of offering the same backlink-and-blog package to every company.",
    closing:
      "A stronger Gurugram search presence should help local customers and enterprise buyers reach the right information without confusion. DGS connects technical health, commercial page architecture, local and NCR relevance, authority and enquiry measurement so organic visibility supports the way the business actually sells.",
    faqScope:
      "SEO services in Gurugram should reflect whether a company sells locally, across Delhi NCR or nationally. A complete scope can include technical SEO, service and industry architecture, Gurgaon/Gurugram keyword mapping, local SEO, authority work, supporting content and conversion tracking, with priorities based on the website and sales cycle.",
    faqLocal:
      "Yes. DGS can improve Gurugram local discovery through Google Business Profile optimisation, reviews, citations, location relevance and useful service-area content. We also account for Gurgaon search terminology where it is genuinely used, without creating duplicate versions of the same page.",
    faqAi:
      "Yes. Corporate buyers in Gurugram and Delhi NCR frequently research vendors via ChatGPT, Perplexity, Copilot and Google AI Overviews. We integrate AEO, GEO and LLM SEO so your enterprise capabilities and proof are cited accurately by AI answer engines.",
    faqPricing:
      "SEO retainers in Gurugram depend on competition across Delhi NCR, website complexity, the number of commercial service lines or real estate projects, and whether national B2B authority building is required.",
    faqTimeline:
      "Technical cleanup, Gurgaon/Gurugram keyword consolidation and local Maps optimisation often produce early gains within 4 to 8 weeks, while competitive NCR real estate, corporate B2B and finance keywords build sustained Page 1 rankings over 3 to 6 months.",
    faqCrawl:
      "Yes. We diagnose and fix indexation blocks, redirect chains, duplicate microsite URLs, canonical conflicts and Core Web Vitals issues across enterprise and multi-location NCR websites.",
    faqMaps:
      "Yes. We optimise Google Business Profiles, local schema, reviews and corridor-level relevance across Cyber City, Golf Course Road, Sohna Road, Udyog Vihar and Manesar.",
    faqTraffic:
      "If your Gurugram website attracts sessions without consultations or RFQs, the pages are likely ranking for generic informational terms or lacking enterprise trust signals. We rebuild page intent and conversion paths around qualified decision-maker enquiries.",
    faqWhy:
      "DGS combines SEO, website implementation and AI-search expertise with evidence from existing client campaigns. For Gurugram businesses, we focus on clear commercial intent, NCR competition, technical execution and lead quality. We keep the approved client proof unchanged and do not imply that those clients are Gurugram-based unless that is independently true.",
    faqGuarantee:
      "No reputable SEO company in Gurugram can guarantee fixed #1 positions on Google. We stand behind transparent technical execution, clear keyword-intent roadmaps and measurable growth in qualified NCR and enterprise enquiries.",
  },
  "/services/seo-services-in-hyderabad/": {
    heroDesc:
      "<strong>D'Genius Solutions is a growth-focused SEO agency in Hyderabad</strong> partnering with IT &amp; SaaS enterprises, pharmaceutical and life-sciences leaders, healthcare networks, real estate developers and education brands to win Google rankings, Maps visibility, AI Overviews and qualified leads.",
    directAnswer1:
      "An SEO agency in Hyderabad helps technology, pharma, healthcare, real estate and local service brands earn trusted visibility across Google Search, Google Maps and AI answer engines. D'Genius Solutions combines deep technical SEO with sector-specific content architecture and enquiry tracking.",
    directAnswer2:
      'Because our in-house engineering team builds and maintains websites across WordPress, Next.js, React and PHP, technical SEO fixes are executed directly in code rather than left in audit PDFs. This links our <a class="dgs-inline" href="/services/website-development-amc/">website development and AMC capability</a> with specialist <a class="dgs-inline" href="/services/aeo-services-in-mumbai/">AEO</a>, <a class="dgs-inline" href="/services/geo/">GEO</a> and <a class="dgs-inline" href="/services/llm-seo-service/">LLM SEO</a> services.',
    fillLead:
      "SEO services in Hyderabad engineered for HITEC City technology leaders, Genome Valley life-sciences brands and high-intent local businesses seeking compounding organic leads.",
    overview:
      "Hyderabad combines a major IT and software economy with life sciences, pharmaceuticals, biotechnology, healthcare, real estate, education and fast-growing professional services. Search strategy therefore has to support very different trust and decision patterns. A SaaS buyer may compare features and implementation depth, a life-sciences prospect may need technically accurate evidence, while a local service customer may care most about proximity and reviews. DGS maps those journeys separately and builds service, industry and location relevance around the real commercial model instead of relying on one generic Hyderabad keyword set.",
    visibility:
      "Useful Hyderabad visibility means appearing for the searches that match real expertise and buying intent. We separate local-service demand from B2B, technology and specialist-industry research, then strengthen the pages that can genuinely answer those needs and lead to a qualified enquiry.",
    localFramework:
      "For businesses serving HITEC City, Gachibowli, Madhapur, Kondapur, Banjara Hills, Jubilee Hills and Secunderabad, local SEO should connect accurate profile information, reviews, citations, service coverage and useful landing pages. We use locality signals where they help customers make a decision, not as an excuse to duplicate the same page across dozens of neighbourhoods.",
    serviceContent:
      "Hyderabad's technology and life-sciences sectors reward content that is specific, technically credible and easy to verify. We build service and industry pages around buyer questions, capabilities, use cases and decision criteria. For real estate, education and local services, the architecture shifts toward project, course, locality and high-intent enquiry searches while maintaining clear internal relationships between pages.",
    techCard:
      "We resolve crawl errors, JavaScript rendering bottlenecks, Core Web Vitals, schema markup and indexation issues across Hyderabad SaaS platforms, hospital networks and property portals.",
    onPageCard:
      "We structure technical capability pages, clinical or speciality hubs, SaaS solution pages and locality landing pages with clear hierarchy, evidence and conversion paths.",
    localCard:
      "We optimise Google Business Profiles, local citations, patient/client review signals and area relevance across HITEC City, Gachibowli, Madhapur, Kondapur, Banjara Hills, Jubilee Hills and Secunderabad.",
    prCard:
      "We strengthen domain authority and E-E-A-T signals through sector-relevant digital PR, authoritative citations, technical whitepapers and credible backlink acquisition.",
    ecomCard:
      "We improve category structure, product schema, internal linking and high-intent transactional rankings for Hyderabad retail, D2C and B2B supply catalogues.",
    complexServices:
      "For SaaS, IT, pharma, life-sciences and other specialist B2B companies, a search visit may be only one step in a longer evaluation. We connect solution pages, industry expertise, evidence, technical explanations and comparison content so organic search can support research as well as direct lead generation.",
    migrationCard:
      "We protect organic traffic, authority and enquiry flow when Hyderabad businesses replatform to Next.js or WordPress, merge domains or recover from core algorithm updates.",
    aiSearch:
      "Clear entity information and evidence are especially important in technical and regulated categories. We structure concise answers, service facts, proof, internal links and machine-readable context so search engines and AI systems can understand what the business does without replacing careful SEO with speculative AI-only tactics.",
    whyAudit:
      "We start Hyderabad campaigns by finding the structural issue that matters most: crawl and indexing problems, weak service architecture, overlapping pages, slow or JavaScript-heavy templates, poor internal linking, thin technical explanations or missing conversion measurement. The roadmap is prioritised by likely impact rather than by the number of tasks an audit can list.",
    whyLocal:
      "A Gachibowli technology company selling globally needs a different plan from a Jubilee Hills local service business or a Secunderabad multi-location brand. We decide whether local Maps visibility, city-wide commercial searches, national topic authority or international service pages should carry the campaign, then make those layers work together without cannibalisation.",
    chooseAgency:
      "When comparing SEO companies in Hyderabad, look for technical depth and evidence that matches your sector. Ask how the agency handles complex websites, regulated or specialist content, local versus national intent, conversion attribution and AI-search visibility. The strategy should explain which pages need work and why, not simply promise a fixed number of keywords, links or articles.",
    closing:
      "A strong Hyderabad SEO programme should make expertise easier to discover, understand and trust. DGS combines technical improvements, locally relevant signals, specialist service content, internal linking, authority and enquiry tracking so the search strategy can support both immediate local demand and longer B2B research journeys.",
    faqScope:
      "SEO services in Hyderabad should be matched to the sector and buying journey. Technology and SaaS companies may need solution and use-case architecture; pharma and life-sciences brands may need technically precise, trust-led content; real-estate, education and local-service businesses may need stronger locality and enquiry intent. Technical SEO, authority and measurement support each model.",
    faqLocal:
      "Yes. DGS can strengthen local visibility in Hyderabad through Google Business Profile optimisation, reviews, citations, service-area clarity and useful location content. We recommend additional locality pages only when each one represents a genuine service area or customer need and can offer distinct information.",
    faqAi:
      "Yes. We combine traditional SEO with Answer Engine Optimization (AEO), GEO and LLM SEO so Hyderabad technology, pharma, healthcare and real estate brands earn citations across Google AI Overviews, ChatGPT, Gemini and Perplexity.",
    faqPricing:
      "SEO pricing in Hyderabad is scoped around your sector competition, website size, technical debt and whether you target local Hyderabad corridors (such as Gachibowli or Banjara Hills), national B2B buyers or international markets.",
    faqTimeline:
      "Technical SEO fixes and Google Maps optimisation in Hyderabad typically show initial movement within 4 to 8 weeks, while competitive IT/SaaS, healthcare, pharma and real estate keywords build durable Page 1 rankings over 3 to 6 months.",
    faqCrawl:
      "Yes. We audit and fix Search Console coverage errors, unindexed service pages, JavaScript rendering delays, canonical conflicts, redirect chains and sitemap issues across complex Hyderabad websites.",
    faqMaps:
      "Yes. We optimise Google Business Profiles, multi-branch location signals, reviews and citations for Hyderabad businesses operating across HITEC City, Madhapur, Gachibowli, Jubilee Hills, Banjara Hills and Secunderabad.",
    faqTraffic:
      "When a Hyderabad website receives traffic without enquiries, it usually ranks for non-commercial queries or lacks the technical proof and clear CTAs buyers expect. We realign content and UX to capture high-intent demos, appointments and RFQs.",
    faqWhy:
      "DGS combines technical SEO, content architecture, website implementation and AEO/GEO/LLM SEO capabilities. For Hyderabad businesses, we adapt that framework to the city's mix of technology, specialist B2B and local search demand while keeping existing client case studies exactly as approved rather than creating unsupported local associations.",
    faqGuarantee:
      "No ethical SEO agency in Hyderabad can guarantee fixed #1 rankings because search algorithms are dynamic. We guarantee rigorous technical execution, transparent deliverables and reporting tied to qualified leads and organic revenue.",
  },
};

export function applyLocationSeoContent(path: string, html: string): string {
  if (path === "/services/website-development-pune-page/") {
    return applyPuneWebDevContent(html);
  }
  const copy = LOCATION_COPY[path];
  if (!copy) return html;
  let out = html;
  const replacements: Array<[string, string]> = [
    ["D'Genius Solutions is an SEO agency in", copy.heroDesc],
    ["An SEO agency in", copy.directAnswer1],
    ["Because DGS also develops and maintains websites", copy.directAnswer2],
    ["SEO services in", copy.fillLead],
    ["D'Genius Solutions serves businesses across", copy.overview],
    ["We focus on terms that connect to real services", copy.visibility],
    ["Our local SEO services in", copy.localFramework],
    ["We improve service pages, FAQs, comparison content", copy.serviceContent],
    ["We audit crawling, canonicals, sitemaps", copy.techCard],
    ["We map keyword groups to page purpose", copy.onPageCard],
    ["We improve Google Business Profile quality", copy.localCard],
    ["We strengthen relevant authority through useful assets", copy.prCard],
    ["We improve product discovery, category architecture", copy.ecomCard],
    ["We map solutions, industries, use cases", copy.complexServices],
    ["We support redesigns, domain changes, CMS migrations", copy.migrationCard],
    ["We create clear answer structures", copy.aiSearch],
    ["Slow pages, poor structure, crawl errors", copy.whyAudit],
    ["Our local SEO services in", copy.whyLocal],
    ["The best SEO company for your business should explain", copy.chooseAgency],
    ["Your website should help people understand your services", copy.closing],
    ["Professional SEO services in", copy.faqScope],
    ["Yes. DGS creates practical local SEO plans", copy.faqLocal],
    ["Yes. DGS provides AI SEO services covering AI Overviews", copy.faqAi],
    ["SEO pricing depends on website size, competition", copy.faqPricing],
    ["Some technical and local improvements can show early movement", copy.faqTimeline],
    ["Yes. We check noindex tags, blocked pages, sitemap problems", copy.faqCrawl],
    ["Yes. Local visibility can improve when your website, Google Business Profile", copy.faqMaps],
    ["Content alone may not be enough. The issue may involve technical errors", copy.faqTraffic],
    ["DGS focuses on clear strategy", copy.faqWhy],
    ["No serious SEO team should guarantee rankings", copy.faqGuarantee],
  ];
  let localSeen = false;
  for (const [start, replacement] of replacements) {
    if (start === "Our local SEO services in") {
      if (!localSeen) {
        out = replaceParagraphStarting(out, start, copy.localFramework);
        localSeen = true;
      } else {
        out = replaceParagraphStarting(out, start, copy.whyLocal);
      }
    } else {
      out = replaceParagraphStarting(out, start, replacement);
    }
  }
  // Fix cross-city Pune link on Bangalore, Gurugram, and Hyderabad pages so it points directly to canonical /services/seo-service-pune/
  out = out.replace(/href=["']\/services\/seo-services-in-pune\/["']/gi, 'href="/services/seo-service-pune/"');
  return applyProcessCopy(path, applyIndustryRows(path, out));
}

function applyPuneWebDevContent(html: string): string {
  let out = html;
  // Update H1 & Hero Pill for commercial "Web Development Agency in Pune" intent
  out = out.replace(
    /<h1 class="hero-h1">\s*<span class="outline">Website Development<\/span>\s*Company in Pune\s*<span class="grad">Built for Leads, SEO &amp; Growth<\/span>\s*<\/h1>/i,
    '<h1 class="hero-h1"><span class="outline">Web Development</span> Agency in Pune <span class="grad">Built for Leads, SEO &amp; Growth</span></h1>',
  );
  out = out.replace(
    /Website Development Company in Pune • Custom Websites • SEO-Ready • AMC/g,
    "Web Development Agency in Pune • Custom Websites • SEO-Ready • AMC",
  );
  // Rewrite internal SEO link to point to Pune SEO instead of Mumbai SEO
  out = out.replace(
    /<a class="inline-link" href="\/services\/seo-services-in-mumbai\/">SEO<\/a>/g,
    '<a class="inline-link" href="/services/seo-service-pune/">SEO services in Pune</a>',
  );
  out = out.replace(
    /<a class="inline-link" href="\/services\/seo-services-in-mumbai\/">SEO services in Mumbai<\/a>/g,
    '<a class="inline-link" href="/services/seo-service-pune/">SEO services in Pune</a>',
  );

  const webDevReplacements: Array<[string, string]> = [
    [
      "D'Genius Solutions is a website development company in Pune",
      "D'Genius Solutions is a full-stack <strong>web development agency in Pune</strong> and custom website development company building high-speed, conversion-engineered and SEO-ready websites across WordPress, Next.js, React, WooCommerce and PHP for Pune's IT, SaaS, automotive, manufacturing, education and real estate leaders.",
    ],
    [
      "D'Genius Solutions combines website development with content structure",
      "Pune's business landscape — spanning Hinjawadi and Kharadi software firms, Pimpri-Chinchwad and Chakan engineering manufacturers, Baner and Wakad real estate developers, and leading educational institutions — requires websites that do far more than look modern. We combine custom UI/UX design, clean frontend/backend engineering, technical SEO architecture, GA4/GTM attribution and dependable Website AMC support.",
    ],
    [
      "A website development company plans, designs, develops, launches and maintains",
      "A specialist web development agency in Pune plans, designs, engineers, launches and maintains business websites, B2B capability portals, SaaS marketing sites and e-commerce stores. At D'Genius Solutions, every Pune website build begins with buyer-journey mapping, page speed targets and search-ready information architecture.",
    ],
    [
      "A slow, outdated or poorly structured website can reduce trust",
      "For Pune companies competing in crowded IT, industrial, real estate or education categories, an outdated template or sluggish mobile experience silently leaks high-intent enquiries before sales teams ever hear from the prospect.",
    ],
    [
      "This section explains the core website design and development services",
      "We deliver end-to-end custom web design, full-stack development, technical SEO foundations and ongoing Website AMC tailored to how Pune B2B, SaaS, industrial and consumer brands generate revenue.",
    ],
    [
      "Custom WordPress websites for businesses that need structured service pages",
      "Custom WordPress website development for Pune businesses that need fast, modular service pages, capability hubs, landing pages and secure editorial workflows without plugin bloat.",
    ],
    [
      "Custom website development is suitable when a business needs specialised workflows",
      "Bespoke Next.js, React, Node.js and PHP web development for Pune SaaS companies, engineering manufacturers and enterprises requiring custom API integrations, CRM workflows, dealer portals or headless CMS performance.",
    ],
    [
      "An e-commerce website needs more than attractive product pages",
      "High-converting WooCommerce and custom e-commerce development for Pune D2C brands, retail businesses and B2B industrial catalog sellers — complete with structured product schema, payment gateway integration and fast mobile checkout.",
    ],
    [
      "A redesign should improve the brand and user experience without carelessly removing",
      "Zero-loss website redesign and replatforming for established Pune organisations: we audit existing rankings, map 301 redirects, preserve backlink equity and upgrade UI/UX and Core Web Vitals simultaneously.",
    ],
    [
      "SEO-friendly website development begins before launch",
      "Every Pune website we build ships with semantic H1–H3 hierarchy, clean URL architecture, crawlable internal links, JSON-LD schema markup, Core Web Vitals optimisation and readiness for Google AI Overviews.",
    ],
    [
      "Website AMC keeps a live website monitored, updated and usable after launch",
      "Dedicated Website Annual Maintenance Contracts (AMC) for Pune businesses covering uptime monitoring, security patching, backups, Core Web Vitals maintenance, landing-page updates and priority technical support.",
    ],
    [
      "The best website development company for a business is not simply",
      "When evaluating a web development agency in Pune, look beyond surface-level portfolio screenshots. Compare how the engineering team structures buyer journeys, protects SEO equity during launch, integrates CRM/analytics tracking and supports your website post-launch.",
    ],
    [
      "D'Genius Solutions supports startups, SMEs, manufacturers, technology companies",
      "From Hinjawadi, Kharadi and Magarpatta technology teams to Pimpri-Chinchwad, Bhosari and Chakan industrial manufacturers and Baner, Wakad and Viman Nagar service brands, D'Genius Solutions delivers Pune web development engineered for long-term search and lead growth.",
    ],
    [
      "D'Genius Solutions provides website strategy, sitemap planning, UI/UX design",
      "As a full-service web development agency in Pune, D'Genius Solutions provides sitemap architecture, custom UI/UX design, WordPress and Next.js/React development, WooCommerce builds, zero-loss website redesigns, technical SEO setup, GA4/GTM conversion tracking and ongoing Website AMC support.",
    ],
    [
      "We work with WordPress, WooCommerce, HTML5, CSS and SCSS, JavaScript, React, Next.js and PHP",
      "Our Pune web development team engineers websites using Next.js, React, TypeScript, WordPress, WooCommerce, PHP, Node.js, HTML5 and modern CSS/SCSS. We recommend the stack based on whether your Pune business needs rapid marketing agility, headless SaaS performance or custom B2B integrations.",
    ],
    [
      "A focused business website may take approximately four to six weeks",
      "A focused corporate or B2B website for a Pune business typically takes 4 to 6 weeks from discovery and UI/UX wireframing to QA and launch, while larger custom Next.js applications, multi-project portals or e-commerce stores take 6 to 10+ weeks depending on integrations.",
    ],
    [
      "Pricing is based on the number of page templates, content volume, UI/UX complexity",
      "Website development cost in Pune depends on custom UI/UX template count, CMS or Next.js architecture, e-commerce or CRM integrations, content creation needs and AMC support scope. We provide a transparent, itemised proposal after reviewing your requirements.",
    ],
  ];

  for (const [start, replacement] of webDevReplacements) {
    out = replaceParagraphStarting(out, start, replacement);
  }
  return out;
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

const LOCATION_INDUSTRIES: Record<string, { heading: string; rows: IndustryRow[] }> = {
  "/services/seo-service-pune/": {
    heading: "SEO for Pune's technology, industrial and high-intent local markets",
    rows: [
      { title: "IT &amp; SaaS SEO", description: "Solution, feature, integration and comparison pages for Pune technology businesses competing for informed B2B buyers.", metric: "Demos &amp; qualified leads" },
      { title: "Engineering &amp; Manufacturing SEO", description: "Capability, process, application and industry pages that help technical buyers discover suppliers and specialist manufacturers.", metric: "RFQs &amp; sales enquiries" },
      { title: "Automotive &amp; Component SEO", description: "Search architecture for component manufacturers, service providers and automotive businesses across Pune's industrial ecosystem.", metric: "Commercial enquiries" },
      { title: "Education SEO", description: "Course, admission, programme and comparison journeys for institutes competing for students across Pune and beyond.", metric: "Counselling leads" },
      { title: "Real Estate SEO", description: "Project, configuration and locality-led discovery for developers and property businesses where location materially changes buyer intent.", metric: "Project enquiries" },
      { title: "Local Service SEO", description: "Maps, reviews, service-area relevance and conversion-ready pages for businesses whose customers search within Pune neighbourhoods.", metric: "Calls &amp; bookings" },
    ],
  },
  "/services/seo-service-in-banglore/": {
    heading: "SEO for Bengaluru's product, technology and innovation economy",
    rows: [
      { title: "SaaS &amp; Product SEO", description: "Feature, integration, use-case, alternative and comparison architecture for software companies selling to sophisticated buyers.", metric: "Trials &amp; demos" },
      { title: "Enterprise Technology SEO", description: "Solution and industry content for IT, cloud, data, cybersecurity and transformation providers with longer B2B sales cycles.", metric: "Qualified pipeline" },
      { title: "Biotech &amp; Healthtech SEO", description: "Clear technical pages, evidence and topic architecture for specialised businesses where accuracy and trust influence discovery.", metric: "Relevant enquiries" },
      { title: "Aerospace &amp; Deep-Tech SEO", description: "Capability-led search content for complex engineering, aerospace, electronics and R&amp;D businesses serving specialist markets.", metric: "B2B opportunities" },
      { title: "D2C &amp; E-commerce SEO", description: "Category, product, merchant and content optimisation for Bengaluru brands competing for high-intent consumer demand.", metric: "Organic revenue" },
      { title: "Bengaluru Local SEO", description: "Profile, review and location relevance for businesses that genuinely depend on neighbourhood and city-level customer discovery.", metric: "Calls &amp; visits" },
    ],
  },
  "/services/seo-service-in-gurugram/": {
    heading: "SEO for Gurugram's enterprise, NCR and industrial demand",
    rows: [
      { title: "Enterprise B2B SEO", description: "Service, industry, use-case and decision-stage content for corporate buyers comparing specialist vendors across Gurugram, NCR and India.", metric: "Qualified opportunities" },
      { title: "IT, ITeS &amp; BPO SEO", description: "Commercial search architecture for technology, outsourcing and business-process providers competing for complex service demand.", metric: "Sales enquiries" },
      { title: "Automotive &amp; Industrial SEO", description: "Capability and application pages for manufacturers, component companies and industrial suppliers across the Gurugram-Manesar ecosystem.", metric: "RFQs &amp; leads" },
      { title: "Real Estate SEO", description: "Project, configuration, developer and location intent mapped to enquiry-ready pages for a highly competitive NCR property market.", metric: "Project enquiries" },
      { title: "Professional Services SEO", description: "Trust-led service and expertise content for consulting, finance, legal, HR and other firms selling to corporate decision-makers.", metric: "Consultations" },
      { title: "D2C &amp; Retail SEO", description: "Category, product and local-discovery optimisation for consumer brands serving Gurugram and wider NCR audiences.", metric: "Revenue &amp; store actions" },
    ],
  },
  "/services/seo-services-in-hyderabad/": {
    heading: "SEO for Hyderabad's technology, life-sciences and local growth markets",
    rows: [
      { title: "IT &amp; SaaS SEO", description: "Solution, feature, integration and comparison content for Hyderabad technology companies competing for B2B and global demand.", metric: "Demos &amp; pipeline" },
      { title: "Pharma &amp; Life Sciences SEO", description: "Technically precise service, capability and topic pages where accuracy, evidence and trust are essential to discovery.", metric: "Relevant B2B enquiries" },
      { title: "Healthcare SEO", description: "Service, speciality and local-intent optimisation that helps patients and decision-makers find clear, trustworthy information.", metric: "Appointments &amp; enquiries" },
      { title: "Real Estate SEO", description: "Project, configuration and locality-driven search journeys for developers and property businesses across Hyderabad's growth corridors.", metric: "Project leads" },
      { title: "Education SEO", description: "Programme, admission, comparison and student-research content for institutions competing across Hyderabad and national searches.", metric: "Applications &amp; counselling" },
      { title: "Hyderabad Local SEO", description: "Maps, reviews, citations and genuine locality relevance for businesses whose customers search by area, proximity and availability.", metric: "Calls &amp; visits" },
    ],
  },
};

function applyIndustryRows(path: string, html: string): string {
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

const LOCATION_PROCESS: Record<string, LocationProcessCopy> = {
  "/services/seo-service-pune/": {
    discovery:
      "For Pune businesses, local discovery should reflect genuine service coverage across the city's technology, residential and industrial zones. We strengthen Maps and local organic signals around the areas that matter to customers, while keeping the main service architecture strong enough to compete for city-wide and non-local commercial searches.",
    leads:
      "A useful Pune campaign distinguishes a student counselling enquiry, a manufacturing RFQ, a SaaS demo request, a property enquiry and a neighbourhood service call. We configure measurement around the actions that matter to the business so organic growth can be judged by lead quality as well as rankings and sessions.",
    steps: [
      "We review the business model, priority services, target areas and whether demand comes from local customers, B2B buyers or a wider Indian market.",
      "We separate Pune city intent from locality, industry and solution intent so one page is not forced to rank for every type of search.",
      "We resolve crawl, indexing, performance, schema, redirect and internal-link issues before scaling content across additional service or location themes.",
      "We strengthen the pages buyers need to evaluate the business, then add supporting content for questions, comparisons and sector-specific research where it has a clear purpose.",
      "We connect Search Console and analytics data with calls, forms, WhatsApp activity, counselling enquiries, RFQs or other conversion actions relevant to the campaign.",
    ],
  },
  "/services/seo-service-in-banglore/": {
    discovery:
      "Bengaluru companies may need local discovery, but many are really competing for national or global product and B2B searches. We decide whether Maps, city relevance, solution authority or international demand should lead the strategy and prevent local optimisation from diluting higher-value product or enterprise pages.",
    leads:
      "For Bengaluru campaigns, the meaningful conversion may be a product trial, demo request, enterprise consultation, technical enquiry, ecommerce purchase or local appointment. We build attribution around those outcomes so high traffic from broad technology topics does not hide whether search is contributing to pipeline or revenue.",
    steps: [
      "We map the product, service and revenue model first, including whether the company sells locally, across India or into international markets.",
      "We organise searches into product, feature, integration, problem, alternative, industry and vendor-comparison journeys rather than treating every keyword as a blog topic.",
      "We audit JavaScript rendering, crawl paths, canonicalisation, performance, indexation and internal architecture that can become complex on fast-growing technology sites.",
      "We improve solution and product pages before expanding into comparison, use-case and educational content that supports sophisticated buyer research.",
      "We measure demos, trials, sales enquiries, ecommerce revenue or local actions alongside organic visibility so reporting reflects the actual business model.",
    ],
  },
  "/services/seo-service-in-gurugram/": {
    discovery:
      "Gurugram search demand crosses local, NCR and enterprise intent. We separate Maps and city-level discovery from wider Delhi NCR service searches and national B2B research so a local landing page is not expected to carry every commercial query. Gurgaon variants are handled naturally where buyers still use the older name, without duplicating the same page.",
    leads:
      "For Gurugram businesses, the conversion may be an enterprise consultation, corporate service enquiry, manufacturing RFQ, property lead, recruitment or professional-services meeting. Reporting is built around those actions so strong rankings are evaluated against actual pipeline quality rather than traffic volume alone.",
    steps: [
      "We identify whether the priority market is Gurugram itself, the wider Delhi NCR region, national enterprise buyers or a combination of those audiences.",
      "We separate local-service, Gurgaon/Gurugram variant, industry, solution and enterprise decision-stage searches so pages have clear commercial roles.",
      "We audit crawlability, indexation, duplicate city targeting, JavaScript rendering, canonical signals, redirects, performance and internal architecture before adding new content.",
      "We strengthen capability, industry, use-case, proof and comparison pages that procurement teams and business leaders need during a longer evaluation cycle.",
      "We connect organic visibility to consultations, RFQs, sales forms, calls, WhatsApp actions and qualified-lead feedback so NCR growth is measured by business outcomes.",
    ],
  },
  "/services/seo-services-in-hyderabad/": {
    discovery:
      "Hyderabad search strategy needs to distinguish neighbourhood demand from city-wide commercial searches and specialist B2B research. We decide whether Maps, service-area relevance, technology authority, life-sciences expertise or national visibility should lead, then keep those intents separated so locality pages do not compete with core service and industry content.",
    leads:
      "Hyderabad campaigns may generate very different outcomes: SaaS demos, technical B2B enquiries, healthcare appointments, property leads, admissions enquiries or local service calls. We map conversion tracking to the business model so performance is judged by the value of the resulting actions, not simply by increases in sessions.",
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
