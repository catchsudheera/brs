import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const UserManagementPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user && !session.user.accessLevel?.includes('USER')) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session?.user?.accessLevel?.includes('USER')) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Player Management</h1>
            <p className="text-base-content/60">Manage your player profile and view statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-base-100 rounded-lg shadow-lg border border-base-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-base-content/70">Player ID</label>
                <p className="font-medium">{session.user.playerId}</p>
              </div>
              <div>
                <label className="text-sm text-base-content/70">Email</label>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div>
                <label className="text-sm text-base-content/70">Access Level</label>
                <div className="flex gap-2 mt-1">
                  {session.user.accessLevel.map((level) => (
                    <span key={level} className="badge badge-primary">{level}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card - Placeholder for now */}
          <div className="bg-base-100 rounded-lg shadow-lg border border-base-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
            <p className="text-base-content/60">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 