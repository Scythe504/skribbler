"use client"

import { PixelArtCanvas } from "@/components/drawing-canvas/canvas"
import { ColorPicker } from "@/components/drawing-canvas/color-picker"
import { DrawMethods } from "@/components/drawing-canvas/draw-methods"
import { BrushSizePicker } from "@/components/drawing-canvas/brush-size-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { playerNameAtom, roomIdAtom, wsAtom } from "@/store/atoms/ws"
import { useAtom } from "jotai"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ChatBox } from "@/components/chat-box/chatbox"
import { PlayersList } from "@/components/player/players"
import { useGameHandlers } from "@/hooks/useGameHandlers"
import { useGameWebsocket } from "@/hooks/useGameWs"
import { GameHeader } from "@/components/game/header"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ReadyButton } from "@/components/game/ready-button"

export default function Home() {
  const [playerName, setPlayerName] = useAtom(playerNameAtom)
  const [roomId, setRoomId] = useAtom(roomIdAtom)
  const [ws] = useAtom(wsAtom)
  const searchParams = useSearchParams()
  const { gameId } = useParams()

  const [wsUrl, setWsUrl] = useState<string | null>(null)

  const { handleMessage } = useGameHandlers()

  const baseWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080"

  // Use the custom hook for WebSocket management
  const { isConnected, connectionError } = useGameWebsocket(wsUrl, handleMessage)

  useEffect(() => {
    // Extract primitive values (stable in deps)
    const nameFromUrl = searchParams.get("username")
    const roomIdFromUrl = gameId as string

    if (!nameFromUrl || !roomIdFromUrl) {
      console.warn("Missing required parameters:", { nameFromUrl, roomIdFromUrl })
      return
    }

    // Only update if different
    setPlayerName(prev => (prev !== nameFromUrl ? nameFromUrl : prev))
    setRoomId(prev => (prev !== roomIdFromUrl ? roomIdFromUrl : prev))

    const clientWidth = window.innerWidth || 800
    const clientHeight = window.innerHeight || 600

    const fullWsUrl = `${baseWsUrl}/ws/${roomIdFromUrl}?username=${encodeURIComponent(
      nameFromUrl,
    )}&w=${clientWidth}&h=${clientHeight}`

    setWsUrl(prev => (prev !== fullWsUrl ? fullWsUrl : prev))
  }, [gameId, searchParams.toString(), baseWsUrl, setPlayerName, setRoomId])


  if (!playerName || !roomId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading game...</div>
          <div className="text-sm text-gray-400">Extracting player information from URL</div>
          {connectionError && <div className="mt-4 p-3 bg-red-900 text-red-300 rounded">Error: {connectionError}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col text-white">
      <ScrollArea>
        <div className="pt-4 text-center border-b flex flex-col items-center w-full">
          <h1 className="text-2xl font-bold mb-2">Pixel Art Game</h1>
          <div className="text-sm text-gray-300">
            Player: <span className="font-medium text-white">{playerName}</span> | Room:{" "}
            <span className="font-medium text-white">{roomId}</span>
          </div>

          <div
            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm ${isConnected ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
            {isConnected ? "Connected" : "Connecting..."}
          </div>

          {connectionError && (
            <div className="mt-2 p-3 bg-red-900 text-red-300 rounded max-w-md mx-auto">
              <strong>Connection Error:</strong> {connectionError}
              <div className="text-xs mt-1">Check if the game server is running on {baseWsUrl}</div>
            </div>
          )}
          <div className="w-full pb-3">
            <GameHeader />
          </div>
        </div>

        <div className="flex overflow-hidden lg:min-h-[700px]">   {/* constrain middle section */}
          {/* Players sidebar */}
          <div className="w-96 p-4 border-r overflow-y-auto flex flex-col gap-4">
            <PlayersList />

            {/* Ready button full width */}
            <ReadyButton
              websocket={ws}
              cn="w-full justify-center"
            />
          </div>


          {/* Canvas area */}
          <div className="flex-1 flex flex-col justify-center items-start p-4">
            {wsUrl ? (
              <PixelArtCanvas />
            ) : (
              <div className="text-center p-8 rounded-lg border border-gray-600">
                <div className="text-lg mb-2">Preparing canvas...</div>
                <div className="text-sm text-gray-400">Setting up WebSocket connection</div>
              </div>
            )}
          </div>



          {/* Chatbox sidebar */}
          <div className="w-80 p-4 border-l flex flex-col overflow-hidden">
            <ChatBox currentUsername={playerName} websocket={ws} />
          </div>
        </div>


        {process.env.NODE_ENV === "development" && (
          <div className="p-3 border-t text-xs text-gray-400">
            <strong>Debug Info:</strong>
            <br />
            WebSocket URL: {wsUrl || "Not set"}
            <br />
            Connection State: {ws?.readyState ?? "No WebSocket"}
            <br />
            Base URL: {baseWsUrl}
            <br />
            Connected: {isConnected ? "Yes" : "No"}
            <br />
            Error: {connectionError || "None"}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}