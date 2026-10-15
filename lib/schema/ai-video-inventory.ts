import { absoluteUrl } from "@/lib/seo/site";
import { ORGANIZATION_ID } from "@/lib/schema/entity";
import { videoObjectSchema } from "@/lib/schema/builders";

/**
 * 27 Verified AI Videos with genuine publication dates extracted directly
 * from original WordPress media records (data/wordpress/raw/media.json).
 * All dates are ISO 8601 timestamps in Indian Standard Time (+05:30).
 */
export const VERIFIED_AI_VIDEO_INVENTORY = [
  {
    name: "Makar Sankranti & Pongal AI Mascot Video",
    description: "Makar Sankranti & Pongal AI Mascot Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: MASCOT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Makar-Sankranti-And-Pongal-Final-1-thumb.webp",
    uploadDate: "2026-04-10T19:10:33+05:30",
    mediaId: 63033,
    category: "MASCOT AI",
  },
  {
    name: "Wonder AI Mascot Introduction",
    description: "Wonder AI Mascot Introduction video by D'Genius Solutions, an AI video production agency in Mumbai. Category: MASCOT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wonder-Introduction11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Wonder-Introduction11-thumb.webp",
    uploadDate: "2026-04-09T15:18:45+05:30",
    mediaId: 62970,
    category: "MASCOT AI",
  },
  {
    name: "Happy Easter AI Festival Video",
    description: "Happy Easter AI Festival Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Easter.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Easter-thumb.webp",
    uploadDate: "2026-04-10T19:08:47+05:30",
    mediaId: 63031,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Hanuman Jayanti AI Festival Video",
    description: "Hanuman Jayanti AI Festival Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Hanuman-Jayanti-Final.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Hanuman-Jayanti-Final-thumb.webp",
    uploadDate: "2026-04-10T19:08:03+05:30",
    mediaId: 63030,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Navratri AI Campaign Video",
    description: "Navratri AI Campaign Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Navratri11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Navratri11-thumb.webp",
    uploadDate: "2026-04-09T15:19:00+05:30",
    mediaId: 62979,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Lohri AI Festival Video",
    description: "Lohri AI Festival Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lohri11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lohri11-thumb.webp",
    uploadDate: "2026-04-09T15:18:56+05:30",
    mediaId: 62977,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Independence Day AI Video",
    description: "Independence Day AI Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Independence-Day-Dgs11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Independence-Day-Dgs11-thumb.webp",
    uploadDate: "2026-04-09T15:18:52+05:30",
    mediaId: 62974,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Friendship Day AI Video",
    description: "Friendship Day AI Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Friendship-Day11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Happy-Friendship-Day11-thumb.webp",
    uploadDate: "2026-04-09T15:18:48+05:30",
    mediaId: 62972,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Diwali AI Campaign Video",
    description: "Diwali AI Campaign Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: FESTIVAL VIDEOS.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dgs-Diwali11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dgs-Diwali11-thumb.webp",
    uploadDate: "2026-04-09T15:17:03+05:30",
    mediaId: 62966,
    category: "FESTIVAL VIDEOS",
  },
  {
    name: "Mango Farm AI Product Video",
    description: "Mango Farm AI Product Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: PRODUCT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mango-Farm-Preview11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Mango-Farm-Preview11-thumb.webp",
    uploadDate: "2026-04-09T15:18:57+05:30",
    mediaId: 62978,
    category: "PRODUCT AI",
  },
  {
    name: "Lava Women AI Product Video",
    description: "Lava Women AI Product Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: PRODUCT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lava-Women11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Lava-Women11-thumb.webp",
    uploadDate: "2026-04-09T15:18:54+05:30",
    mediaId: 62976,
    category: "PRODUCT AI",
  },
  {
    name: "Ice Cream Cone AI Product Video",
    description: "Ice Cream Cone AI Product Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: PRODUCT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Ice-Cream-Cone11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Ice-Cream-Cone11-thumb.webp",
    uploadDate: "2026-04-09T15:18:50+05:30",
    mediaId: 62973,
    category: "PRODUCT AI",
  },
  {
    name: "WINN Green Chilli Sauce AI Product Video",
    description: "WINN Green Chilli Sauce AI Product Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: PRODUCT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chilli11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Green-Chilli11-thumb.webp",
    uploadDate: "2026-04-09T15:18:46+05:30",
    mediaId: 62971,
    category: "PRODUCT AI",
  },
  {
    name: "WINN Dark Soya Sauce AI Product Video",
    description: "WINN Dark Soya Sauce AI Product Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: PRODUCT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dark-Soya11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Dark-Soya11-thumb.webp",
    uploadDate: "2026-04-09T15:16:58+05:30",
    mediaId: 62965,
    category: "PRODUCT AI",
  },
  {
    name: "Premium Jewellery AI Video",
    description: "Premium Jewellery AI Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: JEWELLERY AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Jewelry11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Jewelry11-thumb.webp",
    uploadDate: "2026-04-09T15:18:53+05:30",
    mediaId: 62975,
    category: "JEWELLERY AI",
  },
  {
    name: "Baanganga Launch AI Jewellery Video",
    description: "Baanganga Launch AI Jewellery Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: JEWELLERY AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test211.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test211-thumb.webp",
    uploadDate: "2026-04-09T15:14:47+05:30",
    mediaId: 62962,
    category: "JEWELLERY AI",
  },
  {
    name: "Baanganga Creative AI Jewellery Video",
    description: "Baanganga Creative AI Jewellery Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: JEWELLERY AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test111.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Test111-thumb.webp",
    uploadDate: "2026-04-09T15:14:22+05:30",
    mediaId: 62961,
    category: "JEWELLERY AI",
  },
  {
    name: "Baanganga Gold AI Jewellery Video",
    description: "Baanganga Gold AI Jewellery Video by D'Genius Solutions, an AI video production agency in Mumbai. Category: JEWELLERY AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Gold-Example11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Baanganga-Gold-Example11-thumb.webp",
    uploadDate: "2026-04-09T15:13:57+05:30",
    mediaId: 62960,
    category: "JEWELLERY AI",
  },
  {
    name: "Savage Horse AI Concept Film",
    description: "Savage Horse AI Concept Film by D'Genius Solutions, an AI video production agency in Mumbai. Category: CONCEPT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Savage-Horse11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Savage-Horse11-thumb.webp",
    uploadDate: "2026-04-09T15:18:43+05:30",
    mediaId: 62969,
    category: "CONCEPT AI",
  },
  {
    name: "Card Magic Man AI Concept Film",
    description: "Card Magic Man AI Concept Film by D'Genius Solutions, an AI video production agency in Mumbai. Category: CONCEPT AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Card-Magic-Man11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Card-Magic-Man11-thumb.webp",
    uploadDate: "2026-04-09T15:17:04+05:30",
    mediaId: 62967,
    category: "CONCEPT AI",
  },
  {
    name: "Home Credit Diwali AI TVC Campaign",
    description: "Home Credit Diwali AI TVC Campaign by D'Genius Solutions, an AI video production agency in Mumbai. Category: TVC AI.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/04/Diwali-Campaign-Home-Credit11-thumb.webp",
    uploadDate: "2026-04-09T15:18:17+05:30",
    mediaId: 62968,
    category: "TVC AI",
  },
  {
    name: "Vachaan 5 Teaser AI Avatar Video",
    description: "Vachaan 5 Teaser AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Vachaan-5-Teaser-thumb.webp",
    uploadDate: "2026-05-29T16:15:40+05:30",
    mediaId: 64030,
    category: "AI AVATAR",
  },
  {
    name: "Sai Ki Vaani - Derr AI Avatar Video",
    description: "Sai Ki Vaani Derr AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Derr-1-thumb.webp",
    uploadDate: "2026-05-29T16:15:21+05:30",
    mediaId: 64029,
    category: "AI AVATAR",
  },
  {
    name: "Sai Ki Vaani - Choothne Ka Darr AI Avatar Video",
    description: "Sai Ki Vaani Choothne Ka Darr AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Sai-Ki-Vaani_Choothne-Ka-Darr-1-thumb.webp",
    uploadDate: "2026-05-29T16:14:54+05:30",
    mediaId: 64028,
    category: "AI AVATAR",
  },
  {
    name: "Suno Sai Ko Vishwas Episode 7 AI Avatar Video",
    description: "Suno Sai Ko Vishwas Episode 7 AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Epsisode-7-Suno-Sai-Ko-Vishwas-2-thumb.webp",
    uploadDate: "2026-05-29T16:14:29+05:30",
    mediaId: 64027,
    category: "AI AVATAR",
  },
  {
    name: "Suno Sai Ko Prarthana Episode 12 AI Avatar Video",
    description: "Suno Sai Ko Prarthana Episode 12 AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-12-Suno-Sai-Ko-Prarthana-1-thumb.webp",
    uploadDate: "2026-05-29T16:14:06+05:30",
    mediaId: 64026,
    category: "AI AVATAR",
  },
  {
    name: "Suno Sai Ko Episode 3 AI Avatar Video",
    description: "Suno Sai Ko Episode 3 AI Avatar video by D'Genius Solutions, an AI video production agency in Mumbai. Category: AI AVATAR.",
    contentUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1.mp4",
    thumbnailUrl: "https://www.dgeniussolutions.com/wp-content/uploads/2026/05/Instagram-Episode-3-Suno-Sai-Ko-1-thumb.webp",
    uploadDate: "2026-05-29T16:13:38+05:30",
    mediaId: 64025,
    category: "AI AVATAR",
  },
] as const;

