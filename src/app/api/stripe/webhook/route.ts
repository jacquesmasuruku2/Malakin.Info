import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

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

        // Here you can:
        // 1. Save the subscription to your database
        // 2. Send confirmation email
        // 3. Update user account status
        // 4. etc.

        // Example: Save to database
        // await prisma.subscription.create({
        //   data: {
        //     stripeSessionId: session.id,
        //     email: session.customer_email,
        //     amount: session.amount_total,
        //     planName: session.metadata?.planName,
        //     country: session.metadata?.country,
        //     isGift: session.metadata?.isGift === 'true',
        //     status: 'active',
        //   }
        // });

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
