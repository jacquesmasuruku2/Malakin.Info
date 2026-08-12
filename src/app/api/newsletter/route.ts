import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

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
        return NextResponse.json(
          { error: 'Cet email est déjà abonné à la newsletter' },
          { status: 400 }
        );
      } else {
        // Reactivate if previously unsubscribed
        await prisma.newsletterSubscription.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true, subscribedAt: new Date() },
        });
        return NextResponse.json(
          { message: 'Abonnement réactivé avec succès' },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: email.toLowerCase(),
        isActive: true,
        subscribedAt: new Date(),
      },
    });

    const telegramResult = await sendTelegramMessage(
      `Nouvel abonnement à la newsletter : ${subscription.email}`
    );
    console.log('Telegram notification result (newsletter):', telegramResult);

    return NextResponse.json(
      { message: 'Abonnement réussi', subscription },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}
