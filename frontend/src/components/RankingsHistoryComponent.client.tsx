import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { capitalizeFirstLetter } from '@/utils/string';
import { usePlayerContext } from '@/contexts/PlayerContext';
import { useRankingHistoryContext } from '@/contexts/RankingHistoryContext';

const RankingsHistoryComponent = () => {
  const { players } = usePlayerContext();
  const { data, loading, error } = useRankingHistoryContext();
  const [playerColors, setPlayerColors] = useState<{ [key: string]: string }>(
    {},
  );

  useEffect(() => {
    const colorsMapping: { [key: string]: string } = {};
    players.forEach((player) => {
      colorsMapping[capitalizeFirstLetter(player.name)] = player.colorHex;
    });
    setPlayerColors(colorsMapping);
  }, [players]);

  return (
    <ResponsiveContainer width='100%' height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='date' />
        <YAxis reversed={true} domain={['dataMin', 'dataMax']} />
        <Tooltip />
        <Legend />
        {data.length > 0 &&
          Object.keys(data[0])
            .filter((key) => key !== 'date')
            .map((key, idx) => {
              return (
                <Line
                  type='monotone'
                  dataKey={key}
                  stroke={
                    playerColors[key]
                      ? `#${playerColors[key]}`
                      : `#${Math.floor(Math.random() * 16777215).toString(16)}`
                  }
                  key={idx}
                />
              );
            })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RankingsHistoryComponent;
