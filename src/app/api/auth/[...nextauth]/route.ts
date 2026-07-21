import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl?: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    avatarUrl?: string;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === 'google' && user.email) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Update avatar if user exists
          if (user.image) {
            await prisma.user.update({
              where: { email: user.email },
              data: { avatarUrl: user.image },
            });
          }
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || 'Google User',
              avatarUrl: user.image,
              passwordHash: '', // No password for OAuth users
              role: 'reader',
              isActive: true,
              emailVerified: true,
            },
          });
        }
      }
      return true;
    },
    async session({ session, user }: any) {
      if (session.user && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.avatarUrl = dbUser.avatarUrl;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/fr/compte/connexion',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
