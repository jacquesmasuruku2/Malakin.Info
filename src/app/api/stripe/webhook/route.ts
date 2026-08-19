import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-07-29.dahlia',
  });
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    const stripe = getStripe();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Payment successful:', session.id);
        console.log('Customer email:', session.customer_email);
        console.log('Amount:', session.amount_total);
        console.log('Metadata:', session.metadata);

        const purchaseType = session.metadata?.purchaseType;
        const articleId = session.metadata?.articleId;

        // Find or create user by email
        let user = await prisma.user.findUnique({
          where: { email: session.customer_email! },
        });

        if (!user) {
          // Create a temporary user for the purchase
          user = await prisma.user.create({
            data: {
              email: session.customer_email!,
              name: session.customer_email!.split('@')[0],
              passwordHash: '', // Will need to set password later
            },
          });
        }

        // Calculate expiration date (1 week from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        if (purchaseType === 'single_article' && articleId) {
          // Record article purchase
          await prisma.articlePurchase.create({
            data: {
              userId: user.id,
              articleId,
              amount: session.amount_total! / 100, // Convert from cents
              currency: session.currency?.toUpperCase() || 'USD',
              status: 'completed',
              expiresAt,
            },
          });
          console.log('Article purchase recorded for user:', user.id);
        } else {
          // Record subscription
          await prisma.subscription.create({
            data: {
              userId: user.id,
              amount: session.amount_total! / 100, // Convert from cents
              currency: session.currency?.toUpperCase() || 'USD',
              status: 'active',
              expiresAt,
            },
          });
          console.log('Subscription recorded for user:', user.id);
        }

        break;

      case 'checkout.session.expired':
        console.log('Checkout session expired:', event.data.object.id);
        break;

      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
