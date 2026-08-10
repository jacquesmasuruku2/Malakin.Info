import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, interests } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() },
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
