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

function serializeLiveEvent(event: any) {
  return {
    ...event,
    category: event.category?.title ?? null,
    categoryId: event.categoryId ?? null,
  };
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[live API] GET request for ID:', id);
    const event = await prisma.liveEvent.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    console.log('[live API] Event found:', !!event);

    if (!event) {
      console.log('[live API] Event not found');
      return NextResponse.json(
        { error: 'Live event not found' },
        { status: 404 }
      );
    }

    // Update status if needed
    const calculatedStatus = calculateStatus(event.startTime, event.endTime);
    if (calculatedStatus !== event.status) {
      console.log('[live API] Updating status:', event.status, '->', calculatedStatus);
      const updatedEvent = await prisma.liveEvent.update({
        where: { id },
        data: { status: calculatedStatus },
        include: { category: true },
      });
      return cors(NextResponse.json(serializeLiveEvent(updatedEvent)));
    }

    console.log('[live API] Returning event:', event.id);
    return cors(NextResponse.json(serializeLiveEvent(event)));
  } catch (error) {
    console.error('[live API] Error fetching live event:', error);
    console.error('[live API] Error details:', error instanceof Error ? error.message : String(error));
    return cors(NextResponse.json(
      { error: 'Failed to fetch live event' },
      { status: 500 }
    ));
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Convert dates if provided
    const data: any = { ...body };
    if (body.startTime) {
      data.startTime = new Date(body.startTime);
    }
    if (body.endTime) {
      data.endTime = new Date(body.endTime);
    }

    // Recalculate status if times changed
    if (body.startTime || body.endTime) {
      const event = await prisma.liveEvent.findUnique({
        where: { id }
      });
      if (event) {
        const newStartTime = body.startTime ? new Date(body.startTime) : event.startTime;
        const newEndTime = body.endTime ? new Date(body.endTime) : event.endTime;
        data.status = calculateStatus(newStartTime, newEndTime);
      }
    }

    const event = await prisma.liveEvent.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        thumbnail: data.thumbnail || null,
        streamUrl: data.streamUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        startTime: data.startTime,
        endTime: data.endTime,
        isFeatured: data.isFeatured,
        categoryId: body.categoryId || null,
        status: data.status,
      },
      include: { category: true },
    });

    return cors(NextResponse.json(serializeLiveEvent(event)));
  } catch (error) {
    console.error('Error updating live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to update live event' },
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
    await prisma.liveEvent.delete({
      where: { id }
    });

    return cors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting live event:', error);
    return cors(NextResponse.json(
      { error: 'Failed to delete live event' },
      { status: 500 }
    ));
  }
}
