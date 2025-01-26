import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { gameStorageService } from '@/services/gameStorageService';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [latestGameId, setLatestGameId] = React.useState<string | null>(null);

  // Fetch latest game ID
  React.useEffect(() => {
    const fetchLatestGame = async () => {
      try {
        const games = await gameStorageService.getAllGames();
        if (games && games.length > 0) {
          // Get the most recent game
          setLatestGameId(games[games.length - 1].id);
        }
      } catch (error) {
        console.error('Failed to fetch latest game:', error);
      }
    };

    fetchLatestGame();
  }, []);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Protect the dashboard - redirect to login if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-8">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {format(currentTime, 'EEEE, MMMM d, yyyy')} at {format(currentTime, 'h:mm:ss aa')}
              </p>
            </div>
            
            <div className="flex items-center gap-3 border-t sm:border-none pt-4 sm:pt-0">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-emerald-500/20"
                />
              )}
              <div className="flex-1 sm:text-right">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-none">
                    {session.user?.email}
                  </p>
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="btn btn-sm btn-error btn-outline text-xs normal-case"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add your dashboard content here */}
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
            Welcome to BRS admin dashboard.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link 
              href="/admin/game-planner" 
              className="card bg-base-200 hover:bg-base-300 transition-colors duration-200 p-4 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-emerald-500/10">
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Game Planner</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Create games and record results
                  </p>
                </div>
              </div>
            </Link>

            <Link 
              href={latestGameId ? `/admin/score-keeper?gameId=${latestGameId}` : '/admin/game-planner'}
              className={`card bg-base-200 hover:bg-base-300 transition-colors duration-200 p-4 sm:p-6 ${
                !latestGameId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-lg bg-emerald-500/10">
                  <svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium">Live Score</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {latestGameId ? 'View current game scores' : 'No active games'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 