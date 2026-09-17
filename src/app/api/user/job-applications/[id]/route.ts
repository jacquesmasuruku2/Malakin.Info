import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';

async function findOwnedApplication(id: string, userId: string, email: string) {
  return prisma.jobApplication.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { email: { equals: email, mode: 'insensitive' } },
      ],
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const application = await prisma.jobApplication.findFirst({
      where: {
        id,
        OR: [
          { userId: currentUser.id },
          { email: { equals: currentUser.email, mode: 'insensitive' } },
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
            description: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await findOwnedApplication(id, currentUser.id, currentUser.email);
    if (!existing) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
    }

    if (['accepted', 'rejected', 'withdrawn'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Cette candidature ne peut plus être modifiée.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {
      userId: existing.userId || currentUser.id,
    };

    if (typeof body.phone === 'string') data.phone = body.phone;
    if (typeof body.coverLetter === 'string') data.coverLetter = body.coverLetter;
    if (typeof body.resumeUrl === 'string') data.resumeUrl = body.resumeUrl;
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();

    const application = await prisma.jobApplication.update({
      where: { id },
      data,
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
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await findOwnedApplication(id, currentUser.id, currentUser.email);
    if (!existing) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
    }

    if (['accepted', 'interview'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Impossible de retirer une candidature à ce stade.' },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: 'withdrawn',
        userId: existing.userId || currentUser.id,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error withdrawing job application:', error);
    return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
  }
}
