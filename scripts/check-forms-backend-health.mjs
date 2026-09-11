import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { resolveFormContextFromHtml, getWordpressBackendOrigin } from '../lib/forms/form-context.mjs';

const BACKEND_ORIGIN = getWordpressBackendOrigin();
const DEFINITIONS_PATH = path.resolve('data/forms/definitions.approved.json');

function fetchUrl(url, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request({
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'DGS-Form-HealthCheck/1.0',
          'Accept': options.accept || '*/*',
          'Cache-Control': 'no-cache',
          ...(options.headers || {})
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });

      req.on('error', (err) => {
        resolve({ statusCode: 0, error: err.message, headers: {}, body: '' });
      });
      req.setTimeout(options.timeout || 15000, () => {
        req.destroy();
        resolve({ statusCode: 0, error: 'Timeout', headers: {}, body: '' });
      });
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    } catch (err) {
      resolve({ statusCode: 0, error: err.message, headers: {}, body: '' });
    }
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('WORDPRESS BACKEND ORIGIN HEALTH CHECK (NON-DESTRUCTIVE)');
  console.log(`Configured Backend Origin: ${BACKEND_ORIGIN}`);
  console.log('='.repeat(80));

  let failedChecks = 0;

  // 1. Origin reachability
  process.stdout.write('1. Probing WordPress backend root... ');
  const rootRes = await fetchUrl(`${BACKEND_ORIGIN}/`);
  if (rootRes.statusCode >= 200 && rootRes.statusCode < 400) {
    console.log(`OK (HTTP ${rootRes.statusCode})`);
  } else {
    console.log(`FAILED (HTTP ${rootRes.statusCode}, ${rootRes.error || 'bad status'})`);
    failedChecks++;
  }

  // 2. Admin AJAX reachability
  process.stdout.write('2. Probing WordPress admin-ajax.php... ');
  const ajaxRes = await fetchUrl(`${BACKEND_ORIGIN}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: 'action=fluentform_submit'
  });
  if (ajaxRes.statusCode === 200 || ajaxRes.statusCode === 400 || ajaxRes.statusCode === 422) {
    console.log(`OK (HTTP ${ajaxRes.statusCode}, admin-ajax active)`);
  } else {
    console.log(`FAILED (HTTP ${ajaxRes.statusCode})`);
    failedChecks++;
  }

  // 3. Check all 11 forms
  console.log('\n3. Verifying Form Context & Nonce Extraction Across All 11 Forms:');
  const defs = JSON.parse(fs.readFileSync(DEFINITIONS_PATH, 'utf8'));

  const results = [];
  for (const def of defs.forms) {
    const formId = def.fluentFormId;
    const title = def.title;
    for (const route of def.sourceRoutes) {
      const pageUrl = `${BACKEND_ORIGIN}${route}`;
      const pageRes = await fetchUrl(pageUrl, {
        headers: { Accept: 'text/html' }
      });

      if (pageRes.statusCode !== 200) {
        console.log(`  [FAIL] Form ${String(formId).padEnd(2)} (${title}) on ${route}: HTTP ${pageRes.statusCode}`);
        failedChecks++;
        results.push({ formId, route, ok: false, error: `HTTP ${pageRes.statusCode}` });
        continue;
      }

      const context = resolveFormContextFromHtml(pageRes.body, def, route);
      if (!context.ok || !context.nonce) {
        console.log(`  [FAIL] Form ${String(formId).padEnd(2)} (${title}) on ${route}: Missing nonce/context`);
        failedChecks++;
        results.push({ formId, route, ok: false, error: context.message });
      } else {
        console.log(`  [PASS] Form ${String(formId).padEnd(2)} (${title}) on ${route}`);
        console.log(`         Nonce: ${context.nonce} | Post ID: ${context.embeddedPostId}`);
        results.push({ formId, route, ok: true, nonce: context.nonce, postId: context.embeddedPostId });
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  if (failedChecks === 0) {
    console.log(`ALL CHECKS PASSED: 11 forms verified against ${BACKEND_ORIGIN}`);
    console.log('WORDPRESS FORM BACKEND PREFLIGHT: READY');
    process.exit(0);
  } else {
    console.error(`PREFLIGHT DEFECTS DETECTED: ${failedChecks} check(s) failed.`);
    console.error('WORDPRESS FORM BACKEND PREFLIGHT: FAILED — CUTOVER BLOCKED');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running forms backend health check:', err);
  process.exit(1);
});
