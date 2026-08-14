import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères.' }, { status: 400 });
    }

    const resetSession = await prisma.session.findUnique({
      where: { token: `reset_${token}` },
    });

    if (!resetSession) {
      return NextResponse.json({ error: 'Lien de réinitialisation invalide ou expiré.' }, { status: 400 });
    }

    if (resetSession.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: resetSession.id } });
      return NextResponse.json({ error: 'Lien de réinitialisation expiré.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: resetSession.userId },
      data: { passwordHash },
    });

    await prisma.session.delete({ where: { id: resetSession.id } });

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
