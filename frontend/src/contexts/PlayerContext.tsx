import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { Player, PlayerContextType } from "@/types/player";
import { capitalizeFirstLetter } from "@/utils/string";

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Player[]>(
          "https://brs.aragorn-media-server.duckdns.org/players"
        );
        const processedData = response.data.map((player) => ({
          ...player,
          name: capitalizeFirstLetter(player.name),
        }));
        setPlayers(processedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <PlayerContext.Provider value={{ players, loading, error }}>
      {children}
    </PlayerContext.Provider>
  );
};
