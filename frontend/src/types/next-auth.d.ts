import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      email: string;
      name: string;
      image?: string;
      isAdmin: boolean;
    };
    accessToken?: string;
    error?: string;
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