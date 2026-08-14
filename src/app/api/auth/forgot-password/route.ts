import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'L’adresse e-mail est requise.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: user.emailVerified,
      },
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset_${token}`,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com'}/fr/compte/nouveau-mot-de-passe?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name || 'Utilisateur',
        resetUrl,
      });
    } catch (emailError) {
      console.error('Password reset email send failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Si ce compte existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
