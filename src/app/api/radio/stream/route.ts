import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set(['live02.rfi.fr', 'as-hls-ww.live.cf.md.bbci.co.uk']);

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url');
  if (!source) return NextResponse.json({ error: 'Missing stream URL' }, { status: 400 });

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: 'Invalid stream URL' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(upstreamUrl.protocol) || !ALLOWED_HOSTS.has(upstreamUrl.hostname)) {
    return NextResponse.json({ error: 'Stream host is not allowed' }, { status: 403 });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'audio/mpeg,audio/aac,application/vnd.apple.mpegurl,*/*' },
      cache: 'no-store',
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: 'Unable to load upstream stream' }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Accept-Ranges': 'none',
      },
    });
  } catch (error) {
    console.error('[radio stream proxy] Upstream error:', error);
    return NextResponse.json({ error: 'Unable to connect to radio stream' }, { status: 502 });
  }
}