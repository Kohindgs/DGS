import { execSync } from "node:child_process";

const remoteScript = `
set -euo pipefail

cd /home/u188101251/production-app/current

node --env-file=.env.production -e "
import('./lib/forms/registry.ts').then(async ({ getFormDefinitionById }) => {
  const { submitNativeLeadForm } = await import('./lib/forms/native/submit.ts');
  const { cmsQuery } = await import('./lib/cms/db.ts');

  console.log('Testing Form 1 definition lookup...');
  const definition = getFormDefinitionById(1);
  if (!definition) throw new Error('Form 1 definition not found');
  console.log('✓ Found Form 1: ' + definition.title);

  console.log('Executing controlled native lead submission for Form 1...');
  const result = await submitNativeLeadForm({
    definition,
    route: '/',
    sanitizedFields: {
      'names[first_name]': 'QA_TEST_LETS_TALK',
      'email': 'qa_test_letstalk@dgeniussolutions.com',
      'phone': '+919876543210',
      'input_text': 'QA Test Verification Corp',
      'dropdown_1': 'Google Search',
      'subject': 'P0 Restoration Controlled Verification',
      'dropdown': 'Search Engine Optimization',
      'message': 'This is a controlled verification lead for P0 Let\\'s Talk form restoration.'
    },
    skipCaptcha: true
  });

  console.log('Submission result:', JSON.stringify(result, null, 2));

  if (!result.ok || !result.leadId) {
    throw new Error('Submission failed or did not return leadId');
  }

  console.log('Querying MariaDB leads table for leadId: ' + result.leadId + '...');
  const { rows } = await cmsQuery('SELECT id, source_form_key, source_route, name, email, phone, company, status, created_at FROM leads WHERE id = ?', [result.leadId]);
  console.log('Retrieved DB Lead Row:', JSON.stringify(rows[0], null, 2));

  if (!rows[0] || rows[0].name !== 'QA_TEST_LETS_TALK') {
    throw new Error('Database record verification failed!');
  }

  console.log('✓ Lead verified in MariaDB leads table successfully!');

  // Query submissions table
  const { rows: subRows } = await cmsQuery('SELECT id, form_key, source_route, lead_id, provider, created_at FROM form_submissions WHERE lead_id = ?', [result.leadId]);
  console.log('Retrieved Form Submission Row:', JSON.stringify(subRows[0], null, 2));

  console.log('====================================================');
  console.log('SUCCESS: P0 LEAD FULL PIPELINE VERIFIED IN MARIADB!');
  console.log('====================================================');
}).catch((err) => {
  console.error('SERVER TEST FAILED:', err);
  process.exit(1);
});
"
`;

try {
  const output = execSync(
    `ssh -i C:/Users/Kohin/.ssh/id_ed25519 -o ConnectTimeout=30 -p 65002 u188101251@147.93.100.126 "bash -s"`,
    {
      input: remoteScript,
      encoding: "utf8",
    }
  );
  console.log(output);
} catch (err) {
  console.error("SSH execution failed:", err.stdout || err.message);
  process.exit(1);
}
