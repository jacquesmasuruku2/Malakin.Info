import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::' ||
    host === '::1' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  ) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);
    if (octets.some((value) => value > 255)) return true;
    const [a, b] = octets;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }

  if (host.includes(':')) {
    if (host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true;
  }

  return false;
}

function isAllowedStreamUrl(url: URL): boolean {
  return ['http:', 'https:'].includes(url.protocol) && !isBlockedHost(url.hostname);
}

function rewritePlaylist(body: string, playlistUrl: URL): string {
  return body.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    if (trimmed.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/gi, (_, uri: string) => {
        try {
          const absolute = new URL(uri, playlistUrl);
          if (!isAllowedStreamUrl(absolute)) return `URI="${uri}"`;
          return `URI="/api/radio/stream?url=${encodeURIComponent(absolute.toString())}"`;
        } catch {
          return `URI="${uri}"`;
        }
      });
    }

    try {
      const absolute = new URL(trimmed, playlistUrl);
      if (!isAllowedStreamUrl(absolute)) return line;
      return `/api/radio/stream?url=${encodeURIComponent(absolute.toString())}`;
    } catch {
      return line;
    }
  }).join('\n');
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('url');
  if (!source) return NextResponse.json({ error: 'Missing stream URL' }, { status: 400 });

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: 'Invalid stream URL' }, { status: 400 });
  }

  if (!isAllowedStreamUrl(upstreamUrl)) {
    return NextResponse.json({ error: 'Stream host is not allowed' }, { status: 403 });
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/vnd.apple.mpegurl,application/x-mpegURL,audio/mpegurl,audio/mpeg,audio/aac,*/*',
        'User-Agent': 'MalakInfoRadio/1.0',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Unable to load upstream stream' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') || '';
    const looksLikePlaylist =
      /mpegurl|m3u8/i.test(contentType) ||
      /\.m3u8($|\?)/i.test(upstreamUrl.pathname) ||
      /\.m3u8/i.test(upstreamUrl.search);

    if (looksLikePlaylist) {
      const text = await upstream.text();
      const rewritten = text.trimStart().startsWith('#EXTM3U')
        ? rewritePlaylist(text, upstream.url ? new URL(upstream.url) : upstreamUrl)
        : text;

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    if (!upstream.body) {
      return NextResponse.json({ error: 'Unable to load upstream stream' }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Accept-Ranges': 'none',
      },
    });
  } catch (error) {
    console.error('[radio stream proxy] Upstream error:', error);
    return NextResponse.json({ error: 'Unable to connect to radio stream' }, { status: 502 });
  }
}
