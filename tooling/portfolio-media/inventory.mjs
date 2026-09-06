import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

function getSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

function probeVideo(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath
  ], { encoding: 'utf8' });
  const data = JSON.parse(out);

  const videoStream = data.streams?.find(s => s.codec_type === 'video');
  const audioStream = data.streams?.find(s => s.codec_type === 'audio');

  let fps = null;
  if (videoStream?.r_frame_rate) {
    const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
    if (den) fps = Math.round((num / den) * 100) / 100;
  }

  const duration = Number(data.format?.duration || videoStream?.duration || 0);
  const bitrate = Number(data.format?.bit_rate || videoStream?.bit_rate || 0);

  return {
    width: videoStream ? videoStream.width : null,
    height: videoStream ? videoStream.height : null,
    fps,
    duration,
    bitrate,
    videoCodec: videoStream ? videoStream.codec_name : null,
    audioCodec: audioStream ? audioStream.codec_name : null,
    hasAudio: !!audioStream
  };
}

async function probeImage(filePath) {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    hasAlpha: metadata.hasAlpha || false,
    space: metadata.space,
    orientation: metadata.orientation || 1
  };
}

function classifyOrientation(ratio) {
  if (ratio < 0.95) return 'portrait';
  if (ratio <= 1.05) return 'square';
  if (ratio <= 1.9) return 'landscape';
  if (ratio <= 2.4) return 'wide';
  return 'ultra-wide';
}

async function run() {
  console.log('--- Starting Media Inventory ---');

  // 1. Existing 62 WordPress items
  const gallery = JSON.parse(fs.readFileSync('data/portfolio/homepage-gallery.json', 'utf8'));
  const existingRecords = [];

  for (const item of gallery.items) {
    const rel = item.media.replace('https://www.dgeniussolutions.com/', '');
    const localPath = path.join('public', rel);
    const stat = fs.statSync(localPath);
    const sha = getSha256(localPath);
    const imgInfo = await probeImage(localPath);
    const ratio = imgInfo.width / imgInfo.height;

    existingRecords.push({
      id: item.id,
      title: item.title,
      alt: item.alt,
      filename: path.basename(localPath),
      sourcePath: localPath.replace(/\\/g, '/'),
      publicUrl: item.media,
      bytes: stat.size,
      sha256: sha,
      width: imgInfo.width,
      height: imgInfo.height,
      ratio: Math.round(ratio * 10000) / 10000,
      orientation: classifyOrientation(ratio),
      alpha: imgInfo.hasAlpha,
      format: imgInfo.format
    });
  }

  console.log(`Audited ${existingRecords.length} existing WP images.`);

  // 2. Newly added assets from public/Porfolio
  const newFolder = 'public/Porfolio';
  const newFiles = fs.readdirSync(newFolder).filter(f => !f.startsWith('.') && f !== 'Thumbs.db');

  const newImages = [];
  const newVideos = [];

  for (const f of newFiles) {
    const filePath = path.join(newFolder, f);
    const stat = fs.statSync(filePath);
    const sha = getSha256(filePath);
    const ext = path.extname(f).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'].includes(ext)) {
      const imgInfo = await probeImage(filePath);
      const ratio = imgInfo.width / imgInfo.height;
      newImages.push({
        filename: f,
        sourcePath: filePath.replace(/\\/g, '/'),
        bytes: stat.size,
        sha256: sha,
        width: imgInfo.width,
        height: imgInfo.height,
        ratio: Math.round(ratio * 10000) / 10000,
        orientation: classifyOrientation(ratio),
        alpha: imgInfo.hasAlpha,
        format: imgInfo.format
      });
    } else if (['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv'].includes(ext)) {
      const vidInfo = probeVideo(filePath);
      const ratio = vidInfo.width && vidInfo.height ? Math.round((vidInfo.width / vidInfo.height) * 10000) / 10000 : null;
      newVideos.push({
        filename: f,
        sourcePath: filePath.replace(/\\/g, '/'),
        bytes: stat.size,
        sha256: sha,
        ...vidInfo,
        ratio,
        orientation: ratio ? classifyOrientation(ratio) : 'unknown'
      });
    }
  }

  console.log(`Audited new assets: ${newImages.length} images, ${newVideos.length} videos.`);

  // 3. Deduplication Check
  const shaMap = new Map();
  existingRecords.forEach(r => shaMap.set(r.sha256, { type: 'existing', item: r }));

  const duplicates = [];
  const uniqueNewImages = [];
  const uniqueNewVideos = [];

  for (const img of newImages) {
    if (shaMap.has(img.sha256)) {
      duplicates.push({ newFile: img.filename, matchesExisting: shaMap.get(img.sha256).item.filename, sha256: img.sha256 });
    } else {
      uniqueNewImages.push(img);
      shaMap.set(img.sha256, { type: 'new_image', item: img });
    }
  }

  for (const vid of newVideos) {
    if (shaMap.has(vid.sha256)) {
      duplicates.push({ newFile: vid.filename, matchesExisting: shaMap.get(vid.sha256).item.filename, sha256: vid.sha256 });
    } else {
      uniqueNewVideos.push(vid);
      shaMap.set(vid.sha256, { type: 'new_video', item: vid });
    }
  }

  console.log(`Deduplication: ${duplicates.length} duplicates found.`);

  const auditReport = {
    discoveredSourceFolder: newFolder.replace(/\\/g, '/'),
    existingCount: existingRecords.length,
    newImageCount: newImages.length,
    newVideoCount: newVideos.length,
    duplicateCount: duplicates.length,
    duplicates,
    uniqueNewImages,
    uniqueNewVideos,
    existingRecords
  };

  fs.mkdirSync('data/portfolio', { recursive: true });
  fs.writeFileSync('data/portfolio/media-inventory-audit.json', JSON.stringify(auditReport, null, 2));
  console.log('Saved data/portfolio/media-inventory-audit.json');

  // Summary counts
  const allImages = [...existingRecords, ...uniqueNewImages];
  const orientations = { portrait: 0, square: 0, landscape: 0, wide: 0, 'ultra-wide': 0 };
  allImages.forEach(img => {
    orientations[img.orientation] = (orientations[img.orientation] || 0) + 1;
  });

  console.log('\n--- INVENTORY SUMMARY ---');
  console.log('Existing WP images:', existingRecords.length);
  console.log('New unique images:', uniqueNewImages.length);
  console.log('New unique videos:', uniqueNewVideos.length);
  console.log('Image Orientations:', orientations);
  console.log('Videos:', uniqueNewVideos.map(v => ({ file: v.filename, res: `${v.width}x${v.height}`, dur: v.duration.toFixed(1) + 's', fps: v.fps, audio: v.hasAudio })));
}

run().catch(console.error);
