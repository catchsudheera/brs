import "../app/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Player } from "@/types/player";
import { PlayerProvider } from "@/contexts/PlayerContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await axios.get(
        "https://brs.aragorn-media-server.duckdns.org/players"
      );
      const sortedData = response.data.sort(
        (a: Player, b: Player) => a.playerRank - b.playerRank
      );
      setPlayers(sortedData);
    };
    fetchPlayers();
  }, []);

  return (
    <Layout>
      <PlayerProvider>
        <Navigation />
        <Component {...pageProps} />
      </PlayerProvider>
    </Layout>
  );
}

export default MyApp;
