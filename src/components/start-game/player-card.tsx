"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"

interface PlayerSetupProps {
  playerName: string
  setPlayerName: (name: string) => void
}

export function PlayerSetup({ playerName, setPlayerName }: PlayerSetupProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Player Setup
        </CardTitle>
        <CardDescription>Enter your name to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="playerName">Your Name</Label>
          <Input
            id="playerName"
            placeholder="Enter your display name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="text-lg"
          />
        </div>
      </CardContent>
    </Card>
  )
}
