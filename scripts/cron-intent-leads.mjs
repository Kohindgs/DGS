/**
 * DGenius Buyer-Intent LinkedIn Posts Cron Runner
 *
 * Schedule & Freshness Rules:
 * 1. Runs ONCE EVERY 1 HOUR (at the top of the hour, IST minute < 15) -> Checks ONLY 1-Day-Old (<= 24h) LinkedIn Posts.
 * 2. Runs ONCE EVERY DAY AT 8:00 AM IST (IST hour === 8, minute < 15) -> Checks 1-Week-Old (<= 168h) AND 1-Day-Old (<= 24h) LinkedIn Posts.
 * 3. Strictly verifies the real LinkedIn 64-bit Snowflake `activity-(\d{18,20})` timestamp on every post.
 *    Any post older than 24h (on hourly runs) or 168h (on the 8:00 AM daily run) is strictly rejected (never clamped).
 * 4. Respects `/home/u188101251/production-app/shared/intent-search-config.json` (`paused: true` or `pauseUntilIso`)
 *    so zero searches are fired while LinkedIn search is paused.
 */
import fs from 'node:fs';

const LOG_FILE = '/home/u188101251/production-app/shared/intent-cron.log';
const CONFIG_FILE = '/home/u188101251/production-app/shared/intent-search-config.json';
const API_URL = 'https://www.dgeniussolutions.com/api/admin/intent-leads/';
const PIN = process.env.DGS_INTENT_PIN || '021514';

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCleanAuthorFromLinkedIn(titleStr = '', url = '') {
  const m = String(titleStr).match(/^([^|:–—-]{2,55}?)\s+(?:on LinkedIn|posted on the topic)/i);
  if (m && m[1]) {
    return m[1].trim();
  }
  const slugMatch = String(url).match(/linkedin\.com\/posts\/([a-zA-Z0-9-]+?)_/i);
  if (slugMatch && slugMatch[1]) {
    return slugMatch[1]
      .replace(/-[0-9a-f]{6,}$/i, '')
      .split('-')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'LinkedIn Member';
}

/**
 * Decodes the exact Unix millisecond timestamp from a LinkedIn 64-bit Snowflake activity ID.
 * Returns null if the URL does not contain a valid Snowflake activity ID.
 */
function decodeLinkedInSnowflake(url = '') {
  const m = String(url).match(/activity[:\-](\d{18,20})/i);
  if (!m) return null;
  try {
    const tsMs = Number(BigInt(m[1]) >> 22n);
    // Must be between 2020-01-01 and now + 1h
    if (tsMs > 1577836800000 && tsMs <= Date.now() + 3600000) {
      const ageHours = Math.max(1, Math.round((Date.now() - tsMs) / 3600000));
      return {
        publishedAtIso: new Date(tsMs).toISOString(),
        ageHours,
      };
    }
  } catch {}
  return null;
}

// Target LinkedIn Post keywords specified by the user
const KEYWORD_PHRASES = [
  '"looking for an agency"',
  '"looking for" "SEO company"',
  '"looking for" "SEO agency"',
  '"looking for" "AI production company"',
  '"looking for" "AI video production"',
  '"looking for a marketing agency"',
  '"looking for a video production agency"',
  '"looking for a web development agency"',
  '"recommend a" "SEO agency"',
  '"need a" "digital marketing agency"',
];

function buildQueriesForRun(isDaily8AmRun) {
  const queries = [];
  // Every hourly run searches 1-day-old (btf=d, <=24h) LinkedIn posts
  for (const phrase of KEYWORD_PHRASES) {
    queries.push({
      q: `site:linkedin.com/posts ${phrase}`,
      btf: 'd',
      maxAgeHours: 24,
      windowLabel: '1D (24h)',
    });
  }

  // Once every day at 8:00 AM IST, also search 1-week-old (btf=w, <=168h) LinkedIn posts
  if (isDaily8AmRun) {
    for (const phrase of KEYWORD_PHRASES) {
      queries.push({
        q: `site:linkedin.com/posts ${phrase}`,
        btf: 'w',
        maxAgeHours: 168,
        windowLabel: '1W (7d)',
      });
    }
  }

  return queries;
}

async function discoverFreshLinkedInPosts(isDaily8AmRun) {
  const queries = buildQueriesForRun(isDaily8AmRun);
  const discoveredMap = new Map();
  let skippedStaleCount = 0;

  for (const item of queries) {
    try {
      const searchUrl = `https://in.search.yahoo.com/search?p=${encodeURIComponent(item.q)}&n=15&fr2=time&btf=${item.btf}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      const blocks = html.split(/<div class="dd algo/i).slice(1);

      for (const b of blocks) {
        const ru = b.match(/RU=([^/"&]+)/);
        const rawUrl = ru ? decodeURIComponent(ru[1]) : '';
        if (!rawUrl.includes('linkedin.com/posts/') && !rawUrl.includes('linkedin.com/feed/update/')) continue;
        const cleanUrl = rawUrl.split('?')[0];
        if (discoveredMap.has(cleanUrl)) continue;

        // Strictly verify real LinkedIn Snowflake timestamp — NEVER accept old or unverified URLs
        const snowflake = decodeLinkedInSnowflake(cleanUrl);
        if (!snowflake || snowflake.ageHours > item.maxAgeHours) {
          skippedStaleCount++;
          continue;
        }

        const titleM = b.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        const descM = b.match(/<div class="compText[^>]*>([\s\S]*?)<\/div>/i);
        const title = decodeHtmlEntities((titleM ? titleM[1] : '').replace(/<[^>]+>/g, ' '));
        const snippet = decodeHtmlEntities((descM ? descM[1] : '').replace(/<[^>]+>/g, ' '));

        discoveredMap.set(cleanUrl, {
          url: cleanUrl,
          title,
          snippet,
          publishedAt: snowflake.publishedAtIso,
          ageHours: snowflake.ageHours,
          maxAgeHours: item.maxAgeHours,
          windowLabel: item.windowLabel,
        });
      }
    } catch {}
  }

  const candidates = Array.from(discoveredMap.values()).slice(0, 25);
  const hydratedPosts = [];

  await Promise.allSettled(
    candidates.map(async (cand) => {
      let fullText = cand.snippet;
      let authorName = extractCleanAuthorFromLinkedIn(cand.title, cand.url);

      try {
        const res = await fetch(cand.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const html = await res.text();
          const ogDesc =
            html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
            html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];
          const pageTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

          if (ogDesc && ogDesc.length > 35) {
            fullText = decodeHtmlEntities(ogDesc);
          }
          if (pageTitle) {
            const cleanPageTitle = decodeHtmlEntities(pageTitle);
            const extracted = extractCleanAuthorFromLinkedIn(cleanPageTitle, cand.url);
            if (extracted && extracted !== 'LinkedIn Member') {
              authorName = extracted;
            }
          }
        }
      } catch {}

      if (fullText && fullText.length >= 35) {
        hydratedPosts.push({
          postUrl: cand.url,
          authorName: authorName.slice(0, 120),
          authorRole: 'LinkedIn Decision Maker',
          postText: fullText,
          publishedAt: cand.publishedAt,
          ageText: `${cand.ageHours}h`,
          maxAgeHours: cand.maxAgeHours,
          sourceChannelHint: 'LINKEDIN_PUBLIC',
        });
      }
    })
  );

  return { hydratedPosts, skippedStaleCount };
}

function readSearchConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch {}
  return { paused: false };
}

async function run() {
  const startMs = Date.now();
  const istDate = new Date(startMs + 5.5 * 3600 * 1000);
  const istTime = istDate.toISOString().replace('Z', '+05:30');
  const istHour = istDate.getUTCHours();
  const istMinute = istDate.getUTCMinutes();
  const forceRun = process.argv.includes('--force');

  // 1. Check if search is currently paused in config
  const config = readSearchConfig();
  if (!forceRun && (config.paused || (config.pauseUntilIso && new Date(config.pauseUntilIso).getTime() > startMs))) {
    const logLine = `[${istTime}] Cron skipped: Search is currently PAUSED (${config.reason || 'LinkedIn search cooldown active'}).\n`;
    fs.appendFileSync(LOG_FILE, logLine);
    console.log(logLine.trim());
    return;
  }

  // 2. Enforce Hourly Schedule (only run at the top of each hour: minute 0..14)
  if (!forceRun && istMinute >= 15) {
    // Silent skip on :15, :30, :45 so cron runs strictly once every 1 hour
    return;
  }

  // 3. Determine window: 8:00 AM IST runs 1-Week (<=168h) + 1-Day (<=24h); all other hours run 1-Day (<=24h) only
  const isDaily8AmRun = istHour === 8;
  const runModeLabel = isDaily8AmRun ? 'DAILY_8AM_1W_AND_1D' : 'HOURLY_1D_ONLY';

  try {
    const { hydratedPosts, skippedStaleCount } = await discoverFreshLinkedInPosts(isDaily8AmRun);
    let liIngestSummary = { received: 0, qualifiedAdded: 0, duplicates: 0, skippedNoise: 0 };

    if (hydratedPosts.length > 0) {
      const liRes = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DGS-Intent-Pin': PIN,
        },
        body: JSON.stringify({
          pin: PIN,
          action: 'manual-paste-ingest',
          posts: hydratedPosts,
        }),
      });
      const liData = await liRes.json().catch(() => ({}));
      if (liData?.result) {
        liIngestSummary = liData.result;
      }
    }

    const duration = ((Date.now() - startMs) / 1000).toFixed(1);
    const logLine = `[${istTime}] [${duration}s] [${runModeLabel}] Cron discovery: SUCCESS | Fresh LinkedIn Posts (<=${isDaily8AmRun ? '168h' : '24h'}): ${hydratedPosts.length} (Added & Emailed: ${liIngestSummary.qualifiedAdded || 0}, Dupes Blocked: ${liIngestSummary.duplicates || 0}, Noise Filtered: ${liIngestSummary.skippedNoise || 0}, Stale >${isDaily8AmRun ? '7d' : '24h'} Rejected: ${skippedStaleCount})\n`;
    fs.appendFileSync(LOG_FILE, logLine);
    console.log(logLine.trim());
  } catch (err) {
    const duration = ((Date.now() - startMs) / 1000).toFixed(1);
    const errLine = `[${istTime}] [${duration}s] [${runModeLabel}] Cron discovery: ERROR | ${err instanceof Error ? err.message : String(err)}\n`;
    fs.appendFileSync(LOG_FILE, errLine);
    console.error(errLine.trim());
    process.exitCode = 1;
  }
}

run();
