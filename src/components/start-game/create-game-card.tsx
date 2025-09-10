"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Share2 } from "lucide-react"

interface CreateGameCardProps {
  gameMode: "public" | "private" | "custom"
  roomCode: string
  playerName: string
  generateRoomCode: () => void
  copyRoomCode: () => void
  handleCreateGame: () => void
}

export function CreateGameCard({
  gameMode,
  roomCode,
  playerName,
  generateRoomCode,
  copyRoomCode,
  handleCreateGame,
}: CreateGameCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Create New Game</CardTitle>
        <CardDescription className="text-center">Start a new room and invite friends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameMode === "private" && (
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <div className="flex gap-2">
              <Input id="roomCode" value={roomCode} readOnly placeholder="Generate a room code" />
              <Button variant="outline" onClick={generateRoomCode} className="shrink-0 bg-transparent">
                Generate
              </Button>
            </div>
            {roomCode && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomCode} className="flex-1 bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            )}
          </div>
        )}
        <Button onClick={handleCreateGame} disabled={!playerName} className="w-full h-12 text-lg" size="lg">
          Create Game
        </Button>
      </CardContent>
    </Card>
  )
}
