import { NextResponse } from 'next/server';
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

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        const updatedSubscription = await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase() },
          data: {
            name: typeof name === 'string' && name.trim() ? name.trim() : existingSubscription.name,
            interests: validatedInterests.length > 0 ? validatedInterests : undefined,
          },
        });

        return cors(NextResponse.json(
          { message: 'Cet email est déjà abonné à la newsletter', subscription: updatedSubscription },
          { status: 200 }
        ));
      } else {
        // Reactivate if previously unsubscribed and update optional profile fields
        const interestsValue = validatedInterests.length > 0
          ? validatedInterests
          : undefined;

        const updatedSubscription = await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase() },
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
          console.error('Welcome email error:', welcomeError);
        }

        return cors(NextResponse.json(
          { message: 'Abonnement réactivé avec succès', subscription: updatedSubscription },
          { status: 200 }
        ));
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
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
      console.error('Welcome email error for newsletter signup:', welcomeError instanceof Error ? welcomeError.stack ?? welcomeError.message : String(welcomeError));
    }

    return cors(NextResponse.json(
      { message: 'Abonnement réussi', subscription },
      { status: 201 }
    ));
  } catch (error) {
    console.error('Newsletter subscription error:');
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    return cors(NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    ));
  }
}
