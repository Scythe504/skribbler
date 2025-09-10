"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface QuickPlayCardProps {
  playerName: string
  handleCreateGame: () => void
}

export function QuickPlayCard({ playerName, handleCreateGame }: QuickPlayCardProps) {
  return (
    <Card className="shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Ready to Play?</h3>
          <p className="text-muted-foreground">Jump into a quick match and start drawing immediately!</p>
          <Button
            onClick={handleCreateGame}
            disabled={!playerName}
            size="lg"
            className="h-14 px-8 text-lg font-semibold"
          >
            <Palette className="h-5 w-5 mr-2" />
            Quick Play
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
