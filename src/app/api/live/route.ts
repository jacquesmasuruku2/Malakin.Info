import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to add CORS headers
function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://dashboard.malakinfo.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return cors(response);
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get current live event
    if (type === 'current') {
      const now = new Date();
      const currentLive = await prisma.liveEvent.findFirst({
        where: {
          startTime: { lte: now },
          OR: [
            { endTime: null },
            { endTime: { gte: now } }
          ]
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      if (currentLive) {
        // Update status to LIVE if needed
        const calculatedStatus = calculateStatus(currentLive.startTime, currentLive.endTime);
        if (calculatedStatus !== currentLive.status) {
          await prisma.liveEvent.update({
            where: { id: currentLive.id },
            data: { status: calculatedStatus }
          });
          currentLive.status = calculatedStatus;
        }
      }

      return cors(NextResponse.json(currentLive));
    }

    // Get upcoming events
    if (type === 'upcoming') {
      const now = new Date();
      const upcomingEvents = await prisma.liveEvent.findMany({
        where: {
          startTime: { gt: now },
          status: 'SCHEDULED'
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 5
      });

      return cors(NextResponse.json(upcomingEvents));
    }

    // Get all events
    const events = await prisma.liveEvent.findMany({
      orderBy: {
        startTime: 'desc'
      }
    });

    // Update statuses for all events
    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        const calculatedStatus = calculateStatus(event.startTime, event.endTime);
        if (calculatedStatus !== event.status) {
          return await prisma.liveEvent.update({
            where: { id: event.id },
            data: { status: calculatedStatus }
          });
        }
        return event;
      })
    );

    return cors(NextResponse.json(updatedEvents));
  } catch (error) {
    console.error('Error fetching live events:', error);
    return cors(NextResponse.json(
      { error: 'Failed to fetch live events' },
      { status: 500 }
    ));
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
        ...body,
        status,
        startTime,
        endTime
      }
    });

    return cors(NextResponse.json(event, { status: 201 }));
  } catch (error) {
    console.error('Error creating live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to create live event' },
      { status: 500 }
    ));
  }
}
