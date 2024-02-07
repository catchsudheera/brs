import React from "react";
import Link from "next/link";
import RankingsHistoryComponent from "@/components/RankingsHistoryComponent.client";

const PlayerRanking = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center my-4">
        Player Ranking History
      </h1>
      <RankingsHistoryComponent />
    </div>
  );
};

export default PlayerRanking;
