import React from 'react';
import Link from 'next/link';
import RankingsComponent from '@/components/RankingsComponent.client';

const Index = () => {
  return (
    <div className='flex flex-col items-center'>
      <RankingsComponent />
    </div>
  );
};

export default Index;
