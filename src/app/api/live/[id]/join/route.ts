import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return cors(NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      ));
    }

    // Check if live event exists and is live
    const event = await prisma.liveEvent.findUnique({
      where: { id }
    });

    if (!event) {
      return cors(NextResponse.json(
        { error: 'Live event not found' },
        { status: 404 }
      ));
    }

    if (event.status !== 'LIVE') {
      return cors(NextResponse.json(
        { error: 'Event is not currently live' },
        { status: 400 }
      ));
    }

    // Create or update viewer session
    const session = await prisma.liveViewerSession.upsert({
      where: {
        liveEventId_sessionId: {
          liveEventId: id,
          sessionId
        }
      },
      create: {
        liveEventId: id,
        sessionId
      },
      update: {
        lastSeenAt: new Date()
      }
    });

    // Update viewer count
    const activeViewers = await prisma.liveViewerSession.count({
      where: {
        liveEventId: id,
        lastSeenAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Active within last 5 minutes
        }
      }
    });

    await prisma.liveEvent.update({
      where: { id },
      data: { viewerCount: activeViewers }
    });

    return cors(NextResponse.json({
      success: true,
      viewerCount: activeViewers
    }));
  } catch (error) {
    console.error('Error joining live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to join live event' },
      { status: 500 }
    ));
  }
}
