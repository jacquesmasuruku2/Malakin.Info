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

    const data: any = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description,
      location,
      type,
      salary,
      deadline: deadline ? new Date(deadline) : null,
    };

    if (requirements !== undefined) data.requirements = requirements;
    if (details !== undefined) data.details = details;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (companyId !== undefined) data.companyId = companyId;
    if (publishedAt) data.publishedAt = new Date(publishedAt);
    if (featured !== undefined) data.featured = featured;

    const jobOffer = await prisma.jobOffer.update({
      where: { id },
      data,
    });

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error('Error updating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to update job offer', details: String(error) },
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
