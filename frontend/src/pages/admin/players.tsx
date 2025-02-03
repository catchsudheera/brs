import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { usePlayers } from '@/hooks/usePlayers';
import { capitalizeFirstLetter } from '@/utils/string';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const PlayerManagementPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { players, isLoading, mutate } = usePlayers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Player Management</h1>
            <p className="text-base-content/60">Manage player profiles and rankings</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Player
          </button>
        </div>

        {/* Player List */}
        <div className="bg-base-100 rounded-lg shadow-lg border border-base-200">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rank</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="hover">
                    <td className="font-medium">
                      {capitalizeFirstLetter(player.name)}
                    </td>
                    <td>#{player.playerRank}</td>
                    <td>{player.rankScore.toFixed(1)}</td>
                    <td>
                      <span className={`badge ${
                        player.isActive ? 'badge-success' : 'badge-error'
                      }`}>
                        {player.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setSelectedPlayer(player);
                            setShowEditModal(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => handleDeletePlayer(player.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modals will be added here */}
      </div>
    </div>
  );
};

export default PlayerManagementPage; 