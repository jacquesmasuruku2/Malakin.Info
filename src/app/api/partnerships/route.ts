import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyCors, corsOptions } from '@/lib/cors';
import { sendPartnershipConfirmationEmail } from '@/lib/email';

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyName,
      contactName,
      email,
      phone,
      partnershipType,
      message,
      budget,
      timeline,
    } = body;

    if (!companyName || !contactName || !email || !partnershipType || !message) {
      return applyCors(
        NextResponse.json({ message: 'Missing required fields' }, { status: 400 }),
        request,
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return applyCors(
        NextResponse.json({ message: 'Invalid email format' }, { status: 400 }),
        request,
      );
    }

    const partnership = await prisma.partnership.create({
      data: {
        companyName,
        contactName,
        email,
        phone: phone || null,
        type: partnershipType,
        description: `${message}${budget ? `\n\nBudget: ${budget}` : ''}${timeline ? `\n\nTimeline: ${timeline}` : ''}`,
        status: 'pending',
      },
    });

    try {
      await sendPartnershipConfirmationEmail({
        to: email,
        name: contactName,
        companyName,
        partnershipType,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    return applyCors(
      NextResponse.json(
        {
          message: 'Partnership request submitted successfully',
          partnershipId: partnership.id,
        },
        { status: 201 },
      ),
      request,
    );
  } catch (error) {
    console.error('Error creating partnership:', error);
    return applyCors(
      NextResponse.json({ message: 'Internal server error' }, { status: 500 }),
      request,
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const publicOnly = searchParams.get('public') === '1';

    const where =
      publicOnly || status === 'approved'
        ? { status: 'approved' }
        : status && status !== 'all'
          ? { status }
          : {};

    const partnerships = await prisma.partnership.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Admin panel expects a raw array (same shape as /api/contact).
    return applyCors(NextResponse.json(partnerships), request);
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return applyCors(
      NextResponse.json({ message: 'Internal server error' }, { status: 500 }),
      request,
    );
  }
}
