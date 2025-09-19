"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { CheckCircleIcon, CircleOff, CircleX } from "lucide-react"

export const ReadyButton = ({
  websocket,
  cn
}: {
  websocket: WebSocket | null;
  cn: string | undefined;
}) => {
  const [isReady, setIsReady] = useState(false)
  const handleClick = () => {
    setIsReady(true)
    const message: Message<"player_ready", boolean> = {
      type: "player_ready",
      data: true
    }
    if (websocket && websocket?.readyState) {
      websocket?.send(JSON.stringify(message))
    } else {
      setIsReady(false)
    }
  }

  return <Button disabled={isReady}
    onClick={handleClick}
    className={cn}
  >
    Ready {isReady ? <CheckCircleIcon size={20} /> : <CircleX size={20} />}
  </Button>

}