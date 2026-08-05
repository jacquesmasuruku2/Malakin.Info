import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

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
      return cors(NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      ));
    }

    return cors(NextResponse.json(application));
  } catch (error) {
    console.error('Error fetching job application:', error);
    return cors(NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500 }
    ));
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

    return cors(NextResponse.json(application));
  } catch (error) {
    console.error('Error updating job application:', error);
    return cors(NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    ));
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

    return cors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting job application:', error);
    return cors(NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    ));
  }
}
