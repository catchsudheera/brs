import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

export default withAuth(
  function middleware(req) {
    if (!AUTH_ENABLED) {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!AUTH_ENABLED) return true;
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
}; 