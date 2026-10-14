import fs from 'fs';

const canonicalAi = JSON.parse(fs.readFileSync('data/portfolio/canonical-ai-videos.json', 'utf8'));
const mediaData = JSON.parse(fs.readFileSync('data/design-preview/portfolio-media.json', 'utf8')).items;

// Define the 8 curated homepage AI videos
const HOMEPAGE_FEATURED_URLS = [
  '/media/portfolio/videos/hyundai_creta_1.mp4',
  '/media/portfolio/videos/sundaram_bal_3_1.mp4',
  '/media/portfolio/videos/clarion_jasmine_atta_hindi.mp4',
  '/media/portfolio/videos/better_ceasons_tenant.mp4',
  'https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4',
  'https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4',
  'https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mango-Farm-Preview11.mp4',
  'https://www.dgeniussolutions.com/wp-content/uploads/2026/07/freepik_cinematic-luxury-event-scene-elegant-indian-woman-_kling_720p_16-9_24fps_64450.mp4'
];

// Map 56 AI Videos into canonical Master Item Model
const aiItems = canonicalAi.map((item, index) => {
  const isWide = !!item.wide;
  const w = item.width || (isWide ? 1920 : 1080);
  const h = item.height || (isWide ? 1080 : 1920);
  const ratio = Math.round((w / h) * 10000) / 10000;
  const orientation = ratio >= 1.2 ? 'landscape' : 'portrait';
  const rawThumb = item.thumb
    ? item.thumb.replace(/^https?:\/\/[^\/]+/i, '')
    : (item.url || '').replace(/^https?:\/\/[^\/]+/i, '').replace(/\.(mp4|webm)$/i, '-thumb.webp');
  const thumb = rawThumb.startsWith('/') ? rawThumb : `/${rawThumb}`;
  const webmUrl = item.url.replace(/\.mp4$/i, '.webm');
  const mp4Url = item.url.replace(/\.webm$/i, '.mp4');
  const videoId = (item.url || '').split('/').pop()?.replace(/\.[^.]+$/, '') || `ai-video-${index}`;

  const isHomepageFeatured = HOMEPAGE_FEATURED_URLS.includes(item.url);

  // Derive client from title or id
  let client = 'D\'Genius Solutions';
  if (item.title.includes('Hyundai')) client = 'Hyundai India';
  else if (item.title.includes('Sundaram')) client = 'Sundaram E-Learning';
  else if (item.title.includes('Clarion')) client = 'Clarion Agro';
  else if (item.title.includes('Better Ceasons')) client = 'Better Ceasons';
  else if (item.title.includes('Sai') || item.title.includes('Vachaan')) client = 'Shirdi Se Sai';
  else if (item.title.includes('Home Credit')) client = 'Home Credit India';
  else if (item.title.includes('Baanganga')) client = 'Baanganga Jewellery';

  return {
    id: videoId,
    title: item.title,
    alt: `${item.title} - D'Genius Solutions AI Video Production`,
    client: client,
    type: 'video',
    mediaType: 'video',
    workType: 'ai-video',
    url: item.url,
    sources: { webm: webmUrl, mp4: mp4Url },
    poster: {
      width: w,
      height: h,
      avif: thumb.replace(/\.(webp|png|jpg|jpeg)$/i, '.avif'),
      webp: thumb,
      fallback: thumb
    },
    width: w,
    height: h,
    ratio: ratio,
    orientation: orientation,
    primaryCategory: 'ai-video',
    categories: item.categories || ['all', item.category],
    industryTags: [item.cat || item.category],
    priority: index + 1,
    isLatest: index < 17,
    homepageFeatured: isHomepageFeatured,
    aiVideo: true,
    hidden: false
  };
});

// Map legacy items (excluding those in canonical AI videos)
const existingAiUrls = new Set(canonicalAi.map(c => c.url));
const existingAiIds = new Set(aiItems.map(a => a.id));

const legacyItemsRaw = mediaData.filter(m => {
  const isDuplicateAi = m.id.includes('hyundai') || m.id.includes('sundaram') || m.id.includes('clarion') || m.id.includes('better-ceasons') || m.id.includes('shirdi-sai') || m.id === 'home-credit-diwali';
  return !isDuplicateAi;
});

// Clean title helper for legacy items
function formatLegacyTitle(item, category) {
  if (item.title && item.title.trim() && !/^ss[_\s-]*\d+/i.test(item.title) && !/^picture\d+/i.test(item.title) && !/^\d+$/.test(item.title) && !/^[0-9x]+$/i.test(item.title) && !item.title.startsWith('Artboard')) {
    return item.title.replace(/_/g, ' ').replace(/\s*\(\d+\)$/, '').replace(/copy( \d+)?/i, '').trim();
  }
  // Title fallbacks based on ID and category
  if (item.id.startsWith('picture')) {
    return item.title || `Creative Showcase ${item.id}`;
  }
  if (item.id.startsWith('media')) {
    return `Brand Video Production ${item.id.replace('media', '#')}`;
  }
  if (item.id === '63151') return 'Standee Design & Brand Identity';
  if (item.id === '63149') return 'Fashion Campaign Visual — Women';
  if (item.id === '63148') return 'Fashion Campaign Visual — Men';
  if (item.id === '63147') return 'Editorial Brand Artboard';
  if (item.id === '63121') return 'Luxury Fashion Art Direction';
  if (item.id === '63120') return 'Creative Composition Suite';
  if (item.id.startsWith('63158') || item.id.startsWith('63159') || item.id.startsWith('63160') || item.id.startsWith('63161') || item.id.startsWith('63162') || item.id.startsWith('63163') || item.id.startsWith('63164')) {
    const num = item.id.slice(-2);
    return `Brand Visual Design Concept ${num}`;
  }
  return `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Project ${item.id}`;
}

