import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fetchFormContext, getWordpressBackendOrigin } from '../lib/forms/form-context.mjs';
import { buildFluentFormsAjaxParams, interpretFluentAjaxResponse } from '../lib/forms/fluent-ajax-payload.mjs';

const BACKEND_ORIGIN = getWordpressBackendOrigin();
const DEFINITIONS = JSON.parse(fs.readFileSync(path.resolve('data/forms/definitions.approved.json'), 'utf8'));

function getDef(id) {
  return DEFINITIONS.forms.find((f) => f.fluentFormId === id);
}

async function submitAndVerify(formId, route, fields) {
  const def = getDef(formId);
  if (!def) throw new Error(`Form ${formId} not found in approved definitions`);

  console.log(`\n1. Fetching context for Form ${formId} on ${route}...`);
  const context = await fetchFormContext(def, route);
  if (!context.ok) throw new Error(`Failed to fetch context: ${context.message}`);
  console.log(`   Nonce: ${context.nonce} | Post ID: ${context.embeddedPostId}`);

  console.log(`2. Building payload and submitting to ${BACKEND_ORIGIN}/wp-admin/admin-ajax.php...`);
  const params = buildFluentFormsAjaxParams({
    fluentFormId: def.fluentFormId,
    route,
    sanitizedFields: fields,
    nonce: context.nonce,
    embeddedPostId: context.embeddedPostId,
    captchaProvider: def.captcha?.provider,
    submissionAction: def.backend.submissionAction || 'fluentform_submit',
  });

  const response = await fetch(`${BACKEND_ORIGIN}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': context.referer,
      'User-Agent': 'DGS-Form-DBTest/1.0',
    },
    body: params.toString(),
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response from admin-ajax: ${text.slice(0, 300)}`);
  }

  const interpreted = interpretFluentAjaxResponse(parsed, response.ok);
  if (!interpreted.success || !interpreted.submissionId) {
    throw new Error(`Fluent Forms submission failed: ${interpreted.errorText || interpreted.message}`);
  }
  const submissionId = interpreted.submissionId;
  console.log(`   Fluent Forms reported SUCCESS! Submission ID: ${submissionId}`);

  console.log(`3. Verifying actual row in wpcl_fluentform_submissions via WordPress backend...`);
  const phpScript = `<?php
require_once '/home/u188101251/domains/dgeniussolutions.com/public_html/wp-load.php';
global $wpdb;
$row = $wpdb->get_row($wpdb->prepare("SELECT id, form_id, status, created_at FROM wpcl_fluentform_submissions WHERE id = %d", ${submissionId}), ARRAY_A);
echo json_encode($row);
`;

  const sshRes = spawnSync('ssh', [
    '-p', '65002',
    '-o', 'BatchMode=yes',
    '-o', 'StrictHostKeyChecking=no',
    'u188101251@147.93.100.126',
    'php'
  ], {
    input: phpScript,
    encoding: 'utf8'
  });

  if (sshRes.status !== 0 || !sshRes.stdout.trim()) {
    throw new Error(`SSH query failed: ${sshRes.stderr || 'empty output'}`);
  }

  const dbRow = JSON.parse(sshRes.stdout.trim());
  if (!dbRow || String(dbRow.id) !== String(submissionId)) {
    throw new Error(`Database row missing for submission ID: ${submissionId}`);
  }

  console.log(`   [PASS] DB Row Verified: ID ${dbRow.id}, form_id ${dbRow.form_id}, created_at ${dbRow.created_at}`);
  return dbRow;
}

async function run() {
  console.log('='.repeat(80));
  console.log('FLUENT FORMS DATABASE PERSISTENCE VERIFICATION');
  console.log('='.repeat(80));

  // Form 9 (Generative AI)
  await submitAndVerify(9, '/services/ai-video-production-agency/', {
    'names[first_name]': 'DGS-Sprint',
    'names[last_name]': 'Form9',
    'email': 'sprint-audit@dgeniussolutions.com',
    'input_text': 'DGS Sprint AI Brand',
    'input_text_1': '9876543210',
    'dropdown': 'Generative Images',
    'dropdown_1': 'Google Search',
    'description': 'Post-launch sprint persistence verification for Form 9.',
    'hidden': 'Generative AI Page',
  });

  // Form 26 (Performance Marketing)
  await submitAndVerify(26, '/services/performance-marketing/', {
    'full_name[first_name]': 'DGS-Sprint',
    'full_name[last_name]': 'Form26',
    'email': 'sprint-audit@dgeniussolutions.com',
    'phone': '9876543210',
    'input_text': 'DGS Sprint Performance',
    'company_website': 'https://www.dgeniussolutions.com',
    'role': 'Founder / Owner / CEO',
    'budget': '₹75,000 to ₹1 lakh',
    'start_timeline': 'Immediately',
    'requirement': 'Post-launch sprint persistence verification for Form 26.',
    'contact_consent': 'on',
    'service_name': 'Website Development',
    'lead_source': 'Google Ads Landing Page',
    'business_confirmation[]': 'I confirm this is a business enquiry for a company or brand, not a job application, internship request, freelancer pitch or personal enquiry.',
  });

  console.log('\n================================================================================');
  console.log('ALL NON-CAPTCHA FORMS SUCCESSFULLY STORED IN WORDPRESS DATABASE (100% PASS)');
  console.log('================================================================================\n');
}

run().catch((err) => {
  console.error('\nFAIL:', err.message);
  process.exit(1);
});
