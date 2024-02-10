import React from 'react';
import { useRouter } from 'next/router';
import PlayerEncountersComponent from '@/components/PlayerEncountersComponent.client';

const PlayerEncountersPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <PlayerEncountersComponent playerId={id} />;
};

export default PlayerEncountersPage;
