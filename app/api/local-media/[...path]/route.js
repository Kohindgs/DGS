import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

const MIME = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/**
 * Serve files from public/media through Next so Hostinger CDN/LiteSpeed
 * cannot strip Cache-Control the way it does for bare /media/* static hits.
 */
export async function GET(_request, context) {
  const params = await context.params;
  const parts = params?.path || [];
  if (!parts.length || parts.some((p) => p.includes('..') || p.includes('/') || p.includes('\\'))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const filePath = path.join(process.cwd(), 'public', 'media', ...parts);
  // Stay inside public/media
  const root = path.join(process.cwd(), 'public', 'media');
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const buf = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'X-DGS-Local-Media': '1',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
