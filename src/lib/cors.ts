import { NextRequest, NextResponse } from 'next/server';

const DASHBOARD_ORIGIN = 'https://dashboard.malakinfo.com';

function normalizeOrigin(value: string | null | undefined): string {
  return (value || '').trim().replace(/\/$/, '');
}

/** Origins allowed to call the main-site API from a browser (admin panel, local). */
export function getAllowedCorsOrigins(): string[] {
  const candidates = [
    process.env.ADMIN_PANEL_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    DASHBOARD_ORIGIN,
    'http://localhost:3001',
    'http://localhost:3000',
  ];

  const origins = new Set<string>();
  for (const candidate of candidates) {
    const origin = normalizeOrigin(candidate);
    if (!origin) continue;
    // Never treat the public site as an admin CORS origin / fallback.
    if (/^https?:\/\/(www\.)?malakinfo\.com$/i.test(origin)) continue;
    origins.add(origin);
  }

  return [...origins];
}

export function resolveCorsOrigin(request?: Request | NextRequest): string {
  const requestOrigin = normalizeOrigin(request?.headers.get('origin'));
  const allowed = getAllowedCorsOrigins();
  if (requestOrigin && allowed.includes(requestOrigin)) {
    return requestOrigin;
  }
  return DASHBOARD_ORIGIN;
}

export function applyCors(response: NextResponse, request?: Request | NextRequest) {
  response.headers.set('Access-Control-Allow-Origin', resolveCorsOrigin(request));
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  return response;
}

export function corsOptions(request?: Request | NextRequest) {
  return applyCors(new NextResponse(null, { status: 204 }), request);
}
