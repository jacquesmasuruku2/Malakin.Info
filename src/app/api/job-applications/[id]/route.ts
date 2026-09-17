import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
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
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    await prisma.jobApplicationMessage.updateMany({
      where: {
        applicationId: id,
        senderType: 'applicant',
        readAt: null,
      },
      data: { readAt: new Date() },
    });

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
    const { status, adminMessage } = body;

    const data: Record<string, unknown> = {};
    if (typeof status === 'string' && status.trim()) {
      data.status = status.trim();
    }

    const messageText =
      typeof adminMessage === 'string' && adminMessage.trim() ? adminMessage.trim() : null;

    if (messageText) {
      data.adminMessage = messageText;
      data.respondedAt = new Date();
    }

    if (Object.keys(data).length === 0 && !messageText) {
      return NextResponse.json(
        { error: 'Nothing to update' },
        { status: 400, headers: corsHeaders }
      );
    }

    const application = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.jobApplication.update({
          where: { id },
          data,
        });
      }

      if (messageText) {
        await tx.jobApplicationMessage.create({
          data: {
            applicationId: id,
            senderType: 'recruiter',
            senderName: 'MalakInfo Recrutement',
            body: messageText,
          },
        });
      }

      return tx.jobApplication.findUnique({
        where: { id },
        include: {
          jobOffer: {
            select: {
              title: true,
              location: true,
              type: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
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
