const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const fs = require('fs');
const path = require('path');

// Ensure environment variables are loaded in Passenger custom server
try {
  const envFiles = [
    path.join(__dirname, '.env.production'),
    path.join(__dirname, '.env.local'),
    path.join(__dirname, '.env')
  ];
  for (const ef of envFiles) {
    if (fs.existsSync(ef)) {
      const lines = fs.readFileSync(ef, 'utf8').split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].trim();
        }
      }
    }
  }
} catch (e) {}

// Fail-closed indexing policy:
// DGS_PUBLIC_INDEXING must NOT default to 'true'.
// It must come explicitly from the approved production environment.
if (!process.env.DGS_WORDPRESS_BACKEND_ORIGIN) {
  process.env.DGS_WORDPRESS_BACKEND_ORIGIN = 'https://wp-origin.dgeniussolutions.com';
}
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.dgeniussolutions.com';
}

const port = parseInt(process.env.PORT || '3000', 10);
const dev = false;
const hostname = 'localhost';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const urlPath = parsedUrl.pathname || '';
        const isStaticAsset =
          urlPath.startsWith('/_next/static/') ||
          urlPath.startsWith('/wp-mirror-css/') ||
          urlPath.startsWith('/images/') ||
          urlPath.startsWith('/media/');
        if (!isStaticAsset) {
          const originalSetHeader = res.setHeader.bind(res);
          res.setHeader = (key, value) => {
            if (typeof key === 'string' && key.toLowerCase() === 'cache-control') {
              return originalSetHeader(
                'Cache-Control',
                'private, no-cache, no-store, max-age=0, must-revalidate',
              );
            }
            return originalSetHeader(key, value);
          };
        }
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
      .once('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log("> DGS Next.js production server ready");
      });
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err);
    process.exit(1);
  });
