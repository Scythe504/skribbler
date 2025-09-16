"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { GameEndedData } from "@/types/ws-resp"
import { Trophy, Zap, Target, Users } from "lucide-react"

interface GameEndedModalProps extends GameEndedData {
  onClose?: () => void
}

export function GameEndedModal({
  leaderboard,
  mvp,
  fastest_guess,
  most_accurate,
  rounds_played,
  total_players,
  onClose,
}: GameEndedModalProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [canClose, setCanClose] = useState(false)

  console.log("[v0] GameEndedModal rendering with props:", {
    leaderboard: leaderboard?.length,
    mvp: mvp?.username,
    fastest_guess: fastest_guess?.username,
    most_accurate: most_accurate?.username,
    rounds_played,
    total_players,
    timeLeft,
    canClose,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (timeMs: bigint) => {
    const seconds = Number(timeMs) / 1000
    return `${seconds.toFixed(2)}s`
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${position}`
    }
  }

  console.log("[v0] About to render Dialog with open=true")

  return (
    <Dialog open={true} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&>button]:hidden pixel-border">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground pixel-text">🎮 Game Over! 🎮</h1>
            <p className="text-muted-foreground">
              {rounds_played} rounds • {total_players} players
            </p>
            {!canClose && <p className="text-sm text-muted-foreground">Closing in {timeLeft}s...</p>}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mvp && (
              <div className="bg-card/50 border border-border rounded-lg p-4 text-center pixel-border">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-semibold text-sm">MVP</h3>
                <p className="text-foreground font-bold">{mvp.username}</p>
                <p className="text-xs text-muted-foreground">{mvp.score} points</p>
              </div>
            )}

            {fastest_guess && (
              <div className="bg-card/50 border border-border rounded-lg p-4 text-center pixel-border">
                <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold text-sm">Fastest</h3>
                <p className="text-foreground font-bold">{fastest_guess.username}</p>
                <p className="text-xs text-muted-foreground">{formatTime(fastest_guess.time_to_guess_ms as bigint)}</p>
              </div>
            )}

            {most_accurate && (
              <div className="bg-card/50 border border-border rounded-lg p-4 text-center pixel-border">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold text-sm">Most Accurate</h3>
                <p className="text-foreground font-bold">{most_accurate.username}</p>
                <p className="text-xs text-muted-foreground">{most_accurate.score} points</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Final Leaderboard
            </h2>

            <div className="space-y-2">
              {leaderboard.map((player) => (
                <div
                  key={player.player_id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border pixel-border
                    ${player.position <= 3
                      ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                      : "bg-card/30 border-border"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold min-w-[2rem]">{getPositionIcon(player.position)}</span>
                    <div>
                      <p className="font-semibold text-foreground">{player.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.is_correct ? "✅ Correct" : "❌ Incorrect"} •{formatTime(player.time_to_guess_ms as bigint)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-foreground">{player.score}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          {canClose && onClose && (
            <div className="flex justify-center pt-4">
              <Button onClick={onClose} className="pixel-border bg-transparent" variant="outline">
                Close Results
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
