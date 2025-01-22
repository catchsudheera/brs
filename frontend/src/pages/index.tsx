import React from 'react';
import Link from 'next/link';
import RankingsComponent from '@/components/RankingsComponent.client';

const Home = () => {
  return (
    <div className="container mx-auto p-4 min-h-screen">
      <RankingsComponent />
    </div>
  );
};

export default Home;