// Categorize legacy items
const socialMediaIds = new Set([
  '63145', '63143', '63142', '63141', '63140', '63139', '63137', '63136', '63135',
  '63134', '63133', '63132', '63131', '63130', '63128', '63127', '63126', '63125',
  '63124', '63123', '63119', '63118', '63112', '63109', '63107', '63101', '63097',
  '63096', '63095', '63092', '63089', '63088',
  'picture4', 'picture8', 'picture12', 'picture13', 'picture15', 'picture16'
]);

const brandingIds = new Set([
  'picture1', 'picture7', 'picture9', 'picture11', 'picture17',
  '63151', '63149', '63148', '63147', '63116', '63115', '63114', '63111',
  '63106', '63104', '63102', '63100', '63099', '63098', '63091', '63090'
]);

const creativeDesignIds = new Set([
  'picture2', 'picture5', 'picture10', 'picture14', 'picture18', 'picture19',
  '63158', '63159', '63160', '63161', '63162', '63163', '63164',
  '63121', '63120', '63117', '63113', '63108', '63093'
]);

// Any remaining legacy items go to other-work (e.g. media1..media6, picture3, 63138)
const legacyProcessed = legacyItemsRaw.map((item, idx) => {
  let primaryCategory = 'other-work';
  let workType = 'other-work';

  if (socialMediaIds.has(item.id)) {
    primaryCategory = 'social-media';
    workType = 'social-media';
  } else if (brandingIds.has(item.id)) {
    primaryCategory = 'branding';
    workType = 'branding';
  } else if (creativeDesignIds.has(item.id)) {
    primaryCategory = 'creative-design';
    workType = 'creative-design';
  }

  const title = formatLegacyTitle(item, primaryCategory);
  const isVideo = item.type === 'video';

  const w = item.sourceWidth || (item.orientation === 'portrait' ? 1080 : 1920);
  const h = item.sourceHeight || (item.orientation === 'portrait' ? 1920 : 1080);
  const ratio = Math.round((item.ratio || w / h) * 10000) / 10000;

  const fallback = isVideo
    ? (item.poster?.fallback || item.poster?.webp || '')
    : (item.variants?.fallback || '');

  return {
    id: item.id,
    title: title,
    alt: item.alt || `${title} - D'Genius Solutions Creative Project`,
    client: 'D\'Genius Solutions',
    type: item.type,
    mediaType: item.type,
    workType: workType,
    url: isVideo ? item.sources?.mp4 || '' : fallback,
    sources: isVideo ? item.sources : undefined,
    variants: !isVideo ? item.variants : undefined,
    poster: isVideo ? item.poster : {
      width: w,
      height: h,
      avif: fallback.replace(/\.webp$/i, '.avif'),
      webp: fallback,
      fallback: fallback
    },
    width: w,
    height: h,
    ratio: ratio,
    orientation: item.orientation || (ratio >= 1.2 ? 'landscape' : 'portrait'),
    primaryCategory: primaryCategory,
    categories: ['all', primaryCategory],
    industryTags: [primaryCategory],
    priority: 56 + idx + 1,
    isLatest: false,
    homepageFeatured: false,
    aiVideo: false,
    hidden: false
  };
});

const masterPortfolio = [...aiItems, ...legacyProcessed];

fs.writeFileSync('data/portfolio/master-portfolio.json', JSON.stringify(masterPortfolio, null, 2));

console.log('Successfully generated data/portfolio/master-portfolio.json');
console.log('=============================================');
console.log('MASTER PORTFOLIO TOTAL =', masterPortfolio.length);
console.log('AI VIDEO TOTAL =', masterPortfolio.filter(m => m.workType === 'ai-video').length);
console.log('SOCIAL MEDIA TOTAL =', masterPortfolio.filter(m => m.workType === 'social-media').length);
console.log('BRANDING TOTAL =', masterPortfolio.filter(m => m.workType === 'branding').length);
console.log('CREATIVE DESIGN TOTAL =', masterPortfolio.filter(m => m.workType === 'creative-design').length);
console.log('OTHER WORK TOTAL =', masterPortfolio.filter(m => m.workType === 'other-work').length);
console.log('HOMEPAGE AI CURATED =', masterPortfolio.filter(m => m.homepageFeatured).length);
console.log('=============================================');
