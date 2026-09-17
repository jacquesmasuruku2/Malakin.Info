import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.ADMIN_PANEL_URL,
  process.env.NEXT_PUBLIC_ADMIN_URL,
  'https://dashboard.malakinfo.com',
  'http://localhost:3001',
  'http://localhost:3000',
].filter(Boolean) as string[];

export function applyCors(response: NextResponse, request?: Request | NextRequest) {
  const origin = request?.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] || 'https://dashboard.malakinfo.com';

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');
  return response;
}

export function corsOptions(request?: Request | NextRequest) {
  return applyCors(new NextResponse(null, { status: 204 }), request);
}
