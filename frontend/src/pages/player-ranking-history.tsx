import React from 'react';
import RankingsHistoryComponent from '@/components/RankingsHistoryComponent.client';
import EncounterHistoryComponent from '@/components/EncounterHistoryComponent.client';

const PlayerRanking = () => {
  return (
    <div>
      <div className='flex flex-col items-center'>
        <h1 className='text-2xl font-bold text-center my-4'>
          Player Ranking History
        </h1>
        <RankingsHistoryComponent />
      </div>
    </div>
  );
};

export default PlayerRanking;
