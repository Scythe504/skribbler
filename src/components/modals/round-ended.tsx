'use client'

import { Player } from "@/types/ws-model"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface RoundEndProps {
  players: Player[]
  timer: number
  word: string
  currentRound: number
}

export const RoundEnd = ({
  players,
  word,
  timer,
  currentRound,
}: RoundEndProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timeout = setTimeout(() => {
      setShow(false)
    }, timer)
    return () => clearTimeout(timeout)
  }, [timer])

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="lg:min-w-[600px] min-w-[300px]  flex flex-col">
        <DialogHeader className="flex items-center">
          <DialogTitle className="text-4xl">Round {currentRound} Results</DialogTitle>
          <DialogTitle className="text-2xl">
            <span>WORD:</span>
            <span> {word}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2 text-[32px]">
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "flex flex-row justify-between items-center w-full px-4 py-2 rounded",
                  p.has_guessed && "bg-white text-black font-semibold"
                )}
              >
                <div className="flex items-center gap-2 ">
                  <span>{idx + 1}.</span> {p.username}
                </div>
                <div>{p.score}</div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
