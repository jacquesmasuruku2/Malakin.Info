import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://dashboard.malakinfo.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const text = typeof body.body === 'string' ? body.body.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400, headers: corsHeaders });
    }

    const application = await prisma.jobApplication.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404, headers: corsHeaders });
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.jobApplicationMessage.create({
        data: {
          applicationId: id,
          senderType: 'recruiter',
          senderName: typeof body.senderName === 'string' && body.senderName.trim()
            ? body.senderName.trim()
            : 'MalakInfo Recrutement',
          body: text,
        },
      });

      await tx.jobApplication.update({
        where: { id },
        data: {
          adminMessage: text,
          respondedAt: new Date(),
        },
      });

      return created;
    });

    return NextResponse.json(message, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error sending recruiter message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500, headers: corsHeaders }
    );
  }
}
