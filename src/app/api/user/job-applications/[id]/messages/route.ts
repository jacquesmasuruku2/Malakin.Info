import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCurrentUser } from '@/lib/current-user';

async function findOwnedApplication(id: string, userId: string, email: string) {
  return prisma.jobApplication.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { email: { equals: email, mode: 'insensitive' as const } },
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
    const application = await findOwnedApplication(id, currentUser.id, currentUser.email);
    if (!application) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
    }

    const messages = await prisma.jobApplicationMessage.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.jobApplicationMessage.updateMany({
      where: {
        applicationId: id,
        senderType: 'recruiter',
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching application messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await resolveCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const application = await findOwnedApplication(id, currentUser.id, currentUser.email);
    if (!application) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
    }

    if (application.status === 'withdrawn') {
      return NextResponse.json(
        { error: 'Impossible d’écrire sur une candidature retirée.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const text = typeof body.body === 'string' ? body.body.trim() : '';
    if (!text) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Message trop long' }, { status: 400 });
    }

    const message = await prisma.jobApplicationMessage.create({
      data: {
        applicationId: id,
        senderType: 'applicant',
        senderName: currentUser.name || application.name,
        body: text,
      },
    });

    if (!application.userId) {
      await prisma.jobApplication.update({
        where: { id },
        data: { userId: currentUser.id },
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating application message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
