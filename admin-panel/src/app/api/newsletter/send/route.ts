import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isSmtpConfigured, sendNewsletterEmail } from '@/lib/email';
import { replaceDataImagesInHtml } from '@/lib/r2';

export const maxDuration = 300;
export const runtime = 'nodejs';

const MAX_HTML_BYTES = 1_500_000;

interface Body {
  subject: string;
  html: string;
  text?: string;
  filter?: {
    activeOnly?: boolean;
    interests?: string[];
  };
  includeEmails?: string[];
  excludeEmails?: string[];
}

async function sendLocally(body: Body) {
  const { subject, html: rawHtml, text, filter } = body;
  // Convert any leftover base64 images to Cloudflare HTTPS URLs (email-safe).
  const html = await replaceDataImagesInHtml(rawHtml || '');

  if (!subject || !html) {
    return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
  }

  if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
    return NextResponse.json(
      {
        error:
          'Le contenu HTML de la newsletter est trop volumineux. Les images doivent être en URL HTTPS Cloudflare (pas en base64).',
      },
      { status: 413 },
    );
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { error: 'SMTP non configuré sur le panel (SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM).' },
      { status: 500 },
    );
  }

  const where: Record<string, unknown> = {};
  if (filter?.activeOnly !== false) {
    where.isActive = true;
  }

  let subscribers: Array<{ email: string; name: string | null; interests: unknown }> = [];
  try {
    subscribers = await prisma.newsletterSubscription.findMany({
      where,
      select: { email: true, name: true, interests: true },
    });
  } catch (error) {
    console.error('[admin newsletter send] Prisma findMany failed:', error);
    return NextResponse.json(
      {
        error: 'Erreur de lecture des abonnés.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  const hasIncludeList = Array.isArray(body.includeEmails);
  const includedEmails = new Set(
    (hasIncludeList ? body.includeEmails || [] : [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
  const excludedEmails = new Set(
    (Array.isArray(body.excludeEmails) ? body.excludeEmails : [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  const recipientSubscribers = subscribers.filter((subscriber) => {
    const email = subscriber.email.toLowerCase();
    if (hasIncludeList && !includedEmails.has(email)) return false;
    if (excludedEmails.has(email)) return false;
    return true;
  });

  const filteredSubscribers = filter?.interests?.length
    ? recipientSubscribers.filter((subscriber) => {
        const interests = Array.isArray(subscriber.interests) ? subscriber.interests : [];
        return filter.interests?.every((interest) => interests.includes(interest));
      })
    : recipientSubscribers;

  if (filteredSubscribers.length === 0) {
    return NextResponse.json({ message: 'Aucun abonné trouvé pour l’envoi', count: 0, results: [] });
  }

  const renderText = (source: string) =>
    source
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  const concurrency = 5;

  for (let i = 0; i < filteredSubscribers.length; i += concurrency) {
    const batch = filteredSubscribers.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (subscriber) => {
        const personalizedHtml = html.replace(/\{\{name\}\}/g, subscriber.name || 'cher abonné');
        const baseText = text && text.trim() ? text : html;
        const personalizedText = renderText(baseText).replace(
          /\{\{name\}\}/g,
          subscriber.name || 'cher abonné',
        );

        try {
          await sendNewsletterEmail({
            to: subscriber.email,
            subject,
            html: personalizedHtml,
            text: personalizedText,
          });
          return { email: subscriber.email, success: true as const };
        } catch (error) {
          return {
            email: subscriber.email,
            success: false as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );
    results.push(...batchResults);
  }

  const successCount = results.filter((item) => item.success).length;

  return NextResponse.json({
    count: successCount,
    total: filteredSubscribers.length,
    results,
  });
}

async function proxyToMainSite(request: NextRequest, body: Body) {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (!mainSiteUrl) {
    return NextResponse.json(
      { error: 'SMTP local indisponible et MAIN site URL non configurée' },
      { status: 500 },
    );
  }

  const response = await fetch(`${mainSiteUrl.replace(/\/$/, '')}/api/newsletter/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let data: unknown = { message: responseText };
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    console.error('Admin newsletter proxy error: upstream response failed', {
      status: response.status,
      body: data,
    });
  }

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;

    if (isSmtpConfigured()) {
      return sendLocally(body);
    }

    // Fallback: proxy only if SMTP is missing on the admin panel.
    return proxyToMainSite(request, body);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Erreur base de données lors de l’envoi', details: error.message },
        { status: 500 },
      );
    }

    console.error('Admin newsletter send error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l’envoi de la newsletter',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
