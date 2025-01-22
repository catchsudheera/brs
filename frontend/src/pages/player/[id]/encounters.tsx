import React from 'react';
import { useRouter } from 'next/router';
import PlayerEncountersComponent from '@/components/PlayerEncountersComponent.client';
import PlayerEncountersCompactComponent from '@/components/PlayerEncounterCompactComponent.client';

const PlayerEncountersPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <PlayerEncountersCompactComponent playerId={id} />
    </div>
  );
  //return <PlayerEncountersComponent playerId={id} />;
};

export default PlayerEncountersPage;
