import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 5_000_000;
const CURRENCY = (process.env.STRIPE_DONATION_CURRENCY || 'xof').toLowerCase();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia' });
}

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const donorName = typeof body.donorName === 'string' ? body.donorName.trim().slice(0, 120) : null;
    const donorEmail = typeof body.donorEmail === 'string' ? body.donorEmail.trim().toLowerCase() : null;
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 500) : null;
    const isAnonymous = Boolean(body.isAnonymous);

    if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json({ error: `Le montant doit être compris entre ${MIN_AMOUNT.toLocaleString()} et ${MAX_AMOUNT.toLocaleString()} FCFA.` }, { status: 400 });
    }
    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    const donation = await prisma.donation.create({
      data: {
        donorName: isAnonymous ? null : donorName,
        donorEmail,
        amount,
        currency: CURRENCY.toUpperCase(),
        type: 'one_time',
        status: 'pending',
        message,
        isAnonymous,
        paymentMethod: 'stripe',
      },
    });

    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: CURRENCY,
          product_data: { name: 'Don à MalakInfo', description: 'Soutien au journalisme indépendant africain' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      customer_email: donorEmail || undefined,
      success_url: `${baseUrl}/fr/nous-soutenir/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/fr/nous-soutenir/faire-un-don?cancelled=1`,
      metadata: { purchaseType: 'donation', donationId: donation.id },
      payment_intent_data: { metadata: { purchaseType: 'donation', donationId: donation.id } },
    });

    await prisma.donation.update({ where: { id: donation.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Donation checkout error:', error);
    return NextResponse.json({ error: 'Impossible de créer le paiement. Veuillez réessayer.' }, { status: 500 });
  }
}
