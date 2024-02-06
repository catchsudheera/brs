"use client"
import {Card, Typography} from "@material-tailwind/react";


// eslint-disable-next-line @next/next/no-async-client-component
export default async function Page() {

    const data = await getPlayerRankingData();
    data.sort((a: { playerRank: number }, b: { playerRank: number }) => a.playerRank - b.playerRank);
    const tableRows = data;
    const tableHead = ["Player Id", "Player Name", "Score", "Rank",];

    return (
        <div className="place-items-center">
            <Card className="h-full w-full overflow-scroll" placeholder={undefined}>
                <table className="table-auto text-left">
                    <thead>
                    <tr>
                        {tableHead.map((head) => (
                            <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal leading-none opacity-70"
                                    placeholder={undefined}                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {tableRows.map(({id, name, rankScore, playerRank}: {id: string, name: string, rankScore: number, playerRank: number}, index: number) => {
                        const isLast = index === tableRows.length - 1;
                        const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                        return (
                            <tr key={id}>
                                <td className={classes}>
                                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined} >
                                        {id}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined} >
                                        {name.charAt(0).toUpperCase() + name.slice(1)}
                                    </Typography>
                                </td>
                                <td className={`${classes} bg-blue-gray-50/50`}>
                                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined} >
                                        {Math.round(rankScore * 100) / 100}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography variant="small" color="blue-gray" className="font-normal" placeholder={undefined} >
                                        {playerRank}
                                    </Typography>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

async function getPlayerRankingData() {
    // TODO : Change the following hardcoded url
    const res = await fetch('https://brs.aragorn-media-server.duckdns.org/players', {cache: "no-cache"})

    if (!res.ok) {
        console.log(res);
        throw new Error('Failed to fetch data')
    }

    return res.json()
}