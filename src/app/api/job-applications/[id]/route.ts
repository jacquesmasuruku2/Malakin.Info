import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobOffer: {
          select: {
            title: true,
            location: true,
            type: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(application, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        jobOffer: {
          select: {
            title: true,
            location: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(application, { headers: corsHeaders });
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
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

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500, headers: corsHeaders }
    );
  }
}
