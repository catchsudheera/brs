import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { ActionCard } from '@/components/dashboard/ActionCard';
import { gameStorageService } from '@/services/gameStorageService';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [latestGameId, setLatestGameId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLatestGame = async () => {
      try {
        const games = await gameStorageService.getAllGames();
        if (games && games.length > 0) {
          setLatestGameId(games[games.length - 1].id);
        }
      } catch (error) {
        console.error('Failed to fetch latest game:', error);
      }
    };

    fetchLatestGame();
  }, []);

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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-100 rounded-lg shadow-lg p-4 sm:p-8">
          <DashboardHeader />

          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
            Welcome to BRS admin dashboard.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <ActionCard 
              href="/admin/game-planner"
              title="Game Planner"
              description="Create games and record results"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />

            <ActionCard 
              href={latestGameId ? `/admin/score-keeper?gameId=${latestGameId}` : '/admin/game-planner'}
              title="Live Score"
              description={latestGameId ? 'View current game scores' : 'No active games'}
              disabled={!latestGameId}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 