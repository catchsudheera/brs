import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useGames } from '@/hooks/useGames';
import { DashboardHeader } from '@/components/dashboard/Header';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect } from 'react';
import { format } from 'date-fns';

const DashboardPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { games = [], isLoading: gamesLoading } = useGames();

  // Add authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading' || gamesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) return null;

  // Group games by status
  const gamesByStatus = Array.isArray(games) 
    ? games.reduce((acc, game) => {
        const status = game.status || 'DRAFT';
        if (!acc[status]) acc[status] = [];
        acc[status].push(game);
        return acc;
      }, {} as Record<string, typeof games>)
    : {};

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Left Column - Actions */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-lg shadow-lg p-6 border border-base-200">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  href="/admin/game-planner"
                  className="btn btn-primary w-full justify-start"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Game
                </Link>
                {/* Add more action buttons as needed */}
              </div>
            </div>
          </div>

          {/* Right Column - Games List */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-lg shadow-lg p-6 border border-base-200">
              <h2 className="text-xl font-semibold mb-4">Games</h2>
              {gamesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : games.length > 0 ? (
                <div className="space-y-4">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="border border-base-200 rounded-lg p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/score-keeper?gameId=${game.id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Game #{game.id.slice(-4)}</h3>
                          <p className="text-sm text-base-content/60">
                            {format(new Date(game.createdAt), 'PPp')}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(game.status)}`}>
                          {(game.status || 'DRAFT').replace('_', ' ')}
                        </span>
                      </div>
                      {game.scores && (
                        <div className="mt-2 text-sm text-base-content/70">
                          Current Scores: {JSON.stringify(game.scores)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  No games available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 