import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TARGET_WIDTHS = [480, 768, 1024, 1280, 1600, 1920];
const OUT_DIR = 'public/media/portfolio/images';

async function optimizeImages() {
  const audit = JSON.parse(fs.readFileSync('data/portfolio/media-inventory-audit.json', 'utf8'));
  const allImages = [...audit.existingRecords, ...audit.uniqueNewImages];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Optimizing ${allImages.length} images (AVIF + WebP + fallback)...`);

  const results = [];
  let totalOrigBytes = 0;
  let totalAvifBytes = 0;
  let totalWebpBytes = 0;

  for (let idx = 0; idx < allImages.length; idx++) {
    const item = allImages[idx];
    const srcPath = item.sourcePath;
    const baseId = item.id ? `wp_${item.id}` : item.filename.replace(/\.[^.]+$/, '').toLowerCase();
    const origStat = fs.statSync(srcPath);
    totalOrigBytes += origStat.size;

    const metadata = await sharp(srcPath).metadata();
    const naturalWidth = metadata.width;
    const naturalHeight = metadata.height;
    const hasAlpha = metadata.hasAlpha || false;

    // Determine target widths (never larger than source)
    const validWidths = TARGET_WIDTHS.filter(w => w < naturalWidth);
    if (!validWidths.includes(naturalWidth)) {
      validWidths.push(naturalWidth);
    }
    validWidths.sort((a, b) => a - b);

    const avifVariants = [];
    const webpVariants = [];

    for (const w of validWidths) {
      const h = Math.round((w / naturalWidth) * naturalHeight);
      const avifName = `${baseId}_w${w}.avif`;
      const webpName = `${baseId}_w${w}.webp`;
      const avifPath = path.join(OUT_DIR, avifName);
      const webpPath = path.join(OUT_DIR, webpName);

      // Generate AVIF
      if (!fs.existsSync(avifPath)) {
        await sharp(srcPath)
          .rotate()
          .resize(w, h, { fit: 'inside', withoutEnlargement: true })
          .avif({ quality: 56, effort: 5, chromaSubsampling: hasAlpha ? '4:4:4' : '4:2:0' })
          .toFile(avifPath);
      }
      const avifSize = fs.statSync(avifPath).size;
      totalAvifBytes += avifSize;
      avifVariants.push({ width: w, height: h, url: `/media/portfolio/images/${avifName}`, bytes: avifSize });

      // Generate WebP
      if (!fs.existsSync(webpPath)) {
        await sharp(srcPath)
          .rotate()
          .resize(w, h, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 6 })
          .toFile(webpPath);
      }
      const webpSize = fs.statSync(webpPath).size;
      totalWebpBytes += webpSize;
      webpVariants.push({ width: w, height: h, url: `/media/portfolio/images/${webpName}`, bytes: webpSize });
    }

    // Fallback image: webp of source size or highest valid size
    const maxVariant = webpVariants[webpVariants.length - 1];

    results.push({
      id: item.id || baseId,
      sourceFilename: item.filename,
      sourcePath: item.sourcePath,
      naturalWidth,
      naturalHeight,
      ratio: item.ratio,
      orientation: item.orientation,
      hasAlpha,
      originalBytes: origStat.size,
      variants: {
        avif: avifVariants,
        webp: webpVariants,
        fallback: maxVariant.url
      }
    });

    if ((idx + 1) % 10 === 0 || idx === allImages.length - 1) {
      console.log(`Processed ${idx + 1}/${allImages.length} images...`);
    }
  }

  const manifest = {
    totalImages: results.length,
    totalOriginalBytes: totalOrigBytes,
    totalAvifBytes: totalAvifBytes,
    totalWebpBytes: totalWebpBytes,
    items: results
  };

  fs.writeFileSync('data/portfolio/optimized-images-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('--- IMAGE OPTIMIZATION COMPLETE ---');
  console.log('Original total:', (totalOrigBytes / (1024 * 1024)).toFixed(2), 'MB');
  console.log('WebP total (all variants):', (totalWebpBytes / (1024 * 1024)).toFixed(2), 'MB');
  console.log('AVIF total (all variants):', (totalAvifBytes / (1024 * 1024)).toFixed(2), 'MB');
}

optimizeImages().catch(console.error);
