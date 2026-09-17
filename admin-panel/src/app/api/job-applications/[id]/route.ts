import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminMessage } = body;

    const data: Record<string, unknown> = {};
    if (typeof status === 'string' && status.trim()) {
      data.status = status.trim();
    }

    const messageText =
      typeof adminMessage === 'string' && adminMessage.trim() ? adminMessage.trim() : null;

    if (messageText) {
      data.adminMessage = messageText;
      data.respondedAt = new Date();
    }

    if (Object.keys(data).length === 0 && !messageText) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const application = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.jobApplication.update({
          where: { id },
          data,
        });
      }

      if (messageText) {
        await tx.jobApplicationMessage.create({
          data: {
            applicationId: id,
            senderType: 'recruiter',
            senderName: 'MalakInfo Recrutement',
            body: messageText,
          },
        });
      }

      return tx.jobApplication.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    );
  }
}
