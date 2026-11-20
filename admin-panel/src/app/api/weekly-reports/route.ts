import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSmtpConfigured, sendConfiguredEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !provided) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer);
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const settings = await prisma.adminSettings.findUnique({ where: { id: 'global' } });
    if (!settings?.weeklyReports || !settings.emailNotifications) {
      return NextResponse.json({ skipped: true, reason: 'Weekly email reports are disabled.' });
    }
    if (!isSmtpConfigured()) {
      return NextResponse.json({ error: 'SMTP is not configured.' }, { status: 503 });
    }

    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 7);
    const period = `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(start)} – ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(end)}`;

    const [publishedArticles, newUsers, newSubscribers, newComments, newMessages] = await Promise.all([
      prisma.article.count({ where: { publishedAt: { gte: start, lt: end } } }),
      prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.newsletterSubscription.count({ where: { subscribedAt: { gte: start, lt: end } } }),
      prisma.comment.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.contactMessage.count({ where: { createdAt: { gte: start, lt: end } } }),
    ]);

    const siteName = escapeHtml(settings.siteName);
    const metrics = [
      ['Articles publiés', publishedArticles],
      ['Nouveaux comptes', newUsers],
      ['Nouveaux abonnés à la newsletter', newSubscribers],
      ['Commentaires reçus', newComments],
      ['Messages de contact reçus', newMessages],
    ] as const;
    const text = [
      `Rapport hebdomadaire - ${settings.siteName}`,
      `Période : ${period}`,
      ...metrics.map(([label, count]) => `${label} : ${count}`),
    ].join('\n');
    const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><h1>Rapport hebdomadaire - ${siteName}</h1><p>Période : ${period}</p><ul>${metrics.map(([label, count]) => `<li><strong>${label} :</strong> ${count}</li>`).join('')}</ul></div>`;

    await sendConfiguredEmail({
      to: settings.contactEmail,
      subject: 'Rapport hebdomadaire',
      html,
      text,
    });

    return NextResponse.json({ sent: true, to: settings.contactEmail, period });
  } catch (error) {
    console.error('[weekly reports]', error);
    return NextResponse.json({ error: 'Failed to send the weekly report.' }, { status: 500 });
  }
}
