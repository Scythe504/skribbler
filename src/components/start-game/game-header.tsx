import { Palette } from "lucide-react"

export function GameHeaderHome() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Palette className="h-12 w-12 text-primary" />
        <h1 className="text-5xl font-bold text-foreground">DrawGuess</h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Join the fun! Draw, guess, and laugh with friends in this creative multiplayer game.
      </p>
    </div>
  )
}
