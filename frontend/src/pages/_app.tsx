import '../app/globals.css';
import type { AppProps } from 'next/app';
import LayoutComponent from '@/components/LayoutComponent';
import NavigationComponent from '@/components/NavigationComponent';
import React from 'react';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { RankingHistoryProvider } from '@/contexts/RankingHistoryContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LayoutComponent>
      <PlayerProvider>
        <RankingHistoryProvider>
          <NavigationComponent />
          <Component {...pageProps} />
        </RankingHistoryProvider>
      </PlayerProvider>
    </LayoutComponent>
  );
}

export default MyApp;
