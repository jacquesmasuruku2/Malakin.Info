import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import type { AuthOptions } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl?: string;
      bio?: string;
      createdAt?: string;
      _count?: {
        comments: number;
        likes: number;
        favorites: number;
        donations: number;
      };
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
    createdAt?: string;
    _count?: {
      comments: number;
      likes: number;
      favorites: number;
      donations: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    avatarUrl?: string;
  }
}

// Check if Google OAuth is configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: isGoogleConfigured ? [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ] : [],
  debug: process.env.NODE_ENV === 'development',
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
          
          // Fetch additional user data from database
          const user = await prisma.user.findUnique({
            where: { id: token.id },
            include: {
              _count: {
                select: {
                  comments: true,
                  likes: true,
                  favorites: true,
                  donations: true,
                },
              },
            },
          });

          if (user) {
            session.user.bio = user.bio;
            session.user.createdAt = user.createdAt?.toISOString();
            session.user._count = user._count;
          }
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
};
