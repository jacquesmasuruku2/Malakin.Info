import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (status === 'active') {
      where.deadline = { gte: new Date() };
    } else if (status === 'expired') {
      where.deadline = { lt: new Date() };
    }
    if (type) {
      where.type = type;
    }

    const jobOffers = await prisma.jobOffer.findMany({
      where,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(jobOffers);
  } catch (error) {
    console.error('Error fetching job offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      requirements,
      details,
      imageUrl,
      location,
      type,
      salary,
      companyId,
      publishedAt,
      deadline,
      featured,
    } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Title, description, and type are required' },
        { status: 400 }
      );
    }

    const jobOffer = await prisma.jobOffer.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description,
        requirements,
        details: details || {},
        imageUrl,
        location,
        type,
        salary,
        companyId,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        deadline: deadline ? new Date(deadline) : null,
        featured: featured || false,
      },
    });

    return NextResponse.json(jobOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to create job offer' },
      { status: 500 }
    );
  }
}
