import fs from 'node:fs';

const env = fs.readFileSync('.env.production', 'utf8');
let email = '';
let password = '';

for (const line of env.split(/\r?\n/)) {
  if (line.startsWith('DGS_ADMIN_EMAIL=')) {
    email = line.slice('DGS_ADMIN_EMAIL='.length).trim().replace(/^['"](.*)['"]$/, '$1');
  }
  if (line.startsWith('DGS_ADMIN_PASSWORD=')) {
    password = line.slice('DGS_ADMIN_PASSWORD='.length).trim().replace(/^['"](.*)['"]$/, '$1');
  }
}

async function test() {
  const params = new URLSearchParams();
  params.set('email', email);
  params.set('password', password);

  const res = await fetch('https://www.dgeniussolutions.com/api/admin/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'manual'
  });
  console.log('Login HTTP status:', res.status);
  console.log('Set-Cookie present:', res.headers.has('set-cookie'));
  console.log('Location:', res.headers.get('location'));
}

test().catch(console.error);
