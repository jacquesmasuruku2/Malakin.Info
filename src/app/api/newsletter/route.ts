import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, interests, consent } = body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json(
        { error: 'Le consentement est requis pour s\'abonner' },
        { status: 400 }
      );
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

        return NextResponse.json(
          { message: 'Cet email est déjà abonné à la newsletter', subscription: updatedSubscription },
          { status: 200 }
        );
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

        return NextResponse.json(
          { message: 'Abonnement réactivé avec succès', subscription: updatedSubscription },
          { status: 200 }
        );
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
    console.info('Telegram notification result for newsletter signup', { email: subscription.email, status: telegramResult.ok });

    try {
      await sendWelcomeEmail({ to: subscription.email, name: subscription.name });
    } catch (welcomeError) {
      console.error('Welcome email error for newsletter signup:', welcomeError instanceof Error ? welcomeError.stack ?? welcomeError.message : String(welcomeError));
    }

    return NextResponse.json(
      { message: 'Abonnement réussi', subscription },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:');
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}
