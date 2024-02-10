import React from "react";
import { Encounter, EncounterPlayer } from "@/types/encounter";
import { capitalizeFirstLetter } from "@/utils/string";

interface PlayerEncounterComponentProps {
  encounter: Encounter;
}

const renderTeamList = (team: EncounterPlayer[]) =>
  team
    .map(
      (player, index) =>
        `${capitalizeFirstLetter(player.playerName)}${
          index < team.length - 1 ? ", " : ""
        }`
    )
    .join("");

const PlayerEncounterComponent: React.FC<PlayerEncounterComponentProps> = ({
  encounter,
}) => {
  const scoreColorClass =
    encounter.encounterScore < 0 ? "text-red-500" : "text-green-500";

  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <div className="stats shadow">
          <div className="stat place-items-center">
            <div className="stat-title">{encounter.encounterDate}</div>
            <div className="stat-value">{`Game ${encounter.encounterId}`}</div>
          </div>

          <div className="stat place-items-center">
            <div className="stat-title">Score</div>
            <div className={`stat-value ${scoreColorClass}`}>
              {Math.abs(encounter.encounterScore)}
            </div>
          </div>
        </div>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="border px-4 py-2">Players</th>
              <th className="border px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">
                {renderTeamList(encounter.playerTeam)}
              </td>
              <td className="border px-4 py-2 text-center">
                {encounter.playerTeamPoints}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border px-4 py-2 text-center" colSpan={2}>
                vs
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">
                {renderTeamList(encounter.opponentTeam)}
              </td>
              <td className="border px-4 py-2 text-center">
                {encounter.opponentTeamPoints}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerEncounterComponent;
