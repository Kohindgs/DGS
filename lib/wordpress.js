const WP_API = process.env.WP_API_URL || 'https://www.dgeniussolutions.com/wp-json/wp/v2';

async function wpFetch(path, { revalidate = 300 } = {}) {
  const url = path.startsWith('http') ? path : `${WP_API}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'DGS-NextJS/1.0' },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`WordPress API ${res.status} for ${url}`);
  }
  const data = await res.json();
  return { data, headers: res.headers };
}

export async function getPageBySlug(slug) {
  const { data } = await wpFetch(`/pages?slug=${encodeURIComponent(slug)}&_embed`);
  return data?.[0] || null;
}

export async function getPageById(id) {
  const { data } = await wpFetch(`/pages/${id}?_embed`);
  return data;
}

export async function getAllPages() {
  const pages = [];
  let page = 1;
  while (page <= 10) {
    const { data } = await wpFetch(
      `/pages?per_page=100&page=${page}&status=publish&_fields=id,slug,title,link,parent,menu_order,status`
    );
    if (!Array.isArray(data) || data.length === 0) break;
    pages.push(...data);
    if (data.length < 100) break;
    page += 1;
  }
  return pages;
}

export async function getPosts({ page = 1, perPage = 12, embed = true } = {}) {
  const embedParam = embed ? '&_embed' : '';
  const fields = embed
    ? ''
    : '&_fields=id,slug,title,excerpt,date,link';
  const { data, headers } = await wpFetch(
    `/posts?per_page=${perPage}&page=${page}${embedParam}${fields}&status=publish`
  );
  return {
    posts: Array.isArray(data) ? data : [],
    total: Number(headers.get('X-WP-Total') || 0),
    totalPages: Number(headers.get('X-WP-TotalPages') || 0),
  };
}

export async function getPostBySlug(slug) {
  const { data } = await wpFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed`);
  return data?.[0] || null;
}

export async function getServices({ embed = true } = {}) {
  try {
    const embedParam = embed ? '&_embed' : '';
    const fields = embed ? '' : '&_fields=id,slug,title,excerpt,link';
    const { data } = await wpFetch(`/services?per_page=100${embedParam}${fields}&status=publish`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug) {
  try {
    const { data } = await wpFetch(`/services?slug=${encodeURIComponent(slug)}&_embed`);
    return data?.[0] || null;
  } catch {
    return null;
  }
}

export function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function decodeEntities(text = '') {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function getTitle(item) {
  return decodeEntities(item?.title?.rendered || '');
}

export function getExcerpt(item, max = 180) {
  const raw = stripHtml(item?.excerpt?.rendered || item?.content?.rendered || '');
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

export function getFeaturedImage(item) {
  const media = item?._embedded?.['wp:featuredmedia']?.[0];
  return media?.source_url || null;
}

/** Rewrite internal WP links to local paths; keep media URLs absolute. Strip unsafe tags. */
export function prepareWpHtml(html = '') {
  if (!html) return '';
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"])[\s\S]*?\1/gi, '')
    .replace(/javascript:/gi, '');

  out = out.replace(
    /href=(["'])https?:\/\/(?:www\.)?dgeniussolutions\.com([^"']*)\1/gi,
    (_, q, path) => {
      let p = path || '/';
      if (/\/best-digital-marketing-agency-in-mumbai\/?$/i.test(p)) p = '/';
      return `href=${q}${p}${q}`;
    }
  );

  out = out.replace(/href=(["'])\/best-digital-marketing-agency-in-mumbai\/?\1/gi, 'href="/"');

  return out;
}

export function wpMetadata(item, { fallbackTitle, fallbackDescription, path = '/' } = {}) {
  const title = getTitle(item) || fallbackTitle || SITE.name;
  const description =
    getExcerpt(item, 160) ||
    fallbackDescription ||
    "Mumbai's digital marketing agency for SEO, AEO, GEO, AI video, and performance growth.";
  const image = getFeaturedImage(item);
  return {
    title: `${title} | ${SITE.name}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `https://www.dgeniussolutions.com${path}`,
      siteName: SITE.name,
      locale: 'en_IN',
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export const SITE = {
  name: "D'Genius Solutions",
  url: 'https://www.dgeniussolutions.com',
  phone: '+91-9987922901',
  email: 'contact@dgeniussolutions.com',
  address: 'SV Road, Khar West, Mumbai 400050',
  homeSlug: 'best-digital-marketing-agency-in-mumbai',
};

/** Slugs handled by dedicated App Router folders (not app/[slug]). */
export const RESERVED_SLUGS = new Set(['blogs', 'services', 'api', '_next']);

export const PRIMARY_NAV = [
  { href: '/about-us', label: 'About Us' },
  { href: '/our-services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/case_studies', label: 'Case Studies' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/career', label: 'Careers' },
  { href: '/contact-us', label: 'Contact' },
];

export const SERVICE_LINKS = [
  { href: '/services/seo-services-in-mumbai', label: 'SEO Services' },
  { href: '/services/aeo-services-in-mumbai', label: 'AEO Services' },
  { href: '/services/geo', label: 'GEO Services' },
  { href: '/services/llm-seo-service', label: 'LLM SEO' },
  { href: '/services/ai-video-production-agency', label: 'AI Video Production' },
  { href: '/services/social-media-marketing', label: 'Social Media' },
  { href: '/services/performance-marketing', label: 'Performance Marketing' },
  { href: '/services/website-development-amc', label: 'Website Development' },
  { href: '/services/branding', label: 'Branding' },
  { href: '/services/content-creation', label: 'Content Creation' },
];

export const HOME_SERVICES = [
  {
    num: '01',
    badge: 'Next-Gen Media',
    title: 'AI Video Production',
    desc: 'Hyper-realistic AI avatars, viral shorts, brand commercials, and cinema-grade synthetic video at scale.',
    tags: ['AI Avatars', '3D Shorts', 'TVCs'],
    href: '/services/ai-video-production-agency',
  },
  {
    num: '02',
    badge: 'Generative Search',
    title: 'SEO, AEO, GEO & LLM',
    desc: 'Dominate Google AI Overviews, Perplexity, and ChatGPT Search with entity graphs and schema authority.',
    tags: ['AI Overview', 'Perplexity', 'Entity Graph'],
    href: '/services/aeo-services-in-mumbai',
  },
  {
    num: '03',
    badge: 'Web Architecture',
    title: 'Website Development',
    desc: 'High-performance websites and apps engineered for Core Web Vitals, conversion, and AEO-ready structure.',
    tags: ['Next.js', 'CWV', 'Conversion'],
    href: '/services/website-development-amc',
  },
  {
    num: '04',
    badge: 'Organic Growth',
    title: 'Social Media Marketing',
    desc: 'Content calendars, reels, influencer campaigns, and engagement systems that grow brand presence.',
    tags: ['Reels', 'Community', 'Influencer'],
    href: '/services/social-media-marketing',
  },
  {
    num: '05',
    badge: 'High-ROAS',
    title: 'Performance Marketing',
    desc: 'Full-funnel Google and Meta ads systems built for qualified leads, sales, and measurable ROI.',
    tags: ['Google Ads', 'Meta Ads', 'CRO'],
    href: '/services/performance-marketing',
  },
  {
    num: '06',
    badge: 'Brand Identity',
    title: 'Branding & Content',
    desc: 'Brand positioning, visual systems, and multi-channel creative that make every touchpoint consistent.',
    tags: ['Identity', 'Copy', 'Creative'],
    href: '/services/branding',
  },
];
