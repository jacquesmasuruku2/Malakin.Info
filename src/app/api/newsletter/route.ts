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

    // Try to create subscription directly, handle P2002 (unique constraint) for duplicates
    try {
      const subscription = await prisma.newsletterSubscription.create({
        data: {
          email: normalizedEmail,
          name: typeof name === 'string' && name.trim() ? name.trim() : null,
          interests: validatedInterests.length > 0 ? validatedInterests : undefined,
          isActive: true,
          subscribedAt: new Date(),
        },
      });

      // Send Telegram notification (non-blocking)
      sendTelegramMessage(`Nouvel abonnement à la newsletter : ${subscription.email}`)
        .then(result => console.info('Telegram notification result', { email: subscription.email, result }))
        .catch(err => console.error('Telegram notification failed:', err));

      // Send welcome email (non-blocking)
      sendWelcomeEmail({ to: subscription.email, name: subscription.name })
        .catch(err => console.error('Welcome email failed:', err));

      return cors(NextResponse.json(
        { message: 'Abonnement réussi', subscription },
        { status: 201 }
      ));
    } catch (error) {
      // Handle duplicate email error
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.warn('[newsletter] Duplicate email detected:', normalizedEmail);
        
        // Try to find existing subscription
        const existing = await prisma.newsletterSubscription.findUnique({
          where: { email: normalizedEmail }
        });

        if (existing) {
          if (existing.isActive) {
            return cors(NextResponse.json(
              { message: 'Cet email est déjà abonné à la newsletter' },
              { status: 200 }
            ));
          } else {
            // Reactivate
            const reactivated = await prisma.newsletterSubscription.update({
              where: { email: normalizedEmail },
              data: {
                isActive: true,
                subscribedAt: new Date(),
                name: typeof name === 'string' && name.trim() ? name.trim() : existing.name,
                interests: validatedInterests.length > 0 ? validatedInterests as any : existing.interests,
              }
            });

            sendWelcomeEmail({ to: reactivated.email, name: reactivated.name })
              .catch(err => console.error('Welcome email failed:', err));

            return cors(NextResponse.json(
              { message: 'Abonnement réactivé avec succès', subscription: reactivated },
              { status: 200 }
            ));
          }
        }
      }

      console.error('[newsletter] Error creating subscription:', error);
      return cors(NextResponse.json(
        { error: 'Erreur lors de l\'abonnement' },
        { status: 500 }
      ));
    }
  } catch (error) {
    console.error('[newsletter] Request error:', error);
    return cors(NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    ));
  }
}
