import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

const AdminLoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to admin dashboard if already logged in
  React.useEffect(() => {
    if (session) {
      router.push('/admin/dashboard');
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/admin/dashboard' });
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-base-100 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton onSignIn={handleGoogleSignIn} />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage; 