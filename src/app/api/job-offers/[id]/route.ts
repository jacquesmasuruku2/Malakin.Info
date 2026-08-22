import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: corsHeaders });
}

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
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(jobOffer, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching job offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job offer' },
      { status: 500, headers: corsHeaders }
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

    const jobOffer = await prisma.jobOffer.update({
      where: { id },
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        description,
        requirements,
        details: details !== undefined ? details : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        location,
        type,
        salary,
        companyId,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        deadline: deadline ? new Date(deadline) : null,
        featured: featured !== undefined ? featured : undefined,
      },
    });

    return NextResponse.json(jobOffer, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating job offer:', error);
    return NextResponse.json(
      { error: 'Failed to update job offer' },
      { status: 500, headers: corsHeaders }
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

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting job offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete job offer' },
      { status: 500, headers: corsHeaders }
    );
  }
}
