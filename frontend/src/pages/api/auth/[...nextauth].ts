import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Call auth/user endpoint with the id_token
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/auth`, {
          headers: {
            'Authorization': `Bearer ${account?.id_token}`
          }
        });

        if (!response.ok) {
          return false;
        }

        const userData = await response.json();
        console.log(userData);
        const accessLevel = userData.accessLevel || [];

        // Allow sign in if user has USER or ADMIN role
        const isAllowed = accessLevel.some((role: string) => ['USER', 'ADMIN'].includes(role));
        console.log('isAllowed', isAllowed);
        return isAllowed;
      } catch (error) {
        console.error('Auth validation error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, account }) {
      if (account) {
        // Initial sign in
        token.id_token = account.id_token;
        token.expires_at = Math.floor(Date.now() / 1000 + (account.expires_in as number));
        token.refresh_token = account.refresh_token;
      } else if (token.expires_at && Date.now() < token.expires_at * 1000) {
        // Token still valid
        return token;
      } else {
        try {
          // Token expired, try to refresh
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refresh_token as string,
            }),
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          return {
            ...token,
            id_token: tokens.id_token,
            expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
            refresh_token: tokens.refresh_token ?? token.refresh_token,
          };
        } catch (error) {
          console.error('Error refreshing token:', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
      return token;
    },
    async session({ session, token }) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v2/auth`, {
          headers: {
            'Authorization': `Bearer ${token.id_token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const accessLevel = userData.accessLevel || [];
          const isAdmin = accessLevel.includes('ADMIN');
          console.log('isAdmin', isAdmin);
          session.user.isAdmin = isAdmin;
        }
      } catch (error) {
        console.error('Session auth error:', error);
      }

      session.accessToken = token.id_token as string;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
};

export default NextAuth(authOptions); 