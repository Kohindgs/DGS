import { NextResponse } from 'next/server';

const WP_AJAX =
  process.env.WP_AJAX_URL || 'https://www.dgeniussolutions.com/wp-admin/admin-ajax.php';

/** Must match Hostinger WP mu-plugin `DGS_DEMO_FORM_SECRET`. */
const DEMO_FORM_SECRET =
  process.env.DGS_DEMO_FORM_SECRET || 'dgs-demo-ff-2026-hostinger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-origin proxy for FluentForm submissions.
 * Browser XHR to WP admin-ajax is blocked by CORS from the demo host.
 * Forwards a Hostinger-side secret so WP can skip Google reCAPTCHA domain checks
 * for this preview only (production still validates captcha normally).
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

    const baseHeaders = {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-DGS-Demo-Form': DEMO_FORM_SECRET,
      Referer: 'https://dimgrey-goat-473970.hostingersite.com/',
      Origin: 'https://dimgrey-goat-473970.hostingersite.com',
    };

    const upstream = await fetch(WP_AJAX, {
      method: 'POST',
      headers:
        typeof body === 'string'
          ? {
              ...baseHeaders,
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
          : baseHeaders,
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
