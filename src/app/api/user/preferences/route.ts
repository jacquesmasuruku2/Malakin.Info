import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if not exist
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId: session.user.id,
          locale: 'fr',
          theme: 'light',
          emailNewsletter: false,
          emailDigest: false,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { locale, theme, emailNewsletter, emailDigest } = body;

    const preferences = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...(locale !== undefined && { locale }),
        ...(theme !== undefined && { theme }),
        ...(emailNewsletter !== undefined && { emailNewsletter }),
        ...(emailDigest !== undefined && { emailDigest }),
      },
      create: {
        userId: session.user.id,
        locale: locale || 'fr',
        theme: theme || 'light',
        emailNewsletter: emailNewsletter ?? false,
        emailDigest: emailDigest ?? false,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
