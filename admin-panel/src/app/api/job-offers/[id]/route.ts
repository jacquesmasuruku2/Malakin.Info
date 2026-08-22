import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: 'Job offer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error('Error fetching job offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job offer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      description,
      requirements,
      location,
      type,
      salary,
      companyId,
      publishedAt,
      deadline,
      featured,
    } = body;

    const jobOffer = await prisma.jobOffer.update({
      where: { id },
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description,
        requirements,
        location,
        type,
        salary,
        companyId,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        deadline: deadline ? new Date(deadline) : null,
        featured: featured !== undefined ? featured : undefined,
      },
    });

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error('Error updating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to update job offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.jobOffer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete job offer' },
      { status: 500 }
    );
  }
}
