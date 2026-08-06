import { NextResponse } from 'next/server';

const WP_AJAX =
  process.env.WP_AJAX_URL || 'https://www.dgeniussolutions.com/wp-admin/admin-ajax.php';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-origin proxy for FluentForm submissions.
 * Browser XHR to WP admin-ajax is blocked by CORS from the demo host.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      body = form;
    } else {
      const text = await request.text();
      body = text;
    }

    const upstream = await fetch(WP_AJAX, {
      method: 'POST',
      headers:
        typeof body === 'string'
          ? {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              Accept: 'application/json, text/javascript, */*; q=0.01',
            }
          : {
              Accept: 'application/json, text/javascript, */*; q=0.01',
            },
      body,
      cache: 'no-store',
    });

    const raw = await upstream.text();
    const responseType = upstream.headers.get('content-type') || 'application/json; charset=UTF-8';

    return new NextResponse(raw, {
      status: upstream.status,
      headers: {
        'Content-Type': responseType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: 'Form proxy failed. Please try again or email us directly.',
        detail: String(err?.message || err),
      },
      { status: 502 }
    );
  }
}
