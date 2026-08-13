import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendWelcomeEmail } from '@/lib/email';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
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
  console.log('[newsletter] POST request received');
  try {
    const body = await request.json();
    console.log('[newsletter] Request body:', { email: body.email, hasConsent: !!body.consent });
    const { email, name, interests, consent } = body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.warn('[newsletter] Invalid email:', email);
      return cors(NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      ));
    }

    if (consent !== true) {
      console.warn('[newsletter] Missing consent');
      return cors(NextResponse.json(
        { error: 'Le consentement est requis pour s\'abonner' },
        { status: 400 }
      ));
    }

    const validatedInterests = Array.isArray(interests)
      ? interests.filter((item) => typeof item === 'string')
      : [];

    const normalizedEmail = email.toLowerCase();
    console.log('[newsletter] Attempting to create subscription for:', normalizedEmail);

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
      console.log('[newsletter] Subscription created successfully:', subscription.id);

      // Send response immediately before notifications
      const response = cors(NextResponse.json(
        { message: 'Abonnement réussi', subscription },
        { status: 201 }
      ));

      // Send Telegram notification (non-blocking, after response)
      sendTelegramMessage(`Nouvel abonnement à la newsletter : ${subscription.email}`)
        .then(result => console.info('[newsletter] Telegram notification result', { email: subscription.email, result }))
        .catch(err => console.error('[newsletter] Telegram notification failed:', err));

      // Send welcome email (non-blocking, after response)
      sendWelcomeEmail({ to: subscription.email, name: subscription.name })
        .then(() => console.info('[newsletter] Welcome email sent successfully'))
        .catch(err => console.error('[newsletter] Welcome email failed:', err));

      return response;
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
            console.log('[newsletter] Email already active');
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
            console.log('[newsletter] Subscription reactivated:', reactivated.id);

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
      console.error('[newsletter] Error details:', error instanceof Error ? error.message : String(error));
      console.error('[newsletter] Error stack:', error instanceof Error ? error.stack : 'No stack');
      return cors(NextResponse.json(
        { error: 'Erreur lors de l\'abonnement' },
        { status: 500 }
      ));
    }
  } catch (error) {
    console.error('[newsletter] Request error:', error);
    console.error('[newsletter] Request error details:', error instanceof Error ? error.message : String(error));
    return cors(NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    ));
  }
}
