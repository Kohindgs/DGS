import mysql from 'mysql2/promise';
import fs from 'node:fs';

async function main() {
  const env = fs.readFileSync('.env.production', 'utf8');
  const cfg = {};
  for (const line of env.split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0) {
      cfg[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
    }
  }

  const conn = await mysql.createConnection({
    host: cfg.DGS_MYSQL_HOST || '127.0.0.1',
    user: cfg.DGS_MYSQL_USER,
    password: cfg.DGS_MYSQL_PASSWORD,
    database: cfg.DGS_MYSQL_DATABASE,
  });

  const [lead] = await conn.query('SELECT * FROM leads WHERE id = ?', ['b112d127-4c47-4524-8b38-3e19cc27e01e']);
  console.log('Lead Details:');
  console.log(JSON.stringify(lead, null, 2));

  const [sub] = await conn.query('SELECT * FROM form_submissions WHERE id = ?', ['fb4da7c3-7624-4892-909e-4bf8aedf85bf']);
  console.log('Submission Details:');
  console.log(JSON.stringify(sub, null, 2));

  await conn.end();
}

main().catch((err) => {
  console.error('Check lead details error:', err);
  process.exit(1);
});
