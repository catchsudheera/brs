import React from 'react';
import RankingsHistoryComponent from '@/components/RankingsHistoryComponent.client';
import Link from 'next/link';

const PlayerRankingHistoryPage = () => {
  return (
    <div className='container mx-auto p-4 min-h-screen'>
      {/* Breadcrumbs */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link href="/" className="text-gray-600 hover:text-emerald-600">
              Rankings
            </Link>
          </li>
          <li>
            <span className="text-emerald-600">
              Ranking History
            </span>
          </li>
        </ul>
      </div>

      {/* Title Section */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          Ranking History
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Track player ranking changes over time
        </p>
      </div>

      {/* Chart Section */}
      <div className="bg-base-100 rounded-lg shadow-lg p-4">
        <RankingsHistoryComponent />
      </div>
    </div>
  );
};

export default PlayerRankingHistoryPage;
