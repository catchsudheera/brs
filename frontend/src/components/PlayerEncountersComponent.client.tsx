import React, { useEffect, useState } from "react";
import axios from "axios";
import { EncountersResponse } from "@/types/encounter";
import PlayerEncounterComponent from "./PlayerEncounterComponent";
import { capitalizeFirstLetter } from "@/utils/string";

interface PlayerEncountersComponentProps {
  playerId: string | string[] | undefined;
}

const PlayerEncountersComponent: React.FC<PlayerEncountersComponentProps> = ({
  playerId,
}) => {
  const [encounters, setEncounters] = useState<EncountersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEncounters = async () => {
      if (!playerId) return;
      setLoading(true);
      try {
        const response = await axios.get<EncountersResponse>(
          `https://brs.aragorn-media-server.duckdns.org/players/${playerId}/encounters`
        );
        setEncounters(response.data);
      } catch (error) {
        console.error(
          "There was an error fetching the encounters data:",
          error
        );
        setError("Failed to fetch encounters data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, [playerId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center my-4">
        Encounters for {encounters?.playerName ? capitalizeFirstLetter(encounters.playerName) : ""}
      </h1>
      {encounters?.encounterHistory.map((encounter) => (
        <PlayerEncounterComponent
          key={encounter.encounterId}
          encounter={encounter}
        />
      ))}
    </div>
  );
};

export default PlayerEncountersComponent;
