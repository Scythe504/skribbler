"use client"

import { useState } from "react"
import { GameHeader } from "@/components/start-game/game-header"
import { PlayerSetup } from "@/components/start-game/player-card"
import { GameModes } from "@/components/start-game/game-mode"
import { CreateGameCard } from "@/components/start-game/create-game-card"
import { JoinGameCard } from "@/components/start-game/join-game-card"
import { QuickPlayCard } from "@/components/start-game/quick-play"
import { GameFooter } from "@/components/start-game/game-footer"
import { generateID } from "@/utils/helper"
import { useRouter } from "next/navigation"
import { myStore } from "@/store/store"
import { Provider } from "jotai"

export default function StartGamePage() {
    const backendUrl = process.env.NODE_ENV === "production" ? process.env.BACKEND_URL : "http://localhost:8080"
    const [playerName, setPlayerName] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [gameMode, setGameMode] = useState<"public" | "private">("public")

    const router = useRouter()

    const handleCreateGame = () => {
        // Placeholder for game creation logic
        console.log("Creating game with:", { playerName, gameMode })
    }

    const handleJoinGame = async () => {
        const response = await fetch(`${backendUrl}/rooms-available`);

        if (!response.ok) {
            console.log("No Room Found");
            return;
        }

        const resp: { data: { roomId: string } } = await response.json();

        console.log({ resp });

        router.push(
            `/game/${resp.data}?playerName=${encodeURIComponent(playerName)}`
        );
    };


    const generateRoomCode = () => {
        // Placeholder for room code generation
        const code = generateID(6)
        setRoomCode(code)
    }

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode)
    }

    return (
        <Provider store={myStore}>
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl mx-auto space-y-8">
                    <GameHeader />

                    {/* Main Game Interface */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <PlayerSetup playerName={playerName} setPlayerName={setPlayerName} />
                        <GameModes gameMode={gameMode} setGameMode={setGameMode} />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <CreateGameCard
                            gameMode={gameMode}
                            roomCode={roomCode}
                            playerName={playerName}
                            generateRoomCode={generateRoomCode}
                            copyRoomCode={copyRoomCode}
                            handleCreateGame={handleCreateGame}
                        />
                        <JoinGameCard
                            roomCode={roomCode}
                            setRoomCode={setRoomCode}
                            playerName={playerName}
                            handleJoinGame={handleJoinGame}
                        />
                    </div>

                    <QuickPlayCard playerName={playerName} handleCreateGame={handleJoinGame} />

                    <GameFooter />
                </div>
            </div>
        </Provider>
    )
}
