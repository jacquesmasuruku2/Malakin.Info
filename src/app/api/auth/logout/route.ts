import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const sessionToken = token || bearer;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { token: sessionToken },
    }).catch(() => {
      // Ignore missing sessions so logout still clears the cookie.
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
