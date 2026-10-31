import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT_MS = 15_000;

class ProxyArticleError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const blockedAddresses = new BlockList();
[
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
].forEach((subnet) => {
  const [address, prefix] = subnet.split('/');
  blockedAddresses.addSubnet(address, Number(prefix), 'ipv4');
});
[
  '::/128',
  '::1/128',
  '::ffff:0:0/96',
  '64:ff9b:1::/48',
  '100::/64',
  '2001:db8::/32',
  'fc00::/7',
  'fe80::/10',
  'ff00::/8',
].forEach((subnet) => {
  const [address, prefix] = subnet.split('/');
  blockedAddresses.addSubnet(address, Number(prefix), 'ipv6');
});

function isPublicAddress(address: string, family: number): boolean {
  if (blockedAddresses.check(address, family === 4 ? 'ipv4' : 'ipv6')) return false;
  if (family === 6) return blockedAddresses.check(address, 'ipv6') === false
    && isGlobalIpv6(address);
  return true;
}

function isGlobalIpv6(address: string): boolean {
  const firstGroup = Number.parseInt(address.split(':')[0] || '0', 16);
  return firstGroup >= 0x2000 && firstGroup <= 0x3fff;
}

async function validateExternalUrl(value: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ProxyArticleError('URL invalide.', 400);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ProxyArticleError('Seules les URL HTTP et HTTPS sont acceptées.', 400);
  }
  if (url.username || url.password) {
    throw new ProxyArticleError('Les URL avec identifiants intégrés ne sont pas acceptées.', 400);
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new ProxyArticleError('Cette adresse locale ne peut pas être récupérée.', 400);
  }

  const literalFamily = isIP(hostname);
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = literalFamily
      ? [{ address: hostname, family: literalFamily }]
      : await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new ProxyArticleError('Le domaine du site source est introuvable.', 502);
  }

  if (
    addresses.length === 0
    || addresses.some(({ address, family }) => !isPublicAddress(address, family))
  ) {
    throw new ProxyArticleError('Le domaine doit pointer uniquement vers des adresses publiques.', 400);
  }

  url.hash = '';
  return url;
}

async function readHtml(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
    throw new ProxyArticleError('La page source dépasse la limite de 5 Mo.', 413);
  }
  if (!response.body) throw new ProxyArticleError('Le site source a renvoyé une page vide.', 502);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_HTML_BYTES) {
      await reader.cancel();
      throw new ProxyArticleError('La page source dépasse la limite de 5 Mo.', 413);
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function absolutizeAttributeUrls(html: string, baseUrl: URL): string {
  return html.replace(
    /\b(href|src|poster)=(["'])(.*?)\2/gi,
    (attribute, name: string, quote: string, rawValue: string) => {
      const value = rawValue.trim();
      if (!value || value.startsWith('#') || /^(mailto:|tel:)/i.test(value)) {
        return attribute;
      }
      if (/^data:/i.test(value)) {
        return name.toLowerCase() === 'src' && /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(value)
          ? attribute
          : `${name}="#"`;
      }

      try {
        const absoluteUrl = new URL(value, baseUrl);
        if (!['http:', 'https:'].includes(absoluteUrl.protocol)) return `${name}="#"`;
        if (name.toLowerCase() === 'href') {
          return `href=${quote}${absoluteUrl.href}${quote} target="_blank" rel="noopener noreferrer"`;
        }
        return `${name}=${quote}${absoluteUrl.href}${quote}`;
      } catch {
        return attribute;
      }
    },
  );
}

function extractArticleHtml(html: string, baseUrl: URL): string {
  const match = html.match(/<article\b[^>]*>([\s\S]*?)<\/article\s*>/i)
    || html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)
    || html.match(/<div\b[^>]*(?:itemprop=["']articleBody["']|class=["'][^"']*(?:article-body|article-content|post-content|entry-content)[^"']*["'])[^>]*>([\s\S]*?)<\/div\s*>/i)
    || html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);

  let content = match?.[1] || html;
  content = content
    .replace(/<(script|style|iframe|object|embed|nav|header|footer|aside|form|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(?:script|style|iframe|object|embed|nav|header|footer|aside|form|svg|template)\b[^>]*\/?>/gi, '')
    .replace(/\s(?:on[a-z]+|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\sstyle\s*=\s*(["'])[^"']*url\s*\(\s*["']?\s*javascript:[^"']*\1/gi, '');

  return absolutizeAttributeUrls(content, baseUrl);
}

async function fetchPage(startUrl: URL): Promise<{ response: Response; finalUrl: URL }> {
  let url = startUrl;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    url = await validateExternalUrl(url.href);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; MalakInfoArticleImporter/1.0)',
      },
    });

    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: url };
    }

    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) throw new Error(`Le site source a renvoyé une redirection sans destination (HTTP ${response.status}).`);
    if (redirectCount === MAX_REDIRECTS) throw new Error('Le site source a dépassé la limite de redirections.');
    url = new URL(location, url);
  }

  throw new Error('Impossible de suivre la redirection du site source.');
}

export async function POST(request: Request) {
  const { response: authResponse } = await requireAdmin();
  if (authResponse) return authResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const value = body && typeof body === 'object' && 'url' in body
    ? (body as { url?: unknown }).url
    : undefined;
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) {
    return NextResponse.json({ error: 'Veuillez fournir une URL valide (2 048 caractères maximum).' }, { status: 400 });
  }

  try {
    const startUrl = await validateExternalUrl(value.trim());
    const { response: upstream, finalUrl } = await fetchPage(startUrl);
    if (!upstream.ok) {
      console.error('[proxy-article] Source returned HTTP status:', upstream.status, finalUrl.hostname);
      return NextResponse.json(
        { error: `Le site source a refusé la récupération (HTTP ${upstream.status}).` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
      return NextResponse.json(
        { error: 'L’URL ne renvoie pas une page HTML exploitable.' },
        { status: 415 },
      );
    }

    const html = await readHtml(upstream);
    const content = extractArticleHtml(html, finalUrl);
    if (!content.replace(/<[^>]*>/g, '').trim()) {
      return NextResponse.json(
        { error: 'Aucun contenu éditorial exploitable n’a été trouvé sur cette page.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ content, originalUrl: finalUrl.href });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue.';
    console.error('[proxy-article] Failed to fetch external page:', message);
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json(
      {
        error: timedOut
          ? 'Le site source met trop de temps à répondre (délai de 15 secondes dépassé).'
          : message,
      },
      {
        status: timedOut
          ? 504
          : error instanceof ProxyArticleError
            ? error.status
            : 502,
      },
    );
  }
}
