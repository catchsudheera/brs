import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id_token?: string;
    expires_at?: number;
    refresh_token?: string;
    error?: 'RefreshAccessTokenError';
  }
} 