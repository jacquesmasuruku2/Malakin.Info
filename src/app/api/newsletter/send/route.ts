import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewsletterEmail } from '@/lib/email';

interface Body {
  subject: string;
  html: string;
  text?: string;
  filter?: {
    activeOnly?: boolean;
    interests?: string[];
  };
}

export async function POST(request: Request) {
  try {
    const body: Body = await request.json();
    const { subject, html, text, filter } = body;

    if (!subject || !html) {
      return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
    }

    const where: any = {};
    if (filter?.activeOnly) {
      where.isActive = true;
    }

    const subscribers = await prisma.newsletterSubscription.findMany({ where });
    const filteredSubscribers = filter?.interests?.length
      ? subscribers.filter((subscriber) => {
          const interests = Array.isArray(subscriber.interests) ? subscriber.interests : [];
          return filter.interests?.every((interest) => interests.includes(interest));
        })
      : subscribers;

    if (filteredSubscribers.length === 0) {
      return NextResponse.json({ message: 'Aucun abonné trouvé pour l’envoi' });
    }

    const results = [] as Array<{ email: string; success: boolean; error?: string }>;

    const renderText = (source: string) =>
      source
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    for (const subscriber of filteredSubscribers) {
      const personalizedHtml = html.replace(/\{\{name\}\}/g, subscriber.name || 'cher abonné');
      const baseText = text && text.trim() ? text : html;
      const personalizedText = renderText(baseText).replace(/\{\{name\}\}/g, subscriber.name || 'cher abonné');

      try {
        await sendNewsletterEmail({
          to: subscriber.email,
          subject,
          html: personalizedHtml,
          text: personalizedText,
        });
        results.push({ email: subscriber.email, success: true });
      } catch (error) {
        results.push({ email: subscriber.email, success: false, error: String(error) });
      }
    }

    return NextResponse.json({ count: filteredSubscribers.length, results });
  } catch (error) {
    console.error('Newsletter send error:');
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    return NextResponse.json(
      { error: 'Échec de l’envoi de la newsletter', details: 'Une erreur côté serveur est survenue.' },
      { status: 500 }
    );
  }
}
