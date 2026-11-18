import { NextRequest, NextResponse } from 'next/server';
import { applyCors, corsOptions } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';
import { verifyRecaptchaToken } from '@/lib/recaptcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, recaptchaToken } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
      return NextResponse.json(
        { error: 'A reCAPTCHA token is required.' },
        { status: 400 },
      );
    }

    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken);
    if (recaptchaResult === 'not_configured') {
      return NextResponse.json(
        { error: 'reCAPTCHA is not configured.' },
        { status: 503 },
      );
    }
    if (recaptchaResult === 'unavailable') {
      return NextResponse.json(
        { error: 'reCAPTCHA verification is temporarily unavailable.' },
        { status: 502 },
      );
    }
    if (recaptchaResult === 'invalid') {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed.' },
        { status: 400 },
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
      },
    });

    const telegramResult = await sendTelegramMessage(
      `Nouveau message de contact reçu :\nNom : ${name}\nEmail : ${email}\nSujet : ${subject || '—'}\nMessage : ${message}`
    );
    console.log('Telegram notification result (contact):', telegramResult);

    return NextResponse.json(
      { message: 'Message sent successfully', id: contactMessage.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return applyCors(NextResponse.json(messages), request);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return applyCors(
      NextResponse.json({ error: 'Failed to fetch messages', messages: [] }, { status: 500 }),
      request,
    );
  }
}
