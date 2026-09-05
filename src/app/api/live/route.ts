import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse, request?: Request) {
  const requestOrigin = request?.headers.get('origin');
  const allowedOrigins = [
    process.env.ADMIN_PANEL_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    'https://dashboard.malakinfo.com',
    'http://localhost:3001',
    'http://localhost:3000',
  ].filter(Boolean);
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
  if (origin) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, { status: 200 });
  return cors(response, request);
}

function serializeLiveEvent(event: any) {
  return {
    ...event,
    streamType: event.streamType ?? 'VIDEO',
    category: event.category?.title ?? null,
    categoryId: event.categoryId ?? null,
  };
}

// Helper function to calculate status based on time
function calculateStatus(startTime: Date, endTime: Date | null): 'SCHEDULED' | 'LIVE' | 'ENDED' {
  const now = new Date();
  if (now < startTime) {
    return 'SCHEDULED';
  }
  if (endTime && now > endTime) {
    return 'ENDED';
  }
  if (!endTime || now <= endTime) {
    return 'LIVE';
  }
  return 'ENDED';
}

export async function GET(request: Request) {
  try {
    console.log('[live API] GET request received');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    console.log('[live API] Type:', type);

    // Get current live event
    if (type === 'current') {
      try {
        console.log('[live API] Fetching current live event');
        const now = new Date();
        const currentLive = await prisma.liveEvent.findFirst({
          where: {
            streamType: 'VIDEO',
            startTime: { lte: now },
            OR: [
              { endTime: null },
              { endTime: { gte: now } }
            ]
          },
          orderBy: {
            startTime: 'desc'
          },
        });
        console.log('[live API] Current live fetched:', currentLive?.id || 'none');

        if (currentLive) {
          // Update status to LIVE if needed
          const calculatedStatus = calculateStatus(currentLive.startTime, currentLive.endTime);
          if (calculatedStatus !== currentLive.status) {
            console.log('[live API] Updating status:', currentLive.status, '->', calculatedStatus);
            await prisma.liveEvent.update({
              where: { id: currentLive.id },
              data: { status: calculatedStatus }
            });
            currentLive.status = calculatedStatus;
          }
        }

        return cors(NextResponse.json(currentLive ? serializeLiveEvent(currentLive) : null), request);
      } catch (error) {
        console.error('[live API] Error fetching current live:', error);
        console.error('[live API] Error details:', error instanceof Error ? error.message : String(error));
        console.error('[live API] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return cors(NextResponse.json(null), request);
      }
    }

    // Get upcoming events
    if (type === 'upcoming') {
      try {
        console.log('[live API] Fetching upcoming events');
        const now = new Date();
        const upcomingEvents = await prisma.liveEvent.findMany({
          where: {
            startTime: { gt: now },
            status: 'SCHEDULED'
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 5,
        });
        console.log('[live API] Upcoming events fetched:', upcomingEvents.length);

        return cors(NextResponse.json(upcomingEvents.map(serializeLiveEvent)), request);
      } catch (error) {
        console.error('[live API] Error fetching upcoming events:', error);
        console.error('[live API] Error details:', error instanceof Error ? error.message : String(error));
        return cors(NextResponse.json([]), request);
      }
    }

    // Get all events
    try {
      console.log('[live API] Fetching all events');
      const events = await prisma.liveEvent.findMany({
        orderBy: {
          startTime: 'desc'
        },
      });
      console.log('[live API] All events fetched:', events.length);

      // Update statuses for all events (non-blocking)
      const statusUpdates = events.map(async (event: any) => {
        const calculatedStatus = calculateStatus(event.startTime, event.endTime);
        if (calculatedStatus !== event.status) {
          try {
            await prisma.liveEvent.update({
              where: { id: event.id },
              data: { status: calculatedStatus }
            });
          } catch (err) {
            console.error('[live API] Error updating status:', err);
          }
        }
      });

      // Run status updates in background
      Promise.allSettled(statusUpdates);

      return cors(NextResponse.json(events.map(serializeLiveEvent)), request);
    } catch (error) {
      console.error('[live API] Error fetching all events:', error);
      console.error('[live API] Error details:', error instanceof Error ? error.message : String(error));
      console.error('[live API] Error stack:', error instanceof Error ? error.stack : 'No stack');
      return cors(NextResponse.json([]), request);
    }
  } catch (error) {
    console.error('[live API] Unexpected error:', error);
    console.error('[live API] Error details:', error instanceof Error ? error.message : String(error));
    return cors(NextResponse.json([]));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.slug || !body.startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, startTime' },
        { status: 400 }
      );
    }

    // Calculate initial status
    const startTime = new Date(body.startTime);
    const endTime = body.endTime ? new Date(body.endTime) : null;
    const status = calculateStatus(startTime, endTime);

    const event = await prisma.liveEvent.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        thumbnail: body.thumbnail || null,
        streamUrl: body.streamUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        streamType: body.streamType === 'AUDIO' ? 'AUDIO' : 'VIDEO',
        status,
        startTime,
        endTime,
        isFeatured: body.isFeatured || false,
        categoryId: body.categoryId || null,
      }
    });

    return cors(NextResponse.json(serializeLiveEvent(event), { status: 201 }));
  } catch (error) {
    console.error('Error creating live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to create live event' },
      { status: 500 }
    ));
  }
}
