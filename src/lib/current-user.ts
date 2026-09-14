import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

async function userFromCustomSession(token: string | undefined) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function resolveCurrentUser(request: NextRequest) {
  let jwt: { id?: unknown; email?: unknown } | null = null;

  try {
    jwt = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error('Error reading NextAuth token:', error);
  }

  if (typeof jwt?.id === 'string' && jwt.id) {
    const user = await prisma.user.findUnique({ where: { id: jwt.id } });
    if (user) return user;
  }

  if (typeof jwt?.email === 'string' && jwt.email) {
    const user = await prisma.user.findUnique({ where: { email: jwt.email } });
    if (user) return user;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const user = await userFromCustomSession(authHeader.slice(7).trim());
    if (user) return user;
  }

  return userFromCustomSession(request.cookies.get('session_token')?.value);
}

export async function resolveCurrentUserId(request: NextRequest) {
  const user = await resolveCurrentUser(request);
  return user?.id ?? null;
}
