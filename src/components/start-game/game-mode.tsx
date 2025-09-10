"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Gamepad2, Palette, Trophy } from "lucide-react"

interface GameModesProps {
    gameMode: "public" | "private"
    setGameMode: (mode: "public" | "private") => void
}

export function GameModes({ gameMode, setGameMode }: GameModesProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Game Modes
                </CardTitle>
                <CardDescription>Choose how you want to play</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    <Button
                        variant={gameMode === "public" ? "default" : "outline"}
                        onClick={() => setGameMode("public")}
                        className="justify-start h-12"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Public Game
                    </Button>
                    <Button
                        variant={gameMode === "private" ? "default" : "outline"}
                        onClick={() => setGameMode("private")}
                        className="justify-start h-12"
                    >
                        <Trophy className="h-4 w-4 mr-2" />
                        Private Room
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
