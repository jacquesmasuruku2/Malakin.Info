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
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      try {
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
            user.id = existingUser.id;
          } else {
            // Create new user
            const newUser = await prisma.user.create({
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
            user.id = newUser.id;
          }
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }: any) {
      try {
        if (user) {
          token.id = user.id;
          token.avatarUrl = user.avatarUrl;
        }
        return token;
      } catch (error) {
        console.error('Error in JWT callback:', error);
        return token;
      }
    },
    async session({ session, token }: any) {
      try {
        if (session.user && token) {
          session.user.id = token.id;
          session.user.avatarUrl = token.avatarUrl;
        }
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }: any) {
      try {
        // If url is provided and not the homepage, use it
        if (url && url !== baseUrl && url !== `${baseUrl}/fr` && url !== `${baseUrl}/en`) {
          return url;
        }
        // Otherwise redirect to profile page
        return `${baseUrl}/fr/compte/profil`;
      } catch (error) {
        console.error('Error in redirect callback:', error);
        return `${baseUrl}/fr`;
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST };
