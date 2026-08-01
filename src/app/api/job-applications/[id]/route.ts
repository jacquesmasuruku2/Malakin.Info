import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
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
            description: true,
            requirements: true,
            location: true,
            type: true,
            salary: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
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

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    );
  }
}
