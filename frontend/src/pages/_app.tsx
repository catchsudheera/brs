import '../app/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/layout/Layout';
import NavigationComponent from '@/components/NavigationComponent';
import React from 'react';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { RankingHistoryProvider } from '@/contexts/RankingHistoryContext';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <PlayerProvider>
        <Layout>
          <RankingHistoryProvider>
            <Component {...pageProps} />
          </RankingHistoryProvider>
        </Layout>
      </PlayerProvider>
    </SessionProvider>
  );
}
