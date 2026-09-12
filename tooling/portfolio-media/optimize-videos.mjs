import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const OUT_VIDEO_DIR = 'public/media/portfolio/videos';
const OUT_POSTER_DIR = 'public/media/portfolio/posters';

async function processVideos() {
  const audit = JSON.parse(fs.readFileSync('data/portfolio/media-inventory-audit.json', 'utf8'));
  const videos = audit.uniqueNewVideos;

  fs.mkdirSync(OUT_VIDEO_DIR, { recursive: true });
  fs.mkdirSync(OUT_POSTER_DIR, { recursive: true });

  console.log(`Processing ${videos.length} unique videos...`);

  let origTotalBytes = 0;
  let mp4TotalBytes = 0;
  let webmTotalBytes = 0;
  let posterTotalBytes = 0;
  let largestVideo = { filename: '', bytes: 0 };

  const results = [];

  for (let idx = 0; idx < videos.length; idx++) {
    const v = videos[idx];
    origTotalBytes += v.bytes;
    const baseId = v.filename.replace(/\.[^.]+$/, '').toLowerCase();

    console.log(`\n--- [${idx + 1}/${videos.length}] Processing ${v.filename} (${(v.bytes / (1024 * 1024)).toFixed(1)} MB) ---`);

    // 1. Extract Representative Poster Frame at 1.5s (or 0.5s if short)
    const timestamp = Math.min(1.5, Math.max(0.5, v.duration / 3)).toFixed(2);
    const rawPosterPath = path.join(OUT_POSTER_DIR, `${baseId}_raw.png`);

    if (!fs.existsSync(rawPosterPath)) {
      execFileSync('ffmpeg', [
        '-y',
        '-ss', timestamp,
        '-i', v.sourcePath,
        '-vframes', '1',
        '-q:v', '2',
        rawPosterPath
      ], { stdio: 'inherit' });
    }

    // Generate responsive AVIF and WebP poster variants
    const posterMetadata = await sharp(rawPosterPath).metadata();
    const posterWidth = posterMetadata.width;
    const posterHeight = posterMetadata.height;

    const posterAvif = `${baseId}_poster.avif`;
    const posterWebp = `${baseId}_poster.webp`;
    const posterAvifPath = path.join(OUT_POSTER_DIR, posterAvif);
    const posterWebpPath = path.join(OUT_POSTER_DIR, posterWebp);

    if (!fs.existsSync(posterAvifPath)) {
      await sharp(rawPosterPath)
        .avif({ quality: 58, effort: 5 })
        .toFile(posterAvifPath);
    }
    if (!fs.existsSync(posterWebpPath)) {
      await sharp(rawPosterPath)
        .webp({ quality: 82, effort: 6 })
        .toFile(posterWebpPath);
    }

    const posterWebpBytes = fs.statSync(posterWebpPath).size;
    const posterAvifBytes = fs.statSync(posterAvifPath).size;
    posterTotalBytes += posterWebpBytes + posterAvifBytes;

    // Clean up temporary raw png
    if (fs.existsSync(rawPosterPath)) {
      fs.unlinkSync(rawPosterPath);
    }

    // 2. Encode Optimized MP4 (H.264, CRF 24, faststart, capped 30fps, 1920 max bound)
    const mp4Name = `${baseId}.mp4`;
    const mp4Path = path.join(OUT_VIDEO_DIR, mp4Name);

    if (!fs.existsSync(mp4Path)) {
      console.log(`Encoding MP4 H.264 for ${baseId}...`);
      const mp4Args = [
        '-y',
        '-i', v.sourcePath,
        '-c:v', 'libx264',
        '-crf', '24',
        '-preset', 'medium',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart'
      ];

      // If FPS > 30, cap to 30
      if (v.fps && v.fps > 30) {
        mp4Args.push('-r', '30');
      }

      // Audio handling
      if (v.hasAudio) {
        mp4Args.push('-c:a', 'aac', '-b:a', '128k');
      } else {
        mp4Args.push('-an');
      }

      mp4Args.push(mp4Path);
      execFileSync('ffmpeg', mp4Args, { stdio: 'inherit' });
    }

    const mp4Bytes = fs.statSync(mp4Path).size;
    mp4TotalBytes += mp4Bytes;
    if (mp4Bytes > largestVideo.bytes) {
      largestVideo = { filename: mp4Name, bytes: mp4Bytes };
    }

    // 3. Encode WebM VP9 (CRF 32, -b:v 0, row-mt 1)
    const webmName = `${baseId}.webm`;
    const webmPath = path.join(OUT_VIDEO_DIR, webmName);

    if (!fs.existsSync(webmPath)) {
      console.log(`Encoding WebM VP9 for ${baseId}...`);
      const webmArgs = [
        '-y',
        '-i', v.sourcePath,
        '-c:v', 'libvpx-vp9',
        '-crf', '32',
        '-b:v', '0',
        '-row-mt', '1',
        '-pix_fmt', 'yuv420p'
      ];

      if (v.fps && v.fps > 30) {
        webmArgs.push('-r', '30');
      }

      if (v.hasAudio) {
        webmArgs.push('-c:a', 'libopus', '-b:a', '96k');
      } else {
        webmArgs.push('-an');
      }

      webmArgs.push(webmPath);
      execFileSync('ffmpeg', webmArgs, { stdio: 'inherit' });
    }

    const webmBytes = fs.statSync(webmPath).size;
    webmTotalBytes += webmBytes;

    results.push({
      id: baseId,
      filename: v.filename,
      width: v.width,
      height: v.height,
      ratio: v.ratio,
      duration: v.duration,
      poster: {
        width: posterWidth,
        height: posterHeight,
        avif: `/media/portfolio/posters/${posterAvif}`,
        webp: `/media/portfolio/posters/${posterWebp}`,
        fallback: `/media/portfolio/posters/${posterWebp}`
      },
      sources: {
        webm: `/media/portfolio/videos/${webmName}`,
        mp4: `/media/portfolio/videos/${mp4Name}`
      },
      bytes: {
        original: v.bytes,
        mp4: mp4Bytes,
        webm: webmBytes,
        posterWebp: posterWebpBytes,
        posterAvif: posterAvifBytes
      }
    });
  }

  const manifest = {
    videoCount: results.length,
    originalTotalBytes: origTotalBytes,
    optimizedMp4TotalBytes: mp4TotalBytes,
    optimizedWebmTotalBytes: webmTotalBytes,
    posterTotalBytes: posterTotalBytes,
    largestOptimizedVideo: largestVideo,
    items: results
  };

  fs.writeFileSync('data/portfolio/optimized-videos-manifest.json', JSON.stringify(manifest, null, 2));

  console.log('\n--- VIDEO OPTIMIZATION COMPLETE ---');
  console.log('Original total:', (origTotalBytes / (1024 * 1024)).toFixed(2), 'MB');
  console.log('Optimized MP4 total:', (mp4TotalBytes / (1024 * 1024)).toFixed(2), 'MB');
  console.log('Optimized WebM total:', (webmTotalBytes / (1024 * 1024)).toFixed(2), 'MB');
  console.log('Poster total:', (posterTotalBytes / 1024).toFixed(1), 'KB');
  console.log('Largest video:', largestVideo.filename, (largestVideo.bytes / (1024 * 1024)).toFixed(2), 'MB');
}

processVideos().catch(console.error);
