"use client";
import React from "react";
import RankingsComponent from "@/components/RankingsComponent.client";
import RankingsHistoryComponent from "@/components/RankingsHistoryComponent.client";

const Page = () => {
  return (
    <>
      <div className="flex flex-col items-center my-4">
        <h1 className="text-2xl font-bold">Badminton Rankings and History</h1>
      </div>
      <div className="flex flex-col md:flex-row w-full items-center">
        <div className="w-full md:w-1/3">
          <RankingsComponent />
        </div>
        <div className="w-full md:flex-grow">
          <RankingsHistoryComponent />
        </div>
      </div>
    </>
  );
};

export default Page;
