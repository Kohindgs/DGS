import fs from "node:fs";

const rawServices = JSON.parse(fs.readFileSync("data/wordpress/raw/services.json", "utf8"));
const service40114 = rawServices.find((s) => s.slug === "ai-video-production-agency");
const rawMedia = JSON.parse(fs.readFileSync("data/wordpress/raw/media.json", "utf8"));
const canonicalVideos = JSON.parse(fs.readFileSync("data/portfolio/canonical-ai-videos.json", "utf8"));

const ld = JSON.parse(fs.readFileSync("scripts/_s40114_ld.json", "utf8"));
const videoObjects = ld["@graph"].filter((e) => e["@type"] === "VideoObject");

console.log(`Found ${videoObjects.length} original VideoObjects from s40114.`);

const verifiedVideos = [];

for (let i = 0; i < videoObjects.length; i++) {
  const v = videoObjects[i];
  const url = v.contentUrl;
  const fileName = url.split("/").pop();

  // Find media record in rawMedia
  const mediaRecord = rawMedia.find((m) => m.source_url && m.source_url.includes(fileName));

  // Determine authentic uploadDate
  // Media date in WordPress: e.g. "2026-04-10T19:10:33"
  let uploadDate = null;
  if (mediaRecord?.date) {
    // Append Indian Standard Time (+05:30) as all DGS WordPress uploads are in IST
    uploadDate = mediaRecord.date.includes("+") ? mediaRecord.date : `${mediaRecord.date}+05:30`;
  }

  // ThumbUrl:
  let thumbUrl = v.thumbnailUrl;
  if (thumbUrl && !thumbUrl.startsWith("http")) {
    thumbUrl = `https://www.dgeniussolutions.com${thumbUrl.startsWith("/") ? "" : "/"}${thumbUrl}`;
  }

  // Stable ID
  const stableId = `https://www.dgeniussolutions.com/services/ai-video-production-agency/#video-${i + 1}`;

  verifiedVideos.push({
    index: i + 1,
    name: v.name,
    description: v.description,
    contentUrl: url,
    thumbnailUrl: thumbUrl,
    uploadDate,
    mediaId: mediaRecord?.id || null,
    stableId,
  });
}

console.table(
  verifiedVideos.map((v) => ({
    idx: v.index,
    name: v.name.length > 28 ? v.name.substring(0, 25) + "..." : v.name,
    uploadDate: v.uploadDate,
    hasThumb: Boolean(v.thumbnailUrl),
    mediaId: v.mediaId,
  }))
);

fs.writeFileSync("scripts/_verified_27_videos.json", JSON.stringify(verifiedVideos, null, 2));
