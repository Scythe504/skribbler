import { cn } from "@/lib/utils";
import Image from "next/image";

type Player = {
    id: number;
    name: string;
    score: number;
    avatar: string;
    rank: number;
    isDrawing: number | null;
}


export const Players = () => {
    const players: Player[] = [
        {
            id: 1,
            name: '123456789ABCDEF',
            score: 0,
            avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            rank: 2,
            isDrawing: 1
        },
        {
            id: 2,
            name: 'Bob',
            score: 0,
            avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            rank: 2,
            isDrawing: 1
        }
    ];

    return (
        <div>
            <ul
                className="flex flex-col min-w-[260px] text-[24px] border"
            >
                {players.map((player, idx) => (
                    <li
                        className={cn(
                            (idx % 2 === 0 ? '' : 'bg-gray-100 dark:bg-zinc-800'),
                            `flex flex-row gap-4 items-center`
                        )}
                        key={idx}
                    >
                        <div className="pl-2">
                            <p className="text-[24px]">
                            {`#${player.rank}`}
                            </p>
                        </div>
                        <div
                            className="flex flex-col items-center min-w-[190px] min-h-full"
                        >
                            <p className="max-h-[25px]">
                                {player.name} 
                            </p>
                            <p>
                                {player.score}&nbsp;points
                            </p>
                        </div>
                        <img 
                        src={player.avatar} 
                        alt={player.name}
                        width={60}
                        className="ml-auto"
                        height={60}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}