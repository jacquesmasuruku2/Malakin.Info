import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return cors(response);
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

    // Update session last seen time
    const session = await prisma.liveViewerSession.update({
      where: {
        liveEventId_sessionId: {
          liveEventId: id,
          sessionId
        }
      },
      data: {
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
    console.error('Error updating heartbeat:', error);
    return cors(NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    ));
  }
}
