"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface JoinGameCardProps {
  roomCode: string
  setRoomCode: (code: string) => void
  playerName: string
  handleJoinGame: () => void
}

export function JoinGameCard({ roomCode, setRoomCode, playerName, handleJoinGame }: JoinGameCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Join Existing Game</CardTitle>
        <CardDescription className="text-center">Enter a room code to join friends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="joinRoomCode">Room Code</Label>
          <Input
            id="joinRoomCode"
            placeholder="Enter 6-digit room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-lg text-center font-mono"
          />
        </div>
        <Button
          onClick={handleJoinGame}
          disabled={!playerName || !roomCode}
          variant="secondary"
          className="w-full h-12 text-lg"
          size="lg"
        >
          Join Game
        </Button>
      </CardContent>
    </Card>
  )
}
