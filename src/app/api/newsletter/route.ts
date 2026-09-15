import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendWelcomeEmail } from '@/lib/email';

function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

function alreadySubscribedResponse() {
  return cors(
    NextResponse.json(
      {
        error: 'Cet email est déjà inscrit à la newsletter.',
        code: 'already_subscribed',
      },
      { status: 409 },
    ),
  );
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, interests, consent } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return cors(NextResponse.json({ error: 'Email invalide' }, { status: 400 }));
    }

    if (consent !== true) {
      return cors(
        NextResponse.json({ error: "Le consentement est requis pour s'abonner" }, { status: 400 }),
      );
    }

    const validatedInterests = Array.isArray(interests)
      ? interests.filter((item) => typeof item === 'string')
      : [];

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : null;

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing?.isActive) {
      return alreadySubscribedResponse();
    }

    if (existing && !existing.isActive) {
      const reactivated = await prisma.newsletterSubscription.update({
        where: { email: normalizedEmail },
        data: {
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          name: trimmedName || existing.name,
          ...(validatedInterests.length > 0 ? { interests: validatedInterests } : {}),
        },
      });

      sendWelcomeEmail({ to: reactivated.email, name: reactivated.name }).catch((err) =>
        console.error('[newsletter] Welcome email failed:', err),
      );

      return cors(
        NextResponse.json(
          { message: 'Abonnement réactivé avec succès', code: 'reactivated', subscription: reactivated },
          { status: 200 },
        ),
      );
    }

    try {
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: normalizedEmail,
          name: trimmedName,
          interests: validatedInterests.length > 0 ? validatedInterests : undefined,
          isActive: true,
          subscribedAt: new Date(),
        },
      });

      const response = cors(
        NextResponse.json({ message: 'Abonnement réussi', code: 'created', subscription }, { status: 201 }),
      );

      sendTelegramMessage(`Nouvel abonnement à la newsletter : ${subscription.email}`)
        .then((result) =>
          console.info('[newsletter] Telegram notification result', { email: subscription.email, result }),
        )
        .catch((err) => console.error('[newsletter] Telegram notification failed:', err));

      sendWelcomeEmail({ to: subscription.email, name: subscription.name })
        .then(() => console.info('[newsletter] Welcome email sent successfully'))
        .catch((err) => console.error('[newsletter] Welcome email failed:', err));

      return response;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return alreadySubscribedResponse();
      }

      console.error('[newsletter] Error creating subscription:', error);
      return cors(NextResponse.json({ error: "Erreur lors de l'abonnement" }, { status: 500 }));
    }
  } catch (error) {
    console.error('[newsletter] Request error:', error);
    return cors(NextResponse.json({ error: 'Erreur serveur' }, { status: 500 }));
  }
}
