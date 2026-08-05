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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.liveEvent.update({
      where: { id },
      data: {
        status: 'LIVE',
        startTime: new Date()
      }
    });

    return cors(NextResponse.json(event));
  } catch (error) {
    console.error('Error starting live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to start live event' },
      { status: 500 }
    ));
  }
}