/**
 * Featured local video assets whose original first-publication date in client CMS
 * is not present in original WordPress media records (ingested locally in git commit e2c253c).
 * Per Google schema guidelines and strict audit instructions, they are excluded
 * from VideoObject structured data to prevent publishing unverified or artificial dates.
 */
export const UNVERIFIABLE_PORTFOLIO_VIDEOS = [
  {
    id: "hyundai_creta_1",
    name: "Hyundai Creta — Feature & Technology Explainer",
    reason: "Local asset ingested in commit e2c253c without legacy WordPress media record timestamp",
  },
  {
    id: "sundaram_bal_3_1",
    name: "Sundaram E-Learning — Interactive Curriculum Animation",
    reason: "Local asset ingested in commit e2c253c without legacy WordPress media record timestamp",
  },
  {
    id: "clarion_jasmine_atta_hindi",
    name: "Clarion Agro — Jasmine Atta Campaign",
    reason: "Local asset ingested in commit e2c253c without legacy WordPress media record timestamp",
  },
  {
    id: "better_ceasons_tenant",
    name: "Better Ceasons — 1000 Saal Ka Tenant Ad Campaign",
    reason: "Local asset ingested in commit e2c253c without legacy WordPress media record timestamp",
  },
] as const;

/**
 * Builds authoritative VideoObject structured-data entities for a given page path.
 */
export function buildVerifiedAiVideoSchemas(pagePath: string): Record<string, unknown>[] {
  const pageUrl = absoluteUrl(pagePath);
  const webpageId = `${pageUrl}#webpage`;

  return VERIFIED_AI_VIDEO_INVENTORY.map((v, index) => {
    return videoObjectSchema({
      id: `${pageUrl}#video-${index + 1}`,
      name: v.name,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      uploadDate: v.uploadDate,
      contentUrl: v.contentUrl,
      publisherId: ORGANIZATION_ID,
      partOfWebPageId: webpageId,
    });
  });
}
