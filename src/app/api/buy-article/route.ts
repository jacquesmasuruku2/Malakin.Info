import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-07-29.dahlia',
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session for single article purchase
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Achat d\'article premium',
              description: 'Accès à un article premium',
            },
            unit_amount: 190, // $1.90 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fr/nous-soutenir/success?session_id={CHECKOUT_SESSION_ID}&article_id=${articleId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fr/nous-soutenir/faire-un-don`,
      metadata: {
        articleId,
        purchaseType: 'single_article',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating article purchase session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
