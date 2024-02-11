import React from 'react';
import Link from 'next/link';
import RankingsComponent from '@/components/RankingsComponent.client';

const Index = () => {
  return (
    <div className='flex flex-col items-center'>
      <h1 className='text-2xl font-bold text-center my-4'>Player Ranking</h1>
      <RankingsComponent />
    </div>
  );
};

export default Index;
