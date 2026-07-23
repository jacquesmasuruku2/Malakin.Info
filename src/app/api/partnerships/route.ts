import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, partnershipType, message } = body;

    if (!name || !email || !company || !partnershipType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const partnership = await prisma.partnership.create({
      data: {
        companyName: company,
        contactName: name,
        email,
        type: partnershipType,
        description: message || null,
      },
    });

    return NextResponse.json(
      { message: 'Partnership request submitted successfully', id: partnership.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating partnership request:', error);
    return NextResponse.json(
      { error: 'Failed to submit partnership request' },
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(partnerships);
  } catch (error) {
    console.error('Error fetching partnership requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership requests', partnerships: [] },
      { status: 500 }
    );
  }
}
