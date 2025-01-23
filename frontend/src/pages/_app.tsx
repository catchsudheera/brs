import '../app/globals.css';
import type { AppProps } from 'next/app';
import LayoutComponent from '@/components/LayoutComponent';
import NavigationComponent from '@/components/NavigationComponent';
import React from 'react';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { RankingHistoryProvider } from '@/contexts/RankingHistoryContext';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <LayoutComponent>
        <PlayerProvider>
          <RankingHistoryProvider>
            <NavigationComponent />
            <Component {...pageProps} />
          </RankingHistoryProvider>
        </PlayerProvider>
      </LayoutComponent>
    </SessionProvider>
  );
}

export default MyApp;
