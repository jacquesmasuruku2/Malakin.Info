import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      timeline
    } = body;

    // Validation
    if (!companyName || !contactName || !email || !partnershipType || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create partnership request
    const partnership = await prisma.partnership.create({
      data: {
        companyName,
        contactName,
        email,
        phone: phone || null,
        type: partnershipType,
        description: `${message}${budget ? `\n\nBudget: ${budget}` : ''}${timeline ? `\n\nTimeline: ${timeline}` : ''}`,
        status: 'pending'
      }
    });

    return NextResponse.json(
      { 
        message: 'Partnership request submitted successfully',
        partnershipId: partnership.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating partnership:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const partnerships = await prisma.partnership.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ partnerships });
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
