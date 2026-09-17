import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { email: { equals: currentUser.email, mode: 'insensitive' as const } },
        ],
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            location: true,
            salary: true,
            imageUrl: true,
            deadline: true,
            publishedAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderType: 'recruiter',
                readAt: null,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching user job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
