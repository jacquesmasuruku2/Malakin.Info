import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint should be called periodically (e.g., every 5 minutes) to clean up expired sessions
// Can be triggered by Vercel Cron Jobs or any external cron service
export async function GET(request: Request) {
  try {
    // Verify this is a cron job call (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete sessions that haven't been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const deletedSessions = await prisma.liveViewerSession.deleteMany({
      where: {
        lastSeenAt: {
          lt: fiveMinutesAgo
        }
      }
    });

    // Update viewer counts for all live events
    const liveEvents = await prisma.liveEvent.findMany({
      where: {
        status: 'LIVE'
      }
    });

    for (const event of liveEvents) {
      const activeViewers = await prisma.liveViewerSession.count({
        where: {
          liveEventId: event.id,
          lastSeenAt: {
            gte: fiveMinutesAgo
          }
        }
      });

      await prisma.liveEvent.update({
        where: { id: event.id },
        data: { viewerCount: activeViewers }
      });
    }

    return NextResponse.json({
      success: true,
      deletedSessions: deletedSessions.count,
      updatedEvents: liveEvents.length
    });
  } catch (error) {
    console.error('Error cleaning up live sessions:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
