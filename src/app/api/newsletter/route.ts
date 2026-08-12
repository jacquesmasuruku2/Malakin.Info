import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendWelcomeEmail } from '@/lib/email';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, interests, consent } = body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return cors(NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      ));
    }

    if (consent !== true) {
      return cors(NextResponse.json(
        { error: 'Le consentement est requis pour s\'abonner' },
        { status: 400 }
      ));
    }

    const validatedInterests = Array.isArray(interests)
      ? interests.filter((item) => typeof item === 'string')
      : [];

    const normalizedEmail = email.toLowerCase();

    let existingSubscription;

    try {
      // Check if email already exists
      existingSubscription = await prisma.newsletterSubscription.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (error) {
      console.error('[newsletter signup] Prisma findUnique failed:', {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return cors(NextResponse.json(
        { error: 'Erreur de base de données lors de la vérification de l\'abonnement.' },
        { status: 500 }
      ));
    }

    if (existingSubscription) {
      try {
        if (existingSubscription.isActive) {
          const updatedSubscription = await prisma.newsletterSubscription.update({
            where: { email: normalizedEmail },
            data: {
              name: typeof name === 'string' && name.trim() ? name.trim() : existingSubscription.name,
              interests: validatedInterests.length > 0 ? validatedInterests : undefined,
            },
          });

          return cors(NextResponse.json(
            { message: 'Cet email est déjà abonné à la newsletter', subscription: updatedSubscription },
            { status: 200 }
          ));
        }

        // Reactivate if previously unsubscribed and update optional profile fields
        const interestsValue = validatedInterests.length > 0 ? validatedInterests : undefined;

        const updatedSubscription = await prisma.newsletterSubscription.update({
          where: { email: normalizedEmail },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            name: typeof name === 'string' && name.trim() ? name.trim() : existingSubscription.name,
            interests: interestsValue,
          },
        });

        try {
          await sendWelcomeEmail({ to: updatedSubscription.email, name: updatedSubscription.name });
        } catch (welcomeError) {
          console.error('[newsletter signup] Welcome email error:',
            welcomeError instanceof Error ? welcomeError.stack ?? welcomeError.message : String(welcomeError));
        }

        return cors(NextResponse.json(
          { message: 'Abonnement réactivé avec succès', subscription: updatedSubscription },
          { status: 200 }
        ));
      } catch (error) {
        console.error('[newsletter signup] Prisma update failed:', {
          code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        return cors(NextResponse.json(
          { error: 'Erreur de mise à jour de l\'abonnement.' },
          { status: 500 }
        ));
      }
    }

    try {
      // Create new subscription
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: normalizedEmail,
          name: typeof name === 'string' && name.trim() ? name.trim() : null,
          interests: validatedInterests.length > 0 ? validatedInterests : undefined,
          isActive: true,
          subscribedAt: new Date(),
        },
      });

      const telegramResult = await sendTelegramMessage(
        `Nouvel abonnement à la newsletter : ${subscription.email}`
      );
      console.info('Telegram notification result for newsletter signup', { email: subscription.email, telegramResult });

      try {
        await sendWelcomeEmail({ to: subscription.email, name: subscription.name });
      } catch (welcomeError) {
        console.error('[newsletter signup] Welcome email error:',
          welcomeError instanceof Error ? welcomeError.stack ?? welcomeError.message : String(welcomeError));
      }

      return cors(NextResponse.json(
        { message: 'Abonnement réussi', subscription },
        { status: 201 }
      ));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.warn('[newsletter signup] Duplicate subscription detected after pre-check:', {
          code: error.code,
          target: error.meta?.target,
          message: error.message,
        });

        return cors(NextResponse.json(
          { message: 'Cet email est déjà inscrit à la newsletter.' },
          { status: 200 }
        ));
      }

      console.error('[newsletter signup] Prisma create failed:', {
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : 'UNKNOWN',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return cors(NextResponse.json(
        { error: 'Erreur lors de l\'abonnement.' },
        { status: 500 }
      ));
    }
  } catch (error) {
    console.error('Newsletter subscription error:');
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    return cors(NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    ));
  }
}
