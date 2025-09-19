"use client"

import { gameStateAtom } from "@/store/atoms/ws"
import { useAtom } from "jotai"
import { CircularTimer } from "@/components/ui/circular-timer"

export const GameHeader = () => {
  const [gameState] = useAtom(gameStateAtom)

  return <div className="flex flex-row justify-between items-center w-full h-24 border-t px-12 mt-2 -mb-4">
    <div className="">
      <CircularTimer duration={120} isActive={true} size={55}/>
    </div>
    <div className="text-[20px]">
      {gameState.word || "_ _ _ _ _ _ _ _ _ _ _"}
    </div>
    <div className="text-[20px]">
      Round: {gameState.round_number} of {gameState.max_rounds}
    </div>
  </div>
}